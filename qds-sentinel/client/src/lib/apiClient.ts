// FastAPI Backend API Client for QDS Sentinel (Second-Pitch UI)

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[FastAPI Backend Offline / Fallback] Endpoint ${endpoint} unreachable:`, error);
      throw error;
    }
  }

  // --- 1. SESSIONS API ---
  public async getSessions() {
    try {
      return await this.fetchApi<any>('/security/sessions');
    } catch {
      return {
        success: true,
        total_active_streams: 4,
        channels: [
          { channel_id: 'QKD-260827-91F4', endpoint: 'QN-BOB-01 (Satellite Relay)', status: 'ONLINE', key_rate: 1420, fidelity_type: 'sine_tick' },
          { channel_id: 'QKD-260827-91C1', endpoint: 'QN-ALICE-02 (Ground Station)', status: 'ONLINE', key_rate: 1850, fidelity_type: 'continuous_wave' },
          { channel_id: 'QKD-260827-8FD2', endpoint: 'QK-7 (Dark Fiber Node)', status: 'DEGRADED', key_rate: 340, fidelity_type: 'step_dip' },
          { channel_id: 'QKD-260827-8EE9', endpoint: 'ARB-CORE (Arbitrator Core)', status: 'ONLINE', key_rate: 1680, fidelity_type: 'wave_dot' },
        ]
      };
    }
  }

  public async createSession(payload: { endpoint: string; fidelity_type?: string; key_rate?: number }) {
    try {
      return await this.fetchApi<any>('/security/sessions/create', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      const newId = `QKD-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random()*9000)}`;
      return {
        success: true,
        message: `Channel ${newId} initialized successfully`,
        channel: {
          channel_id: newId,
          endpoint: payload.endpoint,
          status: 'ONLINE',
          key_rate: payload.key_rate || 1450,
          fidelity_type: payload.fidelity_type || 'continuous_wave'
        }
      };
    }
  }

  // --- 2. SECURITY & PQC REMEDIATION API ---
  public async auditAndRemediate(payload?: {
    document_hash?: string;
    qber_override?: number;
    chsh_score?: number;
  }) {
    try {
      return await this.fetchApi<any>('/security/audit-and-remediate', {
        method: 'POST',
        body: JSON.stringify(payload || {})
      });
    } catch {
      const qber = payload?.qber_override ?? 0.485;
      const chsh = payload?.chsh_score ?? 1.38;
      const isBreach = qber > 0.055 || chsh < 2.0;

      return {
        status: isBreach ? 'PQC_FALLBACK_ACTIVE' : 'QUANTUM_SECURE',
        qber,
        chsh_score: chsh,
        remediation_action: isBreach
          ? 'Activated CRYSTALS-Dilithium3 Classical Signature Fallback. Zeroized RAM keys.'
          : 'None (Channel operating under pristine quantum-secure teleportation).',
        ai_cognitive_report: isBreach
          ? `THREAT DIAGNOSIS
1. MitM Attack Detected: Calculated QBER of ${(qber * 100).toFixed(1)}% vastly exceeds Hoeffding threshold. Alice's classical feed-forward bits are being altered in transit.
2. Entanglement Depolarization: CHSH score collapsed from 2.81 down to ${chsh.toFixed(2)} (< 2.0 classical limit), proving state collapse.

AUTOMATED REMEDIATION PLAN EXECUTED
1. Physical Key Purge: Flushed sifted key registers from memory.
2. Dynamic PQC Handover: Suspended compromised quantum channel and hot-swapped to CRYSTALS-Dilithium3 signature verification over fallback IP tunnel.
3. Quantum Re-Probing: Background quantum ping generators initialized on physical fiber.`
          : 'No anomalies detected. QDS teleportation keys are active and verified. Quantum channel running at optimal coherence.',
        fallback_signature: isBreach ? '0x3a7d9f2e4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e' : undefined,
        pqc_algorithm: 'CRYSTALS-Dilithium3 (ML-DSA-65)'
      };
    }
  }

  // --- 3. ATTACK SIMULATION API ---
  public async injectAttack(type: 'forgery' | 'replay' | 'pns' | 'noise', params?: any) {
    let endpoint = '/attacks/forgery';
    let body: Record<string, any> = { attack_fraction: 0.5 };

    if (type === 'replay') {
      endpoint = '/attacks/replay';
      body = { replay_session_id: 'QKD-20260827-0001' };
    } else if (type === 'noise') {
      endpoint = '/attacks/noise';
      body = { qber_boost: 0.08 };
    } else if (type === 'pns') {
      endpoint = '/attacks/pns';
      body = { split_fraction: 0.4 };
    }

    try {
      return await this.fetchApi<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ ...body, ...params })
      });
    } catch {
      return {
        success: true,
        message: `Simulated attack ${type.toUpperCase()} injected successfully on quantum optical link.`
      };
    }
  }

  // --- 4. INCIDENTS API ---
  public async getIncidents() {
    try {
      return await this.fetchApi<any>('/security/incidents');
    } catch {
      return {
        success: true,
        total_incidents: 3,
        incidents: [
          { id: 'INC-2026-0801', title: 'Photon Number Splitting Tap', severity: 'CRITICAL', status: 'INVESTIGATING', qber: 0.142, chsh: 1.76, timestamp: '11:48:09' },
          { id: 'INC-2026-0802', title: 'Replay State Injection', severity: 'HIGH', status: 'MITIGATED', qber: 0.082, chsh: 1.95, timestamp: '11:31:08' },
          { id: 'INC-2026-0803', title: 'Thermal Fiber Noise Spike', severity: 'MEDIUM', status: 'RESOLVED', qber: 0.048, chsh: 2.34, timestamp: '10:15:22' },
        ]
      };
    }
  }
}

export const apiClient = new ApiClient();
