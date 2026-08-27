# Developer Onboarding & Operations Guide

> **Project**: Quantum Digital Signature Security API & Console (QDS)  
> **Environment**: Windows PowerShell / WSL / Linux / macOS

---

## 1. Prerequisites

- **Python**: `3.10.x` or `3.11.x`
- **Node.js**: `18.x` or `20.x`
- **npm**: `9.x` or `10.x`
- **PostgreSQL**: `14+` (Local Windows or WSL `Ubuntu`)
- **Git**: `2.30+`

---

## 2. Environment Setup

### 2.1. Python Virtual Environment & Dependencies
```powershell
# In repository root:
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Python requirements
pip install -r backend/requirements.txt
```

### 2.2. Frontend Dependencies
```powershell
# Navigate to frontend directory:
cd q-email
npm install
cd ..
```

### 2.3. PostgreSQL Setup (Optional but Recommended)
```bash
# In WSL:
wsl -u root service postgresql start
wsl -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
wsl -u postgres psql -c "CREATE DATABASE qds_db OWNER postgres;"
```
*(Note: If PostgreSQL is not running, the application automatically falls back to in-memory SQLite with write-through cache!)*

---

## 3. Daily Development Workflow

### Starting the Servers:
```powershell
# Terminal 1: Backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --cwd backend --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd q-email
npm run dev
```

### Running Tests:
```powershell
# Full test suite (83 test cases)
.\.venv\Scripts\pytest.exe backend/tests

# Run verification script
.\.venv\Scripts\python.exe backend/scripts/verify_all_modules.py

# Frontend build verification
cd q-email
npm run build
```

---

## 4. Troubleshooting & FAQ

1. **Port 8000 or 3000 already in use**:
   - Check and kill existing processes:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
   ```
2. **Missing Zegion font**:
   - Verify font files exist in `q-email/public/fonts/Zegion.otf` and `q-email/public/fonts/Zegion.ttf`.
3. **Database connection timeout**:
   - The backend will print a warning and automatically activate `sqlite+aiosqlite:///:memory:` fallback mode so all features remain functional.
