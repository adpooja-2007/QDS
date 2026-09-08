/**
 * QDS Sentinel — Unified SOC Telemetry & Event Bridge
 * Synchronizes live data between:
 * - Quantum Chat (/chat)
 * - Attack Sandbox (/attack-sandbox)
 * - SOC Monitoring (/monitoring)
 * - Live Database Studio (/database)
 */

export interface TelemetryRow {
  id: string;
  time: string;
  source: string;
  text: string;
  tone: 'ink' | 'copper' | 'blue' | 'slate' | 'good';
  ms: string;
  isThreat?: boolean;
  qber?: string;
  chsh?: string;
  code?: string;
  payload?: string;
  classifier?: string;
  event?: string;
}

export interface ThreatRecord {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  origin: string;
  badge?: string;
  type: string;
  time: string;
  baseline: string;
  current: string;
  detail: string;
}

export interface IncidentRecord {
  id: string;
  status: 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  assigned: string;
  impact: 'CRITICAL' | 'HIGH' | 'MED' | 'LOW';
  title: string;
  detail: string;
  events: Array<[string, string, string]>;
  qber?: string;
  chsh?: string;
}

export interface SessionRecord {
  id: string;
  endpoint: string;
  doc?: string;
  state: 'STABLE' | 'DEGRADED' | 'PAUSED' | 'QUARANTINED';
  status?: string;
  rate: string;
  duration: string;
  trace: string;
  tone: 'good' | 'copper' | 'blue';
  qber?: string;
  chsh?: string;
  verdict?: 'ACCEPT' | 'REJECT';
  time?: string;
}

const STORAGE_KEY = 'qds_soc_telemetry_state_v1';

