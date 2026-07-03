# Deployment

## Render Backend

Create a Render **Web Service** for the `backend` folder.

Use these settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python render_start.py
Health Check Path: /health
```

Do not use `--reload` on Render. `--reload` is only for local development.

Health endpoints:

```text
/health      -> simple liveness check for Render
/healthz     -> same as /health
/api/health  -> same as /health
/ready       -> database readiness check
/readyz      -> same as /ready
```

Set these environment variables in Render:

```env
PYTHON_VERSION=3.11.9
MONGODB_URI=your-mongodb-atlas-uri
MONGODB_DB=LearningManagement
OPENAI_API_KEY=your-openai-key
JWT_SECRET_KEY=generate-a-long-random-secret
SECRET_KEY=generate-a-long-random-secret
DEFAULT_ADMIN_EMAIL=admin@eduai.edu
DEFAULT_ADMIN_PASSWORD=change-this-admin-password
DEFAULT_ADMIN_NAME=Platform Admin
SEED_DEMO_DATA=false
ALLOWED_ORIGINS=*
CORS_ALLOW_CREDENTIALS=false
MONGODB_TIMEOUT_MS=10000
MONGODB_CONNECT_ATTEMPTS=5
MONGODB_RETRY_DELAY_SECONDS=2
```

In MongoDB Atlas, allow Render to connect:

```text
Network Access -> Add IP Address -> 0.0.0.0/0
```

## Vercel Frontend

Create a Vercel project for the `frontend` folder.

Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

Build settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```
