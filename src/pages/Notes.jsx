
import { useEffect, useMemo, useState } from "react";
import { NotebookPen } from "lucide-react";

import NotesToolbar from "../components/notes/NoteToolbar.jsx";
import NoteCard from "../components/notes/NoteCard.jsx";
import NoteModal from "../components/notes/NoteModal.jsx";

import "./Notes.css";

const STORAGE_KEY = "nexora_notes_v1";
const ACTIVITY_STORAGE_KEY = "nexora_activity_v1";

const defaultNotes = [
  {
    id: "note-1",
    title: "Website Development Ideas",
    content:
      "Explore modern layouts, smooth animations, responsive navigation and better user experiences for upcoming projects.",
    category: "Ideas",
    color: "purple",
    pinned: true,
    createdAt: "2026-11-15T10:00:00.000Z",
    updatedAt: "2026-11-15T10:00:00.000Z"
  },
  {
    id: "note-2",
    title: "Project Checklist",
    content:
      "Review project requirements\nComplete responsive layouts\nTest interactive elements\nCheck mobile navigation\nPrepare final documentation",
    category: "Work",
    color: "blue",
    pinned: false,
    createdAt: "2026-11-14T10:00:00.000Z",
    updatedAt: "2026-11-14T10:00:00.000Z"
  },
  {
    id: "note-3",
    title: "Learning Goals",
    content:
      "Improve React skills, understand APIs, practise JavaScript logic and explore modern frontend tools.",
    category: "Personal",
    color: "green",
    pinned: false,
    createdAt: "2026-11-13T10:00:00.000Z",
    updatedAt: "2026-11-13T10:00:00.000Z"
  }
];

function readNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return defaultNotes;
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultNotes;
  } catch {
    return defaultNotes;
  }
}

/* =========================================
   NOTES ACTIVITY TRACKING
========================================= */

function createNoteActivity(action, note, customMessage = "") {
  const now = new Date().toISOString();

  const messages = {
    created: `${note.title} was added to your notes.`,
    updated: `${note.title} was updated.`,
    deleted: `${note.title} was deleted.`,
    pinned: `${note.title} was pinned.`,
    unpinned: `${note.title} was unpinned.`
  };

  const titles = {
    created: "Note created",
    updated: "Note updated",
    deleted: "Note deleted",
    pinned: "Note pinned",
    unpinned: "Note unpinned"
  };

  const activity = {
    id: `activity-note-${note.id}-${action}-${Date.now()}`,
    type: "note",
    action: action === "pinned" || action === "unpinned" ? "updated" : action,
    title: titles[action] || "Note activity",
    message: customMessage || messages[action] || `${note.title} was changed.`,
    description: customMessage || messages[action] || `${note.title} was changed.`,
    entityName: note.title,
    entityId: note.id,
    createdAt: now,
    date: now
  };

  try {
    const savedActivities = JSON.parse(
      localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]"
    );

    const activities = Array.isArray(savedActivities)
      ? savedActivities
      : [];

    const updatedActivities = [activity, ...activities].slice(0, 200);

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(updatedActivities)
    );

    window.dispatchEvent(new CustomEvent("nexora:activity-updated"));
  } catch (error) {
    console.error("Unable to save note activity:", error);
  }
}

function Notes() {
  const [notes, setNotes] = useState(readNotes);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("updated");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...notes]
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.category.toLowerCase().includes(query);

        const matchesCategory =
          categoryFilter === "All" ||
          note.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return Number(b.pinned) - Number(a.pinned);
        }

        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }

        if (sortBy === "oldest") {
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [notes, search, categoryFilter, sortBy]);

  const pinnedCount = notes.filter((note) => note.pinned).length;

  const openCreateModal = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  /* =========================================
     CREATE / UPDATE NOTE
  ========================================= */

  const saveNote = (formData) => {
    const now = new Date().toISOString();

    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        ...formData,
        updatedAt: now
      };

      setNotes((previous) =>
        previous.map((note) =>
          note.id === editingNote.id ? updatedNote : note
        )
      );

      createNoteActivity("updated", updatedNote);
    } else {
      const newNote = {
        id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
        ...formData,
        pinned: false,
        createdAt: now,
        updatedAt: now
      };

      setNotes((previous) => [newNote, ...previous]);

      createNoteActivity("created", newNote);
    }

    closeModal();
  };

  /* =========================================
     DELETE NOTE
  ========================================= */

  const deleteNote = (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    const noteToDelete = notes.find((note) => note.id === noteId);

    if (!noteToDelete) return;

    setNotes((previous) =>
      previous.filter((note) => note.id !== noteId)
    );

    createNoteActivity("deleted", noteToDelete);
  };

  /* =========================================
     PIN / UNPIN NOTE
  ========================================= */

  const togglePin = (noteId) => {
    const noteToUpdate = notes.find((note) => note.id === noteId);

    if (!noteToUpdate) return;

    const updatedNote = {
      ...noteToUpdate,
      pinned: !noteToUpdate.pinned,
      updatedAt: new Date().toISOString()
    };

    setNotes((previous) =>
      previous.map((note) =>
        note.id === noteId ? updatedNote : note
      )
    );

    createNoteActivity(
      updatedNote.pinned ? "pinned" : "unpinned",
      updatedNote
    );
  };

  return (
    <div className="notes-page animate-fade">

      <div className="notes-header">
        <div>
          <span className="notes-eyebrow">
            NEXORA WORKSPACE
          </span>

          <h1>My Notes</h1>

          <p>
            Capture ideas, organize thoughts and keep everything in one place.
          </p>
        </div>

        <button
          className="notes-create-button"
          onClick={openCreateModal}
        >
          <NotebookPen size={17} />
          Create Note
        </button>
      </div>

      <div className="notes-stats">

        <div className="notes-stat-card">
          <div className="notes-stat-icon purple">
            <NotebookPen size={20} />
          </div>

          <div>
            <span>Total Notes</span>
            <h3>{notes.length}</h3>
          </div>
        </div>

        <div className="notes-stat-card">
          <div className="notes-stat-icon yellow">
            <span>★</span>
          </div>

          <div>
            <span>Pinned Notes</span>
            <h3>{pinnedCount}</h3>
          </div>
        </div>

        <div className="notes-stat-card">
          <div className="notes-stat-icon cyan">
            <NotebookPen size={20} />
          </div>

          <div>
            <span>Categories</span>
            <h3>
              {new Set(notes.map((note) => note.category)).size}
            </h3>
          </div>
        </div>

      </div>

      <NotesToolbar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={view}
        setView={setView}
        onCreate={openCreateModal}
      />

      {filteredNotes.length > 0 ? (
        <div className={`notes-grid ${view === "list" ? "list-view" : ""}`}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEditModal}
              onDelete={deleteNote}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      ) : (
        <div className="notes-empty glass-card">
          <div className="notes-empty-icon">
            <NotebookPen size={30} />
          </div>

          <h3>
            {search || categoryFilter !== "All"
              ? "No matching notes"
              : "Your notes space is empty"}
          </h3>

          <p>
            {search || categoryFilter !== "All"
              ? "Try another search or change your category filter."
              : "Create your first note and start organizing your ideas."}
          </p>

          <button
            className="notes-create-button"
            onClick={openCreateModal}
          >
            <NotebookPen size={16} />
            Create Note
          </button>
        </div>
      )}

      {modalOpen && (
        <NoteModal
          note={editingNote}
          onSave={saveNote}
          onClose={closeModal}
        />
      )}

    </div>
  );
}

export default Notes;
