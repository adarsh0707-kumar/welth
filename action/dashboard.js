"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
}

export async function createAccount(data) {

  try {
    const { userId } = await auth;
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // convert balance to float before saving

    const balanceFloat = parseFloat(data.balance)

    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount")

    }

    // check if this is the user's first account

    const existingAccounts = await db.account.findMany({
      where:{userId: user.id}
    })

    const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

    // if this account should be default, unset other default acoounts

    if (shouldBeDefault) {
      awaitdb.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard")

    return {
      success: true,
      data: serializedAccount,
    }


  }
  catch (err) {
    console.error(err.message)
    throw new Error(err.message)
  }
}