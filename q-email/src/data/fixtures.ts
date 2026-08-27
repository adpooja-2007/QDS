import type {
  Session,
  SecurityDecision,
  TelemetryEvent,
  SystemNode,
  AnalyticsPoint,
  CommunicationState,
  ProtocolStep,
  DashboardData,
  SessionState,
} from '../types';

export type Scenario =
  | 'CLEAN'
  | 'NORMAL_NOISE'
  | 'MITM'
  | 'FORGERY'
  | 'REPLAY'
  | 'PNS';

// ─── Session Fixtures ─────────────────────────────────────────────────────────
const SESSION_ID = 'QDS-2026-SES-0001';
const PROTOCOL = 'BB84-EPR-QDS-v2.3';

const sessionBase = (state: SessionState, qber: number): Session => ({
  session_id: SESSION_ID,
  state,
  epr_pair_count: 8192,
  protocol_version: PROTOCOL,
  baseline_qber: 0.028,
  threshold: 0.11,
  alpha: 0.001,
  created_at: '2026-08-25T09:00:00Z',
  updated_at: new Date().toISOString(),
  qber,
} as Session & { qber: number });

// ─── Decision Fixtures ────────────────────────────────────────────────────────
const mkDecision = (
  scenario: Scenario,
): SecurityDecision => {
  const configs: Record<Scenario, SecurityDecision> = {
    CLEAN: {
      decision: 'ACCEPT',
      reason: 'All quantum security checks passed. Quantum channel integrity confirmed.',
      metrics: {
        qber: 0.031, baseline_qber: 0.028, threshold: 0.11,
        chsh: 2.76, sifted_count: 3891, error_count: 122,
      },
      checks: { qber_pass: true, chsh_pass: true, session_valid: true, threshold_pass: true },
      attack_detected: false,
      attack_type: null,
      evaluated_at: new Date().toISOString(),
    },
    NORMAL_NOISE: {
      decision: 'ACCEPT',
      reason: 'QBER elevated within acceptable range. Environmental noise detected. Channel deemed secure.',
      metrics: {
        qber: 0.072, baseline_qber: 0.028, threshold: 0.11,
        chsh: 2.61, sifted_count: 3712, error_count: 267,
      },
      checks: { qber_pass: true, chsh_pass: true, session_valid: true, threshold_pass: true },
      attack_detected: false,
      attack_type: null,
      evaluated_at: new Date().toISOString(),
    },
    MITM: {
      decision: 'REJECT',
      reason: 'QBER significantly exceeds threshold. CHSH violation indicates eavesdropping. Session terminated.',
      metrics: {
        qber: 0.241, baseline_qber: 0.028, threshold: 0.11,
        chsh: 1.83, sifted_count: 2905, error_count: 700,
      },
      checks: { qber_pass: false, chsh_pass: false, session_valid: true, threshold_pass: false },
      attack_detected: true,
      attack_type: 'MAN_IN_THE_MIDDLE',
      evaluated_at: new Date().toISOString(),
    },
    FORGERY: {
      decision: 'REJECT',
      reason: 'Digital signature verification failed. Message authentication code mismatch detected.',
      metrics: {
        qber: 0.043, baseline_qber: 0.028, threshold: 0.11,
        chsh: 2.68, sifted_count: 3844, error_count: 165,
      },
      checks: { qber_pass: true, chsh_pass: true, session_valid: false, threshold_pass: true },
      attack_detected: true,
      attack_type: 'DIGITAL_SIGNATURE_FORGERY',
      evaluated_at: new Date().toISOString(),
    },
    REPLAY: {
      decision: 'REJECT',
      reason: 'Duplicate session nonce detected. Quantum timestamp validation failed. Replay attack mitigated.',
      metrics: {
        qber: 0.038, baseline_qber: 0.028, threshold: 0.11,
        chsh: 2.71, sifted_count: 3901, error_count: 148,
      },
      checks: { qber_pass: true, chsh_pass: true, session_valid: false, threshold_pass: true },
      attack_detected: true,
      attack_type: 'REPLAY_ATTACK',
      evaluated_at: new Date().toISOString(),
    },
    PNS: {
      decision: 'FLAG',
      reason: 'Photon-number splitting pattern detected via decoy-state analysis. Manual review required.',
      metrics: {
        qber: 0.094, baseline_qber: 0.028, threshold: 0.11,
        chsh: 2.31, sifted_count: 3201, error_count: 301,
      },
      checks: { qber_pass: true, chsh_pass: false, session_valid: true, threshold_pass: true },
      attack_detected: true,
      attack_type: 'PHOTON_NUMBER_SPLITTING',
      evaluated_at: new Date().toISOString(),
    },
  };
  return configs[scenario];
};

