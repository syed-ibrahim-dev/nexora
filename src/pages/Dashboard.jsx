
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  MoreHorizontal,
  Plus,
  CalendarDays,
  Circle,
  Activity,
  Sparkles,
  X,
  Pencil,
  Trash2,
  Save,
  Target
} from "lucide-react";

const PROJECT_STORAGE_KEY = "nexora_projects_v1";
const TASK_STORAGE_KEY = "nexora_tasks_v1";
const ACTIVITY_STORAGE_KEY = "nexora_activity_v1";

const initialProjects = [
  {
    id: "project-1",
    name: "Website Redesign",
    category: "Design & Development",
    progress: 85,
    color: "purple",
    date: "2026-11-24"
  },
  {
    id: "project-2",
    name: "Mobile App Concept",
    category: "Product Design",
    progress: 62,
    color: "cyan",
    date: "2026-11-28"
  },
  {
    id: "project-3",
    name: "Marketing Strategy",
    category: "Marketing",
    progress: 38,
    color: "orange",
    date: "2026-12-05"
  }
];

const initialTasks = [
  {
    id: "task-1",
    title: "Complete website homepage",
    description: "Finish the responsive homepage layout and styling.",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-11-21"
  },
  {
    id: "task-2",
    title: "Review dashboard design",
    description: "Review dashboard components and improve consistency.",
    priority: "medium",
    status: "pending",
    dueDate: "2026-11-23"
  },
  {
    id: "task-3",
    title: "Update project documentation",
    description: "Organize project notes and update documentation.",
    priority: "low",
    status: "completed",
    dueDate: "2026-11-16"
  },
  {
    id: "task-4",
    title: "Test responsive layouts",
    description: "Check mobile, tablet and desktop layouts.",
    priority: "high",
    status: "pending",
    dueDate: "2026-11-25"
  }
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (saved === null) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function dispatchWorkspaceUpdate(eventName) {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: { source: "dashboard" }
    })
  );
}

