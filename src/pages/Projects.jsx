
import { useEffect, useMemo, useState } from "react";
import { FolderKanban } from "lucide-react";

import ProjectStats from "../components/projects/ProjectStats";
import ProjectToolbar from "../components/projects/ProjectToolbar";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectModal from "../components/projects/ProjectModal";

import "./Projects.css";

const STORAGE_KEY = "nexora_projects_v1";
const NOTIFICATIONS_KEY = "nexora_notifications_v1";
const ACTIVITY_STORAGE_KEY = "nexora_activity_v1";

const defaultProjects = [
  {
    id: "project-1",
    name: "Website Redesign",
    category: "Design & Development",
    progress: 85,
    color: "purple",
    date: "2026-11-24",
  },
  {
    id: "project-2",
    name: "Mobile App Concept",
    category: "Product Design",
    progress: 62,
    color: "cyan",
    date: "2026-11-28",
  },
  {
    id: "project-3",
    name: "Marketing Strategy",
    category: "Marketing",
    progress: 38,
    color: "orange",
    date: "2026-12-05",
  },
];

const normalizeProject = (project) => ({
  ...project,
  progress: Math.min(
    100,
    Math.max(0, Number(project.progress) || 0)
  ),
});

const readProjects = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return defaultProjects.map(normalizeProject);
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultProjects.map(normalizeProject);
    }

    return parsed.map(normalizeProject);
  } catch (error) {
    console.error("Unable to load projects:", error);
    return defaultProjects.map(normalizeProject);
  }
};

/* =========================================
   PROJECT STATUS
========================================= */

const getProjectStatus = (progress) => {
  const value = Number(progress) || 0;

  if (value >= 100) return "completed";
  if (value <= 0) return "pending";

  return "in-progress";
};

/* =========================================
   PROJECT NOTIFICATIONS
========================================= */

const createProjectNotification = (action, project) => {
  const notificationMessages = {
    created: {
      title: "New project created",
      message: `${project.name} has been added to your workspace.`,
    },

    updated: {
      title: "Project updated",
      message: `${project.name} has been updated.`,
    },

    completed: {
      title: "Project completed",
      message: `${project.name} has reached 100% progress.`,
    },

    deleted: {
      title: "Project deleted",
      message: `${project.name} has been removed from your workspace.`,
    },
  };

  const notificationDetails = notificationMessages[action];

  if (!notificationDetails) return;

  const now = new Date().toISOString();

  const notification = {
    id: `project-${project.id}-${action}-${Date.now()}`,
    type: "project",
    title: notificationDetails.title,
    message: notificationDetails.message,
    date: now,
    createdAt: now,
    read: false,
  };

  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    const existingNotifications = Array.isArray(parsed)
      ? parsed
      : [];

    const updatedNotifications = [
      notification,
      ...existingNotifications,
    ].slice(0, 50);

    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new CustomEvent("nexora:notifications-updated")
    );
  } catch (error) {
    console.error("Unable to create project notification:", error);
  }
};

/* =========================================
   PROJECT ACTIVITY HISTORY
========================================= */

const createProjectActivity = (action, project) => {
  const activityMessages = {
    created: {
      title: "Project created",
      message: `${project.name} was added to your workspace.`,
    },

    updated: {
      title: "Project updated",
      message: `${project.name} was updated.`,
    },

    completed: {
      title: "Project completed",
      message: `${project.name} was marked as completed.`,
    },

    deleted: {
      title: "Project deleted",
      message: `${project.name} was removed from your workspace.`,
    },
  };

  const activityDetails = activityMessages[action];

  if (!activityDetails) return;

  const now = new Date().toISOString();

  const activity = {
    id: `activity-project-${project.id}-${action}-${Date.now()}`,
    type: "project",
    action,
    title: activityDetails.title,
    message: activityDetails.message,
    description: activityDetails.message,
    entityName: project.name,
    entityId: project.id,
    createdAt: now,
    date: now,
  };

  try {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    const existingActivities = Array.isArray(parsed)
      ? parsed
      : [];

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
    console.error("Unable to save project activity:", error);
  }
};

/* =========================================
   PROJECTS PAGE
========================================= */

