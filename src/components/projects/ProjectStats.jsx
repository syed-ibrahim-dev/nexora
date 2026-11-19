
import { useEffect, useState } from "react";
import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  CircleDashed,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

const getProgress = (project) =>
  Math.min(100, Math.max(0, Number(project.progress) || 0));

const getProjectStatus = (project) => {
  const progress = getProgress(project);

  if (progress >= 100) return "completed";
  if (progress <= 0) return "pending";

  return "in-progress";
};

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const target = Number(value) || 0;

    let current = 0;
    let intervalId;
    let animationFrameId;

    const startAnimation = () => {
      if (target === 0) {
        setDisplayValue(0);
        return;
      }

      const increment = Math.max(1, Math.ceil(target / 20));

      intervalId = setInterval(() => {
        current = Math.min(current + increment, target);
        setDisplayValue(current);

        if (current >= target) {
          clearInterval(intervalId);
        }
      }, 30);
    };

    animationFrameId = requestAnimationFrame(startAnimation);

    return () => {
      cancelAnimationFrame(animationFrameId);

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [value]);

  return <>{displayValue}</>;
};

const ProjectStats = ({ projects = [] }) => {
  const total = projects.length;

  const completed = projects.filter(
    (project) => getProjectStatus(project) === "completed"
  ).length;

  const inProgress = projects.filter(
    (project) => getProjectStatus(project) === "in-progress"
  ).length;

  const pending = projects.filter(
    (project) => getProjectStatus(project) === "pending"
  ).length;

  const totalProgress = projects.reduce(
    (sum, project) => sum + getProgress(project),
    0
  );

  const completionRate =
    total > 0 ? Math.round(totalProgress / total) : 0;

  const stats = [
    {
      label: "Total Projects",
      value: total,
      icon: FolderKanban,
      color: "purple",
      description: "Projects in your workspace",
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
      label: "Not Started",
      value: pending,
      icon: CircleDashed,
      color: "orange",
      description: "Waiting to get started",
    },
  ];

  return (
    <section className="project-stats-section">
      <div className="project-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              className="project-stat-card"
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className={`project-stat-icon ${stat.color}`}>
                <Icon size={21} />
              </div>

              <div className="project-stat-content">
                <p>{stat.label}</p>
                <h2>
                  <AnimatedNumber value={stat.value} />
                </h2>
                <span className="project-stat-description">
                  {stat.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="project-completion-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="project-completion-info">
          <div className="project-completion-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <h3>Project Completion Rate</h3>
            <p>
              Average progress across {total}{" "}
              {total === 1 ? "project" : "projects"}
            </p>
          </div>
        </div>

        <div className="project-completion-progress">
          <div className="project-completion-track">
            <motion.div
              className="project-completion-fill"
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

export default ProjectStats;
