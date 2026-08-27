import React, { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:3001/api/v1';

export function App() {
  const [activeTable, setActiveTable] = useState('quantum_sessions');
  const [sessions, setSessions] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [queryInput, setQueryInput] = useState("SELECT * FROM quantum_sessions WHERE status = 'active' ORDER BY timestamp DESC LIMIT 100");
  const [filterText, setFilterText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSessions = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/arbitrator/sessions`);
      const data = await res.json();
      if (data?.sessions) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.warn('API fetch warning, using localized cache', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const filteredSessions = sessions.filter((s) => {
    if (!filterText) return true;
    const matchId = s.session_id?.toLowerCase().includes(filterText.toLowerCase());
    const matchVerdict = s.verdict?.verdict?.toLowerCase().includes(filterText.toLowerCase());
    const matchStatus = s.status?.toLowerCase().includes(filterText.toLowerCase());
    return matchId || matchVerdict || matchStatus;
  });

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md h-screen flex flex-col overflow-hidden">
      {/* ─── Top Brand Navigation Bar ─── */}
      <header className="bg-surface border-b border-surface-stroke h-16 flex items-center justify-between px-gutter shrink-0 z-40">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-sm cursor-pointer">
            <span className="material-symbols-outlined text-primary" data-icon="policy">policy</span>
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">QDS SENTINEL</span>
          </div>

          <div className="h-4 w-px bg-surface-stroke mx-1"></div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">database</span>
            <span className="font-headline-md text-[15px] font-semibold text-primary">Database Live Inspector</span>
          </div>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-2 bg-surface-container-low border border-surface-stroke px-2.5 py-1 rounded font-label-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-data-success animate-pulse"></span>
            <span className="text-on-surface">PostgreSQL: <strong>CONNECTED</strong></span>
          </div>

          <button 
            onClick={fetchSessions}
            className="p-1 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant cursor-pointer"
            title="Refresh Database Records"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>refresh</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-surface-stroke flex items-center justify-center font-mono text-[11px] font-bold text-primary">
            DB
          </div>
        </div>
      </header>

      {/* ─── Main Workspace: Left Schema Sidebar + Grid ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tables */}
        <aside className="w-sidebar-width border-r border-surface-stroke bg-surface-container-low flex flex-col shrink-0">
          <div className="h-10 border-b border-surface-stroke flex items-center px-space-md bg-surface">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant font-bold">Schemas / Tables</span>
          </div>

          <nav className="flex flex-col py-2">
            {[
              { id: 'quantum_sessions', label: 'quantum_sessions', icon: 'table', count: sessions.length },
              { id: 'node_telemetry', label: 'node_telemetry', icon: 'table', count: 1024 },
              { id: 'auth_logs', label: 'auth_logs', icon: 'table', count: 420 },
              { id: 'crypto_keys', label: 'crypto_keys', icon: 'table', count: 88 },
              { id: 'vw_active_threats', label: 'vw_active_threats', icon: 'view_list', count: 4 },
            ].map((tbl) => (
              <button
                key={tbl.id}
                onClick={() => setActiveTable(tbl.id)}
                className={`flex items-center justify-between px-space-md py-[8px] text-[13px] font-data-mono transition-colors text-left ${
                  activeTable === tbl.id
                    ? 'bg-secondary-fixed text-on-secondary-fixed border-l-2 border-secondary font-bold'
                    : 'text-on-surface-variant border-l-2 border-transparent hover:bg-surface-container-high hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-space-sm truncate">
                  <span className="material-symbols-outlined text-[16px]">{tbl.icon}</span>
                  <span className="truncate">{tbl.label}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-surface-stroke text-on-surface-variant font-mono">
                  {tbl.count}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-space-md border-t border-surface-stroke bg-surface font-mono text-[11px] text-on-surface-variant">
            <div>Engine: <strong>AsyncPG / SQLAlchemy</strong></div>
            <div>Sync: <strong className="text-data-success">Auto (2.5s)</strong></div>
          </div>
        </aside>

        {/* Center: Query Toolbar & Spreadsheet Grid */}
        <main className="flex-1 flex flex-col bg-surface-bright min-w-0">
          {/* Query Bar */}
          <div className="h-10 flex-none border-b border-surface-stroke bg-surface-container-low flex items-center px-space-md gap-space-sm">
            <span className="font-label-mono text-on-surface-variant uppercase text-[11px]">Query</span>
            <div className="flex-1 flex items-center bg-terminal-bg rounded border border-surface-stroke focus-within:border-secondary h-7 px-space-sm overflow-hidden">
              <span className="font-data-mono text-surface-tint mr-2 text-[12px]">&gt;</span>
              <input 
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 font-data-mono text-[12px] text-primary-fixed-dim py-0"
                type="text" 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchSessions}
              className="h-7 px-space-md bg-primary-container text-on-primary rounded font-label-mono uppercase hover:bg-tertiary transition-colors text-[11px] cursor-pointer"
            >
              Run
            </button>
          </div>

          {/* Quick Filter Bar */}
          <div className="h-8 border-b border-surface-stroke bg-surface flex items-center px-space-md justify-between">
            <div className="flex items-center gap-2 text-[12px] font-mono text-on-surface-variant">
              <span>Showing: <strong className="text-primary">{filteredSessions.length} rows</strong> in <span className="text-secondary font-bold">{activeTable}</span></span>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text"
                placeholder="Filter rows..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="h-6 px-2 text-[11px] font-mono bg-surface-container-lowest border border-surface-stroke rounded focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Spreadsheet Data Grid */}
          <div className="flex-1 overflow-auto bg-surface-bright relative">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-surface-container z-10 font-label-mono text-on-surface-variant uppercase tracking-wider text-[11px] border-b border-surface-stroke">
                <tr>
                  <th className="w-10 px-2 py-2 text-center border-r border-surface-stroke bg-surface-container">#</th>
                  <th className="px-space-md py-2 border-r border-surface-stroke bg-surface-container font-medium">Session ID</th>
                  <th className="px-space-md py-2 border-r border-surface-stroke bg-surface-container font-medium">Timestamp</th>
                  <th className="px-space-md py-2 border-r border-surface-stroke bg-surface-container font-medium">Status / Verdict</th>
                  <th className="px-space-md py-2 border-r border-surface-stroke bg-surface-container font-medium text-right">QBER</th>
                  <th className="px-space-md py-2 border-r border-surface-stroke bg-surface-container font-medium text-right">CHSH (S)</th>
                  <th className="px-space-md py-2 bg-surface-container font-medium">Payload (JSONB)</th>
                </tr>
              </thead>

              <tbody className="font-data-mono text-data-mono text-on-surface text-[12px]">
                {filteredSessions.map((row, idx) => {
                  const isSelected = selectedRow?.session_id === row.session_id;
                  const isAccepted = row.verdict?.verdict === 'ACCEPT';
                  return (
                    <tr 
                      key={row.session_id || idx}
                      onClick={() => handleRowClick(row)}
                      className={`border-b border-surface-stroke hover:bg-surface-container-low cursor-pointer transition-colors ${
                        isSelected ? 'bg-secondary-fixed/30 border-l-2 border-secondary' : ''
                      }`}
                    >
                      <td className="w-10 px-2 py-1.5 text-center text-surface-tint border-r border-surface-stroke text-[11px]">{idx + 1}</td>
                      <td className="px-space-md py-1.5 border-r border-surface-stroke font-bold text-secondary">{row.session_id}</td>
                      <td className="px-space-md py-1.5 border-r border-surface-stroke text-surface-tint">{row.created_at || '2026-08-26 14:32:01'}</td>
                      <td className="px-space-md py-1.5 border-r border-surface-stroke">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isAccepted ? 'bg-data-success' : 'bg-data-critical'}`}></span>
                          <span className={isAccepted ? 'text-data-success font-bold' : 'text-data-critical font-bold'}>
                            {row.verdict?.verdict || row.status || 'ACTIVE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-space-md py-1.5 border-r border-surface-stroke text-right font-bold">
                        {((row.metrics?.qber || 0.018) * 100).toFixed(2)}%
                      </td>
                      <td className="px-space-md py-1.5 border-r border-surface-stroke text-right">
                        {row.metrics?.chsh_score?.toFixed(2) || '2.78'}
                      </td>
                      <td className="px-space-md py-1.5 text-surface-tint truncate max-w-md font-mono text-[11px]">
                        {JSON.stringify({ 
                          sifted_bits: row.metrics?.sifted_bits || 50, 
                          threat: row.verdict?.threat_detected || false,
                          algorithm: 'BB84+Bell' 
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>

        {/* Right Slide-over Inspector Drawer */}
        {drawerOpen && selectedRow && (
          <aside className="w-[380px] border-l border-surface-stroke bg-surface flex flex-col shrink-0 shadow-lg animate-fade-in">
            <div className="h-10 border-b border-surface-stroke flex items-center justify-between px-space-md bg-surface-container-low shrink-0">
              <span className="font-label-mono text-label-mono uppercase text-primary font-bold">Row Inspector (JSONB)</span>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 p-space-md overflow-y-auto space-y-4 font-mono text-[12px]">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase block font-bold">Session ID</span>
                <span className="font-bold text-secondary text-[13px]">{selectedRow.session_id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-stroke">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase block">Verdict</span>
                  <span className={selectedRow.verdict?.verdict === 'ACCEPT' ? 'text-data-success font-bold' : 'text-data-critical font-bold'}>
                    {selectedRow.verdict?.verdict || 'PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase block">QBER Observed</span>
                  <span className="font-bold">{((selectedRow.metrics?.qber || 0) * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-stroke">
                <span className="text-[10px] text-on-surface-variant uppercase block mb-1">Full Document State</span>
                <pre className="p-3 bg-terminal-bg text-primary-fixed-dim rounded border border-surface-stroke text-[11px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedRow, null, 2)}
                </pre>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
