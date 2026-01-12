import { useEffect, useMemo, useState } from "react";
import type { GitHubRepo } from "./useGithubRepos";

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatar?: string;
}

const CACHE_KEY = "githubAllCommits";

export function useGithubAllCommits(
  githubToken?: string | null,
  repos: GitHubRepo[] = []
) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!githubToken || repos.length === 0) return;

    const fetchAllCommits = async () => {
      setLoading(true);

      // ✅ Check localStorage cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Commit[];
          setCommits(parsed);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      try {
        const allCommits: Commit[] = [];

        for (const repo of repos) {
          let page = 1;
          let more = true;

          while (more) {
            const res = await fetch(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=100&page=${page}`,
              {
                headers: {
                  Authorization: `token ${githubToken}`,
                },
              }
            );

            if (!res.ok) break;

            const data = await res.json();
            if (data.length === 0) {
              more = false;
              break;
            }

            data.forEach((c: any) => {
              allCommits.push({
                sha: c.sha,
                message: c.commit.message,
                author: c.commit.author.name,
                date: c.commit.author.date,
                avatar: c.author?.avatar_url,
              });
            });

            page++;
          }
        }

        // Sort newest first
        allCommits.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setCommits(allCommits);

        // ✅ Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(allCommits));
      } catch (err) {
        console.error("Failed to fetch all commits", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCommits();
  }, [githubToken, repos]);

  // Group commits by day for chart
  const dailyCommits = useMemo(() => {
    const map = new Map<string, number>();

    commits.forEach((c) => {
      const day = new Date(c.date).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [commits]);

  return { commits, dailyCommits, loading };
}
