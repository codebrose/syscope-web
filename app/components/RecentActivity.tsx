import React from "react";
import { GitCommit } from "lucide-react";
import type { Commit } from "./OrganisationDetailsView";

export interface RecentActivityProps {
  commits: Commit[];
  loading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  commits,
  loading,
}) => {
  return (
    <div className="bg-zinc-900/70 backdrop-blur-md rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <GitCommit /> Latest Activity
      </h2>

      {loading ? (
        <p className="text-zinc-400">Loading latest commits...</p>
      ) : commits.length === 0 ? (
        <p className="text-zinc-500">No recent activity found.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {commits.map((c) => (
            <li
              key={c.sha}
              className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition flex gap-3"
            >
              {c.avatar && (
                <img
                  src={c.avatar}
                  alt={c.author}
                  className="w-8 h-8 rounded-full mt-1"
                />
              )}

              <div className="flex flex-col">
                <p className="font-medium text-white">
                  {c.message}
                </p>

                <p className="text-xs text-zinc-400 mt-1">
                  {c.author} •{" "}
                  {new Date(c.date).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
