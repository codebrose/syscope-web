import { Building2, Plus } from "lucide-react";
import OrganisationHeader from "./OrganisationHeader";

interface Organisation {
  id: string;
  name: string;
  description?: string;
}

interface OrganisationDetailProps {
  organisation: Organisation;
}

export default function OrganisationDetail({ organisation }: OrganisationDetailProps) {
  const handleAddMember = () => {
    alert("Add member flow");
  };

  const handleAddRepo = () => {
    alert("Add repo flow");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Full width organisation header */}
      <OrganisationHeader organisation={organisation} />

      {/* Two-column layout */}
      <div className="flex gap-6 w-full">
        {/* Left column (60%) */}
        <div className="flex-1 basis-3/5">
          {/* Placeholder for left content */}
          <div className="bg-zinc-800 rounded-2xl p-6 h-full text-zinc-400 flex items-center justify-center">
            Left column content (60%)
          </div>
        </div>

        {/* Right column (40%) */}
        <div className="flex-1 basis-2/5 flex flex-col gap-6">
          {/* Top: Members */}
          <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Members</h3>
              <button
                onClick={handleAddMember}
                className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          {/* Bottom: Repos */}
          <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Repos</h3>
              <button
                onClick={handleAddRepo}
                className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
