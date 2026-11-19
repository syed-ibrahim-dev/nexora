
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
  Folder,
  CheckCircle2,
  Clock3,
  Circle,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const getProjectStatus = (progress) => {
  const value = Number(progress) || 0;

  if (value >= 100) return "completed";
  if (value <= 0) return "pending";

  return "in-progress";
};

const formatDate = (date) => {
  if (!date) return "No deadline";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusDetails = (status) => {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        icon: CheckCircle2,
      };

    case "pending":
      return {
        label: "Not Started",
        icon: Circle,
      };

    default:
      return {
        label: "In Progress",
        icon: Clock3,
      };
  }
};

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onProgressChange,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const progress = Math.min(
    100,
    Math.max(0, Number(project.progress) || 0)
  );

  const status = getProjectStatus(progress);
  const statusDetails = getStatusDetails(status);
  const StatusIcon = statusDetails.icon;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Close menu with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleProgressChange = (event) => {
    onProgressChange(
      project.id,
      Number(event.target.value)
    );
  };

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      layout
    >
      {/* CARD TOP */}
      <div className="project-card-top">

        <div
          className={`project-folder-icon ${
            project.color || "purple"
          }`}
        >
          <Folder size={21} />
        </div>

        <div
          className="project-menu-wrapper"
          ref={menuRef}
        >
          <button
            type="button"
            className="project-menu-trigger"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            aria-label="Project options"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <MoreHorizontal size={21} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="project-menu"
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(project);
                  }}
                >
                  <Pencil size={15} />
                  Edit project
                </button>

                <button
                  type="button"
                  className="delete-action"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(project);
                  }}
                >
                  <Trash2 size={15} />
                  Delete project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PROJECT INFORMATION */}
      <div className="project-card-heading">
        <span className="project-category">
          {project.category || "General"}
        </span>

        <h3>{project.name}</h3>
      </div>

      {/* PROJECT STATUS */}
      <div className="project-card-status-row">

        <span className={`project-status ${status}`}>
          <StatusIcon size={13} />
          {statusDetails.label}
        </span>

        <span className="project-progress-number">
          {progress}%
        </span>

      </div>

      {/* PROGRESS BAR */}
      <div
        className="project-progress-track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${project.name} progress`}
      >
        <motion.div
          className={`project-progress-fill ${
            project.color || "purple"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* PROGRESS CONTROL */}
      <div className="project-progress-control">
        <div className="project-progress-control-heading">
          <label htmlFor={`progress-${project.id}`}>
            Update progress
          </label>

          <span>{progress}/100</span>
        </div>

        <input
          id={`progress-${project.id}`}
          type="range"
          min="0"
          max="100"
          step="1"
          value={progress}
          onChange={handleProgressChange}
          aria-label={`Update ${project.name} progress`}
        />
      </div>

      {/* CARD FOOTER */}
      <div className="project-card-footer">

        <span className="project-deadline">
          <CalendarDays size={15} />
          {formatDate(project.date)}
        </span>

        <span className="project-card-arrow">
          <ArrowUpRight size={17} />
        </span>

      </div>

    </motion.article>
  );
};

export default ProjectCard;
