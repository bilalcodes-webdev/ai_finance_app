import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlert,
  generateMonthReport,
  processRecurringTransaction,
  triggerRecurringTransaction,
} from "@/lib/inngest/userFunctions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    checkBudgetAlert,
    triggerRecurringTransaction,
    processRecurringTransaction,
    generateMonthReport
  ],
});