const Projects = () => {
  const [projects, setProjects] = useState(readProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Refresh projects when another module updates shared project data.
  useEffect(() => {
    const handleProjectsUpdated = (event) => {
      // Ignore this page's own update event to prevent a refresh loop.
      if (event?.detail?.source === "projects") return;

      setProjects(readProjects());
    };

    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setProjects(readProjects());
      }
    };

    window.addEventListener(
      "nexora:projects-updated",
      handleProjectsUpdated
    );

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "nexora:projects-updated",
        handleProjectsUpdated
      );

      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Save projects and notify other application modules.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

      window.dispatchEvent(
        new CustomEvent("nexora:projects-updated", {
          detail: {
            source: "projects"
          }
        })
      );
    } catch (error) {
      console.error("Unable to save projects:", error);
    }
  }, [projects]);

  // Search and filter projects.
  const filteredProjects = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return projects.filter((project) => {
      const name = String(project.name || "").toLowerCase();
      const category = String(project.category || "").toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        category.includes(searchText);

      const status = getProjectStatus(project.progress);
      const matchesFilter = filter === "all" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const openCreateModal = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  // Create or update a project.
  const saveProject = (formData) => {
    const now = new Date().toISOString();

    const cleanData = {
      ...formData,
      name: String(formData.name || "").trim(),
      category: String(formData.category || "").trim(),
      progress: Math.min(
        100,
        Math.max(0, Number(formData.progress) || 0)
      ),
    };

    if (editingProject) {
      const wasCompleted = Number(editingProject.progress) >= 100;
      const isNowCompleted = cleanData.progress >= 100;

      const updatedProject = {
        ...editingProject,
        ...cleanData,
        updatedAt: now,
      };

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProject.id
            ? updatedProject
            : project
        )
      );

      if (!wasCompleted && isNowCompleted) {
        createProjectNotification("completed", updatedProject);
        createProjectActivity("completed", updatedProject);
      } else {
        createProjectNotification("updated", updatedProject);
        createProjectActivity("updated", updatedProject);
      }
    } else {
      const newProject = {
        ...cleanData,
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `project-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      setProjects((currentProjects) => [
        newProject,
        ...currentProjects,
      ]);

      createProjectNotification("created", newProject);
      createProjectActivity("created", newProject);
    }

    closeModal();
  };

  // Delete a project.
  const deleteProject = (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) return;

    setProjects((currentProjects) =>
      currentProjects.filter((item) => item.id !== project.id)
    );

    createProjectNotification("deleted", project);
    createProjectActivity("deleted", project);
  };

  // Update progress.
  const updateProgress = (projectId, value) => {
    const progress = Math.min(
      100,
      Math.max(0, Number(value) || 0)
    );

    const currentProject = projects.find(
      (project) => project.id === projectId
    );

    if (!currentProject) return;

    const now = new Date().toISOString();

    const updatedProject = {
      ...currentProject,
      progress,
      updatedAt: now,
    };

    if (
      Number(currentProject.progress) < 100 &&
      progress >= 100
    ) {
      createProjectNotification("completed", updatedProject);
      createProjectActivity("completed", updatedProject);
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? updatedProject
          : project
      )
    );
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
  };

  return (
    <div className="projects-page">
      <header className="projects-page-header">
        <div>
          <span className="projects-eyebrow">
            WORKSPACE / PROJECTS
          </span>

          <h1>Projects</h1>

          <p>
            Organize your work, track progress, and keep everything moving.
          </p>
        </div>

        <div className="projects-header-icon">
          <FolderKanban size={25} />
        </div>
      </header>

      <ProjectStats projects={projects} />

      <section className="projects-list-section">
        <div className="projects-section-heading">
          <div>
            <h2>All Projects</h2>
            <p>Manage and monitor your active work.</p>
          </div>

          <span className="projects-count">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <ProjectToolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          onAdd={openCreateModal}
        />

        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEditModal}
                onDelete={deleteProject}
                onProgressChange={updateProgress}
              />
            ))}
          </div>
        ) : (
          <div className="projects-empty-state">
            <div className="projects-empty-icon">
              <FolderKanban size={28} />
            </div>

            <h3>No projects found</h3>

            <p>
              {search || filter !== "all"
                ? "Try changing your search or filter."
                : "Create your first project to get started."}
            </p>

            {search || filter !== "all" ? (
              <button type="button" onClick={clearFilters}>
                Clear search and filters
              </button>
            ) : (
              <button type="button" onClick={openCreateModal}>
                Create your first project
              </button>
            )}
          </div>
        )}
      </section>

      <ProjectModal
        isOpen={modalOpen}
        project={editingProject}
        onClose={closeModal}
        onSave={saveProject}
      />
    </div>
  );
};

export default Projects;
