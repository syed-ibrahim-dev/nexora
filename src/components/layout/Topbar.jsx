
import { useEffect, useRef, useState } from "react";

import {
  Search,
  Bell,
  Menu,
  Sparkles,
  ChevronDown,
  Check,
  CheckCheck,
  Trash2,
  CalendarDays,
  CheckSquare,
  Clock3,
  BellRing,
  X,
  FolderKanban,
  NotebookPen,
  ArrowUpRight
} from "lucide-react";

import AISpacePanel from "./AISpacePanel";
import ProfilePanel from "./ProfilePanel";

import "./NotificationPanel.css";
import "./GlobalSearch.css";

const NOTIFICATIONS_KEY = "nexora_notifications_v1";
const DISMISSED_KEY = "nexora_notification_dismissed_v1";
const RECENT_SEARCHES_KEY = "nexora_recent_searches_v1";
const SETTINGS_KEY = "nexora_settings_v1";
const ACTIVITY_KEY = "nexora_activity_v1";

const TASKS_KEY = "nexora_tasks_v1";
const PROJECTS_KEY = "nexora_projects_v1";
const EVENTS_KEY = "nexora_calendar_events_v1";

const defaultNotificationPreferences = {
  taskReminders: true,
  projectUpdates: true,
  calendarEvents: true,
  weeklySummary: false
};

const searchSources = [
  {
    key: "projects",
    label: "Projects",
    page: "Projects",
    storageKey: PROJECTS_KEY,
    icon: FolderKanban
  },
  {
    key: "tasks",
    label: "Tasks",
    page: "My Tasks",
    storageKey: TASKS_KEY,
    icon: CheckSquare
  },
  {
    key: "calendar",
    label: "Calendar",
    page: "Calendar",
    storageKey: EVENTS_KEY,
    icon: CalendarDays
  },
  {
    key: "notes",
    label: "Notes",
    page: "Notes",
    storageKey: "nexora_notes_v1",
    icon: NotebookPen
  }
];

/* =========================================
   STORAGE HELPERS
========================================= */

function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function readNotificationPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return {
      ...defaultNotificationPreferences,
      ...(saved.notifications || {})
    };
  } catch {
    return { ...defaultNotificationPreferences };
  }
}

function saveNotifications(notifications) {
  try {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.error("Unable to save notifications:", error);
  }
}

/* =========================================
   PROFILE HELPERS
========================================= */

function getProfileInitials() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    const name = saved.profile?.name?.trim() || "Ibrahim";

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  } catch {
    return "I";
  }
}

/* =========================================
   DATE HELPERS
========================================= */

