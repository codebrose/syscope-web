import React from "react";
import { useAuth } from "../context/authContext";
import { FolderGit, Users, Building } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import StatCard from "../components/StatCards";
import RecentActivity from "../components/RecentActivity";

import { useGithubRepos } from "../hooks/useGithubRepos";
import { useGithubAllCommits } from "../hooks/useGithubAllCommits";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface CardItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

const DashboardView: React.FC = () => {
  const { user, githubToken } = useAuth();

  const { repos, loading: loadingRepos } = useGithubRepos(githubToken);
  const { commits, dailyCommits, loading: loadingAllCommits } =
    useGithubAllCommits(githubToken, repos);

  const [membersCount, setMembersCount] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orgMembers"));
        setMembersCount(snapshot.size);
      } catch (err) {
        console.error("Failed to fetch members", err);
        setMembersCount(0);
      }
    };
    fetchMembers();
  }, []);

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
      value: membersCount ?? "Loading...",
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex-1 p-6 w-full grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cardData.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentActivity commits={commits.slice(0, 10)} loading={loadingAllCommits} />

        <div className="bg-zinc-900 rounded-xl p-4">
          <h2 className="text-white font-medium mb-4">Daily Commits</h2>
          {loadingAllCommits ? (
            <p className="text-zinc-400 text-sm">Loading chart…</p>
          ) : dailyCommits.length === 0 ? (
            <p className="text-zinc-400 text-sm">No commits yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyCommits}>
                <CartesianGrid stroke="#2e2e2e" strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316" // orange
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
