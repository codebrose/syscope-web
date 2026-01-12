import { useEffect, useMemo, useState } from "react";
import { useGithubRepos } from "../hooks/useGithubRepos";
import type { GitHubRepo } from "../hooks/useGithubRepos";
import RepoInsightsPopup from "./Organisation/RepoInsightsPopup";

type Repo = {
  id: number;
  name: string;
  full_name: string; // required for popup
  owner: { login: string };
};

function RepoCard({
  repo,
  onClick,
}: {
  repo: Repo;
  onClick: (repoFullName: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(repo.full_name)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4
                 hover:border-orange-500/40 transition cursor-pointer"
    >
      <h3 className="text-white font-medium">{repo.name}</h3>
      <p className="text-xs text-zinc-500 mt-1">
        Owner: {repo.owner.login}
      </p>
    </div>
  );
}

export default function ReposView() {
  // ✅ Get token directly from localStorage
  const githubToken = localStorage.getItem("githubToken");

  const { repos: githubRepos, loading, error } = useGithubRepos(githubToken);

  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  /* -------- Fetch authenticated GitHub user -------- */
  useEffect(() => {
    if (!githubToken) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setGithubLogin(data.login);
      } catch (err) {
        console.error("Failed to fetch GitHub user", err);
      }
    };

    fetchUser();
  }, [githubToken]);

  /* -------- Map GitHubRepo → Repo -------- */
  const mappedRepos: Repo[] = useMemo(() => {
    return githubRepos.map((r: GitHubRepo) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name || `${r.owner.login}/${r.name}`,
      owner: r.owner,
    }));
  }, [githubRepos]);

  /* -------- Categorize repos -------- */
  const { ownedRepos, contributedRepos } = useMemo(() => {
    if (!githubLogin) return { ownedRepos: [], contributedRepos: [] };

    const owned: Repo[] = [];
    const contributed: Repo[] = [];

    mappedRepos.forEach((repo) => {
      if (repo.owner.login === githubLogin) owned.push(repo);
      else contributed.push(repo);
    });

    return { ownedRepos: owned, contributedRepos: contributed };
  }, [mappedRepos, githubLogin]);

  /* -------- UI States -------- */
  if (!githubToken) {
    return (
      <div className="flex-1 p-6 text-zinc-400 text-sm">
        GitHub token not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 text-zinc-400 text-sm">
        Loading repositories…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 text-red-400 text-sm">{error}</div>
    );
  }

  return (
    <div className="flex-1 p-6 w-full space-y-8">
      <h1 className="text-xl font-semibold text-white">
        Your Repositories
      </h1>

      {/* Owned */}
      {ownedRepos.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-orange-500 mb-4">
            Owned Repositories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedRepos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                onClick={(fullName) => setSelectedRepo(fullName)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Contributed */}
      {contributedRepos.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-400 mb-4">
            Contributed Repositories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributedRepos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                onClick={(fullName) => setSelectedRepo(fullName)}
              />
            ))}
          </div>
        </section>
      )}

      {mappedRepos.length === 0 && (
        <p className="text-zinc-400 text-sm">No repositories found.</p>
      )}

      {/* -------- Repo Insights Popup -------- */}
      {selectedRepo && (
        <RepoInsightsPopup
          repoFullName={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
}
