
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock3,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  FolderKanban
} from "lucide-react";

import "./Calendar.css";

const EVENTS_STORAGE_KEY = "nexora_calendar_events_v1";
const TASKS_STORAGE_KEY = "nexora_tasks_v1";
const PROJECTS_STORAGE_KEY = "nexora_projects_v1";
const ACTIVITY_STORAGE_KEY = "nexora_activity_v1";
const NOTIFICATIONS_STORAGE_KEY = "nexora_notifications_v1";

const categories = ["Personal", "Work", "Meeting", "Reminder"];

const categoryColors = {
  Personal: "personal",
  Work: "work",
  Meeting: "meeting",
  Reminder: "reminder"
};

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString) => {
  if (!dateString) return new Date();

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const readStorage = (key, fallback = []) => {
  try {
    const storedData = localStorage.getItem(key);

    if (!storedData) return fallback;

    const parsedData = JSON.parse(storedData);

    return Array.isArray(parsedData) ? parsedData : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
};

const getTaskStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    default:
      return "Pending";
  }
};

const getTaskStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "in-progress":
      return Clock3;
    default:
      return Circle;
  }
};

const createCalendarNotification = (action, calendarEvent) => {
  try {
    const notifications = readStorage(NOTIFICATIONS_STORAGE_KEY);

    const notification = {
      id: `calendar-${Date.now()}`,
      type: "calendar",
      title: `Event ${action}`,
      message: `${calendarEvent.title} has been ${action}.`,
      description: `${calendarEvent.title} on ${calendarEvent.date}`,
      createdAt: new Date().toISOString(),
      read: false
    };

    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify([notification, ...notifications])
    );

    window.dispatchEvent(
      new CustomEvent("nexora:notifications-updated")
    );
  } catch (error) {
    console.error("Calendar notification error:", error);
  }
};

const createCalendarActivity = (action, calendarEvent) => {
  try {
    const activities = readStorage(ACTIVITY_STORAGE_KEY);

    const activity = {
      id: `calendar-activity-${Date.now()}`,
      type: "calendar",
      action,
      title: calendarEvent.title,
      message: `Calendar event ${action}`,
      description: `${calendarEvent.title} was ${action}.`,
      entityName: calendarEvent.title,
      entityId: calendarEvent.id,
      createdAt: new Date().toISOString(),
      date: calendarEvent.date
    };

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify([activity, ...activities])
    );

    window.dispatchEvent(
      new CustomEvent("nexora:activity-updated")
    );
  } catch (error) {
    console.error("Calendar activity error:", error);
  }
};

