import { useEffect, useState } from "react";

export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  owner: { login: string };
}

export function useGithubRepos(githubToken?: string | null) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!githubToken) return;

    const fetchRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "https://api.github.com/user/repos?per_page=50",
          {
            headers: {
              Authorization: `token ${githubToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch repositories");

        const data: GitHubRepo[] = await res.json();
        setRepos(data);
      } catch (err) {
        console.error(err);
        setError("Could not load repositories");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [githubToken]);

  return { repos, loading, error };
}
