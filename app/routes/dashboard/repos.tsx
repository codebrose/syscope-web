import DashboardNavbar from "~/components/DashboardNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import ReposView from "~/components/ReposView";


export default function Repos() {

  return (
    <ProtectedRoute>
      <div className="p-4 flex flex-col gap-4 min-h-screen bg-gray-900 text-white">
        <DashboardNavbar />
        <ReposView />
      </div>
    </ProtectedRoute>
  );
}
