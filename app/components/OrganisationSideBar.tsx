import React, { useState } from "react";
import AddRepoPopup from "./AddRepoPopup";
import RepoInsightsPopup from "./Organisation/RepoInsightsPopup";
import { useOrganisationRepos } from "../hooks/useOrganisationRepos";

export default function OrganisationSidebar() {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [activeRepo, setActiveRepo] = useState<string | null>(null);

  const { repos, collaborators, loading } = useOrganisationRepos();

  return (
    <div className="w-[40%] flex flex-col gap-6">
      {/* Members */}
      <div className="bg-zinc-900/40 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-2">Members</h3>

        {loading && <p className="text-zinc-400 text-xs">Loading...</p>}

        <div className="flex gap-2 flex-wrap">
          {!loading && collaborators.length === 0 && (
            <p className="text-zinc-400 text-xs italic">
              No collaborators yet
            </p>
          )}

          {collaborators.map((c) => (
            <img
              key={c.login}
              src={c.avatar_url}
              alt={c.login}
              title={c.login}
              className="w-8 h-8 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Repositories */}
      <div className="bg-zinc-900/40 rounded-2xl p-4 flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-semibold text-sm">Repositories</h3>
          <button
            onClick={() => setIsAddPopupOpen(true)}
            className="px-3 py-1 bg-orange-500 text-black text-xs font-medium rounded-lg"
          >
            Add Repo
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {repos.map((r) => (
            <button
              key={r.repoId}
              onClick={() => setActiveRepo(r.full_name)}
              className="p-2 bg-zinc-800 rounded-lg text-sm text-left hover:bg-zinc-700"
            >
              <div className="flex justify-between">
                <span>{r.name}</span>
                <span className="text-xs text-orange-400">View</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popups */}
      <AddRepoPopup
        open={isAddPopupOpen}
        onClose={() => setIsAddPopupOpen(false)}
      />

      {activeRepo && (
        <RepoInsightsPopup
          repoFullName={activeRepo}
          onClose={() => setActiveRepo(null)}
        />
      )}
    </div>
  );
}