function Calendar() {
  const today = new Date();
  const todayString = getLocalDateString(today);

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(todayString);

  const [events, setEvents] = useState(() =>
    readStorage(EVENTS_STORAGE_KEY)
  );

  const [tasks, setTasks] = useState(() =>
    readStorage(TASKS_STORAGE_KEY)
  );

  const [projects, setProjects] = useState(() =>
    readStorage(PROJECTS_STORAGE_KEY)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    date: todayString,
    time: "",
    category: "Personal",
    description: ""
  });

  // Refresh shared calendar data when other modules update it.
  useEffect(() => {
    const refreshCalendarData = () => {
      setEvents(readStorage(EVENTS_STORAGE_KEY));
      setTasks(readStorage(TASKS_STORAGE_KEY));
      setProjects(readStorage(PROJECTS_STORAGE_KEY));
    };

    window.addEventListener("storage", refreshCalendarData);
    window.addEventListener("nexora:activity-updated", refreshCalendarData);
    window.addEventListener("nexora:tasks-updated", refreshCalendarData);
    window.addEventListener("nexora:projects-updated", refreshCalendarData);

    return () => {
      window.removeEventListener("storage", refreshCalendarData);
      window.removeEventListener(
        "nexora:activity-updated",
        refreshCalendarData
      );
      window.removeEventListener(
        "nexora:tasks-updated",
        refreshCalendarData
      );
      window.removeEventListener(
        "nexora:projects-updated",
        refreshCalendarData
      );
    };
  }, []);

  // Save calendar events.
  useEffect(() => {
    try {
      localStorage.setItem(
        EVENTS_STORAGE_KEY,
        JSON.stringify(events)
      );

      window.dispatchEvent(
        new CustomEvent("nexora:calendar-updated")
      );
    } catch (error) {
      console.error("Unable to save calendar events:", error);
    }
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  // Build the calendar grid.
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const previousMonthLastDay = new Date(
      year,
      month,
      0
    ).getDate();

    const days = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const day = previousMonthLastDay - i;
      const date = new Date(year, month - 1, day);

      days.push({
        date: getLocalDateString(date),
        day,
        currentMonth: false
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);

      days.push({
        date: getLocalDateString(date),
        day,
        currentMonth: true,
        isToday: getLocalDateString(date) === todayString
      });
    }

    const remainingDays = 42 - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);

      days.push({
        date: getLocalDateString(date),
        day,
        currentMonth: false
      });
    }

    return days;
  }, [year, month, todayString]);

  // Events for the selected date.
  const selectedEvents = useMemo(() => {
    return events
      .filter((event) => event.date === selectedDate)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [events, selectedDate]);

  // Tasks for the selected date.
  const selectedTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate === selectedDate)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [tasks, selectedDate]);

  // Project deadlines for the selected date.
  const selectedProjects = useMemo(() => {
    return projects
      .filter((project) => project.date === selectedDate)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, selectedDate]);

  // Upcoming events, tasks, and project deadlines.
  const upcomingItems = useMemo(() => {
    const upcomingEvents = events
      .filter((event) => event.date && event.date >= todayString)
      .map((event) => ({
        id: `event-${event.id}`,
        originalId: event.id,
        type: "event",
        title: event.title,
        date: event.date,
        time: event.time || "",
        category: event.category || "Personal"
      }));

    const upcomingTasks = tasks
      .filter((task) => task.dueDate && task.dueDate >= todayString)
      .map((task) => ({
        id: `task-${task.id}`,
        originalId: task.id,
        type: "task",
        title: task.title,
        date: task.dueDate,
        time: "",
        category: "Task",
        status: task.status || "pending"
      }));

    const upcomingProjects = projects
      .filter((project) => project.date && project.date >= todayString)
      .map((project) => ({
        id: `project-${project.id}`,
        originalId: project.id,
        type: "project",
        title: project.name,
        date: project.date,
        time: "",
        category: "Project",
        progress: Number(project.progress) || 0
      }));

    return [
      ...upcomingEvents,
      ...upcomingTasks,
      ...upcomingProjects
    ]
      .sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);

        if (dateComparison !== 0) return dateComparison;

        return (a.time || "").localeCompare(b.time || "");
      })
      .slice(0, 5);
  }, [events, tasks, projects, todayString]);

  const totalEvents = events.length;

  const scheduledTasks = tasks.filter(
    (task) => task.dueDate
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const openAddModal = () => {
    setEditingEvent(null);

    setFormData({
      title: "",
      date: selectedDate,
      time: "",
      category: "Personal",
      description: ""
    });

    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);

    setFormData({
      title: event.title || "",
      date: event.date || selectedDate,
      time: event.time || "",
      category: event.category || "Personal",
      description: event.description || ""
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.date) return;

    const eventData = {
      ...formData,
      title: formData.title.trim()
    };

    if (editingEvent) {
      const updatedEvent = {
        ...editingEvent,
        ...eventData
      };

      setEvents((previous) =>
        previous.map((event) =>
          event.id === editingEvent.id
            ? updatedEvent
            : event
        )
      );

      createCalendarNotification("updated", updatedEvent);
      createCalendarActivity("updated", updatedEvent);
    } else {
      const newEvent = {
        id: `event-${Date.now()}`,
        ...eventData,
        createdAt: new Date().toISOString()
      };

      setEvents((previous) => [
        ...previous,
        newEvent
      ]);

      createCalendarNotification("created", newEvent);
      createCalendarActivity("created", newEvent);
    }

    setSelectedDate(formData.date);

    const eventDate = parseLocalDate(formData.date);

    setCurrentDate(
      new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        1
      )
    );

    closeModal();
  };

  const handleDeleteEvent = (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    setEvents((previous) =>
      previous.filter((item) => item.id !== event.id)
    );

    createCalendarNotification("deleted", event);
    createCalendarActivity("deleted", event);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setSelectedDate(todayString);
  };

  const handleUpcomingItemClick = (item) => {
    setSelectedDate(item.date);

    const selected = parseLocalDate(item.date);

    setCurrentDate(
      new Date(
        selected.getFullYear(),
        selected.getMonth(),
        1
      )
    );
  };

  const formatSelectedDate = (dateString) => {
    return parseLocalDate(dateString).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return "Time not set";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div>
          <h1>Calendar</h1>
          <p>Manage your schedule and stay organized.</p>
        </div>

        <button
          className="calendar-add-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Event
        </button>
      </div>

      {/* Overview cards */}
      <div className="calendar-overview">
        <div className="calendar-overview-card">
          <div className="calendar-overview-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Total Events</span>
            <h2>{totalEvents}</h2>
          </div>
        </div>

        <div className="calendar-overview-card">
          <div className="calendar-overview-icon">
            <FolderKanban size={21} />
          </div>

          <div>
            <span>Scheduled Tasks</span>
            <h2>{scheduledTasks}</h2>
          </div>
        </div>

        <div className="calendar-overview-card">
          <div className="calendar-overview-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed Tasks</span>
            <h2>{completedTasks}</h2>
          </div>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Main calendar */}
        <div className="calendar-main">
          <div className="calendar-month-header">
            <div>
              <h2>{monthName}</h2>
              <p>Plan your days and upcoming activities</p>
            </div>

            <div className="calendar-month-actions">
              <button
                className="calendar-today-btn"
                onClick={goToToday}
              >
                Today
              </button>

              <button
                className="calendar-nav-btn"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                className="calendar-nav-btn"
                onClick={goToNextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day) => (
                <div
                  className="calendar-weekday"
                  key={day}
                >
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day) => {
              const dayEvents = events.filter(
                (event) => event.date === day.date
              );

              const dayTasks = tasks.filter(
                (task) => task.dueDate === day.date
              );

              const dayProjects = projects.filter(
                (project) => project.date === day.date
              );

              const totalDayItems =
                dayEvents.length + dayTasks.length + dayProjects.length;

              const isSelected = selectedDate === day.date;

              return (
                <button
                  key={day.date}
                  className={[
                    "calendar-day",
                    !day.currentMonth ? "outside-month" : "",
                    day.isToday ? "today" : "",
                    isSelected ? "selected" : ""
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span className="calendar-day-number">
                    {day.day}
                  </span>

                  <div className="calendar-day-indicators">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={`calendar-event-dot ${
                          categoryColors[event.category] || "personal"
                        }`}
                      />
                    ))}

                    {dayTasks.length > 0 && (
                      <span className="calendar-event-dot task" />
                    )}

                    {dayProjects.length > 0 && (
                      <span className="calendar-event-dot work" />
                    )}
                  </div>

                  {totalDayItems > 0 && (
                    <span className="calendar-day-count">
                      {totalDayItems}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar legend */}
          <div className="calendar-legend">
            <div>
              <span className="legend-dot personal" />
              Personal
            </div>

            <div>
              <span className="legend-dot work" />
              Work
            </div>

            <div>
              <span className="legend-dot meeting" />
              Meeting
            </div>

            <div>
              <span className="legend-dot reminder" />
              Reminder
            </div>

            <div>
              <span className="legend-dot task" />
              Tasks
            </div>

            <div>
              <span className="legend-dot work" />
              Project deadlines
            </div>
          </div>

          {/* Selected date schedule */}
          <div className="selected-date-section">
            <div className="selected-date-header">
              <div>
                <h3>{formatSelectedDate(selectedDate)}</h3>
                <p>
                  {selectedEvents.length +
                    selectedTasks.length +
                    selectedProjects.length}{" "}
                  scheduled item(s)
                </p>
              </div>

              <button
                className="calendar-add-small-btn"
                onClick={openAddModal}
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="selected-date-content">
              {selectedEvents.length === 0 &&
                selectedTasks.length === 0 &&
                selectedProjects.length === 0 && (
                  <div className="calendar-empty-state">
                    <CalendarDays size={30} />
                    <h4>No scheduled items</h4>
                    <p>
                      Nothing is planned for this date yet.
                    </p>
                    <button onClick={openAddModal}>
                      <Plus size={16} />
                      Create an event
                    </button>
                  </div>
                )}

              {selectedEvents.map((event) => (
                <div
                  className="calendar-schedule-item"
                  key={event.id}
                >
                  <div
                    className={`calendar-schedule-indicator ${
                      categoryColors[event.category] || "personal"
                    }`}
                  />

                  <div className="calendar-schedule-details">
                    <h4>{event.title}</h4>

                    <div className="calendar-schedule-meta">
                      <span>
                        <Clock3 size={14} />
                        {formatTime(event.time)}
                      </span>

                      <span>
                        {event.category || "Personal"}
                      </span>
                    </div>

                    {event.description && (
                      <p>{event.description}</p>
                    )}
                  </div>

                  <div className="calendar-schedule-actions">
                    <button
                      onClick={() => openEditModal(event)}
                      aria-label="Edit event"
                      title="Edit event"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event)}
                      aria-label="Delete event"
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {selectedTasks.map((task) => {
                const StatusIcon = getTaskStatusIcon(task.status);

                return (
                  <div
                    className="calendar-schedule-item calendar-task-item"
                    key={task.id}
                  >
                    <div className="calendar-schedule-indicator task" />

                    <div className="calendar-schedule-details">
                      <h4>{task.title}</h4>

                      <div className="calendar-schedule-meta">
                        <span>
                          <StatusIcon size={14} />
                          {getTaskStatusLabel(task.status)}
                        </span>

                        <span>Task</span>
                      </div>

                      {task.description && (
                        <p>{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {selectedProjects.map((project) => (
                <div
                  className="calendar-schedule-item"
                  key={`project-${project.id}`}
                >
                  <div className="calendar-schedule-indicator work" />

                  <div className="calendar-schedule-details">
                    <h4>{project.name}</h4>

                    <div className="calendar-schedule-meta">
                      <span>
                        <FolderKanban size={14} />
                        Project deadline
                      </span>

                      <span>
                        {Number(project.progress) || 0}% complete
                      </span>
                    </div>

                    {project.category && (
                      <p>{project.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming schedule sidebar */}
        <div className="calendar-sidebar">
          <div className="upcoming-events-card">
            <div className="upcoming-events-header">
              <div>
                <h3>Upcoming Schedule</h3>
                <p>Your next events, tasks, and deadlines</p>
              </div>

              <CalendarDays size={20} />
            </div>

            <div className="upcoming-events-list">
              {upcomingItems.length === 0 && (
                <div className="upcoming-empty-state">
                  <CalendarDays size={26} />
                  <p>No upcoming events, tasks, or deadlines yet.</p>
                </div>
              )}

              {upcomingItems.map((item) => {
                const isTask = item.type === "task";
                const isProject = item.type === "project";

                const itemColor = isTask
                  ? "task"
                  : categoryColors[item.category] || "work";

                return (
                  <button
                    key={item.id}
                    className="upcoming-event"
                    onClick={() => handleUpcomingItemClick(item)}
                  >
                    <div
                      className={`upcoming-date ${itemColor}`}
                    >
                      <span>
                        {parseLocalDate(item.date).toLocaleDateString(
                          "en-US",
                          { month: "short" }
                        )}
                      </span>

                      <strong>
                        {parseLocalDate(item.date).getDate()}
                      </strong>
                    </div>

                    <div className="upcoming-event-info">
                      <h4>{item.title}</h4>

                      <span>
                        {isTask
                          ? getTaskStatusLabel(item.status)
                          : isProject
                            ? `${item.progress}% complete`
                            : formatTime(item.time)}
                      </span>

                      <small>
                        {isTask
                          ? "Task"
                          : isProject
                            ? "Project deadline"
                            : item.category}
                      </small>
                    </div>

                    <ChevronRight
                      size={17}
                      className="upcoming-event-arrow"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {modalOpen && (
        <div
          className="calendar-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-modal-header">
              <div>
                <h2>
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h2>

                <p>
                  {editingEvent
                    ? "Update your calendar event details."
                    : "Add a new event to your schedule."}
                </p>
              </div>

              <button
                className="calendar-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="calendar-event-form"
              onSubmit={handleSaveEvent}
            >
              <div className="calendar-form-group">
                <label htmlFor="event-title">
                  Event Title
                </label>

                <input
                  id="event-title"
                  type="text"
                  name="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="calendar-form-row">
                <div className="calendar-form-group">
                  <label htmlFor="event-date">
                    Date
                  </label>

                  <input
                    id="event-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="calendar-form-group">
                  <label htmlFor="event-time">
                    Time
                  </label>

                  <input
                    id="event-time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="calendar-form-group">
                <label htmlFor="event-category">
                  Category
                </label>

                <select
                  id="event-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calendar-form-group">
                <label htmlFor="event-description">
                  Description
                </label>

                <textarea
                  id="event-description"
                  name="description"
                  placeholder="Add event details (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="calendar-modal-actions">
                <button
                  type="button"
                  className="calendar-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="calendar-save-btn"
                >
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
