
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsStats from "../components/analytics/AnalyticsStats";

const ProductivityChart = lazy(() =>
  import("../components/analytics/ProductivityChart")
);

const ProjectPerformance = lazy(() =>
  import("../components/analytics/ProjectPerformance")
);

const TaskOverview = lazy(() =>
  import("../components/analytics/TaskOverview")
);

const PROJECT_KEY = "nexora_projects_v1";
const TASK_KEY = "nexora_tasks_v1";

function readStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const ChartLoader = ({ className = "" }) => (
  <div className={`analytics-panel analytics-loading-panel ${className}`}>
    <span className="analytics-loading-dot" />
    Loading chart...
  </div>
);

const Analytics = () => {
  const [projects, setProjects] = useState(() =>
    readStorage(PROJECT_KEY)
  );

  const [tasks, setTasks] = useState(() =>
    readStorage(TASK_KEY)
  );

  useEffect(() => {
    function refreshAnalytics() {
      setProjects(readStorage(PROJECT_KEY));
      setTasks(readStorage(TASK_KEY));
    }

    window.addEventListener("storage", refreshAnalytics);
    window.addEventListener("nexora:projects-updated", refreshAnalytics);
    window.addEventListener("nexora:tasks-updated", refreshAnalytics);
    window.addEventListener("nexora:activity-updated", refreshAnalytics);

    return () => {
      window.removeEventListener("storage", refreshAnalytics);
      window.removeEventListener("nexora:projects-updated", refreshAnalytics);
      window.removeEventListener("nexora:tasks-updated", refreshAnalytics);
      window.removeEventListener("nexora:activity-updated", refreshAnalytics);
    };
  }, []);

  const completedTasks = tasks.filter(
    task => task.status === "completed"
  ).length;

  const inProgressTasks = tasks.filter(
    task => task.status === "in-progress"
  ).length;

  const pendingTasks = tasks.filter(
    task => task.status === "pending"
  ).length;

  const productivity = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const completedProjects = projects.filter(
    project => Number(project.progress) >= 100
  ).length;

  const averageProgress = projects.length
    ? Math.round(
        projects.reduce(
          (total, project) =>
            total + Math.min(100, Math.max(0, Number(project.progress) || 0)),
          0
        ) / projects.length
      )
    : 0;

  const stats = [
    {
      title: "Total Projects",
      value: String(projects.length).padStart(2, "0"),
      change: "Live data",
      description: "Projects in your workspace",
      icon: "▣"
    },
    {
      title: "Completed Tasks",
      value: String(completedTasks).padStart(2, "0"),
      change: "Live data",
      description: "Your completed tasks",
      icon: "✓"
    },
    {
      title: "Pending Tasks",
      value: String(pendingTasks).padStart(2, "0"),
      change: "Live data",
      description: "Tasks awaiting completion",
      icon: "◷"
    },
    {
      title: "Productivity",
      value: `${productivity}%`,
      change: "Live data",
      description: "Based on completed tasks",
      icon: "↗"
    }
  ];

  const projectData = useMemo(
    () =>
      projects.map(project => ({
        name: project.name,
        completion: Math.min(
          100,
          Math.max(0, Number(project.progress) || 0)
        )
      })),
    [projects]
  );

  const taskData = [
    { name: "Completed", value: completedTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "Pending", value: pendingTasks }
  ].filter(item => item.value > 0);

  const productivityData = [
    {
      label: "Current",
      productivity
    }
  ];

  return (
    <div className="analytics-page">
      <style>{`
        .analytics-page {
          padding: 30px;
          color: #eef0ff;
          min-height: 100vh;
          background: #0c1224;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .analytics-header h1 {
          font-size: 28px;
          margin: 0 0 8px;
        }

        .analytics-header p {
          color: #8994ae;
          margin: 0;
          font-size: 14px;
        }

        .analytics-live-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #55d6a5;
          background: rgba(85, 214, 165, 0.1);
          border: 1px solid rgba(85, 214, 165, 0.2);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12px;
        }

        .analytics-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #55d6a5;
        }

        .analytics-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .analytics-stat-card,
        .analytics-panel {
          background: linear-gradient(145deg, #171e35, #131a2e);
          border: 1px solid #252d45;
          border-radius: 16px;
        }

        .analytics-stat-card {
          padding: 21px;
          min-width: 0;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .analytics-stat-card:hover {
          transform: translateY(-4px);
          border-color: #8069e8;
        }

        .analytics-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .analytics-stat-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(155, 140, 255, 0.14);
          color: #b5a9ff;
          font-size: 21px;
        }

        .analytics-stat-change {
          color: #55d6a5;
          font-size: 11px;
          background: rgba(85, 214, 165, 0.1);
          padding: 6px 9px;
          border-radius: 20px;
        }

        .analytics-stat-title {
          color: #929db8;
          font-size: 13px;
          margin: 0 0 9px;
        }

        .analytics-stat-card h2 {
          font-size: 27px;
          margin: 0 0 8px;
          color: #ffffff;
        }

        .analytics-stat-description {
          color: #75819f;
          font-size: 12px;
          margin: 0;
        }

        .analytics-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .analytics-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 1fr);
          gap: 20px;
        }

        .analytics-panel {
          padding: 22px;
          min-width: 0;
        }

        .analytics-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 22px;
        }

        .analytics-panel-heading h3 {
          color: #ffffff;
          font-size: 16px;
          margin: 0 0 7px;
        }

        .analytics-panel-heading p {
          color: #8490aa;
          font-size: 12px;
          margin: 0;
        }

        .analytics-panel-tag {
          color: #b5a9ff;
          background: rgba(155, 140, 255, 0.12);
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 11px;
          white-space: nowrap;
        }

        .analytics-chart {
          height: 270px;
          width: 100%;
        }

        .project-chart {
          height: 250px;
        }

        .task-overview-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 250px;
        }

        .task-donut {
          width: 190px;
          height: 190px;
          position: relative;
          flex-shrink: 0;
        }

        .task-donut-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          pointer-events: none;
        }

        .task-donut-center strong {
          font-size: 25px;
          color: #ffffff;
        }

        .task-donut-center span {
          color: #8994ae;
          font-size: 11px;
          margin-top: 4px;
        }

        .task-legend {
          display: flex;
          flex-direction: column;
          gap: 17px;
          min-width: 110px;
        }

        .task-legend-item,
        .task-legend-label {
          display: flex;
          align-items: center;
        }

        .task-legend-item {
          justify-content: space-between;
          gap: 12px;
          color: #ffffff;
          font-size: 12px;
        }

        .task-legend-label {
          gap: 8px;
          color: #aab3c9;
        }

        .task-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .task-legend-item strong {
          color: #ffffff;
        }

        .performance-highlight {
          padding: 20px 0;
        }

        .performance-highlight h2 {
          color: #9b8cff;
          font-size: 38px;
          margin: 0 0 8px;
        }

        .performance-highlight p {
          color: #ffffff;
          font-size: 14px;
          margin: 0 0 8px;
        }

        .performance-highlight span {
          color: #8994ae;
          font-size: 12px;
          line-height: 1.6;
        }

        .analytics-empty {
          color: #8994ae;
          text-align: center;
          padding: 35px 10px;
          font-size: 13px;
        }

        .analytics-loading-panel {
          min-height: 340px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #8994ae;
          font-size: 13px;
        }

        .analytics-loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9b8cff;
          animation: analyticsLoadingPulse 1s ease-in-out infinite;
        }

        @keyframes analyticsLoadingPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .analytics-project-loading {
          min-height: 320px;
        }

        @media (max-width: 1100px) {
          .analytics-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .analytics-main-grid,
          .analytics-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .analytics-page {
            padding: 18px 14px;
          }

          .analytics-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .analytics-header h1 {
            font-size: 23px;
          }

          .analytics-stats-grid {
            gap: 11px;
          }

          .analytics-stat-card {
            padding: 15px;
          }

          .analytics-stat-card h2 {
            font-size: 22px;
          }

          .analytics-panel {
            padding: 17px 13px;
          }

          .task-overview-content {
            flex-direction: column;
            padding: 10px 0;
          }

          .task-legend {
            width: 100%;
            max-width: 220px;
          }
        }
      `}</style>

      <motion.div
        className="analytics-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>Analytics Overview</h1>
          <p>Insights from your actual NEXORA workspace data.</p>
        </div>

        <div className="analytics-live-label">
          <span className="analytics-live-dot" />
          Workspace data
        </div>
      </motion.div>

      <AnalyticsStats stats={stats} />

      <div className="analytics-main-grid">
        <Suspense fallback={<ChartLoader />}>
          <ProductivityChart data={productivityData} />
        </Suspense>

        <Suspense fallback={<ChartLoader />}>
          <TaskOverview data={taskData} />
        </Suspense>
      </div>

      <div className="analytics-bottom-grid">
        <Suspense
          fallback={<ChartLoader className="analytics-project-loading" />}
        >
          <ProjectPerformance data={projectData} />
        </Suspense>

        <div className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Performance Highlights</h3>
              <p>Your current workspace progress</p>
            </div>
          </div>

          <div className="performance-highlight">
            <h2>{averageProgress}%</h2>
            <p>Average project completion</p>
            <span>
              {completedProjects} of {projects.length} projects completed.
            </span>
          </div>

          <div className="performance-highlight">
            <h2>{productivity}%</h2>
            <p>Task completion rate</p>
            <span>
              {completedTasks} completed out of {tasks.length} tasks.
            </span>
          </div>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="analytics-panel analytics-empty">
          No projects found. Create a project from your Overview page.
        </div>
      )}
    </div>
  );
};

export default Analytics;
