
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  Circle,
  Flag,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "No due date";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const statusDetails = {
    pending: {
      label: "Pending",
      icon: Circle,
    },
    "in-progress": {
      label: "In Progress",
      icon: Clock3,
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
    },
  };

  const priorityLabels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const currentStatus =
    statusDetails[task.status] || statusDetails.pending;

  const StatusIcon = currentStatus.icon;

  const handleStatusChange = (event) => {
    onStatusChange(task.id, event.target.value);
  };

  return (
    <motion.article
      className={`task-card ${task.status}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
      layout
    >
      <div className="task-card-header">
        <div className="task-card-main">
          <h3 className={task.status === "completed" ? "completed-title" : ""}>
            {task.title}
          </h3>

          <p>{task.description || "No description provided."}</p>
        </div>

        <div className="task-card-menu" ref={menuRef}>
          <button
            type="button"
            className="task-menu-button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label="Task options"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={19} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="task-dropdown"
                initial={{ opacity: 0, y: -5, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                >
                  <Pencil size={15} />
                  Edit Task
                </button>

                <button
                  type="button"
                  className="delete"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task);
                  }}
                >
                  <Trash2 size={15} />
                  Delete Task
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="task-card-meta">
        <span className={`task-priority ${task.priority}`}>
          <Flag size={12} />
          {priorityLabels[task.priority] || "Medium"} Priority
        </span>

        <span className={`task-status ${task.status}`}>
          <StatusIcon size={13} />
          {currentStatus.label}
        </span>
      </div>

      <div className="task-card-footer">
        <div className="task-due-date">
          <CalendarDays size={14} />
          <span>{formatDate(task.dueDate)}</span>
        </div>

        <select
          className="task-status-select"
          value={task.status}
          onChange={handleStatusChange}
          aria-label={`Change status of ${task.title}`}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </motion.article>
  );
};

export default TaskCard;
