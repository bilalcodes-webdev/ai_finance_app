"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Data For Select Field
const DATES_RANGES = {
  "7d": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  All: { label: "All Times", days: null },
};

const ChartTable = ({ transactions }) => {
  const [datesRanges, setDatesRanges] = useState("1M");

  const filterTransactionData = useMemo(() => {
    const range = DATES_RANGES[datesRanges];
    const now = new Date();

    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filter = transactions.filter(
      (t) => new Date(t.date) > startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filter.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");

      if (!acc[date]) {
        acc[date] = { date, income: 0, expence: 0 };
      }

      if (transaction.type === "INCOME") {
        acc[date].income += Number(transaction.amount);
      } else {
        acc[date].expence += Number(transaction.amount);
      }

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, datesRanges]);

  const total = useMemo(() => {
    return filterTransactionData.reduce(
      (acc, day) => {
        acc.income += day.income;
        acc.expence += day.expence;
        return acc;
      },
      { income: 0, expence: 0 }
    );
  }, [filterTransactionData]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center space-y-0 pb-2">
        <CardTitle className={"text-base font-normal"}>
          Transaction Overview
        </CardTitle>
        <Select value={datesRanges} onValueChange={setDatesRanges}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATES_RANGES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-500">
              ${total.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Total Expense</p>
            <p className="text-lg font-bold text-red-500">
              ${total.expence.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Net Total</p>
            <p
              className={`text-lg font-bold ${
                total.income - total.expence > 0
                  ? "text-green-500"
                  : "text-red-500"
              } `}
            >
              ${(total.income - total.expence).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filterTransactionData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip formatter={(value) => [`$${value}`, undefined]} />
              <Legend />
              <Bar dataKey="income" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expence" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartTable;