class SOCTelemetryService {
  private activeThreat: boolean = false;
  private attackScenario: string | null = null;
  private attackRunning: boolean = false;
  private telemetryRows: TelemetryRow[] = [];
  private threats: ThreatRecord[] = [];
  private incidents: IncidentRecord[] = [];
  private sessions: SessionRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadInitialState();
    this.startBackendSync();
  }

  private loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.activeThreat = Boolean(parsed.activeThreat);
        this.attackScenario = parsed.attackScenario || null;
        this.attackRunning = Boolean(parsed.attackRunning);
        if (Array.isArray(parsed.telemetryRows)) this.telemetryRows = parsed.telemetryRows;
        if (Array.isArray(parsed.threats)) this.threats = parsed.threats;
        if (Array.isArray(parsed.incidents)) this.incidents = parsed.incidents;
        if (Array.isArray(parsed.sessions)) this.sessions = parsed.sessions;
      }
    } catch (e) {
      console.warn('Could not load SOC telemetry from localStorage', e);
    }

    if (this.telemetryRows.length === 0) {
      this.initDefaultRecords();
    }
  }

  private saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeThreat: this.activeThreat,
          attackScenario: this.attackScenario,
          attackRunning: this.attackRunning,
          telemetryRows: this.telemetryRows.slice(0, 100),
          threats: this.threats.slice(0, 30),
          incidents: this.incidents.slice(0, 20),
          sessions: this.sessions.slice(0, 20),
        })
      );
    } catch (e) {
      // Ignore storage write errors
    }
    this.notify();
  }

  private initDefaultRecords() {
    const now = new Date();
    const timeStr = (offsetSec = 0) => {
      const d = new Date(now.getTime() - offsetSec * 1000);
      return d.toLocaleTimeString('en-GB', { hour12: false });
    };

    this.telemetryRows = [
      { id: 'evt-1', time: timeStr(1), source: 'QUANTUM_CORE', text: 'EPR distribution complete · 1024 pairs', tone: 'blue', ms: '18ms', qber: '1.2%', chsh: '2.78', code: '200 OK', event: 'Photon pulse transmission', classifier: 'NOMINAL_SECURE', payload: 'qds_otp_handshake.sig' },
      { id: 'evt-2', time: timeStr(3), source: 'ALICE', text: 'Joint Bell measurement signed · basis X/Z', tone: 'ink', ms: '23ms', qber: '1.9%', chsh: '2.77', code: '200 OK', event: 'Bell measurement signed', classifier: 'NOMINAL_SECURE', payload: '"Quantum telemetry active"' },
      { id: 'evt-3', time: timeStr(5), source: 'ARBITRATOR', text: 'Session nonce sealed and broadcast', tone: 'slate', ms: '11ms', qber: '1.1%', chsh: '2.80', code: '200 OK', event: 'EPR packet acceptance', classifier: 'NOMINAL_SECURE', payload: 'qds_nonce_v1.sig' },
      { id: 'evt-4', time: timeStr(8), source: 'BOB', text: 'Pauli frame aligned · 980 / 1024 kept', tone: 'blue', ms: '20ms', qber: '1.8%', chsh: '2.79', code: '200 OK', event: 'Pauli frame reconciliation', classifier: 'NOMINAL_SECURE', payload: '"Verified byte packet"' },
      { id: 'evt-5', time: timeStr(12), source: 'PRIVACY_AMP', text: 'Toeplitz hash distillation within confidence bounds', tone: 'good', ms: '14ms', qber: '1.9%', chsh: '2.78', code: '200 OK', event: 'Toeplitz hash distill', classifier: 'NOMINAL_SECURE', payload: 'distilled_key_0x8f' },
    ];

    this.threats = [
      { id: 'THR-104', severity: 'CRITICAL', origin: 'NODE-EVE', badge: 'QUARANTINED', type: 'Signature aborted (intercept-resend eavesdropping)', time: timeStr(60), baseline: '1.2%', current: '14.2%', detail: 'Intercept-resend disturbance triggered the Hoeffding cutoff and halted the signature stream.' },
      { id: 'THR-103', severity: 'CRITICAL', origin: 'EVE INTERCEPT', badge: '', type: 'Quantum channel intercept-resend', time: timeStr(180), baseline: '1.5%', current: '12.7%', detail: 'Unauthorized basis observation was inferred from the observed QBER uplift.' },
      { id: 'THR-102', severity: 'HIGH', origin: 'REPLAY-PROBE', badge: '', type: 'Stale nonce and payload replay', time: timeStr(360), baseline: '0.8%', current: '9.1%', detail: 'Replay candidate reappeared outside the permitted one-time-pad window.' },
      { id: 'THR-101', severity: 'HIGH', origin: 'FORGERY-SIM', badge: '', type: 'One-time pad signature forgery', time: timeStr(500), baseline: '1.0%', current: '8.4%', detail: 'Signature mismatch appeared after the classical correction frame closed.' },
    ];

    this.incidents = [
      { id: 'INC-9482-A', status: 'INVESTIGATING', assigned: 'A. Kovacs (L2)', impact: 'HIGH', title: 'Quantum correlation breach', detail: 'A QBER divergence on the authenticated channel is under active forensic review.', events: [[timeStr(30) + ' UTC', 'Threat detected', 'QBER moved above the nominal confidence envelope.'], [timeStr(25) + ' UTC', 'Threshold exceeded', 'Photon-pair records sealed after the Hoeffding confidence boundary was crossed.'], [timeStr(10) + ' UTC', 'Operator assignment', 'Incident assigned to the optical assurance queue.']], qber: '7.42%', chsh: '2.12' },
      { id: 'INC-9481-B', status: 'INVESTIGATING', assigned: 'M. Ito (L3)', impact: 'CRITICAL', title: 'Quantum channel intercept-resend', detail: '[CLASSIFIED: INTERCEPT_RESEND] Eavesdropper Eve intercepted and measured photons on the quantum channel, collapsing quantum superposition.', events: [[timeStr(120) + ' UTC', 'Threat detected', 'CRITICAL: Intercept-resend attack detected. QBER (14.2%) breached Hoeffding cutoff (5.5%). Bell correlation collapsed (S=1.76 < 2.00).'], [timeStr(110) + ' UTC', 'Threshold exceeded', 'QBER 14.20% breached security cutoff (5.0%). Non-locality collapsed (S=1.94).'], [timeStr(90) + ' UTC', 'Escalation', 'Channel held for signature acceptance review and L3 forensic handoff.']], qber: '14.20%', chsh: '1.76' },
      { id: 'INC-9479-X', status: 'RESOLVED', assigned: 'SYSTEM AUTO', impact: 'LOW', title: 'Channel lockout mitigation', detail: 'An automated channel lock was applied after repeated authentication failures on the secure transport boundary.', events: [[timeStr(600) + ' UTC', 'Threat detected', 'Anomaly detected in the authenticated command sequence from 192.168.1.55.'], [timeStr(590) + ' UTC', 'Threshold exceeded', 'Five failed authentication attempts occurred inside the ten-second observation window.'], [timeStr(580) + ' UTC', 'Auto-resolution', 'A temporary perimeter quarantine was applied and the node was removed from active routing.']], qber: '4.88%', chsh: '2.68' },
    ];

    this.sessions = [
      { id: 'QKD-ALICE-BOB-01', endpoint: 'QN-ALICE ↔ QN-BOB', doc: 'board-resolution.pdf', state: 'STABLE', status: 'Verified', rate: '245.8', duration: '04:12:33', trace: 'wave', tone: 'good', qber: '1.2%', chsh: '2.78', verdict: 'ACCEPT', time: timeStr(2) },
      { id: 'QKD-EVE-INTERCEPT', endpoint: 'QN-ALICE ↔ EVE-PROBE', doc: 'classified-defense.sig', state: 'DEGRADED', status: 'Quarantined', rate: '112.4', duration: '01:45:10', trace: 'rise', tone: 'copper', qber: '14.2%', chsh: '1.86', verdict: 'REJECT', time: timeStr(60) },
      { id: 'QKD-ARB-SAT-09', endpoint: 'ARB-CORE ↔ Sat-Relay-09', doc: 'release-manifest.json', state: 'STABLE', status: 'Verified', rate: '450.1', duration: '12:05:44', trace: 'step', tone: 'good', qber: '0.8%', chsh: '2.81', verdict: 'ACCEPT', time: timeStr(120) },
      { id: 'QKD-CHARLIE-04', endpoint: 'QN-BOB ↔ QN-CHARLIE', doc: 'firmware-checksum.txt', state: 'STABLE', status: 'Verified', rate: '193.7', duration: '00:54:12', trace: 'wave-low', tone: 'blue', qber: '2.1%', chsh: '2.68', verdict: 'ACCEPT', time: timeStr(300) },
    ];
  }

  // ── Polling & Backend Sync ──
  private async startBackendSync() {
    const sync = async () => {
      try {
        // Fetch live sessions from backend
        const sessRes = await fetch('/api/v1/sessions/').catch(() => null);
        if (sessRes && sessRes.ok) {
          const sessData = await sessRes.json();
          if (sessData?.sessions && Array.isArray(sessData.sessions) && sessData.sessions.length > 0) {
            sessData.sessions.forEach((s: any) => {
              const existingIdx = this.sessions.findIndex((x) => x.id === s.session_id);
              const sessionItem: SessionRecord = {
                id: s.session_id,
                endpoint: `Alice ↔ Bob (${s.session_id.slice(-6)})`,
                doc: s.doc_hash ? `doc-${s.doc_hash.slice(0, 8)}.sig` : 'quantum_payload.sig',
                state: s.threat_detected ? 'DEGRADED' : 'STABLE',
                status: s.threat_detected ? 'Quarantined' : 'Verified',
                rate: `${(s.num_pairs * 0.96).toFixed(0)} kbps`,
                duration: 'Live stream',
                trace: s.threat_detected ? 'rise' : 'wave',
                tone: s.threat_detected ? 'copper' : 'good',
                qber: s.qber ? `${(s.qber * 100).toFixed(1)}%` : '1.9%',
                chsh: s.chsh_score ? s.chsh_score.toFixed(2) : '2.78',
                verdict: s.threat_detected ? 'REJECT' : 'ACCEPT',
                time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
              };
              if (existingIdx >= 0) {
                this.sessions[existingIdx] = { ...this.sessions[existingIdx], ...sessionItem };
              } else {
                this.sessions.unshift(sessionItem);
              }
            });
          }
        }

        // Fetch live chat messages for ledger
        const chatRes = await fetch('/api/v1/chat/all-messages?requester=admin&limit=50').catch(() => null);
        if (chatRes && chatRes.ok) {
          const chatData = await chatRes.json();
          if (chatData?.messages && Array.isArray(chatData.messages)) {
            chatData.messages.slice(0, 15).forEach((msg: any) => {
              const isThreat = Boolean(msg.mitm_detected || msg.qber > 0.055 || msg.recipient === 'eve');
              const msgId = `chat-evt-${msg.id}`;
              if (!this.telemetryRows.some((r) => r.id === msgId)) {
                this.telemetryRows.unshift({
                  id: msgId,
                  time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString('en-GB', { hour12: false }) : new Date().toLocaleTimeString('en-GB', { hour12: false }),
                  source: (msg.sender || 'ALICE').toUpperCase(),
                  text: msg.file_name ? `Document: ${msg.file_name}` : (msg.text || 'Quantum message signed'),
                  tone: isThreat ? 'copper' : 'good',
                  ms: '18ms',
                  isThreat,
                  qber: msg.qber ? `${(msg.qber * 100).toFixed(1)}%` : isThreat ? '14.2%' : '1.9%',
                  chsh: msg.chsh_score ? Number(msg.chsh_score).toFixed(2) : isThreat ? '1.86' : '2.78',
                  code: isThreat ? '403 FORBIDDEN' : '200 OK',
                  payload: msg.text ? `"${msg.text.slice(0, 30)}"` : msg.file_name || 'qds_payload.sig',
                  classifier: isThreat ? 'INTERCEPT_RESEND' : 'NOMINAL_SECURE',
                  event: isThreat ? 'Interception alert / QBER breach' : 'Photon signature delivered',
                });
              }
            });
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
      this.saveState();
    };

    // Run initial sync and every 3 seconds
    sync();
    setInterval(sync, 3000);
  }

  // ── Public Accessors ──
  public getSnapshot() {
    return {
      threat: this.activeThreat || this.attackRunning,
      attackScenario: this.attackScenario,
      attackRunning: this.attackRunning,
      telemetryRows: this.telemetryRows,
      threats: this.threats,
      incidents: this.incidents,
      sessions: this.sessions,
      kpis: this.computeKPIs(),
    };
  }

  public computeKPIs() {
    const isThreat = this.activeThreat || this.attackRunning;
    const totalSessions = Math.max(this.sessions.length, 3);
    const verifiedCount = this.telemetryRows.filter((r) => !r.isThreat && r.code === '200 OK').length;
    const verifiedPct = this.telemetryRows.length > 0 ? ((verifiedCount / this.telemetryRows.length) * 100).toFixed(1) + '%' : isThreat ? '94.2%' : '99.9%';
    const latestQber = isThreat ? '14.2%' : this.telemetryRows[0]?.qber || '1.88%';
    const latestChsh = isThreat ? '1.86' : this.telemetryRows[0]?.chsh || '2.78';

    return {
      activeSessions: String(totalSessions),
      verifiedSignatures: verifiedPct,
      securityScore: isThreat ? 'Degraded' : 'Secure',
      totalPulses: `${(4.2 + (this.telemetryRows.length * 0.05)).toFixed(1)}e9`,
      qber: latestQber,
      chsh: latestChsh,
    };
  }

  // ── Real-time Triggers from Chat & Sandbox ──
  public recordChatMessage(msg: { sender: string; recipient: string; text?: string; file_name?: string; qber?: number; chsh_score?: number; mitm_detected?: boolean }) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
    const isThreat = Boolean(msg.mitm_detected || (msg.qber && msg.qber > 0.055) || msg.recipient === 'eve');

    const qberStr = msg.qber ? `${(msg.qber * 100).toFixed(1)}%` : isThreat ? '14.2%' : '1.9%';
    const chshStr = msg.chsh_score ? Number(msg.chsh_score).toFixed(2) : isThreat ? '1.86' : '2.78';

    const newRow: TelemetryRow = {
      id: `evt-chat-${Date.now()}`,
      time: timeStr,
      source: (msg.sender || 'ALICE').toUpperCase(),
      text: msg.file_name ? `Uploaded payload: ${msg.file_name}` : (msg.text ? `"${msg.text.slice(0, 45)}"` : 'Quantum message signed'),
      tone: isThreat ? 'copper' : 'good',
      ms: `${Math.floor(14 + Math.random() * 15)}ms`,
      isThreat,
      qber: qberStr,
      chsh: chshStr,
      code: isThreat ? '403 FORBIDDEN' : '200 OK',
      payload: msg.text ? `"${msg.text.slice(0, 30)}"` : msg.file_name || 'qds_payload.sig',
      classifier: isThreat ? 'INTERCEPT_RESEND' : 'NOMINAL_SECURE',
      event: isThreat ? 'Signature aborted / Intercept-resend eavesdropping' : 'Photon signature delivered',
    };

    this.telemetryRows.unshift(newRow);

    if (isThreat) {
      this.activeThreat = true;
      const thrId = `THR-${Math.floor(100 + Math.random() * 900)}`;
      this.threats.unshift({
        id: thrId,
        severity: 'CRITICAL',
        origin: `NODE-${(msg.sender || 'EVE').toUpperCase()}`,
        badge: 'INTERVENTION ACTIVE',
        type: 'Quantum chat channel intercept-resend attack',
        time: timeStr,
        baseline: '1.2%',
        current: qberStr,
        detail: `Eavesdropper intercepted quantum chat message to ${msg.recipient}. QBER crossed Hoeffding threshold.`,
      });

      const incId = `INC-${Math.floor(9000 + Math.random() * 999)}-C`;
      this.incidents.unshift({
        id: incId,
        status: 'INVESTIGATING',
        assigned: 'M. Ito (L3)',
        impact: 'CRITICAL',
        title: 'Quantum chat channel MitM disturbance',
        detail: `[CRITICAL ALERT] Active intercept on ${msg.sender} ↔ ${msg.recipient}. Superposition collapsed by adversary.`,
        events: [
          [`${timeStr} UTC`, 'Threat detected', `Intercept-resend attack in chat: QBER ${qberStr} > 5.5% cutoff.`],
          [`${timeStr} UTC`, 'Threshold exceeded', `Bell score collapsed to S=${chshStr}. Signature rejected.`],
        ],
        qber: qberStr,
        chsh: chshStr,
      });
    }

    this.saveState();
  }

  public setAttackScenario(scenarioTitle: string, isRunning: boolean) {
    this.attackScenario = scenarioTitle;
    this.attackRunning = isRunning;
    const isHarmful = scenarioTitle !== 'Clean signature';

    if (isRunning && isHarmful) {
      this.activeThreat = true;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
      const thrId = `THR-${Math.floor(100 + Math.random() * 900)}`;

      this.threats.unshift({
        id: thrId,
        severity: 'CRITICAL',
        origin: 'ATTACK SANDBOX',
        badge: 'ACTIVE HANDSHAKE',
        type: `Sandbox attack scenario: ${scenarioTitle}`,
        time: timeStr,
        baseline: '1.2%',
        current: scenarioTitle.includes('MitM') ? '14.2%' : scenarioTitle.includes('Forgery') ? '8.4%' : '9.1%',
        detail: `Active simulation of ${scenarioTitle} running in operator sandbox. Channel parameters perturbed.`,
      });

      this.telemetryRows.unshift({
        id: `evt-sandbox-${Date.now()}`,
        time: timeStr,
        source: 'ATTACK_SANDBOX',
        text: `Active probe execution: ${scenarioTitle}`,
        tone: 'copper',
        ms: '31ms',
        isThreat: true,
        qber: '14.2%',
        chsh: '1.86',
        code: '403 FORBIDDEN',
        payload: `[ATTACK_${scenarioTitle.toUpperCase().replace(/\s+/g, '_')}]`,
        classifier: 'INTERCEPT_RESEND',
        event: `Sandbox attack initiated: ${scenarioTitle}`,
      });
    } else if (!isRunning) {
      // Pause or stop
    }

    this.saveState();
  }

  public restoreNominal() {
    this.activeThreat = false;
    this.attackRunning = false;
    this.saveState();
  }

  public toggleThreat() {
    this.activeThreat = !this.activeThreat;
    this.saveState();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qds-soc-telemetry-changed'));
    }
  }
}

export const socTelemetry = new SOCTelemetryService();
