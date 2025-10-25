"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Convert a Prisma object with a Decimal `amount` field into a plain object
 * where `amount` is a JavaScript number.
 *
 * @param {Object} obj - The object to serialize.
 * @param {import("decimal.js").Decimal} obj.amount - The decimal amount to convert.
 * @returns {Object} A new object with `amount` as a number.
 */
const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

/**
 * Calculate the next recurring date based on a start date and interval.
 *
 * @param {Date|string|number} startDate - The date from which to calculate.
 * @param {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} interval - The recurrence interval.
 * @returns {Date} The next date for the recurring event.
 */

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

/**
 * Create a new transaction for the authenticated user.
 *
 * This function:
 *  - Authenticates the user via Clerk.
 *  - Applies rate limiting using Arcjet.
 *  - Creates a new transaction in the database.
 *  - Updates the account balance.
 *  - Computes the next recurring date if the transaction is recurring.
 *  - Revalidates relevant Next.js cache paths.
 *
 * @param {Object} data - Data for the transaction.
 * @param {string} data.accountId - The account ID for the transaction.
 * @param {"INCOME"|"EXPENSE"} data.type - Type of transaction.
 * @param {number} data.amount - Amount of the transaction.
 * @param {Date|string|number} data.date - Date of the transaction.
 * @param {string} data.category - Category name for the transaction.
 * @param {boolean} [data.isRecurring] - Whether the transaction recurs.
 * @param {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} [data.recurringInterval] - Interval for recurrence.
 * @returns {Promise<{ success: boolean, data: Object }>} Result object:
 *   - `success`: true if transaction was created.
 *   - `data`: The created transaction serialized (with numeric amount).
 * @throws {Error} If the user is unauthorized, rate-limited, or other errors occur.
 */

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaaining, reset } = decision.reason;
        throw new Error(
          `Rate limit exceeded. Try again in ${Math.ceil(
            (reset - Date.now()) / 1000
          )} seconds.`
        );
      }
      throw new Error("Request denied");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

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
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
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
    };
  } catch (error) {
    throw new Error("Failed to create transaction: " + error.message);
  }
}

/**
 * Scan a receipt image file using Google Gemini (Generative AI) to extract data.
 *
 * The function sends a base64-encoded image to the model along with a prompt
 * and expects JSON output containing: amount, date, description, merchantName, category.
 *
 * @param {File|Blob} file - The receipt image file (e.g., from an upload input).
 * @returns {Promise<{
 *   amount: number,
 *   date: Date,
 *   description: string,
 *   category: string,
 *   merchantName: string
 * }>} Extracted receipt information.
 * @throws {Error} If scanning fails or response format is invalid.
 */

export async function scanRecipt(file) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

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
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to scan receipt: " + error.message);
  }
}

/**
 * Fetch a single transaction by ID for the authenticated user.
 *
 * @param {string} id - The ID of the transaction to fetch.
 * @returns {Promise<Object>} The serialized transaction object (with amount as number).
 * @throws {Error} If user not authorized, or transaction not found.
 */

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: { id, userId: user.id },
  });
  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

/**
 * Update an existing transaction and adjust the account balance accordingly.
 *
 * @param {string} id - The ID of the transaction to update.
 * @param {Object} data - The new data for the transaction.
 * @param {"INCOME"|"EXPENSE"} data.type - The updated type of transaction.
 * @param {number} data.amount - The updated amount.
 * @param {string} data.category - The category of the transaction.
 * @param {Date|string|number} data.date - Date of the transaction.
 * @param {boolean} [data.isRecurring] - Whether this transaction is recurring.
 * @param {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} [data.recurringInterval] - Interval if recurring.
 * @param {string} data.accountId - The account ID to which the transaction belongs.
 * @returns {Promise<{ success: boolean, data: Object }>} The result of the update and the updated transaction.
 * @throws {Error} If unauthorized or on failure.
 */

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    if (!id || typeof id !== "string") {
      throw new Error("Valid transaction ID is required");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const originalTransaction = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });
    if (!originalTransaction) throw new Error("Transaction not found");

    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          category: data.category.toLowerCase(),
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: netBalanceChange } },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}
