
import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  NotebookPen,
  ChartNoAxesCombined,
  Settings,
  MessageSquare,
  Send,
  CircleHelp,
  Lightbulb,
  Keyboard,
  CheckCircle2,
  LifeBuoy
} from "lucide-react";

import "./HelpSupport.css";

const faqs = [
  {
    category: "Workspace",
    question: "What is NEXORA?",
    answer:
      "NEXORA is your productivity workspace. You can organize projects, manage tasks, schedule events, write notes and review your productivity."
  },
  {
    category: "Projects",
    question: "How do I create a project?",
    answer:
      "Open Projects from the sidebar and select the Add Project button. Enter your project details and save it."
  },
  {
    category: "Projects",
    question: "Can I edit or delete a project?",
    answer:
      "Yes. Open the project card and use its available actions to edit or delete the project."
  },
  {
    category: "Tasks",
    question: "How do I manage my tasks?",
    answer:
      "Open My Tasks to create tasks, set priorities, update their status and organize your work."
  },
  {
    category: "Tasks",
    question: "Can I filter my tasks?",
    answer:
      "Yes. Use the search field and available filters on the My Tasks page to find tasks by their details, status or priority."
  },
  {
    category: "Calendar",
    question: "How do I add a calendar event?",
    answer:
      "Open Calendar, navigate to the required month and use the add-event option to create an event."
  },
  {
    category: "Notes",
    question: "Can I pin important notes?",
    answer:
      "Yes. Use the pin action on a note to keep important notes easier to find."
  },
  {
    category: "Notes",
    question: "Can I organize my notes?",
    answer:
      "You can use categories, colors, sorting and the grid or list view to organize your notes."
  },
  {
    category: "Analytics",
    question: "What does Analytics show?",
    answer:
      "Analytics provides an overview of your workspace activity and productivity based on the data available in your workspace."
  },
  {
    category: "Settings",
    question: "Where are my settings saved?",
    answer:
      "Your NEXORA settings are saved in your browser's LocalStorage on this device."
  },
  {
    category: "Data",
    question: "Where is my workspace data stored?",
    answer:
      "The current version stores workspace data in your browser's LocalStorage. Clearing browser storage may remove locally saved data. Use the Settings export option to create a backup."
  }
];

const guides = [
  {
    title: "Workspace Overview",
    description: "Understand your dashboard and workspace summary.",
    icon: BookOpen,
    page: "Overview"
  },
  {
    title: "Manage Projects",
    description: "Create, update and organize your projects.",
    icon: FolderKanban,
    page: "Projects"
  },
  {
    title: "Organize Tasks",
    description: "Track tasks, priorities and completion status.",
    icon: CheckSquare,
    page: "My Tasks"
  },
  {
    title: "Use Calendar",
    description: "Plan events and keep track of upcoming dates.",
    icon: CalendarDays,
    page: "Calendar"
  },
  {
    title: "Create Notes",
    description: "Capture ideas and organize important information.",
    icon: NotebookPen,
    page: "Notes"
  },
  {
    title: "Review Analytics",
    description: "Explore your productivity and workspace activity.",
    icon: ChartNoAxesCombined,
    page: "Analytics"
  },
  {
    title: "Customize Settings",
    description: "Manage your profile and workspace preferences.",
    icon: Settings,
    page: "Settings"
  }
];

const categories = [
  "All",
  "Workspace",
  "Projects",
  "Tasks",
  "Calendar",
  "Notes",
  "Analytics",
  "Settings",
  "Data"
];

const FEEDBACK_KEY = "nexora_feedback_v1";

