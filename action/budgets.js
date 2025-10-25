"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Fetches the current budget for the authenticated user, along with the sum of expenses
 * in the current month for a specific account.
 *
 * @param {string} accountId - The ID of the account for which to calculate current expenses.
 * @returns {Promise<{
 *   budgets: { id: string; userId: string; amount: number } | null,
 *   currentExpenses: number
 * }>} An object containing:
 *   - `budgets`: the user's budget (if exists), with `amount` converted from Prisma Decimal to number.
 *   - `currentExpenses`: the total expense amount (as a number) for the current month in the given account.
 * @throws {Error} Throws an error if the user is not authenticated or if the user is not found.
 */


export async function getCurrentBudgets(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) throw new Error("User not found");

    const budgets = await db.budget.findFirst({
      where: { userId: user.id },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId: accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budgets: budgets
        ? { ...budgets, amount: budgets.amount.toNumber() }
        : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.error("Error fetching current budgets:", error);
    throw error;
  }
}


/**
 * Creates or updates the budget amount for the authenticated user.
 * If a budget exists, it updates it; otherwise, it creates a new one.
 * Also revalidates the /dashboard path so that frontend shows the latest budget.
 *
 * @param {number} amount - The new budget amount to be set for the user.
 * @returns {Promise<{
 *   success: boolean,
 *   data?: { id: string; userId: string; amount: number },
 *   error?: string
 * }>} - Result of the upsert operation:
 *   - `success`: whether the operation succeeded
 *   - `data`: if success, the budget object, with `amount` converted from Decimal to number
 *   - `error`: if failed, the error message
 */
export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount },
      create: { userId: user.id, amount },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return {
      success: false,
      error: /** @type {Error} */ (error).message,
    };
  }
}
