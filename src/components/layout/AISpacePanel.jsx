
import "./AISpacePanel.css";

import { useEffect, useState } from "react";

import {
  Sparkles,
  X,
  Plus,
  Send,
  MessageSquare,
  Trash2,
  Clock3,
  BriefcaseBusiness,
  CheckSquare,
  CalendarDays,
  NotebookPen,
  Lightbulb,
  ArrowUpRight,
  Bot,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
  Search
} from "lucide-react";

const CHAT_STORAGE_KEY = "nexora_ai_conversations_v1";

const quickPrompts = [
  {
    icon: CheckSquare,
    title: "Task overview",
    prompt: "Give me an overview of my tasks and what I should focus on."
  },
  {
    icon: BriefcaseBusiness,
    title: "Project insights",
    prompt: "Analyze my projects and summarize their progress."
  },
  {
    icon: CalendarDays,
    title: "Plan my schedule",
    prompt: "Help me plan my upcoming schedule."
  },
  {
    icon: Lightbulb,
    title: "Generate ideas",
    prompt: "Give me some ideas to improve my productivity."
  }
];

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
  }
}

function readArray(key) {
  const value = readStorage(key, []);

  return Array.isArray(value) ? value : [];
}

function readConversations() {
  const saved = readArray(CHAT_STORAGE_KEY);

  return saved.filter(
    (conversation) =>
      conversation &&
      typeof conversation.id === "string" &&
      typeof conversation.title === "string" &&
      Array.isArray(conversation.messages)
  );
}

function createConversation() {
  return {
    id: createId(),
    title: "New conversation",
    messages: [],
    updatedAt: new Date().toISOString()
  };
}

function getWorkspaceData() {
  return {
    projects: readArray("nexora_projects_v1"),
    tasks: readArray("nexora_tasks_v1"),
    events: readArray("nexora_calendar_events_v1"),
    notes: readArray("nexora_notes_v1"),
    activities: readArray("nexora_activity_v1")
  };
}

function generateDemoResponse(prompt) {
  const data = getWorkspaceData();
  const text = prompt.toLowerCase();

  const pendingTasks = data.tasks.filter(
    (task) => task.status !== "completed"
  );

  const completedTasks = data.tasks.filter(
    (task) => task.status === "completed"
  );

  const completedProjects = data.projects.filter(
    (project) => Number(project.progress) >= 100
  );

  if (
    text.includes("task") ||
    text.includes("deadline") ||
    text.includes("todo")
  ) {
    const taskList = pendingTasks
      .slice(0, 5)
      .map(
        (task, index) =>
          `${index + 1}. ${task.title || "Untitled task"}`
      )
      .join("\n");

    return `Here's your current task overview:

• Total tasks: ${data.tasks.length}
• Completed tasks: ${completedTasks.length}
• Remaining tasks: ${pendingTasks.length}

${
  taskList
    ? `Tasks to review:\n${taskList}`
    : "You currently have no pending tasks."
}

Suggestion: Review your high-priority and upcoming tasks first.

Note: This is a local demo analysis, not an AI-generated recommendation.`;
  }

  if (text.includes("project")) {
    const projectList = data.projects
      .slice(0, 5)
      .map(
        (project) =>
          `• ${project.name || "Untitled project"} — ${
            Number(project.progress) || 0
          }% complete`
      )
      .join("\n");

    return `Here's your project overview:

• Total projects: ${data.projects.length}
• Completed projects: ${completedProjects.length}

${projectList || "No projects have been added yet."}

Suggestion: Review projects with lower progress and update their next steps.

Note: This is a local demo analysis.`;
  }

  if (
    text.includes("schedule") ||
    text.includes("calendar") ||
    text.includes("plan my day")
  ) {
    const eventList = data.events
      .slice(0, 5)
      .map(
        (event) =>
          `• ${event.title || event.name || "Untitled event"}`
      )
      .join("\n");

    return `Let's look at your schedule.

• Calendar events stored: ${data.events.length}
• Pending tasks: ${pendingTasks.length}

${eventList || "No calendar events are currently saved."}

Planning suggestion:
1. Review upcoming events.
2. Identify your most important task.
3. Leave some time between activities.

Note: This is a local demo response.`;
  }

  if (text.includes("note")) {
    return `Your workspace currently contains ${data.notes.length} saved notes.

You can use the Notes module to organize ideas, meeting notes, and important information.

Note: I can provide more advanced note analysis after the AI API is connected.`;
  }

  if (
    text.includes("activity") ||
    text.includes("summary") ||
    text.includes("workspace")
  ) {
    return `Here's your NEXORA workspace summary:

• Projects: ${data.projects.length}
• Tasks: ${data.tasks.length}
• Completed tasks: ${completedTasks.length}
• Calendar events: ${data.events.length}
• Notes: ${data.notes.length}
• Activity records: ${data.activities.length}

You can explore each module for more details.

Note: This is a local demo summary.`;
  }

  return `Thanks for your message!

NEXORA AI Space is currently running in demo mode. I can display basic insights from your locally stored projects, tasks, calendar events, and notes.

For natural conversations, advanced reasoning, writing assistance, and intelligent actions, we'll connect a real AI API after completing the project.

Try one of the suggested prompts to explore the current features.`;
}