// ─── Analytics Fixtures ───────────────────────────────────────────────────────
const mkAnalytics = (scenario: Scenario): AnalyticsPoint[] => {
  const base: Array<[number, number, number]> = [
    [1, 0.031, 2.76], [2, 0.028, 2.81], [3, 0.034, 2.74],
    [4, 0.027, 2.82], [5, 0.030, 2.78], [6, 0.033, 2.75],
  ];

  const overrides: Partial<Record<Scenario, Array<[number, number, number]>>> = {
    NORMAL_NOISE: [
      [1, 0.058, 2.63], [2, 0.065, 2.59], [3, 0.071, 2.55],
      [4, 0.068, 2.61], [5, 0.074, 2.57], [6, 0.072, 2.61],
    ],
    MITM: [
      [1, 0.105, 2.22], [2, 0.143, 2.10], [3, 0.188, 1.98],
      [4, 0.211, 1.89], [5, 0.228, 1.86], [6, 0.241, 1.83],
    ],
    FORGERY: [
      [1, 0.030, 2.75], [2, 0.033, 2.71], [3, 0.039, 2.69],
      [4, 0.041, 2.70], [5, 0.043, 2.68], [6, 0.043, 2.68],
    ],
    REPLAY: [
      [1, 0.029, 2.73], [2, 0.031, 2.72], [3, 0.035, 2.72],
      [4, 0.037, 2.71], [5, 0.038, 2.71], [6, 0.038, 2.71],
    ],
    PNS: [
      [1, 0.042, 2.65], [2, 0.058, 2.51], [3, 0.073, 2.42],
      [4, 0.081, 2.38], [5, 0.088, 2.34], [6, 0.094, 2.31],
    ],
  };

  const series = overrides[scenario] ?? base;
  return series.map(([run, qber, chsh]) => ({
    run,
    label: `Run ${run}`,
    qber_observed: qber,
    qber_baseline: 0.028,
    threshold: 0.11,
    chsh,
  }));
};

