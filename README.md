# Task Management Application

A smart task manager that helps you focus on what matters right now. Built with React + TypeScript and FastAPI.

## What This Does

This app helps you manage tasks with a focus on **action, not just organization**. It tells you what to work on next, tracks your progress, and reminds you when things need attention.

## Quick Start

**Option 1: Run everything with one command (recommended)**
```bash
./start-all.sh
```
This script handles everything automatically:
- Creates virtual env and installs Python packages
- Installs npm packages
- Copies .env.example to .env files
- Auto-creates database tables on first run
- Starts both backend and frontend servers

Visit http://localhost:5174 after it starts. The database will be created automatically - just register a new account to begin.

**Option 2: Run servers separately**
```bash
./start-backend.sh   # Backend only (port 8000)
./start-frontend.sh  # Frontend only (port 5174)
```
Both scripts auto-setup dependencies and environment files.

**URLs:**
- App: http://localhost:5174
- API Docs: http://localhost:8000/docs

## Manual Setup (if you don't want to use scripts)

### Prerequisites
- Node.js 18+
- Python 3.9+

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

The `.env.example` files are included in the repo. Copy them to `.env` (scripts do this automatically).

**Backend (.env)** - Change SECRET_KEY for production
```env
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=sqlite:///./task_management.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
```

**Frontend (.env)** - Works out-of-the-box for local dev
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Task Management
VITE_APP_VERSION=1.0.0
```

## API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Create account (email, password, name)
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info

### Task Endpoints
- `GET /api/tasks` - List tasks (supports filters: status, priority, category, search)
- `POST /api/tasks` - Create task with optional subtasks
- `GET /api/tasks/{id}` - Get single task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Filter Examples:**
```bash
# Search tasks
GET /api/tasks?search=meeting

# Filter by status and priority
GET /api/tasks?status=TODO&status=IN_PROGRESS&priority=HIGH

# Filter by category
GET /api/tasks?category=WORK
```

Full interactive API docs at http://localhost:8000/docs when running.

## Key Design Decisions

### Why "Closest Task"?
I wanted users to see what to work on **right now** without thinking. The app shows the task happening now or the next one coming up based on time ranges. It's like a suggestion engine - "here's what you should probably do next."

### Why Subtasks?
Big tasks are overwhelming. Breaking them into subtasks makes progress visible and gives you small wins. Each subtask has a checkbox, so you can see exactly where you are.

### Why Analytics?
I wanted users to see if they're actually getting stuff done. The productivity score weighs completed vs overdue tasks, so you know if you're on track or falling behind.

### Why Smart Notifications?
The app shows overdue and due-soon tasks when you login, so you pick up where you left off. It only shows these once per session (no spam), and cycles through overdue tasks every 3 minutes to remind you without being annoying.

### Why Categories?
People treat work, personal, and other stuff differently. Category filters let you focus on one part of life at a time. The Task List page has category tabs for quick switching.

### Why Sort Completed Tasks to Bottom?
Completed tasks are dimmed and moved down so you focus on what's left. You still see them for context, but they don't clutter your view.

## Assumptions & Implementation Choices

**Task Priority**
- Added "URGENT" beyond the standard LOW/MEDIUM/HIGH because some tasks really need immediate attention

**Time Tracking**
- Used start/end time fields instead of duration because people think in "I'll do this from 2-3pm" not "this takes 60 minutes"
- Time ranges help sort tasks by urgency

**Notifications**
- Session-based (not persistent) because login is the natural moment to check what you missed
- 3-minute cycle for overdue tasks balances reminder vs annoyance

**Completion Progress**
- Subtask completion shows progress percentage
- Helps decide if a task is worth finishing or should be re-scoped

**Malaysia Timezone**
- Used Asia/Kuala_Lumpur timezone for date comparisons to avoid "due today" bugs across timezones
- Makes the app work correctly for local users

**UI Framework**
- Chose Mantine UI over ShadCN because it's production-ready with accessibility built-in and has great TypeScript support

**State Management**
- Zustand instead of Redux because it's simpler and the app doesn't need complex state logic

**Database**
- SQLite for dev/demo, but designed to swap to PostgreSQL for production (just change DATABASE_URL)

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Mantine UI, Tailwind CSS, Zustand
**Backend:** FastAPI, SQLAlchemy, SQLite, JWT auth, Bcrypt

## Features

- ✅ Smart task suggestions (Closest Task)
- ✅ Subtasks with progress tracking
- ✅ Analytics dashboard with productivity scoring
- ✅ Due date notifications (overdue, due soon, upcoming)
- ✅ Category filtering (WORK, PERSONAL, SHOPPING, HEALTH, etc.)
- ✅ Search across titles, descriptions, categories
- ✅ Dark/light theme
- ✅ Fully responsive (mobile, tablet, desktop)

## Project Structure

```
task-management/
├── backend/
│   ├── app/
│   │   ├── api/v1/       # API endpoints
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Request/response schemas
│   │   ├── core/         # Config & security
│   │   └── db/           # Database setup
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/        # Main app pages
        ├── components/   # Reusable UI components
        ├── stores/       # State management
        ├── services/     # API calls
        └── hooks/        # Custom React hooks
```

## Troubleshooting

**"Port already in use"**
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5174 | xargs kill -9  # Frontend
```

**"Frontend can't connect to backend"**
- Make sure backend is running on port 8000
- Check `VITE_API_BASE_URL` in frontend/.env

**"Database errors"**
- Delete `task_management.db` and restart the backend
