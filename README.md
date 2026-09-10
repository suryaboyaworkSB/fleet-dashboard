# 🚛 Fleet Dashboard — Real-Time Vehicle Tracking

A full-stack fleet tracking dashboard built with **FastAPI + Redis** (backend) and **React + Leaflet** (frontend).

---

## ⚡ Quick Start

### 1. Add Your Credentials

Open `backend/.env` and fill in your Verizon API details:

```
VERIZON_APP_ID=your_app_id_here
VERIZON_TOKEN=your_bearer_token_here
```

---

### 2. Start Redis

**Mac:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Linux:**
```bash
sudo apt install redis-server
sudo service redis start
```

**Windows (Docker):**
```bash
docker run -p 6379:6379 redis
```

---

### 3. Start the Backend

```bash
cd backend
python -m venv venv

# Mac/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

Test it:
```bash
curl http://localhost:8000/api/live-vehicles
```

---

### 4. Start the Frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 📁 Project Structure

```
fleet-dashboard/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── .env                       # ← Add your credentials here
│   ├── requirements.txt
│   ├── core/
│   │   └── config.py              # Environment settings
│   ├── models/
│   │   └── vehicle.py             # Vehicle Pydantic models
│   ├── routes/
│   │   └── vehicles.py            # API endpoints
│   └── services/
│       └── verizon_service.py     # Verizon API + Redis caching
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                 # Root component + layout
        ├── index.js               # React entry + Leaflet CSS
        ├── components/
        │   ├── FleetMap.js        # Leaflet map + markers + popups
        │   ├── FleetMap.css
        │   ├── Sidebar.js         # Stats, filter, vehicle list
        │   ├── Sidebar.css
        │   ├── LoadingOverlay.js  # Initial loading spinner
        │   └── LoadingOverlay.css
        ├── hooks/
        │   └── useFleetData.js    # Polling hook (every 5s)
        └── services/
            └── api.js             # Axios API client
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/live-vehicles` | All vehicles (optional `?status=moving\|idle\|offline`) |
| GET | `/api/vehicles/summary` | Counts by status |
| GET | `/api/vehicles/{id}` | Single vehicle by ID |
| GET | `/health` | Health check |

---

## 🎨 Features

- **Live map** with color-coded markers: 🟢 Moving · 🟡 Idle · 🔴 Offline
- **Auto-polling** every 5 seconds
- **Redis cache** with 30-second TTL (reduces API calls)
- **Sidebar** with fleet summary + per-vehicle list
- **Filter** by vehicle status
- **Popups** with name, speed, status, driver, and address
- **Auto-fit** map to show all vehicles on load

---

## 🛠 Next Steps

- Run `"optimize it for production"` — Docker, Nginx, PM2
- Run `"deploy to AWS"` — ECS, RDS, ElastiCache
- Run `"add analytics + alerts"` — idle alerts, speed thresholds, PostgreSQL history
