// ============================================================================
// QDS SENTINEL — QUANTUM DIGITAL SIGNATURE SECURITY OPERATIONS CENTER
// SIH 2026 · Problem Statement 26141 · Egreen Quanta
// ============================================================================

export type VerdictType = 'ACCEPT' | 'REJECT' | 'INVESTIGATE' | 'IN_PROGRESS';
export type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NodeStatusType = 'ONLINE' | 'ACTIVE' | 'CALIBRATING' | 'STANDBY' | 'DEGRADED';
export type ProtocolStepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FAILED';

export interface SecurityMetrics {
  qber: number;                 // e.g. 0.024 (2.4%)
  baseline_qber: number;        // e.g. 0.021 (2.1%)
  hoeffding_threshold: number;  // statistical bound, e.g. 0.052 (5.2%)
  chsh_score: number;           // e.g. 2.74 (Tsirelson bound 2.828, Classical bound 2.000)
  classical_limit?: number;     // 2.000
  tsirelson_bound?: number;     // 2.828
  confidence_level?: number;    // 1 - alpha, e.g. 0.999 (99.9%)
  alpha?: number;               // 0.001
  sifted_bits?: number;         // e.g. 3840
  error_bits?: number;          // e.g. 92
  total_pulses?: number;        // e.g. 8192
  threshold?: number;
  chsh?: number;
  sifted_count?: number;
  error_count?: number;
  [key: string]: any;
}


export interface SecurityVerdict {
  verdict: VerdictType;
  threat_detected: boolean;
  threat_type: string | null;   // e.g. "EAVESDROPPING_INTERCEPT_RESEND", "SIGNATURE_FORGERY", "DECOY_PNS_ANOMALY"
  reason: string;
  evaluated_at: string;
  hoeffding_pass: boolean;
  chsh_pass: boolean;
  signature_pass: boolean;
  security_score: number;       // 0 - 100, e.g. 96
}

export interface QuantumSession {
  session_id: string;
  document_name?: string;
  document_hash?: string;
  file_size_kb?: number;
  status?: any;
  created_at?: string;
  updated_at?: string;
  metrics?: SecurityMetrics | any;
  verdict?: SecurityVerdict | any;
  sender?: string;
  receiver?: string;
  arbitrator?: string;
  generator?: string;
  simulator?: string;
  key_length?: number;
  alpha?: number;
  protocol_version?: string;
  epr_pair_count?: number;
  state_type?: string;
  baseline_qber?: number;
  [key: string]: any;
}


export interface PipelineStep {
  id: number;
  name: string;
  short_code: string;
  description: string;
  node: string;
  status: ProtocolStepStatus;
  latency_ms: number;
  details?: Record<string, string | number>;
}

export interface QuantumNode {
  id: string;
  name: string;
  role: 'ARBITRATOR' | 'SENDER' | 'RECEIVER' | 'THREAT_ENGINE';
  status: NodeStatusType;
  endpoint: string;
  latency_ms: number;
  requests_count: number;
  last_activity: string;
  qubit_fidelity: number;
  memory_buffer_mb: number;
}

export interface SecurityIncident {
  id: string;
  session_id: string;
  event: string;
  severity: SeverityType;
  qber: number;
  chsh: number;
  timestamp: string;
  threat_category: string;
  summary: string;
  evidence: {
    qber_observed: number;
    hoeffding_threshold: number;
    chsh_score: number;
    classical_limit: number;
    statistical_p_value: number;
    affected_qubits: number;
  };
  detection_timeline: {
    step: string;
    time: string;
    state: 'PASS' | 'FAIL' | 'WARN';
    detail: string;
  }[];
  final_assessment: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  subsystem: 'QUANTUM_CORE' | 'THREAT_ENGINE' | 'ARBITRATOR' | 'ALICE_NODE' | 'BOB_NODE' | 'DATABASE';
  event_type: string;
  latency_ms: number;
  status_code: number;
  message: string;
}

export interface SystemPerformance {
  api_latency_ms: number;
  requests_total: number;
  error_rate_pct: number;
  quantum_core_ops_sec: number;
  threat_engine_latency_ms: number;
  active_sessions_count: number;
  verified_signatures_count: number;
  threats_detected_count: number;
}

export interface HistoricalPoint {
  time: string;
  qber: number;
  baseline: number;
  hoeffding: number;
  chsh: number;
  classical_limit: number;
  session_id: string;
}
