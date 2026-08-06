# 📋 Orbit (FlowSphere) - Daily Contribution & Task Log

> **Project Name**: Orbit (FlowSphere)  
> **Purpose**: This document tracks the daily completed tasks, feature implementations, bug fixes, and contributions made by each team member based on complete repository analysis. All team members must log their completed work here.

---

## 👥 Team Roster & Roles

| Contributor Name | Role | Primary Focus Area | Contact / GitHub |
| :--- | :--- | :--- | :--- |
| **Anjneya (breezy-anj)** | Project Lead & Full-Stack | Project Direction, Express APIs, ML Predictive Analytics, DB Migrations & Dashboard Routes | `@breezy-anj` | 
**Karnika** | AI & Full-Stack Developer | Llama AI Integration, AI Meetup Service & UI Planner Modal | `@karnika1021` |
| **Tanishq Marwari** | Docs & Architecture Lead | ML Lead | System Architecture, README,  ML Predictive Analytics Documentation & Daily Contribution Logs | `@tanishq19-byte` |
|
| **Sidhi Saxena** | Core Developer & Algorithm Specialist | Interval Merging Algorithm, Availability Engine, Friend Management API | `@sidhi-saxena` |

---

## 📝 How to Update Your Daily Tasks

At the end of every work session or daily standup meeting, team members should append their completed tasks to the **Daily Task Log** table below using the following format:

