import React from "react";
import { GitCommit } from "lucide-react";

export interface CommitActivity {
  id: string;
  message: string;
  repoName: string;
  url: string;
  date: string;
  authorName: string;
  authorLogin?: string | null;
  authorAvatar?: string | null;
}

interface RecentActivityProps {
  activities: CommitActivity[];
  loading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading }) => {
  return (
    <div className="bg-zinc-900/70 backdrop-blur-md rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <GitCommit /> Latest Activity
      </h2>

      {loading ? (
        <p>Loading latest commits...</p>
      ) : activities.length === 0 ? (
        <p>No recent activity found.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {activities.map((a) => (
            <li
              key={a.id}
              className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition flex flex-col"
            >
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-orange-400 transition"
              >
                {a.message}
              </a>
              <p className="text-xs text-zinc-400 mt-1">
                {a.repoName} • {new Date(a.date).toLocaleString()} •{" "}
                {a.authorLogin || a.authorName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
