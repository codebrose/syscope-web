import { useEffect, useMemo, useState } from "react";
import RecentActivity from "./Organisation/RecentActivity";
import Leaderboard from "./Organisation/LeaderBoard";
import ContributorsChart from "./Organisation/ContributorsChart";

export type Commit = {
  sha: string;
  author: string;
  avatar?: string;
  message: string;
  date: string;
};

export type Contributor = {
  login: string;
  avatar?: string;
  commits: number;
};

type OrganisationDetailsViewProps = {
  orgName: string;
  repos: Array<{ name: string }>;
  githubToken: string;
};

export default function OrganisationDetailsView({
  orgName,
  repos,
  githubToken,
}: OrganisationDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "leaderboard" | "chart">("activity");
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-[60%] bg-zinc-900/40 rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-800 mb-6">
        {["activity", "leaderboard", "chart"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium ${
              activeTab === tab
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            {tab === "activity" && "Recent Activity"}
            {tab === "leaderboard" && "Leaderboard"}
            {tab === "chart" && "Contributors Chart"}
          </button>
        ))}
      </div>

      {loading && <p className="text-zinc-500">Loading...</p>}

      {!loading && activeTab === "activity" && (
        <RecentActivity />
      )}

      {!loading && activeTab === "leaderboard" && (
        <Leaderboard />
      )}

      {!loading && activeTab === "chart" && (
        <ContributorsChart />
      )}
    </div>
  );
}
