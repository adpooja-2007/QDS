import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Clock, Hash, Lock, ShieldAlert } from 'lucide-react';

export const SessionsTable = ({
  sessions,
  onSelectSession,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  isLoading,
}) => {
  const STATUSES = ['ALL', 'EPR_READY', 'SIGNED', 'MEASURED', 'SIFTED', 'AUDITED'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AUDITED':
        return <span className="db-badge db-badge-success">{status}</span>;
      case 'SIFTED':
        return <span className="db-badge db-badge-info">{status}</span>;
      case 'MEASURED':
        return <span className="db-badge db-badge-warning">{status}</span>;
      case 'SIGNED':
        return <span className="db-badge db-badge-info">{status}</span>;
      case 'EPR_READY':
        return <span className="db-badge db-badge-neutral">{status}</span>;
      default:
        return <span className="db-badge db-badge-neutral">{status}</span>;
    }
  };

  const getVerdictBadge = (verdict) => {
    if (verdict === 'ACCEPT') {
      return (
        <span className="db-badge db-badge-success flex items-center gap-1">
          <CheckCircle2 size={11} />
          ACCEPT
        </span>
      );
    }
    if (verdict === 'REJECT') {
      return (
        <span className="db-badge db-badge-danger flex items-center gap-1">
          <XCircle size={11} />
          REJECT
        </span>
      );
    }
    return <span className="db-badge db-badge-neutral">PENDING</span>;
  };

  return (
    <div className="db-card flex flex-col overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#1F293D] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#0F172A]">
        {/* Left: Table Title & Row Count */}
        <div className="flex items-center gap-2.5">
          <div className="text-[13px] font-bold text-white font-mono flex items-center gap-2">
            <span>TABLE: quantum_sessions</span>
            <span className="text-[11px] font-normal text-[#94A3B8] bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">
              {sessions.length} records
            </span>
          </div>
        </div>

        {/* Right: Search & Status Filters */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search ID, hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#162032] border border-[#27354A] rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#00E599]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#162032] border border-[#27354A] rounded-lg p-1 text-[11px] font-mono">
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded transition-all ${
                  statusFilter === st
                    ? 'bg-[#1E293B] text-[#00E599] font-bold border border-[#334155]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="db-table font-mono">
          <thead>
            <tr>
              <th>Session ID (PK)</th>
              <th>Status</th>
              <th>Qubits</th>
              <th>Document Digest (Alice)</th>
              <th>QBER</th>
              <th>CHSH Score</th>
              <th>Verdict</th>
              <th>Attacks</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-[#64748B]">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-[#94A3B8]">
                      <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping"></span>
                      Loading database records...
                    </div>
                  ) : (
                    'No sessions matching the current query or database is empty.'
                  )}
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.session_id} className="cursor-pointer" onClick={() => onSelectSession(s.session_id)}>
                  {/* Session ID */}
                  <td className="font-bold text-[#38BDF8]">
                    {s.session_id}
                  </td>

                  {/* Status */}
                  <td>{getStatusBadge(s.status)}</td>

                  {/* Qubits */}
                  <td className="text-[#94A3B8]">{s.num_pairs}</td>

                  {/* Document Hash */}
                  <td className="text-[11px] text-[#CBD5E1] max-w-[180px] truncate" title={s.document_hash || 'None'}>
                    {s.document_hash ? (
                      <span className="bg-[#1E293B] px-1.5 py-0.5 rounded text-[#94A3B8]">
                        {s.document_hash.slice(0, 16)}...
                      </span>
                    ) : (
                      <span className="text-[#64748B]">--</span>
                    )}
                  </td>

                  {/* QBER */}
                  <td>
                    {s.qber !== null && s.qber !== undefined ? (
                      <span className={`font-semibold ${s.qber > 0.05 ? 'text-[#FB7185]' : 'text-[#00E599]'}`}>
                        {(s.qber * 100).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-[#64748B]">--</span>
                    )}
                  </td>

                  {/* CHSH */}
                  <td>
                    {s.chsh !== null && s.chsh !== undefined ? (
                      <span className={`font-semibold ${s.chsh >= 2.0 ? 'text-[#00E599]' : 'text-[#FB7185]'}`}>
                        {s.chsh.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-[#64748B]">--</span>
                    )}
                  </td>

                  {/* Verdict */}
                  <td>{getVerdictBadge(s.verdict)}</td>

                  {/* Attacks */}
                  <td>
                    {s.attacks_count > 0 ? (
                      <span className="db-badge db-badge-danger flex items-center gap-1">
                        <ShieldAlert size={10} />
                        {s.attacks_count} Injected
                      </span>
                    ) : (
                      <span className="text-[#64748B]">0</span>
                    )}
                  </td>

                  {/* Updated At */}
                  <td className="text-[11px] text-[#64748B]">
                    {new Date(s.updated_at).toLocaleTimeString()}
                  </td>

                  {/* Action Button */}
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession(s.session_id);
                      }}
                      className="db-btn db-btn-secondary text-[10px] py-1 px-2 text-[#38BDF8] border-[#38BDF8]/30 hover:bg-[#38BDF8]/10"
                    >
                      <Eye size={11} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
