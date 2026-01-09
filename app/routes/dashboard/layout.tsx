import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}
