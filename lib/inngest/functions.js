import { sendEmail } from "@/action/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
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
            })
          })

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

function isNewMonth(lastAlertSent, currentDate) {
  return lastAlertSent.getMonth() !== currentDate.getMonth() || lastAlertSent.getFullYear() !== currentDate.getFullYear()
  
}
