"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Serialize a transaction or account object by converting Prisma Decimal
 * values (balance, amount) into plain JavaScript numbers.
 *
 * @param {Object} obj - The object to serialize.
 * @param {import("decimal.js").Decimal} [obj.balance] - Optional balance (Decimal).
 * @param {import("decimal.js").Decimal} [obj.amount] - Optional amount (Decimal).
 * @returns {Object} - A shallow clone of obj with `balance` and `amount` as numbers.
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
 * Create a new account for the authenticated user.
 *
 * - Validates user via Clerk auth.
 * - Parses the input balance (string) to float, throws if invalid.
 * - Checks if it's the first account, and if so, sets it as default.
 * - If `isDefault` is true, clears other default accounts.
 * - Saves the new account in the database.
 * - Revalidates the "/dashboard" path so the UI updates.
 *
 * @param {Object} data - Data for the new account.
 * @param {string} data.name - Name of the account.
 * @param {string | number} data.balance - Initial balance (string or number).
 * @param {boolean} [data.isDefault] - Whether this account should be default.
 * @returns {Promise<{ success: boolean, data: Object }>} - Result object:
 *   - `success`: true if created.
 *   - `data`: the created account object, serialized.
 * @throws {Error} - If user not authenticated, invalid balance, or user not found.
 */

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to a float
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // Determine if this new account should be default
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : !!data.isDefault;

    // If it should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create the new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    const serializedAccount = serializeTransaction(account);

    // Invalidate /dashboard so the frontend shows the newly created account
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializedAccount,
    };
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
}

/**
 * Get all accounts for the authenticated user.
 *
 * - Authenticates the user via Clerk.
 * - Fetches all accounts belonging to the user, sorted by creation time.
 * - Includes a count of transactions for each account.
 * - Serializes the account objects.
 *
 * @returns {Promise<Array<Object>>} - List of serialized account objects.
 * @throws {Error} - If user is not authorized or not found.
 */

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User Not Found");
  }

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const serializedAccounts = accounts.map(serializeTransaction);
  return serializedAccounts;
}

/**
 * Get all transactions for the authenticated user, for dashboard display.
 *
 * - Authenticates user via Clerk.
 * - Fetches all transactions belonging to the user, ordered descending by date.
 * - Serializes each transaction using `serializeTransaction`.
 *
 * @returns {Promise<Array<Object>>} - Array of serialized transaction objects.
 * @throws {Error} - If user is not authorized or not found.
 */

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}
