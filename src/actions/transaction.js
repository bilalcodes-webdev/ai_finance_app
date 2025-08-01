"use server";
import { Decimal } from "@prisma/client/runtime/library";
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { success } from "zod";
import { err } from "inngest/types";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serilize = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

export const createTransaction = async (data) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // ARCJET REQUEST FOR DATA
    const req = await request();

    //Check Rate Limit
    const decision = await aj.protect(req, {
      userId: userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          detail: {
            remaining,
            resetInSeconds: reset,
          },
        });

        // Yeh throw karo to client side pe handle kar sako
        throw new Error(`RateLimit:${reset}`);
      }

      throw new Error("Too Many Requests");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not Found");

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account Not Found");

    const balanceChange =
      data.type === "EXPENSE"
        ? new Decimal(data.amount).neg()
        : new Decimal(data.amount);

    const newBalance = new Decimal(account.balance).add(balanceChange);

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? newRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: newBalance,
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/accounts/${transaction.accountId}`);

    return { success: true, data: serilize(transaction) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

function newRecurringDate(startdate, interval) {
  const date = new Date(startdate);

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
export const AiReceiptGenerate = async (file) => {
  try {
    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer).toString("base64");

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

      If it's not a receipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: buffer,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();

    const cleanedText = text
      .replace(/```(?:json)?\n?/gi, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error("❌ Failed to parse Gemini response:", cleanedText);
      throw new Error("Invalid JSON response from Gemini");
    }

    // Validate fields
    if (
      !data ||
      typeof data.amount !== "number" ||
      typeof data.date !== "string" ||
      typeof data.description !== "string" ||
      typeof data.merchantName !== "string" ||
      typeof data.category !== "string"
    ) {
      throw new Error("Gemini returned missing or invalid fields");
    }

    const amount = parseFloat(data.amount);
    const parsedDate = new Date(data.date);

    if (isNaN(amount) || isNaN(parsedDate.getTime())) {
      throw new Error("Invalid amount or date format");
    }

    return {
      success: true,
      data: {
        amount: amount,
        date: parsedDate,
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      },
    };
  } catch (error) {
    console.error("❌ AI receipt generation failed:", error);
    throw new Error("Failed to scan receipt");
  }
};

export const getTransaction = async (transacionId) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const transaction = await db.transaction.findUnique({
      where: {
        id: transacionId,
        userId: user.id,
      },
    });

    if (!transaction) throw new Error("Transaction Not Found");

    return { success: true, data: serilize(transaction) };
  } catch (error) {
    throw new Error({ success: false, message: error.message });
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    console.log(data);

    const orignalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!orignalTransaction) {
      throw new Error("Transaction Not Found");
    }

    const oldBalanceChange =
      orignalTransaction.type === "EXPENSE"
        ? -orignalTransaction.amount.toNumber()
        : orignalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const updatedBalance = newBalanceChange - oldBalanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const updateTransaction = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? newRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: updatedBalance,
          },
        },
      });
      return { success: true, data: serilize(updateTransaction) };
    });

    revalidatePath("/dashboard");
    revalidatePath(`/accounts/${data.accountId}`);
  } catch (error) {
    throw new Error("Faile To Update Transaction");
  }
};

export const getDashBoardData = async () => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User Not Found");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => serilize(t));
};
