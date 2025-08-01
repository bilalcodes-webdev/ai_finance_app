"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import useFetch from "@/hooks/use-fetch-hook";
import { toast } from "sonner";
import updateDefaultAccount from "@/actions/defaultAccount";
import { useEffect } from "react";

const AccountCard = ({ account }) => {
  const { id, accountType, name, balance, isDefault } = account;
  const {
    isLoading,
    error,
    fn,
    data: updtedAccountData,
  } = useFetch(updateDefaultAccount);

  async function handleDefaultAccount(e) {
    e.preventDefault();
    if (isDefault) {
      toast.warning("You must have 1 account to default");
      return;
    }

    await fn(id);
  }

  useEffect(() => {
    if (updtedAccountData?.success === true && !isLoading) {
      toast.success("Default Account Successfull Updated");
    }
  }, [updtedAccountData, isLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed To Update Default Account");
    }
  }, [error]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/accounts/${id}`}>
        <CardHeader className="flex justify-between items-center space-y-0 pb-4">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            className="cursor-pointer"
            disabled={isLoading}
            checked={isDefault}
            onClick={handleDefaultAccount}
          />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold pb-2">
            ${parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {accountType.charAt(0) + accountType.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground pt-2">
          {/* Icons row */}
          <div className="flex justify-between w-full px-4">
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-[10px]">Income</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <span className="text-[10px]">Expense</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-gray-200 my-2" />

          {/* Transaction Count */}
          <div className="text-[11px] text-muted-foreground text-center mt-2">
            <span className="mr-2 text-lg font-medium capitalize">
              Transactions:  
            </span>
             <span className="font-medium text-sm" >
               {account._count?.transaction ?? 0}
             </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};
export default AccountCard;
