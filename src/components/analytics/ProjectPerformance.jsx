import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProjectPerformance = ({ data }) => {
  const colors = ["#9B8CFF", "#55C6E8", "#F5A65B", "#55D6A5"];

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-heading">
        <div>
          <h3>Project Performance</h3>
          <p>Completion progress across projects</p>
        </div>

        <span className="analytics-panel-tag">Projects</span>
      </div>

      <div className="analytics-chart project-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#252d45"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#7e8aa8"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8994ae", fontSize: 11 }}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#7e8aa8"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8994ae", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "Completion"]}
              contentStyle={{
                background: "#171e35",
                border: "1px solid #343d5a",
                borderRadius: "12px",
                color: "#ffffff",
              }}
            />

            <Bar dataKey="completion" radius={[7, 7, 0, 0]} barSize={32}>
              {data.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectPerformance;