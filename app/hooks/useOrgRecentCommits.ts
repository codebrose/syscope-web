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

interface WeeklyContributorData {
  week: string; // e.g. "2026-01-01"
  [contributor: string]: number | string;
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function useOrgRecentCommits() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<
    WeeklyContributorData[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const githubToken = localStorage.getItem("githubToken");
    if (!githubToken) return;

    const fetchAll = async () => {
      setLoading(true);

      try {
        /* 1️⃣ Fetch repos */
        const q = query(
          collection(db, "orgRepos"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const repos: OrgRepo[] = snap.docs.map((d) => ({
          full_name: d.data().full_name,
        }));

        if (!repos.length) return;

        /* 2️⃣ Fetch commits */
        const allCommits: Commit[] = [];

        for (const repo of repos) {
          const res = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits?per_page=50`,
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

        /* 3️⃣ Latest commits */
        allCommits.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setCommits(allCommits.slice(0, 10));

        /* 4️⃣ Contributor leaderboard */
        const contributorMap = new Map<string, Contributor>();

        allCommits.forEach((c) => {
          if (!contributorMap.has(c.author)) {
            contributorMap.set(c.author, {
              login: c.author,
              avatar: c.avatar,
              commits: 1,
            });
          } else {
            contributorMap.get(c.author)!.commits += 1;
          }
        });

        const ranked = Array.from(contributorMap.values()).sort(
          (a, b) => b.commits - a.commits
        );

        setContributors(ranked);

        /* 5️⃣ Weekly contributor analysis (for chart) */
        const weeklyMap = new Map<string, Record<string, number>>();

        allCommits.forEach((c) => {
          const week = getWeekStart(new Date(c.date));

          if (!weeklyMap.has(week)) {
            weeklyMap.set(week, {});
          }

          const weekEntry = weeklyMap.get(week)!;
          weekEntry[c.author] = (weekEntry[c.author] || 0) + 1;
        });

        const weeklyData: WeeklyContributorData[] = Array.from(
          weeklyMap.entries()
        )
          .map(([week, data]) => ({
            week,
            ...data,
          }))
          .sort(
            (a, b) =>
              new Date(a.week).getTime() - new Date(b.week).getTime()
          );

        setWeeklyChartData(weeklyData);
      } catch (err) {
        console.error("Failed to fetch org commits", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return {
    commits,
    contributors,
    weeklyChartData,
    loading,
  };
}
