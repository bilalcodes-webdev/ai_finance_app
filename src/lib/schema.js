import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(4, "Name should have at least 4 characters"),
  accountType: z.enum(["CURRENT", "SAVING"]),
  balance: z.string().min(1, "Initial Balance Is Required"),
  isDefault: z.boolean().default(false),
});



export const transactionSchema = z
  .object({
    type: z.enum(["EXPENSE", "INCOME"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .check((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transaction",
        path: ["recurringInterval"],
      });
    }
  });
