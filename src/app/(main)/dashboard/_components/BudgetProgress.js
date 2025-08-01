"use client";

import { updateBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch-hook";
import { Check, PencilIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

const BudgetProgress = ({ initialBudget, currentExpense }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentUsed = initialBudget
    ? (currentExpense / initialBudget.amount) * 100
    : 0;

  const { isLoading, error, fn, data } = useFetch(updateBudget);

  const handleUpdateAmount = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please Enter Valid Amount");
      return;
    }

    await fn(amount);
  };

  useEffect(() => {
    if (data?.success === true) {
      toast.success("Budget Amount Updated");
      setIsEditing(false);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something Went Wrong");
    }
  });

  const handleCancel = () => {
    console.log("clicked");
    initialBudget?.amount?.toString() || 0;
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 mb-4">
      {isLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      <Card>
        <CardHeader
          className={
            "flex flex-row justify-between items-center space-y-0 pb-2"
          }
        >
          <div className="flex-1">
            <CardTitle>Monthly Budget (Default Account)</CardTitle>
            <div className="flex items-center gap-3 mt-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className={"w-32"}
                    placeholder="Enter Amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={"w-4 h-4 mr-4 text-green-500"}
                    onClick={handleUpdateAmount}
                    disabled={isLoading}
                  >
                    <Check />
                  </Button>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={"w-4 h-4 text-red-500"}
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <>
                  <CardDescription>
                    {initialBudget
                      ? `$${currentExpense.toFixed(
                          2
                        )} of $${initialBudget.amount.toFixed(2)} spent `
                      : " No Budget Set"}
                  </CardDescription>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={"w-4 h-4"}
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialBudget && (
            <div className="space-y-4">
              <Progress
                value={percentUsed}
                extraStyles={
                  percentUsed >= 90
                    ? "bg-red-500"
                    : percentUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
              />
              <div className="text-xs text-muted-foreground text-right">
                {percentUsed.toFixed(1)}% Used
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default BudgetProgress;
