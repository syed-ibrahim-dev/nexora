
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  ChartNoAxesCombined,
  Activity,
  Settings,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  X,
  NotebookPen
} from "lucide-react";

import "./Sidebar.css";

const SETTINGS_KEY = "nexora_settings_v1";

const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "Projects", icon: FolderKanban },
      { name: "My Tasks", icon: CheckSquare },
      { name: "Calendar", icon: CalendarDays },
      { name: "Notes", icon: NotebookPen }
    ]
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Analytics", icon: ChartNoAxesCombined },
      { name: "Activity Center", icon: Activity }
    ]
  },
  {
    title: "PREFERENCES",
    items: [
      { name: "Settings", icon: Settings },
      { name: "Help & Support", icon: CircleHelp }
    ]
  }
];

function getProfileData() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return {
      name: saved.profile?.name || "Ibrahim",
      workspace:
        saved.profile?.workspace || "Personal Workspace"
    };
  } catch {
    return {
      name: "Ibrahim",
      workspace: "Personal Workspace"
    };
  }
}

function Sidebar({
  activePage,
  setActivePage,
  mobileOpen,
  setMobileOpen
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(getProfileData);

  // Keep sidebar profile synchronized with Settings.
  useEffect(() => {
    const updateProfile = () => {
      setProfile(getProfileData());
    };

    const handleStorageUpdate = (event) => {
      if (!event.key || event.key === SETTINGS_KEY) {
        updateProfile();
      }
    };

    window.addEventListener(
      "nexora:settings-updated",
      updateProfile
    );

    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(
        "nexora:settings-updated",
        updateProfile
      );

      window.removeEventListener(
        "storage",
        handleStorageUpdate
      );
    };
  }, []);

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "I";

  const workspaceInitial =
    profile.workspace.trim().charAt(0).toUpperCase() || "N";

  const handleNavigation = (name) => {
    setActivePage(name);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <Zap size={23} fill="currentColor" />
            </div>

            {!collapsed && (
              <div className="brand-name">
                NEXORA<span>.</span>
                <small>PRODUCTIVITY SPACE</small>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <button
          type="button"
          className="collapse-button"
          onClick={() =>
            setCollapsed((previous) => !previous)
          }
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} />
          ) : (
            <PanelLeftClose size={17} />
          )}
        </button>

        <div className="workspace-switcher">
          <div className="workspace-avatar">
            {workspaceInitial}
          </div>

          {!collapsed && (
            <>
              <div className="workspace-info">
                <strong>{profile.workspace}</strong>
                <span>Free Plan</span>
              </div>

              <span className="workspace-arrow">⌄</span>
            </>
          )}
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="Main navigation"
        >
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              {!collapsed && (
                <p className="nav-group-title">
                  {group.title}
                </p>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.name;

                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`nav-item ${
                      active ? "active" : ""
                    }`}
                    onClick={() =>
                      handleNavigation(item.name)
                    }
                    title={collapsed ? item.name : undefined}
                    aria-current={
                      active ? "page" : undefined
                    }
                  >
                    <Icon size={19} strokeWidth={1.8} />

                    {!collapsed && (
                      <span>{item.name}</span>
                    )}

                    {item.name === "My Tasks" &&
                      !collapsed && (
                        <span className="nav-count">8</span>
                      )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="upgrade-card">
              <div className="upgrade-icon">
                <Zap size={18} />
              </div>

              <strong>Unlock your potential</strong>

              <p>
                Explore more ways to boost your productivity.
              </p>

              <button
                type="button"
                onClick={() => handleNavigation("Settings")}
              >
                Explore features
                <span>→</span>
              </button>
            </div>
          )}

          <div className="sidebar-user">
            <div className="user-avatar">
              {initials}
            </div>

            {!collapsed && (
              <div className="user-details">
                <strong>{profile.name}</strong>
                <span>Personal Account</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
