import DashboardNavbar from "~/components/DashboardNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import OrganisationView from "~/dashboard/OrganisationView";


export default function Organisation() {

  return (
    <ProtectedRoute>
      <div className="p-4 flex flex-col gap-4 min-h-screen bg-gray-900 text-white">
        <DashboardNavbar />
        <OrganisationView />
      </div>
    </ProtectedRoute>
  );
}
