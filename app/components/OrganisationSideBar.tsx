import React, { useState } from "react";
import AddRepoPopup from "./AddRepoPopup";
import { useOrganisationRepos } from "../hooks/useOrganisationRepos";

export default function OrganisationSidebar() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const {
    repos,
    collaborators,
    loading,
  } = useOrganisationRepos();

  return (
    <div className="w-[40%] flex flex-col gap-6">
      {/* Members */}
      <div className="bg-zinc-900/40 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-2">Members</h3>

        {loading && (
          <p className="text-zinc-400 text-xs">Loading...</p>
        )}

        <div className="flex gap-2 flex-wrap">
          {!loading && collaborators.length === 0 && (
            <p className="text-zinc-400 text-xs italic">
              No collaborators yet
            </p>
          )}

          {collaborators.map((c) => (
            <a
              key={c.login}
              href={c.html_url}
              target="_blank"
              rel="noopener noreferrer"
              title={c.login}
            >
              <img
                src={c.avatar_url}
                alt={c.login}
                className="w-8 h-8 rounded-full"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Repositories */}
      <div className="bg-zinc-900/40 rounded-2xl p-4 flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-semibold text-sm">Repositories</h3>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="px-3 py-1 bg-orange-500 text-black text-xs font-medium rounded-lg"
          >
            Add Repo
          </button>
        </div>

        {repos.length === 0 && !loading && (
          <p className="text-zinc-400 text-xs italic">No repos yet</p>
        )}

        <div className="flex flex-col gap-2">
          {repos.map((r) => (
            <div
              key={r.repoId}
              className="p-2 bg-zinc-800 rounded-lg text-sm"
            >
              <div className="flex justify-between">
                <span>{r.name}</span>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-400"
                >
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddRepoPopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}
