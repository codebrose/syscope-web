import React from "react";
import { useAuth } from "../context/authContext";
import { FolderGit, Users, Building } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import StatCard from "../components/StatCards";
import RecentActivity from "../components/RecentActivity";

import { useGithubRepos } from "../hooks/useGithubRepos";
import { useGithubRecentCommits } from "../hooks/useGithubRecentCommits";

interface CardItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

const DashboardView: React.FC = () => {
  const { user, githubToken } = useAuth();

  const { repos, loading: loadingRepos } = useGithubRepos(githubToken);

  const { commits, loading: loadingActivity } =
    useGithubRecentCommits(githubToken, repos);

  const cardData: CardItem[] = [
    {
      label: "Repositories",
      value: loadingRepos ? "Loading..." : repos.length,
      icon: FolderGit,
      color: "bg-blue-500",
    },
    {
      label: "Organizations",
      value: 3,
      icon: Building,
      color: "bg-green-500",
    },
    {
      label: "Members",
      value: 27,
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex-1 p-6 w-full grid gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p>Welcome, {user?.displayName || user?.email || "User"}</p>

        {githubToken ? (
          <p className="text-green-500">GitHub token available ✅</p>
        ) : (
          <p className="text-red-500">No GitHub token ❌</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cardData.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <RecentActivity commits={commits} loading={loadingActivity} />
    </div>
  );
};

export default DashboardView;
