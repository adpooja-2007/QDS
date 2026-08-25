# Local PostgreSQL Setup & Management Guide — QDS

This guide details how local PostgreSQL is integrated, configured, started, and verified for the **Quantum Digital Signature (QDS)** Cyber Threat Detection system.

---

## 1. Overview

The QDS backend uses **SQLAlchemy 2.0** with **Asyncpg** and **Psycopg2** drivers to manage session lifecycle state (`quantum_sessions`) and API performance telemetry (`telemetry_logs`).

| Resource | Value |
|---|---|
| **Database Engine** | PostgreSQL 18.3 |
| **Host** | `127.0.0.1` (localhost) |
| **Port** | `5432` |
| **Database Name** | `qds_db` |
| **Username** | `postgres` |
| **Password** | `postgres` |
| **Async Driver** | `postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/qds_db` |
| **Sync Driver** | `postgresql://postgres:postgres@127.0.0.1:5432/qds_db` |

---

## 2. Environment Configuration (`.env`)

Create or verify `backend/.env` containing:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=qds_db
```

---

## 3. Starting the Local PostgreSQL Service

### Option A: WSL / Linux Service (Active Setup)
If PostgreSQL is running inside WSL (Windows Subsystem for Linux):

```bash
# Start PostgreSQL service
wsl -u root service postgresql start

# Verify PostgreSQL service status
wsl -u root service postgresql status

# Verify database connection
wsl -u postgres psql -d qds_db -c "SELECT version();"
```

### Option B: Native Windows Service
If using native Windows PostgreSQL service:

```powershell
# Start service via PowerShell (Admin)
Start-Service postgresql-x64-18

# Verify service state
Get-Service *postgres*
```

---

## 4. Initializing Database Schemas

The application automatically creates required database tables during FastAPI startup via `await init_db()` in `backend/app/core/database.py`.

To manually trigger initialization via Python:

```powershell
.\.venv\Scripts\python.exe -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"
```

---

## 5. Database Schema Inspection

You can inspect the generated tables and records using `psql`:

### List Tables
```bash
wsl -u postgres psql -d qds_db -c "\dt"
```
**Output:**
```text
            List of relations
 Schema |       Name       | Type  |  Owner   
--------+------------------+-------+----------
 public | quantum_sessions | table | postgres
 public | telemetry_logs   | table | postgres
```

### Query Quantum Sessions
```bash
wsl -u postgres psql -d qds_db -c "SELECT session_id, status, created_at FROM quantum_sessions;"
```

### Query Telemetry Logs
```bash
wsl -u postgres psql -d qds_db -c "SELECT id, request_id, endpoint, method, execution_time_ms, status_code FROM telemetry_logs ORDER BY id DESC LIMIT 10;"
```

---

## 6. Offline Fallback Behavior

If PostgreSQL is not running or port 5432 is unreachable, the system automatically falls back to an **in-memory SQLite database** (`sqlite+aiosqlite:///:memory:`). This ensures zero-friction development and offline testing capabilities.

Log output when falling back:
```text
WARNING | Could not connect to PostgreSQL at postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/qds_db (...). Falling back to in-memory SQLite database for offline execution.
INFO    | In-memory SQLite database initialized as fallback.
```

---

## 7. Running Tests Against Local PostgreSQL

Run the full pytest suite to verify database interactions:

```powershell
.\.venv\Scripts\pytest.exe backend/tests
```

**Expected Result:**
```text
============================= 27 passed in 17.56s =============================
```
