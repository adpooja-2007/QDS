import React, { useState } from 'react';
import { QuantumSession, TelemetryLog } from '../../types/sentinel';
import {
  Search,
  Filter,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface SessionsProps {
  sessions: QuantumSession[];
  activeSession: QuantumSession;
  onSelectSession: (id: string) => void;
  telemetryLogs: TelemetryLog[];
}

type TabType = 'PARAMETERS' | 'ALICE' | 'BOB' | 'SIFTING' | 'SECURITY' | 'TELEMETRY';

export const SessionsPage: React.FC<SessionsProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  telemetryLogs,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<TabType>('PARAMETERS');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.session_id.toLowerCase().includes(search.toLowerCase()) ||
      s.document_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (session: QuantumSession) => {
    onSelectSession(session.session_id);
    setDrawerOpen(true);
  };

  const isAccept = activeSession.verdict.verdict === 'ACCEPT';

  return (
    <div className="space-y-5 pb-8 max-w-[1600px] mx-auto">
      {/* ─── Filter Bar ─── */}
      <div className="sentinel-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 text-[#98A2B3]" size={14} />
            <input
              type="text"
              placeholder="Search Session ID or document name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sentinel-input pl-8 w-full text-[11px] font-mono"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#D0D5DD] rounded-md px-2 py-1 text-[11px]">
            <Filter size={12} className="text-[#667085]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#182033] font-mono text-[11px] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ACTIVE">ACTIVE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#667085]">
          <Calendar size={13} />
          <span>PostgreSQL Session Store · {filteredSessions.length} sessions</span>
        </div>
      </div>

      {/* ─── Main Grid: Session Table (Left) + Detail Drawer (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table */}
        <div className={`sentinel-card overflow-hidden flex flex-col transition-all ${drawerOpen ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div className="sentinel-card-header">
            <div>
              <div className="sentinel-card-title">Quantum Protocol Sessions</div>
              <div className="sentinel-card-subtitle">Historical cryptographic session archive</div>
            </div>
            {!drawerOpen && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="sentinel-btn sentinel-btn-subtle text-[11px]"
              >
                Show Detail Drawer
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="sentinel-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>QBER</th>
                  <th>CHSH</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => {
                  const isSelected = activeSession.session_id === s.session_id;
                  return (
                    <tr
                      key={s.session_id}
                      onClick={() => handleRowClick(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? '!bg-[#EEF3FF]/80 font-medium' : ''
                      }`}
                    >
                      <td className="font-mono text-[#4169D8] font-semibold text-[11px]">
                        {s.session_id}
                      </td>
                      <td>
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            s.status === 'VERIFIED'
                              ? 'bg-[#EEF3FF] text-[#4169D8] border-[#D0DCFC]'
                              : s.status === 'REJECTED'
                              ? 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]'
                              : 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="font-mono text-[#667085] text-[10px]">
                        {s.created_at.substring(11, 19)}
                      </td>
                      <td className={`font-mono text-[11px] ${s.metrics.qber > 0.055 ? 'text-[#D92D20] font-semibold' : 'text-[#667085]'}`}>
                        {(s.metrics.qber * 100).toFixed(2)}%
                      </td>
                      <td className={`font-mono text-[11px] ${s.metrics.chsh_score < 2.0 ? 'text-[#D92D20] font-semibold' : 'text-[#6C63D9]'}`}>
                        {s.metrics.chsh_score.toFixed(3)}
                      </td>
                      <td>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                            s.verdict.verdict === 'ACCEPT'
                              ? 'text-[#4169D8] bg-[#EEF3FF]'
                              : 'text-[#D92D20] bg-[#FEF3F2]'
                          }`}
                        >
                          {s.verdict.verdict}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Side Drawer */}
        {drawerOpen && (
          <div className="sentinel-card lg:col-span-6 p-4 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#EEF0F5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold font-mono text-[#182033]">
                    {activeSession.session_id}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      isAccept
                        ? 'bg-[#EEF3FF] text-[#4169D8] border-[#D0DCFC]'
                        : 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]'
                    }`}
                  >
                    {activeSession.verdict.verdict}
                  </span>
                </div>
                <div className="text-[11px] text-[#667085] mt-1 font-mono">
                  {activeSession.document_name} ({activeSession.file_size_kb} KB)
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="text-[#98A2B3] hover:text-[#182033] p-1 rounded hover:bg-[#F2F4F7]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 border-b border-[#EEF0F5] my-3 overflow-x-auto">
              {(['PARAMETERS', 'ALICE', 'BOB', 'SIFTING', 'SECURITY', 'TELEMETRY'] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-[11px] font-mono font-medium rounded-t transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#EEF3FF] text-[#4169D8] font-semibold border-b-2 border-[#4169D8]'
                        : 'text-[#667085] hover:text-[#182033]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px]">
              {activeTab === 'PARAMETERS' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded space-y-1.5">
                    <div className="flex justify-between text-[#667085]">
                      <span>Document SHA-256:</span>
                    </div>
                    <div className="text-[#182033] text-[10px] break-all select-all bg-white p-1.5 rounded border border-[#EAECF0]">
                      {activeSession.document_hash}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                      <span className="text-[#667085] text-[10px]">Sender:</span>
                      <div className="text-[#182033] font-semibold mt-0.5">{activeSession.sender}</div>
                    </div>
                    <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                      <span className="text-[#667085] text-[10px]">Receiver:</span>
                      <div className="text-[#182033] font-semibold mt-0.5">{activeSession.receiver}</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <span className="text-[#667085] text-[10px]">Arbitrator:</span>
                    <div className="text-[#182033] font-semibold mt-0.5">{activeSession.arbitrator}</div>
                  </div>
                </div>
              )}

              {activeTab === 'ALICE' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Modulation Basis</div>
                    <div className="text-[#182033] font-semibold mt-0.5">Random Conjugate {`{|0⟩, |1⟩, |+⟩, |-⟩}`}</div>
                  </div>
                  <div className="p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Bell State Measurement Outcome</div>
                    <div className="text-[#4169D8] font-semibold mt-0.5">|Ψ⁻⟩ Singlet projection</div>
                  </div>
                </div>
              )}

              {activeTab === 'BOB' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Pauli Frame Correction</div>
                    <div className="text-[#182033] font-semibold mt-0.5">Applied σ_z correction gate</div>
                  </div>
                  <div className="p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Measurement Basis Match</div>
                    <div className="text-[#4169D8] font-semibold mt-0.5">47.7% Matching fraction (Sifted)</div>
                  </div>
                </div>
              )}

              {activeTab === 'SIFTING' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                      <span className="text-[#667085] text-[10px]">Total Pulses:</span>
                      <div className="text-[#182033] font-bold mt-0.5">{activeSession.metrics.total_pulses}</div>
                    </div>
                    <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                      <span className="text-[#667085] text-[10px]">Sifted Key Bits:</span>
                      <div className="text-[#4169D8] font-bold mt-0.5">{activeSession.metrics.sifted_bits}</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <span className="text-[#667085] text-[10px]">Sample Bit Errors:</span>
                    <div className="text-[#182033] font-bold mt-0.5">{activeSession.metrics.error_bits} bits</div>
                  </div>
                </div>
              )}

              {activeTab === 'SECURITY' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Security Assessment Summary</div>
                    <div className="text-[#182033] text-[11px] mt-1 leading-relaxed">
                      {activeSession.verdict.reason}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                      <span className="text-[#667085] text-[10px]">QBER:</span>
                      <div className="text-[#182033] font-bold mt-0.5">{(activeSession.metrics.qber * 100).toFixed(2)}%</div>
                    </div>
                    <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                      <span className="text-[#667085] text-[10px]">CHSH Score:</span>
                      <div className="text-[#6C63D9] font-bold mt-0.5">{activeSession.metrics.chsh_score.toFixed(3)}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'TELEMETRY' && (
                <div className="space-y-1.5">
                  {telemetryLogs.slice(0, 4).map((l) => (
                    <div key={l.id} className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded text-[10px]">
                      <div className="flex justify-between text-[#667085]">
                        <span className="font-semibold text-[#182033]">{l.subsystem}</span>
                        <span>{l.timestamp}</span>
                      </div>
                      <div className="text-[#475467] mt-0.5">{l.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
