import React, { useState } from 'react';
import { SecurityIncident } from '../../types/sentinel';
import {
  Search,
  Filter,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

interface InvestigationsProps {
  incidents: SecurityIncident[];
}

export const InvestigationsPage: React.FC<InvestigationsProps> = ({ incidents }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(incidents[0] || null);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      inc.session_id.toLowerCase().includes(search.toLowerCase()) ||
      inc.event.toLowerCase().includes(search.toLowerCase()) ||
      inc.threat_category.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-5 pb-8 max-w-[1600px] mx-auto">
      {/* ─── Filter Bar ─── */}
      <div className="sentinel-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 text-[#98A2B3]" size={14} />
            <input
              type="text"
              placeholder="Search by Session ID, threat or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sentinel-input pl-8 w-full text-[11px] font-mono"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#D0D5DD] rounded-md px-2 py-1 text-[11px]">
            <Filter size={12} className="text-[#667085]" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-[#182033] font-mono text-[11px] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#667085]">
          <Calendar size={13} />
          <span>Last 24 Hours · Live Forensic Audit</span>
        </div>
      </div>

      {/* ─── Main Grid: Table (Left) + Detail Drawer (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incident Table (7 cols on desktop) */}
        <div className="sentinel-card lg:col-span-7 overflow-hidden flex flex-col">
          <div className="sentinel-card-header">
            <div>
              <div className="sentinel-card-title">Security Incidents & Audit Log</div>
              <div className="sentinel-card-subtitle">{filteredIncidents.length} recorded events</div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="sentinel-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Event</th>
                  <th>Severity</th>
                  <th>QBER</th>
                  <th>CHSH</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? '!bg-[#EEF3FF]/80 font-medium' : ''
                      }`}
                    >
                      <td className="font-mono text-[#4169D8] font-semibold text-[11px]">
                        {inc.session_id}
                      </td>
                      <td className="font-mono text-[#182033] text-[11px] max-w-[220px] truncate">
                        {inc.event}
                      </td>
                      <td>
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]'
                              : inc.severity === 'HIGH'
                              ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                              : 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className={`font-mono text-[11px] ${inc.qber > 0.055 ? 'text-[#D92D20] font-semibold' : 'text-[#667085]'}`}>
                        {(inc.qber * 100).toFixed(2)}%
                      </td>
                      <td className={`font-mono text-[11px] ${inc.chsh < 2.0 ? 'text-[#D92D20] font-semibold' : 'text-[#6C63D9]'}`}>
                        {inc.chsh.toFixed(3)}
                      </td>
                      <td className="font-mono text-[#667085] text-[10px]">
                        {inc.timestamp.substring(11, 19)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incident Detail Drawer / Panel (5 cols on desktop) */}
        <div className="sentinel-card lg:col-span-5 p-4 flex flex-col">
          {selectedIncident ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#EEF0F5]">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-[#F2F4F7] text-[#475467] px-2 py-0.5 rounded font-semibold">
                    INCIDENT: {selectedIncident.id}
                  </span>
                  <h3 className="text-[13px] font-bold text-[#182033] mt-1">
                    {selectedIncident.event}
                  </h3>
                  <div className="text-[11px] text-[#667085] font-mono mt-0.5">
                    Session: <strong>{selectedIncident.session_id}</strong> · {selectedIncident.timestamp}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 bg-[#FAFBFD] border border-[#EEF0F5] rounded-md text-[11px] text-[#475467] leading-relaxed">
                {selectedIncident.summary}
              </div>

              {/* Detection Timeline */}
              <div>
                <div className="sentinel-label text-[10px] mb-2 font-mono">
                  DETECTION TIMELINE
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {selectedIncident.detection_timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 bg-[#F9FAFC] border border-[#EAECF0] rounded"
                    >
                      <div className="flex items-center gap-2">
                        {item.state === 'PASS' ? (
                          <CheckCircle2 size={12} className="text-[#4169D8]" />
                        ) : item.state === 'WARN' ? (
                          <AlertTriangle size={12} className="text-[#DC6803]" />
                        ) : (
                          <XCircle size={12} className="text-[#D92D20]" />
                        )}
                        <span className="text-[#182033] font-medium">{item.step}</span>
                      </div>
                      <div className="text-[#667085]">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Metrics */}
              <div>
                <div className="sentinel-label text-[10px] mb-2 font-mono">
                  PHYSICAL & STATISTICAL EVIDENCE
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Observed QBER:</div>
                    <div className="text-[#182033] font-bold">{(selectedIncident.evidence.qber_observed * 100).toFixed(2)}%</div>
                  </div>
                  <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Hoeffding Bound:</div>
                    <div className="text-[#4169D8] font-bold">{(selectedIncident.evidence.hoeffding_threshold * 100).toFixed(2)}%</div>
                  </div>
                  <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">CHSH Bell Score:</div>
                    <div className="text-[#6C63D9] font-bold">{selectedIncident.evidence.chsh_score.toFixed(3)}</div>
                  </div>
                  <div className="p-2 bg-[#F9FAFC] border border-[#EAECF0] rounded">
                    <div className="text-[#667085] text-[10px]">Statistical p-value:</div>
                    <div className="text-[#182033] font-bold">{selectedIncident.evidence.statistical_p_value}</div>
                  </div>
                </div>
              </div>

              {/* Final Assessment */}
              <div className="p-3 bg-[#F2F4F7] border border-[#EAECF0] rounded-md text-[11px] text-[#344054] leading-relaxed">
                <strong className="text-[#182033]">Final Assessment: </strong>
                {selectedIncident.final_assessment}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[#667085] text-[12px] my-auto">
              Select an incident row from the table to view full forensic investigation details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
