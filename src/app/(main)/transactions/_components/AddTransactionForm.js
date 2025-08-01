"use client";

import { createTransaction, updateTransaction } from "@/actions/transaction";
import DashboardCardDrawer from "@/components/DashboardCardDrawer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch-hook";
import { transactionSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import RecipieScanner from "./RecipieScanner";

const AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const {
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount,
            accountId: initialData.accountId,
            description: initialData.description,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId:
              accounts?.data?.find((acc) => acc.isDefault === true)?.id || "",
            date: new Date(),
            isRecurring: false,
            category: "",
          },
  });

  const { isLoading, error, fn, data } = useFetch(
    editMode ? updateTransaction : createTransaction
  );

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filterCategories = categories.filter((ct) => ct.type === type);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      fn(editId, formData);
    } else {
      fn(formData);
    }
  };

  useEffect(() => {
    if (data && data.success === true && !isLoading) {
      toast.success("Transaction Created Successfully");
      reset();
      router.push(`/accounts/${data?.data?.accountId}`);
    }
    if (data && !data.success && !isLoading) {
      if (data.error?.startsWith("RateLimit:")) {
        const seconds = parseInt(data.error.split(":")[1]);
        const minutes = Math.ceil(seconds / 60); // round up

        toast.error(
          `Too many requests. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
        );
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    }
  }, [data, isLoading, reset, router]);

  useEffect(() => {
    if (error) {
      console.log(error);
      toast.error(error.message || "Failed To Create Transaction");
    }
  }, [error]);

  const handleScanComplete = useCallback(
    (scanData) => {
      const { amount, description, category, date } = scanData?.data ?? {};
      if (amount != null) setValue("amount", amount.toString());
      if (date != null) setValue("date", new Date(date));
      if (description) setValue("description", description);
      if (category) {
        setValue("category", category);
      }
    },
    [setValue]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <RecipieScanner onScanComplete={handleScanComplete} />

      <div className="space-y-2">
        <label htmlFor="type" className="font-medium text-sm">
          Type
        </label>
        <Select
          defaultValue={type}
          onValueChange={(value) => setValue("type", value)}
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">EXPENSE</SelectItem>
            <SelectItem value="INCOME">INCOME</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-red-500 text-sm">{errors.type.message}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 w-full">
        <div className="space-y-2">
          <label htmlFor="amount" className="font-medium text-sm">
            Amount
          </label>
          <Input
            type="number"
            name="amount"
            placeholder="00.0"
            step="0.01"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="accountId" className="font-medium text-sm">
            Account
          </label>
          <Select
            defaultValue={getValues("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger className={"w-full"}>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {/* ✅ fixed: added return statement inside map */}
              {accounts?.data?.map((acc, index) => (
                <SelectItem key={index} value={acc.id}>
                  {acc.name} (${parseFloat(acc.balance).toFixed(2)})
                </SelectItem>
              ))}
              <DashboardCardDrawer>
                <Button
                  className={
                    "w-full select-none text-sm items-center outline-none"
                  }
                  variant={"ghost"}
                >
                  Add Account
                </Button>
              </DashboardCardDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-red-500 text-sm">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="font-medium text-sm">
          Category
        </label>
        <Select
          defaultValue={getValues("category")}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {/* ✅ fixed: added return statement inside map */}
            {filterCategories.map((cat, index) => (
              <SelectItem className={"capitalize"} key={index} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="font-medium text-sm">
          Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button className={"w-full pl-2 text-left font-normal"}>
              {date ? format(date, "PPP") : <span>Pick a Date</span>}
              <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={"w-auto p-0"} align="start">
            <Calendar
              mode="single"
              selected={date} // ✅ fixed: use `selected` instead of `value`
              onSelect={(value) => setValue("date", value)} // ✅ fixed: correct prop is `onSelect`
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="font-medium text-sm">
          Description
        </label>
        <Input
          type="text"
          name="description"
          placeholder="Enter Description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1.5">
          <label
            htmlFor="isDefault"
            className="text-sm font-medium cursor-pointer"
          >
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            This account will be selected by default for transactions.
          </p>
        </div>
        <Switch
          id="isDefault"
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={isRecurring}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <label htmlFor="recurringInterval" className="font-medium text-sm">
            Recurring Interval
          </label>
          <Select
            defaultValue={getValues("recurringInterval")}
            onValueChange={(value) => setValue("recurringInterval", value)}
          >
            <SelectTrigger className={"w-full"}>
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">DAILY</SelectItem>
              <SelectItem value="WEEKLY">WEEKLY</SelectItem>
              <SelectItem value="MONTHLY">MONTHLY</SelectItem>
              <SelectItem value="YEARLY">YEARLY</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-red-500 text-sm">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              {editMode ? "Updating Transaction..." : "Creating Transaction..."}
            </>
          ) : (
            <>{editMode ? "Update Transaction" : "Create Transaction"}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