// ─── Telemetry Events ─────────────────────────────────────────────────────────
const mkEvents = (scenario: Scenario): TelemetryEvent[] => {
  const base: TelemetryEvent[] = [
    {
      id: 'evt-001', timestamp: '09:00:01.002', module: 'SESSION',
      component: 'SessionManager', event: 'SESSION_CREATED',
      state: 'COMPLETED', duration_ms: 2,
    },
    {
      id: 'evt-002', timestamp: '09:00:01.288', module: 'QUANTUM',
      component: 'EPRSource', event: 'EPR_PAIRS_GENERATED',
      state: 'COMPLETED', duration_ms: 286,
    },
    {
      id: 'evt-003', timestamp: '09:00:01.891', module: 'ALICE',
      component: 'AliceNode', event: 'STATE_PREPARATION',
      state: 'COMPLETED', duration_ms: 603,
    },
    {
      id: 'evt-004', timestamp: '09:00:02.104', module: 'BOB',
      component: 'BobNode', event: 'MEASUREMENT_COMPLETE',
      state: 'COMPLETED', duration_ms: 213,
    },
    {
      id: 'evt-005', timestamp: '09:00:02.788', module: 'SECURITY',
      component: 'SecurityEngine', event: 'QBER_COMPUTED',
      state: 'COMPLETED', duration_ms: 684,
    },
    {
      id: 'evt-006', timestamp: '09:00:03.012', module: 'SECURITY',
      component: 'SecurityEngine', event: 'CHSH_EVALUATED',
      state: 'COMPLETED', duration_ms: 224,
    },
  ];

  const extras: Partial<Record<Scenario, TelemetryEvent[]>> = {
    MITM: [
      {
        id: 'evt-007', timestamp: '09:00:03.198', module: 'SECURITY',
        component: 'AnomalyDetector', event: 'ANOMALY_DETECTED',
        state: 'COMPLETED', duration_ms: 186,
      },
      {
        id: 'evt-008', timestamp: '09:00:03.391', module: 'SECURITY',
        component: 'SecurityEngine', event: 'SESSION_TERMINATED',
        state: 'COMPLETED', duration_ms: 193,
      },
    ],
    FORGERY: [
      {
        id: 'evt-007', timestamp: '09:00:03.198', module: 'SECURITY',
        component: 'SignatureVerifier', event: 'SIGNATURE_VERIFICATION_FAILED',
        state: 'FAILED', duration_ms: 186,
      },
    ],
    REPLAY: [
      {
        id: 'evt-007', timestamp: '09:00:03.233', module: 'SECURITY',
        component: 'NonceValidator', event: 'REPLAY_NONCE_DETECTED',
        state: 'FAILED', duration_ms: 221,
      },
    ],
    PNS: [
      {
        id: 'evt-007', timestamp: '09:00:03.288', module: 'SECURITY',
        component: 'DecoyStateAnalyzer', event: 'PNS_PATTERN_FLAGGED',
        state: 'FAILED', duration_ms: 276,
      },
    ],
  };

  return [...base, ...(extras[scenario] ?? [])];
};

// ─── Nodes ─────────────────────────────────────────────────────────────────────
const mkNodes = (scenario: Scenario): SystemNode[] => {
  const isCompromised = ['MITM', 'FORGERY', 'REPLAY', 'PNS'].includes(scenario);
  return [
    {
      id: 'node-alice-01',
      name: 'Alice-Node-01',
      role: 'SENDER',
      last_event: 'STATE_PREPARATION',
      state: 'ACTIVE',
      endpoint: '10.0.1.1:7000',
      uptime: '14h 22m',
    },
    {
      id: 'node-bob-01',
      name: 'Bob-Node-01',
      role: 'RECEIVER',
      last_event: 'MEASUREMENT_COMPLETE',
      state: 'ACTIVE',
      endpoint: '10.0.1.2:7001',
      uptime: '14h 22m',
    },
    {
      id: 'node-epr-src',
      name: 'EPR-Source',
      role: 'ENTANGLEMENT',
      last_event: 'EPR_PAIRS_GENERATED',
      state: 'READY',
      endpoint: '10.0.1.3:7002',
      uptime: '22h 11m',
    },
    {
      id: 'node-sec-engine',
      name: 'Security-Engine',
      role: 'VERIFICATION',
      last_event: isCompromised ? 'ANOMALY_DETECTED' : 'CHSH_EVALUATED',
      state: isCompromised ? 'PROCESSING' : 'ACTIVE',
      endpoint: '10.0.1.4:7003',
      uptime: '22h 11m',
    },
  ];
};

// ─── Communication ────────────────────────────────────────────────────────────
const mkComm = (scenario: Scenario): CommunicationState => ({
  status: 'VERIFICATION',
  alice: {
    session_id: SESSION_ID,
    state: 'AWAITING_VERIFICATION',
    basis: 'RECTILINEAR',
    measurement: '|1⟩',
  },
  bob: {
    session_id: SESSION_ID,
    state: 'MEASUREMENT_COMPLETE',
    basis: 'DIAGONAL',
    measurement: '|+⟩',
  },
  channel_qber: mkDecision(scenario).metrics.qber,
  packets_sent: 8192,
  packets_verified: mkDecision(scenario).metrics.sifted_count,
});

