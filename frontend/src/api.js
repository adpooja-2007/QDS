// QDS Quantum Chat API Client

const API_BASE = '/api/v1';

// Initial network topology setup for QuARC
export const initNetwork = async () => {
  try {
    const res = await fetch(`${API_BASE}/network/nodes`);
    if (!res.ok) return;
    const nodes = await res.json();
    if (nodes.length === 0) {
      await fetch(`${API_BASE}/network/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: 'alice', node_type: 'CLIENT' })
      });
      await fetch(`${API_BASE}/network/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: 'bob', node_type: 'CLIENT' })
      });
      await fetch(`${API_BASE}/network/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: 'q1', node_type: 'ROUTER' })
      });
      await fetch(`${API_BASE}/network/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: 'q2', node_type: 'ROUTER' })
      });

      await fetch(`${API_BASE}/network/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: 'l1', source: 'alice', destination: 'q1', fidelity: 0.99, latency: 1.0 })
      });
      await fetch(`${API_BASE}/network/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: 'l2', source: 'q1', destination: 'bob', fidelity: 0.99, latency: 1.0 })
      });
    }
  } catch (e) {
    console.error('Network init failed:', e);
  }
};

// ── Auth & Users ─────────────────────────────────────────────────────────────
export const fetchUsers = async (excludeUsername = '') => {
  try {
    const url = excludeUsername
      ? `${API_BASE}/auth/users?exclude_username=${encodeURIComponent(excludeUsername)}`
      : `${API_BASE}/auth/users`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.error('fetchUsers error:', err);
    return [];
  }
};

export const loginUser = async (username, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
};

export const registerUser = async ({ username, password, display_name, role }) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, display_name, role })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
};

// ── Chat Messaging ───────────────────────────────────────────────────────────
export const fetchChatMessages = async (user1, user2, limit = 100) => {
  if (!user1 || !user2) return [];
  try {
    const res = await fetch(
      `${API_BASE}/chat/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.error('fetchChatMessages error:', err);
    return [];
  }
};

export const fetchAllChatMessages = async (limit = 200) => {
  try {
    const res = await fetch(`${API_BASE}/chat/all-messages?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.error('fetchAllChatMessages error:', err);
    return [];
  }
};


export const sendQuantumChatMessage = async ({
  sender,
  recipient,
  text = '',
  file_name = null,
  file_type = null,
  file_size = null,
  file_data = null,
  inject_attack = false,
  num_pairs = 1000
}) => {
  const res = await fetch(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender,
      recipient,
      text,
      file_name,
      file_type,
      file_size,
      file_data,
      inject_attack,
      num_pairs
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Quantum signature verification pipeline failed');
  }

  return res.json();
};

export const clearChatMessages = async (user1, user2) => {
  const res = await fetch(
    `${API_BASE}/chat/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error('Failed to clear chat history');
  return res.json();
};
