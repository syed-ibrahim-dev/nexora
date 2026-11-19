
import { useEffect, useMemo, useState } from "react";
import { CheckSquare, ListTodo } from "lucide-react";

import TaskStats from "../components/tasks/TaskStats";
import TaskToolbar from "../components/tasks/TaskToolbar";
import TaskCard from "../components/tasks/TaskCard";
import TaskModal from "../components/tasks/TaskModal";

import "./Tasks.css";

const STORAGE_KEY = "nexora_tasks_v1";
const ACTIVITY_STORAGE_KEY = "nexora_activity_v1";
const SETTINGS_STORAGE_KEY = "nexora_settings_v1";

const defaultTasks = [
  {
    id: "task-1",
    title: "Complete website homepage",
    description: "Finish the responsive homepage layout and styling.",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-11-21",
  },
  {
    id: "task-2",
    title: "Review dashboard design",
    description: "Review dashboard components and improve consistency.",
    priority: "medium",
    status: "pending",
    dueDate: "2026-11-23",
  },
  {
    id: "task-3",
    title: "Update project documentation",
    description: "Organize project notes and update documentation.",
    priority: "low",
    status: "completed",
    dueDate: "2026-11-16",
  },
  {
    id: "task-4",
    title: "Test responsive layouts",
    description: "Check mobile, tablet and desktop layouts.",
    priority: "high",
    status: "pending",
    dueDate: "2026-11-25",
  },
];

const defaultPreferences = {
  defaultPriority: "Medium",
  defaultView: "List",
  showCompleted: true,
};

const normalizePriority = (priority) => {
  const value = String(priority || "Medium").toLowerCase();

  return ["low", "medium", "high"].includes(value)
    ? value
    : "medium";
};

const readTasks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) return defaultTasks;

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : defaultTasks;
  } catch (error) {
    console.error("Unable to load tasks:", error);
    return defaultTasks;
  }
};

const readTaskPreferences = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    const taskSettings = parsed?.tasks || {};

    return {
      defaultPriority:
        taskSettings.defaultPriority ||
        defaultPreferences.defaultPriority,
      defaultView:
        taskSettings.defaultView ||
        defaultPreferences.defaultView,
      showCompleted:
        typeof taskSettings.showCompleted === "boolean"
          ? taskSettings.showCompleted
          : defaultPreferences.showCompleted,
    };
  } catch (error) {
    console.error("Unable to load task preferences:", error);
    return defaultPreferences;
  }
};

const createTaskActivity = (action, task) => {
  const activityMessages = {
    created: {
      title: "Task created",
      message: `${task.title} was added to your tasks.`,
    },
    updated: {
      title: "Task updated",
      message: `${task.title} was updated.`,
    },
    completed: {
      title: "Task completed",
      message: `${task.title} was marked as completed.`,
    },
    deleted: {
      title: "Task deleted",
      message: `${task.title} was removed from your tasks.`,
    },
  };

  const activityDetails = activityMessages[action];

  if (!activityDetails) return;

  const now = new Date().toISOString();

  const activity = {
    id: `activity-task-${task.id}-${action}-${Date.now()}`,
    type: "task",
    action,
    title: activityDetails.title,
    message: activityDetails.message,
    description: activityDetails.message,
    entityName: task.title,
    entityId: task.id,
    createdAt: now,
    date: now,
  };

  try {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const existingActivities = Array.isArray(parsed) ? parsed : [];

    const updatedActivities = [
      activity,
      ...existingActivities,
    ].slice(0, 200);

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(updatedActivities)
    );

    window.dispatchEvent(
      new CustomEvent("nexora:activity-updated")
    );
  } catch (error) {
    console.error("Unable to save task activity:", error);
  }
};

