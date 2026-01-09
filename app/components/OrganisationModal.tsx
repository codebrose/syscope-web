import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, X, ArrowLeft, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "~/lib/firebase";

interface Organisation {
  id: string;
  name: string;
  description?: string;
}

interface OrganisationModalProps {
  open: boolean;
  loading: boolean;
  organisations: Organisation[];
  selectedOrgId?: string | null;
  onSelect: (org: Organisation) => void;
  onClose: () => void;
}

export default function OrganisationModal({
  open,
  loading,
  organisations,
  selectedOrgId,
  onSelect,
  onClose,
}: OrganisationModalProps) {
  const [mode, setMode] = useState<"list" | "create">("list");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const auth = getAuth();

  const handleCreateOrganisation = async () => {
    const user = auth.currentUser;
    if (!name.trim() || !user) return;

    try {
      setSubmitting(true);
      
      const newDoc = {
        name: name.trim(),
        description: description.trim() || null,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "organisations"), newDoc);

      const createdOrg: Organisation = {
        id: docRef.id,
        name: newDoc.name,
        description: newDoc.description || undefined,
      };

      // 1. Reset Form
      setName("");
      setDescription("");
      setMode("list");
      
      // 2. Pass the new org back to parent
      onSelect(createdOrg);
    } catch (error) {
      console.error("Failed to create organisation:", error);
      alert("Error creating organisation. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {mode === "create" && (
                  <button
                    onClick={() => setMode("list")}
                    disabled={submitting}
                    className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h3 className="text-xl font-semibold text-white">
                  {mode === "list" ? "Your Organisations" : "Create Organisation"}
                </h3>
              </div>

              {selectedOrgId && !submitting && (
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* LIST MODE */}
            {mode === "list" && (
              <>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-zinc-400 text-sm">Fetching organisations...</p>
                  </div>
                ) : organisations.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <Building2 size={42} className="text-zinc-700" />
                    <p className="text-zinc-400">
                      You don’t belong to any organisations yet
                    </p>
                    <button
                      onClick={() => setMode("create")}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 transition rounded-lg font-medium text-white"
                    >
                      <Plus size={18} />
                      Add organisation
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {organisations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => onSelect(org)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition text-left group ${
                          selectedOrgId === org.id 
                            ? 'bg-orange-500/10 border-orange-500/50' 
                            : 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                          selectedOrgId === org.id ? 'bg-orange-500 border-orange-400' : 'bg-zinc-800 border-zinc-700'
                        }`}>
                          <Building2 className={selectedOrgId === org.id ? 'text-white' : 'text-zinc-400'} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{org.name}</p>
                          {org.description && (
                            <p className="text-xs text-zinc-500 truncate">{org.description}</p>
                          )}
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setMode("create")}
                      className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 transition-colors mt-2"
                    >
                      <Plus size={18} />
                      <span className="text-sm font-medium">Add new organisation</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* CREATE MODE */}
            {mode === "create" && (
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1.5 block">
                    Organisation name
                  </label>
                  <input
                    autoFocus
                    value={name}
                    disabled={submitting}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1.5 block">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    disabled={submitting}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your team..."
                    rows={3}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  disabled={submitting || !name.trim()}
                  onClick={handleCreateOrganisation}
                  className="mt-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white transition-all rounded-lg py-2.5 font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Create organisation"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}