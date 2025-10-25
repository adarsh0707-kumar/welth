import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

import { sendEmail } from "@/action/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Inngest function to check user budgets and send alerts if usage exceeds threshold.
 * Runs every 6 hours via cron.
 */


export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },

  /**
   * @param {Object} param0
   * @param {Object} param0.step - Inngest step helper for orchestrating sub-steps.
   */
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                // Changed from 'account' to 'accounts' (likely plural)
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      // Access the first default account from the accounts array
      const defaultAccount = budget.user.accounts[0];

      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const expenses = await db.transaction.aggregate({
          // Changed from 'expense' to 'transaction'
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const usagePercentage = (totalExpenses / budgetAmount) * 100;

        if (
          usagePercentage >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // Send Email Alert (you'll need to implement this)
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert: ${defaultAccount.name}, You've used ${usagePercentage.toFixed(2)}% of your budget`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                usagePercentage,
                budgetAmount: parseInt(budgetAmount).toFixed(2),
                totalExpenses: parseInt(totalExpenses).toFixed(2),
                accountName: defaultAccount.name,
              },
            }),
          });

          // Update lastAlertSent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

/**
 * Determines if the current month is different from the last alert month.
 * @param {Date} lastAlertSent - Date the last alert was sent.
 * @param {Date} currentDate - Current date.
 * @returns {boolean} True if a new month has started.
 */

function isNewMonth(lastAlertSent, currentDate) {
  return (
    lastAlertSent.getMonth() !== currentDate.getMonth() ||
    lastAlertSent.getFullYear() !== currentDate.getFullYear()
  );
}

/**
 * Trigger all recurring transactions that are due.
 * Runs daily at midnight via cron.
 */

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transaction",
  },
  { cron: "0 0 * * *" },

  /**
   * @param {Object} param0
   * @param {Object} param0.step - Inngest step helper
   * @returns {Promise<Object>} Number of triggered transactions
   */

  async ({ step }) => {
    // 1. Fetch all due recurring transactions
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } }, //Due date passed
            ],
          },
        });
      }
    );

    // 2. Create events for each transaction
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }));

      // 3. Send events to be processed
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

/**
 * Process individual recurring transaction events.
 * @param {Object} param0
 * @param {Object} param0.event - Inngest event containing transaction data
 * @param {Object} param0.step - Inngest step helper
 */

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },

  async ({ event, step }) => {
    // validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data: ", event);
      return {
        error: "Missing required event data",
      };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance

        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

/**
 * Check if a recurring transaction is due.
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if transaction is due today or overdue
 */

function isTransactionDue(transaction) {
  // If no lastProcessed data, transaction is due

  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date

  return nextDue <= today;
}

/**
 * Calculate the next recurring date based on interval.
 * @param {Date} startDate - Current transaction date
 * @param {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} interval - Recurrence interval
 * @returns {Date} Next transaction date
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
 * Generate monthly financial reports for all users.
 * Runs at midnight on the first day of each month via cron.
 */

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyState(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: 'monthly-report',
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
        
      });
    }

    return {processed: users.length}
    
  }
);

/**
 * Generate AI insights from monthly financial stats.
 * @param {Object} stats - Monthly financial stats
 * @param {string} month - Month name
 * @returns {Promise<string[]>} Array of actionable insights
 */

async function generateFinancialInsights(stats, month) {
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

/**
 * Aggregate monthly financial data for a user.
 * @param {string} userId - User ID
 * @param {Date} month - Date object representing the month
 * @returns {Promise<Object>} Monthly statistics including income, expenses, and by category
 */

const getMonthlyState = async (userId, month) => {
  
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] = 
          (stats.byCategory[t.category] || 0) + amount
      }
      else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  )
}
