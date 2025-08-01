import { sendEmail } from "@/actions/sendEmail";
import { db } from "../prisma";
import { inngest } from "./client";
import Email from "../../../emails/my-email";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alert" },
  { cron: "0 */6 * * *" }, // Runs every 6 hours
  async ({ step }) => {
    // Step 1: Fetch budgets with associated user and default account
    const budgets = await step.run("fetch-budgets-with-users", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });

    // Step 2: Check each budget
    await step.run("check-budgets", async () => {
      for (const budget of budgets) {
        const defaultAccount = budget.user.accounts[0];
        if (!defaultAccount) continue;

        const startDate = new Date();
        startDate.setDate(1); // First day of the month

        // Step 3: Aggregate expenses for current month
        const expenses = await db.transaction.aggregate({
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

        const totalExpense = expenses._sum.amount ?? 0;

        const budgetAmount =
          typeof budget.amount === "number"
            ? budget.amount
            : Number(budget.amount);

        const totalPercentageUsed = (totalExpense / budgetAmount) * 100;

        // Step 4: Prevent duplicate alerts within the same month

        // Step 5: Trigger alert if over 80% used and no alert sent this month
        if (
          (totalPercentageUsed >= 80 && !budget.lastAlertSent) ||
          isNewMonth(new Date(budget.lastAlertSent), new Date())
        ) {
          // TODO: Send alert email here

          await sendEmail({
            to: budget.user.email,
            subject: `Bufdget Alert For ${defaultAccount.name}`,
            react: Email({
              username: budget.user.name,
              type: "budget-alert",
              data: {
                totalPercentageUsed,
                budgetAmount: parseInt(budgetAmount).toFixed(1),
                totalExpense: parseInt(totalExpense).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          // Step 6: Update last alert time
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      }
    });
  }
);

// Utility to check if alert was sent in a different month
function isNewMonth(lastDate, newDate) {
  return (
    lastDate.getMonth() !== newDate.getMonth() ||
    lastDate.getFullYear() !== newDate.getFullYear()
  );
}

export const triggerRecurringTransaction = inngest.createFunction(
  {
    id: "trigger-recurring-transaction",
    name: "Trigger Recurring Transaction",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const fetchRecurringTransactions = await step.run(
      "Fetch-Recurring-Transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { extRecurringDate: { lte: new Date() } },
            ],
          },
        });
      }
    );

    if (fetchRecurringTransactions.length > 0) {
      const event = fetchRecurringTransactions.map((t) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: t.id,
          userId: t.userId,
        },
      }));

      await inngest.send(event);
    }

    return { triggered: fetchRecurringTransactions.length };
  }
);

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process.recurring.transactions",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ step, event }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.log("Inavlid Event Data", event);
      return { message: "Missing Event Data" };
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

      if (!transaction || isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.id,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });
      });

      const balanceChane =
        transaction.type === "EXPENSE"
          ? -transaction.amount.toNumber()
          : transaction.amount.toNumber();

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChane } },
      });

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
  }
);

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDate = new Date(transaction.nextRecurringDate);

  return nextDate <= today;
}

function calculateNextRecurringDate(starDate, interval) {
  const date = new Date(starDate);

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

export const generateMonthReport = inngest.createFunction(
  {
    id: "generate=monthly-report",
    name: "Generate Monthly Report",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    await step.run("fetch-users", async () => {
      const users = await db.user.findMany({
        include: { account: true },
      });
    });

    for (const user of user) {
      await step.run(`generate-report-${user.id}`, async () => {
        let lastMonth = new Date();
        lastMonth = lastMonth.getDate(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);

        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insight = await generateFinancialInsight(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report ${monthName}`,
          react: Email({
            username: user.name,
            type: "monthly Report",
            data: {
              stats,
              month: monthName,
              insight,
            },
          }),
        });
      });
    }
    return { processed: user.length };
  }
);

async function generateFinancialInsight(stat, monthName) {
  const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
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

async function getMonthlyStats(userId, date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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
        stats.totalExpense += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }

      stats.transactionsCount += 1;

      return stats;
    },
    {
      totalExpense: 0,
      totalIncome: 0,
      byCategory: {},
      transactionsCount: 0,
    }
  );
}
