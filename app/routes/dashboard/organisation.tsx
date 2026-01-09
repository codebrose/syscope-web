import type { Route } from "./+types";
import Organisation from "~/dashboard/organisation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Organisations · Syscop" },
    { name: "description", content: "Syscop Organisations overview" },
  ];
}

export default function Organisations() {
  return <Organisation />;
}
