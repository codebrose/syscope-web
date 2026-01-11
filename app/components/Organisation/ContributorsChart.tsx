import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useOrgRecentCommits } from "~/hooks/useOrgRecentCommits";

function ContributorsChart() {
  const { weeklyChartData, contributors, loading } =
    useOrgRecentCommits();

  if (loading) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyChartData}>
          <XAxis dataKey="week" />
          <Tooltip />
          <Legend />

          {contributors.map((c) => (
            <Bar
              key={c.login}
              dataKey={c.login}
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ContributorsChart;
