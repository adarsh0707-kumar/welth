'use server';

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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


export async function scanRecipt(file) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const arrayBuffer = await file.arrayBuffer();

    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },

      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()

    try {
      const data = JSON.parse(cleanedText);

       if (!data.amount || !data.date) {
        throw new Error("Invalid receipt data received");
      }
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini")
    }


  } catch (error) {
    console.error(error.message)
    throw new Error("Failed to scan receipt" + error.message )
    
  }
}

