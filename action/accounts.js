"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: serializeTransaction(account),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

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

    // First, verify all transactions belong to this user and get their details
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

    // Calculate balance changes for each account - CONVERT TO NUMBERS FIRST
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      // Convert Decimal.js objects to numbers
      const amount = parseFloat(transaction.amount.toString());

      const change =
        transaction.type === "EXPENSE"
          ? amount // For expenses, we add back the amount
          : -amount; // For income, we subtract the amount

      const accountId = transaction.accountId;

      // Initialize with 0 if not exists, then add the change
      acc[accountId] = (acc[accountId] || 0) + change;

      return acc;
    }, {});

    console.log("Account balance changes:", accountBalanceChanges);

    // Perform deletion and balance updates in a transaction
    const result = await db.$transaction(async (tx) => {
      // Delete only the transactions that belong to this user
      const deletedTransactions = await tx.transaction.deleteMany({
        where: {
          id: { in: transactions.map((t) => t.id) },
          userId: user.id,
        },
      });

      console.log("Deleted count:", deletedTransactions.count);

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: {
            id: accountId,
            userId: user.id,
          },
          data: {
            balance: {
              increment: balanceChange,
            },
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
      error: error.message,
      deletedCount: 0,
    };
  }
}
