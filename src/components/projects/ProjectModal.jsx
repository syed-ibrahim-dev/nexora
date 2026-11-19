
import { useEffect, useState } from "react";
import { X, FolderPlus, CalendarDays, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const emptyForm = {
  name: "",
  category: "",
  date: "",
  progress: 0,
  color: "purple",
};

const colors = ["purple", "cyan", "orange", "green"];

const createFormData = (project) => {
  if (!project) {
    return { ...emptyForm };
  }

  return {
    name: project.name || "",
    category: project.category || "",
    date: project.date || "",
    progress: Math.min(
      100,
      Math.max(0, Number(project.progress) || 0)
    ),
    color: project.color || "purple",
  };
};

const ProjectModalContent = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState(() =>
    createFormData(project)
  );

  const [error, setError] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");

    setFormData((current) => ({
      ...current,
      [name]:
        name === "progress"
          ? Math.min(100, Math.max(0, Number(value) || 0))
          : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const category = formData.category.trim();

    if (!name || !category) {
      setError("Please complete all required fields.");
      return;
    }

    if (formData.date) {
      const selectedDate = new Date(`${formData.date}T00:00:00`);

      if (Number.isNaN(selectedDate.getTime())) {
        setError("Please select a valid deadline.");
        return;
      }
    }

    onSave({
      ...formData,
      name,
      category,
      progress: Math.min(
        100,
        Math.max(0, Number(formData.progress) || 0)
      ),
    });
  };

  return (
    <motion.div
      className="project-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="project-modal"
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        {/* HEADER */}
        <div className="project-modal-header">
          <div>
            <div className="project-modal-icon">
              <FolderPlus size={21} />
            </div>

            <h2 id="project-modal-title">
              {project ? "Edit Project" : "Create New Project"}
            </h2>

            <p>
              {project
                ? "Update your project details."
                : "Add a new project to your workspace."}
            </p>
          </div>

          <button
            type="button"
            className="project-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="project-form-group">
            <label htmlFor="project-name">
              Project Name <span>*</span>
            </label>

            <input
              id="project-name"
              name="name"
              type="text"
              placeholder="e.g. Website Redesign"
              value={formData.name}
              onChange={handleChange}
              maxLength={60}
              required
              autoFocus
            />

            <small>{formData.name.length}/60 characters</small>
          </div>

          <div className="project-form-group">
            <label htmlFor="project-category">
              Category <span>*</span>
            </label>

            <input
              id="project-category"
              name="category"
              type="text"
              placeholder="e.g. Design & Development"
              value={formData.category}
              onChange={handleChange}
              maxLength={50}
              required
            />
          </div>

          <div className="project-form-row">
            <div className="project-form-group">
              <label htmlFor="project-date">
                <CalendarDays size={14} />
                Deadline
              </label>

              <input
                id="project-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="project-form-group">
              <label htmlFor="project-progress">
                Initial Progress (%)
              </label>

              <input
                id="project-progress"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* COLOR SELECTION */}
          <div className="project-form-group">
            <label>Project Color</label>

            <div className="project-color-options">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`project-color-choice ${color} ${
                    formData.color === color ? "selected" : ""
                  }`}
                  onClick={() => {
                    setFormData((current) => ({
                      ...current,
                      color,
                    }));
                  }}
                  aria-label={`${color} project color`}
                  aria-pressed={formData.color === color}
                >
                  {formData.color === color && (
                    <CheckCircle2 size={15} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* VALIDATION MESSAGE */}
          {error && (
            <p className="project-form-error" role="alert">
              {error}
            </p>
          )}

          {/* ACTION BUTTONS */}
          <div className="project-modal-actions">
            <button
              type="button"
              className="project-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="project-save-button"
            >
              {project ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ProjectModal = ({ isOpen, project, onClose, onSave }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <ProjectModalContent
          key={project?.id ?? "new-project"}
          project={project}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
