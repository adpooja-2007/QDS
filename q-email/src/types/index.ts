export * from './sentinel';

// ─── Legacy & Adapter Compatibility Types ────────────────────────────────────
export type SessionState =
  | 'CREATED' | 'EPR_READY' | 'SIGNED' | 'MEASURED' | 'VERIFIED'
  | 'SIFTED' | 'AUDITED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED'
  | 'ACTIVE' | 'EXPIRED';

export interface Session {
  session_id: string;
  state: SessionState;
  epr_pair_count?: number;
  protocol_version?: string;
  baseline_qber?: number;
  threshold?: number;
  alpha?: number;
  created_at: string;
  updated_at: string;
  qber?: number;
  document_name?: string;
  status?: string;
}

export type DecisionType = 'ACCEPT' | 'REJECT' | 'FLAG' | 'PENDING';

export interface SecurityChecks {
  qber_pass?: boolean;
  chsh_pass?: boolean;
  session_valid?: boolean;
  threshold_pass?: boolean;
  decoy_pass?: boolean;
}

export interface SecurityDecision {
  decision: DecisionType | string;
  reason?: string;
  metrics?: {
    qber?: number;
    baseline_qber?: number;
    threshold?: number;
    chsh?: number;
    sifted_count?: number;
    error_count?: number;
    [key: string]: any;
  };
  checks?: SecurityChecks;
  attack_detected?: boolean;
  attack_type?: string | null;
  evaluated_at?: string;
}

export type TelemetryModule =
  | 'QUANTUM' | 'ALICE' | 'BOB' | 'SECURITY' | 'SESSION' | 'SYSTEM'
  | 'Quantum' | 'Security' | 'Crypto' | 'Auth' | 'Engine' | string;

export type TelemetryStatus = 'COMPLETED' | 'RUNNING' | 'FAILED' | 'PENDING' | string;

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  module: TelemetryModule;
  component?: string;
  event?: string;
  operation?: string;
  state?: TelemetryStatus;
  status?: string;
  duration_ms?: number | null;
  latency_ms?: number;
  metadata?: Record<string, unknown>;
}

export type NodeState = 'READY' | 'ACTIVE' | 'PROCESSING' | 'IDLE' | 'ERROR' | 'ONLINE' | 'STANDBY';

export interface SystemNode {
  id: string;
  name: string;
  role: string;
  last_event?: string;
  state?: NodeState;
  status?: string;
  endpoint?: string;
  uptime?: string;
  latency_ms?: number;
  requests_count?: number;
  qubit_fidelity?: number;
  memory_buffer_mb?: number;
}

export interface AnalyticsPoint {
  run: number;
  label: string;
  qber_observed: number;
  qber_baseline: number;
  threshold: number;
  chsh: number;
}

export type CommunicationStatus =
  | 'INITIALIZING'
  | 'EPR_DISTRIBUTION'
  | 'STATE_PREPARATION'
  | 'MEASUREMENT'
  | 'CLASSICAL_COMM'
  | 'VERIFICATION'
  | 'COMPLETED';

export interface CommunicationState {
  status: CommunicationStatus;
  alice: AliceState;
  bob: BobState;
  channel_qber: number;
  packets_sent: number;
  packets_verified: number;
}

export interface AliceState {
  session_id: string;
  state: string;
  basis: string;
  measurement: string;
}

export interface BobState {
  session_id: string;
  state: string;
  basis: string;
  measurement: string;
}

export interface ProtocolStep {
  id: number;
  code?: string;
  label?: string;
  description?: string;
  node?: string;
  status?: string;
  duration_ms?: number;
  latency_ms?: number;
  name?: string;
  short_code?: string;
}

export interface DashboardData {
  session: Session;
  decision: SecurityDecision;
  recent_events: TelemetryEvent[];
}

export type MockScenarioType = 'CLEAN' | 'NORMAL_NOISE' | 'MITM' | 'FORGERY' | 'REPLAY' | 'PNS';

export interface CreateSessionPayload {
  session_id?: string;
  document_name?: string;
  num_qubits?: number;
  noise_level?: number;
  epr_pair_count?: number;
  key_length?: number;
  baseline_qber?: number;
  alpha?: number;
  protocol_version?: string;
}

export interface SignatureInfo {
  signature_id: string;
  document_name: string;
  hash_algorithm?: string;
  document_hash: string;
  bit_length?: number;
  status: string;
  timestamp?: string;
}

export interface SecurityReport {
  session_id: string;
  timestamp?: string;
  request_id?: string;
  reason?: string;
  security?: any;
  metrics?: {
    sifted_count?: number;
    error_count?: number;
    qber?: number;
    threshold?: number;
    chsh?: number;
    baseline_qber?: number;
    signal_error_rate?: number;
    [key: string]: any;
  };
  checks?: {
    qber_pass?: boolean;
    chsh_pass?: boolean;
    session_valid?: boolean;
    threshold_pass?: boolean;
    decoy_pass?: boolean;
    [key: string]: any;
  };
  decision?: {
    overall?: string;
    qber_pass?: boolean;
    chsh_pass?: boolean;
    [key: string]: any;
  };
}

export interface ProtocolEvent {
  id: string;
  timestamp: string;
  event_type: string;
  node?: string;
  status?: string;
  detail?: string;
  description?: string;
  severity?: string;
  [key: string]: any;
}



