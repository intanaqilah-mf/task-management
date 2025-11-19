# Task Management Application

A full-stack task management application with a modern React frontend and FastAPI backend.

## 🚀 Quick Start

### Option 1: Start Everything at Once (Recommended)
```bash
./start-all.sh
```
This will start both frontend and backend servers automatically.

### Option 2: Start Individually

**Start Backend Only:**
```bash
./start-backend.sh
```

**Start Frontend Only:**
```bash
./start-frontend.sh
```

## 📦 Build for Production

**Build Frontend:**
```bash
./build-frontend.sh
```

## 🌐 URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
task-management/
├── frontend/              # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── pages/        # Page Components
│   │   ├── stores/       # Zustand State Management
│   │   ├── services/     # API Services
│   │   ├── hooks/        # Custom React Hooks
│   │   ├── types/        # TypeScript Types
│   │   └── utils/        # Utility Functions
│   ├── package.json
│   └── README.md
│
├── backend/              # FastAPI + SQLAlchemy Backend
│   ├── app/
│   │   ├── api/         # API Routes
│   │   ├── models/      # Database Models
│   │   ├── schemas/     # Pydantic Schemas
│   │   ├── core/        # Core Functionality
│   │   ├── db/          # Database Setup
│   │   └── main.py      # Application Entry
│   ├── requirements.txt
│   └── .env
│
├── start-all.sh         # Start both servers
├── start-backend.sh     # Start backend only
├── start-frontend.sh    # Start frontend only
├── build-frontend.sh    # Build frontend for production
└── README.md            # This file
```

## ✨ Features

### Frontend
- ✅ User Authentication (Login/Register)
- ✅ Task CRUD Operations
- ✅ Advanced Filtering (Status, Priority, Category)
- ✅ Real-time Search
- ✅ Dark/Light Theme Toggle
- ✅ Fully Responsive Design (Mobile/Tablet/Desktop)
- ✅ Loading States & Skeleton Loaders
- ✅ Error Handling & Toast Notifications
- ✅ Form Validation with Zod

### Backend
- ✅ JWT Authentication
- ✅ User Registration & Login
- ✅ Task CRUD Operations
- ✅ Advanced Query Filtering
- ✅ Password Hashing (Bcrypt)
- ✅ Pydantic Data Validation
- ✅ OpenAPI/Swagger Documentation
- ✅ CORS Support
- ✅ SQLite Database

## 🛠️ Tech Stack

### Frontend
- React 19.2
- TypeScript
- Vite
- Zustand (State Management)
- React Router v6
- Tailwind CSS
- Zod (Validation)
- date-fns
- Lucide Icons

### Backend
- FastAPI 0.109.0
- Python 3.9+
- SQLAlchemy 2.0
- Pydantic
- Python-JOSE (JWT)
- Passlib (Password Hashing)
- SQLite
- Uvicorn

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

## 🔧 Manual Setup

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## 🎯 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Task Management
VITE_APP_VERSION=1.0.0
```

### Backend (.env)
```env
APP_NAME=Task Management API
APP_VERSION=1.0.0
DEBUG=true
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./task_management.db
CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174"]
```

## 🚀 Deployment

### Frontend
- Build: `npm run build`
- Deploy the `dist/` folder to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Any static hosting

### Backend
- Use Docker or deploy to:
  - Heroku
  - AWS EC2/ECS
  - Google Cloud Run
  - DigitalOcean

## 📚 Documentation

- Frontend README: `frontend/README.md`
- Backend API Docs: http://localhost:8000/docs (when running)

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill processes on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill processes on port 5173/5174 (frontend)
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

**Frontend not connecting to backend:**
- Check that backend is running on port 8000
- Verify `VITE_API_BASE_URL` in frontend/.env
- Check CORS settings in backend/.env

**Database issues:**
- Delete `task_management.db` to reset database
- Restart the backend server

## 📄 License

MIT

## 👨‍💻 Author

Built as a production-grade full-stack demonstration project.

---

**Happy Coding!** 🎉
