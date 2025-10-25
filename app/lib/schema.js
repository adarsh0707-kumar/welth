import z from "zod";

/**
 * Zod schema for validating account data.
 *
 * @typedef {Object} Account
 * @property {string} name - Name of the account (required)
 * @property {"CURRENT"|"SAVINGS"} type - Type of account (required)
 * @property {string} balance - Initial balance as a string (required)
 * @property {boolean} [isDefault=false] - Whether this account is the default account
 */

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false),
});

/**
 * Zod schema for validating transaction data.
 *
 * @typedef {Object} Transaction
 * @property {string} amount - Transaction amount as string (required)
 * @property {string} [description] - Optional description
 * @property {Date} date - Transaction date (required)
 * @property {"INCOME"|"EXPENSE"} type - Type of transaction (required)
 * @property {string} accountId - ID of the account associated with transaction (required)
 * @property {string} category - Category name for the transaction (required)
 * @property {boolean} [isRecurring=false] - Whether the transaction is recurring
 * @property {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} [recurringInterval] - Interval for recurring transaction (required if `isRecurring` is true)
 *
 * @remarks
 * Includes a superRefine check to ensure that if `isRecurring` is true, `recurringInterval` must be provided.
 */

export const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.date().min(1, "Date is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Category is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
}).superRefine((data, ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recurring interval is required for recurring transactions",
      path: ["recurringInterval"],
    });
  }
})