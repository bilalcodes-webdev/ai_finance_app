"use client";
import { useForm } from "react-hook-form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/lib/schema";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch-hook";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const DashboardCardDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      accountType: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    isLoading: createAccountLoading,
    error,
    data: newAccount,
    fn: createAccountFn,
  } = useFetch(createAccount);

  const onsubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account Created Successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, createAccountLoading, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Somethin Went Wrong");
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <form className="space-y-4" onSubmit={handleSubmit(onsubmit)}>
            {/* Account Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium mb-1 block">
                Account Name
              </label>
              <Input
                type="text"
                id="name"
                placeholder="e.g Name Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-1">
              <label
                htmlFor="accountType"
                className="text-sm font-medium mb-1 block"
              >
                Account Type
              </label>
              <Select
                id="accountType"
                onValueChange={(value) => setValue("accountType", value)}
                defaultValue={watch("accountType")}
              >
                <SelectTrigger id="accountType" className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">CURRENT</SelectItem>
                  <SelectItem value="SAVING">SAVING</SelectItem>
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Account Balance */}
            <div className="space-y-1">
              <label
                htmlFor="balance"
                className="text-sm font-medium mb-1 block"
              >
                Account Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.balance.message}
                </p>
              )}
            </div>

            {/* Default Account Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium cursor-pointer"
                >
                  Set As Default Account
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions.
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                disabled={createAccountLoading}
                className="flex-1"
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DashboardCardDrawer;
