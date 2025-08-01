import DashboardPage from "./page";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

const DashboardLayout = () => {
  return (
    <div className="px-5">
      <h1 className="text-6xl mb-5 gradient-title bg-gradient-to-br from-blue-600 to-purple-600 font-bold tracking-tighter text-transparent bg-clip-text">
        Dashboard
      </h1>

      {/* Dashbboard Page */}
      <Suspense
        fallback={
          <BarLoader className="mt-4" width={"100%"} color={"#9333ea"} />
        }
      >
        <DashboardPage />
      </Suspense>
    </div>
  );
};
export default DashboardLayout;
