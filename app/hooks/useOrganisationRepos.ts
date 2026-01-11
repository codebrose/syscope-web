import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";

export interface Collaborator {
  login: string;
  avatar_url: string;
  html_url: string;
  permissions: {
    pull: boolean;
    push: boolean;
    admin: boolean;
  };
}

export interface Repo {
  repoId: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  ownerUid: string;
  collaborators?: Collaborator[];
}

export function useOrganisationRepos() {
  const { user } = useAuth();

  const [repos, setRepos] = useState<Repo[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);

  // 🔑 Load GitHub token
  useEffect(() => {
    if (!user) return;
    setGithubToken(localStorage.getItem("githubToken"));
  }, [user]);

  // 🔹 Fetch repos from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchRepos = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "orgRepos"),
          where("ownerUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const reposData = snap.docs.map(
          (doc) => doc.data() as Repo
        );

        setRepos(reposData);
      } catch (err) {
        console.error("Failed to fetch repos from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [user]);

  // 🔹 Fetch collaborators from GitHub + sync Firestore
  useEffect(() => {
    if (!githubToken || repos.length === 0) return;

    const fetchCollaborators = async () => {
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

          if (!res.ok) {
            updatedRepos.push({ ...repo, collaborators: [] });
            continue;
          }

          const collabs: Collaborator[] = await res.json();

          // Sync collaborators to Firestore
          for (const c of collabs) {
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
          }

          updatedRepos.push({ ...repo, collaborators: collabs });
        } catch (err) {
          console.error(`Failed to fetch collaborators for ${repo.full_name}`, err);
          updatedRepos.push({ ...repo, collaborators: [] });
        }
      }

      setRepos(updatedRepos);

      // 🔹 Aggregate unique collaborators
      const map = new Map<string, Collaborator>();
      updatedRepos.forEach((r) =>
        r.collaborators?.forEach((c) => {
          if (!map.has(c.login)) map.set(c.login, c);
        })
      );

      setCollaborators(Array.from(map.values()));
    };

    fetchCollaborators();
  }, [githubToken, repos]);

  return {
    repos,
    collaborators,
    loading,
  };
}
