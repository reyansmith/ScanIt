# MediScan

A personalized health scanner that helps people evaluate packaged products based on their dietary needs and medical profile.

## Why this app exists

MediScan makes it easier to answer a simple but important question:

> "Is this product suitable for my health conditions?"

By scanning a product barcode, users can review ingredient details, assess risk levels, and receive a clearer recommendation tailored to their profile.

## Features

- Personalized health verdicts: Safe, Caution, or Danger
- Barcode and manual product lookup
- Health-aware recommendations based on user conditions
- Dashboard for progress and alerts
- Community-based discussion and shared insights
- MediBot assistant for product-related questions

## Tech Stack

- Python + FastAPI
- React + Vite
- SQLite for local data storage
- Docker-ready setup

## Project Structure

```text
mediscan/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── security.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── DOCUMENTATION.md
├── README.md
├── run_servers.bat
├── stop_servers.bat
└── .gitignore
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### 1. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

The API will run at:

- http://localhost:8000
- API docs: http://localhost:8000/docs

### 3. Start the frontend

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The UI will run at:

- http://localhost:5173

### 4. Optional: use the Windows quick launch

```bash
cd mediscan
run_servers.bat
```

## Optional AI Setup

Create a `.env` file in the backend folder:

```env
OPENAI_API_KEY=your-api-key-here
```

If no key is configured, the bot still works with a fallback response.

## Supported Health Conditions

- Type 1 Diabetes
- Type 2 Diabetes
- Hypertension
- High Cholesterol
- Celiac Disease
- Nut Allergy
- Dairy Allergy
- CKD
- IBS / FODMAP sensitivity

## Run with Docker

```bash
docker-compose up
```

## Important Note

This project supports healthier decision-making and education, but it is not a substitute for certified medical advice.
