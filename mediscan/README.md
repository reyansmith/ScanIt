# 🩺 MediScan — Personal Health Scanner

Scan any product barcode and instantly get a personalized **Safe / Caution / Danger** verdict based on your health conditions.

**Stack:** FastAPI (Python) · React (Vite) · SQLite (zero setup)  
📖 **Full Technical Specs & Architecture:** [DOCUMENTATION.md](DOCUMENTATION.md)

---

## ⚡ Quick Start

### Prerequisites
| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Git | any | https://git-scm.com |

---

### 1. Clone the repo

```bash
git clone https://github.com/reyansmith/scanit.git
cd scanit/mediscan
```

---

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install fastapi "uvicorn[standard]" sqlalchemy[asyncio] aiosqlite \
    pydantic pydantic-settings "python-jose[cryptography]" \
    "passlib[bcrypt]" python-multipart python-dotenv aiohttp httpx

# Start the backend (SQLite DB is created automatically)
python -m uvicorn app.main:app --reload
```

Backend runs at → **http://localhost:8000**  
Auto docs at → **http://localhost:8000/docs**

> **No database setup needed.** A `mediscan.db` SQLite file is created automatically on first run.

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

### 4. (Optional) Enable MediBot AI

Create a `.env` file inside the `backend/` folder:

```env
OPENAI_API_KEY=sk-your-key-here
```

MediBot will work without this — it just returns a helpful fallback message instead of live AI responses.

---

## 🗂️ Project Structure

```
mediscan/
├── backend/          # FastAPI Python API
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── models/   # SQLAlchemy DB models
│   │   └── services/ # Barcode lookup, Verdict engine, MediBot
│   └── requirements.txt
├── frontend/         # React + Vite UI
│   └── src/
│       ├── pages/    # Landing, Dashboard, Scanner, Community
│       └── components/
└── docker-compose.yml
```

---

## 🔑 Key Features

- **MediVerdict™** — Safe / Caution / Danger badge for 9 health conditions
- **Barcode Scanner** — Camera scan or manual entry, powered by OpenFoodFacts (free, no API key)
- **MediBot** — AI chat assistant that knows your health profile and the scanned product
- **Dashboard** — Alerts panel + weekly nutrition progress tracker
- **Community Hub** — Posts, recipes, symptom tracking, product voting

---

## 🏥 Supported Health Conditions

Type 1 & 2 Diabetes · Hypertension · High Cholesterol · Celiac Disease · Nut Allergy · Dairy Allergy · Chronic Kidney Disease (CKD) · IBS/FODMAP Sensitivity

---

## 🐳 Run with Docker (alternative)

```bash
# From the mediscan/ folder
docker-compose up
```

This starts PostgreSQL + Redis + Backend + Frontend together.

---

## ⚠️ Notes

- This app is **not a substitute for medical advice**.
- The `.env` file is git-ignored — never commit your API keys.
