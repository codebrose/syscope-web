import React, { useEffect, useState } from "react";
import AddRepoPopup from "./AddRepoPopup";
import { useAuth } from "~/context/authContext";
import { collection, addDoc, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "~/lib/firebase";

interface Collaborator {
  login: string;
  avatar_url: string;
  html_url: string;
  permissions: { pull: boolean; push: boolean; admin: boolean };
}

interface Repo {
  repoId: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  ownerUid: string;
  collaborators?: Collaborator[];
}

export default function OrganisationSidebar() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const { user } = useAuth();

  // 🔑 Load GitHub token from localStorage
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("githubToken");
    setGithubToken(token);
  }, [user]);

  // 🔹 Fetch repos from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchRepos = async () => {
      try {
        const q = query(
          collection(db, "orgRepos"),
          where("ownerUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const reposData: Repo[] = snap.docs.map((doc) => doc.data() as Repo);
        setRepos(reposData);
      } catch (err) {
        console.error("Failed to fetch repos from Firestore:", err);
      }
    };

    fetchRepos();
  }, [user]);

  // 🔹 Fetch collaborators from GitHub & update Firestore
  useEffect(() => {
    if (!githubToken || repos.length === 0) return;

    const fetchCollaboratorsFromGitHub = async () => {
      const updatedRepos: Repo[] = [];

      for (const repo of repos) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${repo.full_name}/collaborators`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github+json",
              },
            }
          );

          if (res.status === 403) {
            console.warn(`Permission error for ${repo.full_name}. Skipping collaborators.`);
            updatedRepos.push({ ...repo, collaborators: [] });
            continue;
          }

          if (!res.ok) {
            console.error(`Error fetching collaborators for ${repo.full_name}:`, res.status);
            updatedRepos.push({ ...repo, collaborators: [] });
            continue;
          }

          const collaborators: Collaborator[] = await res.json();

          // Add collaborators to Firestore (avoid duplicates)
          for (const c of collaborators) {
            try {
              const q = query(
                collection(db, "orgMembers"),
                where("login", "==", c.login)
              );
              const existing = await getDocs(q);
              if (existing.empty) {
                await addDoc(collection(db, "orgMembers"), {
                  login: c.login,
                  avatar_url: c.avatar_url,
                  html_url: c.html_url,
                  timestamp: new Date(),
                });
              }
            } catch (err) {
              console.error("Failed to add collaborator to Firestore:", err);
            }
          }

          updatedRepos.push({ ...repo, collaborators });
        } catch (err) {
          console.error(`Failed to fetch collaborators for ${repo.full_name}:`, err);
          updatedRepos.push({ ...repo, collaborators: [] });
        }
      }

      setRepos(updatedRepos);

      // Aggregate all collaborators for display (remove duplicates)
      const allCollabsMap = new Map<string, Collaborator>();
      updatedRepos.forEach((r) =>
        r.collaborators?.forEach((c) => {
          if (!allCollabsMap.has(c.login)) allCollabsMap.set(c.login, c);
        })
      );
      setCollaborators(Array.from(allCollabsMap.values()));
    };

    fetchCollaboratorsFromGitHub();
  }, [githubToken, repos]);

  return (
    <div className="w-[40%] flex flex-col gap-6">
      {/* Members Section */}
      <div className="bg-zinc-900/40 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-2">Members</h3>
        <div className="flex gap-2 flex-wrap">
          {collaborators.length === 0 && (
            <p className="text-zinc-400 text-xs italic">No collaborators yet</p>
          )}
          {collaborators.map((c) => (
            <a
              key={c.login}
              href={c.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs text-white hover:opacity-80"
              title={c.login}
            >
              <img
                src={c.avatar_url}
                alt={c.login}
                className="w-full h-full object-cover rounded-full"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Repos Section */}
      <div className="bg-zinc-900/40 rounded-2xl p-4 flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-semibold text-sm">Repositories</h3>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="px-3 py-1 bg-orange-500 hover:bg-orange-400 transition-colors text-black text-xs font-medium rounded-lg"
          >
            Add Repo
          </button>
        </div>

        {repos.length === 0 && (
          <p className="text-zinc-400 text-xs italic">No repos yet</p>
        )}

        <div className="flex flex-col gap-2">
          {repos.map((r) => (
            <div
              key={r.repoId}
              className="p-2 bg-zinc-800 rounded-lg text-zinc-300 text-sm"
            >
              <div className="flex justify-between items-center">
                <span>{r.name}</span>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  GitHub
                </a>
              </div>

              {r.collaborators && r.collaborators.length > 0 && (
                <div className="flex gap-2 mt-1 flex-wrap">
                  {r.collaborators.map((c) => (
                    <a
                      key={c.login}
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <img
                        src={c.avatar_url}
                        alt={c.login}
                        className="w-4 h-4 rounded-full"
                      />
                      {c.login}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Repo Popup */}
      <AddRepoPopup
        open={isPopupOpen}
        githubToken={githubToken}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}
