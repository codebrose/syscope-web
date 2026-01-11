import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Contributor } from "../OrganisationDetailsView";

function ContributorsChart({ contributors }: { contributors: Contributor[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={contributors}>
          <XAxis dataKey="login" hide />
          <Tooltip />
          <Bar dataKey="commits" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ContributorsChart;