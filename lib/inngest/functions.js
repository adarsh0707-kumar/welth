
import { db } from "../prisma";
import { inngest } from "./client";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => { 
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              account: {
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
      const defaultAccount = budget.user.account[0];

      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1);

        const expenses = await db.expense.aggregate({
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
        const budgetAmount = budget.amount.toNumber();
        const usagePercentage = (totalExpenses / budgetAmount) * 100;

        if (usagePercentage >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) {
          // send Email Alert

          //update lastAlertSent

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          })
        }
      });
    }
  }
);


function isNewMonth(lastAlertSent, currentDate) {
  lastAlertSent.getMonth() !== currentDate.getMonth() ||
  lastAlertSent.getFullYear() !== currentDate.getFullYear();
}