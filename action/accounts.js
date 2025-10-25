"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Serialize a transaction/account object by converting possible Decimal values
 * (from Prisma) into plain JS numbers.
 *
 * @param {Object} obj - The object to serialize (transaction or account).
 * @param {import("decimal.js").Decimal} [obj.balance] - Optional Decimal balance field.
 * @param {import("decimal.js").Decimal} [obj.amount] - Optional Decimal amount field.
 * @returns {Object} The serialized object with `balance` and `amount` as numbers.
 */


const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};


/**
 * Update the default account of the authenticated user.
 * 
 * This will:
 * 1. Mark all accounts of the user as `isDefault: false`.
 * 2. Then set the `isDefault` flag to `true` for the requested `accountId`.
 * 3. Revalidate the "/dashboard" path so that Next.js reflects the change.
 *
 * @param {string} accountId - The ID of the account to set as default.
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 *   - `success`: Whether the operation succeeded.
 *   - `data`: The updated account object (serialized) if success.
 *   - `error`: Error message if failed.
 * @throws {Error} If the user is not authenticated or user/account not found.
 */


export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Unset previous default account(s)
    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    // Invalidate/revalidate the dashboard so UI updates
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeTransaction(account),
    };
  } catch (error) {
    return {
      success: false,
      error: /** @type {Error} */ (error).message,
    };
  }
}


/**
 * Fetch an account by ID (of the authenticated user) along with its transactions.
 *
 * @param {string} accountId - The ID of the account to fetch.
 * @returns {Promise<null | { 
 *     id: string;
 *     balance: number;
 *      other account fields ,
 *     transactions: Array<Object>
 *     _count: { transactions: number }
 * }>} - Returns null if no account found, else the account with serialized fields.
 * @throws { Error } If user is not authenticated or user not found.
 * 
 */

export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

/**
 * Delete multiple transactions (bulk) for the authenticated user, and adjust account balances accordingly.
 *
 * - First, verifies all transaction IDs belong to the user.
 * - Calculates how each transaction affects its account balance (adding back expenses, subtracting incomes).
 * - Executes a database transaction to delete those transactions and update corresponding account balances.
 * - Revalidates cache paths: "/dashboard" and "/account/[id]".
 *
 * @param {string[]} transactionIds - Array of transaction IDs to delete.
 * @returns {Promise<{
 *   success: boolean;
 *   deletedCount: number;
 *   message?: string;
 *   error?: string;
 * }>} - Result of the deletion, how many deleted and status.
 */

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    console.log("Requested to delete:", transactionIds);

    // Fetch transactions belonging to user
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    console.log(
      "Found transactions to delete:",
      transactions.map((t) => t.id)
    );

    if (transactions.length === 0) {
      console.log("No transactions found for this user");
      return {
        success: true,
        deletedCount: 0,
        message: "No transactions found to delete",
      };
    }

    // Compute how each account balance should change
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      const change =
        transaction.type === "EXPENSE" ? amount : -amount;
      const accountId = transaction.accountId;
      acc[accountId] = (acc[accountId] || 0) + change;
      return acc;
    }, {});

    console.log("Account balance changes:", accountBalanceChanges);

    // Run delete + balance updates in a transaction
    const result = await db.$transaction(async (tx) => {
      const deletedTransactions = await tx.transaction.deleteMany({
        where: {
          id: { in: transactions.map((t) => t.id) },
          userId: user.id,
        },
      });

      console.log("Deleted count:", deletedTransactions.count);

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: {
            id: accountId,
            userId: user.id,
          },
          data: {
            balance: { increment: balanceChange },
          },
        });
        console.log(`Updated account ${accountId} by ${balanceChange}`);
      }

      return deletedTransactions;
    });

    console.log("Transaction completed successfully");

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return {
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} transactions`,
    };
  } catch (error) {
    console.error("bulkDeleteTransactions error:", error);
    return {
      success: false,
      error: /** @type {Error} */ (error).message,
      deletedCount: 0,
    };
  }
}