```markdown
| Date (YYYY-MM-DD) | Contributor | Component / Module | Completed Tasks & Summary | PR / Commit | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-08-06 | Your Name | Frontend / Backend / AI / ML | Description of what you built/fixed today | `#PR_or_Commit` | ✅ Completed |
```

---

## 📅 Daily Contribution Log

### 🌟 Week 3 (August 01, 2026 – Present)

| Date | Contributor | Component / Module | Completed Tasks & Key Deliverables | Commit / Reference | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-08-06** | **Tanishq Marwari** | **Documentation & Logs** | Created & updated `CONTRIBUTION.md` daily contribution log with recent Llama AI migration, DB seeding, live backend routes, and dashboard refactoring. | `Current` | ✅ Completed |
| **2026-08-04** | **Anjneya (breezy-anj)** | **Backend & Dashboard API** | Created database seed script (`seed.js`), implemented dashboard analytics API (`routes/dashboard.js`), enhanced friend management routes (`routes/friends.js`), and updated server initialization (`server.js`). | `4e18729` | ✅ Completed |
| **2026-08-04** | **Anjneya (breezy-anj)** | **Frontend UI & Integration** | Refactored `Dashboard.jsx` for live API integration, updated `Login.jsx` for demo accounts, enhanced `AuthContext.jsx`, and tuned `AIPlannerModal.jsx`. | `4e18729` | ✅ Completed |
| **2026-08-04** | **Karnika** | **PR Review & Merge** | Merged PR #2 (`breezy-anj/llama-integration`) replacing Google Gemini AI engine with Meta Llama AI model. | `8e23efb` | ✅ Completed |
| **2026-08-03** | **Karnika** | **AI Service Migration** | Integrated Llama AI engine (`llamaService.js`), updated environment template (`.env.example`), and redirected `/api/ai` endpoints to process Llama recommendations. | `db89fa9` | ✅ Completed |

---

### 🚀 Week 2 (July 24, 2026 – July 31, 2026)

| Date | Contributor | Component / Module | Completed Tasks & Key Deliverables | Commit / Reference | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-07-30** | **Tanishq Marwari** | **Documentation & Guidelines** | Created comprehensive `CONTRIBUTION.md` task log & `CONTRIBUTING.md` workflow guidelines. | `ca8294c` / `1f19536` | ✅ Completed |
| **2026-07-24** | **Anjneya (breezy-anj)** | **Integration & Merge** | Merged `main` with feature integration branch. | `0d085da` | ✅ Completed |
| **2026-07-24** | **Anjneya (breezy-anj)** | **ML Predictive Model & AI** | Implemented Python Machine Learning Predictive Availability Model (`predictive_availability.py`, `predict_cli.py`, `model.pkl`), integrated predictive weighting into AI service, and updated `Dashboard.jsx`. | `20de3e1` | ✅ Completed |
| **2026-07-24** | **Tanishq Marwari** | **Documentation & Setup** | Finalized comprehensive project `README.md` detailing architecture, system features, user personas, and local setup guide. | `26fe08a` | ✅ Completed |

---

### ⚡ Week 1 (July 15, 2026 – July 23, 2026)

| Date | Contributor | Component / Module | Completed Tasks & Key Deliverables | Commit / Reference | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-07-23** | **Anjneya (breezy-anj)** | **AI Service & PR Review** | Reviewed & merged PR #1 (Karnika's Gemini AI integration) into `main`. | `4b2b970` | ✅ Completed |
| **2026-07-23** | **Anjneya (breezy-anj)** | **Backend Maintenance** | Renamed API routes and merged backend refactoring branches. | `a5fa2dc` | ✅ Completed |
| **2026-07-23** | **Sidhi Saxena** | **Code Maintenance** | Performed code cleanup and route helper adjustments. | `c104544` | ✅ Completed |
| **2026-07-23** | **Anjneya (breezy-anj)** | **Database** | Executed PostgreSQL schema migration (`schema.sql`) for `users`, `friendships`, `availability`, and `meetups`. | `0e52a5d` | ✅ Completed |
| **2026-07-23** | **Sidhi Saxena** | **Availability Service** | Implemented availability slot finder API (`/api/availability`) and date interval search handler. | `c299f7e` | ✅ Completed |
| **2026-07-23** | **Sidhi Saxena** | **Scheduler Algorithm** | Built interval merging algorithm ($O(N \log N)$) to calculate common overlapping free time across multiple calendars. | `a78bcf7` | ✅ Completed |
| **2026-07-23** | **Sidhi Saxena** | **Backend Routes** | Created main Express API router (`/api/friends`, `/api/schedule`, `/api/availability`, `/api/health`). | `2c634b7` | ✅ Completed |
| **2026-07-23** | **Sidhi Saxena** | **Friends Management** | Implemented friend request workflow (send, accept, reject, block status transitions in PostgreSQL). | `b1aa6e8` / `42b6b94` | ✅ Completed |
| **2026-07-21** | **Sidhi Saxena** | **Calendar Sync** | Created calendar connection flow & privacy-first free/busy interval parsing. | `617afbe` / `9ae46e5` | ✅ Completed |
| **2026-07-21** | **Sidhi Saxena** | **Backend Setup** | Set up Express server initialization and PostgreSQL connection pool configuration (`db.js`). | `715c2da` | ✅ Completed |
| **2026-07-20** | **Sidhi Saxena** | **Core Algorithm** | Prototyped interval overlap detection logic for scheduling free time blocks. | `a1ba005` | ✅ Completed |
| **2026-07-20** | **Sidhi Saxena** | **Availability Model** | Designed database model and JSON data structures for availability time windows. | `f685085` | ✅ Completed |
| **2026-07-20** | **Sidhi Saxena** | **Friends API** | Implemented core database queries for friend connections. | `cc19912` | ✅ Completed |
| **2026-07-18** | **Sidhi Saxena** | **Friends Model** | Created friend management data structures. | `f25904b` | ✅ Completed |
| **2026-07-16** | **Karnika** | **AI Service & UI Component** | End-to-end integration of Google Gemini AI (`gemini-2.5-flash`): built `geminiService.js`, `routes/ai.js`, `aiService.js`, and `AIPlannerModal.jsx` modal component. | `2b14cdb` | ✅ Completed |
| **2026-07-16** | **Sidhi Saxena** | **Calendar Integration** | Prototyped calendar connection integration routines. | `3c52892` | ✅ Completed |
| **2026-07-15** | **Sidhi Saxena** | **Database Schema** | Designed initial PostgreSQL database connection schema and tables. | `92307fb` | ✅ Completed |

---

### 🌱 Inception & Initial Setup (July 04, 2026 – July 10, 2026)

| Date | Contributor | Component / Module | Completed Tasks & Key Deliverables | Commit / Reference | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-07-10** | **Anjneya (breezy-anj)** | **Frontend UI & Views** | Implemented `Onboarding.jsx`, `ConnectCalendar.jsx`, and `Splash.jsx` components with calendar connect flow. | `61dac16` | ✅ Completed |
| **2026-07-07** | **Anjneya (breezy-anj)** | **Authentication & Views** | Built `Login.jsx` view and initial `Dashboard.jsx` interface layout. | `2f41923` | ✅ Completed |
| **2026-07-05** | **Anjneya (breezy-anj)** | **Auth State & Router** | Created `AuthContext.jsx` for global user authentication state and set up React Router navigation in `App.jsx`. | `a21b260` | ✅ Completed |
| **2026-07-04** | **Anjneya (breezy-anj)** | **Backend Express Server** | Built initial Express server setup (`server.js`) with CORS, JSON body parser, and health check API. | `b5f662d` | ✅ Completed |
| **2026-07-04** | **Anjneya (breezy-anj)** | **Repository Initialization** | Bootstrapped repository structure: React + Vite frontend, Express backend, assets, icons, and package configuration. | `4bd82c0` | ✅ Completed |

---

## 📊 Summary of Major Module Contributions

| Module | Primary Contributors | Technologies Used | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | Anjneya, Tanishq Marwari, Sidhi Saxena, Karnika | React 18/19, Vite, Tailwind CSS, Lucide React | 🟢 Active |
| **Backend Express API & Seeding** | Anjneya, Sidhi Saxena, Karnika | Node.js, Express.js (ES Modules), `seed.js`, Live Dashboard API | 🟢 Active |
| **Llama AI Service** | Karnika, Anjneya | Meta Llama AI Engine (`llamaService.js`), JSON Schema Validation | 🟢 Integrated |
| **ML Predictive Analytics** | Anjneya | Python, Scikit-Learn Model (`model.pkl`), CLI Predictor | 🟢 Integrated |
| **PostgreSQL Database** | Anjneya, Sidhi Saxena | PostgreSQL, Relational Schema, Seed Data, UUIDs | 🟢 Operational |
| **Interval Scheduler** | Sidhi Saxena | Custom Interval Merging Algorithm ($O(N \log N)$) | 🟢 Complete |
| **Documentation & Logs** | Tanishq Marwari | Markdown, Daily Task Logging, System Architecture, Contributing Guide | 🟢 Maintained |

---

## 🛠️ Guidelines for Logging Daily Tasks

1. **Daily Log Requirement**: Each team member must add a line entry under the current week in `CONTRIBUTION.md` upon completing a task or merging a PR.
2. **Atomic Commits**: Commit code regularly with clear, descriptive commit messages (e.g., `feat(ai): integrate llama meetup generator`).
3. **Pull Request Reviews**: All major feature additions must be submitted as PRs and reviewed before merging into `main`.
4. **Environment Safety**: Never commit sensitive API keys or database passwords to `.env` files.

---

## ❓ Need Assistance?

For any questions regarding daily task assignments or contribution guidelines, check in during daily standups or open a discussion issue on GitHub.
