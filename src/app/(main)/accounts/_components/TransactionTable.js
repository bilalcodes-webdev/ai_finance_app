"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { categoryColors } from "../../../../../data/category";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch-hook";
import { deleteTransactions } from "@/actions/dashboard";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setselectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  // Filter Search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  //Pagination Control
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { isLoading, data, fn: deleteFn, error } = useFetch(deleteTransactions);

  const handleBulkDelte = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transaction(s)?`
      )
    ) {
      return;
    }

    deleteFn(selectedIds);
    router.refresh(); // ✅ force update UI
  };

  useEffect(() => {
    if (data && !isLoading) {
      toast.success("Transaction Deleted Successfully");
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction Deletion Failed");
    }
  }, [error]);

  const handleClick = (id) => {
    setselectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === FilterAndSortedTransactions.length) {
      setselectedIds([]); // Deselect all
    } else {
      const allIds = FilterAndSortedTransactions.map((t) => t.id);
      setselectedIds(allIds); // Select all
    }
  };

  // FIlter Handle Based On Available Options
  const FilterAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search Filter
    if (searchTerm) {
      result = result.filter((transaction) => {
        return transaction?.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    }

    // REcurring Filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;

        return !transaction.isRecurring;
      });
    }

    //Type Filter
    if (typeFilter) {
      result = result.filter((transactions) => {
        return transactions.type === typeFilter;
      });
    }

    // Applu Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  //Pagination Control
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return FilterAndSortedTransactions.slice(startIndex, endIndex);
  }, [FilterAndSortedTransactions, currentPage]);

  //Show Pagination Numbers
  const totalPages = Math.ceil(
    FilterAndSortedTransactions.length / itemsPerPage
  );
  const getCompactPages = (currentPage, totalPages) => {
    const pages = [];

    if (totalPages <= 5) {
      // Just show all if few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // Always show first page

      if (currentPage <= 3) {
        // Show first 4 pages, then ...
        pages.push(2, 3, 4);
        pages.push("dots");
      } else if (currentPage >= totalPages - 2) {
        // Show ..., then last 4 pages
        pages.push("dots");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        // Show ..., current -1, current, current +1, ...
        pages.push("dots");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("dots");
      }

      pages.push(totalPages); // Always show last page
    }

    return pages;
  };

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const RECURSING_INTERVAL = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    Yearly: "Yearly",
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRecurringFilter("");
    setTypeFilter("");
    setselectedIds("");
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search Here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className={"w-[145px]"}>
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-4">
              <Button
                disabled={isLoading}
                onClick={handleBulkDelte}
                variant="destructive"
              >
                <Trash className="w-4 h-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size={"icon"}
              title="Clear Filters"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length === FilterAndSortedTransactions.length &&
                    FilterAndSortedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("date")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                onClick={() => handleSort("category")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("amount")}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className={"w-[50px]"} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {FilterAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground pt-4"
                >
                  No Transaction Found
                </TableCell>
              </TableRow>
            ) : (
              <>
                {paginatedTransactions.map((transactions) => {
                  return (
                    <TableRow key={transactions.id}>
                      <TableCell className="font-medium">
                        <Checkbox
                          onCheckedChange={() => handleClick(transactions.id)}
                          checked={selectedIds.includes(transactions.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(transactions.date), "PP")}
                      </TableCell>
                      <TableCell>{transactions.description}</TableCell>
                      <TableCell className={"capitalize"}>
                        <span
                          style={{
                            background: categoryColors[transactions.category],
                          }}
                          className="text-sm text-white rounded px-2 py-1"
                        >
                          {transactions.category}
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-right font-medium"
                        style={{
                          color:
                            transactions.type === "EXPENSE" ? "red" : "green",
                        }}
                      >
                        {transactions.type === "EXPENSE" ? "-" : "+"}$
                        {transactions.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {transactions.isRecurring ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                className="gap-2 items-center p-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                variant="outline"
                              >
                                <RefreshCcw className="h-3 w-3" />
                                {
                                  RECURSING_INTERVAL[
                                    transactions.recurringInterval
                                  ]
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div>
                                <div className="font-medium">Next Date</div>
                                <div>
                                  {format(
                                    new Date(transactions.nextRecurringDate),
                                    "PP"
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge className="gap-4" variant="outline">
                            <Clock className="h-3 w-3"></Clock>
                            One-time
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel
                              onClick={() =>
                                router.push(
                                  `/transactions/create?edit=${transactions.id}`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteFn([transactions.id])}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Control */}
      <div className="flex justify-center items-center pt-4">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`p-2 rounded-md border ${
                currentPage === 1
                  ? "text-muted-foreground cursor-not-allowed"
                  : "hover:bg-muted"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </PaginationItem>

          {/*  PAgination Numbers */}
          {getCompactPages(currentPage, totalPages).map((page, index) => (
            <PaginationItem key={index}>
              {page === "dots" ? (
                <span className="px-2">...</span>
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                  className={`cursor-pointer ${
                    currentPage === page ? "bg-primary text-white" : ""
                  }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            <button
              disabled={
                currentPage ===
                Math.ceil(FilterAndSortedTransactions.length / itemsPerPage)
              }
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`p-2 rounded-md border ${
                currentPage ===
                Math.ceil(FilterAndSortedTransactions.length / itemsPerPage)
                  ? "text-muted-foreground cursor-not-allowed"
                  : "hover:bg-muted"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </PaginationItem>
        </PaginationContent>
      </div>
    </div>
  );
};
export default TransactionTable;
