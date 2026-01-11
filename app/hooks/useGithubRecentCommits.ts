import { useEffect, useState } from "react";
import type { GitHubRepo } from "./useGithubRepos";
import type { Commit } from "../components/OrganisationDetailsView";

export function useGithubRecentCommits(
  githubToken?: string | null,
  repos: GitHubRepo[] = []
) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!githubToken || repos.length === 0) return;

    const fetchCommits = async () => {
      setLoading(true);

      try {
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

        // newest first
        allCommits.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setCommits(allCommits.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch GitHub commits", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [githubToken, repos]);

  return { commits, loading };
}
