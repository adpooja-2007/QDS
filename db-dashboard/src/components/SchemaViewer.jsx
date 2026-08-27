import React, { useState } from 'react';
import { Database, Table, Key, Copy, Check, Terminal } from 'lucide-react';

export const SchemaViewer = ({ tablesSchema }) => {
  const [copiedQuery, setCopiedQuery] = useState(null);

  const sampleQueries = [
    {
      title: '1. Select All Verified Quantum Sessions',
      sql: `SELECT session_id, status, nonce, created_at,
       security->'decision'->>'overall' AS verdict,
       (security->'metrics'->>'qber')::float AS qber,
       (security->'metrics'->>'chsh_score')::float AS chsh
FROM quantum_sessions
ORDER BY created_at DESC;`,
    },
    {
      title: '2. Find Sessions with MitM or Forgery Attacks Injected',
      sql: `SELECT session_id, status, jsonb_array_length(attacks) AS attack_count, attacks
FROM quantum_sessions
WHERE jsonb_array_length(attacks) > 0;`,
    },
    {
      title: '3. Query Alice Bitstream and Bell State Measurements',
      sql: `SELECT session_id,
       alice->>'document_hash' AS doc_hash,
       alice->'bits' AS raw_bits,
       alice->'bases' AS bases,
       alice->'bell_measurements' AS bell_outcomes
FROM quantum_sessions
LIMIT 5;`,
    },
  ];

  const handleCopy = (sql, index) => {
    navigator.clipboard.writeText(sql);
    setCopiedQuery(index);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  const tables = tablesSchema?.tables || [
    {
      table_name: 'quantum_sessions',
      columns: [
        { name: 'session_id', type: 'VARCHAR(64)', primary_key: true, nullable: false },
        { name: 'status', type: 'VARCHAR(32)', primary_key: false, nullable: false },
        { name: 'nonce', type: 'VARCHAR(64)', primary_key: false, nullable: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', primary_key: false, nullable: false },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primary_key: false, nullable: false },
        { name: 'parameters', type: 'JSONB', primary_key: false, nullable: true },
        { name: 'alice', type: 'JSONB', primary_key: false, nullable: true },
        { name: 'bob', type: 'JSONB', primary_key: false, nullable: true },
        { name: 'sifting', type: 'JSONB', primary_key: false, nullable: true },
        { name: 'attacks', type: 'JSONB[]', primary_key: false, nullable: true },
        { name: 'security', type: 'JSONB', primary_key: false, nullable: true },
      ],
    },
    {
      table_name: 'telemetry_logs',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', primary_key: true, nullable: false },
        { name: 'timestamp', type: 'TIMESTAMPTZ', primary_key: false, nullable: false },
        { name: 'method', type: 'VARCHAR(10)', primary_key: false, nullable: false },
        { name: 'path', type: 'VARCHAR(255)', primary_key: false, nullable: false },
        { name: 'status_code', type: 'INTEGER', primary_key: false, nullable: false },
        { name: 'latency_ms', type: 'FLOAT', primary_key: false, nullable: false },
        { name: 'client_ip', type: 'VARCHAR(45)', primary_key: false, nullable: true },
      ],
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Tables Definitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {tables.map((t) => (
          <div key={t.table_name} className="db-card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1F293D]">
              <div className="flex items-center gap-2">
                <Table size={16} className="text-[#00E599]" />
                <span className="font-bold text-white text-[13px]">{t.table_name}</span>
              </div>
              <span className="db-badge db-badge-info text-[10px]">
                {t.columns.length} columns
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="db-table text-[11px]">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>PK / Nullable</th>
                  </tr>
                </thead>
                <tbody>
                  {t.columns.map((c) => (
                    <tr key={c.name}>
                      <td className="font-bold text-[#E2E8F0] flex items-center gap-1">
                        {c.primary_key && <Key size={11} className="text-[#FBBF24]" />}
                        {c.name}
                      </td>
                      <td className="text-[#38BDF8]">{c.type}</td>
                      <td className="text-[#94A3B8]">
                        {c.primary_key ? (
                          <span className="db-badge db-badge-warning text-[9px]">PRIMARY KEY</span>
                        ) : c.nullable ? (
                          'NULL'
                        ) : (
                          'NOT NULL'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sample SQL Queries */}
      <div className="db-card p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1F293D]">
          <Terminal size={16} className="text-[#38BDF8]" />
          <span className="font-bold text-white text-[13px]">PostgreSQL & SQLite Query Library</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleQueries.map((q, idx) => (
            <div key={idx} className="p-3 bg-[#0B0F17] rounded-lg border border-[#1F293D] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#38BDF8] block mb-2">{q.title}</span>
                <pre className="text-[10px] text-[#00E599] bg-[#05080E] p-2.5 rounded border border-[#1E293B] overflow-x-auto">
                  {q.sql}
                </pre>
              </div>
              <button
                onClick={() => handleCopy(q.sql, idx)}
                className="db-btn db-btn-secondary text-[10px] mt-3 py-1 self-end flex items-center gap-1"
              >
                {copiedQuery === idx ? <Check size={11} className="text-[#00E599]" /> : <Copy size={11} />}
                <span>{copiedQuery === idx ? 'Copied' : 'Copy Query'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