// ─── Protocol Steps ────────────────────────────────────────────────────────────
const mkProtocol = (scenario: Scenario): ProtocolStep[] => {
  const decision = mkDecision(scenario).decision;
  return [
    {
      id: 1, code: 'EPR', label: 'EPR Pair Generation',
      description: 'Entangled EPR photon pairs generated and distributed',
      node: 'EPR-Source', status: 'COMPLETED', duration_ms: 286,
    },
    {
      id: 2, code: 'STA', label: 'State Preparation',
      description: 'Alice prepares quantum states with random bases',
      node: 'Alice-Node-01', status: 'COMPLETED', duration_ms: 603,
    },
    {
      id: 3, code: 'MSR', label: 'Quantum Measurement',
      description: 'Bob measures received quantum states',
      node: 'Bob-Node-01', status: 'COMPLETED', duration_ms: 213,
    },
    {
      id: 4, code: 'SFT', label: 'Key Sifting',
      description: 'Classical basis reconciliation and sifting',
      node: 'Alice-Node-01 + Bob-Node-01', status: 'COMPLETED', duration_ms: 88,
    },
    {
      id: 5, code: 'QBR', label: 'QBER Analysis',
      description: 'Quantum bit error rate computation',
      node: 'Security-Engine', status: 'COMPLETED', duration_ms: 684,
    },
    {
      id: 6, code: 'CHB', label: 'CHSH Verification',
      description: "Bell inequality test via CHSH parameter",
      node: 'Security-Engine', status: 'COMPLETED', duration_ms: 224,
    },
    {
      id: 7, code: 'DSG', label: 'Digital Signature',
      description: 'Quantum-anchored signature generation and verification',
      node: 'Alice-Node-01 → Bob-Node-01',
      status: decision === 'ACCEPT' ? 'COMPLETED' : 'IN_PROGRESS',
      duration_ms: decision === 'ACCEPT' ? 142 : undefined,
    },
    {
      id: 8, code: 'AUD', label: 'Security Audit',
      description: 'Final decision: ACCEPT / REJECT / FLAG',
      node: 'Security-Engine',
      status: decision !== 'PENDING' ? 'COMPLETED' : 'PENDING',
      duration_ms: decision !== 'PENDING' ? 32 : undefined,
    },
  ];
};

// ─── Public Fixtures ──────────────────────────────────────────────────────────
export interface ScenarioFixture {
  session: Session;
  decision: SecurityDecision;
  events: TelemetryEvent[];
  nodes: SystemNode[];
  analytics: AnalyticsPoint[];
  comm: CommunicationState;
  protocol: ProtocolStep[];
}

export function getFixture(scenario: Scenario): ScenarioFixture {
  const decision = mkDecision(scenario);
  const state: SessionState = decision.decision === 'ACCEPT'
    ? 'AUDITED'
    : decision.decision === 'REJECT'
    ? 'REJECTED'
    : 'VERIFIED';

  return {
    session: sessionBase(state, decision.metrics.qber),
    decision,
    events: mkEvents(scenario),
    nodes: mkNodes(scenario),
    analytics: mkAnalytics(scenario),
    comm: mkComm(scenario),
    protocol: mkProtocol(scenario),
  };
}

export const SCENARIOS: Scenario[] = ['CLEAN', 'NORMAL_NOISE', 'MITM', 'FORGERY', 'REPLAY', 'PNS'];
export const SCENARIO_LABELS: Record<Scenario, string> = {
  CLEAN: 'Clean Channel',
  NORMAL_NOISE: 'Normal Noise',
  MITM: 'Man-in-the-Middle',
  FORGERY: 'Signature Forgery',
  REPLAY: 'Replay Attack',
  PNS: 'Photon-Number Splitting',
};
