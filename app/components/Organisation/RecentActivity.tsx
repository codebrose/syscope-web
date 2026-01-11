import { useOrgRecentCommits } from "../../hooks/useOrgRecentCommits";

function RecentActivity() {
  const { commits, loading } = useOrgRecentCommits();

  if (loading) {
    return <p className="text-zinc-400 text-sm">Loading activity…</p>;
  }

  if (commits.length === 0) {
    return <p className="text-zinc-400 text-sm">No recent activity.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {commits.map((c) => (
        <div
          key={c.sha}
          className="flex items-start gap-3 p-3 bg-zinc-800/40 rounded-lg"
        >
          <img
            src={c.avatar}
            className="w-8 h-8 rounded-full"
            alt=""
          />
          <div>
            <p className="text-sm text-white">{c.message}</p>
            <p className="text-xs text-zinc-400">
              {c.author} • {new Date(c.date).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecentActivity;
