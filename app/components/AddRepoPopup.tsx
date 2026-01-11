import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";

interface AddRepoPopupProps {
  open: boolean;
  onClose: () => void;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
}

export default function AddRepoPopup({ open, onClose }: AddRepoPopupProps) {
  const { user } = useAuth();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);

  // 🔑 Load GitHub token from localStorage
  useEffect(() => {
    if (!open) return;
    setGithubToken(localStorage.getItem("githubToken"));
  }, [open]);

  // ---------------------------
  // Fetch GitHub Repositories
  // ---------------------------
  useEffect(() => {
    if (!open || !githubToken || !user) return;

    const fetchRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        /* 1️⃣ Fetch repos already added */
        const existingQuery = query(
          collection(db, "orgRepos"),
          where("ownerUid", "==", user.uid)
        );

        const existingSnap = await getDocs(existingQuery);
        const existingRepoIds = new Set<number>(
          existingSnap.docs.map((doc) => doc.data().repoId)
        );

        /* 2️⃣ Fetch GitHub repos */
        const res = await fetch(
          "https://api.github.com/user/repos?per_page=50&sort=updated",
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github+json",
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error("GitHub API Error:", res.status, text);
          throw new Error("Failed to fetch GitHub repositories");
        }

        const data = await res.json();

        /* 3️⃣ Filter out already-added repos */
        const mapped: GitHubRepo[] = data
          .filter((repo: any) => !repo.archived)
          .filter((repo: any) => !existingRepoIds.has(repo.id))
          .map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
          }));

        setRepos(mapped);
      } catch (err) {
        console.error(err);
        setError("Unable to load repositories");
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [open, githubToken, user]);

  // ---------------------------
  // Save Repo to Firestore
  // ---------------------------
  const handleAddRepo = async (repo: GitHubRepo) => {
    if (!user) return;

    setSavingId(repo.id);

    try {
      await addDoc(collection(db, "orgRepos"), {
        repoId: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // 🔥 Remove repo from UI immediately after adding
      setRepos((prev) => prev.filter((r) => r.id !== repo.id));
    } catch (err) {
      console.error("Failed to save repo:", err);
    } finally {
      setSavingId(null);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-zinc-900 rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
          >
            <h2 className="text-white text-lg font-semibold mb-4">
              Add Repository
            </h2>

            {loading && (
              <p className="text-zinc-400 text-sm">
                Loading repositories…
              </p>
            )}

            {error && (
              <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            {!loading && !error && repos.length === 0 && (
              <p className="text-zinc-400 text-sm italic">
                All repositories already added 🎉
              </p>
            )}

            {!loading &&
              repos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex justify-between items-center p-2 hover:bg-zinc-800 rounded"
                >
                  <div className="flex flex-col truncate">
                    <span className="text-zinc-300 text-sm truncate">
                      {repo.name}
                    </span>
                    <span className="text-zinc-500 text-xs truncate">
                      {repo.full_name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddRepo(repo)}
                    disabled={savingId === repo.id}
                    className="px-2 py-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black text-xs rounded"
                  >
                    {savingId === repo.id ? "Adding…" : "Add"}
                  </button>
                </div>
              ))}

            <button
              onClick={onClose}
              className="mt-4 w-full py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