function getParsedDate(dateValue) {
  if (!dateValue) return null;

  let date;

  if (dateValue instanceof Date) {
    date = new Date(dateValue);
  } else if (
    typeof dateValue === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    date = new Date(`${dateValue}T00:00:00`);
  } else {
    date = new Date(dateValue);
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateOnly(dateValue) {
  const date = getParsedDate(dateValue);

  if (!date) return null;

  date.setHours(0, 0, 0, 0);

  return date;
}

function formatNotificationDate(dateValue) {
  const date = getParsedDate(dateValue);

  if (!date) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function isWithinLastSevenDays(dateValue) {
  const date = getParsedDate(dateValue);

  if (!date) return false;

  const now = new Date();
  const sevenDaysAgo = new Date(now);

  sevenDaysAgo.setDate(now.getDate() - 7);

  return date >= sevenDaysAgo && date <= now;
}

/* =========================================
   GENERATED NOTIFICATION HELPERS
========================================= */

function isGeneratedNotification(notification) {
  return [
    "task",
    "task_activity",
    "event",
    "calendar",
    "summary"
  ].includes(notification?.type);
}

function findPreviousNotification(notification, existing) {
  const exactMatch = existing.find(
    (item) => item.id === notification.id
  );

  if (exactMatch) return exactMatch;

  if (notification.type === "task") {
    const taskId = notification.id.replace(/^task-/, "");

    return existing.find(
      (item) =>
        item.type === "task" &&
        String(item.id || "").startsWith(`task-${taskId}-`)
    );
  }

  if (notification.type === "event") {
    const eventId = notification.id.replace(/^event-/, "");

    return existing.find(
      (item) =>
        (item.type === "event" || item.type === "calendar") &&
        String(item.id || "").startsWith(`event-${eventId}-`)
    );
  }

  return null;
}

/* =========================================
   TASK ACTIVITY NOTIFICATIONS
========================================= */

function getTaskActivityNotifications() {
  const activities = readArray(ACTIVITY_KEY);

  return activities
    .filter((activity) => {
      if (!activity || activity.type !== "task") return false;

      const action = String(activity.action || "").toLowerCase();

      const supportedActions = [
        "created",
        "updated",
        "completed",
        "deleted"
      ];

      if (!supportedActions.includes(action)) return false;

      return isWithinLastSevenDays(
        activity.createdAt || activity.date
      );
    })
    .map((activity, index) => {
      const activityDate =
        activity.createdAt || activity.date || new Date().toISOString();

      return {
        id:
          activity.id ||
          `task-activity-${activity.entityId || "unknown"}-${activity.action}-${index}`,
        type: "task_activity",
        title: activity.title || "Task activity",
        message:
          activity.message ||
          activity.description ||
          activity.entityName ||
          "A task was updated.",
        date: activityDate,
        createdAt: activityDate,
        read: false
      };
    });
}

/* =========================================
   WEEKLY SUMMARY
========================================= */

function getWeeklySummaryNotification() {
  const activities = readArray(ACTIVITY_KEY);

  const recentActivities = activities.filter((activity) => {
    return isWithinLastSevenDays(
      activity.createdAt || activity.date
    );
  });

  if (recentActivities.length === 0) return null;

  const now = new Date();

  const weekKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  return {
    id: `weekly-summary-${weekKey}`,
    type: "summary",
    title: "Your weekly workspace summary",
    message: `You had ${recentActivities.length} workspace ${
      recentActivities.length === 1 ? "activity" : "activities"
    } in the last 7 days.`,
    date: now.toISOString(),
    createdAt: now.toISOString(),
    read: false
  };
}

/* =========================================
   SOURCE NOTIFICATIONS
========================================= */

function getSourceNotifications(preferences) {
  const tasks = readArray(TASKS_KEY);
  const events = readArray(EVENTS_KEY);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const generated = [];

  if (preferences.taskReminders) {
    tasks.forEach((task) => {
      if (!task.id || !task.dueDate) return;

      const status = String(task.status || "").toLowerCase();

      if (
        status === "completed" ||
        status === "complete" ||
        status === "done"
      ) {
        return;
      }

      const dueDate = getDateOnly(task.dueDate);

      if (!dueDate || dueDate > sevenDaysLater) return;

      const isOverdue = dueDate < today;

      generated.push({
        id: `task-${task.id}`,
        type: "task",
        title: isOverdue
          ? "Task overdue"
          : "Upcoming task deadline",
        message: task.title || "A task needs your attention.",
        date: task.dueDate,
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    generated.push(...getTaskActivityNotifications());
  }

  if (preferences.calendarEvents) {
    events.forEach((event) => {
      if (!event.id || !event.date) return;

      const eventDate = getDateOnly(event.date);

      if (!eventDate) return;
      if (eventDate < today || eventDate > sevenDaysLater) return;

      generated.push({
        id: `event-${event.id}`,
        type: "event",
        title: "Upcoming calendar event",
        message: event.title || "You have a scheduled event.",
        date: event.date,
        createdAt: new Date().toISOString(),
        read: false
      });
    });
  }

  if (preferences.weeklySummary) {
    const summary = getWeeklySummaryNotification();

    if (summary) {
      generated.push(summary);
    }
  }

  return generated;
}

/* =========================================
   NOTIFICATION STORAGE
========================================= */

function getInitialNotifications() {
  return readArray(NOTIFICATIONS_KEY);
}

function refreshNotifications() {
  const existing = readArray(NOTIFICATIONS_KEY);
  const dismissed = readArray(DISMISSED_KEY);

  const dismissedSet = new Set(dismissed);

  const preferences = readNotificationPreferences();
  const generated = getSourceNotifications(preferences);

  const manualNotifications = existing.filter(
    (notification) => !isGeneratedNotification(notification)
  );

  const updatedGenerated = [];

  generated.forEach((notification) => {
    const previous = findPreviousNotification(
      notification,
      existing
    );

    const wasDismissed =
      dismissedSet.has(notification.id) ||
      (previous && dismissedSet.has(previous.id));

    if (wasDismissed) return;

    updatedGenerated.push({
      ...notification,
      read: previous ? previous.read : false,
      createdAt: previous
        ? previous.createdAt
        : notification.createdAt
    });
  });

  const updated = [
    ...manualNotifications,
    ...updatedGenerated
  ]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || b.date).getTime() -
        new Date(a.createdAt || a.date).getTime()
      );
    })
    .slice(0, 50);

  saveNotifications(updated);

  return updated;
}

/* =========================================
   NOTIFICATION PREFERENCE FILTERING
========================================= */

function isNotificationEnabled(notification, preferences) {
  switch (notification.type) {
    case "task":
    case "task_activity":
      return preferences.taskReminders;

    case "event":
    case "calendar":
      return preferences.calendarEvents;

    case "project":
      return preferences.projectUpdates;

    case "summary":
      return preferences.weeklySummary;

    default:
      return true;
  }
}

/* =========================================
   GLOBAL SEARCH HELPERS
========================================= */

function getSearchableText(item) {
  return [
    item.title,
    item.name,
    item.description,
    item.content,
    item.body,
    item.text,
    item.category,
    item.status,
    item.priority
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSearchTitle(item, type) {
  return (
    item.title ||
    item.name ||
    (type === "notes" ? "Untitled note" : "Untitled item")
  );
}

function getSearchDescription(item) {
  return (
    item.description ||
    item.content ||
    item.body ||
    item.text ||
    item.category ||
    "No additional details"
  );
}

function getAllSearchResults(query, category) {
  if (!query.trim()) return [];

  const normalizedQuery = query.trim().toLowerCase();
  const results = [];

  searchSources.forEach((source) => {
    if (category !== "all" && category !== source.key) return;

    const items = readArray(source.storageKey);

    items.forEach((item, index) => {
      if (!item || typeof item !== "object") return;

      const searchableText = getSearchableText(item);

      if (!searchableText.includes(normalizedQuery)) return;

      results.push({
        id: item.id || `${source.key}-${index}`,
        title: getSearchTitle(item, source.key),
        description: getSearchDescription(item),
        type: source.key,
        typeLabel: source.label,
        page: source.page,
        icon: source.icon
      });
    });
  });

  return results.slice(0, 15);
}

function getInitialRecentSearches() {
  return readArray(RECENT_SEARCHES_KEY);
}

function saveRecentSearch(query) {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) return;

  const previous = readArray(RECENT_SEARCHES_KEY);

  const updated = [
    cleanedQuery,
    ...previous.filter(
      (item) =>
        String(item).toLowerCase() !== cleanedQuery.toLowerCase()
    )
  ].slice(0, 5);

  try {
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error("Unable to save recent searches:", error);
  }
}

/* =========================================
   TOPBAR
========================================= */

function Topbar({ activePage, setMobileOpen }) {
  const [notifications, setNotifications] = useState(
    getInitialNotifications
  );

  const [notificationPreferences, setNotificationPreferences] =
    useState(readNotificationPreferences);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  const [recentSearches, setRecentSearches] = useState(
    getInitialRecentSearches
  );

  const [aiSpaceOpen, setAiSpaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [profileInitials, setProfileInitials] = useState(
    getProfileInitials
  );

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date());

  const visibleNotifications = notifications.filter((notification) =>
    isNotificationEnabled(notification, notificationPreferences)
  );

  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.read
  ).length;

  const searchResults = getAllSearchResults(
    searchQuery,
    searchCategory
  );

  /* =========================================
     NOTIFICATION REFRESH
  ========================================= */

  const syncNotificationPreferences = () => {
    const updatedPreferences = readNotificationPreferences();

    setNotificationPreferences(updatedPreferences);
    setNotifications(refreshNotifications());
  };

  useEffect(() => {
    const handleSettingsUpdate = () => {
      syncNotificationPreferences();
    };

    const handleStorageUpdate = (event) => {
      if (!event.key) {
        syncNotificationPreferences();
        return;
      }

      if (event.key === SETTINGS_KEY) {
        syncNotificationPreferences();
        return;
      }

      if (
        event.key === TASKS_KEY ||
        event.key === EVENTS_KEY ||
        event.key === PROJECTS_KEY ||
        event.key === ACTIVITY_KEY ||
        event.key === DISMISSED_KEY
      ) {
        setNotifications(refreshNotifications());
        return;
      }

      if (event.key === NOTIFICATIONS_KEY) {
        setNotifications(readArray(NOTIFICATIONS_KEY));
      }
    };

    const handleActivityUpdate = () => {
      setNotifications(refreshNotifications());
    };

    const handleSourceUpdate = () => {
      setNotifications(refreshNotifications());
    };

    window.addEventListener(
      "nexora:settings-updated",
      handleSettingsUpdate
    );

    window.addEventListener("storage", handleStorageUpdate);

    window.addEventListener(
      "nexora:activity-updated",
      handleActivityUpdate
    );

    window.addEventListener(
      "nexora:notifications-updated",
      handleActivityUpdate
    );

    window.addEventListener(
      "nexora:tasks-updated",
      handleSourceUpdate
    );

    window.addEventListener(
      "nexora:projects-updated",
      handleSourceUpdate
    );

    window.addEventListener(
      "nexora:calendar-updated",
      handleSourceUpdate
    );

    return () => {
      window.removeEventListener(
        "nexora:settings-updated",
        handleSettingsUpdate
      );

      window.removeEventListener("storage", handleStorageUpdate);

      window.removeEventListener(
        "nexora:activity-updated",
        handleActivityUpdate
      );

      window.removeEventListener(
        "nexora:notifications-updated",
        handleActivityUpdate
      );

      window.removeEventListener(
        "nexora:tasks-updated",
        handleSourceUpdate
      );

      window.removeEventListener(
        "nexora:projects-updated",
        handleSourceUpdate
      );

      window.removeEventListener(
        "nexora:calendar-updated",
        handleSourceUpdate
      );
    };
  }, []);

  /* =========================================
     PROFILE SYNCHRONIZATION
  ========================================= */

  useEffect(() => {
    const syncProfile = () => {
      setProfileInitials(getProfileInitials());
    };

    window.addEventListener(
      "nexora:settings-updated",
      syncProfile
    );

    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener(
        "nexora:settings-updated",
        syncProfile
      );

      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  const handleNotificationToggle = () => {
    if (!notificationOpen) {
      setNotifications(refreshNotifications());
      setNotificationPreferences(readNotificationPreferences());
    }

    setNotificationOpen((previous) => !previous);
  };

  const handleMarkRead = (id) => {
    const updated = notifications.map((notification) =>
      notification.id === id
        ? { ...notification, read: true }
        : notification
    );

    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((notification) =>
      isNotificationEnabled(notification, notificationPreferences)
        ? { ...notification, read: true }
        : notification
    );

    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    const dismissed = readArray(DISMISSED_KEY);

    const updatedDismissed = [
      ...new Set([
        ...dismissed,
        ...visibleNotifications.map((notification) => notification.id)
      ])
    ];

    try {
      localStorage.setItem(
        DISMISSED_KEY,
        JSON.stringify(updatedDismissed)
      );
    } catch (error) {
      console.error("Unable to update dismissed notifications:", error);
    }

    const remaining = notifications.filter(
      (notification) =>
        !isNotificationEnabled(notification, notificationPreferences)
    );

    setNotifications(remaining);
    saveNotifications(remaining);
  };

  /* =========================================
     GLOBAL SEARCH ACTIONS
  ========================================= */

  const openSearch = () => {
    setNotificationOpen(false);
    setAiSpaceOpen(false);
    setProfileOpen(false);
    setSearchOpen(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchCategory("all");
  };

  const handleSearchResultClick = (result) => {
    saveRecentSearch(searchQuery);
    setRecentSearches(getInitialRecentSearches());

    closeSearch();

    window.dispatchEvent(
      new CustomEvent("nexora:navigate", {
        detail: result.page
      })
    );
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    setSearchCategory("all");

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleClearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Unable to clear recent searches:", error);
    }

    setRecentSearches([]);
  };

  /* =========================================
     AI SPACE ACTION
  ========================================= */

  const handleOpenAISpace = () => {
    setNotificationOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
    setAiSpaceOpen(true);
  };

  /* =========================================
     PROFILE ACTION
  ========================================= */

  const handleOpenProfile = () => {
    setNotificationOpen(false);
    setSearchOpen(false);
    setAiSpaceOpen(false);
    setProfileOpen((previous) => !previous);
  };

  /* =========================================
     OUTSIDE CLICK
  ========================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =========================================
     KEYBOARD SHORTCUTS
  ========================================= */

  useEffect(() => {
    const handleKeyboardShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        openSearch();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationOpen(false);
        setAiSpaceOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, []);

  /* =========================================
     NOTIFICATION ICONS
  ========================================= */

  const getNotificationIcon = (type) => {
    if (type === "task" || type === "task_activity") {
      return <CheckSquare size={18} />;
    }

    if (type === "event" || type === "calendar") {
      return <CalendarDays size={18} />;
    }

    if (type === "project") {
      return <FolderKanban size={18} />;
    }

    if (type === "summary") {
      return <Sparkles size={18} />;
    }

    return <BellRing size={18} />;
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-date">
            {currentDate}
          </div>

          <div className="global-search-wrapper" ref={searchRef}>
            <button
              className={`global-search-trigger ${
                searchOpen ? "global-search-trigger-active" : ""
              }`}
              onClick={openSearch}
              aria-label="Open global search"
            >
              <Search size={17} />
              <span>Search anything...</span>
              <kbd>Ctrl K</kbd>
            </button>

            {searchOpen && (
              <div className="global-search-panel">
                <div className="global-search-input-area">
                  <Search size={19} />

                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search projects, tasks, notes..."
                    aria-label="Search across your workspace"
                  />

                  {searchQuery && (
                    <button
                      className="global-search-clear"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <button
                    className="global-search-escape"
                    onClick={closeSearch}
                  >
                    ESC
                  </button>
                </div>

                <div className="global-search-categories">
                  {[
                    { key: "all", label: "All" },
                    { key: "projects", label: "Projects" },
                    { key: "tasks", label: "Tasks" },
                    { key: "calendar", label: "Calendar" },
                    { key: "notes", label: "Notes" }
                  ].map((category) => (
                    <button
                      key={category.key}
                      className={
                        searchCategory === category.key ? "active" : ""
                      }
                      onClick={() => setSearchCategory(category.key)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="global-search-content">
                  {searchQuery.trim() ? (
                    searchResults.length > 0 ? (
                      <>
                        <div className="global-search-section-title">
                          {searchResults.length} matching result
                          {searchResults.length !== 1 ? "s" : ""}
                        </div>

                        <div className="global-search-results">
                          {searchResults.map((result) => {
                            const ResultIcon = result.icon;

                            return (
                              <button
                                className="global-search-result"
                                key={`${result.type}-${result.id}`}
                                onClick={() =>
                                  handleSearchResultClick(result)
                                }
                              >
                                <span
                                  className={`global-search-result-icon ${result.type}`}
                                >
                                  <ResultIcon size={17} />
                                </span>

                                <span className="global-search-result-text">
                                  <strong>{result.title}</strong>
                                  <small>{result.description}</small>
                                </span>

                                <span className="global-search-result-type">
                                  {result.typeLabel}
                                </span>

                                <ArrowUpRight size={15} />
                              </button>
                            );
                          })}
                        </div>

                        {searchResults.length === 15 && (
                          <p className="global-search-limit">
                            Showing the first 15 results.
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="global-search-empty">
                        <Search size={25} />
                        <strong>No results found</strong>
                        <p>
                          Try another keyword or select a different category.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="global-search-recent">
                      <div className="global-search-recent-heading">
                        <span>
                          <Clock3 size={14} />
                          Recent searches
                        </span>

                        {recentSearches.length > 0 && (
                          <button onClick={handleClearRecentSearches}>
                            Clear history
                          </button>
                        )}
                      </div>

                      {recentSearches.length > 0 ? (
                        recentSearches.map((query, index) => (
                          <button
                            className="global-search-recent-item"
                            key={`${query}-${index}`}
                            onClick={() =>
                              handleRecentSearchClick(query)
                            }
                          >
                            <Clock3 size={15} />
                            <span>{query}</span>
                            <ArrowUpRight size={14} />
                          </button>
                        ))
                      ) : (
                        <div className="global-search-hint">
                          <Search size={23} />
                          <p>
                            Start typing to search across your NEXORA workspace.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="global-search-footer">
                  <span>
                    <kbd>ESC</kbd> to close
                  </span>
                  <span>Search across your workspace</span>
                </div>
              </div>
            )}
          </div>

          <div className="notification-wrapper" ref={notificationRef}>
            <button
              className={`icon-button notification-button ${
                notificationOpen ? "notification-active" : ""
              }`}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              title="Notifications"
              onClick={handleNotificationToggle}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="notification-panel">
                <div className="notification-panel-header">
                  <div>
                    <h3>Notifications</h3>
                    <p>
                      {unreadCount > 0
                        ? `${unreadCount} unread notifications`
                        : "You're all caught up"}
                    </p>
                  </div>

                  <button
                    className="notification-close"
                    onClick={() => setNotificationOpen(false)}
                    aria-label="Close notifications"
                  >
                    <X size={17} />
                  </button>
                </div>

                {visibleNotifications.length > 0 && (
                  <div className="notification-actions">
                    <button
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>

                    <button onClick={handleClearAll}>
                      <Trash2 size={14} />
                      Clear all
                    </button>
                  </div>
                )}

                <div className="notification-list">
                  {visibleNotifications.length > 0 ? (
                    visibleNotifications.map((notification) => (
                      <div
                        className={`notification-item ${
                          notification.read ? "read" : "unread"
                        }`}
                        key={notification.id}
                      >
                        <div
                          className={`notification-item-icon ${notification.type}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="notification-item-content">
                          <strong>{notification.title}</strong>

                          <p>{notification.message}</p>

                          <span className="notification-item-date">
                            <Clock3 size={12} />
                            {formatNotificationDate(
                              notification.date || notification.createdAt
                            )}
                          </span>
                        </div>

                        {!notification.read && (
                          <button
                            className="notification-read-button"
                            onClick={() => handleMarkRead(notification.id)}
                            title="Mark as read"
                            aria-label="Mark notification as read"
                          >
                            <Check size={15} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">
                        <BellRing size={25} />
                      </div>

                      <strong>No notifications yet</strong>

                      <p>
                        Enabled task reminders, project updates, calendar
                        events and weekly summaries will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="notification-panel-footer">
                  <span>NEXORA WORKSPACE</span>
                  <span>Notification Center</span>
                </div>
              </div>
            )}
          </div>

          <button
            className="topbar-ai-button"
            onClick={handleOpenAISpace}
            aria-label="Open AI Space"
          >
            <Sparkles size={16} />
            <span>AI Space</span>
          </button>

          <button
            className={`topbar-profile ${profileOpen ? "active" : ""}`}
            onClick={handleOpenProfile}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <span className="topbar-avatar">
              {profileInitials}
            </span>

            <ChevronDown size={15} />
          </button>
        </div>
      </header>

      {aiSpaceOpen && (
        <AISpacePanel
          onClose={() => setAiSpaceOpen(false)}
        />
      )}

      {profileOpen && (
        <ProfilePanel
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}

export default Topbar;
