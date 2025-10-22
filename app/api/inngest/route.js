import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlert, processRecurringTransaction, triggerRecurringTransactions } from "@/lib/inngest/functions";

// Create the API handler with functions properly registered
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert, 
    triggerRecurringTransactions,
    processRecurringTransaction
  ],
});
