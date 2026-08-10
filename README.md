# FreshMart — VS Code Ready

FreshMart is a React/Vite frontend with a FastAPI + MongoDB backend.

## Requirements

- VS Code
- Node.js 20+ and npm
- Python 3.11+ (3.12 recommended)
- MongoDB Community Server running locally, OR a MongoDB Atlas connection

## 1. Open in VS Code

Open the `FreshMart_VSCode` folder itself.

VS Code will recommend the extensions listed in `.vscode/extensions.json`.

## 2. Configure MongoDB

Copy:

`backend/.env.example` → `backend/.env`

For local MongoDB, the defaults are:

```text
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=freshmart
```

Change `JWT_SECRET` to a long random value.

## 3. Start backend

### Windows

Double-click `run-backend.bat`.

Or use the VS Code terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Backend:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

## 4. Seed demo products

With the backend running, open a second terminal:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/seed
```

Expected response contains `seeded: true` the first time.

Demo accounts created by seed:

- Admin: `admin@freshmart.com` / `admin123`
- Shopper: `demo@freshmart.com` / `demo123`

Change these credentials before using the app in production.

## 5. Start frontend

Double-click `run-frontend.bat`.

Or:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open:

`http://localhost:5173`

## 6. VS Code extensions

Recommended:

- Python — `ms-python.python`
- Pylance — `ms-python.vscode-pylance`
- Python Debugger — `ms-python.debugpy`
- ESLint — `dbaeumer.vscode-eslint`
- Tailwind CSS IntelliSense — `bradlc.vscode-tailwindcss`
- Prettier — `esbenp.prettier-vscode`
- MongoDB for VS Code — `mongodb.mongodb-vscode`
- REST Client — `humao.rest-client`

The project already includes `.vscode/extensions.json`, so VS Code can show these recommendations automatically.

## Important

Do not commit `backend/.env` or frontend `.env` if they contain secrets. They are intentionally excluded from this starter package. Use the `.env.example` files.

The AI assistant works with a local fallback by default. To enable the optional external AI integration, install the appropriate `emergentintegrations` package and set `EMERGENT_LLM_KEY`.
