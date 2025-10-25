import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlert,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions
} from "@/lib/inngest/functions";

/**
 * Inngest API handler for Next.js.
 * Registers all serverless functions with Inngest so they can be triggered via events.
 *
 * @remarks
 * This handler exposes the following HTTP methods: GET, POST, PUT.
 * Each method can trigger any of the registered functions:
 * - `checkBudgetAlert`: Monitors user budgets and triggers alerts.
 * - `triggerRecurringTransactions`: Initiates recurring transactions for users.
 * - `processRecurringTransaction`: Handles the execution of a single recurring transaction.
 * - `generateMonthlyReports`: Generates monthly financial reports for users.
 *
 * @example
 * // Example usage via POST request to trigger a function
 * fetch('/api/inngest', {
 *   method: 'POST',
 *   body: JSON.stringify({ event: "triggerRecurringTransactions" })
 * });
 *
 * @type {import('next').NextApiHandler}
 */


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert, 
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports
  ],
});
