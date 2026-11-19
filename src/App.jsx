
import { lazy, Suspense, useEffect, useState } from "react";

// Disable automatic browser scroll restoration.
if (
  typeof window !== "undefined" &&
  "scrollRestoration" in window.history
) {
  window.history.scrollRestoration = "manual";
}

// Load page modules only when needed.
const Analytics = lazy(() => import("./pages/Analytics"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Projects = lazy(() => import("./pages/Projects"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Notes = lazy(() => import("./pages/Notes"));
const ActivityCenter = lazy(() => import("./pages/ActivityCenter.jsx"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));

import Sidebar from "./components/layout/Sidebar.jsx";
import Topbar from "./components/layout/Topbar.jsx";

import {
  FolderKanban,
  CheckSquare,
  CalendarDays,
  ChartNoAxesCombined,
  Activity,
  Settings,
  CircleHelp,
  Sparkles,
  NotebookPen
} from "lucide-react";

import {
  applyWorkspaceAppearance,
  getSavedSettings,
  STORAGE_KEY
} from "./utils/workspaceSettings";

import "./App.css";

const validPages = [
  "Overview",
  "Projects",
  "My Tasks",
  "Calendar",
  "Notes",
  "Analytics",
  "Activity Center",
  "Settings",
  "Help & Support"
];

// Keep the icon mapping outside the component.
const pageIcons = {
  Projects: FolderKanban,
  "My Tasks": CheckSquare,
  Calendar: CalendarDays,
  Notes: NotebookPen,
  Analytics: ChartNoAxesCombined,
  "Activity Center": Activity,
  Settings: Settings,
  "Help & Support": CircleHelp
};

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary, #9298b0)",
        fontSize: "14px"
      }}
    >
      Loading workspace...
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reset scroll position when the app opens or page changes.
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);

      const mainContent = document.querySelector(".main-content");

      if (mainContent) {
        mainContent.scrollTop = 0;

        mainContent.scrollTo({
          top: 0,
          behavior: "auto"
        });
      }
    };

    scrollToTop();

    const frameId = window.requestAnimationFrame(scrollToTop);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activePage]);

  // Apply saved appearance settings.
  useEffect(() => {
    const updateAppearance = () => {
      applyWorkspaceAppearance(getSavedSettings());
    };

    updateAppearance();

    window.addEventListener(
      "nexora:settings-updated",
      updateAppearance
    );

    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        updateAppearance();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Keep system theme synchronized.
    const systemTheme = window.matchMedia(
      "(prefers-color-scheme: light)"
    );

    systemTheme.addEventListener("change", updateAppearance);

    return () => {
      window.removeEventListener(
        "nexora:settings-updated",
        updateAppearance
      );

      window.removeEventListener("storage", handleStorageChange);

      systemTheme.removeEventListener("change", updateAppearance);
    };
  }, []);

  // Handle navigation events from other modules.
  useEffect(() => {
    const handleNexoraNavigation = (event) => {
      const requestedPage = event.detail;

      if (!validPages.includes(requestedPage)) {
        return;
      }

      setActivePage(requestedPage);
      setMobileOpen(false);
    };

    window.addEventListener(
      "nexora:navigate",
      handleNexoraNavigation
    );

    return () => {
      window.removeEventListener(
        "nexora:navigate",
        handleNexoraNavigation
      );
    };
  }, []);

  const PageIcon = pageIcons[activePage] || Sparkles;

  const renderPage = () => {
    switch (activePage) {
      case "Overview":
        return <Dashboard />;

      case "Projects":
        return <Projects />;

      case "My Tasks":
        return <Tasks />;

      case "Calendar":
        return <Calendar />;

      case "Notes":
        return <Notes />;

      case "Analytics":
        return <Analytics />;

      case "Activity Center":
        return <ActivityCenter />;

      case "Settings":
        return <SettingsPage />;

      case "Help & Support":
        return <HelpSupport />;

      default:
        return (
          <div className="coming-soon glass-card animate-fade">
            <div className="coming-soon-icon">
              <PageIcon size={32} />
            </div>

            <span className="coming-soon-label">
              NEXORA WORKSPACE
            </span>

            <h1>{activePage}</h1>

            <p>
              We're building something amazing here.
              This section will be available in an upcoming
              development stage.
            </p>

            <button
              className="primary-button"
              onClick={() => setActivePage("Overview")}
            >
              Back to Overview
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main-layout">
        <Topbar
          activePage={activePage}
          setMobileOpen={setMobileOpen}
        />

        <div className="main-content">
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
