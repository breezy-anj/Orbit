# 🪐 Orbit (FlowSphere)

> **Keep friendships alive. Manage your time intelligently.**  
> *Orbit is an AI-powered social scheduling and wellness platform that turns overlapping free calendar time into meaningful, personalized meetup ideas.*

---

## 📌 Project Overview & Goal

In today’s fast-paced world, busy work schedules, fragmented calendars, and decision fatigue often cause meaningful friendships to fade. The constant back-and-forth of *"When are you free?"* and *"What should we do?"* creates unnecessary friction.

**Orbit (FlowSphere)** was created to solve this social isolation problem. It acts as an intelligent bridge between your calendar and your social life by:

1. **Protecting Privacy**: Reading only free/busy calendar blocks without revealing sensitive event titles or private details.
2. **Automating Availability Matching**: Using a custom interval-merging algorithm to discover common free slots across multiple friends instantly.
3. **AI-Driven Personal Concierge**: Leveraging **Google Gemini AI** to generate personalized, context-aware meetup suggestions (activities, venue types, and timings) tailored to each friend's mutual interests and last-met history.
4. **Quantifying Friendship Health**: Giving users a visual "Friendship Score" and proactive reminders to help prioritize social well-being alongside productivity.

---

## 👥 How Orbit Helps Different Types of People

Orbit is designed to address distinct scheduling and social pain points across diverse user personas:

| User Persona | Key Challenge | How Orbit Helps |
| :--- | :--- | :--- |
| **💼 Busy Professionals** | Work overload, unpredictable hours, and constant fatigue lead to canceled plans and social drift. | Automatically pinpoints free evening/weekend blocks and schedules quick catch-ups without back-and-forth messaging. |
| **🎓 College & University Students** | Chaotic class timetables, exams, and extracurricular activities make group hangouts hard to align. | Syncs multiple student schedules to find joint study gaps, coffee runs, or weekend group hangouts effortlessly. |
| **🌍 Long-Distance & Old Friends** | Friends drift apart as life moves forward; months pass without intentional touchpoints. | Tracks "last met" duration and prompts users with nostalgic or high-value meetup ideas when windows of free time open up. |
| **🛋️ Introverts & Social Planners** | Decision fatigue, venue anxiety, or stress around initiating plans. | Gemini AI acts as a gentle social concierge, suggesting concrete, low-pressure activities (e.g., casual coffee, museum visits) with warm icebreaker rationales. |
| **🧘 Work-Life Balance Advocates** | Sacrificing relationships for career milestones, resulting in burnout. | Treats friendship maintenance as a core health metric via the **Friendship Score**, fostering intentional balance between work and rest. |

---

## ✨ Key Features

- **🛡️ Privacy-First Calendar Sync**: Connects with Google Calendar to analyze free/busy status without storing or inspecting event names or location details.
- **⚡ Algorithmic Slot Finder**: Merges busy intervals and identifies exact overlapping free windows across any number of users (`O(N log N)` efficiency).
- **🤖 Gemini AI Meetup Planner**: Generates structured, highly realistic meetup ideas matched directly into verified free time windows.
- **📊 Social Health Dashboard**: Live metrics for **Next Free Slot**, **Upcoming Meetups**, and an active **Friendship Score** (e.g., 92% health rating).
- **📱 Dynamic & Onboarding Flow**: Smooth, modern onboarding slides introducing platform values with responsive dark-mode glassmorphism styling.
- **🔒 Secure Friendship Graph**: Manage pending, accepted, and blocked friend connections with robust database constraint enforcement.

---

## 🗺️ System Routes & Architecture

Orbit features a clear separation of concerns between its React frontend and Express/PostgreSQL backend services.

### 🎨 Frontend Client Routes (React Router v6)

| Route Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Automatic redirect to `/splash`. |
| `/splash` | Public | Animated branding splash screen introduces Orbit before auto-advancing. |
| `/onboarding` | Public | Interactive 3-step carousel detailing platform benefits and work-life features. |
| `/login` | Public | Authentication portal with Google OAuth simulation. |
| `/connect-calendar` | Protected | Calendar permission page explaining privacy guarantees and free/busy access limits. |
| `/dashboard` | Protected | Main application hub displaying quick stats, social metrics, action shortcuts, and AI Planner trigger. |

---

### ⚙️ Backend API Endpoints (Express.js)

#### 1. System & Authentication
- **`GET /api/health`**  
  *Description*: Health check endpoint returning backend operational status and database engine info.
- **`POST /api/auth/login`**  
  *Description*: Simulates user authentication and yields profile details and a JWT token.

#### 2. AI Recommendation Service (`/api/ai`)
- **`POST /api/ai/meetup-suggestions`**  
  *Description*: Sends user preferences, friend profiles (interests, last met dates), and free calendar slots to Google Gemini AI. Returns structured JSON suggestions containing activity, venue type, suggested time, duration, and rationale.

#### 3. Friends Management (`/api/friends`)
- **`POST /api/friends/request`** — Send a friend request (`pending` state).
- **`POST /api/friends/respond`** — Update friendship status (`accepted`, `rejected`, `blocked`).
- **`GET /api/friends/:userId`** — Fetch all accepted friends for a specific user.

#### 4. Availability Management (`/api/availability`)
- **`POST /api/availability`** — Submit user free-time windows with start/end timestamps and timezone.
- **`GET /api/availability/:userId`** — Query chronological availability entries for a given user.

#### 5. Scheduler Engine (`/api/schedule`)
- **`POST /api/schedule/find-slots`** — Computes common overlapping free time blocks for a group of user IDs given a search range and minimum meeting duration.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 18 (bootstrapped with Vite)
- **Styling**: Tailwind CSS, Lucide React Icons
- **Routing**: React Router DOM (v6)
- **State/Auth**: React Context API (`AuthContext`)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Database**: PostgreSQL (relational schema with `uuid-ossp` and Foreign Key cascading)
- **AI Integration**: Google Gemini AI (`gemini-2.5-flash` with JSON Schema Enforcement)

---

## 🗄️ Database Schema Overview

```sql
users (id UUID, name, email, google_calendar_token, created_at)
  │
  ├──> friendships (id UUID, user_id, friend_id, status ['pending','accepted','blocked'])
  ├──> availability (id UUID, user_id, start_time, end_time, timezone)
  └──> meetups (id UUID, title, start_time, end_time, status, host_id)
        └──> meetup_participants (meetup_id, user_id, status ['pending','accepted','declined'])
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** database instance
- **Google Gemini API Key** (for AI meetup suggestions)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/orbit_db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Initialize PostgreSQL schema:
```bash
psql -U your_user -d orbit_db -f schema.sql
```

Start the backend server:
```bash
npm start
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to start using Orbit!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
