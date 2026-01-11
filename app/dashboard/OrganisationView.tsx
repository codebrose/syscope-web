import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import OrganisationModal from "~/components/OrganisationModal";
import OrganisationSidebar from "~/components/OrganisationSideBar";
import OrganisationDetailsView from "~/components/OrganisationDetailsView";
import { db } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";

interface Organisation {
  id: string;
  name: string;
  description?: string;
  createdAt?: Timestamp;
}

export default function OrganisationView() {
  const { user } = useAuth();

  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgRepos, setOrgRepos] = useState<{ id: string; name: string }[]>([]);

  /* -------------------------------
     Load GitHub token from storage
  -------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("githubToken");
    setGithubToken(token);
  }, []);

  /* -------------------------------
     Fetch Organisations
  -------------------------------- */
  const fetchOrganisations = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, "organisations"),
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const orgs: Organisation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Organisation, "id">),
      }));

      setOrganisations(orgs);

      if (!selectedOrg) setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load organisations.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, selectedOrg]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  /* -------------------------------
     Handlers
  -------------------------------- */
  const handleSelectOrg = (org: Organisation) => {
    setSelectedOrg(org);
    setIsModalOpen(false);
  };

  const handleAddRepo = (repoId: string, repoName: string) => {
    setOrgRepos((prev) => {
      const exists = prev.some((r) => r.id === repoId);
      if (exists) return prev;
      return [...prev, { id: repoId, name: repoName }];
    });
  };

  /* -------------------------------
     Render
  -------------------------------- */
  return (
    <div className="flex-1 w-full mx-auto p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="h-25 bg-zinc-900/70 border border-zinc-800/50 rounded-2xl flex items-center px-6">
        {selectedOrg ? (
          <>
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 mr-4">
              <span className="text-zinc-300 text-2xl">🏢</span>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">
                {selectedOrg.name}
              </h2>
              {selectedOrg.description && (
                <p className="text-zinc-400 text-sm">
                  {selectedOrg.description}
                </p>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-orange-500 hover:text-orange-400 font-medium"
            >
              Change
            </button>
          </>
        ) : (
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-full flex items-center justify-center text-zinc-500 italic cursor-pointer hover:text-zinc-400"
          >
            Select or create an organisation
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-6 w-full">
        {/* Left 60% */}
        {selectedOrg && githubToken && (
          <OrganisationDetailsView
            orgName={selectedOrg.name}
            repos={orgRepos}
            githubToken={githubToken}
          />
        )}

        {selectedOrg && !githubToken && (
          <div className="flex-1 bg-zinc-900/40 rounded-2xl p-6 flex items-center justify-center">
            <p className="text-zinc-400 text-sm">
              Connect your GitHub account to view organisation activity.
            </p>
          </div>
        )}

        {/* Right 40% */}
        <OrganisationSidebar />
      </div>

      {/* Modal */}
      <OrganisationModal
        open={isModalOpen}
        loading={loading}
        organisations={organisations}
        selectedOrgId={selectedOrg?.id}
        onSelect={handleSelectOrg}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
