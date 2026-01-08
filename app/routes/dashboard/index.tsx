import Dashboard from "~/dashboard/dashboard";
import type { Route } from "./+types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard · Syscop" },
    { name: "description", content: "Syscop dashboard overview" },
  ];
}

export default function DashboardIndex() {
  return <Dashboard />;
}
