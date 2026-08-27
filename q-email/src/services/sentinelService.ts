import {
  QuantumSession,
  PipelineStep,
  QuantumNode,
  SecurityIncident,
  TelemetryLog,
  SystemPerformance,
  HistoricalPoint,
} from '../types/sentinel';
import {
  INITIAL_SESSIONS,
  DEFAULT_PIPELINE_STEPS,
  DEFAULT_NODES,
  DEFAULT_INCIDENTS,
  HISTORICAL_SERIES,
  DEFAULT_TELEMETRY_LOGS,
  DEFAULT_PERFORMANCE,
} from './sentinelData';
import { apiClient } from '../api/client';
export const formatISTTime = (date: Date = new Date(), withMs: boolean = true): string => {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
  if (!withMs) return parts;
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${parts}.${ms}`;
};

export const formatISTDateTime = (date: Date = new Date()): string => {
  const d = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
  const t = formatISTTime(date, true);
  return `${d} ${t}`;
};

class SentinelService {
  private sessions: QuantumSession[] = [...INITIAL_SESSIONS];
  private pipelineSteps: PipelineStep[] = [...DEFAULT_PIPELINE_STEPS];
  private nodes: QuantumNode[] = [...DEFAULT_NODES];
  private incidents: SecurityIncident[] = [...DEFAULT_INCIDENTS];
  private historical: HistoricalPoint[] = [...HISTORICAL_SERIES];
  private telemetry: TelemetryLog[] = [...DEFAULT_TELEMETRY_LOGS];
  private performance: SystemPerformance = { ...DEFAULT_PERFORMANCE };
  private activeSessionId: string = INITIAL_SESSIONS[0].session_id;

  private streamListeners: Array<(items: any[]) => void> = [];
  private broadcastChannel: BroadcastChannel | null = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('qds_quantum_telemetry') : null;

  constructor() {
    this.syncWithBackend().catch(() => {});
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_TELEMETRY_ITEM') {
          const item = event.data.payload;
          this.liveStream = [item, ...this.liveStream.filter(i => i.id !== item.id).slice(0, 9)];
          this.notifyStreamListeners();
        }
      };
    }
  }

  public async syncWithBackend(): Promise<void> {
    try {
      const health = await apiClient.getHealth();
      if (health && health.status === 'healthy') {
        // 1. Fetch live sessions from Arbitrator
        const sessRes = await apiClient.getSessions().catch(() => null);
        if (sessRes && sessRes.sessions && sessRes.sessions.length > 0) {
          const liveSessions: QuantumSession[] = sessRes.sessions.map((s: any) => {
            const hasAttacks = s.attacks && s.attacks.length > 0;
            const primaryAttack = hasAttacks ? s.attacks[0] : null;
            const sec = s.security || {};
            const qber = sec.qber !== undefined && sec.qber !== null ? sec.qber : 0.02;
            const threshold = sec.threshold !== undefined && sec.threshold !== null ? sec.threshold : 0.055;
            const chsh = sec.chsh !== undefined && sec.chsh !== null ? sec.chsh : 2.78;
            const isAccept = sec.decision === 'ACCEPT';
            const isReject = sec.decision === 'REJECT';

            let status: any = s.status;
            if (s.status === 'AUDITED') {
              status = isAccept ? 'VERIFIED' : 'REJECTED';
            }

            return {
              session_id: s.session_id,
              document_name: s.alice?.document_hash
                ? `quantum_doc_${s.alice.document_hash.slice(0, 8)}.sig`
                : `defense_telemetry_${s.session_id.slice(-4)}.sig`,
              document_hash: s.alice?.document_hash || s.nonce || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              file_size_kb: 64.0,
              status: status,
              created_at: s.created_at || new Date().toISOString(),
              updated_at: s.updated_at || new Date().toISOString(),
              sender: 'Alice (ALC-01 · Node Alpha)',
              receiver: 'Bob (BOB-01 · Node Beta)',
              arbitrator: 'Arbitrator (ARB-01 · Core Cluster)',
              metrics: {
                qber: qber,
                baseline_qber: s.parameters?.baseline_noise || 0.02,
                hoeffding_threshold: threshold,
                chsh_score: chsh,
                classical_limit: 2.0,
                tsirelson_bound: 2.828,
                confidence_level: 0.999,
                alpha: s.parameters?.alpha || 0.001,
                sifted_bits: sec.sifted_bits || s.sifting?.sifted_length || 50,
                error_bits: sec.error_count || (hasAttacks ? 8 : 1),
                total_pulses: s.parameters?.num_pairs || 100,
              },
              verdict: {
                verdict: sec.decision || (hasAttacks ? 'REJECT' : s.status === 'AUDITED' ? 'ACCEPT' : 'PENDING'),
                threat_detected: hasAttacks || sec.threat_detected || isReject,
                threat_type: sec.threat_type || (primaryAttack ? primaryAttack.attack_type : null),
                reason: hasAttacks
                  ? `Active Red Team intrusion detected: ${primaryAttack?.attack_type || 'Attack'}. QBER=${(qber * 100).toFixed(1)}% exceeded Hoeffding limit.`
                  : isReject
                  ? `Security threshold exceeded: QBER (${(qber * 100).toFixed(1)}%) > Limit (${(threshold * 100).toFixed(1)}%).`
                  : 'Quantum Bell state signature verified. Entanglement present, QBER within bounds.',
                evaluated_at: s.updated_at || s.created_at,
                hoeffding_pass: sec.qber_pass !== undefined ? sec.qber_pass : !hasAttacks,
                chsh_pass: sec.chsh_pass !== undefined ? sec.chsh_pass : (chsh >= 2.0),
                signature_pass: isAccept,
                security_score: isAccept ? 98 : hasAttacks ? 15 : 45,
              },
            };
          });

          this.sessions = liveSessions;
          if (!this.sessions.some(s => s.session_id === this.activeSessionId)) {
            this.activeSessionId = this.sessions[0].session_id;
          }

          // Build dynamic security incidents from detected attacks
          const liveIncidents: SecurityIncident[] = [];
          sessRes.sessions.forEach((s: any) => {
            if (s.attacks && s.attacks.length > 0) {
              s.attacks.forEach((att: any, attIdx: number) => {
                const sec = s.security || {};
                const qberObs = sec.qber ?? 0.089;
                const chshObs = sec.chsh ?? 1.91;
                liveIncidents.push({
                  id: att.attack_id || `INC-${s.session_id}-${attIdx}`,
                  session_id: s.session_id,
                  event: `Quantum Channel Intrusion: ${att.attack_type}`,
                  severity: att.attack_fraction > 0.2 ? 'CRITICAL' : 'HIGH',
                  qber: qberObs,
                  chsh: chshObs,
                  timestamp: att.timestamp ? att.timestamp.substring(11, 19) : new Date().toLocaleTimeString(),
                  threat_category: att.attack_type === 'INTERCEPT_RESEND' ? 'Intercept-Resend Eavesdropping'
                    : att.attack_type === 'SIGNATURE_FORGERY' ? 'Classical Signature Forgery'
                    : att.attack_type === 'REPLAY' ? 'Quantum Replay Attack'
                    : 'Channel Noise Injection',
                  summary: `Red Team injected ${att.attack_type} (${Math.round((att.attack_fraction || 0.25) * 100)}% qubits) on session ${s.session_id}`,
                  evidence: {
                    qber_observed: qberObs,
                    hoeffding_threshold: sec.threshold ?? 0.055,
                    chsh_score: chshObs,
                    classical_limit: 2.0,
                    statistical_p_value: 0.000001,
                    affected_qubits: att.affected_count || 25,
                  },
                  detection_timeline: [
                    { step: 'EPR Distribution', time: '00:01', state: 'PASS', detail: 'Entangled pairs distributed.' },
                    { step: 'Attack Injection', time: '00:02', state: 'FAIL', detail: `${att.attack_type} active on quantum channel.` },
                    { step: 'Threat Audit', time: '00:03', state: 'FAIL', detail: `QBER ${(qberObs*100).toFixed(1)}% exceeded Hoeffding limit.` },
                  ],
                  final_assessment: 'Signature rejected by Threat Engine. Bell inequality non-locality violation collapsed.',
                });
              });
            }
          });
          if (liveIncidents.length > 0) {
            this.incidents = [...liveIncidents, ...DEFAULT_INCIDENTS.filter(di => !liveIncidents.some(li => li.id === di.id))];
          }


          // Update performance metrics
          this.performance.active_sessions_count = this.sessions.length;
          this.performance.threats_detected_count = this.sessions.filter(s => s.verdict.threat_detected).length;
          this.performance.verified_signatures_count = this.sessions.filter(s => s.verdict.verdict === 'ACCEPT').length;
        }

        // 2. Fetch nodes
        const remoteNodes = await apiClient.getNodes().catch(() => []);
        if (remoteNodes && remoteNodes.length > 0) {
          this.nodes = remoteNodes.map(rn => ({
            id: rn.id || 'NODE-01',
            name: rn.name || 'Quantum Node',
            role: rn.role || 'SENDER',
            status: rn.status || 'ONLINE',
            endpoint: rn.endpoint || '/api/v1',
            latency_ms: rn.latency_ms || 2.0,
            requests_count: rn.requests_count || 50,
            last_activity: rn.last_activity || 'Active',
            qubit_fidelity: rn.qubit_fidelity || 0.995,
            memory_buffer_mb: rn.memory_buffer_mb || 256.0,
          }));
        }

        // 3. Fetch telemetry
        const telData = await apiClient.getTelemetryLog().catch(() => ({ entries: [] }));
        if (telData && telData.entries && telData.entries.length > 0) {
          const liveLogs: TelemetryLog[] = telData.entries.map((e: any, idx: number) => ({
            id: e.request_id || `TEL-${idx}`,
            timestamp: e.timestamp ? e.timestamp.substring(11, 19) : new Date().toLocaleTimeString(),
            subsystem: e.endpoint?.includes('alice') ? 'ALICE_NODE'
              : e.endpoint?.includes('bob') ? 'BOB_NODE'
              : e.endpoint?.includes('security') ? 'THREAT_ENGINE'
              : e.endpoint?.includes('arbitrator') ? 'ARBITRATOR'
              : 'QUANTUM_CORE',
            event_type: `${e.method} ${e.endpoint}`,
            latency_ms: Number(e.execution_time_ms || 1.5).toFixed(1) as any,
            status_code: e.status_code || 200,
            message: `Executed ${e.method} ${e.endpoint} in ${e.execution_time_ms}ms`,
          }));
          this.telemetry = [...liveLogs, ...this.telemetry.slice(liveLogs.length)];
        }
      }
    } catch (err) {
      console.warn('[Sentinel] syncWithBackend error:', err);
    }
  }


  // ─── Sessions ───────────────────────────────────────────────────────────────
  public getSessions(): QuantumSession[] {
    return [...this.sessions];
  }

  public getSessionById(id: string): QuantumSession | undefined {
    return this.sessions.find(s => s.session_id === id);
  }

  public getActiveSession(): QuantumSession {
    const found = this.sessions.find(s => s.session_id === this.activeSessionId);
    return found || this.sessions[0];
  }

  public setActiveSession(id: string): void {
    if (this.sessions.some(s => s.session_id === id)) {
      this.activeSessionId = id;
    }
  }

  public async createSessionAsync(documentName: string, sizeKb: number, isEveActive: boolean = false, attackType?: string): Promise<QuantumSession> {
    try {
      // 1. Execute live quantum simulation workflow via FastAPI Module 3
      const workflowResult = await apiClient.runWorkflow({
        document_name: documentName || 'defense_telemetry_dispatch_manifest_09.sig',
        file_size_kb: sizeKb || 64.2,
        num_pairs: 50,
        baseline_noise: 0.02,
        alpha: 0.001,
        is_eve_active: isEveActive,
        attack_type: attackType,
      });

      if (workflowResult && workflowResult.session_id) {
        const isBreach = isEveActive || Boolean(attackType) || workflowResult.verdict?.threat_detected || workflowResult.verdict?.verdict === 'REJECT';
        const newSession: QuantumSession = {
          session_id: workflowResult.session_id,
          document_name: workflowResult.document_name,
          document_hash: workflowResult.document_hash,
          file_size_kb: workflowResult.file_size_kb,
          status: isBreach ? 'REJECTED' : 'VERIFIED',
          created_at: workflowResult.created_at,
          updated_at: workflowResult.updated_at,
          sender: workflowResult.sender,
          receiver: workflowResult.receiver,
          arbitrator: workflowResult.arbitrator,
          metrics: {
            qber: workflowResult.metrics.qber,
            baseline_qber: workflowResult.metrics.baseline_qber,
            hoeffding_threshold: workflowResult.metrics.hoeffding_threshold,
            chsh_score: workflowResult.metrics.chsh_score,
            classical_limit: workflowResult.metrics.classical_limit,
            tsirelson_bound: workflowResult.metrics.tsirelson_bound,
            confidence_level: workflowResult.metrics.confidence_level,
            alpha: workflowResult.metrics.alpha,
            sifted_bits: workflowResult.metrics.sifted_bits,
            error_bits: workflowResult.metrics.error_bits,
            total_pulses: workflowResult.metrics.total_pulses,
          },
          verdict: {
            verdict: isBreach ? 'REJECT' : (workflowResult.verdict.verdict as any),
            threat_detected: isBreach,
            threat_type: isBreach ? (attackType || workflowResult.verdict.threat_type || 'MAN_IN_THE_MIDDLE_EAVESDROPPING') : null,
            reason: workflowResult.verdict.reason,
            evaluated_at: workflowResult.verdict.evaluated_at,
            hoeffding_pass: !isBreach && workflowResult.verdict.hoeffding_pass,
            chsh_pass: !isBreach && workflowResult.verdict.chsh_pass,
            signature_pass: !isBreach && workflowResult.verdict.signature_pass,
            security_score: isBreach ? 15 : workflowResult.verdict.security_score,
          },
        };

        // Update pipeline steps with real latency
        if (workflowResult.pipeline_steps && workflowResult.pipeline_steps.length > 0) {
          this.pipelineSteps = workflowResult.pipeline_steps.map((ps: any) => ({
            id: ps.id,
            name: ps.name,
            short_code: ps.short_code,
            description: ps.description,
            node: ps.node,
            status: ps.status,
            latency_ms: ps.latency_ms,
          }));
        }

        // Add to historical trend series
        const timeLabel = new Date().toLocaleTimeString('en-US', { hour12: false });
        this.historical.push({
          time: timeLabel,
          qber: workflowResult.metrics.qber,
          baseline: workflowResult.metrics.baseline_qber,
          hoeffding: workflowResult.metrics.hoeffding_threshold,
          chsh: workflowResult.metrics.chsh_score,
          classical_limit: 2.0,
          session_id: workflowResult.session_id,
        });
        if (this.historical.length > 15) {
          this.historical.shift();
        }

        // Add telemetry log
        this.telemetry.unshift({
          id: `LOG-${Date.now().toString().slice(-5)}`,
          timestamp: timeLabel,
          subsystem: 'QUANTUM_CORE',
          event_type: isBreach ? 'SIGNATURE_REJECTED' : 'SIGNATURE_CREATED',
          latency_ms: 16.4,
          status_code: isBreach ? 500 : 200,
          message: `Quantum signature session ${newSession.session_id} ${isBreach ? 'rejected' : 'verified'} for ${newSession.document_name}`,
        });

        this.sessions.unshift(newSession);
        this.activeSessionId = newSession.session_id;
        if (!isBreach) {
          this.performance.verified_signatures_count += 1;
        } else {
          this.performance.threats_detected_count += 1;
        }
        this.performance.requests_total += 8;
        this.notifyStreamListeners();

        return newSession;
      }
    } catch (e) {
      console.warn('[Sentinel] Live backend call failed or offline, falling back to local computation:', e);
    }

    // Fallback simulation
    return this.createSession(documentName, sizeKb, isEveActive, attackType);
  }

  public createSession(documentName: string, sizeKb: number, isEveActive: boolean = false, attackType?: string): QuantumSession {
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newId = `QDS-2026-SES-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const isBreach = isEveActive || Boolean(attackType);

    const newSession: QuantumSession = {
      session_id: newId,
      document_name: documentName || 'financial_transaction_record.xml',
      document_hash: randomHex,
      file_size_kb: sizeKb || 64.2,
      status: isBreach ? 'REJECTED' : 'VERIFIED',
      created_at: now,
      updated_at: now,
      sender: 'Alice (ALC-01 · Node Alpha)',
      receiver: 'Bob (BOB-01 · Node Beta)',
      arbitrator: 'Arbitrator (ARB-01 · Core Cluster)',
      metrics: {
        qber: isBreach ? 0.089 : 0.021,
        baseline_qber: 0.020,
        hoeffding_threshold: 0.055,
        chsh_score: isBreach ? 1.75 : 2.76,
        classical_limit: 2.00,
        tsirelson_bound: 2.828,
        confidence_level: 0.999,
        alpha: 0.001,
        sifted_bits: 3840,
        error_bits: isBreach ? 342 : 80,
        total_pulses: 8192,
      },
      verdict: {
        verdict: isBreach ? 'REJECT' : 'ACCEPT',
        threat_detected: isBreach,
        threat_type: isBreach ? (attackType || 'MAN_IN_THE_MIDDLE_EAVESDROPPING') : null,
        reason: isBreach
          ? 'CRITICAL: Eavesdropper detected. Observed QBER (8.9%) breached Hoeffding cutoff (5.5%). Bell non-locality collapsed.'
          : 'All quantum security tests verified. Non-locality passed (S=2.76 > 2.00), QBER nominal (2.1%).',
        evaluated_at: now,
        hoeffding_pass: !isBreach,
        chsh_pass: !isBreach,
        signature_pass: !isBreach,
        security_score: isBreach ? 15 : 98,
      },
    };

    this.sessions.unshift(newSession);
    this.activeSessionId = newId;
    this.notifyStreamListeners();
    return newSession;
  }

  // ─── Pipeline ───────────────────────────────────────────────────────────────
  public getPipelineSteps(): PipelineStep[] {
    return [...this.pipelineSteps];
  }

  // ─── Nodes ──────────────────────────────────────────────────────────────────
  public getNodes(): QuantumNode[] {
    return [...this.nodes];
  }

  // ─── Incidents ──────────────────────────────────────────────────────────────
  public getIncidents(): SecurityIncident[] {
    return [...this.incidents];
  }

  // ─── Live Telemetry Stream for Monitoring (Driven exclusively by Demonstration & Attacks) ───
  private liveStream: any[] = (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('qds_latest_stream');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    const baseNow = Date.now();
    return [
      { id: '1', timestamp: formatISTTime(new Date(baseNow - 100), true), subsystem: 'KEY EXCH MN', event_type: 'Photon Pulse Tx', latency_ms: 1024, status_code: 200, message: 'SPDC photon pair routed to Alice & Bob via Dark Fiber Link 1 & 2.', qber: 2.10, chsh_score: 2.76, security_score: 'Secure', is_error: false },
      { id: '2', timestamp: formatISTTime(new Date(baseNow - 250), true), subsystem: 'ERR DETECT',  event_type: 'Basis Audit Pass', latency_ms: 256,  status_code: 200, message: 'Sifting parity confirmed nominal within Hoeffding statistical limit.', qber: 1.95, chsh_score: 2.77, security_score: 'Secure', is_error: false },
      { id: '3', timestamp: formatISTTime(new Date(baseNow - 400), true), subsystem: 'BASIS RECON', event_type: 'Alice Bob Sync',    latency_ms: 512,  status_code: 200, message: 'Public basis exchange completed over TLS 1.3 channel.', qber: 1.85, chsh_score: 2.78, security_score: 'Secure', is_error: false },
      { id: '4', timestamp: formatISTTime(new Date(baseNow - 600), true), subsystem: 'NET ROUTER',  event_type: 'Route Update Ack',  latency_ms: 64,   status_code: 200, message: 'SDN topology update confirmed nominal optical attenuation.', qber: 2.05, chsh_score: 2.74, security_score: 'Secure', is_error: false },
      { id: '5', timestamp: formatISTTime(new Date(baseNow - 800), true), subsystem: 'HOEFFDING CHK', event_type: 'Statistical Bound Audit', latency_ms: 128, status_code: 200, message: 'Hoeffding confidence bound verified: α=0.001 threshold nominal.', qber: 2.12, chsh_score: 2.75, security_score: 'Secure', is_error: false },
      { id: '6', timestamp: formatISTTime(new Date(baseNow - 1000), true), subsystem: 'CHSH EVAL',   event_type: 'Bell State S=2.76',  latency_ms: 512, status_code: 200, message: 'Quantum non-locality test confirmed: S > 2.000 classical limit.', qber: 1.95, chsh_score: 2.76, security_score: 'Secure', is_error: false },
      { id: '7', timestamp: formatISTTime(new Date(baseNow - 1200), true), subsystem: 'SNSPD DETECT', event_type: 'Photon Coincidence', latency_ms: 1024, status_code: 200, message: 'Nanowire detector registered symmetric 1550nm photon arrival.', qber: 2.00, chsh_score: 2.77, security_score: 'Secure', is_error: false },
      { id: '8', timestamp: formatISTTime(new Date(baseNow - 1400), true), subsystem: 'ALICE BSM',   event_type: 'Joint Bell Measurement', latency_ms: 256, status_code: 200, message: 'Alice performed joint Bell State Measurement on |ψ_doc⟩ + EPR half.', qber: 1.88, chsh_score: 2.79, security_score: 'Secure', is_error: false },
      { id: '9', timestamp: formatISTTime(new Date(baseNow - 1600), true), subsystem: 'TLS FEEDFWD', event_type: 'Classical Bits (b1,b2)', latency_ms: 64, status_code: 200, message: 'Classical feed-forward broadcasted to Bob for Pauli frame correction.', qber: 2.02, chsh_score: 2.75, security_score: 'Secure', is_error: false },
      { id: '10', timestamp: formatISTTime(new Date(baseNow - 1800), true), subsystem: 'PRIVACY AMP', event_type: 'Toeplitz Hash Distill', latency_ms: 512, status_code: 200, message: 'Privacy amplification distilled unforgeable quantum signature token.', qber: 1.90, chsh_score: 2.78, security_score: 'Secure', is_error: false },
    ];
  })();

  public getLiveStream(): any[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('qds_latest_stream');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.liveStream = parsed;
          }
        }
      }
    } catch {}
    return [...this.liveStream];
  }

  public subscribeLiveStream(callback: (items: any[]) => void): () => void {
    this.streamListeners.push(callback);
    callback(this.getLiveStream());
    return () => {
      this.streamListeners = this.streamListeners.filter(l => l !== callback);
    };
  }

  private notifyStreamListeners(): void {
    const copy = [...this.liveStream];
    this.streamListeners.forEach(fn => {
      try { fn(copy); } catch {}
    });
  }

  private lastPushedStepTime: number = 0;
  private lastPushedStep: number = -1;

  public resolveAttackMetadata(attackType?: string, isEveActive?: boolean): {
    category: string;
    subsystem: string;
    eventType: string;
    defaultQber: number;
    defaultChsh: number;
    severity: 'CRITICAL' | 'HIGH';
    summary: string;
    reason: string;
    threatTitle: string;
    affectedQubits: number;
    timeline: Array<{ step: string; time: string; state: 'PASS' | 'FAIL' | 'WARN'; detail: string }>;
  } {
    const norm = (attackType || '').toLowerCase();
    
    if (norm.includes('forger') || norm.includes('signature forgery') || norm.includes('signature_forgery')) {
      return {
        category: 'Classical Signature Forgery',
        subsystem: 'ARBITRATOR MAC',
        eventType: 'One-Time Pad Signature Forgery',
        defaultQber: 18.5,
        defaultChsh: 1.82,
        severity: 'CRITICAL',
        summary: 'Adversary injected forged signature tag. Pre-image hash collision mismatch and 18.5% bit-flip delta detected during verification.',
        reason: 'CRITICAL: Signature forgery detected. Ephemeral signature tag failed arbitrator one-time-pad integrity test.',
        threatTitle: 'CLASSICAL SIGNATURE FORGERY',
        affectedQubits: 45,
        timeline: [
          { step: 'Signature Tag Ingestion', time: '00:01', state: 'PASS', detail: 'Received 256-bit tag from candidate stream.' },
          { step: 'One-Time Pad Verification', time: '00:02', state: 'FAIL', detail: 'Pre-image hash mismatch on tag bits.' },
          { step: 'Hoeffding Audit', time: '00:03', state: 'FAIL', detail: 'QBER 18.5% breached threshold.' },
          { step: 'Arbitrator Verdict', time: '00:04', state: 'FAIL', detail: 'Signature quarantined: FORGERY DETECTED.' },
        ]
      };
    }

    if (norm.includes('replay')) {
      return {
        category: 'Quantum Replay Attack',
        subsystem: 'NONCE AUDIT',
        eventType: 'Stale Nonce & Payload Replay',
        defaultQber: 8.4,
        defaultChsh: 1.98,
        severity: 'CRITICAL',
        summary: 'Adversary retransmitted previously recorded quantum key exchange payload. Stale nonce and +4.82s timestamp skew flagged.',
        reason: 'CRITICAL: Replay attack detected. Nonce consumed in prior session. Key buffer discarded.',
        threatTitle: 'QUANTUM REPLAY INTRUSION',
        affectedQubits: 28,
        timeline: [
          { step: 'Session Handshake', time: '00:01', state: 'PASS', detail: 'Handshake frame received from wire.' },
          { step: 'Nonce Cache Check', time: '00:02', state: 'FAIL', detail: 'Nonce previously consumed in Session QDS-8812.' },
          { step: 'Timestamp Window Check', time: '00:03', state: 'FAIL', detail: 'Timestamp skew +4.82s exceeds 0.10s window.' },
          { step: 'Arbitrator Verdict', time: '00:04', state: 'FAIL', detail: 'Replay rejected by arbitrator.' },
        ]
      };
    }

    if (norm.includes('pns') || norm.includes('photon number') || norm.includes('split')) {
      return {
        category: 'Photon Number Splitting (PNS)',
        subsystem: 'DECOY ANALYSIS',
        eventType: 'Decoy State Yield Anomaly (PNS)',
        defaultQber: 6.2,
        defaultChsh: 2.05,
        severity: 'CRITICAL',
        summary: 'Adversary beam splitter filtered multi-photon pulses into quantum memory. Decoy state yield Y decoy dropped below expected bound.',
        reason: 'CRITICAL: Photon Number Splitting (PNS) attack detected via decoy state yield divergence.',
        threatTitle: 'PHOTON NUMBER SPLITTING (PNS)',
        affectedQubits: 52,
        timeline: [
          { step: 'Decoy State Emission', time: '00:01', state: 'PASS', detail: 'Interleaved signal (μ=0.5) and decoy (ν=0.1) pulses.' },
          { step: 'Multi-Photon Tap Audit', time: '00:02', state: 'FAIL', detail: 'Selective multi-photon pulse routing observed.' },
          { step: 'Yield Ratio Estimation', time: '00:03', state: 'FAIL', detail: 'Decoy yield Y decoy=0.18 dropped below bound.' },
          { step: 'Protocol Abort', time: '00:04', state: 'FAIL', detail: 'Key exchange aborted to prevent PNS eavesdropping.' },
        ]
      };
    }

    if (norm.includes('noise') || norm.includes('thermal') || norm.includes('attenuation')) {
      return {
        category: 'Optical Thermal Drift',
        subsystem: 'FIBER TELEMETRY',
        eventType: 'Fiber Attenuation & Dark Count Drift',
        defaultQber: 9.8,
        defaultChsh: 2.12,
        severity: 'HIGH',
        summary: 'Elevated dark fiber attenuation (0.48 dB/km) and detector thermal dark counts (18 cps). Quantum state preserved.',
        reason: 'WARNING: Channel degraded by optical thermal noise. Cascade error correction active.',
        threatTitle: 'OPTICAL THERMAL DRIFT',
        affectedQubits: 14,
        timeline: [
          { step: 'Optical Loss Measurement', time: '00:01', state: 'WARN', detail: 'Fiber loss 0.48 dB/km (Elevated).' },
          { step: 'Detector Dark Counts', time: '00:02', state: 'WARN', detail: 'Detector dark count rate 18 cps.' },
          { step: 'Cascade Error Correction', time: '00:03', state: 'PASS', detail: 'Bit-flips reconciled via parity cascade.' },
          { step: 'Channel Status', time: '00:04', state: 'PASS', detail: 'Classified DEGRADED OPERATIONAL (S=2.12).' },
        ]
      };
    }

    if (norm.includes('dos') || norm.includes('denial')) {
      return {
        category: 'Quantum Denial of Service',
        subsystem: 'OPTICAL JAMMER',
        eventType: 'Broadband Laser Jamming',
        defaultQber: 42.0,
        defaultChsh: 1.20,
        severity: 'CRITICAL',
        summary: 'Continuous-wave high-intensity laser jamming saturated optical dark fiber, causing complete channel denial.',
        reason: 'CRITICAL: Quantum Denial of Service (DoS) attack. QBER spiked to 42.0%, blocking key generation.',
        threatTitle: 'QUANTUM DENIAL OF SERVICE',
        affectedQubits: 256,
        timeline: [
          { step: 'Photon Pulse Rx', time: '00:01', state: 'FAIL', detail: 'Optical power saturation on SNSPD detectors.' },
          { step: 'QBER Spike Audit', time: '00:02', state: 'FAIL', detail: 'QBER spiked to 42.0% (Jamming noise).' },
          { step: 'Bell Test Collapse', time: '00:03', state: 'FAIL', detail: 'S-score collapsed to 1.20.' },
          { step: 'Link Quarantine', time: '00:04', state: 'FAIL', detail: 'Dark fiber link isolated by SDN controller.' },
        ]
      };
    }

    // Default: Intercept-Resend Eavesdropping (MitM)
    return {
      category: 'Intercept-Resend Eavesdropping',
      subsystem: 'EVE PROBE',
      eventType: 'Quantum Channel Intercept-Resend',
      defaultQber: 14.2,
      defaultChsh: 1.76,
      severity: 'CRITICAL',
      summary: 'Eavesdropper Eve intercepted and measured photon states on the quantum channel, collapsing quantum superposition.',
      reason: 'CRITICAL: Intercept-Resend attack detected. QBER (14.2%) breached Hoeffding cutoff (5.5%). Bell correlation collapsed (S=1.76 < 2.00).',
      threatTitle: 'INTERCEPT-RESEND EAVESDROPPING',
      affectedQubits: 35,
      timeline: [
        { step: 'EPR Distribution', time: '00:01', state: 'PASS', detail: 'Entangled pairs distributed over dark fiber.' },
        { step: 'State Interception', time: '00:02', state: 'FAIL', detail: 'Eve intercepted photon stream on quantum channel.' },
        { step: 'Hoeffding Audit', time: '00:03', state: 'FAIL', detail: 'QBER 14.2% breached statistical bound (5.5%).' },
        { step: 'Bell Inequality Test', time: '00:04', state: 'FAIL', detail: 'CHSH S=1.76 < 2.00 (Classical limit collapsed).' },
      ]
    };
  }

  public pushAttackIncident(
    scenarioKey: string,
    scenarioName: string,
    qberFraction: number,
    chshScore: number,
    securityStatus: 'SECURE' | 'COMPROMISED' | 'DEGRADED',
    logs?: string[]
  ): void {
    const isBreach = securityStatus !== 'SECURE';
    const meta = this.resolveAttackMetadata(scenarioName || scenarioKey, isBreach);
    const qberPercent = Number((qberFraction * 100).toFixed(2));
    const timeStr24 = new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(100 + Math.random() * 900);

    const newItem = {
      id: Date.now().toString(),
      timestamp: timeStr24,
      subsystem: isBreach ? meta.subsystem : 'ARBITRATOR',
      event_type: isBreach ? meta.eventType : 'Quantum Handshake Verified',
      latency_ms: isBreach ? 512 : 128,
      status_code: isBreach ? 500 : 200,
      message: isBreach 
        ? `[${meta.category}] ${meta.summary}`
        : `Quantum signature handshake verified nominal. QBER ${qberPercent}%, S=${chshScore.toFixed(2)}.`,
      qber: qberPercent,
      chsh_score: chshScore,
      security_score: isBreach ? (securityStatus === 'DEGRADED' ? 'Degraded' : 'Degraded') : 'Secure',
      is_error: isBreach,
      reason: isBreach ? meta.reason : undefined,
    };

    // Prepend new attack item to front of live stream array (NO SORTING BUG DISCARDING NEW ITEMS)
    this.liveStream = [newItem, ...this.liveStream.filter(i => i.id !== newItem.id)].slice(0, 15);

    this.telemetry.unshift({
      id: newItem.id,
      timestamp: newItem.timestamp,
      subsystem: newItem.subsystem as any,
      event_type: newItem.event_type,
      latency_ms: newItem.latency_ms,
      status_code: newItem.status_code,
      message: newItem.message,
    });
    if (this.telemetry.length > 50) this.telemetry.pop();

    const nowIso = new Date().toISOString();
    const sessId = `QDS-${new Date().getFullYear()}-${isBreach ? scenarioKey.toUpperCase() : 'CLEAN'}-${Date.now().toString().slice(-4)}`;
    const newSession: QuantumSession = {
      session_id: sessId,
      document_name: isBreach ? `${scenarioKey}_attack_flagged.sig` : 'quantum_dispatch_verified.sig',
      document_hash: isBreach ? '8f92a1bc40e7d294b105f838e7902ba4' : 'e3b0c44298fc1c149afbf4c8996fb924',
      file_size_kb: 128.0,
      status: isBreach ? 'REJECTED' : 'VERIFIED',
      created_at: nowIso,
      updated_at: nowIso,
      sender: 'Alice (ALC-01 · Node Alpha)',
      receiver: 'Bob (BOB-01 · Node Beta)',
      arbitrator: 'Arbitrator (ARB-01 · Core Cluster)',
      metrics: {
        qber: qberFraction,
        baseline_qber: 0.020,
        hoeffding_threshold: 0.055,
        chsh_score: chshScore,
        classical_limit: 2.00,
        tsirelson_bound: 2.828,
        confidence_level: 0.999,
        alpha: 0.001,
        sifted_bits: 3840,
        error_bits: Math.round(3840 * qberFraction),
        total_pulses: 8192,
      },
      verdict: {
        verdict: isBreach ? 'REJECT' : 'ACCEPT',
        threat_detected: isBreach,
        threat_type: isBreach ? meta.category : null,
        reason: isBreach ? meta.reason : 'All quantum security tests verified. Non-locality passed, QBER nominal.',
        evaluated_at: nowIso,
        hoeffding_pass: !isBreach,
        chsh_pass: chshScore >= 2.0,
        signature_pass: !isBreach,
        security_score: isBreach ? 15 : 98,
      }
    };

    this.sessions = [newSession, ...this.sessions.filter(s => s.session_id !== sessId)];

    let newIncident: SecurityIncident | null = null;
    if (isBreach) {
      const incidentId = `INC-${Date.now().toString().slice(-4)}`;
      newIncident = {
        id: incidentId,
        session_id: sessId,
        event: `Quantum Channel Intrusion: ${meta.category}`,
        severity: meta.severity,
        qber: qberFraction,
        chsh: chshScore,
        timestamp: formatISTTime(new Date(), false),
        threat_category: meta.category,
        summary: meta.summary,
        evidence: {
          qber_observed: qberFraction,
          hoeffding_threshold: 0.055,
          chsh_score: chshScore,
          classical_limit: 2.00,
          statistical_p_value: 0.000001,
          affected_qubits: meta.affectedQubits,
        },
        detection_timeline: meta.timeline,
        final_assessment: `Signature rejected by Threat Engine. Flagged under ${meta.category}.`,
      };
      this.incidents = [newIncident, ...this.incidents.filter(i => i.id !== incidentId)];
    }

    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'NEW_TELEMETRY_ITEM', payload: newItem });
      }
    } catch {}

    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qds:telemetry-update', { detail: newItem }));
        window.dispatchEvent(new CustomEvent('qds_attack_launched', { 
          detail: { 
            newSession, 
            newItem, 
            newIncident: isBreach ? newIncident : null,
            qberPercent,
            chshScore,
            scenarioKey
          } 
        }));

        if (isBreach) {
          window.dispatchEvent(new CustomEvent('qds_incident_created', { detail: newIncident }));
          try {
            const saved = localStorage.getItem('qds_incidents_list');
            const list = saved ? JSON.parse(saved) : [];
            const updatedList = [newIncident, ...list.filter((i: any) => i.id !== newIncident.id)];
            localStorage.setItem('qds_incidents_list', JSON.stringify(updatedList));
            localStorage.setItem('qds_selected_incident_id', newIncident.id);
          } catch {}
        }
      }
    } catch {}

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('qds_latest_stream', JSON.stringify(this.liveStream));
      }
    } catch {}

    this.notifyStreamListeners();
  }

  public pushDemonstrationEvent(step: number, isEveActive: boolean, attackType?: string, customMsg?: string): void {
    const nowMs = Date.now();
    if (!attackType && step === this.lastPushedStep && (nowMs - this.lastPushedStepTime) < 300) {
      return;
    }
    this.lastPushedStep = step;
    this.lastPushedStepTime = nowMs;

    const timeStr = formatISTTime(new Date(), true);
    const meta = this.resolveAttackMetadata(attackType, isEveActive);

    let newItem: any;

    if (attackType || isEveActive) {
      switch (step) {
        case 1:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: meta.subsystem,
            event_type: meta.eventType,
            latency_ms: 512,
            status_code: 500,
            message: customMsg || `[${meta.category}] Interception active on dark fiber link.`,
            qber: meta.defaultQber,
            chsh_score: meta.defaultChsh,
            security_score: 'Degraded',
            is_error: true,
            reason: meta.reason
          };
          break;
        case 2:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'ALICE BSM',
            event_type: 'Disturbed Joint Bell State',
            latency_ms: 256,
            status_code: 500,
            message: `Alice joint BSM detected photon state disturbance from ${meta.category}.`,
            qber: meta.defaultQber,
            chsh_score: meta.defaultChsh,
            security_score: 'Degraded',
            is_error: true,
            reason: 'Quantum state decoherence caused by mid-flight interception.'
          };
          break;
        case 3:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'BOB_NODE',
            event_type: 'Pauli Frame Mismatch',
            latency_ms: 128,
            status_code: 500,
            message: `Bob feed-forward correction failed: Pauli syndrome mismatch from ${meta.category}.`,
            qber: meta.defaultQber,
            chsh_score: meta.defaultChsh,
            security_score: 'Degraded',
            is_error: true,
            reason: 'High bit-flip and phase-flip error rate due to Eve measurement collapse.'
          };
          break;
        case 4:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: meta.subsystem,
            event_type: `${meta.eventType} Breach`,
            latency_ms: 256,
            status_code: 500,
            message: `[${meta.category}] QBER ${meta.defaultQber}% breached Hoeffding threshold (> 5.0%).`,
            qber: meta.defaultQber,
            chsh_score: meta.defaultChsh,
            security_score: 'Degraded',
            is_error: true,
            reason: meta.reason
          };
          break;
        case 5:
        case 6:
        default:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'THREAT ENGINE',
            event_type: `Signature Aborted (${meta.category})`,
            latency_ms: 512,
            status_code: 500,
            message: `Quantum signature rejected due to ${meta.category} (S = ${meta.defaultChsh} < 2.0).`,
            qber: meta.defaultQber,
            chsh_score: meta.defaultChsh,
            security_score: 'Degraded',
            is_error: true,
            reason: `Signature rejected by Threat Engine. Classified under ${meta.category}.`
          };
          break;
      }
    } else {
      switch (step) {
        case 1:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'KEY EXCH MN',
            event_type: 'Photon Pulse Tx',
            latency_ms: 1024,
            status_code: 200,
            message: 'Arbitrator pumped SPDC entangled pairs (λ=1550nm) to Alice & Bob.',
            qber: 1.95,
            chsh_score: 2.78,
            security_score: 'Secure',
            is_error: false
          };
          break;
        case 2:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'ALICE BSM',
            event_type: 'Joint Bell Measurement',
            latency_ms: 256,
            status_code: 200,
            message: 'Alice completed joint Bell state measurement on document qubit state |ψ_doc⟩.',
            qber: 2.05,
            chsh_score: 2.76,
            security_score: 'Secure',
            is_error: false
          };
          break;
        case 3:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'BOB_NODE',
            event_type: 'Pauli Frame Recon',
            latency_ms: 128,
            status_code: 200,
            message: 'Bob applied unitary Pauli transformations (σ_x, σ_z) via classical feed-forward bits.',
            qber: 1.90,
            chsh_score: 2.79,
            security_score: 'Secure',
            is_error: false
          };
          break;
        case 4:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'HOEFFDING CHK',
            event_type: 'Statistical Bound Audit',
            latency_ms: 128,
            status_code: 200,
            message: 'Hoeffding statistical bound verified: α=0.001 error rate strictly within threshold.',
            qber: 2.10,
            chsh_score: 2.76,
            security_score: 'Secure',
            is_error: false
          };
          break;
        case 5:
        case 6:
        default:
          newItem = {
            id: Date.now().toString(),
            timestamp: timeStr,
            subsystem: 'PRIVACY AMP',
            event_type: 'Toeplitz Hash Distill',
            latency_ms: 512,
            status_code: 200,
            message: 'Toeplitz privacy amplification distilled unforgeable quantum signature token.',
            qber: 1.88,
            chsh_score: 2.78,
            security_score: 'Secure',
            is_error: false
          };
          break;
      }
    }

    if (newItem) {
      const fileMatch = customMsg?.match(/file \[([^\]]+)\]/i) || customMsg?.match(/\[([a-zA-Z0-9_\-]+\.(?:sig|pdf|txt|json|pem|bin|ps1|md))\]/i);
      const textMatch = customMsg?.match(/text "([^"]+)"/i);

      if (fileMatch || textMatch) {
        newItem.source = 'transfer';
        newItem.isTransfer = true;
        if (fileMatch) newItem.fileName = fileMatch[1];
        if (textMatch) newItem.transferContent = textMatch[1];
      } else {
        newItem.source = 'demonstration';
        newItem.isDemonstration = true;
      }
    }

    this.liveStream = [newItem, ...this.liveStream.filter(i => i.id !== newItem.id)].slice(0, 15);
    
    // Also push to persistent telemetry table
    this.telemetry.unshift({
      id: newItem.id,
      timestamp: newItem.timestamp,
      subsystem: newItem.subsystem as any,
      event_type: newItem.event_type,
      latency_ms: newItem.latency_ms,
      status_code: newItem.status_code,
      message: newItem.message,
    });
    if (this.telemetry.length > 50) this.telemetry.pop();

    // Dynamically generate/update live QuantumSession in the database ledger
    if (step === 6 || attackType) {
      const nowIso = new Date().toISOString();
      const isBreach = isEveActive || Boolean(attackType);
      const sessId = `QDS-${new Date().getFullYear()}-${attackType ? 'ATTACK' : isEveActive ? 'MITM' : 'CLEAN'}-${Date.now().toString().slice(-4)}`;
      
      const newSession: QuantumSession = {
        session_id: sessId,
        document_name: isBreach ? 'quantum_dispatch_threat_flagged.sig' : 'quantum_dispatch_verified.sig',
        document_hash: isBreach ? '8f92a1bc40e7d294b105f838e7902ba4' : 'e3b0c44298fc1c149afbf4c8996fb924',
        file_size_kb: 128.0,
        status: isBreach ? 'REJECTED' : 'VERIFIED',
        created_at: nowIso,
        updated_at: nowIso,
        sender: 'Alice (ALC-01 · Node Alpha)',
        receiver: 'Bob (BOB-01 · Node Beta)',
        arbitrator: 'Arbitrator (ARB-01 · Core Cluster)',
        metrics: {
          qber: isBreach ? meta.defaultQber / 100 : 0.019,
          baseline_qber: 0.020,
          hoeffding_threshold: 0.055,
          chsh_score: isBreach ? meta.defaultChsh : 2.78,
          classical_limit: 2.00,
          tsirelson_bound: 2.828,
          confidence_level: 0.999,
          alpha: 0.001,
          sifted_bits: 3840,
          error_bits: isBreach ? Math.round(3840 * (meta.defaultQber / 100)) : 72,
          total_pulses: 8192,
        },
        verdict: {
          verdict: isBreach ? 'REJECT' : 'ACCEPT',
          threat_detected: isBreach,
          threat_type: isBreach ? meta.category : null,
          reason: isBreach ? meta.reason : 'All quantum security tests verified. Non-locality passed (S=2.78 > 2.00), QBER nominal (1.9%).',
          evaluated_at: nowIso,
          hoeffding_pass: !isBreach,
          chsh_pass: meta.defaultChsh >= 2.0,
          signature_pass: !isBreach,
          security_score: isBreach ? 15 : 98,
        }
      };

      this.sessions = [newSession, ...this.sessions.filter(s => s.session_id !== sessId)];

      if (isBreach) {
        const incidentId = `INC-${Date.now().toString().slice(-4)}`;
        const newIncident: SecurityIncident = {
          id: incidentId,
          session_id: sessId,
          event: `Quantum Channel Intrusion: ${meta.category}`,
          severity: meta.severity,
          qber: meta.defaultQber / 100,
          chsh: meta.defaultChsh,
          timestamp: formatISTTime(new Date(), false),
          threat_category: meta.category,
          summary: meta.summary,
          evidence: {
            qber_observed: meta.defaultQber / 100,
            hoeffding_threshold: 0.055,
            chsh_score: meta.defaultChsh,
            classical_limit: 2.00,
            statistical_p_value: 0.000001,
            affected_qubits: meta.affectedQubits,
          },
          detection_timeline: meta.timeline,
          final_assessment: `Signature rejected by Threat Engine. Flagged under ${meta.category}.`,
        };
        this.incidents = [newIncident, ...this.incidents.filter(i => i.id !== incidentId)];
      }
    }

    // 1. Broadcast to other browser tabs/windows
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'NEW_TELEMETRY_ITEM', payload: newItem });
      }
    } catch {}

    // 2. Dispatch custom window event
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qds:telemetry-update', { detail: newItem }));
      }
    } catch {}

    // 3. Persist to localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('qds_latest_stream', JSON.stringify(this.liveStream));
      }
    } catch {}

    // 4. Transmit telemetry event directly to FastAPI backend
    apiClient.sendStepTelemetry({
      step,
      is_eve_active: isEveActive,
      attack_type: attackType,
      step_name: newItem.event_type,
    }).catch(() => {});

    this.notifyStreamListeners();
  }

  // ─── Historical Series ──────────────────────────────────────────────────────
  public getHistoricalData(): HistoricalPoint[] {
    return [...this.historical];
  }

  // ─── Telemetry & Performance ────────────────────────────────────────────────
  public getTelemetryLogs(): TelemetryLog[] {
    return [...this.telemetry];
  }

  public getPerformance(): SystemPerformance {
    return { ...this.performance };
  }
}

export const sentinelService = new SentinelService();

