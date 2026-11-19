import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProductivityChart = ({ data }) => {
  return (
    <div className="analytics-panel productivity-panel">
      <div className="analytics-panel-heading">
        <div>
         <h3>Task Completion</h3>
        <p>Your current focus task completion rate</p>
        </div>

        <span className="analytics-panel-tag">Activity</span>
      </div>

      <div className="analytics-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9B8CFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9B8CFF" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#252d45"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke="#7e8aa8"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8994ae", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              stroke="#7e8aa8"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8994ae", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                background: "#171e35",
                border: "1px solid #343d5a",
                borderRadius: "12px",
                color: "#ffffff",
              }}
            />

            <Area
              type="monotone"
              dataKey="productivity"
              stroke="#9B8CFF"
              strokeWidth={3}
              fill="url(#productivityGradient)"
              activeDot={{ r: 6, fill: "#9B8CFF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityChart;