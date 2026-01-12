import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useOrgRecentCommits } from "~/hooks/useOrgRecentCommits";

/**
 * Generates a stable color per contributor
 * (same login = same color across reloads)
 */
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

function ContributorsChart() {
  const { weeklyChartData, contributors, loading } =
    useOrgRecentCommits();

  if (loading || !weeklyChartData.length) return null;

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
              fill={stringToColor(c.login)}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ContributorsChart;
