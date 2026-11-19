
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  Pin,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarDays
} from "lucide-react";

function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const formattedDate = new Date(note.updatedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`note-card note-${note.color || "purple"}`}
    >

      <div className="note-card-header">

        <span className="note-category">
          {note.category}
        </span>

        <div className="note-card-actions">

          <button
            className={`note-pin-button ${note.pinned ? "pinned" : ""}`}
            onClick={() => onTogglePin(note.id)}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            title={note.pinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={16} />
          </button>

          <div className="note-menu-wrapper" ref={menuRef}>
            <button
              className="note-menu-trigger"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Note options"
            >
              <MoreHorizontal size={19} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  className="note-dropdown"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(note);
                    }}
                  >
                    <Pencil size={14} />
                    Edit Note
                  </button>

                  <button
                    className="delete-action"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(note.id);
                    }}
                  >
                    <Trash2 size={14} />
                    Delete Note
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      <div
        className="note-card-content"
        onClick={() => onEdit(note)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter") onEdit(note);
        }}
      >
        <h3>{note.title}</h3>

        <p>{note.content}</p>
      </div>

      <div className="note-card-footer">
        <span>
          <CalendarDays size={13} />
          {formattedDate}
        </span>

        {note.pinned && (
          <span className="note-pinned-label">
            <Pin size={11} />
            Pinned
          </span>
        )}
      </div>

    </motion.article>
  );
}

export default NoteCard;