function AISpacePanel({ onClose }) {
  const [conversations, setConversations] = useState(readConversations);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workspace, setWorkspace] = useState(getWorkspaceData);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );

  const messages = activeConversation?.messages || [];

  // Refresh workspace data when local storage changes.
  useEffect(() => {
    const refreshWorkspace = () => {
      setWorkspace(getWorkspaceData());
    };

    window.addEventListener("storage", refreshWorkspace);
    window.addEventListener("focus", refreshWorkspace);

    return () => {
      window.removeEventListener("storage", refreshWorkspace);
      window.removeEventListener("focus", refreshWorkspace);
    };
  }, []);

  // Save conversations whenever they change.
  useEffect(() => {
    saveStorage(CHAT_STORAGE_KEY, conversations);
  }, [conversations]);

  // Close panel with Escape.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const createNewChat = () => {
    const conversation = createConversation();

    setConversations((previous) => [
      conversation,
      ...previous
    ]);

    setActiveId(conversation.id);
    setMessage("");
  };

  const sendMessage = (value = message) => {
    const trimmed = value.trim();

    if (!trimmed) return;

    let conversation = activeConversation;

    if (!conversation) {
      conversation = createConversation();
    }

    const conversationId = conversation.id;

    const userMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    const assistantMessage = {
      id: createId(),
      role: "assistant",
      content: generateDemoResponse(trimmed),
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [
      ...(conversation.messages || []),
      userMessage,
      assistantMessage
    ];

    const updatedConversation = {
      ...conversation,
      title:
        conversation.messages?.length > 0
          ? conversation.title
          : trimmed.slice(0, 35),
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };

    setConversations((previous) => [
      updatedConversation,
      ...previous.filter(
        (item) => item.id !== conversationId
      )
    ]);

    setActiveId(conversationId);
    setMessage("");
  };

  const deleteConversation = (id) => {
    setConversations((previous) =>
      previous.filter(
        (conversation) => conversation.id !== id
      )
    );

    if (activeId === id) {
      setActiveId(null);
    }
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      (conversation.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div
      className="ai-space-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="ai-space-panel"
        aria-label="NEXORA AI Space"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Sidebar */}
        <aside
          className={`ai-space-sidebar ${
            sidebarOpen ? "" : "collapsed"
          }`}
        >
          <div className="ai-sidebar-header">
            <div className="ai-brand">
              <div className="ai-brand-icon">
                <Sparkles size={20} />
              </div>

              {sidebarOpen && (
                <div>
                  <h2>NEXORA AI</h2>
                  <span>Workspace assistant</span>
                </div>
              )}
            </div>

            <button
              className="ai-icon-button"
              onClick={() =>
                setSidebarOpen((previous) => !previous)
              }
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
          </div>

          <button
            className="ai-new-chat"
            onClick={createNewChat}
          >
            <Plus size={18} />
            {sidebarOpen && "New conversation"}
          </button>

          {sidebarOpen && (
            <>
              <div className="ai-history-heading">
                <span>YOUR CONVERSATIONS</span>
              </div>

              <div className="ai-history-search">
                <Search size={15} />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search conversations..."
                  aria-label="Search conversations"
                />
              </div>

              <div className="ai-conversation-list">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`ai-conversation-item ${
                        activeId === conversation.id ? "active" : ""
                      }`}
                    >
                      <button
                        className="ai-conversation-select"
                        onClick={() =>
                          setActiveId(conversation.id)
                        }
                        title={conversation.title}
                      >
                        <MessageSquare size={16} />
                        <span>{conversation.title}</span>
                      </button>

                      <button
                        className="ai-delete-chat"
                        title="Delete conversation"
                        aria-label={`Delete ${conversation.title}`}
                        onClick={() =>
                          deleteConversation(conversation.id)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="ai-history-empty">
                    No conversations found.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="ai-sidebar-bottom">
            <div className="ai-demo-status">
              <span className="ai-status-dot" />

              {sidebarOpen && (
                <span>Demo mode · API not connected</span>
              )}
            </div>
          </div>
        </aside>

        {/* Main chat area */}
        <main className="ai-space-main">
          <header className="ai-space-header">
            <div className="ai-header-title">
              <div className="ai-header-icon">
                <Sparkles size={19} />
              </div>

              <div>
                <h2>AI Space</h2>
                <span>Your intelligent workspace companion</span>
              </div>
            </div>

            <div className="ai-header-actions">
              <span className="ai-demo-badge">
                DEMO MODE
              </span>

              <button
                className="ai-icon-button"
                onClick={createNewChat}
                title="New conversation"
                aria-label="New conversation"
              >
                <Plus size={19} />
              </button>

              <button
                className="ai-icon-button"
                onClick={onClose}
                title="Close AI Space"
                aria-label="Close AI Space"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Chat content */}
          <div className="ai-chat-content">
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">
                  <Sparkles size={30} />
                </div>

                <span className="ai-welcome-eyebrow">
                  YOUR PERSONAL WORKSPACE ASSISTANT
                </span>

                <h1>
                  How can I help
                  <span> you today?</span>
                </h1>

                <p>
                  Explore your workspace, review progress, organize
                  tasks, and plan your next steps.
                </p>

                <div className="ai-workspace-overview">
                  <div className="ai-overview-card">
                    <BriefcaseBusiness size={18} />
                    <strong>{workspace.projects.length}</strong>
                    <span>Projects</span>
                  </div>

                  <div className="ai-overview-card">
                    <CheckSquare size={18} />
                    <strong>{workspace.tasks.length}</strong>
                    <span>Tasks</span>
                  </div>

                  <div className="ai-overview-card">
                    <CalendarDays size={18} />
                    <strong>{workspace.events.length}</strong>
                    <span>Events</span>
                  </div>

                  <div className="ai-overview-card">
                    <NotebookPen size={18} />
                    <strong>{workspace.notes.length}</strong>
                    <span>Notes</span>
                  </div>
                </div>

                <div className="ai-quick-prompts">
                  <div className="ai-quick-heading">
                    <Lightbulb size={17} />
                    <span>GET STARTED WITH</span>
                  </div>

                  <div className="ai-prompt-grid">
                    {quickPrompts.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          className="ai-prompt-card"
                          onClick={() => sendMessage(item.prompt)}
                        >
                          <Icon size={19} />
                          <span>{item.title}</span>
                          <ArrowUpRight size={15} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-message-list">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`ai-message ${
                      item.role === "user"
                        ? "user-message"
                        : "assistant-message"
                    }`}
                  >
                    <div className="ai-message-avatar">
                      {item.role === "user" ? (
                        <UserRound size={17} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>

                    <div className="ai-message-body">
                      <div className="ai-message-meta">
                        <strong>
                          {item.role === "user"
                            ? "You"
                            : "NEXORA Demo"}
                        </strong>

                        <span>
                          {formatTime(item.createdAt)}
                        </span>
                      </div>

                      <p>{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message composer */}
          <div className="ai-composer-area">
            <form
              className="ai-composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Ask NEXORA about your workspace..."
                rows={1}
                aria-label="Write a message"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                type="submit"
                disabled={!message.trim()}
                title="Send message"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>

            <div className="ai-composer-footer">
              <span>
                <Clock3 size={13} />
                Responses use locally stored workspace data
              </span>

              <span>AI API connection coming later</span>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default AISpacePanel;
