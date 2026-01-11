import { useOrgRecentCommits } from "../../hooks/useOrgRecentCommits";

function Leaderboard() {
  const { contributors, loading } = useOrgRecentCommits();

  if (loading) {
    return <p className="text-zinc-400 text-sm">Loading leaderboard…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {contributors.map((c, i) => (
        <div
          key={c.login}
          className="flex items-center gap-4 p-3 bg-zinc-800/40 rounded-lg"
        >
          <span className="text-zinc-500 w-6">#{i + 1}</span>
          <img src={c.avatar} className="w-8 h-8 rounded-full" />
          <span className="flex-1 text-white">{c.login}</span>
          <span className="text-orange-500 font-medium">
            {c.commits} commits
          </span>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;