const Tasks = () => {
  const [tasks, setTasks] = useState(readTasks);
  const [preferences, setPreferences] = useState(readTaskPreferences);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Save tasks and notify other workspace modules.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

      window.dispatchEvent(
        new CustomEvent("nexora:tasks-updated")
      );
    } catch (error) {
      console.error("Unable to save tasks:", error);
    }
  }, [tasks]);

  // Keep task preferences synchronized with Settings.
  useEffect(() => {
    const syncPreferences = () => {
      setPreferences(readTaskPreferences());
    };

    window.addEventListener(
      "nexora:settings-updated",
      syncPreferences
    );

    window.addEventListener("storage", syncPreferences);

    return () => {
      window.removeEventListener(
        "nexora:settings-updated",
        syncPreferences
      );

      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  // Search, filter and apply the Show Completed preference.
  const filteredTasks = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const title = String(task.title || "").toLowerCase();
      const description = String(task.description || "").toLowerCase();

      const matchesSearch =
        title.includes(searchText) ||
        description.includes(searchText);

      const matchesStatus =
        filter === "all" || task.status === filter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      const matchesVisibility =
        preferences.showCompleted ||
        task.status !== "completed";

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesVisibility
      );
    });
  }, [
    tasks,
    search,
    filter,
    priorityFilter,
    preferences.showCompleted,
  ]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const saveTask = (formData) => {
    const cleanTask = {
      ...formData,
      title: String(formData.title || "").trim(),
      description: String(formData.description || "").trim(),
    };

    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        ...cleanTask,
      };

      const wasCompleted = editingTask.status === "completed";
      const isNowCompleted = updatedTask.status === "completed";

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id ? updatedTask : task
        )
      );

      if (!wasCompleted && isNowCompleted) {
        createTaskActivity("completed", updatedTask);
      } else {
        createTaskActivity("updated", updatedTask);
      }
    } else {
      const newTask = {
        ...cleanTask,
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `task-${Date.now()}`,
      };

      setTasks((currentTasks) => [
        newTask,
        ...currentTasks,
      ]);

      createTaskActivity("created", newTask);
    }

    closeModal();
  };

  const deleteTask = (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    setTasks((currentTasks) =>
      currentTasks.filter((item) => item.id !== task.id)
    );

    createTaskActivity("deleted", task);
  };

  const updateTaskStatus = (taskId, status) => {
    const currentTask = tasks.find(
      (task) => task.id === taskId
    );

    if (!currentTask || currentTask.status === status) return;

    const updatedTask = {
      ...currentTask,
      status,
    };

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? updatedTask : task
      )
    );

    if (status === "completed") {
      createTaskActivity("completed", updatedTask);
    } else {
      createTaskActivity("updated", updatedTask);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setPriorityFilter("all");
  };

  const hasActiveFilters =
    search || filter !== "all" || priorityFilter !== "all";

  const taskView =
    String(preferences.defaultView).toLowerCase() === "grid"
      ? "grid"
      : "list";

  return (
    <div className="tasks-page">
      <header className="tasks-page-header">
        <div>
          <span className="tasks-eyebrow">WORKSPACE / TASKS</span>
          <h1>Tasks</h1>
          <p>
            Plan your day, prioritize your work, and stay on track.
          </p>
        </div>

        <div className="tasks-header-icon">
          <CheckSquare size={25} />
        </div>
      </header>

      <TaskStats tasks={tasks} />

      <section className="tasks-list-section">
        <div className="tasks-section-heading">
          <div>
            <h2>All Tasks</h2>
            <p>
              Manage your tasks and track what needs to be done.
            </p>
          </div>

          <span className="tasks-count">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <TaskToolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onAdd={openCreateModal}
        />

        {filteredTasks.length > 0 ? (
          <div
            className={`tasks-grid ${
              taskView === "list" ? "tasks-list-view" : "tasks-grid-view"
            }`}
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={deleteTask}
                onStatusChange={updateTaskStatus}
              />
            ))}
          </div>
        ) : (
          <div className="tasks-empty-state">
            <div className="tasks-empty-icon">
              <ListTodo size={28} />
            </div>

            <h3>No tasks found</h3>

            <p>
              {hasActiveFilters
                ? "Try changing your search or filters."
                : !preferences.showCompleted && tasks.length > 0
                  ? "There are no active tasks to display. You can show completed tasks in Settings."
                  : "Create your first task to get started."}
            </p>

            <button
              type="button"
              onClick={
                hasActiveFilters
                  ? clearFilters
                  : openCreateModal
              }
            >
              {hasActiveFilters
                ? "Clear search and filters"
                : "Create your first task"}
            </button>
          </div>
        )}
      </section>

      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        defaultPriority={normalizePriority(preferences.defaultPriority)}
        onClose={closeModal}
        onSave={saveTask}
      />
    </div>
  );
};

export default Tasks;
