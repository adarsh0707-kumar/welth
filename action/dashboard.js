"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

export async function createAccount(data) {

  try {
    const { userId } = await auth;
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });
  }
  catch (err) {
    console.error(err)
  }
}