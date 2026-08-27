import React, { useState } from 'react';
import { useSession } from '../hooks/useSession';
import { useSecurityReport } from '../hooks/useSecurityReport';
import { useEvents } from '../hooks/useEvents';
import { useTelemetry } from '../hooks/useTelemetry';

import { AppHeader } from '../components/layout/AppHeader';
import { Navigation, NavigationTab } from '../components/layout/Navigation';
import { SecurityDecisionBanner } from '../components/decision/SecurityDecisionBanner';
import { ContextualSecurityAlert } from '../components/decision/ContextualSecurityAlert';
import { PrimaryMetricCards } from '../components/metrics/PrimaryMetricCards';
import { QuantumStateScene } from '../components/quantum/QuantumStateScene';
import { QBERChart } from '../components/charts/QBERChart';
import { CHSHIndicator } from '../components/charts/CHSHIndicator';
import { CHSH3D } from '../components/charts/CHSH3D';
import { ProtocolFlowDiagram } from '../components/protocol/ProtocolFlowDiagram';
import { QuantumSessionInfo } from '../components/session/QuantumSessionInfo';
import { DigitalSignatureInfo } from '../components/session/DigitalSignatureInfo';
import { SecurityVerificationTable } from '../components/verification/SecurityVerificationTable';
import { NodeTable } from '../components/nodes/NodeTable';
import { NodeNetwork3D } from '../components/nodes/NodeNetwork3D';
import { ProtocolTimeline } from '../components/timeline/ProtocolTimeline';
import { TelemetryTable } from '../components/timeline/TelemetryTable';
import { SecurityAuditDetails } from '../components/session/SecurityAuditDetails';
import { SessionControls } from '../components/session/SessionControls';
import { CreateSessionModal } from '../components/session/CreateSessionModal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [show3dCHSH, setShow3dCHSH] = useState<boolean>(false);

  const {
    session,
    loading: sessionLoading,
    error: sessionError,
    activeScenario,
    fetchSession,
    createSession,
    runVerification,
    closeSession,
    switchScenario,
    resetSession,
    isMockMode
  } = useSession();

  const {
    report,
    signature,
    qberRuns,
    loading: reportLoading,
    auditInProgress,
    fetchReport,
    runSecurityAudit
  } = useSecurityReport(session?.session_id);

  const { events, fetchEvents } = useEvents(session?.session_id);
  const { telemetry, nodes, fetchTelemetry } = useTelemetry(session?.session_id);

  const handleScenarioChange = (sc: any) => {
    switchScenario(sc);
    fetchReport();
    fetchEvents();
    fetchTelemetry();
  };

  const handleRunAudit = async () => {
    await runSecurityAudit();
    await fetchSession();
    await fetchEvents();
    await fetchTelemetry();
  };

  const handleRunVerification = async () => {
    await runVerification();
    await fetchReport();
    await fetchEvents();
    await fetchTelemetry();
  };

  const handleResetSession = () => {
    resetSession();
    fetchReport();
    fetchEvents();
    awaitRunPostReset();
  };

  const awaitRunPostReset = async () => {
    await fetchReport();
    await fetchEvents();
    await fetchTelemetry();
  };

  const handleCreateSessionSubmit = async (payload: any) => {
    await createSession(payload);
    await fetchReport();
    await fetchEvents();
    await fetchTelemetry();
  };

  if (sessionLoading && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Initializing Quantum Security Console..." subtext="Connecting to Security SOC Node" />
      </div>
    );
  }

  if (sessionError && !isMockMode) {
    return (
      <div className="min-h-screen bg-background p-8 max-w-2xl mx-auto flex items-center justify-center">
        <ErrorState
          title="Backend Unavailable"
          message="Unable to retrieve security data. Please ensure the FastAPI backend is running at http://localhost:8000/api/v1."
          code="SERVICE_UNAVAILABLE"
          onRetry={() => fetchSession()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-brand-dark flex flex-col">
      {/* Top Header */}
      <AppHeader
        session={session}
        lastUpdated={report?.timestamp || '21:14:12'}
        activeScenario={activeScenario}
        onScenarioChange={handleScenarioChange}
        onOpenCreateSession={() => setIsCreateModalOpen(true)}
        isMockMode={isMockMode}
      />

      {/* Top Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main Security Decision Section (Priority 1) */}
        <SecurityDecisionBanner
          decision={report?.security?.decision || report?.decision?.overall || 'ACCEPT'}
          reason={report?.reason}
          timestamp={report?.timestamp}
          requestId={report?.request_id}
        />

        {/* Contextual Security Alert (Only shown when attack detected or REJECT/FLAG) */}
        <ContextualSecurityAlert report={report} />

        {/* Overview Tab Content */}
        {(activeTab === 'overview' || activeTab === 'protocol' || activeTab === 'security' || activeTab === 'telemetry') && (
          <div className="space-y-6">
            {/* 3D Quantum Session Topology (Scientific Layer) */}
            <QuantumStateScene
              sessionState={(session?.status as any) || 'AUDITED'}
              decision={report?.security?.decision || report?.decision?.overall || 'ACCEPT'}
              sessionId={session?.session_id || 'QSEC-2026-000001'}
              auditRunning={auditInProgress}
            />


            {/* Primary Metric Cards (Priority 1) */}
            <PrimaryMetricCards report={report} session={session} />

            {/* 2-Column: QBER Analysis & CHSH Correlation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QBERChart report={report} runs={qberRuns} />
              <div className="space-y-3 flex flex-col justify-between">
                <div className="relative">
                  <CHSHIndicator report={report} />
                  <button
                    onClick={() => setShow3dCHSH(!show3dCHSH)}
                    className="absolute top-5 right-5 text-[11px] font-mono-tech text-brand-indigo hover:text-brand-indigo-hover underline"
                  >
                    {show3dCHSH ? 'Hide 3D View' : 'Show 3D Vector View'}
                  </button>
                </div>
                {show3dCHSH && <CHSH3D chsh={report?.metrics?.chsh ?? 2.74} />}
              </div>
            </div>

            {/* 2-Column: Protocol Flow & Quantum Session Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProtocolFlowDiagram sessionState={(session?.status as any) || 'AUDITED'} />
              </div>
              <div className="lg:col-span-1">
                <QuantumSessionInfo session={session} onOpenCreate={() => setIsCreateModalOpen(true)} />
              </div>
            </div>

            {/* 2-Column: Security Verification Table & Digital Signature */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SecurityVerificationTable report={report} />
              </div>
              <div className="lg:col-span-1">
                <DigitalSignatureInfo signature={signature} />
              </div>
            </div>

            {/* System Nodes & 3D Spatial Topology */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NodeTable nodes={nodes} />
              </div>
              <div className="lg:col-span-1 soc-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-brand-dark">3D Spatial Topology</h4>
                  <span className="text-[10px] font-mono-tech text-brand-muted">Spatial Mesh</span>
                </div>
                <NodeNetwork3D />
              </div>
            </div>

            {/* Protocol Timeline & Execution Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProtocolTimeline events={events} />
              <TelemetryTable telemetry={telemetry} />
            </div>

            {/* Security Audit Details */}
            <SecurityAuditDetails report={report} />

            {/* Session Controls */}
            <SessionControls
              sessionState={(session?.status as any) || 'AUDITED'}
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onRunVerification={handleRunVerification}
              onRunAudit={handleRunAudit}
              onReset={handleResetSession}
              onCloseSession={closeSession}
              loading={sessionLoading || reportLoading}
              auditRunning={auditInProgress}
            />

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-surface py-4 text-center text-xs text-brand-muted mt-8">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SIH 2026 · Problem Statement 26141 · Sponsored by <strong>Egreen Quanta</strong>
          </span>
          <span className="font-mono-tech text-[11px]">
            Quantum-Inspired Cyber Threat Detection · React Cyber-SOC Console v1.0
          </span>
        </div>
      </footer>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSessionSubmit}
        loading={sessionLoading}
      />
    </div>
  );
};
