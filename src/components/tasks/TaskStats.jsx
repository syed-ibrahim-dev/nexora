
import { motion } from "motion/react";
import {
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

const TaskStats = ({ tasks = [] }) => {
  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  const stats = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListTodo,
      color: "purple",
      description: "Tasks in your workspace",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock3,
      color: "cyan",
      description: "Currently being worked on",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "green",
      description: "Successfully finished",
    },
    {
      label: "Pending",
      value: pending,
      icon: AlertCircle,
      color: "orange",
      description: "Waiting to get started",
    },
  ];

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="task-stats-section">
      <div className="task-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              className="task-stat-card"
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className={`task-stat-icon ${stat.color}`}>
                <Icon size={21} />
              </div>

              <div className="task-stat-content">
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
                <span>{stat.description}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="task-completion-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="task-completion-info">
          <div className="task-completion-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <h3>Task Completion Rate</h3>
            <p>{completed} of {total} tasks completed</p>
          </div>
        </div>

        <div className="task-completion-progress">
          <div className="task-completion-track">
            <motion.div
              className="task-completion-fill"
              initial={false}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <strong>{completionRate}%</strong>
        </div>
      </motion.div>
    </section>
  );
};

export default TaskStats;
