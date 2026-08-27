/**
 * Quantum Digital Signature Security API Client
 * Connects React Cyber-SOC Dashboard to FastAPI Gateway (/api/v1)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';


async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail?.message || data.detail || `HTTP Error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Arbitrator Node
  createSession: (numPairs = 1000, baselineNoise = 0.02, alpha = 1e-6) =>
    request('/arbitrator/epr-distribute', {
      method: 'POST',
      body: JSON.stringify({
        num_pairs: numPairs,
        baseline_noise: baselineNoise,
        alpha: alpha,
      }),
    }),

  getSession: async (sessionId) => {
    const res = await request(`/arbitrator/sessions/${sessionId}`);
    return res.session || res;
  },

  listSessions: () => request('/arbitrator/sessions'),

  // Alice Node
  signDocument: (sessionId, documentHash) =>
    request('/alice/sign', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        document_hash: documentHash,
      }),
    }),

  getAliceState: (sessionId) => request(`/alice/state/${sessionId}`),

  // Bob Node
  verifySignature: (sessionId) =>
    request('/bob/verify', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),

  siftBases: (sessionId) =>
    request('/bob/sift', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),

  getBobState: (sessionId) => request(`/bob/state/${sessionId}`),

  // Threat Detection Engine
  runAudit: (sessionId) =>
    request('/security/threshold-audit', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),

  getSecurityConfig: () => request('/security/config'),

  // Red Team Attack Sandbox
  injectMitm: (sessionId, attackFraction = 0.25, basisStrategy = 'RANDOM') =>
    request('/attacks/intercept-resend', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        attack_fraction: attackFraction,
        basis_strategy: basisStrategy,
      }),
    }),

  injectForgery: (sessionId, attackFraction = 0.15) =>
    request('/attacks/forgery', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        attack_fraction: attackFraction,
      }),
    }),

  injectReplay: (sessionId, replaySessionId) =>
    request('/attacks/replay', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        replay_session_id: replaySessionId,
      }),
    }),

  injectNoise: (sessionId, noiseModel = 'DEPOLARIZING', probability = 0.02) =>
    request('/attacks/noise', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        noise_model: noiseModel,
        probability: probability,
      }),
    }),

  injectPns: (sessionId, intensity = 0.20) =>
    request('/attacks/pns', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        intensity: intensity,
      }),
    }),

  // Telemetry & Diagnostic Health
  getTelemetry: (limit = 20) => request(`/sessions/telemetry/recent?limit=${limit}`),

  getHealth: () => request('/health'),

  resetSession: (sessionId) =>
    request('/sessions/reset', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
};
