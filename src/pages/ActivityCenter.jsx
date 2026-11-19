
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  NotebookPen,
  Search,
  Trash2,
  Clock3,
  CheckCircle2,
  Pencil,
  Plus,
  Pin,
  PinOff,
  Sparkles,
  Filter,
  X
} from "lucide-react";

import "./ActivityCenter.css";

const STORAGE_KEY = "nexora_activity_v1";

const filters = [
  { label: "All Activity", value: "all", icon: Activity },
  { label: "Projects", value: "project", icon: FolderKanban },
  { label: "Tasks", value: "task", icon: CheckSquare },
  { label: "Calendar", value: "calendar", icon: CalendarDays },
  { label: "Notes", value: "note", icon: NotebookPen }
];

const moduleIcons = {
  project: FolderKanban,
  task: CheckSquare,
  calendar: CalendarDays,
  note: NotebookPen,
  workspace: Sparkles
};

const moduleLabels = {
  project: "Project",
  task: "Task",
  calendar: "Calendar",
  note: "Note",
  workspace: "Workspace"
};

function readActivities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* =========================================
   ACTIVITY NORMALIZATION
========================================= */

function normalizeActivity(activity, index) {
  const originalAction = String(activity.action || "").toLowerCase();

  let type = activity.type;

  // Support older activity records.
  if (!type) {
    if (originalAction.includes("project")) {
      type = "project";
    } else if (originalAction.includes("task")) {
      type = "task";
    } else if (originalAction.includes("calendar") || originalAction.includes("event")) {
      type = "calendar";
    } else if (originalAction.includes("note")) {
      type = "note";
    } else {
      type = "workspace";
    }
  }

  const entityName =
    activity.entityName ||
    (type !== "workspace" ? activity.title : "Workspace");

  let action = originalAction;

  if (action.includes("delete")) {
    action = "deleted";
  } else if (action.includes("creat") || action.includes("add")) {
    action = "created";
  } else if (action.includes("complet")) {
    action = "completed";
  } else if (action.includes("pin")) {
    action = originalAction.includes("unpin") ? "unpinned" : "pinned";
  } else if (action.includes("updat") || action.includes("edit")) {
    action = "updated";
  }

  const actionTitles = {
    created: `${moduleLabels[type] || "Item"} created`,
    updated: `${moduleLabels[type] || "Item"} updated`,
    deleted: `${moduleLabels[type] || "Item"} deleted`,
    completed: `${moduleLabels[type] || "Item"} completed`,
    pinned: `${moduleLabels[type] || "Item"} pinned`,
    unpinned: `${moduleLabels[type] || "Item"} unpinned`
  };

  return {
    ...activity,
    id: activity.id || `legacy-activity-${index}`,
    type,
    action,
    entityName,
    title:
      actionTitles[action] ||
      activity.title ||
      "Workspace activity",
    message:
      activity.message ||
      activity.description ||
      activity.action ||
      "An activity occurred in your workspace.",
    createdAt: activity.createdAt || activity.date || null
  };
}

/* =========================================
   DATE HELPERS
========================================= */

function getValidDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateGroup(value) {
  const date = getValidDate(value);

  if (!date) return "Earlier";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const activityDate = new Date(date);
  activityDate.setHours(0, 0, 0, 0);

  if (activityDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (activityDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return "Earlier";
}

function formatActivityTime(value) {
  const date = getValidDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatActivityDate(value) {
  const date = getValidDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

/* =========================================
   ACTION ICONS
========================================= */

function getActionIcon(action) {
  switch (action) {
    case "created":
      return Plus;

    case "updated":
      return Pencil;

    case "deleted":
      return Trash2;

    case "completed":
      return CheckCircle2;

    case "pinned":
      return Pin;

    case "unpinned":
      return PinOff;

    default:
      return Activity;
  }
}

/* =========================================
   ACTIVITY CENTER
========================================= */

function ActivityCenter() {
  const [activities, setActivities] = useState(readActivities);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const refreshActivities = useCallback(() => {
    setActivities(readActivities());
  }, []);

  useEffect(() => {
    window.addEventListener(
      "nexora:activity-updated",
      refreshActivities
    );

    window.addEventListener("storage", refreshActivities);

    return () => {
      window.removeEventListener(
        "nexora:activity-updated",
        refreshActivities
      );

      window.removeEventListener("storage", refreshActivities);
    };
  }, [refreshActivities]);

  const normalizedActivities = useMemo(() => {
    return activities
      .map((activity, index) =>
        normalizeActivity(activity, index)
      )
      .sort((a, b) => {
        const dateA = getValidDate(a.createdAt);
        const dateB = getValidDate(b.createdAt);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateB.getTime() - dateA.getTime();
      });
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedActivities.filter((activity) => {
      const matchesFilter =
        activeFilter === "all" ||
        activity.type === activeFilter;

      const searchableText = [
        activity.title,
        activity.message,
        activity.description,
        activity.entityName,
        activity.action
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [normalizedActivities, activeFilter, search]);

  const groupedActivities = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: []
    };

    filteredActivities.forEach((activity) => {
      const group = getDateGroup(activity.createdAt);
      groups[group].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  const statistics = useMemo(() => {
    return {
      total: normalizedActivities.length,
      projects: normalizedActivities.filter(
        (item) => item.type === "project"
      ).length,
      tasks: normalizedActivities.filter(
        (item) => item.type === "task"
      ).length,
      calendar: normalizedActivities.filter(
        (item) => item.type === "calendar"
      ).length,
      notes: normalizedActivities.filter(
        (item) => item.type === "note"
      ).length
    };
  }, [normalizedActivities]);

  /* =========================================
     CLEAR HISTORY
  ========================================= */

  const clearHistory = () => {
    if (activities.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all workspace activity history? This action cannot be undone."
    );

    if (!confirmed) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    setActivities([]);

    window.dispatchEvent(
      new CustomEvent("nexora:activity-updated")
    );
  };

  /* =========================================
     ACTIVITY CARD
  ========================================= */

  const renderActivity = (activity) => {
    const ModuleIcon =
      moduleIcons[activity.type] || Activity;

    const ActionIcon = getActionIcon(activity.action);

    return (
      <div className="activity-item" key={activity.id}>
        <div className={`activity-item-icon ${activity.type}`}>
          <ModuleIcon size={19} />
        </div>

        <div className="activity-item-content">
          <div className="activity-item-heading">
            <h3>{activity.title}</h3>

            <span className="activity-item-time">
              <Clock3 size={13} />
              {formatActivityTime(activity.createdAt)}
            </span>
          </div>

          <p>
            {activity.message}
          </p>

          <div className="activity-item-meta">
            <span className={`activity-module-tag ${activity.type}`}>
              {moduleLabels[activity.type] || "Activity"}
            </span>

            <span className="activity-date">
              {formatActivityDate(activity.createdAt)}
            </span>
          </div>
        </div>

        <div className={`activity-action-icon ${activity.action}`}>
          <ActionIcon size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="activity-page animate-fade">

      {/* HEADER */}

      <div className="activity-header">
        <div>
          <span className="activity-eyebrow">
            NEXORA WORKSPACE
          </span>

          <h1>Activity Center</h1>

          <p>
            Stay updated with everything happening across your workspace.
          </p>
        </div>

        <button
          className="activity-clear-button"
          onClick={clearHistory}
          disabled={activities.length === 0}
        >
          <Trash2 size={16} />
          Clear History
        </button>
      </div>

      {/* STATISTICS */}

      <div className="activity-stats">

        <div className="activity-stat-card">
          <div className="activity-stat-icon purple">
            <Activity size={21} />
          </div>

          <div>
            <span>Total Activities</span>
            <h3>{statistics.total}</h3>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="activity-stat-icon blue">
            <FolderKanban size={21} />
          </div>

          <div>
            <span>Projects</span>
            <h3>{statistics.projects}</h3>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="activity-stat-icon green">
            <CheckSquare size={21} />
          </div>

          <div>
            <span>Tasks</span>
            <h3>{statistics.tasks}</h3>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="activity-stat-icon cyan">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Calendar</span>
            <h3>{statistics.calendar}</h3>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="activity-stat-icon orange">
            <NotebookPen size={21} />
          </div>

          <div>
            <span>Notes</span>
            <h3>{statistics.notes}</h3>
          </div>
        </div>

      </div>

      {/* FILTERS AND SEARCH */}

      <div className="activity-toolbar">

        <div className="activity-filters">
          {filters.map((filter) => {
            const Icon = filter.icon;

            return (
              <button
                key={filter.value}
                className={`activity-filter-button ${
                  activeFilter === filter.value ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.value)}
              >
                <Icon size={15} />
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="activity-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

      </div>

      {/* TIMELINE */}

      <div className="activity-timeline-container">

        <div className="activity-timeline-header">
          <div>
            <h2>Recent Activity</h2>
            <p>
              {filteredActivities.length} activities found
            </p>
          </div>

          <div className="activity-live-indicator">
            <span />
            Live Updates
          </div>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="activity-timeline">

            {["Today", "Yesterday", "Earlier"].map((group) => (
              groupedActivities[group].length > 0 && (
                <section
                  className="activity-date-group"
                  key={group}
                >
                  <div className="activity-date-heading">
                    <span>{group}</span>
                    <div />
                    <span className="activity-date-count">
                      {groupedActivities[group].length}
                    </span>
                  </div>

                  <div className="activity-list">
                    {groupedActivities[group].map(renderActivity)}
                  </div>
                </section>
              )
            ))}

          </div>
        ) : (
          <div className="activity-empty">
            <div className="activity-empty-icon">
              {search ? (
                <Search size={29} />
              ) : (
                <Filter size={29} />
              )}
            </div>

            <h3>
              {search || activeFilter !== "all"
                ? "No matching activities"
                : "No activity yet"}
            </h3>

            <p>
              {search || activeFilter !== "all"
                ? "Try changing your search or selecting another filter."
                : "Your workspace activity will appear here as you create and manage projects, tasks, events and notes."}
            </p>

            {(search || activeFilter !== "all") && (
              <button
                className="activity-reset-button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("all");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

export default ActivityCenter;
