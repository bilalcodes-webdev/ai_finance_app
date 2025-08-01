"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeBalance = (obj) => {
  const serilaized = { ...obj };

  if (obj.balance) {
    serilaized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serilaized.amount = obj.amount.toNumber();
  }

  return serilaized;
};

export const createAccount = async (data) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User Not Found");

    const convertBalanceToFloat = parseFloat(data.balance);

    if (isNaN(convertBalanceToFloat)) throw new Error("Invalid Balance Amount");

    const existingAccount = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });

    const defaultAccount = existingAccount.length === 0 ? true : data.isDefault;

    if (!["CURRENT", "SAVING"].includes(data.accountType)) {
      throw new Error("Invalid account type");
    }

    if (defaultAccount) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: data.name,
        accountType: data.accountType,
        balance: convertBalanceToFloat,
        userId: user.id,
        isDefault: defaultAccount,
      },
    });

    const serializedAccount = serializeBalance(account);

    revalidatePath("/dashboard");

    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserAccounts = async () => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized User");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("No User Found");

  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          transaction: true,
        },
      },
    },
  });

  const serilizedAccounts = accounts.map(serializeBalance);

  return { success: true, data: serilizedAccounts };
};

export const getTransactionWithThisAccount = async (accountId) => {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transaction: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            transaction: true,
          },
        },
      },
    });

    if (!account) return null;

    const { transaction = [], ...rest } = account;

    return {
      ...serializeBalance(rest), // account fields except 'transaction'
      transaction: transaction.map(serializeBalance), // serialized array
    };
  } catch (error) {
    return { success: false, message: "failed to fetch transaction" };
  }
};

export const deleteTransactions = async (transactionIds) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const balanceChange = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      // ✅ Corrected `deleteMany`
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // ✅ Update each related account's balance
      for (const [accountId, balanceChangeValue] of Object.entries(
        balanceChange
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChangeValue,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/accounts/[id]");

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: error.message };
  }
};
