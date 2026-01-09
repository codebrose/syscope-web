import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { FolderGit, Users, Building } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatCard from "../components/StatCards";
import RecentActivity from "../components/RecentActivity";
import type { CommitActivity } from "../components/RecentActivity";

interface CardItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  owner: { login: string };
}

const DashboardView: React.FC = () => {
  const { user, githubToken } = useAuth();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [activities, setActivities] = useState<CommitActivity[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  // Fetch GitHub authenticated username
  useEffect(() => {
    if (!githubToken) return;

    const fetchUsername = async () => {
      try {
        const res = await fetch("https://api.github.com/user", {
          headers: { Authorization: `token ${githubToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch GitHub user");
        const data = await res.json();
        setGithubUsername(data.login);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsername();
  }, [githubToken]);

  // Fetch GitHub repos
  useEffect(() => {
    if (!githubToken) return;

    const fetchRepos = async () => {
      setLoadingRepos(true);
      try {
        const res = await fetch("https://api.github.com/user/repos?per_page=50", {
          headers: { Authorization: `token ${githubToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch repos");
        const data: GitHubRepo[] = await res.json();
        setRepos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepos();
  }, [githubToken]);

  // Fetch commits for each repo
  useEffect(() => {
    if (!githubToken || !repos.length) return;

    const fetchCommits = async () => {
      setLoadingActivity(true);
      try {
        const allCommits: CommitActivity[] = [];

        for (const repo of repos) {
          const res = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=5`,
            {
              headers: { Authorization: `token ${githubToken}` },
            }
          );

          if (!res.ok) continue;
          const commits = await res.json();

          commits.forEach((c: any) =>
            allCommits.push({
              id: c.sha,
              message: c.commit.message,
              repoName: repo.name,
              url: c.html_url,
              date: c.commit.author.date,
              authorName: c.commit.author.name,
              authorLogin: c.author?.login || null,
              authorAvatar: c.author?.avatar_url || null,
            })
          );
        }

        // Sort by date descending & keep top 10
        allCommits.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setActivities(allCommits.slice(0, 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchCommits();
  }, [repos, githubToken]);

  const cardData: CardItem[] = [
    {
      label: "Repositories",
      value: loadingRepos ? "Loading..." : repos.length,
      icon: FolderGit,
      color: "bg-blue-500",
    },
    { label: "Organizations", value: 3, icon: Building, color: "bg-green-500" },
    { label: "Members", value: 27, icon: Users, color: "bg-orange-500" },
  ];

  return (
    <div className="flex-1 p-6 w-full grid gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p>Welcome, {user?.displayName || user?.email || "User"}</p>
        {githubToken ? (
          <p className="text-green-500">GitHub token available ✅</p>
        ) : (
          <p className="text-red-500">No GitHub token ❌</p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cardData.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Latest activity */}
      <RecentActivity activities={activities} loading={loadingActivity} />
    </div>
  );
};

export default DashboardView;
