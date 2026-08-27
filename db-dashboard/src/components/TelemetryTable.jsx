import React from 'react';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const TelemetryTable = ({ logs, isLoading }) => {
  return (
    <div className="db-card flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#1F293D] flex items-center justify-between bg-[#0F172A]">
        <div className="text-[13px] font-bold text-white font-mono flex items-center gap-2">
          <span>TABLE: telemetry_logs</span>
          <span className="text-[11px] font-normal text-[#94A3B8] bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">
            {logs.length} events logged
          </span>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[250px]">
        <table className="db-table font-mono">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Path / Endpoint</th>
              <th>Status</th>
              <th>Latency (ms)</th>
              <th>Client IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[#64748B]">
                  No telemetry logs available yet.
                </td>
              </tr>
            ) : (
              logs.slice(0, 50).map((log, i) => (
                <tr key={log.id || i}>
                  <td className="text-[#94A3B8] text-[11px]">{log.timestamp}</td>
                  <td>
                    <span className="db-badge db-badge-neutral">{log.method || 'GET'}</span>
                  </td>
                  <td className="text-white font-semibold">{log.path}</td>
                  <td>
                    {log.status_code < 400 ? (
                      <span className="db-badge db-badge-success">{log.status_code} OK</span>
                    ) : (
                      <span className="db-badge db-badge-danger">{log.status_code} ERR</span>
                    )}
                  </td>
                  <td className="text-[#38BDF8]">{log.latency_ms?.toFixed(1)} ms</td>
                  <td className="text-[#64748B] text-[11px]">{log.client_ip || '127.0.0.1'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
