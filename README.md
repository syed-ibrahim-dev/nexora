# NEXORA — Productivity Workspace

A modern, responsive productivity workspace built with React to help users organize projects, manage tasks, plan schedules, capture notes, and track productivity from one place.

## Overview

NEXORA is a frontend productivity application designed to bring essential workspace tools together in a clean and intuitive interface.

It features an interactive dashboard, project and task management, calendar planning, notes, analytics, and workspace settings.

The application uses browser LocalStorage to persist user data between visits.

## Features

- **Dashboard** — Overview of workspace activity and productivity.
- **Project Management** — Create, edit, organize, and track projects.
- **Task Management** — Manage tasks and monitor their progress.
- **Calendar** — Plan events and view project deadlines.
- **Notes** — Create, edit, search, and organize notes.
- **Analytics** — Visualize productivity and project performance.
- **Activity Center** — View workspace activity.
- **Global Search** — Quickly find workspace information.
- **Notifications** — Access workspace notifications.
- **Settings** — Customize workspace preferences.
- **Responsive Layout** — Designed for desktop, tablet, and mobile screens.
- **Data Persistence** — Save workspace information using browser LocalStorage.
- **Backup and Restore** — Export and restore workspace data using JSON files.
- **Performance Optimization** — Lazy loading for pages and analytics components.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tool |
| JavaScript (ES6+) | Application logic |
| CSS3 | Styling and responsive layouts |
| Lucide React | Icons |
| Motion | UI animations |
| Recharts | Analytics visualizations |
| LocalStorage | Browser-based data persistence |
| ESLint | Code quality |

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/syed-ibrahim-dev/nexora.git
   ```

2. Navigate into the project:

   ```bash
   cd nexora
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal.

## Production Build

To create an optimized production build:

```bash
npm run build
```

To run ESLint:

```bash
npm run lint
```

## Data Storage

NEXORA currently uses browser LocalStorage for data persistence.

- Data is stored locally in the browser.
- Data is not automatically synchronized across devices.
- Clearing browser storage can remove saved workspace information.
- JSON backup and restore functionality is available.

## Project Structure

```text
nexora/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── analytics/
│   │   ├── layout/
│   │   ├── notes/
│   │   ├── projects/
│   │   └── tasks/
│   ├── pages/
│   ├── Styles/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Screenshots

Screenshots of the application will be added here.

## Future Improvements

- Backend integration
- Cloud-based data synchronization
- User authentication
- Multi-device workspace access

## Author

**Syed Ibrahim**

## Links

- **GitHub Repository:** https://github.com/syed-ibrahim-dev/nexora
- **Live Demo:** https://nexora-6iplpwf3t-ibbu3.vercel.app/

---

Built with React and Vite.