function readFeedback() {
  try {
    const saved = JSON.parse(localStorage.getItem(FEEDBACK_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function HelpSupport() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  const [feedbackType, setFeedbackType] = useState("Suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        category === "All" || faq.category === category;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    setFeedbackError("");
    setFeedbackSaved(false);

    if (!subject.trim() || !message.trim()) {
      setFeedbackError("Please complete both the subject and message.");
      return;
    }

    const feedback = {
      id: Date.now(),
      type: feedbackType,
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const existing = readFeedback();
      localStorage.setItem(
        FEEDBACK_KEY,
        JSON.stringify([feedback, ...existing])
      );

      setSubject("");
      setMessage("");
      setFeedbackSaved(true);
    } catch {
      setFeedbackError("Unable to save feedback in browser storage.");
    }
  };

  return (
    <div className="help-page">
      <section className="help-hero">
        <div className="help-hero-content">
          <span className="help-eyebrow">
            <LifeBuoy size={15} />
            NEXORA SUPPORT CENTER
          </span>

          <h1>How can we help you?</h1>

          <p>
            Find answers, explore guides and get help using your
            NEXORA workspace.
          </p>

          <div className="help-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search for help, questions or topics..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenFaq(0);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="help-hero-decoration">
          <div className="help-decoration-circle">
            <CircleHelp size={76} strokeWidth={1.2} />
          </div>
          <span className="help-decoration-dot dot-one" />
          <span className="help-decoration-dot dot-two" />
          <span className="help-decoration-dot dot-three" />
        </div>
      </section>

      <section className="help-section">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">GETTING STARTED</span>
            <h2>Quick start guides</h2>
            <p>Learn how to use each part of your workspace.</p>
          </div>
          <BookOpen size={24} />
        </div>

        <div className="help-guides-grid">
          {guides.map((guide) => {
            const Icon = guide.icon;

            return (
              <button
                type="button"
                className="help-guide-card"
                key={guide.page}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("nexora:navigate", {
                      detail: guide.page
                    })
                  )
                }
              >
                <span className="help-guide-icon">
                  <Icon size={21} />
                </span>

                <span className="help-guide-copy">
                  <strong>{guide.title}</strong>
                  <small>{guide.description}</small>
                </span>

                <span className="help-guide-arrow">↗</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="help-section">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">HELP CENTER</span>
            <h2>Frequently asked questions</h2>
            <p>Find answers to common questions about NEXORA.</p>
          </div>
          <CircleHelp size={24} />
        </div>

        <div className="help-faq-layout">
          <aside className="help-category-list">
            <h3>Categories</h3>

            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => {
                  setCategory(item);
                  setOpenFaq(0);
                }}
              >
                {item}
                <span>
                  {item === "All"
                    ? faqs.length
                    : faqs.filter((faq) => faq.category === item).length}
                </span>
              </button>
            ))}
          </aside>

          <div className="help-faq-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div className="help-faq-item" key={faq.question}>
                  <button
                    type="button"
                    className="help-faq-question"
                    onClick={() =>
                      setOpenFaq(openFaq === index ? -1 : index)
                    }
                  >
                    <span>{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>

                  {openFaq === index && (
                    <div className="help-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="help-empty">
                <Search size={28} />
                <strong>No matching questions</strong>
                <p>Try another search term or select a different category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="help-bottom-grid">
        <div className="help-shortcuts-card">
          <div className="help-card-icon">
            <Keyboard size={22} />
          </div>
          <h3>Keyboard shortcuts</h3>
          <p>
            Keyboard shortcuts are not configured in this version
            of NEXORA. This section can be expanded when shortcuts
            are implemented.
          </p>
          <span className="help-coming-label">COMING LATER</span>
        </div>

        <div className="help-tips-card">
          <div className="help-card-icon">
            <Lightbulb size={22} />
          </div>
          <h3>Helpful tip</h3>
          <p>
            Export your workspace data from Settings periodically
            so you have a backup of your locally stored information.
          </p>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("nexora:navigate", {
                  detail: "Settings"
                })
              )
            }
          >
            Open Settings <span>↗</span>
          </button>
        </div>
      </section>

      <section className="help-feedback-section">
        <div className="help-feedback-intro">
          <span className="help-section-label">YOUR VOICE MATTERS</span>
          <h2>Send us your feedback</h2>
          <p>
            Share a suggestion, report an issue or tell us how
            NEXORA can be improved.
          </p>

          <div className="help-feedback-note">
            <MessageSquare size={19} />
            <span>
              Your feedback is saved locally in this browser.
              It is not sent to an external service.
            </span>
          </div>
        </div>

        <form className="help-feedback-form" onSubmit={handleFeedbackSubmit}>
          <label htmlFor="feedback-type">Feedback type</label>
          <select
            id="feedback-type"
            value={feedbackType}
            onChange={(event) => setFeedbackType(event.target.value)}
          >
            <option>Suggestion</option>
            <option>Bug Report</option>
            <option>Question</option>
            <option>Other</option>
          </select>

          <label htmlFor="feedback-subject">Subject</label>
          <input
            id="feedback-subject"
            type="text"
            placeholder="Enter a subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            maxLength={100}
            required
          />

          <label htmlFor="feedback-message">Message</label>
          <textarea
            id="feedback-message"
            placeholder="Tell us what you think..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            maxLength={1000}
            required
          />

          {feedbackError && (
            <p className="help-feedback-error">{feedbackError}</p>
          )}

          {feedbackSaved && (
            <p className="help-feedback-success">
              <CheckCircle2 size={17} />
              Feedback saved successfully in this browser.
            </p>
          )}

          <button className="help-submit-button" type="submit">
            Save Feedback <Send size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
