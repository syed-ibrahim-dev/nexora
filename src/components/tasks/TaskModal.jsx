
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  ListTodo,
  CalendarDays,
} from "lucide-react";

const createInitialForm = (defaultPriority = "medium") => ({
  title: "",
  description: "",
  priority: defaultPriority,
  status: "pending",
  dueDate: "",
});

const TaskModalContent = ({
  isOpen,
  task,
  defaultPriority,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState(() => ({
    ...createInitialForm(defaultPriority),
    ...(task || {}),
  }));

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="task-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className="task-modal-header">
              <div className="task-modal-heading-icon">
                <ListTodo size={20} />
              </div>

              <div className="task-modal-heading-text">
                <h2 id="task-modal-title">
                  {task ? "Edit Task" : "Create New Task"}
                </h2>

                <p>
                  {task
                    ? "Update your task details."
                    : "Add a new task to your workspace."}
                </p>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form className="task-form" onSubmit={handleSubmit}>
              <div className="task-form-group">
                <label htmlFor="task-title">Task Title *</label>

                <input
                  id="task-title"
                  name="title"
                  type="text"
                  placeholder="e.g. Complete homepage design"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={100}
                  autoFocus
                />

                <span className="task-character-count">
                  {form.title.length}/100
                </span>
              </div>

              <div className="task-form-group">
                <label htmlFor="task-description">Description</label>

                <textarea
                  id="task-description"
                  name="description"
                  placeholder="Describe what needs to be done..."
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="task-form-row">
                <div className="task-form-group">
                  <label htmlFor="task-priority">Priority</label>

                  <select
                    id="task-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="task-form-group">
                  <label htmlFor="task-status">Status</label>

                  <select
                    id="task-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="task-form-group">
                <label htmlFor="task-date">
                  <CalendarDays size={14} />
                  Due Date
                </label>

                <input
                  id="task-date"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <p className="task-form-error">{error}</p>
              )}

              <div className="task-modal-actions">
                <button
                  type="button"
                  className="task-cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="task-save-button"
                >
                  {task ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TaskModal = ({
  isOpen,
  task,
  defaultPriority = "medium",
  onClose,
  onSave,
}) => {
  const taskKey = task ? JSON.stringify(task) : "new-task";

  return (
    <TaskModalContent
      key={`${isOpen}-${defaultPriority}-${taskKey}`}
      isOpen={isOpen}
      task={task}
      defaultPriority={defaultPriority}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default TaskModal;
