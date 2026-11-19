
import { useEffect, useRef, useState } from "react";

import {
  UserRound,
  Palette,
  Bell,
  ListChecks,
  Database,
  Save,
  Download,
  RotateCcw,
  Check,
  Moon,
  Sun,
  Monitor,
  ShieldCheck,
  Upload,
  Trash2,
  FileJson
} from "lucide-react";

import { applyWorkspaceAppearance } from "../utils/workspaceSettings";

import "./Settings.css";

const STORAGE_KEY = "nexora_settings_v1";

const defaultSettings = {
  profile: {
    name: "Ibrahim",
    email: "",
    workspace: "Personal Workspace"
  },
  appearance: {
    theme: "dark",
    accent: "purple",
    density: "comfortable"
  },
  notifications: {
    taskReminders: true,
    projectUpdates: true,
    calendarEvents: true,
    weeklySummary: false
  },
  tasks: {
    defaultPriority: "Medium",
    defaultView: "List",
    showCompleted: true
  }
};

/* =========================================
   WORKSPACE STORAGE KEYS
========================================= */

const workspaceStorageKeys = [
  "nexora_projects_v1",
  "nexora_tasks_v1",
  "nexora_calendar_events_v1",
  "nexora_notes_v1",
  "nexora_activity_v1",
  "nexora_notifications_v1",
  "nexora_notification_dismissed_v1",
  "nexora_recent_searches_v1",
  "nexora_feedback_v1"
];

/* =========================================
   ACCENT OPTIONS
========================================= */

const accentOptions = [
  { name: "Purple", value: "purple", color: "#A78BFA" },
  { name: "Blue", value: "blue", color: "#3B82F6" },
  { name: "Cyan", value: "cyan", color: "#06B6D4" },
  { name: "Green", value: "green", color: "#10B981" },
  { name: "Pink", value: "pink", color: "#EC4899" }
];

/* =========================================
   SETTINGS HELPERS
========================================= */

function createDefaultSettings() {
  return {
    profile: { ...defaultSettings.profile },
    appearance: { ...defaultSettings.appearance },
    notifications: { ...defaultSettings.notifications },
    tasks: { ...defaultSettings.tasks }
  };
}

function mergeSettings(savedSettings = {}) {
  return {
    profile: {
      ...defaultSettings.profile,
      ...(savedSettings.profile || {})
    },
    appearance: {
      ...defaultSettings.appearance,
      ...(savedSettings.appearance || {})
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(savedSettings.notifications || {})
    },
    tasks: {
      ...defaultSettings.tasks,
      ...(savedSettings.tasks || {})
    }
  };
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createDefaultSettings();
    }

    return mergeSettings(JSON.parse(saved));
  } catch (error) {
    console.error("Unable to load settings:", error);
    return createDefaultSettings();
  }
}

function showWorkspaceUpdates() {
  const events = [
    "nexora:settings-updated",
    "nexora:activity-updated",
    "nexora:notifications-updated",
    "nexora:tasks-updated",
    "nexora:projects-updated",
    "nexora:calendar-updated"
  ];

  events.forEach((eventName) => {
    window.dispatchEvent(new Event(eventName));
  });

  window.dispatchEvent(new Event("storage"));
}

function readWorkspaceData() {
  const data = {};

  workspaceStorageKeys.forEach((key) => {
    try {
      const saved = localStorage.getItem(key);

      if (saved === null) {
        data[key] = [];
        return;
      }

      const parsed = JSON.parse(saved);

      data[key] = Array.isArray(parsed) ? parsed : [];
    } catch {
      data[key] = [];
    }
  });

  return data;
}

/* =========================================
   BACKUP VALIDATION
========================================= */

function validateWorkspaceBackup(backup) {
  if (
    !backup ||
    typeof backup !== "object" ||
    Array.isArray(backup)
  ) {
    return false;
  }

  const data = backup.data || backup;

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return false;
  }

  const hasRecognizedData =
    workspaceStorageKeys.some((key) =>
      Object.prototype.hasOwnProperty.call(data, key)
    ) ||
    Array.isArray(data.projects) ||
    Array.isArray(data.tasks) ||
    Array.isArray(data.calendarEvents) ||
    Array.isArray(data.notes) ||
    Array.isArray(data.activities) ||
    Boolean(backup.settings || data.settings);

  if (!hasRecognizedData) {
    return false;
  }

  for (const key of workspaceStorageKeys) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      !Array.isArray(data[key])
    ) {
      return false;
    }
  }

  const importedSettings = backup.settings || data.settings;

  if (
    importedSettings !== undefined &&
    (
      !importedSettings ||
      typeof importedSettings !== "object" ||
      Array.isArray(importedSettings)
    )
  ) {
    return false;
  }

  return true;
}

