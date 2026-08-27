import React from 'react';
import {
  QuantumSession,
  HistoricalPoint,
  SystemPerformance,
  TelemetryLog,
} from '../../types/sentinel';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  Zap,
  Lock,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  KeyRound,
  RefreshCw,
} from 'lucide-react';


interface DashboardProps {
  activeSession: QuantumSession;
  historicalData: HistoricalPoint[];
  performance: SystemPerformance;
  telemetryLogs: TelemetryLog[];
  onNavigate?: (page: any) => void;
  onGenerateSignature?: (name: string, size: number) => Promise<any>;
  isLoading?: boolean;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  activeSession,
  historicalData,
  performance,
  telemetryLogs,
  onNavigate,
  onGenerateSignature,
  isLoading = false,
}) => {
  const { metrics, verdict } = activeSession;
  const isAccept = verdict.verdict === 'ACCEPT';


  return (
    <div className="space-y-5 pb-8 max-w-[1600px] mx-auto">
      {/* ─── Threat Alert Banner (Only when threat/reject) ─── */}
      {!isAccept && (
        <div className="bg-[#FEF3F2] border-l-4 border-[#D92D20] border-y border-r border-[#FECDCA] rounded-r-md p-3.5 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="text-[#D92D20] shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold font-mono uppercase text-[#D92D20]">
                SECURITY ASSESSMENT — THREAT DETECTED
              </span>
              <span className="text-[10px] font-mono bg-[#FEE4E2] text-[#B42318] px-2 py-0.5 rounded font-semibold">
                {verdict.threat_type || 'ANOMALY'}
              </span>
            </div>
            <p className="text-[12px] text-[#475467] mt-1 leading-relaxed">
              {verdict.reason}
            </p>
          </div>
        </div>
      )}

      {/* ─── Compact KPI Grid (6 Cards) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Active Sessions */}
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-[#667085] mb-1.5">
            <span className="sentinel-label text-[10px]">ACTIVE SESSIONS</span>
            <Layers size={14} className="text-[#4169D8]" />
          </div>
          <div className="text-[20px] font-bold font-mono text-[#182033]">
            {performance.active_sessions_count}
          </div>
          <div className="text-[11px] text-[#667085] mt-1 flex items-center gap-1 font-mono">
            <span>Core cluster online</span>
          </div>
        </div>

        {/* Verified Signatures */}
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-[#667085] mb-1.5">
            <span className="sentinel-label text-[10px]">VERIFIED SIGNATURES</span>
            <CheckCircle2 size={14} className="text-[#4169D8]" />
          </div>
          <div className="text-[20px] font-bold font-mono text-[#182033]">
            {performance.verified_signatures_count}
          </div>
          <div className="text-[11px] text-[#4169D8] mt-1 flex items-center gap-0.5 font-mono">
            <ArrowUpRight size={12} />
            <span>99.8% validity</span>
          </div>
        </div>

        {/* Threats Detected */}
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-[#667085] mb-1.5">
            <span className="sentinel-label text-[10px]">THREATS DETECTED</span>
            <AlertTriangle size={14} className={performance.threats_detected_count > 0 ? 'text-[#D92D20]' : 'text-[#667085]'} />
          </div>
          <div className={`text-[20px] font-bold font-mono ${performance.threats_detected_count > 0 ? 'text-[#D92D20]' : 'text-[#182033]'}`}>
            {performance.threats_detected_count}
          </div>
          <div className="text-[11px] text-[#667085] mt-1 font-mono">
            <span>Statistical alarms</span>
          </div>
        </div>

        {/* Current QBER */}
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-[#667085] mb-1.5">
            <span className="sentinel-label text-[10px]">CURRENT QBER</span>
            <Activity size={14} className="text-[#4169D8]" />
          </div>
          <div className={`text-[20px] font-bold font-mono ${metrics.qber > metrics.hoeffding_threshold ? 'text-[#D92D20]' : 'text-[#182033]'}`}>
            {(metrics.qber * 100).toFixed(2)}%
          </div>
          <div className="text-[11px] text-[#667085] mt-1 font-mono">
            <span>Bound: ≤ {(metrics.hoeffding_threshold * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* CHSH Score */}
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-[#667085] mb-1.5">
            <span className="sentinel-label text-[10px]">CHSH SCORE</span>
            <Zap size={14} className="text-[#6C63D9]" />
          </div>
          <div className={`text-[20px] font-bold font-mono ${metrics.chsh_score < metrics.classical_limit ? 'text-[#D92D20]' : 'text-[#6C63D9]'}`}>
            {metrics.chsh_score.toFixed(3)}
          </div>
          <div className="text-[11px] text-[#667085] mt-1 font-mono">
            <span>Bell limit: &gt; 2.000</span>
          </div>
        </div>

        {/* Security Score */}
        <div className="sentinel-card p-3.5">
          <div className="flex items-center justify-between text-[#667085] mb-1.5">
            <span className="sentinel-label text-[10px]">SECURITY SCORE</span>
            <Lock size={14} className="text-[#4169D8]" />
          </div>
          <div className="text-[20px] font-bold font-mono text-[#182033]">
            {verdict.security_score}/100
          </div>
          <div className="text-[11px] text-[#667085] mt-1 font-mono">
            <span>{isAccept ? 'Optimal state' : 'Compromised'}</span>
          </div>
        </div>
      </div>

      {/* ─── Quick Document Signature Trigger Bar ─── */}
      <div className="sentinel-card p-3.5 bg-gradient-to-r from-[#F8FAFF] to-white border border-[#D0DCFC] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] border border-[#D0DCFC] flex items-center justify-center text-[#4169D8] shrink-0">
            <FileText size={16} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#182033] flex items-center gap-2">
              <span>Quick Quantum Document Signer</span>
              <span className="text-[10px] font-mono bg-[#EEF3FF] text-[#4169D8] px-2 py-0.5 rounded font-semibold">
                8-STAGE EPR PIPELINE
              </span>
            </div>
            <div className="text-[11px] text-[#667085] font-mono mt-0.5">
              Active: <span className="font-semibold text-[#182033]">{activeSession.document_name}</span> ({activeSession.session_id})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {onGenerateSignature && (
            <button
              onClick={() => onGenerateSignature('dispatch_mission_order_' + Math.floor(Math.random()*900 + 100) + '.sig', 72.4)}
              disabled={isLoading}
              className="sentinel-btn sentinel-btn-primary text-[11px] gap-1.5 shrink-0"
            >
              {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <KeyRound size={13} />}
              <span>Sign New Document</span>
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('quantum-signature')}
              className="sentinel-btn sentinel-btn-secondary text-[11px] shrink-0"
            >
              <span>Open Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Middle Section: Analytics & Quantum Network ─── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* QBER Analytics Chart */}
        <div className="sentinel-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="sentinel-card-title">QBER Error Rate Trend</div>
              <div className="sentinel-card-subtitle">Observed vs Hoeffding Bound</div>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-mono font-bold text-[#182033]">
                {(metrics.qber * 100).toFixed(2)}%
              </span>
              <span className="text-[10px] text-[#667085] block font-mono">
                Baseline: {(metrics.baseline_qber * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="time" tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white p-2.5 rounded border border-[#E4E7EC] shadow-md text-[11px] font-mono">
                        <div className="font-semibold text-[#182033] mb-1">{label}</div>
                        <div className="text-[#4169D8]">QBER: {(Number(payload[0]?.value) * 100).toFixed(2)}%</div>
                        <div className="text-[#98A2B3]">Hoeffding: 5.50%</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={0.055} stroke="#D92D20" strokeDasharray="3 3" label={{ value: 'BOUND', fill: '#D92D20', fontSize: 9 }} />
                <Line type="monotone" dataKey="qber" stroke="#4169D8" strokeWidth={2} dot={{ r: 3, fill: '#4169D8' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHSH Bell-Test Analytics Chart */}
        <div className="sentinel-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="sentinel-card-title">CHSH Bell Parameter</div>
              <div className="sentinel-card-subtitle">Non-local Quantum Entanglement</div>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-mono font-bold text-[#6C63D9]">
                {metrics.chsh_score.toFixed(3)}
              </span>
              <span className="text-[10px] text-[#667085] block font-mono">
                Classical Limit: 2.000
              </span>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="time" tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <YAxis domain={[1.5, 3.0]} tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white p-2.5 rounded border border-[#E4E7EC] shadow-md text-[11px] font-mono">
                        <div className="font-semibold text-[#182033] mb-1">{label}</div>
                        <div className="text-[#6C63D9]">CHSH: {Number(payload[0]?.value).toFixed(3)}</div>
                        <div className="text-[#667085]">Classical limit: 2.000</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={2.000} stroke="#667085" strokeDasharray="3 3" label={{ value: 'CLASSICAL', fill: '#667085', fontSize: 9 }} />
                <Line type="monotone" dataKey="chsh" stroke="#6C63D9" strokeWidth={2} dot={{ r: 3, fill: '#6C63D9' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantum Network Node Topology (Light & Technical) */}
        <div className="sentinel-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="sentinel-card-title">Quantum Node Topology</div>
            <span className="text-[10px] font-mono bg-[#EEF3FF] text-[#4169D8] px-2 py-0.5 rounded font-semibold">
              4 NODES CONNECTED
            </span>
          </div>

          <div className="bg-[#F9FAFC] border border-[#EAECF0] rounded-md p-3 my-auto">
            <div className="text-center mb-1">
              <span className="inline-block px-2.5 py-1 bg-white border border-[#D0D5DD] rounded text-[11px] font-mono font-semibold text-[#182033] shadow-xs">
                ARBITRATOR (ARB-01)
              </span>
            </div>
            <div className="flex items-center justify-center gap-10 text-[10px] font-mono text-[#667085] my-0.5">
              <span>╱</span>
              <span>╲</span>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="px-2.5 py-1 bg-white border border-[#D0DCFC] rounded text-[11px] font-mono font-semibold text-[#4169D8] shadow-xs">
                ALICE (ALC-01)
              </span>
              <span className="text-[10px] font-mono text-[#667085]">
                EPR Channel
              </span>
              <span className="px-2.5 py-1 bg-white border border-[#D0DCFC] rounded text-[11px] font-mono font-semibold text-[#4169D8] shadow-xs">
                BOB (BOB-01)
              </span>
            </div>
            <div className="flex items-center justify-center gap-10 text-[10px] font-mono text-[#667085] my-0.5">
              <span>╲</span>
              <span>╱</span>
            </div>
            <div className="text-center mt-1">
              <span className="inline-block px-2.5 py-1 bg-white border border-[#DCD9F7] rounded text-[11px] font-mono font-semibold text-[#6C63D9] shadow-xs">
                THREAT ENGINE (TE-01)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#EEF0F5] text-[10px] font-mono text-[#667085]">
            <div>EPR Fidelity: <strong className="text-[#182033]">99.4%</strong></div>
            <div>Classical Sync: <strong className="text-[#4169D8]">1.4ms</strong></div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Recent Security Events & System Performance ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Events Table */}
        <div className="sentinel-card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="sentinel-card-header">
            <div>
              <div className="sentinel-card-title">Recent Security Events</div>
              <div className="sentinel-card-subtitle">Real-time quantum telemetry audit stream</div>
            </div>
            <span className="text-[11px] font-mono text-[#667085]">
              Live Stream
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="sentinel-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Subsystem</th>
                  <th>Event</th>
                  <th>Latency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {telemetryLogs.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-[#667085] text-[11px]">
                      {log.timestamp}
                    </td>
                    <td>
                      <span className="font-mono text-[10px] font-semibold bg-[#F2F4F7] text-[#344054] px-2 py-0.5 rounded">
                        {log.subsystem}
                      </span>
                    </td>
                    <td className="font-mono text-[#182033] text-[11px]">
                      {log.event_type}
                    </td>
                    <td className="font-mono text-[#667085] text-[11px]">
                      {log.latency_ms}ms
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#4169D8] bg-[#EEF3FF] px-2 py-0.5 rounded">
                        <CheckCircle2 size={11} />
                        {log.status_code}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Performance Panel */}
        <div className="sentinel-card p-4 flex flex-col justify-between">
          <div>
            <div className="sentinel-card-title mb-1">System Performance</div>
            <div className="sentinel-card-subtitle mb-4">Core compute & telemetry metrics</div>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">API Latency (p99):</span>
                <span className="font-semibold text-[#182033]">{performance.api_latency_ms} ms</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Total Requests:</span>
                <span className="font-semibold text-[#182033]">{performance.requests_total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Error Rate:</span>
                <span className="font-semibold text-[#4169D8]">{performance.error_rate_pct}%</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F7]">
                <span className="text-[#667085]">Quantum Core Ops:</span>
                <span className="font-semibold text-[#6C63D9]">{performance.quantum_core_ops_sec} ops/sec</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#667085]">Threat Engine Eval:</span>
                <span className="font-semibold text-[#182033]">{performance.threat_engine_latency_ms} ms</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded text-[10px] text-[#667085] font-mono leading-relaxed">
            PostgreSQL session store active. All state transitions cryptographically signed and logged.
          </div>
        </div>
      </div>
    </div>
  );
};
