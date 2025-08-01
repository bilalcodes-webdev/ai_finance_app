import { getUserAccounts } from "@/actions/dashboard";
import AddTransactionForm from "../_components/AddTransactionForm";
import { defaultCategories } from "../../../../../data/category";
import { getTransaction } from "@/actions/transaction";

const TransactionPage = async ({ searchParams }) => {
  const accounts = await getUserAccounts();

  const editId = await searchParams.edit;

  let initialData;
  if (editId) {
    const data = await getTransaction(editId);
    initialData = data?.data;
  }

  console.log(initialData);
  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-6xl mb-5 gradient-title bg-gradient-to-br from-blue-600 to-purple-600 font-bold tracking-tighter text-transparent bg-clip-text">
        {editId ? "Edit Transaction" : "Add Trannsaction"}
      </h1>
      <sup>(User can make only two request per hour)</sup>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};
export default TransactionPage;