/* =========================================
   LEGACY BACKUP SUPPORT
========================================= */

function getBackupData(data) {
  const restoredData = { ...data };

  const legacyMappings = {
    activities: "nexora_activity_v1",
    projects: "nexora_projects_v1",
    tasks: "nexora_tasks_v1",
    calendarEvents: "nexora_calendar_events_v1",
    notes: "nexora_notes_v1"
  };

  Object.entries(legacyMappings).forEach(([oldKey, newKey]) => {
    if (
      !Object.prototype.hasOwnProperty.call(restoredData, newKey) &&
      Array.isArray(restoredData[oldKey])
    ) {
      restoredData[newKey] = restoredData[oldKey];
    }
  });

  return restoredData;
}

/* =========================================
   SETTINGS PAGE
========================================= */

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [activeSection, setActiveSection] = useState("Profile");
  const [savedMessage, setSavedMessage] = useState("");
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef(null);
  const messageTimerRef = useRef(null);

  const showMessage = (message) => {
    setSavedMessage(message);

    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = window.setTimeout(() => {
      setSavedMessage("");
      messageTimerRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  /* =========================================
     SAVE SETTINGS
  ========================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      applyWorkspaceAppearance(settings);

      window.dispatchEvent(
        new Event("nexora:settings-updated")
      );
    } catch (error) {
      console.error("Unable to save settings:", error);
    }
  }, [settings]);

  const updateSection = (section, key, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      applyWorkspaceAppearance(settings);

      window.dispatchEvent(
        new Event("nexora:settings-updated")
      );

      showMessage("Your settings have been saved.");
    } catch (error) {
      console.error("Unable to save settings:", error);
      showMessage("Unable to save settings.");
    }
  };

  /* =========================================
     EXPORT WORKSPACE BACKUP
  ========================================= */

  const exportWorkspace = () => {
    try {
      const workspaceData = {
        format: "nexora-workspace-backup",
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        data: readWorkspaceData()
      };

      const blob = new Blob(
        [JSON.stringify(workspaceData, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `nexora-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      showMessage("Workspace backup exported successfully.");
    } catch (error) {
      console.error("Unable to export workspace:", error);
      showMessage("Unable to export workspace backup.");
    }
  };

  /* =========================================
     IMPORT WORKSPACE BACKUP
  ========================================= */

  const openImportPicker = () => {
    fileInputRef.current?.click();
  };

  const importWorkspace = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImporting(true);

    try {
      const fileText = await file.text();
      const backup = JSON.parse(fileText);

      if (!validateWorkspaceBackup(backup)) {
        showMessage("Invalid NEXORA backup file.");
        return;
      }

      const confirmed = window.confirm(
        "Import this backup? Existing workspace data for the included sections will be replaced."
      );

      if (!confirmed) return;

      const originalData = backup.data || backup;
      const data = getBackupData(originalData);

      const previousValues = {};

      [...workspaceStorageKeys, STORAGE_KEY].forEach((key) => {
        previousValues[key] = localStorage.getItem(key);
      });

      try {
        workspaceStorageKeys.forEach((key) => {
          if (
            Object.prototype.hasOwnProperty.call(data, key)
          ) {
            localStorage.setItem(
              key,
              JSON.stringify(data[key])
            );
          }
        });

        const importedSettings = backup.settings || data.settings;

        if (importedSettings) {
          const restoredSettings = mergeSettings(importedSettings);

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(restoredSettings)
          );

          setSettings(restoredSettings);
          applyWorkspaceAppearance(restoredSettings);
        }

        showWorkspaceUpdates();

        showMessage("Workspace backup imported successfully.");
      } catch (restoreError) {
        Object.entries(previousValues).forEach(([key, value]) => {
          if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
        });

        const restoredSettings = loadSettings();

        setSettings(restoredSettings);
        applyWorkspaceAppearance(restoredSettings);

        throw restoreError;
      }
    } catch (error) {
      console.error("Unable to import workspace:", error);
      showMessage("Import failed. Please check your backup file.");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  /* =========================================
     RESET SETTINGS
  ========================================= */

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all Settings preferences to their defaults? Your projects, tasks, notes and calendar events will not be deleted."
    );

    if (!confirmed) return;

    try {
      const resetValues = createDefaultSettings();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(resetValues)
      );

      setSettings(resetValues);
      applyWorkspaceAppearance(resetValues);

      window.dispatchEvent(
        new Event("nexora:settings-updated")
      );

      showMessage("Settings have been reset.");
    } catch (error) {
      console.error("Unable to reset settings:", error);
      showMessage("Unable to reset settings.");
    }
  };

  /* =========================================
     RESET WORKSPACE DATA
  ========================================= */

  const resetWorkspace = () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently clear your projects, tasks, calendar events, notes, activity history, notifications and other included workspace data from this browser. Export a backup first if you need one. Continue?"
    );

    if (!confirmed) return;

    const secondConfirmation = window.confirm(
      "Are you absolutely sure? This action cannot be undone."
    );

    if (!secondConfirmation) return;

    try {
      workspaceStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      const resetValues = createDefaultSettings();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(resetValues)
      );

      setSettings(resetValues);
      applyWorkspaceAppearance(resetValues);

      showWorkspaceUpdates();
      showMessage("Workspace data has been reset.");
    } catch (error) {
      console.error("Unable to reset workspace:", error);
      showMessage("Unable to reset workspace data.");
    }
  };

  /* =========================================
     NAVIGATION SECTIONS
  ========================================= */

  const sections = [
    { name: "Profile", icon: UserRound },
    { name: "Appearance", icon: Palette },
    { name: "Notifications", icon: Bell },
    { name: "Task Preferences", icon: ListChecks },
    { name: "Data Management", icon: Database }
  ];

  return (
    <div
      className={`settings-page settings-${settings.appearance.theme}`}
      style={{
        "--settings-accent":
          accentOptions.find(
            (item) => item.value === settings.appearance.accent
          )?.color || "#A78BFA"
      }}
    >
      {/* HEADER */}

      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">
            NEXORA WORKSPACE
          </span>

          <h1>Settings</h1>

          <p>
            Manage your account and customize your workspace.
          </p>
        </div>

        <button
          className="settings-save-button"
          onClick={saveSettings}
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {savedMessage && (
        <div className="settings-success">
          <Check size={17} />
          {savedMessage}
        </div>
      )}

      <div className="settings-layout">
        {/* SETTINGS SIDEBAR */}

        <aside className="settings-sidebar glass-card">
          <div className="settings-sidebar-heading">
            SETTINGS MENU
          </div>

          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.name}
                className={`settings-nav-item ${
                  activeSection === section.name ? "active" : ""
                }`}
                onClick={() => setActiveSection(section.name)}
              >
                <Icon size={18} />
                <span>{section.name}</span>
              </button>
            );
          })}

          <div className="settings-sidebar-footer">
            <ShieldCheck size={17} />
            <span>Your preferences are stored locally.</span>
          </div>
        </aside>

        {/* SETTINGS CONTENT */}

        <div className="settings-content glass-card">
          {/* PROFILE */}

          {activeSection === "Profile" && (
            <section>
              <div className="settings-section-heading">
                <div className="settings-heading-icon">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2>Profile Settings</h2>
                  <p>
                    Manage your personal and workspace information.
                  </p>
                </div>
              </div>

              <div className="settings-profile-preview">
                <div className="settings-avatar">
                  {settings.profile.name?.charAt(0).toUpperCase() || "I"}
                </div>

                <div>
                  <h3>
                    {settings.profile.name || "Your Name"}
                  </h3>

                  <p>{settings.profile.workspace}</p>
                </div>
              </div>

              <div className="settings-form-grid">
                <label className="settings-field">
                  Full Name

                  <input
                    value={settings.profile.name}
                    onChange={(event) =>
                      updateSection("profile", "name", event.target.value)
                    }
                    placeholder="Enter your name"
                  />
                </label>

                <label className="settings-field">
                  Email Address

                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(event) =>
                      updateSection("profile", "email", event.target.value)
                    }
                    placeholder="Enter your email"
                  />
                </label>

                <label className="settings-field full-width">
                  Workspace Name

                  <input
                    value={settings.profile.workspace}
                    onChange={(event) =>
                      updateSection(
                        "profile",
                        "workspace",
                        event.target.value
                      )
                    }
                    placeholder="Workspace name"
                  />
                </label>
              </div>
            </section>
          )}

          {/* APPEARANCE */}

          {activeSection === "Appearance" && (
            <section>
              <div className="settings-section-heading">
                <div className="settings-heading-icon">
                  <Palette size={21} />
                </div>

                <div>
                  <h2>Appearance</h2>
                  <p>
                    Choose your preferred workspace appearance.
                  </p>
                </div>
              </div>

              <div className="settings-option-group">
                <h3>Theme Preference</h3>

                <p className="settings-muted">
                  Choose how NEXORA should look.
                </p>

                <div className="settings-theme-options">
                  {[
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "light", label: "Light", icon: Sun },
                    { value: "system", label: "System", icon: Monitor }
                  ].map((theme) => {
                    const Icon = theme.icon;

                    return (
                      <button
                        key={theme.value}
                        className={`settings-theme-card ${
                          settings.appearance.theme === theme.value
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateSection(
                            "appearance",
                            "theme",
                            theme.value
                          )
                        }
                      >
                        <Icon size={22} />
                        <span>{theme.label}</span>

                        {settings.appearance.theme === theme.value && (
                          <Check size={16} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="settings-hint">
                  Your selected theme is applied across the workspace
                  and remembered after refreshing the application.
                </p>
              </div>

              <div className="settings-option-group">
                <h3>Accent Color</h3>

                <p className="settings-muted">
                  Choose a workspace accent color.
                </p>

                <div className="settings-accent-options">
                  {accentOptions.map((accent) => (
                    <button
                      key={accent.value}
                      className={`settings-accent ${
                        settings.appearance.accent === accent.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateSection(
                          "appearance",
                          "accent",
                          accent.value
                        )
                      }
                      title={accent.name}
                      aria-label={`${accent.name} accent`}
                    >
                      <span style={{ background: accent.color }} />

                      {settings.appearance.accent === accent.value && (
                        <Check size={15} />
                      )}
                    </button>
                  ))}
                </div>

                <p className="settings-hint">
                  Accent colors update the global workspace color
                  variables. Some components with fixed colors may
                  need additional styling adjustments.
                </p>
              </div>

              <div className="settings-option-group">
                <h3>Display Density</h3>

                <p className="settings-muted">
                  Choose the spacing preference for your workspace.
                </p>

                <select
                  value={settings.appearance.density}
                  onChange={(event) =>
                    updateSection(
                      "appearance",
                      "density",
                      event.target.value
                    )
                  }
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                  <option value="spacious">Spacious</option>
                </select>

                <p className="settings-hint">
                  Your density preference is saved globally.
                  Components need to use the density variables
                  for their spacing to change.
                </p>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}

          {activeSection === "Notifications" && (
            <section>
              <div className="settings-section-heading">
                <div className="settings-heading-icon">
                  <Bell size={21} />
                </div>

                <div>
                  <h2>Notifications</h2>
                  <p>
                    Choose which workspace reminders you want enabled.
                  </p>
                </div>
              </div>

              <div className="settings-toggle-list">
                {[
                  {
                    key: "taskReminders",
                    title: "Task Reminders",
                    description:
                      "Reminders for tasks and upcoming deadlines."
                  },
                  {
                    key: "projectUpdates",
                    title: "Project Updates",
                    description:
                      "Updates related to your project progress."
                  },
                  {
                    key: "calendarEvents",
                    title: "Calendar Events",
                    description:
                      "Reminders for scheduled calendar events."
                  },
                  {
                    key: "weeklySummary",
                    title: "Weekly Summary",
                    description:
                      "A summary of your workspace activity."
                  }
                ].map((item) => (
                  <div
                    className="settings-toggle-row"
                    key={item.key}
                  >
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-label={item.title}
                      aria-checked={settings.notifications[item.key]}
                      className={`settings-switch ${
                        settings.notifications[item.key] ? "on" : ""
                      }`}
                      onClick={() =>
                        updateSection(
                          "notifications",
                          item.key,
                          !settings.notifications[item.key]
                        )
                      }
                    >
                      <span />
                    </button>
                  </div>
                ))}
              </div>

              <p className="settings-hint">
                Notification preferences control the notification
                categories supported by your workspace.
              </p>
            </section>
          )}

          {/* TASK PREFERENCES */}

          {activeSection === "Task Preferences" && (
            <section>
              <div className="settings-section-heading">
                <div className="settings-heading-icon">
                  <ListChecks size={21} />
                </div>

                <div>
                  <h2>Task Preferences</h2>
                  <p>
                    Customize your default task management preferences.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <label className="settings-field">
                  Default Task Priority

                  <select
                    value={settings.tasks.defaultPriority}
                    onChange={(event) =>
                      updateSection(
                        "tasks",
                        "defaultPriority",
                        event.target.value
                      )
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>

                <label className="settings-field">
                  Default Task View

                  <select
                    value={settings.tasks.defaultView}
                    onChange={(event) =>
                      updateSection(
                        "tasks",
                        "defaultView",
                        event.target.value
                      )
                    }
                  >
                    <option>List</option>
                    <option>Grid</option>
                    <option>Board</option>
                  </select>
                </label>
              </div>

              <div className="settings-toggle-row settings-task-toggle">
                <div>
                  <h3>Show Completed Tasks</h3>
                  <p>
                    Include completed tasks in your task list.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-label="Show Completed Tasks"
                  aria-checked={settings.tasks.showCompleted}
                  className={`settings-switch ${
                    settings.tasks.showCompleted ? "on" : ""
                  }`}
                  onClick={() =>
                    updateSection(
                      "tasks",
                      "showCompleted",
                      !settings.tasks.showCompleted
                    )
                  }
                >
                  <span />
                </button>
              </div>

              <p className="settings-hint">
                These preferences are saved. The Tasks module
                will need to read these settings to apply them
                when creating and displaying tasks.
              </p>
            </section>
          )}

          {/* DATA MANAGEMENT */}

          {activeSection === "Data Management" && (
            <section>
              <div className="settings-section-heading">
                <div className="settings-heading-icon">
                  <Database size={21} />
                </div>

                <div>
                  <h2>Data Management</h2>
                  <p>
                    Back up, restore and manage your NEXORA workspace.
                  </p>
                </div>
              </div>

              {/* EXPORT */}

              <div className="settings-data-card">
                <div className="settings-data-icon">
                  <Download size={22} />
                </div>

                <div className="settings-data-info">
                  <h3>Export Workspace Data</h3>

                  <p>
                    Download a JSON backup of your settings, projects,
                    tasks, calendar events, notes, activities,
                    notifications and other supported workspace data.
                  </p>
                </div>

                <button
                  className="settings-secondary-button"
                  onClick={exportWorkspace}
                >
                  <Download size={16} />
                  Export
                </button>
              </div>

              {/* IMPORT */}

              <div className="settings-data-card">
                <div className="settings-data-icon">
                  <Upload size={22} />
                </div>

                <div className="settings-data-info">
                  <h3>Import Workspace Backup</h3>

                  <p>
                    Restore your workspace from a previously exported
                    NEXORA JSON backup. Included sections will replace
                    their current data.
                  </p>
                </div>

                <button
                  className="settings-secondary-button"
                  onClick={openImportPicker}
                  disabled={importing}
                >
                  <Upload size={16} />
                  {importing ? "Importing..." : "Import"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={importWorkspace}
                  style={{ display: "none" }}
                />
              </div>

              {/* RESET SETTINGS */}

              <div className="settings-data-card">
                <div className="settings-data-icon">
                  <RotateCcw size={22} />
                </div>

                <div className="settings-data-info">
                  <h3>Reset Settings</h3>

                  <p>
                    Restore profile, appearance, notification and
                    task preferences to their defaults. Your
                    workspace content will remain untouched.
                  </p>
                </div>

                <button
                  className="settings-danger-button"
                  onClick={resetSettings}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {/* RESET WORKSPACE */}

              <div className="settings-data-card danger-card">
                <div className="settings-data-icon">
                  <Trash2 size={22} />
                </div>

                <div className="settings-data-info">
                  <h3>Reset Workspace Data</h3>

                  <p>
                    Clear supported workspace content stored in this
                    browser. This includes projects, tasks, calendar
                    events, notes, activity history and notifications.
                    This action cannot be undone.
                  </p>
                </div>

                <button
                  className="settings-danger-button"
                  onClick={resetWorkspace}
                >
                  <Trash2 size={16} />
                  Reset Workspace
                </button>
              </div>

              <div className="settings-security-note">
                <ShieldCheck size={19} />

                <p>
                  Your workspace data is currently stored in this
                  browser's LocalStorage. Export a backup before
                  clearing browser data or resetting your workspace.
                </p>
              </div>

              <div className="settings-security-note">
                <FileJson size={19} />

                <p>
                  Backup files are JSON files. Only import backup
                  files that you trust and recognize as NEXORA backups.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
