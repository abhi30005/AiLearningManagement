# AI Learning Management System

Production-ready starter for an AI-powered LMS with:
- `frontend`: React + Vite LMS app
- `backend`: FastAPI API services with MongoDB-backed persistence

## 1. Project Structure

```text
LearningManagement/
  backend/
  frontend/
```

## 2. Local Development

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Health check:
- `GET http://127.0.0.1:8000/health`

MongoDB:
- Set `MONGODB_URI` to your MongoDB connection string.
- Set `MONGODB_DB` if you want a database name other than `lumina_lms`.
- If MongoDB is not reachable during local development, the backend falls back to `backend/data/app_state.json` so the UI still works.

### Frontend (React + Express)

```bash
cd frontend
npm run dev
```

App URL:
- `http://127.0.0.1:3000`

The frontend calls the backend at `http://127.0.0.1:8000` by default. Set `VITE_API_BASE_URL` if your API runs elsewhere.

## 3. Build and Production Run

```bash
cd frontend
npm run build
```

The production build is emitted under `frontend/artifacts/lumina-lms/dist/public`.

## 4. Environment Variables

### Backend (`backend/.env`)
- `MONGODB_URI`
- `MONGODB_DB`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `SECRET_KEY`
- `ALLOWED_ORIGINS`

### Frontend (`frontend/.env`)
- `PORT`
- `BASE_PATH`
- `VITE_API_BASE_URL`

## 5. Deployment Notes

1. Deploy backend first and set its public base URL.
2. Set frontend `VITE_API_BASE_URL` to that backend URL.
3. For backend CORS, set `ALLOWED_ORIGINS` to your frontend domain(s).
4. Build frontend with `npm run build`.
5. Do not commit real secrets in `backend/.env`; use `.env.example` and platform secret managers.
6. The backend persists dynamic app data in MongoDB when `MONGODB_URI` is reachable, with a JSON fallback for offline local work.

## 6. Verification Commands

Frontend:
```bash
npm run typecheck
npm run build
```

Backend (from venv):
```bash
python -c "import main; print('backend_import_ok')"
```

Optional backend smoke check:
```bash
python - <<'PY'
from fastapi.testclient import TestClient
from main import app
client = TestClient(app)
assert client.get("/health").status_code == 200
assert client.get("/courses/").status_code == 200
print("backend_smoke_ok")
PY
```
