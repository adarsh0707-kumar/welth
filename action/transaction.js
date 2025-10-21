'use server';

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeAmount = (obj)=>({
  ...obj,
  amount: obj.amount.toNumber(),
});


function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) { 
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Arcjet to add rate limiting here

    const req = await request()

    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify number of tokens requested
    })

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaaining, reset } = decision.reason;
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(
          (reset - Date.now()) / 1000
        )} seconds.`);
      }
      throw new Error("Request denied");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }
      
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          category: data.category.toLowerCase(),
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, date.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/accounts/${transaction.accountId}`);

    return {
      success: true,
      data: serializeAmount(transaction),
    }

  } catch (error) {
    throw new Error("Failed to create transaction: " + error.message);
  }
}
