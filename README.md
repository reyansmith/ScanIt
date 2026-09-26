# MediScan / ScanIt

MediScan is a React and Node.js application that checks packaged-food data against a user's health profile, produces a personalized MediVerdict, tracks scan history, and provides a streaming Groq-powered assistant.

## Architecture

- Frontend: React 18, Vite, Zustand, Axios, Recharts
- Backend: Node.js 20+, Express 5
- AI: official Groq JavaScript SDK with server-sent-event streaming
- Product data: OpenFoodFacts, with optional Nutritionix fallback
- Storage: in-memory only; data resets whenever the backend restarts

No Python runtime or database is required.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and set a unique `SECRET_KEY`. Add `GROQ_API_KEY` to enable live MediBot responses.
2. Install and start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. In a second terminal, install and start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:5173`; the backend runs at `http://localhost:8000`. On Windows, `run_servers.bat` starts both and `stop_servers.bat` stops both.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `ENVIRONMENT` | No | `development` | Enables production configuration checks |
| `PORT` | No | `8000` | Backend HTTP port |
| `SECRET_KEY` | Yes in production | Development fallback | JWT signing secret |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Access-token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh-token lifetime |
| `GROQ_API_KEY` | For live AI | Empty | Server-side Groq credential |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Groq model slug |
| `NUTRITIONIX_APP_ID` | No | Empty | Optional Nutritionix fallback ID |
| `NUTRITIONIX_API_KEY` | No | Empty | Optional Nutritionix fallback key |
| `CORS_ORIGINS` | No | Local frontend origins | JSON array or comma-separated origins |

Never put provider credentials in the frontend.

## Commands

From `backend/`:

- `npm run dev` — start with Node's watch mode
- `npm start` — start normally
- `npm test` — run backend contract tests

From `frontend/`:

- `npm run dev` — start Vite
- `npm run build` — create a production build

## Docker

```bash
docker compose up --build
```

This starts the Node backend on port 8000 and Vite on port 5173.

## Important limitation

The current store is intentionally in-memory. Accounts, profiles, scans, and community posts do not survive a backend restart. A database can be added later without changing the current HTTP contracts.

MediScan is informational only and is not a substitute for professional medical advice.
