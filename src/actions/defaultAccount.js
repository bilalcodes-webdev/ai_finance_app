"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const serializeBalance = (obj) => {
  const serilaized = { ...obj };

  if (obj.balance) {
    serilaized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serilaized.amount = obj.balance.toNumber();
  }

  return serilaized;
};

const updateDefaultAccount = async (accountId) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("No User Found");

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const updateDefaultAccount = await db.account.update({
      where: {
        userId: user.id,
        id: accountId,
      },
      data: {
        isDefault: true,
      },
    });

    const serilizedaccount = serializeBalance(updateDefaultAccount);
    revalidatePath("/dashboard");
    return { success: true, data: serilizedaccount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default updateDefaultAccount;
