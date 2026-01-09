import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/index.tsx"),
    route("organisations", "routes/dashboard/organisation.tsx"),
    route("repos", "routes/dashboard/repos.tsx"),
  ]),
] satisfies RouteConfig;
