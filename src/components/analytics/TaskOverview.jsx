import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const TaskOverview = ({ data }) => {
  const colors = ["#55D6A5", "#9B8CFF", "#F5A65B"];

  const totalTasks = data.reduce((total, item) => total + item.value, 0);

  return (
    <div className="analytics-panel task-overview-panel">
      <div className="analytics-panel-heading">
        <div>
          <h3>Task Overview</h3>
          <p>Distribution of your tasks</p>
        </div>

        <span className="analytics-panel-tag">Tasks</span>
      </div>

      <div className="task-overview-content">
        <div className="task-donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={4}
                stroke="none"
              >
                {data.map((item, index) => (
                  <Cell
                    key={item.name}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#171e35",
                  border: "1px solid #343d5a",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="task-donut-center">
            <strong>{totalTasks}</strong>
            <span>Total Tasks</span>
          </div>
        </div>

        <div className="task-legend">
          {data.map((item, index) => (
            <div className="task-legend-item" key={item.name}>
              <div className="task-legend-label">
                <span
                  className="task-legend-dot"
                  style={{ background: colors[index % colors.length] }}
                />
                <span>{item.name}</span>
              </div>

              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;