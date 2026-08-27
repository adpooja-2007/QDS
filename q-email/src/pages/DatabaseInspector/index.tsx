import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Settings, 
  Bell, 
  User, 
  X, 
  Table as TableIcon, 
  Database, 
  Check, 
  Copy, 
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Filter,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { sentinelService, formatISTTime, formatISTDateTime } from '../../services/sentinelService';
import { QuantumSession, QuantumNode, SecurityIncident, TelemetryLog } from '../../types/sentinel';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { ButtonGroup, ButtonGroupText } from '../../components/ui/button-group';

interface DbRecord {
  id: string;
  timestamp: string;
  status: 'active' | 'degraded' | 'compromised' | 'quarantined' | 'verified' | 'rejected' | 'pending';
  verdict: 'ACCEPT' | 'REJECT' | 'PENDING' | 'PASS' | 'FAIL' | 'ONLINE' | 'ACTIVE' | 'DEGRADED' | string;
  threatType: string;
  reason: string;
  nodes: string;
  size: string;
  payload: Record<string, any>;
}

type SortColumn = 'id' | 'timestamp' | 'status' | 'verdict' | 'threatType' | 'reason' | 'nodes';
type SortDirection = 'asc' | 'desc';

interface DatabaseInspectorProps {
  onNavigateHome?: () => void;
  onNavigateDemonstration?: () => void;
  onNavigateMonitoring?: () => void;
  onNavigateAttackSandbox?: () => void;
}

