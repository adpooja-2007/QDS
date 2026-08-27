const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const dbApi = {
  // Get database stats and connectivity
  getStats: async () => {
    const res = await fetch(`${API_BASE}/db/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch DB stats`);
    return res.json();
  },

  // Get table schema definitions
  getTables: async () => {
    const res = await fetch(`${API_BASE}/db/tables`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch tables schema`);
    return res.json();
  },

  // List all sessions from database
  getSessions: async (status = '', search = '', limit = 100) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    params.append('limit', limit);

    const res = await fetch(`${API_BASE}/db/sessions?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch sessions`);
    return res.json();
  },

  // Get full nested session record (Alice bits, Bob measurements, Bell states)
  getSessionDetail: async (sessionId) => {
    const res = await fetch(`${API_BASE}/db/sessions/${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch session detail`);
    return res.json();
  },

  // Get recent telemetry events
  getTelemetryLogs: async () => {
    const res = await fetch(`${API_BASE}/sessions/telemetry/recent`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch telemetry`);
    return res.json();
  },

  // Clear database test cache
  clearDatabase: async () => {
    const res = await fetch(`${API_BASE}/db/clear`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to clear DB`);
    return res.json();
  },

  // Generate a live quantum signature record directly into DB
  generateRecord: async (docName = 'defense_telemetry_dispatch.sig') => {
    const res = await fetch(`${API_BASE}/sessions/run-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_name: docName,
        file_size_kb: 64.2,
        num_pairs: 50,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to generate signature`);
    return res.json();
  },
};

