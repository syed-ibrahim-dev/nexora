
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, NotebookPen } from "lucide-react";

const noteColors = [
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" }
];

const categories = ["Work", "Personal", "Ideas", "Study", "Other"];

function NoteModal({ note, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: note?.title || "",
    content: note?.content || "",
    category: note?.category || "Work",
    color: note?.color || "purple"
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    if (!formData.content.trim()) {
      setError("Please enter some note content.");
      return;
    }

    onSave({
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim()
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="note-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          className="note-modal"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-heading"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="note-modal-header">
            <div className="note-modal-title">
              <div className="note-modal-icon">
                <NotebookPen size={19} />
              </div>

              <div>
                <span>NEXORA WORKSPACE</span>
                <h2 id="note-modal-heading">
                  {note ? "Edit Note" : "Create New Note"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Note Title

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your note a title..."
                autoFocus
                maxLength={100}
              />
            </label>

            <label>
              Note Content

              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your thoughts here..."
                rows={7}
              />
            </label>

            <div className="note-form-row">
              <label>
                Category

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Note Color

                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                >
                  {noteColors.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <p className="note-form-error" role="alert">
                {error}
              </p>
            )}

            <div className="note-modal-actions">
              <button
                type="button"
                className="note-cancel-button"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="note-save-button"
              >
                {note ? "Save Changes" : "Create Note"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default NoteModal;
