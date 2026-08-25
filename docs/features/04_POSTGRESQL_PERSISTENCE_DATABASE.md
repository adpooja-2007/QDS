# Feature 04: PostgreSQL Persistence & Database Architecture

> **Location**: `backend/app/core/database.py`, `backend/app/models/db_models.py`, `backend/app/services/session_service.py`  
> **Database Engine**: PostgreSQL 18.3 (`qds_db`)

---

## 1. Overview & Purpose

The QDS backend uses **PostgreSQL 18.3** with **SQLAlchemy 2.0** ORM (`asyncpg` for async API endpoints, `psycopg2-binary` for sync background transactions) to achieve persistent, auditable storage for session state lifecycles and API performance telemetry logs.

---

## 2. Relational Database Schemas

### Table 1: `quantum_sessions`

```sql
CREATE TABLE quantum_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    status VARCHAR(32) NOT NULL INDEX,
    nonce VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    alice JSONB NOT NULL DEFAULT '{}'::jsonb,
    bob JSONB NOT NULL DEFAULT '{}'::jsonb,
    sifting JSONB NOT NULL DEFAULT '{}'::jsonb,
    attacks JSONB NOT NULL DEFAULT '[]'::jsonb,
    security JSONB NOT NULL DEFAULT '{}'::jsonb
);
```

#### ORM Model (`SessionModel` in `db_models.py`):
- Uses structured JSON columns (`parameters`, `alice`, `bob`, `sifting`, `attacks`, `security`) matching Pydantic schemas.
- Converts ORM model to Pydantic dict via `.to_pydantic_dict()`.

### Table 2: `telemetry_logs`

```sql
CREATE TABLE telemetry_logs (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL INDEX,
    endpoint VARCHAR(256) NOT NULL INDEX,
    method VARCHAR(16) NOT NULL,
    timestamp VARCHAR(64) NOT NULL,
    execution_time_ms FLOAT NOT NULL,
    status_code INTEGER NOT NULL,
    session_id VARCHAR(64) NULLABLE INDEX,
    error TEXT NULLABLE
);
```

#### ORM Model (`TelemetryModel` in `db_models.py`):
- Records unique request UUIDs, endpoints, HTTP methods, execution duration, status codes, and exception traces.

---

## 3. Persistent Features & Lifespan Patterns

### A. Automatic Schema Auto-Discovery (`init_db()`)
During FastAPI startup (`lifespan`), `await init_db()` imports `db_models.py` to register all ORM models with `Base.metadata` before executing `create_all`.

```python
async def init_db() -> None:
    import app.models.db_models  # Auto-registers SessionModel and TelemetryModel
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_service.load_sessions_from_db()
```

### B. Startup Session Hydration (`load_sessions_from_db()`)
When the FastAPI server starts or restarts, `SessionService.load_sessions_from_db()` queries existing records from `quantum_sessions` table and hydrates `self._sessions` in-memory cache:
- Prevents session data loss across server restarts.

### C. Zero-Friction SQLite Fallback Handler
If PostgreSQL is offline or unreachable on port 5432:
- Log warning message.
- Automatically fallback to in-memory SQLite (`sqlite+aiosqlite:///:memory:`).
- Guarantees offline execution and testing capabilities.

### D. Telemetry Write-Through Logging
`TelemetryMiddleware._save_telemetry_to_db(entry)` automatically inserts request performance logs into `telemetry_logs` table upon API response completion.
