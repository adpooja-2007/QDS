import {
  QuantumSession,
  SecurityReport,
  SignatureInfo,
  SystemNode,
  ProtocolEvent,
  TelemetryEvent,
  MockScenarioType
} from '../../types';

export interface MockScenarioData {
  session: QuantumSession;
  signature: SignatureInfo;
  report: SecurityReport;
  nodes: SystemNode[];
  events: ProtocolEvent[];
  telemetry: TelemetryEvent[];
  qberRuns: { run: number; observed: number; baseline: number; threshold: number }[];
}

export const MOCK_SCENARIOS: Record<MockScenarioType, MockScenarioData> = {
  CLEAN: {
    session: {
      session_id: 'MOCK-QSEC-001',
      epr_pair_count: 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'AUDITED',
      created_at: '2026-08-25T21:10:00Z',
      key_length: 256,
      baseline_qber: 0.000,
      alpha: 0.000001,
      protocol_version: '1.0'
    },
    signature: {
      signature_id: 'SIG-000001',
      document_name: 'contract.pdf',
      hash_algorithm: 'SHA-256',
      document_hash: 'a8f91c9e7428e21a367469a531b79f64a78129038276f5b9d21c435508a47812',
      bit_length: 256,
      status: 'SIGNED',
      timestamp: '2026-08-25T21:11:15Z'
    },
    report: {
      session_id: 'MOCK-QSEC-001',
      metrics: {
        sifted_count: 500,
        error_count: 0,
        qber: 0.000,
        threshold: 0.100,
        chsh: 2.72,
        baseline_qber: 0.000
      },
      checks: {
        qber_pass: true,
        chsh_pass: true,
        session_valid: true,
        threshold_pass: true
      },
      security: {
        attack_detected: false,
        attack_type: 'NONE',
        decision: 'ACCEPT'
      },
      reason: 'All configured deterministic security checks passed successfully.',
      request_id: 'REQ-000001',
      timestamp: '2026-08-25T21:14:12Z'
    },
    nodes: [
      { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'Bell measurement completed', status: 'Ready', endpoint: 'node-alice.local' },
      { id: '2', name: 'Bob', role: 'Verification', last_event: 'Measurement completed', status: 'Ready', endpoint: 'node-bob.local' },
      { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
      { id: '4', name: 'Eve', role: 'Adversary monitoring', last_event: 'No channel intrusion detected', status: 'Ready', endpoint: 'node-eve.tap' },
      { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated (ACCEPT)', status: 'Ready', endpoint: 'soc-engine.core' },
      { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Simulation completed', status: 'Ready', endpoint: 'qiskit-aer.core' }
    ],
    events: [
      { id: 'e1', timestamp: '21:10:00', event_type: 'SESSION_CREATED', description: 'Quantum security session initialized with 1000 EPR pairs.', node: 'Arbitrator', severity: 'info' },
      { id: 'e2', timestamp: '21:10:04', event_type: 'EPR_GENERATION_STARTED', description: 'Qiskit Aer EPR pair generation started (|Phi+>).', node: 'Quantum Engine', severity: 'info' },
      { id: 'e3', timestamp: '21:10:12', event_type: 'EPR_GENERATION_COMPLETED', description: '1000 EPR pairs distributed to Alice and Bob.', node: 'Arbitrator', severity: 'success' },
      { id: 'e4', timestamp: '21:11:15', event_type: 'SIGNATURE_CREATED', description: 'Document SHA-256 hash signed with quantum key.', node: 'Alice', severity: 'info' },
      { id: 'e5', timestamp: '21:11:45', event_type: 'BELL_MEASUREMENT_STARTED', description: 'Alice initiated Bell-state measurements.', node: 'Alice', severity: 'info' },
      { id: 'e6', timestamp: '21:12:02', event_type: 'BELL_MEASUREMENT_COMPLETED', description: 'Bell measurements completed across 500 test pairs.', node: 'Alice', severity: 'success' },
      { id: 'e7', timestamp: '21:12:18', event_type: 'FEED_FORWARD_GENERATED', description: 'Classical feed-forward bits transmitted to Bob.', node: 'Alice', severity: 'info' },
      { id: 'e8', timestamp: '21:12:35', event_type: 'PAULI_CORRECTION_COMPLETED', description: 'Bob applied Pauli X/Z unitary transformations.', node: 'Bob', severity: 'info' },
      { id: 'e9', timestamp: '21:13:00', event_type: 'BOB_MEASUREMENT_COMPLETED', description: 'Bob completed quantum state verification measurements.', node: 'Bob', severity: 'success' },
      { id: 'e10', timestamp: '21:13:20', event_type: 'SIFTING_COMPLETED', description: 'Basis reconciliation completed. 500 sifted bits obtained.', node: 'Arbitrator', severity: 'info' },
      { id: 'e11', timestamp: '21:13:40', event_type: 'QBER_CALCULATED', description: 'Quantum Bit Error Rate computed: 0.000 (0 errors / 500).', node: 'Security Engine', severity: 'info' },
      { id: 'e12', timestamp: '21:13:50', event_type: 'THRESHOLD_CALCULATED', description: 'Statistical upper bound computed: threshold = 0.100.', node: 'Security Engine', severity: 'info' },
      { id: 'e13', timestamp: '21:14:00', event_type: 'CHSH_CALCULATED', description: 'CHSH Bell inequality correlation evaluated: S = 2.72 > 2.0.', node: 'Security Engine', severity: 'info' },
      { id: 'e14', timestamp: '21:14:08', event_type: 'SECURITY_AUDIT_STARTED', description: 'Comprehensive multi-metric security audit initiated.', node: 'Security Engine', severity: 'info' },
      { id: 'e15', timestamp: '21:14:11', event_type: 'SECURITY_AUDIT_COMPLETED', description: 'All verification checks passed with zero anomalies.', node: 'Security Engine', severity: 'success' },
      { id: 'e16', timestamp: '21:14:12', event_type: 'DECISION_GENERATED', description: 'Security decision ACCEPT emitted to orchestration layer.', node: 'Security Engine', severity: 'success' }
    ],
    telemetry: [
      { id: 't1', module: 'Quantum', component: 'EPR Generator', operation: 'generate_epr', duration_ms: 42, status: 'SUCCESS', timestamp: '21:10:04' },
      { id: 't2', module: 'Crypto', component: 'Document Hasher', operation: 'sha256_digest', duration_ms: 3, status: 'SUCCESS', timestamp: '21:11:15' },
      { id: 't3', module: 'Quantum', component: 'Bell Analyzer', operation: 'bell_measurement', duration_ms: 118, status: 'SUCCESS', timestamp: '21:12:02' },
      { id: 't4', module: 'Transport', component: 'Classical Channel', operation: 'feed_forward_tx', duration_ms: 12, status: 'SUCCESS', timestamp: '21:12:18' },
      { id: 't5', module: 'Quantum', component: 'Unitary Operator', operation: 'pauli_corrections', duration_ms: 64, status: 'SUCCESS', timestamp: '21:12:35' },
      { id: 't6', module: 'Security', component: 'QBER Analyzer', operation: 'calculate_qber', duration_ms: 8, status: 'SUCCESS', timestamp: '21:13:40' },
      { id: 't7', module: 'Security', component: 'CHSH Correlator', operation: 'evaluate_bell_inequality', duration_ms: 15, status: 'SUCCESS', timestamp: '21:14:00' },
      { id: 't8', module: 'Security', component: 'Policy Engine', operation: 'synthesize_audit_report', duration_ms: 5, status: 'SUCCESS', timestamp: '21:14:12' }
    ],
    qberRuns: [
      { run: 1, observed: 0.000, baseline: 0.000, threshold: 0.100 },
      { run: 2, observed: 0.001, baseline: 0.000, threshold: 0.100 },
      { run: 3, observed: 0.000, baseline: 0.000, threshold: 0.100 },
      { run: 4, observed: 0.000, baseline: 0.000, threshold: 0.100 },
      { run: 5, observed: 0.002, baseline: 0.000, threshold: 0.100 },
      { run: 6, observed: 0.000, baseline: 0.000, threshold: 0.100 },
      { run: 7, observed: 0.000, baseline: 0.000, threshold: 0.100 }
    ]
  },

  NORMAL_NOISE: {
    session: {
      session_id: 'MOCK-NOISE-001',
      epr_pair_count: 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'AUDITED',
      created_at: '2026-08-25T21:15:00Z',
      key_length: 256,
      baseline_qber: 0.020,
      alpha: 0.000001,
      protocol_version: '1.0'
    },
    signature: {
      signature_id: 'SIG-000002',
      document_name: 'contract.pdf',
      hash_algorithm: 'SHA-256',
      document_hash: 'a8f91c9e7428e21a367469a531b79f64a78129038276f5b9d21c435508a47812',
      bit_length: 256,
      status: 'SIGNED',
      timestamp: '2026-08-25T21:15:20Z'
    },
    report: {
      session_id: 'MOCK-NOISE-001',
      metrics: {
        sifted_count: 500,
        error_count: 10,
        qber: 0.021,
        threshold: 0.100,
        chsh: 2.55,
        baseline_qber: 0.020
      },
      checks: {
        qber_pass: true,
        chsh_pass: true,
        session_valid: true,
        threshold_pass: true
      },
      security: {
        attack_detected: false,
        attack_type: 'PHYSICAL_NOISE',
        decision: 'ACCEPT'
      },
      reason: 'Observed QBER (0.021) is within nominal thermal/optical noise baseline. Security threshold satisfied.',
      request_id: 'REQ-000002',
      timestamp: '2026-08-25T21:16:45Z'
    },
    nodes: [
      { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'Bell measurement completed', status: 'Ready', endpoint: 'node-alice.local' },
      { id: '2', name: 'Bob', role: 'Verification', last_event: 'Measurement completed', status: 'Ready', endpoint: 'node-bob.local' },
      { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
      { id: '4', name: 'Eve', role: 'Adversary monitoring', last_event: 'Thermal depolarizing noise model active', status: 'Ready', endpoint: 'node-eve.tap' },
      { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated (ACCEPT)', status: 'Ready', endpoint: 'soc-engine.core' },
      { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Simulation with noise model completed', status: 'Ready', endpoint: 'qiskit-aer.core' }
    ],
    events: [
      { id: 'e1', timestamp: '21:15:00', event_type: 'SESSION_CREATED', description: 'Session created with 0.02 depolarizing channel noise.', node: 'Arbitrator', severity: 'info' },
      { id: 'e2', timestamp: '21:15:30', event_type: 'EPR_GENERATION_COMPLETED', description: 'EPR pairs distributed with optical fiber attenuation.', node: 'Quantum Engine', severity: 'info' },
      { id: 'e3', timestamp: '21:16:10', event_type: 'SIFTING_COMPLETED', description: 'Basis reconciliation completed. 500 sifted bits.', node: 'Arbitrator', severity: 'info' },
      { id: 'e4', timestamp: '21:16:25', event_type: 'QBER_CALCULATED', description: 'Observed QBER: 0.021 (10 errors / 500 bits).', node: 'Security Engine', severity: 'info' },
      { id: 'e5', timestamp: '21:16:35', event_type: 'CHSH_CALCULATED', description: 'CHSH Bell score: 2.55 (Quantum regime confirmed).', node: 'Security Engine', severity: 'info' },
      { id: 'e6', timestamp: '21:16:45', event_type: 'DECISION_GENERATED', description: 'Security decision ACCEPT emitted. Nominal environmental noise.', node: 'Security Engine', severity: 'success' }
    ],
    telemetry: [
      { id: 't1', module: 'Quantum', component: 'Noise Model', operation: 'apply_depolarizing_channel', duration_ms: 55, status: 'SUCCESS', timestamp: '21:15:10' },
      { id: 't2', module: 'Security', component: 'QBER Analyzer', operation: 'calculate_qber', duration_ms: 9, status: 'SUCCESS', timestamp: '21:16:25' },
      { id: 't3', module: 'Security', component: 'Policy Engine', operation: 'evaluate_threshold_tolerance', duration_ms: 6, status: 'SUCCESS', timestamp: '21:16:45' }
    ],
    qberRuns: [
      { run: 1, observed: 0.019, baseline: 0.020, threshold: 0.100 },
      { run: 2, observed: 0.022, baseline: 0.020, threshold: 0.100 },
      { run: 3, observed: 0.020, baseline: 0.020, threshold: 0.100 },
      { run: 4, observed: 0.024, baseline: 0.020, threshold: 0.100 },
      { run: 5, observed: 0.021, baseline: 0.020, threshold: 0.100 },
      { run: 6, observed: 0.018, baseline: 0.020, threshold: 0.100 },
      { run: 7, observed: 0.021, baseline: 0.020, threshold: 0.100 }
    ]
  },

  MITM: {
    session: {
      session_id: 'MOCK-MITM-001',
      epr_pair_count: 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'REJECTED',
      created_at: '2026-08-25T21:20:00Z',
      key_length: 256,
      baseline_qber: 0.020,
      alpha: 0.000001,
      protocol_version: '1.0'
    },
    signature: {
      signature_id: 'SIG-000003',
      document_name: 'financial_order.pdf',
      hash_algorithm: 'SHA-256',
      document_hash: 'c478a2e19fbc40d5881472bb51082ce7fa8901235471a2e8c9b347f12e88a091',
      bit_length: 256,
      status: 'REJECTED',
      timestamp: '2026-08-25T21:20:30Z'
    },
    report: {
      session_id: 'MOCK-MITM-001',
      metrics: {
        sifted_count: 500,
        error_count: 120,
        qber: 0.240,
        threshold: 0.100,
        chsh: 1.86,
        baseline_qber: 0.020
      },
      checks: {
        qber_pass: false,
        chsh_pass: false,
        session_valid: true,
        threshold_pass: false
      },
      security: {
        attack_detected: true,
        attack_type: 'INTERCEPT_RESEND',
        decision: 'REJECT'
      },
      reason: 'Severe channel eavesdropping detected: QBER (0.240) exceeded security threshold (0.100) and CHSH correlation (1.86 < 2.0) indicates classical state collapse.',
      request_id: 'REQ-000003',
      timestamp: '2026-08-25T21:22:15Z'
    },
    nodes: [
      { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'State preparation completed', status: 'Ready', endpoint: 'node-alice.local' },
      { id: '2', name: 'Bob', role: 'Verification', last_event: 'High error rate flagged', status: 'Alert', endpoint: 'node-bob.local' },
      { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
      { id: '4', name: 'Eve', role: 'Active Interceptor', last_event: 'Intercept-resend basis mismatch injected', status: 'Alert', endpoint: 'node-eve.tap' },
      { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated (REJECT)', status: 'Alert', endpoint: 'soc-engine.core' },
      { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Interception circuit executed', status: 'Ready', endpoint: 'qiskit-aer.core' }
    ],
    events: [
      { id: 'e1', timestamp: '21:20:00', event_type: 'SESSION_CREATED', description: 'Session created for quantum signature verification.', node: 'Arbitrator', severity: 'info' },
      { id: 'e2', timestamp: '21:20:45', event_type: 'EVE_INTERCEPTION_DETECTED', description: 'Active quantum probe detected on transmission channel.', node: 'Eve', severity: 'error' },
      { id: 'e3', timestamp: '21:21:30', event_type: 'SIFTING_COMPLETED', description: 'Basis reconciliation completed with elevated discrepancy.', node: 'Arbitrator', severity: 'warning' },
      { id: 'e4', timestamp: '21:21:50', event_type: 'QBER_CALCULATED', description: 'Observed QBER: 0.240 (120 errors / 500 bits) — EXCEEDS 0.100.', node: 'Security Engine', severity: 'error' },
      { id: 'e5', timestamp: '21:22:05', event_type: 'CHSH_CALCULATED', description: 'CHSH Bell score: 1.86 (Classical bound <= 2.0 violated).', node: 'Security Engine', severity: 'error' },
      { id: 'e6', timestamp: '21:22:15', event_type: 'DECISION_GENERATED', description: 'Security decision REJECT emitted. Intercept-Resend attack detected.', node: 'Security Engine', severity: 'error' }
    ],
    telemetry: [
      { id: 't1', module: 'Quantum', component: 'Adversary Probe', operation: 'intercept_and_resend', duration_ms: 88, status: 'SUCCESS', timestamp: '21:20:45' },
      { id: 't2', module: 'Security', component: 'QBER Analyzer', operation: 'calculate_qber', duration_ms: 10, status: 'FAILURE', timestamp: '21:21:50' },
      { id: 't3', module: 'Security', component: 'CHSH Correlator', operation: 'evaluate_bell_inequality', duration_ms: 14, status: 'FAILURE', timestamp: '21:22:05' }
    ],
    qberRuns: [
      { run: 1, observed: 0.021, baseline: 0.020, threshold: 0.100 },
      { run: 2, observed: 0.019, baseline: 0.020, threshold: 0.100 },
      { run: 3, observed: 0.125, baseline: 0.020, threshold: 0.100 },
      { run: 4, observed: 0.210, baseline: 0.020, threshold: 0.100 },
      { run: 5, observed: 0.248, baseline: 0.020, threshold: 0.100 },
      { run: 6, observed: 0.235, baseline: 0.020, threshold: 0.100 },
      { run: 7, observed: 0.240, baseline: 0.020, threshold: 0.100 }
    ]
  },

  FORGERY: {
    session: {
      session_id: 'MOCK-FORGERY-001',
      epr_pair_count: 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'REJECTED',
      created_at: '2026-08-25T21:25:00Z',
      key_length: 256,
      baseline_qber: 0.020,
      alpha: 0.000001,
      protocol_version: '1.0'
    },
    signature: {
      signature_id: 'SIG-000004',
      document_name: 'unauthorized_transfer.pdf',
      hash_algorithm: 'SHA-256',
      document_hash: '9034be8812c3f45109ab77d12f45c89e1023471029cba87123ef451098234ab1',
      bit_length: 256,
      status: 'REJECTED',
      timestamp: '2026-08-25T21:25:20Z'
    },
    report: {
      session_id: 'MOCK-FORGERY-001',
      metrics: {
        sifted_count: 500,
        error_count: 155,
        qber: 0.310,
        threshold: 0.100,
        chsh: 2.05,
        baseline_qber: 0.020
      },
      checks: {
        qber_pass: false,
        chsh_pass: true,
        session_valid: false,
        threshold_pass: false
      },
      security: {
        attack_detected: true,
        attack_type: 'FORGERY',
        decision: 'REJECT'
      },
      reason: 'Digital signature forgery detected: Document hash does not correlate with quantum feed-forward states. QBER (0.310) exceeds allowable bounds.',
      request_id: 'REQ-000004',
      timestamp: '2026-08-25T21:26:50Z'
    },
    nodes: [
      { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'Unauthorized signature payload detected', status: 'Alert', endpoint: 'node-alice.local' },
      { id: '2', name: 'Bob', role: 'Verification', last_event: 'Verification key mismatch', status: 'Alert', endpoint: 'node-bob.local' },
      { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
      { id: '4', name: 'Eve', role: 'Adversary monitoring', last_event: 'Classical signature tampering injected', status: 'Alert', endpoint: 'node-eve.tap' },
      { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated (REJECT)', status: 'Alert', endpoint: 'soc-engine.core' },
      { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Simulation completed', status: 'Ready', endpoint: 'qiskit-aer.core' }
    ],
    events: [
      { id: 'e1', timestamp: '21:25:00', event_type: 'SESSION_CREATED', description: 'Session created for quantum signature verification.', node: 'Arbitrator', severity: 'info' },
      { id: 'e2', timestamp: '21:25:40', event_type: 'SIGNATURE_TAMPERING_DETECTED', description: 'Classical hash mismatch with quantum state feed-forward.', node: 'Alice', severity: 'error' },
      { id: 'e3', timestamp: '21:26:20', event_type: 'QBER_CALCULATED', description: 'Observed QBER: 0.310 (155 errors / 500 bits).', node: 'Security Engine', severity: 'error' },
      { id: 'e4', timestamp: '21:26:50', event_type: 'DECISION_GENERATED', description: 'Security decision REJECT emitted. Signature forgery detected.', node: 'Security Engine', severity: 'error' }
    ],
    telemetry: [
      { id: 't1', module: 'Crypto', component: 'Signature Verifier', operation: 'validate_hash_signature', duration_ms: 14, status: 'FAILURE', timestamp: '21:25:40' },
      { id: 't2', module: 'Security', component: 'QBER Analyzer', operation: 'calculate_qber', duration_ms: 8, status: 'FAILURE', timestamp: '21:26:20' }
    ],
    qberRuns: [
      { run: 1, observed: 0.020, baseline: 0.020, threshold: 0.100 },
      { run: 2, observed: 0.050, baseline: 0.020, threshold: 0.100 },
      { run: 3, observed: 0.180, baseline: 0.020, threshold: 0.100 },
      { run: 4, observed: 0.280, baseline: 0.020, threshold: 0.100 },
      { run: 5, observed: 0.320, baseline: 0.020, threshold: 0.100 },
      { run: 6, observed: 0.295, baseline: 0.020, threshold: 0.100 },
      { run: 7, observed: 0.310, baseline: 0.020, threshold: 0.100 }
    ]
  },

  REPLAY: {
    session: {
      session_id: 'MOCK-REPLAY-001',
      epr_pair_count: 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'REJECTED',
      created_at: '2026-08-25T21:30:00Z',
      key_length: 256,
      baseline_qber: 0.019,
      alpha: 0.000001,
      protocol_version: '1.0'
    },
    signature: {
      signature_id: 'SIG-000001',
      document_name: 'contract.pdf',
      hash_algorithm: 'SHA-256',
      document_hash: 'a8f91c9e7428e21a367469a531b79f64a78129038276f5b9d21c435508a47812',
      bit_length: 256,
      status: 'REJECTED',
      timestamp: '2026-08-25T21:11:15Z'
    },
    report: {
      session_id: 'MOCK-REPLAY-001',
      metrics: {
        sifted_count: 500,
        error_count: 9,
        qber: 0.019,
        threshold: 0.100,
        chsh: 2.68,
        baseline_qber: 0.019
      },
      checks: {
        qber_pass: true,
        chsh_pass: true,
        session_valid: false,
        threshold_pass: true
      },
      security: {
        attack_detected: true,
        attack_type: 'REPLAY',
        decision: 'REJECT'
      },
      reason: 'Session replay attack detected: Nonce validation failed and signature timestamp (21:11:15) does not match active session epoch (21:30:00).',
      request_id: 'REQ-000005',
      timestamp: '2026-08-25T21:31:10Z'
    },
    nodes: [
      { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'Replay timestamp invalid', status: 'Alert', endpoint: 'node-alice.local' },
      { id: '2', name: 'Bob', role: 'Verification', last_event: 'Session nonce rejection', status: 'Alert', endpoint: 'node-bob.local' },
      { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
      { id: '4', name: 'Eve', role: 'Adversary monitoring', last_event: 'Stale signature replay transmitted', status: 'Alert', endpoint: 'node-eve.tap' },
      { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated (REJECT)', status: 'Alert', endpoint: 'soc-engine.core' },
      { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Simulation completed', status: 'Ready', endpoint: 'qiskit-aer.core' }
    ],
    events: [
      { id: 'e1', timestamp: '21:30:00', event_type: 'SESSION_CREATED', description: 'Session created for quantum signature verification.', node: 'Arbitrator', severity: 'info' },
      { id: 'e2', timestamp: '21:30:30', event_type: 'NONCE_VERIFICATION_FAILED', description: 'Replay detected: Nonce already consumed in previous session.', node: 'Bob', severity: 'error' },
      { id: 'e3', timestamp: '21:31:00', event_type: 'SESSION_VALIDATION_FAILED', description: 'Session validity flag marked false by Arbitrator.', node: 'Arbitrator', severity: 'error' },
      { id: 'e4', timestamp: '21:31:10', event_type: 'DECISION_GENERATED', description: 'Security decision REJECT emitted. Protocol replay rejected.', node: 'Security Engine', severity: 'error' }
    ],
    telemetry: [
      { id: 't1', module: 'Auth', component: 'Nonce Validator', operation: 'verify_nonce_freshness', duration_ms: 4, status: 'FAILURE', timestamp: '21:30:30' },
      { id: 't2', module: 'Security', component: 'Session Verifier', operation: 'validate_session_token', duration_ms: 6, status: 'FAILURE', timestamp: '21:31:00' }
    ],
    qberRuns: [
      { run: 1, observed: 0.018, baseline: 0.019, threshold: 0.100 },
      { run: 2, observed: 0.020, baseline: 0.019, threshold: 0.100 },
      { run: 3, observed: 0.019, baseline: 0.019, threshold: 0.100 },
      { run: 4, observed: 0.019, baseline: 0.019, threshold: 0.100 },
      { run: 5, observed: 0.018, baseline: 0.019, threshold: 0.100 },
      { run: 6, observed: 0.020, baseline: 0.019, threshold: 0.100 },
      { run: 7, observed: 0.019, baseline: 0.019, threshold: 0.100 }
    ]
  },

  PNS: {
    session: {
      session_id: 'MOCK-PNS-001',
      epr_pair_count: 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'AUDITED',
      created_at: '2026-08-25T21:35:00Z',
      key_length: 256,
      baseline_qber: 0.020,
      alpha: 0.000001,
      protocol_version: '1.0'
    },
    signature: {
      signature_id: 'SIG-000005',
      document_name: 'sensitive_dispatch.pdf',
      hash_algorithm: 'SHA-256',
      document_hash: '57b29a1038e945c1102ba44510294e8a10923847120349bca102948e91024bc9',
      bit_length: 256,
      status: 'AUDITED',
      timestamp: '2026-08-25T21:35:20Z'
    },
    report: {
      session_id: 'MOCK-PNS-001',
      metrics: {
        sifted_count: 500,
        error_count: 22,
        qber: 0.045,
        threshold: 0.100,
        chsh: 2.38,
        baseline_qber: 0.020,
        signal_error_rate: 0.018,
        decoy_error_rate: 0.087
      },
      checks: {
        qber_pass: true,
        chsh_pass: true,
        session_valid: true,
        threshold_pass: true,
        decoy_pass: false
      },
      security: {
        attack_detected: true,
        attack_type: 'PNS',
        decision: 'FLAG'
      },
      reason: 'Decoy state anomaly detected: Signal error rate (0.018) is nominal, but Decoy state error rate (0.087) indicates potential Photon Number Splitting (PNS) tapping on multi-photon pulses. Additional investigation recommended.',
      request_id: 'REQ-000006',
      timestamp: '2026-08-25T21:36:30Z'
    },
    nodes: [
      { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'Decoy intensity pulse modulation active', status: 'Active', endpoint: 'node-alice.local' },
      { id: '2', name: 'Bob', role: 'Verification', last_event: 'Decoy yield discrepancy recorded', status: 'Alert', endpoint: 'node-bob.local' },
      { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
      { id: '4', name: 'Eve', role: 'Adversary monitoring', last_event: 'Multi-photon beam splitting detected', status: 'Alert', endpoint: 'node-eve.tap' },
      { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated (FLAG)', status: 'Alert', endpoint: 'soc-engine.core' },
      { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Decoy state simulation completed', status: 'Ready', endpoint: 'qiskit-aer.core' }
    ],
    events: [
      { id: 'e1', timestamp: '21:35:00', event_type: 'SESSION_CREATED', description: 'Session created with decoy-state protocol enabled.', node: 'Arbitrator', severity: 'info' },
      { id: 'e2', timestamp: '21:35:45', event_type: 'DECOY_ANALYSIS_STARTED', description: 'Evaluating signal vs decoy transmission statistics.', node: 'Security Engine', severity: 'info' },
      { id: 'e3', timestamp: '21:36:10', event_type: 'DECOY_ANOMALY_FLAGGED', description: 'Decoy error rate (0.087) deviates from expected single-photon yield.', node: 'Security Engine', severity: 'warning' },
      { id: 'e4', timestamp: '21:36:30', event_type: 'DECISION_GENERATED', description: 'Security decision FLAG emitted. Potential PNS attack flagged.', node: 'Security Engine', severity: 'warning' }
    ],
    telemetry: [
      { id: 't1', module: 'Quantum', component: 'Decoy Modulator', operation: 'modulate_laser_intensity', duration_ms: 32, status: 'SUCCESS', timestamp: '21:35:20' },
      { id: 't2', module: 'Security', component: 'Decoy Analyzer', operation: 'compare_yield_statistics', duration_ms: 18, status: 'SUCCESS', timestamp: '21:36:10' }
    ],
    qberRuns: [
      { run: 1, observed: 0.020, baseline: 0.020, threshold: 0.100 },
      { run: 2, observed: 0.025, baseline: 0.020, threshold: 0.100 },
      { run: 3, observed: 0.032, baseline: 0.020, threshold: 0.100 },
      { run: 4, observed: 0.041, baseline: 0.020, threshold: 0.100 },
      { run: 5, observed: 0.044, baseline: 0.020, threshold: 0.100 },
      { run: 6, observed: 0.046, baseline: 0.020, threshold: 0.100 },
      { run: 7, observed: 0.045, baseline: 0.020, threshold: 0.100 }
    ]
  }
};