// Generate unique IDs without using Date.now().
function createUniqueId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${new Date().getTime()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function formatDate(date) {
  if (!date) return "No deadline";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No deadline";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function getProjectStatus(progress) {
  const value = Number(progress) || 0;

  if (value >= 100) return "completed";
  if (value <= 0) return "pending";

  return "in-progress";
}

function formatActivityTime(activity) {
  if (activity.time && !activity.createdAt) {
    return activity.time;
  }

  const dateValue = activity.createdAt || activity.date;

  if (!dateValue) return "Recently";

  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) return "Recently";

  const difference = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days} days ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function Dashboard() {
  const [projects, setProjects] = useState(() =>
    readStorage(PROJECT_STORAGE_KEY, initialProjects)
  );

  const [tasks, setTasks] = useState(() =>
    readStorage(TASK_STORAGE_KEY, initialTasks)
  );

  const [activities, setActivities] = useState(() =>
    readStorage(ACTIVITY_STORAGE_KEY, [])
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    progress: 0,
    date: "",
    color: "purple"
  });

  const [formError, setFormError] = useState("");

  // Save project changes and notify the other modules.
  useEffect(() => {
    try {
      localStorage.setItem(
        PROJECT_STORAGE_KEY,
        JSON.stringify(projects)
      );

      dispatchWorkspaceUpdate("nexora:projects-updated");
    } catch (error) {
      console.error("Unable to save projects:", error);
    }
  }, [projects]);

  // Save task changes and notify the other modules.
  useEffect(() => {
    try {
      localStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(tasks)
      );

      dispatchWorkspaceUpdate("nexora:tasks-updated");
    } catch (error) {
      console.error("Unable to save tasks:", error);
    }
  }, [tasks]);

  // Save activity history and notify the other modules.
  useEffect(() => {
    try {
      localStorage.setItem(
        ACTIVITY_STORAGE_KEY,
        JSON.stringify(activities)
      );

      dispatchWorkspaceUpdate("nexora:activity-updated");
    } catch (error) {
      console.error("Unable to save activity:", error);
    }
  }, [activities]);

  // Synchronize information when other modules update their data.
  useEffect(() => {
    const syncProjects = (event) => {
      if (event?.detail?.source === "dashboard") return;

      setProjects(
        readStorage(PROJECT_STORAGE_KEY, initialProjects)
      );
    };

    const syncTasks = (event) => {
      if (event?.detail?.source === "dashboard") return;

      setTasks(
        readStorage(TASK_STORAGE_KEY, initialTasks)
      );
    };

    const syncActivities = (event) => {
      if (event?.detail?.source === "dashboard") return;

      setActivities(
        readStorage(ACTIVITY_STORAGE_KEY, [])
      );
    };

    const handleStorageChange = (event) => {
      if (!event.key || event.key === PROJECT_STORAGE_KEY) {
        syncProjects();
      }

      if (!event.key || event.key === TASK_STORAGE_KEY) {
        syncTasks();
      }

      if (!event.key || event.key === ACTIVITY_STORAGE_KEY) {
        syncActivities();
      }
    };

    window.addEventListener(
      "nexora:projects-updated",
      syncProjects
    );

    window.addEventListener(
      "nexora:tasks-updated",
      syncTasks
    );

    window.addEventListener(
      "nexora:activity-updated",
      syncActivities
    );

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "nexora:projects-updated",
        syncProjects
      );

      window.removeEventListener(
        "nexora:tasks-updated",
        syncTasks
      );

      window.removeEventListener(
        "nexora:activity-updated",
        syncActivities
      );

      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Greeting based on the current time.
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  // PROJECT STATISTICS
  const completedProjects = projects.filter(
    project => getProjectStatus(project.progress) === "completed"
  ).length;

  const inProgressProjects = projects.filter(
    project => getProjectStatus(project.progress) === "in-progress"
  ).length;

  const notStartedProjects = projects.filter(
    project => getProjectStatus(project.progress) === "pending"
  ).length;

  // TASK STATISTICS
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

  const stats = [
    {
      title: "Total Projects",
      value: String(projects.length).padStart(2, "0"),
      change: "Workspace",
      description: "Projects in your workspace",
      icon: FolderKanban,
      className: "purple"
    },
    {
      title: "Completed Projects",
      value: String(completedProjects).padStart(2, "0"),
      change: "Completed",
      description: "Projects finished successfully",
      icon: CheckCircle2,
      className: "cyan"
    },
    {
      title: "In Progress Projects",
      value: String(inProgressProjects).padStart(2, "0"),
      change: "Ongoing",
      description: "Projects currently underway",
      icon: TrendingUp,
      className: "green"
    },
    {
      title: "Not Started Projects",
      value: String(notStartedProjects).padStart(2, "0"),
      change: "Not started",
      description: "Projects waiting to begin",
      icon: Clock3,
      className: "orange"
    },
    {
      title: "Completed Tasks",
      value: String(completedTasks).padStart(2, "0"),
      change: "Completed",
      description: "Tasks marked as completed",
      icon: CheckCircle2,
      className: "cyan"
    },
    {
      title: "In Progress Tasks",
      value: String(inProgressTasks).padStart(2, "0"),
      change: "Ongoing",
      description: "Tasks currently in progress",
      icon: Activity,
      className: "green"
    },
    {
      title: "Pending Tasks",
      value: String(pendingTasks).padStart(2, "0"),
      change: "Remaining",
      description: "Tasks waiting to be started",
      icon: Clock3,
      className: "orange"
    },
    {
      title: "Productivity",
      value: `${productivity}%`,
      change: "Task progress",
      description: "Based on completed workspace tasks",
      icon: TrendingUp,
      className: "purple"
    }
  ];

  const recentProjects = useMemo(
    () => projects.slice(0, 5),
    [projects]
  );

  const recentActivities = useMemo(
    () => activities.slice(0, 5),
    [activities]
  );

  // Add an entry to the shared activity history.
  function addActivity(title, message, color = "purple", type = "project") {
    const now = new Date().toISOString();

    const newActivity = {
      id: createUniqueId("activity-dashboard"),
      type,
      title,
      message,
      description: message,
      entityName: title,
      color,
      createdAt: now,
      date: now
    };

    setActivities(previous => [
      newActivity,
      ...previous
    ].slice(0, 200));
  }

  function openCreateModal() {
    setEditingId(null);
    setFormError("");

    setFormData({
      name: "",
      category: "",
      progress: 0,
      date: "",
      color: "purple"
    });

    setModalOpen(true);
  }

  function openEditModal(project) {
    setEditingId(project.id);
    setFormError("");

    setFormData({
      name: project.name || "",
      category: project.category || "",
      progress: Number(project.progress) || 0,
      date: project.date || "",
      color: project.color || "purple"
    });

    setModalOpen(true);
    setActiveMenu(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.category.trim()) {
      setFormError("Please enter a project name and category.");
      return;
    }

    const cleanProject = {
      ...formData,
      name: formData.name.trim(),
      category: formData.category.trim(),
      progress: Math.min(
        100,
        Math.max(0, Number(formData.progress) || 0)
      )
    };

    if (editingId) {
      setProjects(previous =>
        previous.map(project =>
          project.id === editingId
            ? {
                ...project,
                ...cleanProject,
                updatedAt: new Date().toISOString()
              }
            : project
        )
      );

      addActivity(
        "Project updated",
        `${cleanProject.name} was updated.`,
        cleanProject.color
      );
    } else {
      const newProject = {
        id: createUniqueId("project"),
        ...cleanProject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setProjects(previous => [
        newProject,
        ...previous
      ]);

      addActivity(
        "Project created",
        `${newProject.name} was added to your workspace.`,
        newProject.color
      );
    }

    setModalOpen(false);
    setEditingId(null);
  }

  function deleteProject(project) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setProjects(previous =>
      previous.filter(item => item.id !== project.id)
    );

    addActivity(
      "Project deleted",
      `${project.name} was removed from your workspace.`,
      "orange"
    );

    setActiveMenu(null);
  }

  function updateProgress(project, value) {
    const progress = Math.min(
      100,
      Math.max(0, Number(value) || 0)
    );

    const previousStatus = getProjectStatus(project.progress);
    const nextStatus = getProjectStatus(progress);

    setProjects(previous =>
      previous.map(item =>
        item.id === project.id
          ? {
              ...item,
              progress,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );

    if (previousStatus !== "completed" && nextStatus === "completed") {
      addActivity(
        "Project completed",
        `${project.name} was marked as completed.`,
        "green"
      );
    }
  }

  // Quick task controls use the same status values as the Tasks page.
  function toggleTask(task) {
    const nextStatus =
      task.status === "completed" ? "pending" : "completed";

    const updatedTask = {
      ...task,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    setTasks(previous =>
      previous.map(item =>
        item.id === task.id ? updatedTask : item
      )
    );

    addActivity(
      nextStatus === "completed" ? "Task completed" : "Task reopened",
      nextStatus === "completed"
        ? `${task.title} was marked as completed.`
        : `${task.title} was moved back to pending.`,
      nextStatus === "completed" ? "green" : "orange",
      "task"
    );
  }

  return (
    <motion.div
      className="dashboard-page animate-fade"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* WELCOME */}

      <section className="welcome-section">
        <div>
          <div className="welcome-label">
            <Sparkles size={15} />
            YOUR PERSONAL WORKSPACE
          </div>

          <h1>
            {greeting}, <span className="gradient-text">Ibrahim.</span>
          </h1>

          <p>
            Here's what's happening with your workspace today.
            Let's make it productive.
          </p>
        </div>

        <button className="primary-button" onClick={openCreateModal}>
          <Plus size={18} />
          Create New Project
        </button>
      </section>

      {/* STATISTICS */}

      <section className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.article
              key={stat.title}
              className="stat-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 4) * 0.07 }}
              whileHover={{ y: -6, rotateX: 2 }}
            >
              <div className="stat-card-top">
                <div className={`stat-icon ${stat.className}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="stat-title">{stat.title}</p>

              <div className="stat-value-row">
                <h2>{stat.value}</h2>

                <span className="stat-change">
                  <ArrowUpRight size={14} />
                  {stat.change}
                </span>
              </div>

              <span className="stat-description">
                {stat.description}
              </span>
            </motion.article>
          );
        })}
      </section>

      {/* PROJECTS AND ACTIVITY */}

      <section className="dashboard-content-grid">
        <div className="content-panel glass-card projects-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Projects</h3>
              <p>Manage and track your ongoing work.</p>
            </div>

            <button className="text-button" onClick={openCreateModal}>
              New project <Plus size={15} />
            </button>
          </div>

          <div className="project-list">
            {recentProjects.length === 0 ? (
              <div className="empty-projects">
                <FolderKanban size={30} />
                <strong>No projects yet</strong>
                <span>Create your first project to get started.</span>
              </div>
            ) : (
              recentProjects.map((project, index) => (
                <motion.div
                  className="project-item"
                  key={project.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                >
                  <div className={`project-avatar ${project.color || "purple"}`}>
                    {(project.name || "PR").slice(0, 2).toUpperCase()}
                  </div>

                  <div className="project-info">
                    <strong>{project.name}</strong>
                    <span>{project.category}</span>
                  </div>

                  <div className="project-progress">
                    <div className="progress-label">
                      <span>{Number(project.progress) || 0}%</span>
                    </div>

                    <input
                      className="project-progress-input"
                      type="range"
                      min="0"
                      max="100"
                      value={Number(project.progress) || 0}
                      aria-label={`Progress for ${project.name}`}
                      onChange={event =>
                        updateProgress(project, event.target.value)
                      }
                    />

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${project.color || "purple"}`}
                        style={{
                          width: `${Number(project.progress) || 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="project-date">
                    <CalendarDays size={14} />
                    {formatDate(project.date)}
                  </div>

                  <div className="project-actions">
                    <button
                      className="more-button"
                      aria-label={`Project options for ${project.name}`}
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === project.id ? null : project.id
                        )
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    <AnimatePresence>
                      {activeMenu === project.id && (
                        <motion.div
                          className="project-action-menu"
                          initial={{ opacity: 0, y: -5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5 }}
                        >
                          <button onClick={() => openEditModal(project)}>
                            <Pencil size={14} /> Edit project
                          </button>

                          <button
                            className="delete-action"
                            onClick={() => deleteProject(project)}
                          >
                            <Trash2 size={14} /> Delete project
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <button className="add-project-button" onClick={openCreateModal}>
            <Plus size={17} />
            Add another project
          </button>
        </div>

        <div className="content-panel glass-card activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Activity</h3>
              <p>Your latest workspace updates.</p>
            </div>

            <Activity size={19} color="var(--accent-primary)" />
          </div>

          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div className="activity-item" key={activity.id}>
                  <div className={`activity-indicator ${activity.color || "purple"}`}>
                    <Activity size={16} />
                  </div>

                  <div className="activity-info">
                    <strong>{activity.title || "Workspace update"}</strong>
                    <span>
                      {activity.message ||
                        activity.description ||
                        activity.action ||
                        "Workspace activity"}
                    </span>
                    <small>{formatActivityTime(activity)}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-projects">
                <Activity size={26} />
                <strong>No recent activity</strong>
                <span>Your workspace updates will appear here.</span>
              </div>
            )}
          </div>

          <div className="activity-footer">
            Workspace activity history <ArrowRight size={15} />
          </div>
        </div>
      </section>

      {/* PRODUCTIVITY AND TASKS */}

      <section className="bottom-dashboard-grid">
        <div className="focus-card glass-card">
          <div className="focus-content">
            <span className="focus-tag">
              <Sparkles size={14} /> PRODUCTIVITY INSIGHT
            </span>

            <h3>Small steps create extraordinary results.</h3>

            <p>
              Stay consistent, keep your priorities clear and
              celebrate every milestone along the way.
            </p>

            <span className="focus-button">
              Your productivity is {productivity}% <ArrowRight size={16} />
            </span>
          </div>

          <div className="focus-decoration">
            <div className="focus-orbit orbit-one" />
            <div className="focus-orbit orbit-two" />
            <div className="focus-orbit orbit-three" />
            <div className="focus-center">
              <Sparkles size={36} />
            </div>
          </div>
        </div>

        <div className="quick-task-card glass-card">
          <div className="panel-heading">
            <div>
              <h3>Today's Focus</h3>
              <p>Your daily priorities.</p>
            </div>

            <span className="focus-count">
              {String(pendingTasks + inProgressTasks).padStart(2, "0")}
            </span>
          </div>

          <div className="quick-task-list">
            {tasks.length > 0 ? (
              tasks.slice(0, 5).map(task => (
                <button
                  className={`quick-task ${
                    task.status === "completed" ? "task-completed" : ""
                  }`}
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  title={
                    task.status === "completed"
                      ? "Click to move back to pending"
                      : "Click to mark as completed"
                  }
                >
                  {task.status === "completed"
                    ? <CheckCircle2 size={17} />
                    : <Circle size={17} />
                  }

                  <span>{task.title}</span>
                </button>
              ))
            ) : (
              <div className="empty-projects">
                <CheckCircle2 size={25} />
                <strong>No tasks yet</strong>
                <span>Add tasks from the Tasks section.</span>
              </div>
            )}
          </div>

          <div className="task-progress-summary">
            <div className="task-progress-heading">
              <span>Daily completion</span>
              <strong>{productivity}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill purple"
                style={{ width: `${productivity}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>© 2026 NEXORA. Crafted for productivity.</span>
        <span>Designed with purpose <Sparkles size={13} /></span>
      </footer>

      {/* CREATE / EDIT PROJECT MODAL */}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="project-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={event => {
              if (event.target === event.currentTarget) {
                setModalOpen(false);
              }
            }}
          >
            <motion.div
              className="project-modal glass-card"
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
            >
              <div className="modal-heading">
                <div>
                  <span className="modal-eyebrow">
                    <Target size={14} /> NEXORA WORKSPACE
                  </span>

                  <h2 id="project-modal-title">
                    {editingId ? "Edit project" : "Create a project"}
                  </h2>

                  <p>
                    Organize your ideas and keep your work moving.
                  </p>
                </div>

                <button
                  className="modal-close-button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="modal-field">
                  Project name
                  <input
                    type="text"
                    placeholder="e.g. Portfolio Website"
                    value={formData.name}
                    onChange={event =>
                      setFormData({
                        ...formData,
                        name: event.target.value
                      })
                    }
                    autoFocus
                  />
                </label>

                <label className="modal-field">
                  Category
                  <input
                    type="text"
                    placeholder="e.g. Web Development"
                    value={formData.category}
                    onChange={event =>
                      setFormData({
                        ...formData,
                        category: event.target.value
                      })
                    }
                  />
                </label>

                <div className="modal-form-row">
                  <label className="modal-field">
                    Deadline
                    <input
                      type="date"
                      value={formData.date}
                      onChange={event =>
                        setFormData({
                          ...formData,
                          date: event.target.value
                        })
                      }
                    />
                  </label>

                  <label className="modal-field">
                    Progress (%)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={event =>
                        setFormData({
                          ...formData,
                          progress: Math.min(
                            100,
                            Math.max(0, Number(event.target.value))
                          )
                        })
                      }
                    />
                  </label>
                </div>

                <div className="modal-field">
                  Project accent

                  <div className="color-options">
                    {["purple", "cyan", "orange"].map(color => (
                      <button
                        type="button"
                        key={color}
                        className={`color-option ${color} ${
                          formData.color === color ? "selected" : ""
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, color })
                        }
                        aria-label={`${color} project accent`}
                        aria-pressed={formData.color === color}
                      />
                    ))}
                  </div>
                </div>

                {formError && (
                  <p className="form-error">{formError}</p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary-button">
                    <Save size={16} />
                    {editingId ? "Save changes" : "Create project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Dashboard;
