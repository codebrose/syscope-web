import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "~/lib/firebase";
import type { Commit, Contributor } from "../components/OrganisationDetailsView";

interface OrgRepo {
  full_name: string;
}

export function useOrgRecentCommits() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const githubToken = localStorage.getItem("githubToken");
    if (!githubToken) return;

    const fetchAll = async () => {
      setLoading(true);

      try {
        /* 1️⃣ Fetch repos from Firestore */
        const q = query(
          collection(db, "orgRepos"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const repos: OrgRepo[] = snap.docs.map((d) => ({
          full_name: d.data().full_name,
        }));

        if (repos.length === 0) {
          setCommits([]);
          setContributors([]);
          return;
        }

        /* 2️⃣ Fetch commits */
        const allCommits: Commit[] = [];

        for (const repo of repos) {
          const res = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits?per_page=10`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github+json",
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

        /* 3️⃣ Sort commits (latest first) */
        allCommits.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setCommits(allCommits.slice(0, 10));

        /* 4️⃣ Group by author → Leaderboard */
        const contributorMap = new Map<string, Contributor>();

        allCommits.forEach((c) => {
          const key = c.author;

          if (!contributorMap.has(key)) {
            contributorMap.set(key, {
              login: key,
              avatar: c.avatar,
              commits: 1,
            });
          } else {
            contributorMap.get(key)!.commits += 1;
          }
        });

        const ranked = Array.from(contributorMap.values()).sort(
          (a, b) => b.commits - a.commits
        );

        setContributors(ranked);
      } catch (err) {
        console.error("Failed to fetch org commits", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { commits, contributors, loading };
}
