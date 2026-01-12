import { useEffect, useState } from "react";
import type { GitHubRepo } from "./useGithubRepos";
import type { Commit } from "../components/OrganisationDetailsView";

const CACHE_KEY = "githubRecentCommits";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export function useGithubRecentCommits(
  githubToken?: string | null,
  repos: GitHubRepo[] = []
) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!githubToken || repos.length === 0) return;

    const loadCommits = async () => {
      setLoading(true);

      try {
        // 1️⃣ Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < CACHE_EXPIRATION) {
            setCommits(parsed.data);
            setLoading(false);
            return;
          }
        }

        // 2️⃣ Fetch commits from GitHub
        const allCommits: Commit[] = [];

        for (const repo of repos) {
          const res = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=5`,
            {
              headers: {
                Authorization: `token ${githubToken}`,
              },
            }
          );

          if (!res.ok) continue;

          const data = await res.json();

          data.forEach((c: any) => {
            allCommits.push({
              sha: c.sha,
              message: c.commit.message,
              date: c.commit.author.date,
              author: c.commit.author.name,
              avatar: c.author?.avatar_url,
            });
          });
        }

        // newest first, limit to 10
        const latestCommits = allCommits
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);

        setCommits(latestCommits);

        // 3️⃣ Save to cache with timestamp
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: latestCommits, timestamp: Date.now() })
        );
      } catch (error) {
        console.error("Failed to fetch GitHub commits", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommits();
  }, [githubToken, repos]);

  return { commits, loading };
}