export const DatabaseInspectorPage: React.FC<DatabaseInspectorProps> = ({
  onNavigateHome,
  onNavigateDemonstration,
  onNavigateMonitoring,
  onNavigateAttackSandbox,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('quantum_sessions');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');
  const [globalSearchParam, setGlobalSearchParam] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(formatISTTime(new Date(), false) + ' IST');

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modals & Popovers
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState<boolean>(false);
  const [showUserProfilePopover, setShowUserProfilePopover] = useState<boolean>(false);

  // Live Data States from Database / Sentinel Service
  const [liveSessions, setLiveSessions] = useState<QuantumSession[]>([]);
  const [liveNodes, setLiveNodes] = useState<QuantumNode[]>([]);
  const [liveIncidents, setLiveIncidents] = useState<SecurityIncident[]>([]);
  const [liveTelemetryLogs, setLiveTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [liveStreamLogs, setLiveStreamLogs] = useState<any[]>([]);

  // Function to refresh and pull all live data from Database Service
  const loadDatabaseData = () => {
    setIsRefreshing(true);
    try {
      const sess = sentinelService.getSessions();
      const nds = sentinelService.getNodes();
      const incs = sentinelService.getIncidents();
      const tels = sentinelService.getTelemetryLogs();
      const stream = sentinelService.getLiveStream();

      setLiveSessions(sess);
      setLiveNodes(nds);
      setLiveIncidents(incs);
      setLiveTelemetryLogs(tels);
      setLiveStreamLogs(stream);

      setLastSyncTime(formatISTTime(new Date(), false) + ' IST');
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  useEffect(() => {
    loadDatabaseData();

    // Subscribe to live telemetry updates
    const unsubscribe = sentinelService.subscribeLiveStream(() => {
      loadDatabaseData();
    });

    const interval = setInterval(loadDatabaseData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Convert raw database entities into uniform DbRecords for each table schema
  const tablesData: Record<string, { name: string; isView?: boolean; records: DbRecord[] }> = useMemo(() => {
    // 1. Table: quantum_sessions
    const sessionRecords: DbRecord[] = liveSessions.map((s, idx) => {
      const isReject = s.verdict?.verdict === 'REJECT' || s.verdict?.threat_detected || s.status === 'REJECTED';
      const isDegraded = (s.metrics?.qber > 0.04 || s.status === 'DEGRADED') && !isReject;
      const status: DbRecord['status'] = isReject ? 'compromised' : isDegraded ? 'degraded' : 'active';
      const createdDate = s.created_at ? new Date(s.created_at) : new Date(Date.now() - (idx * 60000));
      const verdict = s.verdict?.verdict || (isReject ? 'REJECT' : 'ACCEPT');
      const threatType = s.verdict?.threat_type || (isReject ? 'MitM Intercept-Resend' : 'None / Clean');
      const reason = s.verdict?.reason || (isReject ? 'QBER exceeded Hoeffding limit' : 'Bell inequality verified, QBER within bounds');

      return {
        id: s.session_id,
        timestamp: formatISTDateTime(createdDate),
        status,
        verdict,
        threatType,
        reason,
        nodes: `${s.sender.split(' ')[0]} -> ${s.receiver.split(' ')[0]} (Via ${s.arbitrator.split(' ')[0]})`,
        size: `${s.file_size_kb || 64.0} KB`,
        payload: {
          session_id: s.session_id,
          document_name: s.document_name,
          document_hash: s.document_hash,
          verdict,
          threat_type: threatType,
          reason,
          sender: s.sender,
          receiver: s.receiver,
          arbitrator: s.arbitrator,
          q_state: isReject ? 'collapsed' : 'entangled',
          metrics: s.metrics,
          created_at: formatISTDateTime(createdDate),
          updated_at: formatISTDateTime(s.updated_at ? new Date(s.updated_at) : createdDate)
        }
      };
    });

    // 2. Table: node_telemetry
    const nodeRecords: DbRecord[] = liveNodes.map((n, idx) => {
      const status: DbRecord['status'] = n.status === 'ONLINE' ? 'active' : n.status === 'DEGRADED' ? 'degraded' : 'active';
      const nodeTime = new Date(Date.now() - (idx * 30000));
      return {
        id: `node_${n.id.toLowerCase()}`,
        timestamp: formatISTDateTime(nodeTime),
        status,
        verdict: n.status === 'ONLINE' ? 'ONLINE' : 'DEGRADED',
        threatType: n.status === 'ONLINE' ? 'None / Nominal' : 'Optical Attenuation',
        reason: `Qubit Fidelity: ${(n.qubit_fidelity * 100).toFixed(1)}%, Latency: ${n.latency_ms}ms`,
        nodes: `${n.name} (${n.endpoint})`,
        size: `${n.memory_buffer_mb || 1024} MB`,
        payload: {
          node_id: n.id,
          name: n.name,
          role: n.role,
          status: n.status,
          endpoint: n.endpoint,
          latency_ms: n.latency_ms,
          qubit_fidelity: n.qubit_fidelity,
          requests_count: n.requests_count,
          last_activity: formatISTDateTime(nodeTime)
        }
      };
    });

    // 3. Table: auth_logs
    const logRecords: DbRecord[] = liveTelemetryLogs.map((l, idx) => {
      const logTime = new Date(Date.now() - (idx * 15000));
      const isPass = l.status_code === 200;
      return {
        id: `LOG-${l.id}`,
        timestamp: formatISTDateTime(logTime),
        status: isPass ? 'active' : l.status_code === 500 ? 'compromised' : 'degraded',
        verdict: isPass ? 'PASS' : 'FAIL',
        threatType: isPass ? 'None' : 'Security Policy Violation',
        reason: l.message || 'Audit log event recorded',
        nodes: `${l.subsystem} (Port: 9091)`,
        size: '0.8 KB',
        payload: {
          logId: l.id,
          timestamp: formatISTTime(logTime, true),
          subsystem: l.subsystem,
          eventType: l.event_type,
          latencyMs: l.latency_ms,
          statusCode: l.status_code,
          message: l.message
        }
      };
    });

    // 4. Table: crypto_keys
    const keyRecords: DbRecord[] = liveSessions.map((s, idx) => {
      const keyTime = new Date(Date.now() - (idx * 45000));
      const isAccept = s.verdict?.verdict === 'ACCEPT';
      return {
        id: `KEY-${s.session_id.slice(-6)}`,
        timestamp: formatISTDateTime(keyTime),
        status: isAccept ? 'active' : 'compromised',
        verdict: isAccept ? 'ACCEPT' : 'REJECT',
        threatType: isAccept ? 'None' : (s.verdict?.threat_type || 'Compromised Token'),
        reason: isAccept ? '256-bit Decoy BB84 OTP key distilled' : 'Key material revoked due to channel breach',
        nodes: `PAIR: ${s.sender.split(' ')[0]}-${s.receiver.split(' ')[0]}`,
        size: '0.6 KB',
        payload: {
          key_id: `QK-OTP-${s.session_id.slice(-6).toUpperCase()}`,
          session_reference: s.session_id,
          algorithm: 'BB84_DECOY_STATE_OTP',
          entropy_bits: 256,
          sifted_bits_raw: s.metrics?.sifted_bits || 1024,
          observed_qber: s.metrics?.qber || 0.02,
          hoeffding_confidence: s.metrics?.confidence_level || 0.999,
          state: isAccept ? 'DISTILLED_READY' : 'REVOKED_COMPROMISED',
          generated_at_ist: formatISTDateTime(keyTime)
        }
      };
    });

    // 5. Table: vw_active_threats
    const threatRecords: DbRecord[] = liveIncidents.map((inc, idx) => {
      const threatTime = new Date(Date.now() - (idx * 120000));
      return {
        id: inc.id,
        timestamp: formatISTDateTime(threatTime),
        status: 'compromised',
        verdict: 'REJECT',
        threatType: inc.threat_category || 'Quantum Channel Intrusion',
        reason: inc.summary || inc.final_assessment || `QBER ${(inc.qber * 100).toFixed(1)}% exceeded Hoeffding limit`,
        nodes: `TARGET: ${inc.session_id}`,
        size: '2.4 KB',
        payload: {
          incident_id: inc.id,
          session_id: inc.session_id,
          event: inc.event,
          severity: inc.severity,
          threat_category: inc.threat_category,
          summary: inc.summary,
          qber_observed: inc.qber,
          chsh_score: inc.chsh,
          evidence: inc.evidence,
          detection_timeline: inc.detection_timeline,
          final_assessment: inc.final_assessment,
          flagged_at_ist: formatISTDateTime(threatTime)
        }
      };
    });

    return {
      'quantum-sessions': { name: 'Quantum Sessions', records: sessionRecords },
      'active-threats': { name: 'Active Threats', isView: true, records: threatRecords },
      'node-telemetry': { name: 'Node Telemetry', records: nodeRecords },
      'crypto-keys': { name: 'Crypto Keys', records: keyRecords },
      'auth-logs': { name: 'Auth Logs', records: logRecords }
    };
  }, [liveSessions, liveNodes, liveIncidents, liveTelemetryLogs]);

  const currentTable = tablesData[selectedTableId] || tablesData['quantum-sessions'];

  // Filtered Table Names in Left Sidebar
  const filteredTableKeys = useMemo(() => {
    return Object.keys(tablesData).filter((key) =>
      tablesData[key].name.toLowerCase().includes(searchTableQuery.toLowerCase())
    );
  }, [tablesData, searchTableQuery]);

  // Filtered & Sorted Rows
  const processedRecords = useMemo(() => {
    let list = [...currentTable.records];

    // Status Filter Tab
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }

    // Global Search filter
    if (globalSearchParam.trim()) {
      const q = globalSearchParam.toLowerCase();
      list = list.filter((rec) =>
        rec.id.toLowerCase().includes(q) ||
        rec.status.toLowerCase().includes(q) ||
        rec.verdict.toLowerCase().includes(q) ||
        rec.threatType.toLowerCase().includes(q) ||
        rec.reason.toLowerCase().includes(q) ||
        rec.nodes.toLowerCase().includes(q) ||
        JSON.stringify(rec.payload).toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [currentTable, statusFilter, globalSearchParam, sortColumn, sortDirection]);

  // Selected Active Record for Inspector Drawer
  const activeRecord = useMemo(() => {
    return (
      processedRecords.find((r) => r.id === selectedRecordId) ||
      processedRecords[0] ||
      null
    );
  }, [processedRecords, selectedRecordId]);

  // Auto-select first row when switching tables
  useEffect(() => {
    if (processedRecords.length > 0 && (!selectedRecordId || !processedRecords.some(r => r.id === selectedRecordId))) {
      setSelectedRecordId(processedRecords[0].id);
    }
  }, [selectedTableId, processedRecords]);

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setStatusFilter('all');
  };

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleCopyJson = () => {
    if (!activeRecord) return;
    navigator.clipboard.writeText(JSON.stringify(activeRecord.payload, null, 2));
    showToast('Payload JSON copied to clipboard.');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FBF8FA] overflow-hidden select-none font-sans relative">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#091426] text-white px-4 py-2 rounded-[2px] shadow-2xl font-mono text-[11px] flex items-center gap-2 border border-[#334155] animate-fade-in">
          <Check className="w-3.5 h-3.5 text-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. TOP NAVIGATION BAR ─── */}
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] h-14 w-full flex items-center justify-between px-6 shrink-0 z-40 relative">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              window.open('/home', '_blank');
            } else if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/home';
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity z-10"
          title="Return to Central Gateway Hub (Ctrl+Click to open in new tab)"
        >
          <div className="relative flex items-center justify-center text-[#091426]">
            <Shield className="w-5 h-5" strokeWidth={2.2} />
            <span className="absolute w-1.5 h-1.5 bg-[#091426] rounded-full top-[8.5px]" />
          </div>
          <span className="font-bold text-[#091426] tracking-tight text-[16px] font-sans">
            QDS SENTINEL
          </span>
        </div>

        {/* Center: DATABASE INSPECTOR Active Tab */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="h-full flex items-center border-b-2 border-[#0058BE] text-[#0058BE] px-6 font-medium text-[15px] pointer-events-auto cursor-pointer"
          >
            DATABASE INSPECTOR
          </div>
        </div>

        {/* Right: Search Parameters Input, Refresh, Settings, Notification Bell & User Avatar */}
        <div className="flex items-center gap-3 z-10 relative">
          <div className="relative flex items-center w-52">
            <Search className="w-3.5 h-3.5 text-[#75777D] absolute left-2.5 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search parameters..."
              value={globalSearchParam}
              onChange={(e) => setGlobalSearchParam(e.target.value)}
              className="pl-8 pr-6 h-8 text-[11px]"
            />
            {globalSearchParam && (
              <button
                onClick={() => setGlobalSearchParam('')}
                className="absolute right-2.5 text-[#94A3B8] hover:text-[#091426] text-[11px] cursor-pointer z-10"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => {
              loadDatabaseData();
              showToast('Live database sync complete.');
            }}
            disabled={isRefreshing}
            className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#0058BE] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
            title="Refresh all data from Database"
          >
            <RefreshCw className={`w-[17px] h-[17px] ${isRefreshing ? 'animate-spin text-[#0058BE]' : ''}`} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
            title="Database Connection Settings"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          <div className="relative">
            <button 
              onClick={() => { setShowNotificationsPopover(!showNotificationsPopover); setShowUserProfilePopover(false); }}
              className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
              title="Database Cluster Notifications"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {liveIncidents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A]" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotificationsPopover && (
              <div className="absolute right-0 top-10 w-72 bg-white border border-[#E2E8F0] shadow-xl rounded-[2px] z-50 p-3.5 font-mono text-[11px] animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="font-bold text-[#091426]">DATABASE STATS</span>
                  <button onClick={() => setShowNotificationsPopover(false)} className="text-[#75777D] hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2 space-y-1.5 text-[#475467] text-[10.5px]">
                  <div>● Total Sessions Stored: <strong>{liveSessions.length}</strong></div>
                  <div>● Active Threats Flagged: <strong className="text-[#BA1A1A]">{liveIncidents.length}</strong></div>
                  <div>● Total Nodes Online: <strong>{liveNodes.length}</strong></div>
                  <div>● Last Synced: <strong>{lastSyncTime}</strong></div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowUserProfilePopover(!showUserProfilePopover); setShowNotificationsPopover(false); }}
              className="w-8 h-8 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors cursor-pointer overflow-hidden"
              title="DB Administrator Identity"
            >
              <User className="w-[16px] h-[16px]" strokeWidth={1.8} />
            </button>

            {/* User Profile Popover */}
            {showUserProfilePopover && (
              <div className="absolute right-0 top-10 w-64 bg-white border border-[#E2E8F0] shadow-xl rounded-[2px] z-50 p-3.5 font-mono text-[11px] animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="font-bold text-[#091426]">DB ADMIN CREDENTIALS</span>
                  <button onClick={() => setShowUserProfilePopover(false)} className="text-[#75777D] hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2.5 space-y-1.5 text-[#475467] text-[10.5px]">
                  <div>User: <strong>postgres_admin</strong></div>
                  <div>Database: <strong>qds_production_db</strong></div>
                  <div>Role: <strong className="text-[#0058BE]">SUPERUSER (RW)</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN 3-PANE DATABASE WORKSPACE ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT SIDEBAR: SCHEMAS / TABLES (~220px) ─── */}
        <aside className="w-[220px] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col shrink-0 font-mono">
          {/* Filter Tables Search Bar */}
          <div className="p-3 border-b border-[#E2E8F0]">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-[#75777D] absolute left-2.5 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Filter tables..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="pl-7 pr-2 h-7 text-[10.5px]"
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="px-3.5 py-2.5 text-[10px] font-bold text-[#75777D] uppercase tracking-wider">
            SCHEMAS / TABLES
          </div>

          {/* Tables List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 px-1.5">
            {filteredTableKeys.map((key) => {
              const tbl = tablesData[key];
              const isSelected = selectedTableId === key;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectTable(key)}
                  className={`px-2.5 py-2 rounded-[2px] flex items-center justify-between cursor-pointer text-[12px] transition-colors ${
                    isSelected
                      ? 'bg-[#EBF3FF] text-[#0058BE] font-bold'
                      : 'text-[#45474C] hover:bg-[#F6F3F5] hover:text-[#091426]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TableIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#0058BE]' : 'text-[#75777D]'}`} />
                    <span className={`truncate ${tbl.isView ? 'italic' : ''}`}>
                      {tbl.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-[#0058BE]/10 text-[#0058BE] font-bold' : 'text-[#94A3B8]'
                  }`}>
                    {tbl.records.length}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── CENTER PANE: LIVE TABLE VIEWER + DATA SPREADSHEET GRID ─── */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] overflow-hidden">
          {/* Top Live Table Header & Status Filter Bar */}
          <div className="h-12 border-b border-[#E2E8F0] px-4 flex items-center justify-between bg-[#FFFFFF] shrink-0 font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#091426]">
                <Database className="w-4 h-4 text-[#0058BE]" />
                <span className="uppercase">{currentTable.name}</span>
              </div>
              <span className="text-[11px] text-[#75777D]">
                ({processedRecords.length} records)
              </span>
            </div>

            {/* Quick Status Filter ButtonGroup */}
            <div className="flex items-center gap-2">
              <ButtonGroup>
                <ButtonGroupText>Status:</ButtonGroupText>
                {[
                  { id: 'all', label: 'ALL' },
                  { id: 'active', label: 'ACTIVE' },
                  { id: 'degraded', label: 'DEGRADED' },
                  { id: 'compromised', label: 'COMPROMISED' },
                ].map((pill) => (
                  <Button
                    key={pill.id}
                    variant={statusFilter === pill.id ? 'default' : 'ghost'}
                    size="xs"
                    onClick={() => setStatusFilter(pill.id)}
                    className="px-2 h-6 text-[9.5px]"
                  >
                    {pill.label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </div>

          {/* Spreadsheet Data Grid with Verdict, Threat Type & Reason Columns */}
          <div className="flex-1 overflow-auto relative font-mono text-[11.5px] bg-[#FFFFFF]">
            <table className="w-full text-left border-collapse">
              {/* Table Column Headers with Clickable Sorting */}
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#75777D] text-[10.5px] uppercase tracking-wider sticky top-0 z-10 select-none">
                <tr>
                  <th className="w-10 px-2 py-2 border-r border-[#E2E8F0] text-center font-normal text-[#94A3B8]">#</th>
                  
                  {/* ID */}
                  <th 
                    onClick={() => handleSort('id')}
                    className="w-36 px-3 py-2 border-r border-[#E2E8F0] cursor-pointer hover:text-[#091426] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>ID</span>
                      {sortColumn === 'id' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#0058BE]" /> : <ArrowDown className="w-3 h-3 text-[#0058BE]" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  {/* TIMESTAMP */}
                  <th 
                    onClick={() => handleSort('timestamp')}
                    className="w-44 px-3 py-2 border-r border-[#E2E8F0] cursor-pointer hover:text-[#091426] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>TIMESTAMP (IST)</span>
                      {sortColumn === 'timestamp' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#0058BE]" /> : <ArrowDown className="w-3 h-3 text-[#0058BE]" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  {/* VERDICT COLUMN */}
                  <th 
                    onClick={() => handleSort('verdict')}
                    className="w-28 px-3 py-2 border-r border-[#E2E8F0] cursor-pointer hover:text-[#091426] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>VERDICT</span>
                      {sortColumn === 'verdict' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#0058BE]" /> : <ArrowDown className="w-3 h-3 text-[#0058BE]" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  {/* THREAT TYPE COLUMN */}
                  <th 
                    onClick={() => handleSort('threatType')}
                    className="w-48 px-3 py-2 border-r border-[#E2E8F0] cursor-pointer hover:text-[#091426] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>THREAT TYPE</span>
                      {sortColumn === 'threatType' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#0058BE]" /> : <ArrowDown className="w-3 h-3 text-[#0058BE]" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  {/* REASON COLUMN */}
                  <th 
                    onClick={() => handleSort('reason')}
                    className="min-w-[240px] px-3 py-2 border-r border-[#E2E8F0] cursor-pointer hover:text-[#091426] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>REASON / AUDIT RATIONALE</span>
                      {sortColumn === 'reason' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#0058BE]" /> : <ArrowDown className="w-3 h-3 text-[#0058BE]" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  {/* STATUS */}
                  <th 
                    onClick={() => handleSort('status')}
                    className="w-28 px-3 py-2 cursor-pointer hover:text-[#091426] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>STATUS</span>
                      {sortColumn === 'status' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#0058BE]" /> : <ArrowDown className="w-3 h-3 text-[#0058BE]" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-[#E2E8F0] text-[#091426]">
                {processedRecords.map((rec, index) => {
                  const isSelected = activeRecord?.id === rec.id;
                  const isReject = rec.verdict === 'REJECT' || rec.verdict === 'FAIL';
                  const isAccept = rec.verdict === 'ACCEPT' || rec.verdict === 'PASS' || rec.verdict === 'ONLINE';

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => {
                        setSelectedRecordId(rec.id);
                        setIsInspectorOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EBF3FF] border-l-2 border-l-[#0058BE]'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="px-2 py-2.5 border-r border-[#E2E8F0] text-center text-[#94A3B8] text-[10px]">
                        {index + 1}
                      </td>

                      {/* ID Column */}
                      <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#091426] truncate">
                        {rec.id}
                      </td>

                      {/* Timestamp Column */}
                      <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-[#475467] text-[11px] truncate">
                        {rec.timestamp}
                      </td>

                      {/* Verdict Column (Styled cleanly like Status with no box) */}
                      <td className="px-3 py-2.5 border-r border-[#E2E8F0]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isAccept
                              ? 'bg-[#10B981]'
                              : isReject
                              ? 'bg-[#EF4444]'
                              : 'bg-[#F59E0B]'
                          }`} />
                          <span className={`${
                            isAccept
                              ? 'text-[#065F46]'
                              : isReject
                              ? 'text-[#B91C1C]'
                              : 'text-[#92400E]'
                          }`}>
                            {rec.verdict}
                          </span>
                        </div>
                      </td>

                      {/* Threat Type Column */}
                      <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-[11px]">
                        <span className={`${
                          rec.threatType.includes('None') || rec.threatType.includes('Nominal')
                            ? 'text-[#475467]'
                            : 'text-[#DC2626] font-bold'
                        }`}>
                          {rec.threatType}
                        </span>
                      </td>

                      {/* Reason Column */}
                      <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-[11px] text-[#334155] max-w-md truncate" title={rec.reason}>
                        {rec.reason}
                      </td>

                      {/* Status Column */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            rec.status === 'active' || rec.status === 'verified'
                              ? 'bg-[#10B981]'
                              : rec.status === 'degraded'
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#EF4444]'
                          }`} />
                          <span className={`${
                            rec.status === 'active' || rec.status === 'verified'
                              ? 'text-[#065F46]'
                              : rec.status === 'degraded'
                              ? 'text-[#92400E]'
                              : 'text-[#B91C1C]'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Status Bar */}
          <footer className="h-8 bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 flex items-center justify-between text-[10px] font-mono text-[#75777D] shrink-0">
            <div className="flex items-center gap-4">
              <span>DISPLAYING {processedRecords.length} OF {currentTable.records.length} RECORDS IN {currentTable.name.toUpperCase()}</span>
              <span>SYNC: {lastSyncTime}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#065F46] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>CONNECTED TO POSTGRES_SENTINEL_DB</span>
            </div>
          </footer>
        </section>

        {/* ─── RIGHT DRAWER: RECORD INSPECTOR (~360px) ─── */}
        {isInspectorOpen && activeRecord && (
          <aside className="w-[360px] bg-[#FFFFFF] border-l border-[#E2E8F0] flex flex-col justify-between shrink-0 font-mono shadow-sm animate-fade-in">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="text-[12px] font-bold text-[#091426] uppercase tracking-wider">
                  RECORD INSPECTOR
                </span>
                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="text-[#75777D] hover:text-[#091426] cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Section 1: METADATA */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#75777D] uppercase tracking-wider block">
                  METADATA
                </span>
                <div className="space-y-1.5 text-[11px] text-[#475467]">
                  <div className="flex justify-between">
                    <span className="text-[#75777D]">id</span>
                    <span className="font-bold text-[#091426]">{activeRecord.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777D]">verdict</span>
                    <span className={`font-bold ${
                      activeRecord.verdict === 'ACCEPT' || activeRecord.verdict === 'PASS' || activeRecord.verdict === 'ONLINE'
                        ? 'text-[#065F46]'
                        : 'text-[#B91C1C]'
                    }`}>
                      {activeRecord.verdict}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777D]">threat_type</span>
                    <span className="font-bold text-[#091426]">{activeRecord.threatType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777D]">timestamp</span>
                    <span className="text-[#091426]">{activeRecord.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777D]">size</span>
                    <span className="text-[#091426]">{activeRecord.size}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: PAYLOAD (JSONB) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#75777D] uppercase tracking-wider">
                    PAYLOAD (JSONB)
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="text-[9.5px] text-[#0058BE] hover:underline uppercase font-bold cursor-pointer"
                  >
                    COPY JSON
                  </button>
                </div>

                {/* Dark Navy Formatted JSON Syntax Viewer */}
                <div className="bg-[#0C1322] border border-[#1E293B] rounded-[2px] p-3.5 text-[11px] leading-relaxed overflow-x-auto text-[#E2E8F0] max-h-[380px]">
                  <pre className="font-mono">
                    <code>
                      {`{\n`}
                      {Object.entries(activeRecord.payload).map(([k, v], idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        if (typeof v === 'object' && v !== null) {
                          return (
                            <div key={k} className="pl-4">
                              <span className="text-[#93C5FD]">"{k}"</span>: {JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')}{isLast ? '' : ','}
                            </div>
                          );
                        }
                        return (
                          <div key={k} className="pl-4">
                            <span className="text-[#93C5FD]">"{k}"</span>: {typeof v === 'string' ? (
                              <span className="text-[#4ADE80]">"{v}"</span>
                            ) : typeof v === 'number' ? (
                              <span className="text-[#F87171]">{v}</span>
                            ) : (
                              <span className="text-[#60A5FA]">{String(v)}</span>
                            )}{isLast ? '' : ','}
                          </div>
                        );
                      })}
                      {`}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#E2E8F0] flex gap-3 bg-[#FFFFFF]">
              <button
                onClick={handleCopyJson}
                className="flex-1 py-2.5 bg-[#FFFFFF] hover:bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] text-[11px] font-bold text-[#091426] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#0058BE]" />
                <span>COPY PAYLOAD</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ─── SETTINGS MODAL ─── */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-md overflow-hidden font-sans" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  DATABASE CLUSTER CONFIGURATION
                </span>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[11px] text-[#45474C]">
              <div>PostgreSQL Host: <strong>localhost:5432</strong></div>
              <div>Database: <strong>qds_production_db</strong></div>
              <div>Connection Pool: <strong>20 max / 5 idle (Connected)</strong></div>
              <div>JSONB Storage: <strong>LZ4 active</strong></div>
              <div>SSL Encryption: <strong>TLS 1.3</strong></div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-2 bg-[#091426] hover:bg-[#1E293B] text-white font-bold uppercase tracking-wider rounded-[2px] cursor-pointer text-[10px]"
                >
                  Close Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
