import { notFound } from "next/navigation"; // ✅ Correct way to import notFound()

import { getTransactionWithThisAccount } from "@/actions/dashboard";
import { Suspense } from "react";
import TransactionTable from "../_components/TransactionTable";
import { BarLoader } from "react-spinners";
import { CodeSquare } from "lucide-react";
import ChartTable from "../_components/ChartTable";

const AccountPage = async ({ params }) => {
  const { id } = await params;
  const accountData = await getTransactionWithThisAccount(id);

  if (!accountData) {
    notFound(); //
  }

  const { transaction, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 justify-between items-end">
        <div>
          <h1 className="text-5xl sm:text-6xl bg-gradient-to-br from-blue-600 to-purple-600 font-extrabold tracking-tighter pr-2 text-transparent bg-clip-text capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.accountType.charAt(0) +
              account.accountType.slice(1).toLowerCase()}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {account._count.transaction} Transaction
          </div>
        </div>
      </div>

      {/* Chart Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#933ea" />}
      >
        <ChartTable transactions={transaction} />
      </Suspense>

      {/*Transaction Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#933ea" />}
      >
        <TransactionTable transactions={transaction} />
      </Suspense>
    </div>
  );
};

export default AccountPage;
