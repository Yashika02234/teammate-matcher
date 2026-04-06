# Teammate Matcher (SyncUp)

SyncUp is a teammate matching platform that helps users find compatible partners for projects and collaborations based on skills, interests, and availability.

## Project Structure

- `app/`: Backend FastAPI application.
- `frontend/`: Frontend React application (built with Vite and TypeScript).
- `requirements.txt`: Python dependencies for the backend.
- `.env`: Environment variables configuration.

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (Local or Atlas)

---

## Backend Setup

1. **Clone the repository** (if not already done).
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```
3. **Activate the virtual environment**:
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Configure Environment Variables**:
   Create a `.env` file in the root directory (use `.env.example` as a template):
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
   DB_NAME=teammate_matcher
   JWT_SECRET=your_jwt_secret_key
   ```
6. **Run the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

---

## Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## Features

- **User Authentication**: Secure login and signup with JWT.
- **Smart Matching**: Find teammates based on skills and preferences.
- **Collaboration Requests**: Send and manage project requests.
- **Dynamic UI**: Responsive and interactive design with Framer Motion.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | Required |
| `DB_NAME` | Database name | `teammate_matcher` |
| `JWT_SECRET` | Secret key for JWT signing | `super-secret-key` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma separated) | `*` |
