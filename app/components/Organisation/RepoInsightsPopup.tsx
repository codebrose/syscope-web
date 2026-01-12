import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
};

type Props = {
  repoFullName: string;
  onClose: () => void;
};

/* ---------------- Stable color per contributor ---------------- */
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

export default function RepoInsightsPopup({
  repoFullName,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<"commits" | "contributors">("commits");
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch Commits ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("githubToken");
    if (!token) return;

    const fetchCommits = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits?per_page=30`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        );

        const data = await res.json();

        setCommits(
          data.map((c: any) => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch commits", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [repoFullName]);

  /* ---------------- Contributors List ---------------- */
  const contributors = useMemo(() => {
    return Array.from(
      new Set(commits.map((c) => c.author))
    );
  }, [commits]);

  /* ---------------- Daily Chart Data ---------------- */
  const dailyContributorData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();

    commits.forEach((c) => {
      const day = new Date(c.date).toISOString().slice(0, 10);

      if (!map.has(day)) {
        map.set(day, {});
      }

      const entry = map.get(day)!;
      entry[c.author] = (entry[c.author] || 0) + 1;
    });

    return Array.from(map.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );
  }, [commits]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-zinc-900 w-200 max-h-[80vh] min-h-125 rounded-2xl p-6 overflow-y-auto"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">
              {repoFullName}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-zinc-800 mb-4">
            {["commits", "contributors"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 text-sm ${
                  activeTab === tab
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                {tab === "commits" && "Commits"}
                {tab === "contributors" && "Daily Contributors"}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading && (
            <p className="text-zinc-400 text-sm">Loading...</p>
          )}

          {!loading && activeTab === "commits" && (
            <div className="space-y-3">
              {commits.map((c) => (
                <div
                  key={c.sha}
                  className="p-3 bg-zinc-800 rounded-lg text-sm"
                >
                  <p className="text-white line-clamp-2">
                    {c.message}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {c.author} •{" "}
                    {new Date(c.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && activeTab === "contributors" && (
            <div className="h-80 w-full">
              {dailyContributorData.length === 0 ? (
                <p className="text-zinc-400 text-sm">
                  No contributor data available
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyContributorData}>
                    <XAxis dataKey="date" />
                    <Tooltip />
                    <Legend />

                    {contributors.map((name) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        stackId="a"
                        fill={stringToColor(name)}
                        radius={[2, 2, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
