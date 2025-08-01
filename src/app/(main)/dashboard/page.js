import { getUserAccounts } from "@/actions/dashboard";
import DashboardCardDrawer from "@/components/DashboardCardDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AccountCard from "./_components/AccountCard";
import { getUserBudget } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";
import { getDashBoardData } from "@/actions/transaction";
import DashboardOverview from "./_components/DashboardOverview";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();
  const defaultAccount = accounts.data.find((account) => account.isDefault);

  const transactions = await getDashBoardData();

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getUserBudget(defaultAccount.id);
  }

  return (
    <div className="px-5">
      {/* Bufget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpense={budgetData?.currentExpense}
        />
      )}

      {/* Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* Account Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCardDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex items-center justify-center flex-col h-full pt-5 text-muted-foreground">
              <Plus className="h-10 w-10 mb-4" />
              <p className="text-sm font-bold">Add New Account</p>
            </CardContent>
          </Card>
        </DashboardCardDrawer>

        {accounts?.data?.length > 0 &&
          accounts?.data?.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
};
export default DashboardPage;
