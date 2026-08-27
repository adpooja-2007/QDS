import {
  QuantumSession,
  SecurityReport,
  SignatureInfo,
  SystemNode,
  ProtocolEvent,
  TelemetryEvent,
  CreateSessionPayload,
  MockScenarioType
} from '../types';
import { MOCK_SCENARIOS, MockScenarioData } from '../data/mock/fixtures';

class MockApiClient {
  private currentScenario: MockScenarioType = 'CLEAN';
  private currentSessionState: MockScenarioData;

  constructor() {
    this.currentSessionState = JSON.parse(JSON.stringify(MOCK_SCENARIOS.CLEAN));
  }

  public setScenario(scenario: MockScenarioType): void {
    this.currentScenario = scenario;
    this.currentSessionState = JSON.parse(JSON.stringify(MOCK_SCENARIOS[scenario]));
  }

  public getScenario(): MockScenarioType {
    return this.currentScenario;
  }

  public async getHealth(): Promise<{ status: string; engine: string; version: string }> {
    return { status: 'healthy', engine: 'Quantum Security Engine (Mock Adapter)', version: '1.0.0' };
  }

  public async getNodes(): Promise<SystemNode[]> {
    return this.currentSessionState.nodes;
  }

  public async createSession(payload: CreateSessionPayload): Promise<QuantumSession> {
    const id = `QSEC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newSession: QuantumSession = {
      session_id: id,
      epr_pair_count: payload.epr_pair_count || 1000,
      state_type: 'PHI_PLUS',
      generator: 'Qiskit',
      simulator: 'Aer',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      key_length: payload.key_length || 256,
      baseline_qber: payload.baseline_qber || 0.02,
      alpha: payload.alpha || 0.000001,
      protocol_version: payload.protocol_version || '1.0'
    };

    this.currentSessionState.session = newSession;
    this.currentSessionState.report.session_id = id;
    this.currentSessionState.events = [
      {
        id: `e-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        event_type: 'SESSION_CREATED',
        description: `Quantum security session ${id} initialized with ${newSession.epr_pair_count} EPR pairs.`,
        node: 'Arbitrator',
        severity: 'info'
      }
    ];

    return newSession;
  }

  public async getSession(sessionId?: string): Promise<QuantumSession> {
    if (sessionId && this.currentSessionState.session.session_id !== sessionId) {
      this.currentSessionState.session.session_id = sessionId;
    }
    return this.currentSessionState.session;
  }

  public async runSession(sessionId: string): Promise<{ session_id: string; status: string; steps_completed: string[] }> {
    this.currentSessionState.session.status = 'SIFTED';
    this.currentSessionState.events.push({
      id: `e-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      event_type: 'VERIFICATION_WORKFLOW_EXECUTED',
      description: 'Quantum state verification and basis sifting completed.',
      node: 'Bob',
      severity: 'success'
    });
    return {
      session_id: sessionId,
      status: 'SIFTED',
      steps_completed: ['EPR_READY', 'SIGNED', 'VERIFIED', 'SIFTED']
    };
  }

  public async signDocument(payload: { session_id: string; document_name: string }): Promise<SignatureInfo> {
    this.currentSessionState.signature.document_name = payload.document_name;
    this.currentSessionState.session.status = 'SIGNED';
    return this.currentSessionState.signature;
  }

  public async verifySession(_payload: { session_id: string }): Promise<{ verified: boolean; status: string }> {
    this.currentSessionState.session.status = 'VERIFIED';
    return { verified: true, status: 'VERIFIED' };
  }

  public async runSecurityAudit(sessionId: string): Promise<SecurityReport> {
    const scenario = this.currentScenario;
    const fixtureReport = MOCK_SCENARIOS[scenario].report;
    
    this.currentSessionState.session.status = fixtureReport.security.decision === 'REJECT' ? 'REJECTED' : 'AUDITED';
    this.currentSessionState.report = {
      ...fixtureReport,
      session_id: sessionId || this.currentSessionState.session.session_id,
      timestamp: new Date().toLocaleTimeString()
    };

    this.currentSessionState.events.push({
      id: `e-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      event_type: 'SECURITY_AUDIT_COMPLETED',
      description: `Security audit completed. Decision: ${fixtureReport.security.decision}.`,
      node: 'Security Engine',
      severity: fixtureReport.security.decision === 'ACCEPT' ? 'success' : fixtureReport.security.decision === 'FLAG' ? 'warning' : 'error'
    });

    return this.currentSessionState.report;
  }

  public async getSecurityReport(sessionId?: string): Promise<SecurityReport> {
    const r = this.currentSessionState.report;
    if (sessionId) {
      r.session_id = sessionId;
    }
    return r;
  }

  public async getEvents(_sessionId?: string): Promise<ProtocolEvent[]> {
    return this.currentSessionState.events;
  }

  public async getTelemetry(_sessionId?: string): Promise<TelemetryEvent[]> {
    return this.currentSessionState.telemetry;
  }

  public async getQberRuns(_sessionId?: string): Promise<{ run: number; observed: number; baseline: number; threshold: number }[]> {
    return this.currentSessionState.qberRuns;
  }

  public async closeSession(sessionId: string): Promise<{ session_id: string; status: string }> {
    this.currentSessionState.session.status = 'CLOSED';
    return { session_id: sessionId, status: 'CLOSED' };
  }

  public resetToClean(): void {
    this.setScenario('CLEAN');
  }
}

export const mockApiClient = new MockApiClient();
