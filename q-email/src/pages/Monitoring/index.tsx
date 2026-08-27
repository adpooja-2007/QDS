import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Shield, 
  ShieldCheck,
  Search, 
  Settings, 
  Bell, 
  Cpu, 
  LayoutGrid, 
  AlertTriangle, 
  History, 
  Network, 
  Sliders, 
  Terminal,
  Download,
  X,
  Copy,
  Check,
  ExternalLink,
  Info,
  Pause,
  Play,
  RotateCcw,
  FileText,
  Filter,
  CheckCircle,
  RefreshCw,
  FileDown,
  Lock,
  Unlock,
  Zap,
  Activity,
  Plus,
  Minus,
  ShieldAlert
} from 'lucide-react';
import { 
  TelemetryLog, 
  SystemPerformance, 
  HistoricalPoint, 
  QuantumSession, 
  QuantumNode, 
  SecurityIncident 
} from '../../types/sentinel';
import { sentinelService } from '../../services/sentinelService';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Progress } from '../../components/ui/progress';
import { ButtonGroup } from '../../components/ui/button-group';

type MonitoringTab = 'overview' | 'threats' | 'incidents' | 'sessions' | 'network';

interface TelemetryStreamItem {
  id: string;
  timestamp: string;
  subsystem: string;
  event_type: string;
  latency_ms: number;
  status_code: number;
  message: string;
  qber: number;
  chsh_score: number;
  security_score: 'Nominal' | 'Degraded' | 'Secure';
  is_error: boolean;
  reason?: string;
}

export interface ThreatAnomalyItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH';
  origin_node: string;
  anomaly_type: string;
  time: string;
  title: string;
  telemetry: {
    node: string;
    baseline_qber: string;
    current_qber: string;
  };
  risk_bars: Array<{ height: number; color: string }>;
}

export const defaultThreatAnomalies: ThreatAnomalyItem[] = [
  {
    id: 'anom-1',
    severity: 'CRITICAL',
    origin_node: 'NODE-104',
    anomaly_type: 'Sudden QBER Spike',
    time: '21:55:01 IST',
    title: 'SUDDEN QBER SPIKE',
    telemetry: {
      node: 'NODE-104',
      baseline_qber: '1.2%',
      current_qber: '8.4%',
    },
    risk_bars: [
      { height: 22, color: '#0058BE' },
      { height: 28, color: '#0058BE' },
      { height: 24, color: '#0058BE' },
      { height: 48, color: '#C2410C' },
      { height: 92, color: '#BA1A1A' },
    ],
  },
  {
    id: 'anom-2',
    severity: 'HIGH',
    origin_node: 'QKD-NODE-07',
    anomaly_type: 'Basis Mismatch Trend',
    time: '21:48:33 IST',
    title: 'BASIS MISMATCH TREND',
    telemetry: {
      node: 'QKD-NODE-07',
      baseline_qber: '1.8%',
      current_qber: '5.6%',
    },
    risk_bars: [
      { height: 18, color: '#0058BE' },
      { height: 22, color: '#0058BE' },
      { height: 35, color: '#0058BE' },
      { height: 62, color: '#C2410C' },
      { height: 78, color: '#BA1A1A' },
    ],
  },
];

export interface IncidentDetailItem {
  id: string;
  status: 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  status_color: string;
  assigned: string;
  impact: 'HIGH' | 'CRITICAL' | 'LOW' | 'MED';
  impact_color: string;
  title: string;
  description: string;
  timeline: Array<{
    time: string;
    title: string;
    title_color?: string;
    dot_color: string;
    description: string;
    terminal?: {
      command: string;
      output: string;
    };
  }>;
}

export const defaultIncidentRecords: IncidentDetailItem[] = [
  {
    id: 'INC-9482-A',
    status: 'INVESTIGATING',
    status_color: '#C2540A',
    assigned: 'J. Doe (L2)',
    impact: 'HIGH',
    impact_color: '#BA1A1A',
    title: 'Quantum Channel Eavesdrop Probe',
    description: 'Uncorrelated polarization basis mismatch detected along Arbitrator -> Bob dark fiber link.',
    timeline: [
      {
        time: '11:15:02 UTC',
        title: 'Initial Detection',
        title_color: '#091426',
        dot_color: '#94A3B8',
        description: 'Parity mismatch threshold breached on qubit stream index #042.'
      },
      {
        time: '11:15:18 UTC',
        title: 'Threshold Exceeded',
        title_color: '#C2410C',
        dot_color: '#C2410C',
        description: 'Observed QBER 8.4% exceeded 5.0% Hoeffding statistical bound.'
      },
      {
        time: '11:15:20 UTC',
        title: 'Active Investigation',
        title_color: '#C2540A',
        dot_color: '#C2540A',
        description: 'L2 incident analyst J. Doe dispatched optoelectronic decoy state pulse diagnostic.'
      }
    ]
  },
  {
    id: 'INC-9481-B',
    status: 'ESCALATED',
    status_color: '#BA1A1A',
    assigned: 'A. Smith (L3)',
    impact: 'CRITICAL',
    impact_color: '#BA1A1A',
    title: 'Classical Feed-Forward Bit Forgery',
    description: 'Malformed TLS signature feed-forward packet intercepted with invalid SHA3 hash.',
    timeline: [
      {
        time: '10:58:10 UTC',
        title: 'Initial Detection',
        title_color: '#091426',
        dot_color: '#94A3B8',
        description: 'Pauli frame correction bit mismatch received by Bob transceiver.'
      },
      {
        time: '10:58:22 UTC',
        title: 'Signature Verification Failed',
        title_color: '#BA1A1A',
        dot_color: '#BA1A1A',
        description: 'Bell state verification collapsed: S = 1.62 < 2.0 Tsirelson bound.'
      },
      {
        time: '10:58:25 UTC',
        title: 'Escalated to L3 Core',
        title_color: '#BA1A1A',
        dot_color: '#BA1A1A',
        description: 'Security incident escalated to L3 Quantum Cryptanalyst A. Smith for forensic pcap inspection.'
      }
    ]
  },
  {
    id: 'INC-9479-X',
    status: 'RESOLVED',
    status_color: '#16A34A',
    assigned: 'SYSTEM AUTO',
    impact: 'LOW',
    impact_color: '#16A34A',
    title: 'Brute Force Mitigation',
    description: 'Automated lock applied to repeated failed auth attempts.',
    timeline: [
      {
        time: '10:42:01 UTC',
        title: 'Initial Detection',
        title_color: '#091426',
        dot_color: '#CBD5E1',
        description: 'Anomaly detected in auth sequence from IP 192.168.1.55.'
      },
      {
        time: '10:42:15 UTC',
        title: 'Threshold Exceeded',
        title_color: '#C2410C',
        dot_color: '#C2410C',
        description: 'Failed attempts > 5 within 10s window.'
      },
      {
        time: '10:42:16 UTC',
        title: 'Auto-Resolution',
        title_color: '#16A34A',
        dot_color: '#16A34A',
        description: 'Firewall rules updated and origin IP blocked.',
        terminal: {
          command: '> ip_block add 192.168.1.55 3600',
          output: '[OK] Rule applied to perimeter firewall.'
        }
      }
    ]
  },
  {
    id: 'INC-9475-C',
    status: 'RESOLVED',
    status_color: '#16A34A',
    assigned: 'M. Chen (L1)',
    impact: 'MED',
    impact_color: '#16A34A',
    title: 'Optical Polarization Drift',
    description: 'Thermal drift on BBO crystal Peltier core corrected by auto-alignment loop.',
    timeline: [
      {
        time: '09:30:12 UTC',
        title: 'Initial Detection',
        title_color: '#091426',
        dot_color: '#CBD5E1',
        description: 'Phase shift deviation detected (+0.14 rad) on Dark Fiber Link 1.'
      },
      {
        time: '09:30:25 UTC',
        title: 'Auto-Calibration',
        title_color: '#16A34A',
        dot_color: '#16A34A',
        description: 'PID temperature controller locked crystal core to 24.81°C.'
      },
      {
        time: '09:30:30 UTC',
        title: 'Channel Nominal',
        title_color: '#16A34A',
        dot_color: '#16A34A',
        description: 'Entangled pair state fidelity restored to 99.4%.'
      }
    ]
  }
];

export interface SessionChannelItem {
  id: string;
  endpoint: string;
  status: 'STABLE' | 'DEGRADED' | 'PAUSED' | 'TERMINATED';
  statusColor?: string;
  fidelity_type?: string;
  keyRate: string | number;
  duration: string;
}

export const defaultSessionChannels: SessionChannelItem[] = [
  {
    id: '01',
    endpoint: 'QNode-A-09',
    status: 'STABLE',
    statusColor: '#065F46',
    fidelity_type: 'sine_tick',
    keyRate: '245.8',
    duration: '04:12:33',
  },
  {
    id: '02',
    endpoint: 'QNode-F-22',
    status: 'DEGRADED',
    statusColor: '#C2540A',
    fidelity_type: 'wave_dot',
    keyRate: '112.4',
    duration: '01:45:10',
  },
  {
    id: '03',
    endpoint: 'Sat-Link-Alpha',
    status: 'STABLE',
    statusColor: '#065F46',
    fidelity_type: 'step_dip',
    keyRate: '450.1',
    duration: '12:05:44',
  },
];

interface MonitoringPageProps {
  telemetryLogs: TelemetryLog[];
  performance: SystemPerformance;
  historicalData: HistoricalPoint[];
  sessions: QuantumSession[];
  activeSession: QuantumSession;
  nodes?: QuantumNode[];
  incidents?: SecurityIncident[];
  onSelectSession?: (id: string) => void;
  onGenerateSignature?: (name: string, size: number) => Promise<any>;
  isLoading?: boolean;
  onNavigateHome: () => void;
  onNavigateDemonstration: () => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({
  telemetryLogs,
  performance,
  historicalData,
  sessions,
  activeSession,
  nodes = [],
  incidents = [],
  onSelectSession,
  onGenerateSignature,
  isLoading = false,
  onNavigateHome,
  onNavigateDemonstration,
}) => {
  // Navigation & Search State with localStorage persistence
  const [activeTab, setActiveTab] = useState<MonitoringTab>(() => {
    try {
      return (localStorage.getItem('qds_monitoring_tab') as MonitoringTab) || 'overview';
    } catch {
      return 'overview';
    }
  });
  useEffect(() => {
    try { localStorage.setItem('qds_monitoring_tab', activeTab); } catch {}
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Popovers State
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState<boolean>(false);
  const [showUserProfilePopover, setShowUserProfilePopover] = useState<boolean>(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState<boolean>(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);
  const [selectedTelemetryDetail, setSelectedTelemetryDetail] = useState<TelemetryStreamItem | null>(null);
  const [showHoeffdingModal, setShowHoeffdingModal] = useState<boolean>(false);
  const [showChshModal, setShowChshModal] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(incidents[0] || null);

  // Graph Interactivity State
  const [hoveredQberPoint, setHoveredQberPoint] = useState<{
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    item: TelemetryStreamItem;
    index: number;
  } | null>(null);

  const [hoveredChshPoint, setHoveredChshPoint] = useState<{
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    item: TelemetryStreamItem;
    index: number;
  } | null>(null);

  const [graphTimeRange, setGraphTimeRange] = useState<'1M' | '5M' | '15M' | 'ALL'>('5M');
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);

  // Live Functionality & Tuning Parameters with full localStorage persistence
  const [liveLatency, setLiveLatency] = useState<number>(14);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [pollInterval, setPollInterval] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qds_poll_interval');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 2500;
  });
  useEffect(() => {
    try { localStorage.setItem('qds_poll_interval', pollInterval.toString()); } catch {}
  }, [pollInterval]);

  const [hoeffdingAlpha, setHoeffdingAlpha] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qds_hoeffding_alpha');
      if (saved) return parseFloat(saved);
    } catch {}
    return 0.001;
  });
  useEffect(() => {
    try { localStorage.setItem('qds_hoeffding_alpha', hoeffdingAlpha.toString()); } catch {}
  }, [hoeffdingAlpha]);

  const [quarantinedNodes, setQuarantinedNodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qds_quarantined_nodes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['NODE-EVE-01'];
  });
  useEffect(() => {
    try { localStorage.setItem('qds_quarantined_nodes', JSON.stringify(quarantinedNodes)); } catch {}
  }, [quarantinedNodes]);

  const [threatAnomalies, setThreatAnomalies] = useState<ThreatAnomalyItem[]>(() => {
    try {
      const saved = localStorage.getItem('qds_threat_anomalies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultThreatAnomalies;
  });
  useEffect(() => {
    try { localStorage.setItem('qds_threat_anomalies', JSON.stringify(threatAnomalies)); } catch {}
  }, [threatAnomalies]);

  const [selectedThreatAnomaly, setSelectedThreatAnomaly] = useState<ThreatAnomalyItem | null>(() => {
    try {
      const saved = localStorage.getItem('qds_selected_threat_anomaly');
      if (saved) {
        if (saved === 'null') return null;
        return JSON.parse(saved);
      }
    } catch {}
    return defaultThreatAnomalies[0];
  });
  useEffect(() => {
    try {
      localStorage.setItem('qds_selected_threat_anomaly', selectedThreatAnomaly ? JSON.stringify(selectedThreatAnomaly) : 'null');
    } catch {}
  }, [selectedThreatAnomaly]);

  const [threatSeverityFilter, setThreatSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [hoveredRiskBar, setHoveredRiskBar] = useState<{
    idx: number;
    height: number;
    color: string;
    qber: string;
    sampleTime: string;
  } | null>(null);

  // Incidents Ledger State (Exact Replica of Reference Architecture with Reliable Selection & Status Persistence)
  const [incidentsList, setIncidentsList] = useState<IncidentDetailItem[]>(() => {
    try {
      const saved = localStorage.getItem('qds_incidents_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultIncidentRecords;
  });
  useEffect(() => {
    try { localStorage.setItem('qds_incidents_list', JSON.stringify(incidentsList)); } catch {}
  }, [incidentsList]);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('qds_selected_incident_id');
      if (saved) return saved;
    } catch {}
    return defaultIncidentRecords[2].id; // Default to INC-9479-X as in reference image!
  });
  useEffect(() => {
    try {
      localStorage.setItem('qds_selected_incident_id', selectedIncidentId);
    } catch {}
  }, [selectedIncidentId]);

  const selectedIncidentDetail = useMemo(() => {
    return incidentsList.find(i => i.id === selectedIncidentId) || incidentsList[0] || defaultIncidentRecords[2];
  }, [incidentsList, selectedIncidentId]);

  const lastProcessedIncidentStreamIdRef = useRef<string | null>(null);

  // Quantum Sessions / Communication Channels Ledger State (Backend Integrated & Persistent)
  const [sessionChannels, setSessionChannels] = useState<SessionChannelItem[]>(() => {
    try {
      const saved = localStorage.getItem('qds_session_channels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultSessionChannels;
  });
  useEffect(() => {
    try { localStorage.setItem('qds_session_channels', JSON.stringify(sessionChannels)); } catch {}
  }, [sessionChannels]);

  const [selectedSessionChannelId, setSelectedSessionChannelId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('qds_selected_session_channel_id');
      if (saved) return saved;
    } catch {}
    return '01';
  });
  useEffect(() => {
    try { localStorage.setItem('qds_selected_session_channel_id', selectedSessionChannelId); } catch {}
  }, [selectedSessionChannelId]);

  // Real-time Live Session Channel Synchronization across components without reload
  useEffect(() => {
    const handleLiveSessionUpdate = (e?: any) => {
      try {
        if (e && e.detail && Array.isArray(e.detail)) {
          setSessionChannels(e.detail);
          return;
        }
        const saved = localStorage.getItem('qds_session_channels');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessionChannels(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('qds_session_created', handleLiveSessionUpdate);
    window.addEventListener('storage', handleLiveSessionUpdate);

    // Fast seamless interval to sync changes made in other views/tabs
    const pollTimer = setInterval(handleLiveSessionUpdate, 800);

    return () => {
      window.removeEventListener('qds_session_created', handleLiveSessionUpdate);
      window.removeEventListener('storage', handleLiveSessionUpdate);
      clearInterval(pollTimer);
    };
  }, []);

  const handleSyncChannel = async (channelId: string) => {
    try {
      const res = await apiClient.triggerSessionChannelAction({ channel_id: channelId, action: 'sync' });
      if (res && res.channel) {
        setSessionChannels(prev => prev.map(c => c.id === channelId ? {
          ...c,
          status: 'STABLE',
          statusColor: '#065F46',
          keyRate: res.channel.key_rate
        } : c));
        showToast(res.message || `Channel ${res.channel.endpoint} synchronized.`);
      } else {
        setSessionChannels(prev => prev.map(c => c.id === channelId ? {
          ...c,
          status: 'STABLE',
          statusColor: '#065F46'
        } : c));
        showToast(`Channel ${channelId} telemetry history re-synchronized.`);
      }
    } catch {
      setSessionChannels(prev => prev.map(c => c.id === channelId ? {
        ...c,
        status: 'STABLE',
        statusColor: '#065F46'
      } : c));
      showToast(`Channel ${channelId} telemetry history re-synchronized.`);
    }
  };

  const handleTerminateChannel = async (channelId: string) => {
    try {
      const res = await apiClient.triggerSessionChannelAction({ channel_id: channelId, action: 'terminate' });
      if (res && res.channel) {
        setSessionChannels(prev => prev.map(c => c.id === channelId ? {
          ...c,
          status: res.channel.status as any,
          statusColor: res.channel.status_color
        } : c));
        showToast(res.message || `Channel ${channelId} stream updated.`);
      } else {
        setSessionChannels(prev => prev.map(c => {
          if (c.id === channelId) {
            const nextStatus = c.status === 'PAUSED' ? 'STABLE' : 'PAUSED';
            return {
              ...c,
              status: nextStatus,
              statusColor: nextStatus === 'PAUSED' ? '#75777D' : '#065F46'
            };
          }
          return c;
        }));
        showToast(`Quantum stream for channel ${channelId} updated.`);
      }
    } catch {
      setSessionChannels(prev => prev.map(c => {
        if (c.id === channelId) {
          const nextStatus = c.status === 'PAUSED' ? 'STABLE' : 'PAUSED';
          return {
            ...c,
            status: nextStatus,
            statusColor: nextStatus === 'PAUSED' ? '#75777D' : '#065F46'
          };
        }
        return c;
      }));
      showToast(`Quantum stream for channel ${channelId} updated.`);
    }
  };
  
  // Modals & Action States
  const [showCreateIncidentModal, setShowCreateIncidentModal] = useState<boolean>(false);
  const [newIncidentForm, setNewIncidentForm] = useState({
    title: '',
    assigned: 'J. Doe (L2)',
    impact: 'HIGH' as 'HIGH' | 'CRITICAL' | 'LOW' | 'MED',
    description: '',
    initialDetail: ''
  });

  const [showCreateSessionModal, setShowCreateSessionModal] = useState<boolean>(false);
  const [newSessionForm, setNewSessionForm] = useState({
    endpoint: '',
    status: 'STABLE' as 'STABLE' | 'DEGRADED',
    fidelity_type: 'sine_tick' as 'sine_tick' | 'wave_dot' | 'step_dip',
    key_rate: '310.5'
  });

  const handleCreateNewSessionChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionForm.endpoint.trim()) return;

    try {
      const res = await apiClient.createSessionChannel({
        endpoint: newSessionForm.endpoint.trim(),
        status: newSessionForm.status,
        fidelity_type: newSessionForm.fidelity_type,
        key_rate: parseFloat(newSessionForm.key_rate) || 310.5
      });
      if (res && res.channel) {
        const newChan: SessionChannelItem = {
          id: res.channel.id,
          endpoint: res.channel.endpoint,
          status: res.channel.status as any,
          statusColor: res.channel.status_color || (res.channel.status === 'STABLE' ? '#065F46' : '#C2540A'),
          fidelity_type: res.channel.fidelity_type,
          keyRate: res.channel.key_rate,
          duration: res.channel.duration || '00:00:01'
        };
        setSessionChannels(prev => [...prev, newChan]);
        setSelectedSessionChannelId(newChan.id);
        showToast(res.message || `Channel ${newChan.endpoint} created.`);
      }
    } catch {
      const nextId = `${(sessionChannels.length + 1).toString().padStart(2, '0')}`;
      const newChan: SessionChannelItem = {
        id: nextId,
        endpoint: newSessionForm.endpoint.trim(),
        status: newSessionForm.status,
        statusColor: newSessionForm.status === 'STABLE' ? '#065F46' : '#C2540A',
        fidelity_type: newSessionForm.fidelity_type,
        keyRate: parseFloat(newSessionForm.key_rate) || 310.5,
        duration: '00:00:01'
      };
      setSessionChannels(prev => [...prev, newChan]);
      setSelectedSessionChannelId(nextId);
      showToast(`Channel ${newChan.endpoint} initialized on ID ${nextId}.`);
    }

    setShowCreateSessionModal(false);
    setNewSessionForm({
      endpoint: '',
      status: 'STABLE',
      fidelity_type: 'sine_tick',
      key_rate: '310.5'
    });
  };

  const [showCountermeasureModal, setShowCountermeasureModal] = useState<boolean>(false);
  const [selectedCountermeasure, setSelectedCountermeasure] = useState<'decoy' | 'phase' | 'quarantine' | 'reroute'>('decoy');
  const [isDeployingCountermeasure, setIsDeployingCountermeasure] = useState<boolean>(false);
  const [deployProgress, setDeployProgress] = useState<number>(0);
  
  const [qberThresholdSetting, setQberThresholdSetting] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qds_qber_threshold');
      if (saved) return parseFloat(saved);
    } catch {}
    return 5.0;
  });
  useEffect(() => {
    try { localStorage.setItem('qds_qber_threshold', qberThresholdSetting.toString()); } catch {}
  }, [qberThresholdSetting]);

  const [showAlertsPopover, setShowAlertsPopover] = useState<boolean>(false);
  const [showDocumentationModal, setShowDocumentationModal] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Network Topology Interactive State (1:1 Reference Architecture Replica)
  const [selectedTopologyNodeId, setSelectedTopologyNodeId] = useState<string>('QN-ALICE');
  const [topologyZoom, setTopologyZoom] = useState<number>(1.0);
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>('');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'ONLINE' | 'DEGRADED' | 'CORE'>('ALL');
  const [showInventoryFilterMenu, setShowInventoryFilterMenu] = useState<boolean>(false);
  const [rebootingNodeId, setRebootingNodeId] = useState<string | null>(null);
  const [pingingNodeId, setPingingNodeId] = useState<string | null>(null);
  const [activePhotonPulse, setActivePhotonPulse] = useState<boolean>(false);
  const [selectedLinkDiagnostics, setSelectedLinkDiagnostics] = useState<{
    linkId: string;
    source: string;
    target: string;
    latency: string;
    loss: string;
    status: string;
    statusColor: string;
    attenuation: string;
    qber: string;
    protocol: string;
    keyRate: string;
  } | null>(null);

  // Dynamic Topology Nodes Store with full mutability
  const [topologyNodes, setTopologyNodes] = useState<Record<string, {
    id: string;
    name: string;
    role: string;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    statusColor: string;
    uptime: string;
    hardware: string;
    protocolSupport: string;
    keyGenRate: string;
    connectedNodes: {
      id: string;
      name: string;
      subtitle: string;
      latency: string;
      loss: string;
      statusColor: string;
    }[];
  }>>({
    'QN-ALICE': {
      id: 'QN-ALICE',
      name: 'QN-ALICE',
      role: 'Transmitter / Signer',
      status: 'ONLINE',
      statusColor: '#065F46',
      uptime: '99.998%',
      hardware: 'Q-PROC-v4',
      protocolSupport: 'BB84, E91',
      keyGenRate: '1.2 kbps',
      connectedNodes: [
        { id: 'QN-BOB', name: 'QN-BOB', subtitle: 'Degraded Link', latency: '85ms', loss: '2% loss', statusColor: '#C2540A' },
        { id: 'ARB-CORE', name: 'ARB-CORE', subtitle: 'Central Hub', latency: '0ms', loss: 'Local', statusColor: '#065F46' }
      ]
    },
    'ARB-CORE': {
      id: 'ARB-CORE',
      name: 'ARB-CORE',
      role: 'Central Hub / EPR Source',
      status: 'ONLINE',
      statusColor: '#065F46',
      uptime: '99.999%',
      hardware: 'Q-HUB-v2',
      protocolSupport: 'SPDC Bell Source, TLS 1.3',
      keyGenRate: '4.8 kbps',
      connectedNodes: [
        { id: 'QN-ALICE', name: 'QN-ALICE', subtitle: 'Transmitter Node', latency: '12ms', loss: '0% loss', statusColor: '#065F46' },
        { id: 'QN-BOB', name: 'QN-BOB', subtitle: 'Receiver Node', latency: '85ms', loss: '2% loss', statusColor: '#C2540A' }
      ]
    },
    'QN-BOB': {
      id: 'QN-BOB',
      name: 'QN-BOB',
      role: 'Receiver / Verifier',
      status: 'ONLINE',
      statusColor: '#C2540A',
      uptime: '99.982%',
      hardware: 'Q-PROC-v4',
      protocolSupport: 'BB84, E91',
      keyGenRate: '0.9 kbps',
      connectedNodes: [
        { id: 'ARB-CORE', name: 'ARB-CORE', subtitle: 'Central Hub', latency: '85ms', loss: '2% loss', statusColor: '#065F46' },
        { id: 'QN-ALICE', name: 'QN-ALICE', subtitle: 'Transmitter Node', latency: '97ms', loss: '2% loss', statusColor: '#065F46' }
      ]
    }
  });

  // Draggable Node Positions (Percentage Coordinates on Grid Canvas)
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({
    'ARB-CORE': { x: 50, y: 24 },
    'QN-ALICE': { x: 34, y: 50 },
    'QN-BOB': { x: 72, y: 50 }
  });

  const [draggingTopologyNode, setDraggingTopologyNode] = useState<string | null>(null);
  const topologyCanvasRef = useRef<HTMLDivElement>(null);

  // Global mousemove and mouseup listeners for seamless dragging across canvas
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingTopologyNode || !topologyCanvasRef.current) return;
      const rect = topologyCanvasRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(12, Math.min(88, Math.round(rawX * 10) / 10));
      const clampedY = Math.max(12, Math.min(88, Math.round(rawY * 10) / 10));

      setNodePositions(prev => ({
        ...prev,
        [draggingTopologyNode]: { x: clampedX, y: clampedY }
      }));
    };

    const handleGlobalMouseUp = () => {
      if (draggingTopologyNode) {
        setDraggingTopologyNode(null);
      }
    };

    if (draggingTopologyNode) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingTopologyNode]);

  const [pingPacketFactor, setPingPacketFactor] = useState<number | null>(null);

  // High-precision 60fps photon pulse animation loop across optical vector lines
  useEffect(() => {
    if (!pingingNodeId) {
      setPingPacketFactor(null);
      return;
    }

    let animFrame: number;
    let startTime = Date.now();
    const duration = 750; // ms per round-trip bounce

    const loop = () => {
      const elapsed = Date.now() - startTime;
      const cycle = (elapsed % duration) / duration; // 0 to 1
      // Triangular wave for round-trip (0 -> 1 -> 0)
      const factor = cycle < 0.5 ? cycle * 2 : (1 - (cycle - 0.5) * 2);
      
      setPingPacketFactor(factor);

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      setPingPacketFactor(null);
    };
  }, [pingingNodeId]);

  const [pingTerminalOutput, setPingTerminalOutput] = useState<{ nodeId: string; lines: string[] } | null>(null);

  const handlePingNode = (nodeId: string) => {
    setPingingNodeId(nodeId);
    setActivePhotonPulse(true);

    const ipMap: Record<string, string> = {
      'QN-ALICE': '10.0.1.10',
      'ARB-CORE': '10.0.1.5',
      'QN-BOB': '10.0.1.20'
    };
    const targetIp = ipMap[nodeId] || '10.0.1.10';

    setPingTerminalOutput({
      nodeId,
      lines: [`> PING ${nodeId} (${targetIp}) 64 bytes of quantum-authenticated payload:`]
    });

    // Sequential multi-packet ICMP ping emission with realistic optoelectronic telemetry
    setTimeout(() => {
      const rtt1 = (1.12 + Math.random() * 0.1).toFixed(2);
      setPingTerminalOutput(prev => prev ? {
        ...prev,
        lines: [...prev.lines, `64 bytes from ${targetIp}: icmp_seq=1 ttl=64 time=${rtt1} ms (Phase Drift: <0.02ps)`]
      } : null);
    }, 400);

    setTimeout(() => {
      const rtt2 = (1.10 + Math.random() * 0.08).toFixed(2);
      setPingTerminalOutput(prev => prev ? {
        ...prev,
        lines: [...prev.lines, `64 bytes from ${targetIp}: icmp_seq=2 ttl=64 time=${rtt2} ms (Interferometer: Locked)`]
      } : null);
    }, 900);

    setTimeout(() => {
      const rtt3 = (1.16 + Math.random() * 0.1).toFixed(2);
      setPingTerminalOutput(prev => prev ? {
        ...prev,
        lines: [
          ...prev.lines,
          `64 bytes from ${targetIp}: icmp_seq=3 ttl=64 time=${rtt3} ms (Loss: 0.00%)`,
          `--- ${nodeId} statistics --- 3 packets transmitted, 3 received, 0% loss, rtt avg=1.15ms`
        ]
      } : null);
      showToast(`PING ${nodeId} (${targetIp}): 3/3 packets received · RTT 1.15ms · 0% loss [OK]`);
      sentinelService.pushDemonstrationEvent(2, false, undefined, `Active ICMP/QKD probe on ${nodeId} verified: RTT 1.15ms, 0% drop.`);
    }, 1500);

    setTimeout(() => {
      setPingingNodeId(null);
      setActivePhotonPulse(false);
    }, 2400);
  };

  const handleRebootNode = (nodeId: string) => {
    setRebootingNodeId(nodeId);
    showToast(`REBOOT sequence initiated for ${nodeId}. Optical calibration in progress...`);

    setTopologyNodes(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        status: 'DEGRADED',
        statusColor: '#C2540A'
      }
    }));

    setTimeout(() => {
      setTopologyNodes(prev => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          status: 'ONLINE',
          statusColor: '#065F46',
          uptime: '100.000%'
        }
      }));
      setRebootingNodeId(null);
      showToast(`REBOOT COMPLETE: Q-PROC-v4 coprocessor online for ${nodeId}. Phase lock verified (Fidelity 99.9%).`);
      sentinelService.pushDemonstrationEvent(1, false, undefined, `Node ${nodeId} coprocessor reboot completed.`);
    }, 2200);
  };

  const handleOptimizeOpticalLink = (linkId: string) => {
    // Auto-tune phase modulator, clear loss, and make link 100% green
    setTopologyNodes(prev => ({
      ...prev,
      'QN-BOB': {
        ...prev['QN-BOB'],
        status: 'ONLINE',
        statusColor: '#065F46',
        connectedNodes: prev['QN-BOB'].connectedNodes.map(c => ({
          ...c,
          latency: '18ms',
          loss: '0% loss',
          statusColor: '#065F46'
        }))
      },
      'ARB-CORE': {
        ...prev['ARB-CORE'],
        connectedNodes: prev['ARB-CORE'].connectedNodes.map(c => c.id === 'QN-BOB' ? {
          ...c,
          latency: '18ms',
          loss: '0% loss',
          statusColor: '#065F46'
        } : c)
      }
    }));

    if (selectedLinkDiagnostics) {
      setSelectedLinkDiagnostics(prev => prev ? {
        ...prev,
        latency: '18ms',
        loss: '0% loss',
        status: 'OPTIMAL',
        statusColor: '#065F46',
        qber: '1.8%',
        attenuation: '0.18 dB/km'
      } : null);
    }

    showToast(`OPTICAL CHANNEL TUNED: Polarization drift compensated. Attenuation reduced to 0.18 dB/km (0% loss).`);
  };

  // Fetch real-time anomalies, incidents, and sessions from backend upon mount and merge with persistent store
  useEffect(() => {
    const fetchLiveThreatsAndIncidents = async () => {
      try {
        const res = await apiClient.getThreatAnomalies();
        if (res && res.anomalies && res.anomalies.length > 0) {
          setThreatAnomalies(prev => {
            const merged = [...prev];
            for (const backendAnom of res.anomalies) {
              const existingIdx = merged.findIndex(a => a.id === backendAnom.id);
              if (existingIdx === -1) {
                merged.unshift(backendAnom);
              }
            }
            return merged;
          });
        }

        try {
          const savedInc = localStorage.getItem('qds_incidents_list');
          if (!savedInc) {
            const incRes = await apiClient.getIncidents().catch(() => null);
            if (incRes && incRes.incidents && incRes.incidents.length > 0) {
              setIncidentsList(incRes.incidents);
            }
          }
        } catch {}

        try {
          const savedCh = localStorage.getItem('qds_session_channels');
          if (!savedCh) {
            const chanRes = await apiClient.getSessionChannels().catch(() => null);
            if (chanRes && chanRes.channels && chanRes.channels.length > 0) {
              setSessionChannels(chanRes.channels.map((c: any) => ({
                id: c.id,
                endpoint: c.endpoint,
                status: c.status,
                statusColor: c.status_color || (c.status === 'STABLE' ? '#065F46' : c.status === 'DEGRADED' ? '#C2540A' : '#75777D'),
                fidelity_type: c.fidelity_type || 'sine_tick',
                keyRate: c.key_rate,
                duration: c.duration
              })));
            }
          }
        } catch {}
      } catch (err) {
        console.warn('Backend security endpoints unavailable, fallback to local store:', err);
      }
    };
    fetchLiveThreatsAndIncidents();
  }, []);

  const handleDeployCountermeasure = async () => {
    setIsDeployingCountermeasure(true);
    setDeployProgress(15);
    
    try {
      setTimeout(() => setDeployProgress(50), 300);
      setTimeout(() => setDeployProgress(85), 600);
      
      const res = await apiClient.deployCountermeasure({
        protocol: selectedCountermeasure,
        target_node: selectedThreatAnomaly?.origin_node || '192.168.1.104',
        session_id: activeSession?.id || 'SESSION_CURRENT'
      });
      
      setDeployProgress(100);
      setTimeout(() => {
        setIsDeployingCountermeasure(false);
        setShowCountermeasureModal(false);
        showToast(res?.message || 'Quantum Optical Countermeasure deployed! QBER stabilized.');
        
        if (selectedThreatAnomaly) {
          setThreatAnomalies(prev => prev.map(a => a.id === selectedThreatAnomaly.id ? {
            ...a,
            telemetry: { ...a.telemetry, current_qber: `${res?.qber_stabilized || 1.35}%` },
            risk_bars: [
              { height: 20, color: '#0058BE' },
              { height: 18, color: '#0058BE' },
              { height: 22, color: '#0058BE' },
              { height: 25, color: '#0058BE' },
              { height: 20, color: '#0058BE' },
            ]
          } : a));
          setSelectedThreatAnomaly(prev => prev ? {
            ...prev,
            telemetry: { ...prev.telemetry, current_qber: `${res?.qber_stabilized || 1.35}%` },
            risk_bars: [
              { height: 20, color: '#0058BE' },
              { height: 18, color: '#0058BE' },
              { height: 22, color: '#0058BE' },
              { height: 25, color: '#0058BE' },
              { height: 20, color: '#0058BE' },
            ]
          } : null);
        }
      }, 300);
    } catch {
      setTimeout(() => {
        setIsDeployingCountermeasure(false);
        setShowCountermeasureModal(false);
        showToast('Countermeasure engaged: Decoy state pulses modulated.');
      }, 700);
    }
  };

  const handleToggleQuarantine = async (nodeId: string) => {
    const isCurrentlyQuarantined = quarantinedNodes.includes(nodeId);
    const nextAction = isCurrentlyQuarantined ? 'restore' : 'quarantine';
    
    try {
      const res = await apiClient.quarantineNode({ node_id: nodeId, action: nextAction });
      if (res && res.quarantined_nodes) {
        setQuarantinedNodes(res.quarantined_nodes);
      } else {
        setQuarantinedNodes(prev => isCurrentlyQuarantined ? prev.filter(n => n !== nodeId) : [...prev, nodeId]);
      }
      showToast(res?.message || (isCurrentlyQuarantined ? `Node ${nodeId} restored.` : `Node ${nodeId} strictly QUARANTINED.`));
    } catch {
      setQuarantinedNodes(prev => isCurrentlyQuarantined ? prev.filter(n => n !== nodeId) : [...prev, nodeId]);
      showToast(isCurrentlyQuarantined ? `Node ${nodeId} restored.` : `Origin node ${nodeId} strictly QUARANTINED.`);
    }
  };

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED') => {
    // No-op if the incident already has this status
    const current = incidentsList.find(i => i.id === incidentId);
    if (current && current.status === newStatus) return;
    const statusColor = newStatus === 'RESOLVED' ? '#16A34A' : newStatus === 'ESCALATED' ? '#BA1A1A' : '#C2540A';
    const assigned = newStatus === 'RESOLVED' ? 'SYSTEM AUTO' : newStatus === 'ESCALATED' ? 'A. Smith (L3)' : 'J. Doe (L2)';
    const impact = newStatus === 'RESOLVED' ? 'LOW' : newStatus === 'ESCALATED' ? 'CRITICAL' : 'HIGH';
    const impactColor = newStatus === 'RESOLVED' ? '#16A34A' : '#BA1A1A';

    const timestamp = `${new Date().toLocaleTimeString('en-US', { hour12: false })} UTC`;
    const newEvent = {
      time: timestamp,
      title: newStatus === 'RESOLVED' ? 'Auto-Resolution' : newStatus === 'ESCALATED' ? 'Escalated to L3 Core' : 'Re-opened Investigation',
      title_color: statusColor,
      dot_color: statusColor,
      description: newStatus === 'RESOLVED'
        ? 'Firewall rules updated and perimeter link secured.'
        : newStatus === 'ESCALATED'
        ? 'Security incident escalated to L3 Quantum Cryptanalyst A. Smith.'
        : 'Incident status updated to active forensic investigation.',
      ...(newStatus === 'RESOLVED' ? {
        terminal: {
          command: `> ip_block add ${incidentId} 3600`,
          output: '[OK] Rule applied to perimeter firewall.'
        }
      } : {})
    };

    if (newStatus === 'RESOLVED') {
      await apiClient.resolveIncident({ incident_id: incidentId }).catch(() => null);
    }

    setIncidentsList(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: newStatus,
          status_color: statusColor,
          assigned,
          impact,
          impact_color: impactColor,
          timeline: [...inc.timeline, newEvent]
        };
      }
      return inc;
    }));

    showToast(`Incident ${incidentId} updated to ${newStatus}`);
  };

  const handleResolveIncident = (incidentId: string) => handleUpdateIncidentStatus(incidentId, 'RESOLVED');
  const handleEscalateIncident = (incidentId: string) => handleUpdateIncidentStatus(incidentId, 'ESCALATED');

  const handleCreateNewIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentForm.title.trim()) return;

    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const statusColor = newIncidentForm.impact === 'CRITICAL' ? '#BA1A1A' : '#C2540A';
    const impactColor = newIncidentForm.impact === 'CRITICAL' ? '#BA1A1A' : newIncidentForm.impact === 'HIGH' ? '#BA1A1A' : '#16A34A';

    const newInc: IncidentDetailItem = {
      id: newId,
      status: newIncidentForm.impact === 'CRITICAL' ? 'ESCALATED' : 'INVESTIGATING',
      status_color: statusColor,
      assigned: newIncidentForm.assigned,
      impact: newIncidentForm.impact,
      impact_color: impactColor,
      title: newIncidentForm.title,
      description: newIncidentForm.description || 'Manual operator logged quantum incident.',
      timeline: [
        {
          time: `${new Date().toLocaleTimeString('en-US', { hour12: false })} UTC`,
          title: 'Initial Detection',
          title_color: '#091426',
          dot_color: '#94A3B8',
          description: newIncidentForm.initialDetail || 'Anomaly logged manually by SOC operator.'
        }
      ]
    };

    setIncidentsList(prev => [newInc, ...prev]);
    setSelectedIncidentId(newInc.id);
    setShowCreateIncidentModal(false);
    setNewIncidentForm({
      title: '',
      assigned: 'J. Doe (L2)',
      impact: 'HIGH',
      description: '',
      initialDetail: ''
    });
    showToast(`New incident ${newId} logged successfully.`);
  };

  const handlePurgeQubitBuffer = async () => {
    try {
      const res = await apiClient.purgeQubitBuffer();
      showToast(res?.message || 'Qubit key buffer purged. Sifted bitstreams re-seeded.');
    } catch {
      showToast('Qubit key buffer purged. Sifted bitstreams re-seeded via SPDC arbitrator.');
    }
  };

  const handleExportForensicReport = (anom: ThreatAnomalyItem) => {
    const report = {
      report_id: `QDS-FORENSIC-${Date.now()}`,
      generated_at: new Date().toISOString(),
      anomaly: anom,
      telemetry_dump: telemetryStream.slice(0, 10),
      system_status: {
        active_qber: `${activeQber.toFixed(2)}%`,
        hoeffding_alpha: hoeffdingAlpha,
        quarantined_nodes: quarantinedNodes,
        soc_operator: 'Dr. Vikramaditya S.'
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qds-forensic-report-${anom.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Forensic evidence exported for ${anom.origin_node}`);
  };

  // Initial 10 Latest Telemetry Items
  const initialTelemetryItems: TelemetryStreamItem[] = [
    { id: '1', timestamp: '14:22:01.045', subsystem: 'KEY EXCH MN', event_type: 'Photon Pulse Tx', latency_ms: 1024, status_code: 200, message: 'SPDC photon pair routed to Alice & Bob via Dark Fiber Link 1 & 2.', qber: 2.10, chsh_score: 2.76, security_score: 'Secure', is_error: false },
    { id: '2', timestamp: '14:22:01.012', subsystem: 'ERR DETECT',  event_type: 'Sift Mismatch High', latency_ms: 256,  status_code: 500, message: 'Parity mismatch threshold breached on qubit stream index #042.', qber: 6.42, chsh_score: 1.88, security_score: 'Degraded', is_error: true, reason: 'Anomalous spike in Quantum Bit Error Rate (QBER) detected on node QK-7. Immediate investigation required to rule out potential eavesdropping attempt.' },
    { id: '3', timestamp: '14:22:00.988', subsystem: 'BASIS RECON', event_type: 'Alice Bob Sync',    latency_ms: 512,  status_code: 200, message: 'Public basis exchange completed over TLS 1.3 channel.', qber: 1.85, chsh_score: 2.78, security_score: 'Secure', is_error: false },
    { id: '4', timestamp: '14:22:00.850', subsystem: 'NET ROUTER',  event_type: 'Route Update Ack',  latency_ms: 64,   status_code: 200, message: 'SDN topology update confirmed nominal optical attenuation.', qber: 2.05, chsh_score: 2.74, security_score: 'Secure', is_error: false },
    { id: '5', timestamp: '14:22:00.720', subsystem: 'HOEFFDING CHK', event_type: 'Statistical Bound Audit', latency_ms: 128, status_code: 200, message: 'Hoeffding confidence bound verified: α=0.001 threshold nominal.', qber: 2.12, chsh_score: 2.75, security_score: 'Secure', is_error: false },
    { id: '6', timestamp: '14:22:00.615', subsystem: 'CHSH EVAL',   event_type: 'Bell State S=2.76',  latency_ms: 512, status_code: 200, message: 'Quantum non-locality test confirmed: S > 2.000 classical limit.', qber: 1.95, chsh_score: 2.76, security_score: 'Secure', is_error: false },
    { id: '7', timestamp: '14:22:00.540', subsystem: 'SNSPD DETECT', event_type: 'Photon Coincidence', latency_ms: 1024, status_code: 200, message: 'Nanowire detector registered symmetric 1550nm photon arrival.', qber: 2.00, chsh_score: 2.77, security_score: 'Secure', is_error: false },
    { id: '8', timestamp: '14:22:00.410', subsystem: 'ALICE BSM',   event_type: 'Joint Bell Measurement', latency_ms: 256, status_code: 200, message: 'Alice performed joint Bell State Measurement on |ψ_doc⟩ + EPR half.', qber: 1.88, chsh_score: 2.79, security_score: 'Secure', is_error: false },
    { id: '9', timestamp: '14:22:00.280', subsystem: 'TLS FEEDFWD', event_type: 'Classical Bits (b1,b2)', latency_ms: 64, status_code: 200, message: 'Classical feed-forward broadcasted to Bob for Pauli frame correction.', qber: 2.02, chsh_score: 2.75, security_score: 'Secure', is_error: false },
    { id: '10', timestamp: '14:22:00.150', subsystem: 'PRIVACY AMP', event_type: 'Toeplitz Hash Distill', latency_ms: 512, status_code: 200, message: 'Privacy amplification distilled unforgeable quantum signature token.', qber: 1.90, chsh_score: 2.78, security_score: 'Secure', is_error: false },
  ];

  // Rolling 10 Telemetry Stream State (Directly subscribed to Demonstration & Attack Sandbox)
  const [telemetryStream, setTelemetryStream] = useState<TelemetryStreamItem[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('qds_latest_stream');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return sentinelService.getLiveStream();
  });
  
  // Selected Telemetry Item for Dynamic Dashboard Linking with localStorage persistence
  const [selectedItem, setSelectedItem] = useState<TelemetryStreamItem>(() => {
    try {
      const saved = localStorage.getItem('qds_selected_telemetry_item');
      if (saved) return JSON.parse(saved);
    } catch {}
    const stream = sentinelService.getLiveStream();
    return stream[0] || initialTelemetryItems[0];
  });
  useEffect(() => {
    try {
      if (selectedItem) {
        localStorage.setItem('qds_selected_telemetry_item', JSON.stringify(selectedItem));
      }
    } catch {}
  }, [selectedItem]);

  // Persist telemetry stream to localStorage whenever new items arrive
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && telemetryStream.length > 0) {
        window.localStorage.setItem('qds_latest_stream', JSON.stringify(telemetryStream));
      }
    } catch {}
  }, [telemetryStream]);

  // Subscribe directly to live stream from SentinelService (Demonstration execution & Sandbox events)
  useEffect(() => {
    if (isStreamPaused) return;

    return sentinelService.subscribeLiveStream((items) => {
      setTelemetryStream(items);
      if (items.length > 0) {
        const latest = items[0];
        setSelectedItem(latest);

        // Prevent initial mount stream replay from creating duplicate incidents
        if (lastProcessedIncidentStreamIdRef.current === null) {
          lastProcessedIncidentStreamIdRef.current = latest.id;
          return;
        }

        if (latest.id !== lastProcessedIncidentStreamIdRef.current) {
          lastProcessedIncidentStreamIdRef.current = latest.id;

          // If an attack or anomaly was emitted (is_error or qber > 5.0 or chsh < 2.0), dynamically add to Threats & Incidents
          if (latest.is_error || latest.qber > 5.0 || latest.chsh_score < 2.0) {
            const rawCategory = latest.event_type || 'Quantum Channel Intrusion';
            const nodeOrigin = latest.subsystem === 'ARBITRATOR_MAC' ? 'ARB_CORE_01'
              : latest.subsystem === 'NONCE_AUDIT' ? 'NONCE_CACHE_01'
              : latest.subsystem === 'DECOY_ANALYSIS' ? 'DECOY_SPLITTER_01'
              : latest.subsystem === 'EVE_PROBE' ? 'NODE_EVE_01'
              : latest.subsystem === 'FIBER_TELEMETRY' ? 'DARK_FIBER_SPAN_2'
              : latest.subsystem === 'OPTICAL_JAMMER' ? 'OPTICAL_CH_01'
              : latest.subsystem || 'QKD_NODE_07';

            const newAnomaly: ThreatAnomalyItem = {
              id: `anom-live-${latest.id}`,
              severity: (latest.qber > 7.0 || latest.chsh_score < 1.9) ? 'CRITICAL' : 'HIGH',
              origin_node: nodeOrigin,
              anomaly_type: rawCategory,
              time: latest.timestamp.split('.')[0],
              title: rawCategory.toUpperCase(),
              telemetry: {
                node: nodeOrigin,
                baseline_qber: '1.2%',
                current_qber: `${latest.qber.toFixed(1)}%`,
              },
              risk_bars: [
                { height: Math.min(100, Math.max(15, latest.qber * 4.0)), color: '#0058BE' },
                { height: Math.min(100, Math.max(18, latest.qber * 5.5)), color: '#0058BE' },
                { height: Math.min(100, Math.max(22, latest.qber * 7.5)), color: '#0058BE' },
                { height: Math.min(100, Math.max(35, latest.qber * 9.5)), color: '#C2410C' },
                { height: Math.min(100, Math.max(50, latest.qber * 12.0)), color: '#BA1A1A' },
              ]
            };

            setThreatAnomalies(prev => {
              if (prev.some(a => a.id === newAnomaly.id)) return prev;
              return [newAnomaly, ...prev];
            });
            setSelectedThreatAnomaly(newAnomaly);

            // Dynamically register a live security incident in the Incidents Ledger
            const incidentId = `INC-${Date.now().toString().slice(-4)}-${latest.subsystem.slice(0, 3).toUpperCase()}`;
            const newIncident: IncidentDetailItem = {
              id: incidentId,
              status: 'INVESTIGATING',
              status_color: '#C2540A',
              assigned: 'J. Doe (L2)',
              impact: (latest.qber > 7.0 || latest.chsh_score < 1.9) ? 'CRITICAL' : 'HIGH',
              impact_color: '#BA1A1A',
              title: rawCategory,
              description: latest.message || latest.reason || 'Quantum security alert triggered on active channel.',
              timeline: [
                {
                  time: `${latest.timestamp.split('.')[0]} UTC`,
                  title: 'Threat Detected',
                  title_color: '#091426',
                  dot_color: '#94A3B8',
                  description: latest.reason || `Elevated QBER ${latest.qber.toFixed(2)}% observed on optical link.`
                },
                {
                  time: `${new Date().toLocaleTimeString()} UTC`,
                  title: 'Threshold Exceeded',
                  title_color: '#BA1A1A',
                  dot_color: '#BA1A1A',
                  description: `QBER ${latest.qber.toFixed(2)}% breached security cutoff (5.0%). Non-locality collapsed (S=${latest.chsh_score.toFixed(2)}).`
                }
              ]
            };

            setIncidentsList(prev => {
              if (prev.some(i => i.id === newIncident.id)) return prev;
              return [newIncident, ...prev];
            });
            setSelectedIncidentId(newIncident.id);
          }
        }
      }
    });
  }, [isStreamPaused]);

  // Filtered Telemetry Stream based on graphTimeRange ('1M' | '5M' | '15M' | 'ALL')
  const filteredStream = useMemo(() => {
    switch (graphTimeRange) {
      case '1M':
        return telemetryStream.slice(0, 5);
      case '5M':
        return telemetryStream.slice(0, 10);
      case '15M':
        return telemetryStream.slice(0, 18);
      case 'ALL':
      default:
        return telemetryStream;
    }
  }, [telemetryStream, graphTimeRange]);

  // Chronological stream (left-to-right order for graph rendering)
  const chronologicalStream = useMemo(() => {
    return [...filteredStream].reverse();
  }, [filteredStream]);

  // Compute SVG coordinates for QBER Graph
  const qberGraphPoints = useMemo(() => {
    const minX = 50;
    const maxX = 480;
    const minY = 30; // 10% QBER
    const maxY = 175; // 0% QBER
    const total = chronologicalStream.length;

    return chronologicalStream.map((item, idx) => {
      const x = total > 1 ? minX + (idx / (total - 1)) * (maxX - minX) : minX;
      // Scale 0% to 10% QBER onto maxY to minY
      const clampedQber = Math.min(10, Math.max(0, item.qber));
      const y = maxY - (clampedQber / 10.0) * (maxY - minY);
      return { x, y, item, idx };
    });
  }, [chronologicalStream]);

  // Compute SVG coordinates for CHSH Graph
  const chshGraphPoints = useMemo(() => {
    const minX = 50;
    const maxX = 480;
    const minY = 35; // S = 3.0
    const maxY = 170; // S = 1.5
    const total = chronologicalStream.length;

    return chronologicalStream.map((item, idx) => {
      const x = total > 1 ? minX + (idx / (total - 1)) * (maxX - minX) : minX;
      // Scale S = 1.5 to 3.0 onto maxY to minY
      const clampedS = Math.min(3.0, Math.max(1.5, item.chsh_score));
      const y = maxY - ((clampedS - 1.5) / 1.5) * (maxY - minY);
      return { x, y, item, idx };
    });
  }, [chronologicalStream]);

  // Generate SVG Path & Fill for QBER
  const qberPathD = useMemo(() => {
    if (qberGraphPoints.length === 0) return '';
    return qberGraphPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`).join(' ');
  }, [qberGraphPoints]);

  const qberAreaD = useMemo(() => {
    if (qberGraphPoints.length === 0) return '';
    const firstX = qberGraphPoints[0].x;
    const lastX = qberGraphPoints[qberGraphPoints.length - 1].x;
    return `${qberPathD} L ${lastX},175 L ${firstX},175 Z`;
  }, [qberPathD, qberGraphPoints]);

  // Generate SVG Path for CHSH
  const chshPathD = useMemo(() => {
    if (chshGraphPoints.length === 0) return '';
    return chshGraphPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`).join(' ');
  }, [chshGraphPoints]);

  // Measure Real Live Ping to Backend
  useEffect(() => {
    const checkLatency = async () => {
      const startTime = performanceNow();
      try {
        await fetch('http://localhost:3001/api/v1/health', { method: 'GET', mode: 'cors' }).catch(() => null);
        const elapsed = Math.max(2, Math.round(performanceNow() - startTime));
        setLiveLatency(elapsed < 100 ? elapsed : 14);
      } catch {
        setLiveLatency(14);
      }
    };

    checkLatency();
    const timer = setInterval(checkLatency, 4000);
    return () => clearInterval(timer);
  }, []);

  const performanceNow = () => (typeof window !== 'undefined' && window.performance ? window.performance.now() : Date.now());

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // CSV Export functionality
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Subsystem', 'Event', 'Payload_B', 'Status_Code', 'QBER_Pct', 'CHSH_S'];
    const rows = telemetryStream.map(l => [
      l.timestamp, l.subsystem, l.event_type, l.latency_ms, l.status_code, l.qber, l.chsh_score
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qds_telemetry_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Dashboard Values derived from selected telemetry packet
  const activeQber = selectedItem.qber;
  const isQberBreach = selectedItem.is_error || activeQber > 5.0;
  const activeSecurityScore = selectedItem.security_score;

  // Filtered telemetry based on search query, strictly ordered newest first
  const filteredTelemetry = useMemo(() => {
    return [...telemetryStream]
      .sort((a, b) => {
        const idDiff = (Number(b.id) || 0) - (Number(a.id) || 0);
        if (idDiff !== 0 && !isNaN(idDiff)) return idDiff;
        return b.timestamp.localeCompare(a.timestamp);
      })
      .filter(row => 
        searchQuery === '' ||
        row.subsystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.timestamp.includes(searchQuery)
      );
  }, [telemetryStream, searchQuery]);

  return (
    <div className="h-full w-full flex flex-col bg-[#FBF8FA] text-[#1B1B1D] font-sans antialiased overflow-y-auto select-none relative">

      {/* ─── 1. TOP BRAND NAVIGATION BAR (MATCHES HUB THEME & TYPOGRAPHY) ─── */}
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] h-14 w-full flex items-center justify-between px-6 shrink-0 z-40 relative">
        {/* Left: Brand Logo & Title & Breadcrumbs */}
        <div className="flex items-center gap-3 z-10">
          <div
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                window.open('/home', '_blank');
              } else {
                onNavigateHome();
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
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

          {activeTab === 'network' && (
            <span className="font-mono text-[10px] text-[#75777D] tracking-widest uppercase font-medium pl-3 border-l border-[#E2E8F0] hidden sm:inline-block">
              NETWORK TOPOLOGY ACTIVE
            </span>
          )}
        </div>

        {/* Center: Active Blue Tab (Ctrl+Click opens in new tab) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                window.open('/monitoring', '_blank');
              } else {
                setActiveTab('overview');
              }
            }}
            className="h-full flex items-center border-b-2 border-[#0058BE] text-[#0058BE] px-6 font-medium text-[15px] pointer-events-auto cursor-pointer"
            title="SOC Monitoring (Ctrl+Click to open in new tab)"
          >
            Monitoring
          </div>
        </div>

        {/* Right: Search, Settings, Notification Bell & User Avatar */}
        <div className="flex items-center gap-3 z-10 relative">
          {activeTab === 'network' && (
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search nodes..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="w-52 pl-3 pr-8 py-1 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] text-[11px] font-mono text-[#091426] placeholder-[#75777D] focus:outline-none focus:border-[#0058BE]"
              />
              <Search className="w-3.5 h-3.5 text-[#75777D] absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Settings Modal Trigger */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
            title="SOC Configuration & Security Bounds Settings"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          {/* Notifications Bell Container */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotificationsPopover(!showNotificationsPopover); setShowUserProfilePopover(false); }}
              className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
              title="Threat Notifications & Attack Alerts (Ctrl+Click to view incident ledger)"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {(incidents.length > 0 || isQberBreach) && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-[#BA1A1A] text-[#FFFFFF] rounded-full text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white shadow-sm pointer-events-none">
                  {incidents.length || 1}
                </span>
              )}
            </button>

            {/* ─── THREAT NOTIFICATION DROPDOWN MENU (MATCHES HUB) ─── */}
            {showNotificationsPopover && (
              <div className="absolute right-0 top-10 w-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
                {/* Dropdown Header */}
                <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#091426]">
                      SECURITY ALERTS &amp; ATTACKS
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#BA1A1A] text-white text-[9px] font-mono font-bold rounded">
                      {incidents.length || 1} ACTIVE
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowNotificationsPopover(false)}
                    className="text-[#75777D] hover:text-[#1B1B1D] text-[12px] font-bold cursor-pointer pl-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Alerts List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0] bg-white">
                  {incidents.length === 0 && !isQberBreach ? (
                    <div className="p-6 text-center text-[#75777D] text-[12px] font-mono flex flex-col items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] text-[#065F46] flex items-center justify-center font-bold">✓</span>
                      <span>No active security threats detected. All quantum sessions nominal.</span>
                    </div>
                  ) : (
                    <>
                      {isQberBreach && (
                        <div 
                          onClick={(e) => { 
                            setShowNotificationsPopover(false); 
                            if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank'); 
                            else setActiveTab('threats'); 
                          }}
                          className="p-3.5 hover:bg-[#F6F3F5] transition-colors cursor-pointer flex items-start gap-3 group border-b border-[#E2E8F0]"
                          title="Click to view forensics (Ctrl+Click to open in new tab)"
                        >
                          <div className="w-6 h-6 rounded bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                            !
                          </div>
                          <div className="flex-1 min-w-0 font-mono text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#BA1A1A] truncate">QDS-ALARM-QK7</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] uppercase">
                                CRITICAL
                              </span>
                            </div>
                            <p className="text-[#1B1B1D] text-[11px] mt-1 line-clamp-2">
                              {selectedItem.reason || 'QBER breached Hoeffding threshold on node QK-7.'}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#75777D]">
                              <span>QBER: <strong className="text-[#BA1A1A]">{activeQber.toFixed(2)}%</strong></span>
                              <span>CHSH: <strong>{selectedItem.chsh_score.toFixed(2)}</strong></span>
                              <span className="text-[#0058BE] group-hover:underline ml-auto font-medium">Investigate →</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {incidents.map((inc) => (
                        <div 
                          key={inc.id} 
                          onClick={(e) => { 
                            setSelectedIncident(inc); 
                            setShowNotificationsPopover(false); 
                            if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank'); 
                            else setActiveTab('threats'); 
                          }}
                          className="p-3.5 hover:bg-[#F6F3F5] transition-colors cursor-pointer flex items-start gap-3 group border-b border-[#E2E8F0] last:border-b-0"
                          title="Click to view incident (Ctrl+Click to open in new tab)"
                        >
                          <div className="w-6 h-6 rounded bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                            ⚡
                          </div>
                          <div className="flex-1 min-w-0 font-mono text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#091426] truncate">{inc.event}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] uppercase">
                                {inc.severity}
                              </span>
                            </div>
                            <p className="text-[#1B1B1D] text-[11px] mt-1 line-clamp-2">
                              {inc.summary}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#75777D]">
                              <span>Session: <strong>{inc.session_id}</strong></span>
                              <span className="text-[#0058BE] group-hover:underline ml-auto font-medium">Investigate →</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Trigger (Dr. Vikramaditya S.) */}
          <div 
            onClick={() => setShowUserProfilePopover(!showUserProfilePopover)}
            className="w-7 h-7 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] flex items-center justify-center overflow-hidden cursor-pointer ml-1 hover:ring-1 hover:ring-[#0058BE] transition-all"
            title="Operator Profile • Dr. Vikramaditya S."
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWUKUkX4iAVRyPxnlWNMdHiJG4-IjNkujLi3tD4aL7gH0UcHME5ys0-EMolJR6YZYiXVDeQBAS41uPLQYb_nryde5Uhd5ET9dYyvIQUi39SXjuGakqaOPhMryiTsokjYT50hOpYmT54YzFWAgNneJrtFqGuLprSxKMQ-lEiQPhySi3wkPic8Ahgn_YDjWPbxWzAPIT9_W6p5D0Zi-UpRfrIfnlqu84OpWL5AG5ZAeEe9BdnSnRrS-h" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN LAYOUT (SIDEBAR + MAIN CONTENT) ─── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT SIDEBAR (HUB-THEMED TYPOGRAPHY & COLORS) ─── */}
        <aside className="w-52 bg-[#F6F3F5] border-r border-[#E2E8F0] flex flex-col shrink-0 overflow-y-auto">
          {/* Top block with CPU chip icon */}
          <div className="p-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[2px] flex items-center justify-center bg-[#FFFFFF] border border-[#E2E8F0] text-[#091426]">
                <Cpu className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold text-[#091426] uppercase tracking-widest leading-none">
                  SOC MONITORING
                </div>
                <div className="font-mono text-[10px] text-[#45474C] mt-1 uppercase tracking-widest font-medium">
                  ACTIVE FORENSICS
                </div>
              </div>
            </div>
          </div>

          {/* Nav List with exact Hub-matching style (Ctrl+Click opens in new tab) */}
          <nav className="flex-1 py-1">
            <ul className="space-y-0.5">
              {[
                { 
                  key: 'overview', 
                  label: 'OVERVIEW', 
                  icon: <LayoutGrid className="w-4 h-4" />
                },
                { 
                  key: 'threats', 
                  label: 'THREATS', 
                  icon: <Shield className="w-4 h-4" />
                },
                { 
                  key: 'incidents', 
                  label: 'INCIDENTS', 
                  icon: <AlertTriangle className="w-4 h-4" />
                },
                { 
                  key: 'sessions', 
                  label: 'SESSIONS', 
                  icon: <History className="w-4 h-4" />
                },
                { 
                  key: 'network', 
                  label: 'NETWORK', 
                  icon: <Network className="w-4 h-4" />
                },
              ].map((item) => {
                const isSelected = activeTab === item.key;
                return (
                  <li key={item.key}>
                    <button
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          window.open('/monitoring', '_blank');
                        } else {
                          setActiveTab(item.key as MonitoringTab);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors font-mono text-[10.5px] uppercase tracking-widest font-medium relative text-left ${
                        isSelected
                          ? 'bg-[#E7E2E5] text-[#091426] font-bold'
                          : 'text-[#45474C] hover:bg-[#EFEAEB] hover:text-[#091426]'
                      }`}
                      title={`${item.label} (Ctrl+Click to open in new tab)`}
                    >
                      {isSelected && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0058BE]"/>}
                      <span className={isSelected ? 'text-[#0058BE]' : 'text-[#75777D]'}>{item.icon}</span>
                      <span className={isSelected ? 'text-[#0058BE] font-bold' : ''}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Pinned Items: DIAGNOSTICS & LOGS */}
          <div className="border-t border-[#E2E8F0] py-2 mt-auto bg-[#F6F3F5]">
            <button
              onClick={() => setShowDiagnosticsModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer text-[#45474C] hover:bg-[#EFEAEB] hover:text-[#091426] transition-colors font-mono text-[10.5px] uppercase tracking-widest font-medium text-left"
              title="Open Hardware Diagnostics Panel"
            >
              <Sliders className="w-4 h-4 text-[#75777D]" />
              <span>DIAGNOSTICS</span>
            </button>

            <button
              onClick={() => setShowLogsDrawer(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer text-[#45474C] hover:bg-[#EFEAEB] hover:text-[#091426] transition-colors font-mono text-[10.5px] uppercase tracking-widest font-medium text-left"
              title="Open Live Console Stream"
            >
              <Terminal className="w-4 h-4 text-[#75777D]" strokeWidth={2} />
              <span>LOGS</span>
            </button>
          </div>
        </aside>

        {/* ─── 3. MAIN DASHBOARD CONTENT AREA ─── */}
        <main className="flex-1 overflow-y-auto bg-[#FBF8FA] p-6">
          <div className="max-w-[1440px] mx-auto space-y-4">

            {/* ─── TAB: OVERVIEW (EXACT HUB-THEMED REPLICA) ─── */}
            {activeTab === 'overview' && (
              <div className="space-y-4">

                {/* 1. DYNAMIC CRITICAL ALARM BANNER */}
                {isQberBreach ? (
                  <div className="border border-[#FCA5A5] bg-[#FEF2F2] rounded-[2px] p-4 flex items-start justify-between gap-3.5 transition-all shadow-none">
                    <div className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full border border-[#BA1A1A] flex items-center justify-center shrink-0 mt-0.5 text-[#BA1A1A]">
                        <span className="font-mono text-[12px] font-bold">!</span>
                      </div>
                      <div>
                        <div className="font-mono font-bold text-[#BA1A1A] text-[11px] uppercase tracking-widest mb-1">
                          CRITICAL ALARM · {selectedItem.subsystem} ({selectedItem.event_type})
                        </div>
                        <div className="font-sans text-[12.5px] text-[#7F1D1D] leading-relaxed">
                          {selectedItem.reason || 'Anomalous spike in Quantum Bit Error Rate (QBER) detected on node QK-7. Immediate investigation required to rule out potential eavesdropping attempt.'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                          else setActiveTab('threats');
                        }}
                        className="px-2.5 py-1 bg-[#BA1A1A] text-white font-mono text-[10.5px] font-bold rounded-[2px] hover:bg-[#991B1B] transition-colors cursor-pointer uppercase tracking-wider"
                        title="Investigate Threat Forensics (Ctrl+Click to open in new tab)"
                      >
                        Investigate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[#BBF7D0] bg-[#F0FDF4] rounded-[2px] p-3 flex items-center justify-between gap-3.5 transition-all shadow-none">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-[#065F46] flex items-center justify-center shrink-0 text-[#065F46]">
                        <span className="font-mono text-[10px] font-bold">✓</span>
                      </div>
                      <div>
                        <span className="font-mono font-bold text-[#065F46] text-[11px] uppercase tracking-widest mr-2">
                          VERIFIED NOMINAL STATUS:
                        </span>
                        <span className="font-sans text-[12px] text-[#065F46]">
                          {selectedItem.subsystem} reports {selectedItem.event_type} operating within verified quantum entropy bounds (QBER = {activeQber.toFixed(2)}%).
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#065F46] font-bold uppercase tracking-wider">PASS</span>
                  </div>
                )}

                {/* 2. 6-CARD KPI METRIC GRID (Ctrl+Click opens analyzers) */}
                <div className="grid grid-cols-6 gap-3">
                  {/* Card 1: ACTIVE SESSIONS */}
                  <div 
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                      else setActiveTab('sessions');
                    }}
                    className="border border-[#E2E8F0] bg-[#FFFFFF] p-3 flex flex-col justify-between h-[92px] rounded-[2px] cursor-pointer hover:border-[#0058BE] transition-all group"
                    title="Active Sessions • Click to view session store (Ctrl+Click to open in new tab)"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#75777D] group-hover:text-[#0058BE] font-medium">ACTIVE SESSIONS</span>
                    <span className="font-sans font-bold text-[26px] text-[#091426] leading-none tracking-tight">
                      {(performance?.active_sessions_count || sessions.length || 1248).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]"/>
                      <span className="font-mono text-[10px] text-[#065F46] font-medium uppercase tracking-wider">Stable</span>
                    </div>
                  </div>

                  {/* Card 2: VERIFIED SIGS */}
                  <div className="border border-[#E2E8F0] bg-[#FFFFFF] p-3 flex flex-col justify-between h-[92px] rounded-[2px]">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#75777D] font-medium">VERIFIED SIGS</span>
                    <span className="font-sans font-bold text-[26px] text-[#091426] leading-none tracking-tight">
                      {isQberBreach ? '94.2%' : '99.9%'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]"/>
                      <span className="font-mono text-[10px] text-[#065F46] font-medium uppercase tracking-wider">Nominal</span>
                    </div>
                  </div>

                  {/* Card 3: SECURITY SCORE */}
                  <div className="border border-[#E2E8F0] bg-[#FFFFFF] p-3 flex flex-col justify-between h-[92px] rounded-[2px]">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#75777D] font-medium">SECURITY SCORE</span>
                    <span className={`font-sans font-bold text-[26px] leading-none tracking-tight ${isQberBreach ? 'text-[#C2410C]' : 'text-[#065F46]'}`}>
                      {activeSecurityScore}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isQberBreach ? 'bg-[#C2410C]' : 'bg-[#065F46]'}`}/>
                      <span className={`font-mono text-[10px] uppercase tracking-wider font-medium ${isQberBreach ? 'text-[#C2410C]' : 'text-[#065F46]'}`}>
                        {activeSecurityScore}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: TOTAL PULSES */}
                  <div className="border border-[#E2E8F0] bg-[#FFFFFF] p-3 flex flex-col justify-between h-[92px] rounded-[2px]">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#75777D] font-medium">TOTAL PULSES</span>
                    <span className="font-mono font-bold text-[26px] text-[#091426] leading-none tracking-tight">
                      4.2e9
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[#75777D] font-medium">+1.2M/s</span>
                    </div>
                  </div>

                  {/* Card 5: QBER % (Ctrl+Click opens Hoeffding Analyzer) */}
                  <div 
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        setShowHoeffdingModal(true);
                      } else {
                        setActiveTab('threats');
                      }
                    }}
                    className={`border p-3 flex flex-col justify-between h-[92px] rounded-[2px] cursor-pointer transition-all ${
                      isQberBreach 
                        ? 'border-[#EF4444] bg-[#FEE2E2]' 
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#0058BE]'
                    }`}
                    title="Quantum Bit Error Rate • Click to view threats (Ctrl+Click to open Hoeffding Bound Analyzer)"
                  >
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-medium ${isQberBreach ? 'text-[#BA1A1A]' : 'text-[#75777D]'}`}>
                      QBER %
                    </span>
                    <span className={`font-mono font-bold text-[26px] leading-none tracking-tight ${isQberBreach ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                      {activeQber.toFixed(2)}%
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isQberBreach ? 'bg-[#BA1A1A]' : 'bg-[#065F46]'}`}/>
                      <span className={`font-mono text-[10px] font-medium uppercase tracking-wider ${isQberBreach ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                        {isQberBreach ? 'Critical Limit > 5%' : 'Nominal (< 5%)'}
                      </span>
                    </div>
                  </div>

                  {/* Card 6: CHSH VALUE (Ctrl+Click opens CHSH Bell Analyzer) */}
                  <div 
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        setShowChshModal(true);
                      } else {
                        setActiveTab('threats');
                      }
                    }}
                    className={`border p-3 flex flex-col justify-between h-[92px] rounded-[2px] cursor-pointer transition-all ${
                      selectedItem.chsh_score < 2.0 
                        ? 'border-[#EF4444] bg-[#FEE2E2]' 
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#0058BE]'
                    }`}
                    title="CHSH Bell Non-Locality Score • Click to view threats (Ctrl+Click to open CHSH Bell Analyzer)"
                  >
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-medium ${selectedItem.chsh_score < 2.0 ? 'text-[#BA1A1A]' : 'text-[#75777D]'}`}>
                      CHSH VALUE
                    </span>
                    <span className={`font-mono font-bold text-[26px] leading-none tracking-tight ${selectedItem.chsh_score < 2.0 ? 'text-[#BA1A1A]' : 'text-[#091426]'}`}>
                      {selectedItem.chsh_score.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedItem.chsh_score < 2.0 ? 'bg-[#BA1A1A]' : 'bg-[#065F46]'}`}/>
                      <span className={`font-mono text-[10px] font-medium uppercase tracking-wider ${selectedItem.chsh_score < 2.0 ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                        {selectedItem.chsh_score >= 2.0 ? 'S ≥ 2.0 (Quantum)' : 'S < 2.0 (Classical)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SLEEK MINIMALIST DUAL CHARTS ROW */}
                <div className="grid grid-cols-2 gap-4">

                  {/* ─── CHART 1: MINIMALIST QBER ERROR RATE ─── */}
                  <div className="border border-[#E2E8F0] bg-[#FFFFFF] flex flex-col rounded-[2px] overflow-hidden shadow-xs">
                    {/* Minimal Header Strip */}
                    <div className="h-9 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] uppercase tracking-wider text-[#091426] font-bold">
                          QBER ERROR RATE
                        </span>
                        <span className="text-[11px] text-[#0058BE] font-bold">
                          {activeQber.toFixed(2)}%
                        </span>
                        <Badge variant={activeQber > 5.0 ? 'destructive' : 'success'} className="px-1.5 py-0 text-[8.5px]">
                          {activeQber > 5.0 ? 'BREACH' : 'NOMINAL'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Time Range Selector */}
                        <ButtonGroup>
                          {(['1M', '5M', '15M', 'ALL'] as const).map(tr => (
                            <Button
                              key={tr}
                              variant={graphTimeRange === tr ? 'default' : 'ghost'}
                              size="xs"
                              onClick={() => setGraphTimeRange(tr)}
                              className="px-2 h-6 text-[9.5px]"
                            >
                              {tr}
                            </Button>
                          ))}
                        </ButtonGroup>

                        <button
                          onClick={() => setIsStreamPaused(!isStreamPaused)}
                          className="w-6 h-6 flex items-center justify-center text-[#75777D] hover:text-[#091426] rounded cursor-pointer transition-colors"
                          title={isStreamPaused ? 'Resume Live Stream' : 'Pause Stream'}
                        >
                          {isStreamPaused ? <Play className="w-3.5 h-3.5 text-[#0058BE]" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 relative h-[240px] w-full bg-[#FFFFFF]">
                      {/* Interactive Floating Hover Info Box */}
                      {hoveredQberPoint && (
                        <div 
                          className="absolute z-30 bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl rounded-[2px] overflow-hidden pointer-events-none transition-all transform -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
                          style={{ left: `${(hoveredQberPoint.x / 500) * 100}%`, top: `${(hoveredQberPoint.y / 200) * 100}%` }}
                        >
                          <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-3 py-1 flex items-center justify-between text-[11px]">
                            <span className="text-[#091426] font-bold">{hoveredQberPoint.item.subsystem}</span>
                            <span className="text-[#75777D] text-[10px]">{hoveredQberPoint.item.timestamp}</span>
                          </div>
                          <div className="p-2.5 space-y-1 text-[11px] text-[#1B1B1D]">
                            <div className="flex justify-between">
                              <span className="text-[#75777D]">QBER:</span>
                              <strong className={hoveredQberPoint.item.qber > 5.0 ? 'text-[#BA1A1A]' : 'text-[#065F46]'}>
                                {hoveredQberPoint.item.qber.toFixed(2)}%
                              </strong>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-[#75777D]">Status:</span>
                              <span className={hoveredQberPoint.item.qber > 5.0 ? 'text-[#BA1A1A] font-bold' : 'text-[#065F46] font-bold'}>
                                {hoveredQberPoint.item.qber > 5.0 ? 'Breach (>5%)' : 'Nominal (<5%)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Minimalist SVG Curve */}
                      <svg 
                        viewBox="0 0 500 200" 
                        className="w-full h-full cursor-crosshair" 
                        preserveAspectRatio="none"
                        onMouseLeave={() => setHoveredQberPoint(null)}
                      >
                        <defs>
                          <linearGradient id="qberGradMin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0058BE" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#0058BE" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* 3 Clean Horizontal Guide Lines */}
                        <line x1="35" y1="30" x2="485" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="35" y1="102.5" x2="485" y2="102.5" stroke="#FEE2E2" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="35" y1="175" x2="485" y2="175" stroke="#E2E8F0" strokeWidth="1" />

                        {/* Y-Axis Ticks */}
                        <text x="28" y="34" textAnchor="end" fontSize="9.5" fill="#94A3B8" fontWeight="500">10%</text>
                        <text x="28" y="106" textAnchor="end" fontSize="9.5" fill="#BA1A1A" fontWeight="600">5%</text>
                        <text x="28" y="178" textAnchor="end" fontSize="9.5" fill="#94A3B8" fontWeight="500">0%</text>

                        {/* Threshold Indicator Badge on Line */}
                        <text x="480" y="98" textAnchor="end" fontSize="8.5" fill="#BA1A1A" fontWeight="600">
                          Threshold (5.0%)
                        </text>

                        {/* Smooth Area Gradient */}
                        {qberAreaD && (
                          <path
                            d={qberAreaD}
                            fill="url(#qberGradMin)"
                            className="transition-all duration-300 ease-out"
                          />
                        )}

                        {/* Main Curve */}
                        {qberPathD && (
                          <path
                            d={qberPathD}
                            fill="none"
                            stroke="#0058BE"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300 ease-out"
                          />
                        )}

                        {/* Minimalist Data Points */}
                        {qberGraphPoints.map((pt) => {
                          const isBreach = pt.item.qber > 5.0 || pt.item.is_error;
                          const isCurSelected = selectedItem.id === pt.item.id;
                          return (
                            <g key={pt.item.id} className="cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="10"
                                fill="transparent"
                                onMouseEnter={() => {
                                  setHoveredQberPoint({
                                    x: pt.x,
                                    y: pt.y,
                                    svgX: 0,
                                    svgY: 0,
                                    item: pt.item,
                                    index: pt.idx
                                  });
                                }}
                                onClick={() => setSelectedItem(pt.item)}
                              />
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isCurSelected ? 4.5 : 2.5}
                                fill={isBreach ? '#BA1A1A' : '#0058BE'}
                                stroke="#FFFFFF"
                                strokeWidth={isCurSelected ? 2 : 1}
                              />
                            </g>
                          );
                        })}

                        {/* Minimal X-Axis Start & End Timestamps */}
                        {chronologicalStream.length > 0 && (
                          <>
                            <text x="35" y="194" textAnchor="start" fontSize="9" fill="#94A3B8">
                              {chronologicalStream[0]?.timestamp?.split('.')[0]}
                            </text>
                            <text x="485" y="194" textAnchor="end" fontSize="9" fill="#94A3B8">
                              {chronologicalStream[chronologicalStream.length - 1]?.timestamp?.split('.')[0]}
                            </text>
                          </>
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* ─── CHART 2: MINIMALIST CHSH BELL NON-LOCALITY (S-SCORE) ─── */}
                  <div className="border border-[#E2E8F0] bg-[#FFFFFF] flex flex-col rounded-[2px] overflow-hidden shadow-xs">
                    {/* Minimal Header Strip */}
                    <div className="h-9 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] uppercase tracking-wider text-[#091426] font-bold">
                          CHSH BELL TEST (S-SCORE)
                        </span>
                        <span className="text-[11px] text-[#0058BE] font-bold">
                          S = {selectedItem.chsh_score.toFixed(2)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                          selectedItem.chsh_score >= 2.0 
                            ? 'bg-[#ECFDF5] text-[#065F46]' 
                            : 'bg-[#FEE2E2] text-[#BA1A1A]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedItem.chsh_score >= 2.0 ? 'bg-[#065F46]' : 'bg-[#BA1A1A]'}`}/>
                          {selectedItem.chsh_score >= 2.0 ? 'QUANTUM' : 'CLASSICAL'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <ButtonGroup>
                          {(['1M', '5M', '15M', 'ALL'] as const).map(tr => (
                            <Button
                              key={tr}
                              variant={graphTimeRange === tr ? 'default' : 'ghost'}
                              size="xs"
                              onClick={() => setGraphTimeRange(tr)}
                              className="px-2 h-6 text-[9.5px]"
                            >
                              {tr}
                            </Button>
                          ))}
                        </ButtonGroup>

                        <button
                          onClick={() => setIsStreamPaused(!isStreamPaused)}
                          className="w-6 h-6 flex items-center justify-center text-[#75777D] hover:text-[#091426] rounded cursor-pointer transition-colors"
                          title={isStreamPaused ? 'Resume Live Stream' : 'Pause Stream'}
                        >
                          {isStreamPaused ? <Play className="w-3.5 h-3.5 text-[#0058BE]" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 relative h-[240px] w-full bg-[#FFFFFF]">
                      {/* Interactive Floating Hover Info Box */}
                      {hoveredChshPoint && (
                        <div 
                          className="absolute z-30 bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl rounded-[2px] overflow-hidden pointer-events-none transition-all transform -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
                          style={{ left: `${(hoveredChshPoint.x / 500) * 100}%`, top: `${(hoveredChshPoint.y / 200) * 100}%` }}
                        >
                          <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-3 py-1 flex items-center justify-between text-[11px]">
                            <span className="text-[#091426] font-bold">CHSH Point</span>
                            <span className="text-[#75777D] text-[10px]">{hoveredChshPoint.item.timestamp}</span>
                          </div>
                          <div className="p-2.5 space-y-1 text-[11px] text-[#1B1B1D]">
                            <div className="flex justify-between">
                              <span className="text-[#75777D]">Bell S-Score:</span>
                              <strong className={hoveredChshPoint.item.chsh_score >= 2.0 ? 'text-[#065F46]' : 'text-[#BA1A1A]'}>
                                {hoveredChshPoint.item.chsh_score.toFixed(3)}
                              </strong>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-[#75777D]">State:</span>
                              <span className={hoveredChshPoint.item.chsh_score >= 2.0 ? 'text-[#065F46] font-bold' : 'text-[#BA1A1A] font-bold'}>
                                {hoveredChshPoint.item.chsh_score >= 2.0 ? 'Entangled (S>2)' : 'Collapsed (S<2)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Minimalist SVG Line Graph */}
                      <svg 
                        viewBox="0 0 500 200" 
                        className="w-full h-full cursor-crosshair" 
                        preserveAspectRatio="none"
                        onMouseLeave={() => setHoveredChshPoint(null)}
                      >
                        {/* 3 Clean Horizontal Guide Lines */}
                        <line x1="35" y1="35" x2="485" y2="35" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="35" y1="130" x2="485" y2="130" stroke="#FEE2E2" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="35" y1="170" x2="485" y2="170" stroke="#E2E8F0" strokeWidth="1" />

                        {/* Y-Axis Ticks */}
                        <text x="28" y="39" textAnchor="end" fontSize="9.5" fill="#94A3B8" fontWeight="500">3.0</text>
                        <text x="28" y="134" textAnchor="end" fontSize="9.5" fill="#BA1A1A" fontWeight="600">2.0</text>
                        <text x="28" y="174" textAnchor="end" fontSize="9.5" fill="#94A3B8" fontWeight="500">1.5</text>

                        {/* Classical Limit Tag */}
                        <text x="480" y="125" textAnchor="end" fontSize="8.5" fill="#BA1A1A" fontWeight="600">
                          Classical Limit (S = 2.0)
                        </text>

                        {/* Smooth Line Curve */}
                        {chshPathD && (
                          <path
                            d={chshPathD}
                            fill="none"
                            stroke="#0058BE"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300 ease-out"
                          />
                        )}

                        {/* Data Points */}
                        {chshGraphPoints.map((pt) => {
                          const isBreach = pt.item.chsh_score < 2.0;
                          const isCurSelected = selectedItem.id === pt.item.id;
                          return (
                            <g key={pt.item.id} className="cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="10"
                                fill="transparent"
                                onMouseEnter={() => {
                                  setHoveredChshPoint({
                                    x: pt.x,
                                    y: pt.y,
                                    svgX: 0,
                                    svgY: 0,
                                    item: pt.item,
                                    index: pt.idx
                                  });
                                }}
                                onClick={() => setSelectedItem(pt.item)}
                              />
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isCurSelected ? 4.5 : 2.5}
                                fill={isBreach ? '#BA1A1A' : '#0058BE'}
                                stroke="#FFFFFF"
                                strokeWidth={isCurSelected ? 2 : 1}
                              />
                            </g>
                          );
                        })}

                        {/* Minimal X-Axis Start & End Timestamps */}
                        {chronologicalStream.length > 0 && (
                          <>
                            <text x="35" y="194" textAnchor="start" fontSize="9" fill="#94A3B8">
                              {chronologicalStream[0]?.timestamp?.split('.')[0]}
                            </text>
                            <text x="485" y="194" textAnchor="end" fontSize="9" fill="#94A3B8">
                              {chronologicalStream[chronologicalStream.length - 1]?.timestamp?.split('.')[0]}
                            </text>
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 4. LIVE TELEMETRY STREAM TABLE (Ctrl+Click opens Packet Inspector) */}
                <div className="border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] overflow-hidden">
                  {/* Table Header Strip */}
                  <div className="h-8 bg-[#F6F3F5] border-b border-[#E2E8F0] px-3.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
                        LIVE TELEMETRY STREAM
                      </span>
                      <span className="font-mono text-[9px] text-[#75777D]">
                        (Click row to update dashboard • <strong className="text-[#0058BE]">Ctrl+Click</strong> to open Packet Inspector)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleExportCsv}
                        className="font-mono text-[10.5px] text-[#0058BE] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Download Telemetry CSV"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#FBF8FA]">
                        <th className="py-2.5 px-4 text-left font-mono text-[10.5px] font-medium text-[#75777D] w-36 uppercase tracking-wider">Timestamp</th>
                        <th className="py-2.5 px-4 text-left font-mono text-[10.5px] font-medium text-[#75777D] w-40 uppercase tracking-wider">Subsystem</th>
                        <th className="py-2.5 px-4 text-left font-mono text-[10.5px] font-medium text-[#75777D] w-44 uppercase tracking-wider">Event</th>
                        <th className="py-2.5 px-4 text-left font-mono text-[10.5px] font-medium text-[#75777D] uppercase tracking-wider">Transferred Text / Message Content</th>
                        <th className="py-2.5 px-4 text-right font-mono text-[10.5px] font-medium text-[#75777D] w-24 uppercase tracking-wider">Latency</th>
                        <th className="py-2.5 px-4 text-right font-mono text-[10.5px] font-medium text-[#75777D] w-24 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] font-mono text-[12px] bg-[#FFFFFF]">
                      {filteredTelemetry.slice(0, 10).map((log) => {
                        const isError = log.status_code >= 400 || log.is_error || log.subsystem === 'ERR DETECT';
                        const isSelected = selectedItem.id === log.id;

                        // Retrieve saved transferred messages from localStorage (NO DUPLICATE MODULO REPEATING)
                        let savedMessages: any[] = [];
                        try {
                          const raw = localStorage.getItem('qds_transfer_messages');
                          if (raw) {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed) && parsed.length > 0) savedMessages = parsed;
                          }
                        } catch {}

                        const rawMsg = log.message || '';
                        const fileInLog = rawMsg.match(/\[([a-zA-Z0-9_\-]+\.(?:sig|pdf|txt|json|pem|bin|ps1|md))\]/i) || rawMsg.match(/file \[([^\]]+)\]/i);
                        const textInLog = rawMsg.match(/text "([^"]+)"/i) || rawMsg.match(/"([^"]{3,50})"/);

                        let payloadDisplay = null;

                        if (fileInLog) {
                          payloadDisplay = (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EBF3FF] border border-[#BFDBFE] text-[#0058BE] font-mono text-[11px] font-bold">
                              📄 {fileInLog[1]}
                            </span>
                          );
                        } else if (textInLog && textInLog[1]) {
                          const cleanText = textInLog[1].trim();
                          const first10 = cleanText.slice(0, 10);
                          payloadDisplay = (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E6F4EA] border border-[#A7F3D0] text-[#065F46] font-mono text-[11px] font-bold">
                              💬 "{first10}{cleanText.length > 10 ? '...' : ''}"
                            </span>
                          );
                        } else {
                          // Check if row index strictly matches a real transferred message in savedMessages (NO MODULO REPEATING)
                          const txIdx = filteredTelemetry.indexOf(log);
                          if (savedMessages.length > 0 && txIdx < savedMessages.length) {
                            const tx = savedMessages[txIdx];
                            if (tx.payloadType === 'file' || tx.fileName) {
                              payloadDisplay = (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EBF3FF] border border-[#BFDBFE] text-[#0058BE] font-mono text-[11px] font-bold">
                                  📄 {tx.fileName || tx.title || 'qds_document.sig'}
                                </span>
                              );
                            } else {
                              const cleanText = (tx.content || 'CLASSIFIED').trim();
                              const first10 = cleanText.slice(0, 10);
                              payloadDisplay = (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E6F4EA] border border-[#A7F3D0] text-[#065F46] font-mono text-[11px] font-bold">
                                  💬 "{first10}{cleanText.length > 10 ? '...' : ''}"
                                </span>
                              );
                            }
                          } else {
                            // General telemetry event: take clean first 10 chars of event/subsystem message
                            const cleanMsg = rawMsg.replace(/^(Alice preparing|Arbitrator evaluating|Bob applying|Verdict:|\s)+/i, '').trim() || log.event_type || log.subsystem;
                            const first10 = cleanMsg.slice(0, 10);
                            payloadDisplay = (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] font-mono text-[11px] font-medium">
                                💬 "{first10}{cleanMsg.length > 10 ? '...' : ''}"
                              </span>
                            );
                          }
                        }

                        return (
                          <tr 
                            key={log.id}
                            onClick={(e) => {
                              setSelectedItem(log);
                              if (e.ctrlKey || e.metaKey) {
                                setSelectedTelemetryDetail(log);
                              }
                            }}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? isError
                                  ? 'bg-[#FEE2E2] ring-1 ring-[#EF4444]'
                                  : 'bg-[#EBF3FF] ring-1 ring-[#0058BE]'
                                : isError 
                                ? 'bg-[#FEF2F2]/40 hover:bg-[#FEF2F2]' 
                                : 'hover:bg-[#F6F3F5]'
                            }`}
                            title="Click to update dashboard • Ctrl+Click to inspect raw packet bytes"
                          >
                            <td className="py-2 px-4 text-[#1B1B1D] relative">
                              {isError && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#BA1A1A]"/>}
                              {isSelected && !isError && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0058BE]"/>}
                              {log.timestamp}
                            </td>
                            <td className={`py-2 px-4 font-semibold ${isError ? 'text-[#BA1A1A]' : 'text-[#091426]'}`}>
                              {log.subsystem}
                            </td>
                            <td className={`py-2 px-4 ${isError ? 'text-[#BA1A1A]' : 'text-[#1B1B1D]'}`}>
                              {log.event_type}
                            </td>
                            <td className="py-2 px-4">
                              {payloadDisplay}
                            </td>
                            <td className="py-2 px-4 text-right text-[#1B1B1D]">
                              {log.latency_ms}ms
                            </td>
                            <td className="py-2 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${
                                isError
                                  ? 'bg-[#BA1A1A] text-white'
                                  : 'bg-[#F6F3F5] border border-[#E2E8F0] text-[#75777D]'
                              }`}>
                                {isError ? '0xFA' : '0x00'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ─── TAB 2: THREATS (EXACT 1-TO-1 REPLICA OF REFERENCE IMAGE WITH FULL FUNCTIONALITY) ─── */}
            {activeTab === 'threats' && (
              <div className="space-y-4 font-sans">
                {/* Title Row */}
                <div className="flex justify-between items-baseline border-b border-[#E2E8F0] pb-2.5">
                  <div className="flex items-baseline gap-4">
                    <h1 className="text-[24px] font-bold text-[#091426] tracking-tight leading-none font-sans uppercase">
                      THREATS
                    </h1>
                    {/* Severity Filter Chips */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      {(['ALL', 'CRITICAL', 'HIGH'] as const).map(sev => (
                        <button
                          key={sev}
                          onClick={() => setThreatSeverityFilter(sev)}
                          className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer font-bold ${
                            threatSeverityFilter === sev
                              ? 'bg-[#091426] text-white'
                              : 'bg-white border border-[#E2E8F0] text-[#75777D] hover:text-[#091426]'
                          }`}
                        >
                          {sev} {sev === 'ALL' ? `(${threatAnomalies.length})` : `(${threatAnomalies.filter(a => a.severity === sev).length})`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-[#45474C] font-medium tracking-wider uppercase">
                    4 ACTIVE ANOMALIES DETECTED
                  </div>
                </div>

                {/* Two Column Layout: Threats Table + Threat Inspector with Smooth Slide/Expand Transition */}
                <div className="flex gap-5 items-start overflow-hidden">
                  
                  {/* Left Column: Threats Table (Smoothly expands and contracts) */}
                  <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] overflow-hidden shadow-none">
                    <table className="w-full text-left border-collapse font-mono text-[12px]">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F6F3F5] text-[10px] text-[#75777D] uppercase tracking-widest font-medium">
                          <th className="py-2.5 px-4 font-medium">SEVERITY</th>
                          <th className="py-2.5 px-4 font-medium">ORIGIN NODE</th>
                          <th className="py-2.5 px-4 font-medium">ANOMALY TYPE</th>
                          <th className="py-2.5 px-4 font-medium text-right">TIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {threatAnomalies
                          .filter(a => threatSeverityFilter === 'ALL' || a.severity === threatSeverityFilter)
                          .map((anom) => {
                            const isSelected = selectedThreatAnomaly?.id === anom.id;
                            const isNodeQuarantined = quarantinedNodes.includes(anom.origin_node);
                            return (
                              <tr
                                key={anom.id}
                                onClick={() => setSelectedThreatAnomaly(anom)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-[#F6F3F5] border-l-[3px] border-[#0058BE]'
                                    : 'hover:bg-[#F6F3F5]'
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${anom.severity === 'CRITICAL' ? 'bg-[#BA1A1A]' : 'bg-[#C2540A]'}`} />
                                    <span className={`font-bold uppercase tracking-wider text-[11px] ${anom.severity === 'CRITICAL' ? 'text-[#BA1A1A]' : 'text-[#C2540A]'}`}>
                                      {anom.severity}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-[#1B1B1D]">
                                  <div className="flex items-center gap-2">
                                    <span>{anom.origin_node}</span>
                                    {isNodeQuarantined && (
                                      <span className="px-1.5 py-0.2 bg-[#FEE2E2] border border-[#FCA5A5] text-[#BA1A1A] text-[9px] font-bold uppercase rounded-[2px]">
                                        QUARANTINED
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-[#1B1B1D]">
                                  {anom.anomaly_type}
                                </td>
                                <td className="py-3 px-4 text-right text-[#1B1B1D]">
                                  {anom.time}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Column: THREAT INSPECTOR Card (Smooth 60fps Slide & Fade Drawer) */}
                  <div 
                    className={`shrink-0 transition-all duration-300 ease-in-out ${
                      selectedThreatAnomaly 
                        ? 'w-[360px] lg:w-[410px] opacity-100 translate-x-0' 
                        : 'w-0 opacity-0 translate-x-8 pointer-events-none'
                    }`}
                  >
                    {selectedThreatAnomaly && (
                      <div className="w-[360px] lg:w-[410px] border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] overflow-hidden shadow-none transition-opacity duration-200">
                        {/* Inspector Header */}
                        <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between">
                          <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#091426]">
                            THREAT INSPECTOR
                          </span>
                          <button
                            onClick={() => setSelectedThreatAnomaly(null)}
                            className="text-[#75777D] hover:text-[#091426] transition-colors p-0.5 cursor-pointer"
                            title="Close Inspector"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inspector Content */}
                        <div className="p-4 space-y-4 font-sans">
                          {/* Selected Anomaly Title */}
                          <div>
                            <div className="font-mono text-[9.5px] text-[#75777D] uppercase tracking-wider mb-1">
                              SELECTED ANOMALY
                            </div>
                            <div className="text-[17px] font-bold text-[#BA1A1A] tracking-tight uppercase leading-tight font-sans">
                              {selectedThreatAnomaly.title}
                            </div>
                          </div>

                          <div className="border-t border-[#E2E8F0]" />

                          {/* Telemetry Data Block */}
                          <div>
                            <div className="font-mono text-[9.5px] text-[#75777D] uppercase tracking-wider mb-2 font-medium">
                              TELEMETRY DATA
                            </div>
                            <div className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#1B1B1D] p-3.5 rounded-[2px] font-mono text-[11.5px] space-y-2 shadow-none">
                              <div className="flex justify-between items-center">
                                <span className="text-[#75777D]">NODE:</span>
                                <span className="text-[#091426] font-bold">{selectedThreatAnomaly.telemetry.node}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[#75777D]">BASELINE QBER:</span>
                                <span className="text-[#091426] font-bold">{selectedThreatAnomaly.telemetry.baseline_qber}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[#75777D]">CURRENT QBER:</span>
                                <span className="text-[#BA1A1A] font-bold">{selectedThreatAnomaly.telemetry.current_qber}</span>
                              </div>
                            </div>
                          </div>

                          {/* Risk Visualization Block */}
                          <div>
                            <div className="font-mono text-[9.5px] text-[#75777D] uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span>RISK VISUALIZATION</span>
                              {hoveredRiskBar && (
                                <span className="text-[#0058BE] font-bold">
                                  {hoveredRiskBar.sampleTime} · QBER: {hoveredRiskBar.qber}%
                                </span>
                              )}
                            </div>
                            <div className="border border-[#E2E8F0] bg-[#F8FAFC] p-3 rounded-[2px] h-[140px] flex items-end justify-between gap-2 relative">
                              {/* Horizontal grid lines */}
                              <div className="absolute inset-x-3 top-3 border-b border-[#E2E8F0] pointer-events-none" />
                              <div className="absolute inset-x-3 top-1/2 border-b border-[#E2E8F0] pointer-events-none" />
                              <div className="absolute inset-x-3 bottom-3 border-b border-[#E2E8F0] pointer-events-none" />

                              {selectedThreatAnomaly.risk_bars.map((bar, idx) => (
                                <div
                                  key={idx}
                                  onMouseEnter={() => setHoveredRiskBar({
                                    idx,
                                    height: bar.height,
                                    color: bar.color,
                                    qber: ((bar.height / 100) * 9.0).toFixed(2),
                                    sampleTime: `14:22:${(idx * 12).toString().padStart(2, '0')}`
                                  })}
                                  onMouseLeave={() => setHoveredRiskBar(null)}
                                  className="flex-1 rounded-[1px] transition-all duration-300 z-10 cursor-pointer hover:opacity-80 relative group"
                                  style={{
                                    height: `${bar.height}%`,
                                    backgroundColor: bar.color
                                  }}
                                >
                                  {hoveredRiskBar?.idx === idx && (
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#091426] text-white px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap z-30 shadow-lg">
                                      {((bar.height / 100) * 9.0).toFixed(2)}%
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons in Threat Inspector */}
                          <div className="pt-2 border-t border-[#E2E8F0] space-y-2 font-mono text-[11px]">
                            <button
                              onClick={() => handleToggleQuarantine(selectedThreatAnomaly.origin_node)}
                              className={`w-full py-2 font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                                quarantinedNodes.includes(selectedThreatAnomaly.origin_node)
                                  ? 'bg-[#065F46] hover:bg-[#047857] text-white'
                                  : 'bg-[#BA1A1A] hover:bg-[#991B1B] text-white'
                              }`}
                            >
                              {quarantinedNodes.includes(selectedThreatAnomaly.origin_node) ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>RESTORE NODE FROM QUARANTINE</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>QUARANTINE ORIGIN NODE</span>
                                </>
                              )}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={handlePurgeQubitBuffer}
                                className="py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-semibold text-[10px] uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Purge contaminated sifted qubit buffer"
                              >
                                <RefreshCw className="w-3 h-3 text-[#75777D]" />
                                <span>PURGE BUFFER</span>
                              </button>

                              <button
                                onClick={() => handleExportForensicReport(selectedThreatAnomaly)}
                                className="py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#0058BE] font-semibold text-[10px] uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Export incident forensic report JSON"
                              >
                                <FileDown className="w-3 h-3 text-[#0058BE]" />
                                <span>EXPORT PCAP</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ─── TAB 3: INCIDENTS (EXACT 1-TO-1 REPLICA WITH INTERACTIVE MANUAL CONTROLS) ─── */}
            {activeTab === 'incidents' && (
              <div className="space-y-4 font-sans">
                {/* Title & System Log Subtitle Row with + LOG INCIDENT Action */}
                <div className="flex justify-between items-baseline border-b border-[#E2E8F0] pb-2.5">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#091426] tracking-tight leading-none uppercase font-sans">
                      INCIDENTS
                    </h1>
                    <div className="font-mono text-[11px] text-[#45474C] font-medium tracking-wider uppercase mt-1.5">
                      SYSTEM LOG: 10/24/2023 - 10/25/2023
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCreateIncidentModal(true)}
                      className="px-3 py-1 bg-[#091426] hover:bg-[#1E293B] text-white font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>LOG INCIDENT</span>
                    </button>
                  </div>
                </div>

                {/* Two Column Layout: Incidents Table + Inspector */}
                <div className="grid grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column: Incidents Table */}
                  <div className="col-span-8 border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] overflow-hidden shadow-none">
                    <table className="w-full text-left border-collapse font-mono text-[12px]">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F6F3F5] text-[10px] text-[#75777D] uppercase tracking-widest font-medium">
                          <th className="py-2.5 px-4 font-medium">INCIDENT ID</th>
                          <th className="py-2.5 px-4 font-medium">STATUS</th>
                          <th className="py-2.5 px-4 font-medium">ASSIGNED</th>
                          <th className="py-2.5 px-4 font-medium text-right">IMPACT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {incidentsList.map((inc) => {
                          const isSelected = selectedIncidentId === inc.id;
                          return (
                            <tr
                              key={inc.id}
                              onClick={() => setSelectedIncidentId(inc.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#F6F3F5] border-l-[3px] border-[#0058BE]'
                                  : 'hover:bg-[#F6F3F5]'
                              }`}
                            >
                              <td className="py-3 px-4 font-bold text-[#091426]">
                                {inc.id}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    inc.status === 'ESCALATED' ? 'bg-[#BA1A1A]' :
                                    inc.status === 'RESOLVED'  ? 'bg-[#065F46]' :
                                    'bg-[#C2540A]'
                                  }`} />
                                  <span className={`font-bold uppercase tracking-wider text-[11px] ${
                                    inc.status === 'ESCALATED' ? 'text-[#BA1A1A]' :
                                    inc.status === 'RESOLVED'  ? 'text-[#065F46]' :
                                    'text-[#C2540A]'
                                  }`}>
                                    {inc.status}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[#1B1B1D]">
                                {inc.assigned}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-bold uppercase tracking-wider text-[11px] ${
                                  inc.impact === 'CRITICAL' ? 'text-[#BA1A1A]' :
                                  inc.impact === 'HIGH'     ? 'text-[#BA1A1A]' :
                                  inc.impact === 'MED'      ? 'text-[#0058BE]' :
                                  'text-[#065F46]'
                                }`}>
                                  {inc.impact}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Column: INSPECTOR Panel (Constant Height with Internal Scrollable Body) */}
                  {selectedIncidentDetail && (
                    <div className="col-span-4 border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] overflow-hidden shadow-none flex flex-col h-[520px] max-h-[520px] sticky top-4">
                      {/* Inspector Header */}
                      <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between shrink-0">
                        <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#091426]">
                          INSPECTOR: {selectedIncidentDetail.id}
                        </span>
                        {/* Status dot badge (read-only) */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedIncidentDetail.status === 'ESCALATED' ? 'bg-[#BA1A1A]' :
                            selectedIncidentDetail.status === 'RESOLVED'  ? 'bg-[#065F46]' :
                            'bg-[#C2540A]'
                          }`} />
                          <span className={`font-mono text-[9.5px] font-bold uppercase tracking-widest ${
                            selectedIncidentDetail.status === 'ESCALATED' ? 'text-[#BA1A1A]' :
                            selectedIncidentDetail.status === 'RESOLVED'  ? 'text-[#065F46]' :
                            'text-[#C2540A]'
                          }`}>
                            {selectedIncidentDetail.status}
                          </span>
                        </div>
                      </div>

                      {/* Inspector Body (Scrollable) */}
                      <div className="flex-1 p-5 space-y-4 font-sans overflow-y-auto min-h-0">
                        {/* Title & Description */}
                        <div>
                          <h2 className="text-[17px] font-bold text-[#091426] tracking-tight leading-snug">
                            {selectedIncidentDetail.title}
                          </h2>
                          <p className="text-[11.5px] text-[#45474C] font-sans mt-1 leading-relaxed">
                            {selectedIncidentDetail.description}
                          </p>
                        </div>

                        {/* Meta row */}
                        <div className="bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] p-3 font-mono text-[11px] space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-[#75777D]">ASSIGNED:</span>
                            <span className="text-[#091426] font-bold">{selectedIncidentDetail.assigned}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#75777D]">IMPACT:</span>
                            <span className={`font-bold uppercase ${
                              selectedIncidentDetail.impact === 'CRITICAL' || selectedIncidentDetail.impact === 'HIGH'
                                ? 'text-[#BA1A1A]' : selectedIncidentDetail.impact === 'MED' ? 'text-[#0058BE]' : 'text-[#065F46]'
                            }`}>{selectedIncidentDetail.impact}</span>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div>
                          <div className="font-mono text-[9.5px] text-[#75777D] uppercase tracking-wider mb-2 font-medium">
                            INCIDENT TIMELINE
                          </div>
                          <div className="relative pl-4 space-y-4 pt-1">
                            {/* Vertical Timeline Guide Line */}
                            <div className="absolute left-[3.5px] top-2 bottom-2 w-[1px] bg-[#E2E8F0]" />

                            {selectedIncidentDetail.timeline.map((event, idx) => (
                              <div key={idx} className="relative group font-mono">
                                {/* Event Bullet Dot */}
                                <div 
                                  className="absolute -left-4 top-1 w-2 h-2 rounded-full ring-2 ring-white z-10" 
                                  style={{ backgroundColor: event.dot_color }}
                                />
                                
                                <div>
                                  <div className="text-[10px] text-[#75777D] font-medium tracking-wider">
                                    {event.time}
                                  </div>
                                  <div 
                                    className="text-[11.5px] font-bold tracking-wide mt-0.5"
                                    style={{ color: event.title_color || '#091426' }}
                                  >
                                    {event.title}
                                  </div>
                                  <p className="text-[10.5px] text-[#45474C] font-mono mt-0.5 leading-relaxed">
                                    {event.description}
                                  </p>

                                  {/* Terminal Command Box */}
                                  {event.terminal && (
                                    <div className="mt-2 bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-[2px] font-mono text-[11px] space-y-1">
                                      <div className="text-[#091426] font-bold">
                                        {event.terminal.command}
                                      </div>
                                      <div className="text-[#065F46] font-semibold">
                                        {event.terminal.output}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 border-t border-[#E2E8F0] space-y-2 font-mono shrink-0 bg-[#FFFFFF]">
                        <div className="text-[9.5px] text-[#75777D] uppercase tracking-wider mb-1.5 font-medium">
                          SET INCIDENT STATUS
                        </div>
                        {/* Primary action: changes based on current status */}
                        {selectedIncidentDetail.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(
                              selectedIncidentDetail.id,
                              selectedIncidentDetail.status === 'INVESTIGATING' ? 'ESCALATED' : 'RESOLVED'
                            )}
                            className={`w-full py-2 font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-2 text-[11px] ${
                              selectedIncidentDetail.status === 'INVESTIGATING'
                                ? 'bg-[#BA1A1A] hover:bg-[#991B1B] text-white'
                                : 'bg-[#065F46] hover:bg-[#047857] text-white'
                            }`}
                          >
                            {selectedIncidentDetail.status === 'INVESTIGATING' ? (
                              <><AlertTriangle className="w-3.5 h-3.5" /><span>ESCALATE TO L3</span></>
                            ) : (
                              <><ShieldCheck className="w-3.5 h-3.5" /><span>MARK RESOLVED</span></>
                            )}
                          </button>
                        )}
                        {/* Secondary two-column actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            disabled={selectedIncidentDetail.status === 'INVESTIGATING'}
                            onClick={() => handleUpdateIncidentStatus(selectedIncidentDetail.id, 'INVESTIGATING')}
                            className={`py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] text-[#091426] font-semibold text-[10px] uppercase tracking-wider rounded-[2px] transition-colors flex items-center justify-center gap-1.5 ${
                              selectedIncidentDetail.status === 'INVESTIGATING'
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:bg-[#F6F3F5] cursor-pointer'
                            }`}
                          >
                            <Activity className="w-3 h-3 text-[#75777D]" />
                            <span>INVESTIGATE</span>
                          </button>
                          <button
                            onClick={() => setShowLogsDrawer(true)}
                            className="py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#0058BE] font-semibold text-[10px] uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Terminal className="w-3 h-3 text-[#0058BE]" />
                            <span>VIEW LOGS</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ─── TAB 4: SESSIONS (1:1 PIXEL-PERFECT REPLICA CONNECTED TO FASTAPI BACKEND) ─── */}
            {activeTab === 'sessions' && (() => {
              const renderFidelityWaveform = (fidelityType?: string, statusColor?: string) => {
                const color = statusColor || '#065F46';
                let pathData = "M 2,10 C 12,4 20,16 32,10 C 44,4 52,16 64,10 C 68,8 72,11 76,10"; // Default smooth continuous sine wave

                if (fidelityType === 'wave_dot' || statusColor === '#C2540A' || color === '#C2540A') {
                  // Continuous degraded / noisy quantum channel wave
                  pathData = "M 2,11 C 12,6 20,15 32,8 C 44,16 54,6 64,13 C 69,14 73,11 76,10";
                } else if (fidelityType === 'step_dip') {
                  // Continuous satellite optical baseline with pulse notch
                  pathData = "M 2,10 L 16,10 L 22,17 L 28,10 L 76,10";
                } else if (fidelityType === 'sine_tick') {
                  // Continuous clean entangled SPDC state wave
                  pathData = "M 2,10 C 10,4 18,16 28,10 C 38,4 46,16 56,10 C 64,5 70,14 76,10";
                }

                return (
                  <svg width="76" height="20" viewBox="0 0 76 20" className="overflow-visible block">
                    <path 
                      d={pathData} 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="1.6" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                );
              };

              return (
                <div className="space-y-4 font-sans">
                  {/* Title Row */}
                  <div className="flex justify-between items-baseline border-b border-[#E2E8F0] pb-2.5">
                    <div>
                      <h1 className="text-[24px] font-bold text-[#091426] tracking-tight leading-none uppercase font-sans">
                        SESSIONS
                      </h1>
                      <p className="font-sans text-[12px] text-[#45474C] mt-1 leading-none">
                        Active Quantum Communication Channels
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#45474C] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#065F46]" />
                        <span>{sessionChannels.length + 9} ACTIVE STREAMS</span>
                      </div>
                      <button
                        onClick={() => setShowCreateSessionModal(true)}
                        className="px-3 py-1 bg-[#091426] hover:bg-[#1E293B] text-white font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>INITIATE CHANNEL</span>
                      </button>
                    </div>
                  </div>

                  {/* Table Card */}
                  <div className="border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] overflow-hidden shadow-none">
                    {/* Table Section Label */}
                    <div className="px-4 py-2 bg-[#F6F3F5] border-b border-[#E2E8F0]">
                      <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#75777D]">
                        ACTIVE CHANNEL TELEMETRY
                      </span>
                    </div>

                    <table className="w-full text-left border-collapse font-mono text-[12px]">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA] text-[10px] text-[#75777D] uppercase tracking-widest font-medium">
                          <th className="py-2.5 px-4 font-medium w-16">ID</th>
                          <th className="py-2.5 px-4 font-medium">ENDPOINT</th>
                          <th className="py-2.5 px-4 font-medium">STATUS</th>
                          <th className="py-2.5 px-4 font-medium w-36">FIDELITY</th>
                          <th className="py-2.5 px-4 font-medium text-right">KEY RATE (KBPS)</th>
                          <th className="py-2.5 px-4 font-medium text-right">DURATION</th>
                          <th className="py-2.5 px-4 font-medium text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {sessionChannels.map((ch) => {
                          const isSelected = selectedSessionChannelId === ch.id;
                          return (
                            <tr
                              key={ch.id}
                              onClick={() => setSelectedSessionChannelId(ch.id)}
                              className={`transition-colors hover:bg-[#F6F3F5] cursor-pointer relative ${
                                isSelected ? 'bg-[#FFFFFF]' : ''
                              }`}
                            >
                              <td className="py-4 px-4 font-bold text-[#091426] relative font-mono text-[12px]">
                                {isSelected && (
                                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0058BE] rounded-r-[1px]" />
                                )}
                                {ch.id}
                              </td>
                              <td className="py-4 px-4 text-[#091426] font-medium font-mono text-[12px]">
                                {ch.endpoint}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                                    style={{ backgroundColor: ch.statusColor || (ch.status === 'STABLE' ? '#065F46' : ch.status === 'DEGRADED' ? '#C2540A' : '#75777D') }}
                                  />
                                  <span 
                                    className="font-bold uppercase tracking-wider text-[11px]" 
                                    style={{ color: ch.statusColor || (ch.status === 'STABLE' ? '#065F46' : ch.status === 'DEGRADED' ? '#C2540A' : '#75777D') }}
                                  >
                                    {ch.status}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {renderFidelityWaveform(ch.fidelity_type, ch.statusColor)}
                              </td>
                              <td className="py-4 px-4 text-right font-mono text-[12px] text-[#091426]">
                                {ch.keyRate}
                              </td>
                              <td className="py-4 px-4 text-right text-[#091426] font-mono text-[12px]">
                                {ch.duration}
                              </td>
                              <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  {/* History / Replay button */}
                                  <button
                                    onClick={() => handleSyncChannel(ch.id)}
                                    className="w-7 h-7 flex items-center justify-center border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F6F3F5] rounded-[2px] transition-colors cursor-pointer"
                                    title="Synchronize and refresh channel entropy"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-[#091426]" />
                                  </button>
                                  {/* Stop / Terminate button */}
                                  <button
                                    onClick={() => handleTerminateChannel(ch.id)}
                                    className="w-7 h-7 flex items-center justify-center bg-[#091426] hover:bg-[#1E293B] rounded-[2px] transition-colors cursor-pointer"
                                    title={ch.status === 'PAUSED' ? 'Resume quantum stream' : 'Pause/Terminate quantum stream'}
                                  >
                                    <div className="w-2.5 h-2.5 bg-white rounded-[0.5px]" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* ─── TAB 5: NETWORK (1:1 PIXEL-PERFECT INTERACTIVE REFERENCE ARCHITECTURE REPLICA) ─── */}
            {activeTab === 'network' && (() => {
              const selectedNodeData = topologyNodes[selectedTopologyNodeId] || topologyNodes['QN-ALICE'];

              const filteredConnectedNodes = selectedNodeData.connectedNodes.filter(cn => {
                if (inventoryFilter === 'ONLINE') return cn.statusColor === '#065F46';
                if (inventoryFilter === 'DEGRADED') return cn.statusColor === '#C2540A';
                if (inventoryFilter === 'CORE') return cn.name.includes('CORE') || cn.name.includes('ARB');
                if (nodeSearchQuery.trim()) {
                  return cn.name.toLowerCase().includes(nodeSearchQuery.toLowerCase()) || cn.subtitle.toLowerCase().includes(nodeSearchQuery.toLowerCase());
                }
                return true;
              });

              return (
                <div className="space-y-4 font-sans h-full flex flex-col">
                  {/* Title & Status Legend Row */}
                  <div className="flex justify-between items-baseline border-b border-[#E2E8F0] pb-2.5 shrink-0">
                    <div>
                      <h1 className="text-[24px] font-bold text-[#091426] tracking-tight leading-none uppercase font-sans">
                        NETWORK TOPOLOGY
                      </h1>
                      <div className="flex items-center gap-4 mt-2 font-mono text-[10px] uppercase font-bold tracking-wider">
                        <div 
                          onClick={() => setInventoryFilter(inventoryFilter === 'ONLINE' ? 'ALL' : 'ONLINE')}
                          className={`flex items-center gap-1.5 text-[#065F46] cursor-pointer hover:opacity-80 transition-opacity ${
                            inventoryFilter === 'ONLINE' ? 'underline font-black' : ''
                          }`}
                          title="Click to filter online nodes"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#065F46]" />
                          <span>ACTIVE</span>
                        </div>
                        <div 
                          onClick={() => setInventoryFilter(inventoryFilter === 'DEGRADED' ? 'ALL' : 'DEGRADED')}
                          className={`flex items-center gap-1.5 text-[#C2540A] cursor-pointer hover:opacity-80 transition-opacity ${
                            inventoryFilter === 'DEGRADED' ? 'underline font-black' : ''
                          }`}
                          title="Click to filter degraded nodes"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#C2540A]" />
                          <span>DEGRADED</span>
                        </div>
                        <div 
                          onClick={() => setInventoryFilter(inventoryFilter === 'CORE' ? 'ALL' : 'CORE')}
                          className={`flex items-center gap-1.5 text-[#BA1A1A] cursor-pointer hover:opacity-80 transition-opacity ${
                            inventoryFilter === 'CORE' ? 'underline font-black' : ''
                          }`}
                          title="Click to filter offline nodes"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#BA1A1A]" />
                          <span>OFFLINE</span>
                        </div>
                        {inventoryFilter !== 'ALL' && (
                          <button
                            onClick={() => setInventoryFilter('ALL')}
                            className="text-[#0058BE] hover:underline text-[9.5px] cursor-pointer"
                          >
                            (Clear Filter)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Interactive Canvas (Left) + Node Inventory (Right) */}
                  <div className="grid grid-cols-12 gap-6 flex-1 items-start">
                    {/* ── Left / Center Column: Quantum Network Topology Canvas ── */}
                    <div 
                      ref={topologyCanvasRef}
                      onDoubleClick={() => {
                        setNodePositions({
                          'ARB-CORE': { x: 50, y: 24 },
                          'QN-ALICE': { x: 34, y: 50 },
                          'QN-BOB': { x: 72, y: 50 }
                        });
                        setTopologyZoom(1.0);
                        showToast('Topology positions & zoom reset to nominal layout.');
                      }}
                      className="col-span-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] h-[580px] relative overflow-hidden shadow-none select-none"
                    >
                      {/* Grid Background Pattern */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                          backgroundSize: '32px 32px'
                        }}
                      />

                      {/* Scalable Container for Vector Lines and Nodes */}
                      <div 
                        className="absolute inset-0 w-full h-full"
                        style={{ 
                          transform: `scale(${topologyZoom})`, 
                          transformOrigin: 'center center', 
                          transition: draggingTopologyNode ? 'none' : 'transform 0.2s ease-out' 
                        }}
                      >
                        {/* Network Connectors SVG Layer with Precise Motion Paths */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 600" preserveAspectRatio="none">
                          {/* Faint Horizontal Baseline connecting QN-ALICE and QN-BOB */}
                          <path 
                            d={`M ${nodePositions['QN-ALICE'].x * 10} ${(nodePositions['QN-ALICE'].y + 2) * 6} L ${nodePositions['QN-BOB'].x * 10} ${(nodePositions['QN-BOB'].y + 2) * 6}`}
                            stroke="#E2E8F0" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4" 
                            fill="none"
                          />

                          {/* Link 1: QN-ALICE to ARB-CORE (Dashed Green) */}
                          <path 
                            id="link-alice-to-arb"
                            d={`M ${nodePositions['QN-ALICE'].x * 10} ${nodePositions['QN-ALICE'].y * 6} L ${nodePositions['ARB-CORE'].x * 10} ${nodePositions['ARB-CORE'].y * 6}`}
                            stroke="#065F46" 
                            strokeWidth="2.2" 
                            strokeDasharray="6 6" 
                            fill="none"
                          />

                          {/* Link 2: ARB-CORE to QN-BOB (Solid Amber or Green if optimized) */}
                          <path 
                            id="link-arb-to-bob"
                            d={`M ${nodePositions['ARB-CORE'].x * 10} ${nodePositions['ARB-CORE'].y * 6} L ${nodePositions['QN-BOB'].x * 10} ${nodePositions['QN-BOB'].y * 6}`}
                            stroke={topologyNodes['QN-BOB'].statusColor} 
                            strokeWidth="2.5" 
                            fill="none"
                          />

                        </svg>

                        {/* ─── LIVE 60FPS PHOTON PULSE BULLETS TRAVELING ALONG OPTICAL LINES ─── */}
                        {pingPacketFactor !== null && pingingNodeId === 'QN-ALICE' && (
                          <div
                            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-none"
                            style={{
                              left: `${nodePositions['QN-ALICE'].x + (nodePositions['ARB-CORE'].x - nodePositions['QN-ALICE'].x) * pingPacketFactor}%`,
                              top: `${nodePositions['QN-ALICE'].y + (nodePositions['ARB-CORE'].y - nodePositions['QN-ALICE'].y) * pingPacketFactor}%`,
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-[#0058BE]/30 animate-ping absolute" />
                            <div className="w-5 h-5 rounded-full bg-[#0058BE]/60 blur-[1px] absolute" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#0058BE] border-2 border-white shadow-[0_0_14px_#0058BE] relative z-10" />
                          </div>
                        )}

                        {pingPacketFactor !== null && pingingNodeId === 'QN-BOB' && (
                          <div
                            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-none"
                            style={{
                              left: `${nodePositions['QN-BOB'].x + (nodePositions['ARB-CORE'].x - nodePositions['QN-BOB'].x) * pingPacketFactor}%`,
                              top: `${nodePositions['QN-BOB'].y + (nodePositions['ARB-CORE'].y - nodePositions['QN-BOB'].y) * pingPacketFactor}%`,
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-[#0058BE]/30 animate-ping absolute" />
                            <div className="w-5 h-5 rounded-full bg-[#0058BE]/60 blur-[1px] absolute" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#0058BE] border-2 border-white shadow-[0_0_14px_#0058BE] relative z-10" />
                          </div>
                        )}

                        {pingPacketFactor !== null && pingingNodeId === 'ARB-CORE' && (
                          <>
                            {/* Pulse to Alice */}
                            <div
                              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-none"
                              style={{
                                left: `${nodePositions['ARB-CORE'].x + (nodePositions['QN-ALICE'].x - nodePositions['ARB-CORE'].x) * pingPacketFactor}%`,
                                top: `${nodePositions['ARB-CORE'].y + (nodePositions['QN-ALICE'].y - nodePositions['ARB-CORE'].y) * pingPacketFactor}%`,
                              }}
                            >
                              <div className="w-8 h-8 rounded-full bg-[#0058BE]/30 animate-ping absolute" />
                              <div className="w-5 h-5 rounded-full bg-[#0058BE]/60 blur-[1px] absolute" />
                              <div className="w-3.5 h-3.5 rounded-full bg-[#0058BE] border-2 border-white shadow-[0_0_14px_#0058BE] relative z-10" />
                            </div>
                            {/* Pulse to Bob */}
                            <div
                              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-none"
                              style={{
                                left: `${nodePositions['ARB-CORE'].x + (nodePositions['QN-BOB'].x - nodePositions['ARB-CORE'].x) * pingPacketFactor}%`,
                                top: `${nodePositions['ARB-CORE'].y + (nodePositions['QN-BOB'].y - nodePositions['ARB-CORE'].y) * pingPacketFactor}%`,
                              }}
                            >
                              <div className="w-8 h-8 rounded-full bg-[#0058BE]/30 animate-ping absolute" />
                              <div className="w-5 h-5 rounded-full bg-[#0058BE]/60 blur-[1px] absolute" />
                              <div className="w-3.5 h-3.5 rounded-full bg-[#0058BE] border-2 border-white shadow-[0_0_14px_#0058BE] relative z-10" />
                            </div>
                          </>
                        )}

                        {/* Telemetry Badge Pills on Lines (Clickable for Diagnostics) */}
                        {/* Telemetry Pill 1 (QN-ALICE <-> ARB-CORE) */}
                        <div 
                          onClick={() => setSelectedLinkDiagnostics({
                            linkId: 'LINK-ALICE-ARB-01',
                            source: 'QN-ALICE',
                            target: 'ARB-CORE',
                            latency: '12ms',
                            loss: '0%',
                            status: 'NOMINAL',
                            statusColor: '#065F46',
                            attenuation: '0.16 dB/km',
                            qber: '1.2%',
                            protocol: 'BB84 (Decoy-State)',
                            keyRate: '1.2 kbps'
                          })}
                          className="absolute z-20 bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#0058BE] hover:shadow-md px-2 py-0.5 rounded-[2px] shadow-sm font-mono text-[9.5px] text-[#091426] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all"
                          style={{ 
                            left: `${(nodePositions['QN-ALICE'].x + nodePositions['ARB-CORE'].x) / 2}%`, 
                            top: `${(nodePositions['QN-ALICE'].y + nodePositions['ARB-CORE'].y) / 2}%` 
                          }}
                          title="Click to view optical link diagnostics"
                        >
                          12ms | 0%
                        </div>

                        {/* Telemetry Pill 2 (ARB-CORE <-> QN-BOB) */}
                        <div 
                          onClick={() => setSelectedLinkDiagnostics({
                            linkId: 'LINK-ARB-BOB-02',
                            source: 'ARB-CORE',
                            target: 'QN-BOB',
                            latency: topologyNodes['QN-BOB'].status === 'ONLINE' ? '18ms' : '85ms',
                            loss: topologyNodes['QN-BOB'].status === 'ONLINE' ? '0%' : '2%',
                            status: topologyNodes['QN-BOB'].status === 'ONLINE' ? 'OPTIMAL' : 'DEGRADED',
                            statusColor: topologyNodes['QN-BOB'].statusColor,
                            attenuation: topologyNodes['QN-BOB'].status === 'ONLINE' ? '0.18 dB/km' : '0.45 dB/km',
                            qber: topologyNodes['QN-BOB'].status === 'ONLINE' ? '1.8%' : '4.2%',
                            protocol: 'BB84 / E91 Entanglement',
                            keyRate: topologyNodes['QN-BOB'].keyGenRate
                          })}
                          className="absolute z-20 bg-[#FFFFFF] border px-2 py-0.5 rounded-[2px] shadow-sm font-mono text-[9.5px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all hover:shadow-md"
                          style={{ 
                            left: `${(nodePositions['ARB-CORE'].x + nodePositions['QN-BOB'].x) / 2}%`, 
                            top: `${(nodePositions['ARB-CORE'].y + nodePositions['QN-BOB'].y) / 2}%`,
                            borderColor: topologyNodes['QN-BOB'].statusColor,
                            color: topologyNodes['QN-BOB'].statusColor
                          }}
                          title="Click to view and optimize optical link"
                        >
                          {topologyNodes['QN-BOB'].status === 'ONLINE' ? '18ms | 0%' : '85ms | 2%'}
                        </div>

                        {/* ── Node Cards on Canvas (Fully Draggable) ── */}
                        {/* 1. ARB-CORE (Central Hub - Top Center) */}
                        <div 
                          onClick={() => setSelectedTopologyNodeId('ARB-CORE')}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedTopologyNodeId('ARB-CORE');
                            setDraggingTopologyNode('ARB-CORE');
                          }}
                          className={`absolute z-20 w-[128px] h-[100px] bg-[#FFFFFF] rounded-[10px] shadow-sm flex flex-col items-center justify-center transition-shadow -translate-x-1/2 -translate-y-1/2 select-none ${
                            draggingTopologyNode === 'ARB-CORE' ? 'cursor-grabbing scale-105 shadow-xl' : 'cursor-grab hover:scale-[1.02]'
                          } ${
                            selectedTopologyNodeId === 'ARB-CORE'
                              ? 'border-2 border-[#0058BE] shadow-md ring-4 ring-[#0058BE]/15'
                              : 'border-2 border-[#091426]'
                          } ${rebootingNodeId === 'ARB-CORE' ? 'animate-pulse' : ''}`}
                          style={{ left: `${nodePositions['ARB-CORE'].x}%`, top: `${nodePositions['ARB-CORE'].y}%` }}
                          title="ARB-CORE: Drag to reposition, click to inspect"
                        >
                          <span className={`w-2 h-2 rounded-full absolute top-2.5 right-2.5 ${
                            rebootingNodeId === 'ARB-CORE' ? 'bg-[#D97706] animate-ping' : 'bg-[#065F46]'
                          }`} />
                          
                          {/* Constellation Star Icon */}
                          <div className="text-[#091426] mb-1 pointer-events-none">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
                              <circle cx="12" cy="4" r="2"/>
                              <circle cx="20" cy="12" r="2"/>
                              <circle cx="12" cy="20" r="2"/>
                              <circle cx="4" cy="12" r="2"/>
                              <path d="M12 6.5v3M17.5 12h-3M12 14.5v3M9.5 12h-3"/>
                            </svg>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#091426] tracking-wider uppercase pointer-events-none">
                            ARB-CORE
                          </span>
                          {rebootingNodeId === 'ARB-CORE' && (
                            <span className="text-[8.5px] font-mono font-bold text-[#D97706] mt-0.5 pointer-events-none">REBOOTING...</span>
                          )}
                        </div>

                        {/* 2. QN-ALICE (Transmitter Node - Bottom Left) */}
                        <div 
                          onClick={() => setSelectedTopologyNodeId('QN-ALICE')}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedTopologyNodeId('QN-ALICE');
                            setDraggingTopologyNode('QN-ALICE');
                          }}
                          className={`absolute z-20 w-[124px] h-[92px] bg-[#FFFFFF] rounded-[10px] flex flex-col items-center justify-center transition-shadow -translate-x-1/2 -translate-y-1/2 select-none ${
                            draggingTopologyNode === 'QN-ALICE' ? 'cursor-grabbing scale-105 shadow-xl' : 'cursor-grab hover:scale-[1.02]'
                          } ${
                            selectedTopologyNodeId === 'QN-ALICE'
                              ? 'border-2 border-[#0058BE] shadow-md ring-4 ring-[#0058BE]/15'
                              : 'border border-[#CBD5E1] hover:border-[#0058BE]'
                          } ${rebootingNodeId === 'QN-ALICE' ? 'animate-pulse' : ''}`}
                          style={{ left: `${nodePositions['QN-ALICE'].x}%`, top: `${nodePositions['QN-ALICE'].y}%` }}
                          title="QN-ALICE: Drag to reposition, click to inspect"
                        >
                          <span className={`w-2 h-2 rounded-full absolute top-2.5 right-2.5 ${
                            rebootingNodeId === 'QN-ALICE' ? 'bg-[#D97706] animate-ping' : 'bg-[#065F46]'
                          }`} />
                          
                          <div className="text-[#0058BE] mb-1 pointer-events-none">
                            <Cpu className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#0058BE] tracking-wider uppercase pointer-events-none">
                            QN-ALICE
                          </span>
                          {rebootingNodeId === 'QN-ALICE' && (
                            <span className="text-[8.5px] font-mono font-bold text-[#D97706] mt-0.5 pointer-events-none">REBOOTING...</span>
                          )}
                        </div>

                        {/* 3. QN-BOB (Receiver Node - Bottom Right) */}
                        <div 
                          onClick={() => setSelectedTopologyNodeId('QN-BOB')}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedTopologyNodeId('QN-BOB');
                            setDraggingTopologyNode('QN-BOB');
                          }}
                          className={`absolute z-20 w-[124px] h-[92px] bg-[#FFFFFF] rounded-[10px] flex flex-col items-center justify-center transition-shadow -translate-x-1/2 -translate-y-1/2 select-none ${
                            draggingTopologyNode === 'QN-BOB' ? 'cursor-grabbing scale-105 shadow-xl' : 'cursor-grab hover:scale-[1.02]'
                          } ${
                            selectedTopologyNodeId === 'QN-BOB'
                              ? 'border-2 border-[#0058BE] shadow-md ring-4 ring-[#0058BE]/15'
                              : 'border border-[#CBD5E1] hover:border-[#091426]'
                          } ${rebootingNodeId === 'QN-BOB' ? 'animate-pulse' : ''}`}
                          style={{ left: `${nodePositions['QN-BOB'].x}%`, top: `${nodePositions['QN-BOB'].y}%` }}
                          title="QN-BOB: Drag to reposition, click to inspect"
                        >
                          <span 
                            className={`w-2 h-2 rounded-full absolute top-2.5 right-2.5 ${
                              rebootingNodeId === 'QN-BOB' ? 'bg-[#D97706] animate-ping' : ''
                            }`}
                            style={{ backgroundColor: rebootingNodeId === 'QN-BOB' ? '#D97706' : topologyNodes['QN-BOB'].statusColor }}
                          />
                          
                          <div className="text-[#091426] mb-1 pointer-events-none">
                            <Cpu className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#091426] tracking-wider uppercase pointer-events-none">
                            QN-BOB
                          </span>
                          {rebootingNodeId === 'QN-BOB' && (
                            <span className="text-[8.5px] font-mono font-bold text-[#D97706] mt-0.5 pointer-events-none">REBOOTING...</span>
                          )}
                        </div>
                      </div>

                      {/* Zoom Controls (Bottom Right) */}
                      <div className="absolute bottom-4 right-4 z-30 flex flex-col border border-[#E2E8F0] rounded-[2px] bg-white shadow-sm overflow-hidden">
                        <button 
                          onClick={() => setTopologyZoom(prev => Math.min(1.5, parseFloat((prev + 0.1).toFixed(2))))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F6F3F5] text-[#091426] font-mono text-[14px] cursor-pointer border-b border-[#E2E8F0] transition-colors"
                          title="Zoom In (+10%)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setTopologyZoom(prev => Math.max(0.7, parseFloat((prev - 0.1).toFixed(2))))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F6F3F5] text-[#091426] font-mono text-[14px] cursor-pointer transition-colors"
                          title="Zoom Out (-10%)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reset Zoom helper if zoomed */}
                      {topologyZoom !== 1.0 && (
                        <button
                          onClick={() => setTopologyZoom(1.0)}
                          className="absolute bottom-4 left-4 z-30 px-2.5 py-1 bg-white border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-mono text-[10px] rounded-[2px] shadow-sm cursor-pointer"
                        >
                          Reset Zoom ({Math.round(topologyZoom * 100)}%)
                        </button>
                      )}
                    </div>

                    {/* ── Right Column: NODE INVENTORY Inspector Panel ── */}
                    <div className="col-span-4 space-y-4">
                      {/* Node Inventory Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#E2E8F0] relative">
                        <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#091426]">
                          NODE INVENTORY
                        </span>
                        <button 
                          onClick={() => setShowInventoryFilterMenu(!showInventoryFilterMenu)}
                          className="text-[#75777D] hover:text-[#091426] p-1 cursor-pointer"
                          title="Filter node inventory"
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>

                        {/* Filter Dropdown Popover */}
                        {showInventoryFilterMenu && (
                          <div className="absolute right-0 top-7 w-44 bg-white border border-[#E2E8F0] rounded-[2px] shadow-xl z-40 py-1 font-mono text-[11px]">
                            {[
                              { label: 'All Nodes', val: 'ALL' },
                              { label: 'Active Only (ONLINE)', val: 'ONLINE' },
                              { label: 'Degraded Only', val: 'DEGRADED' },
                              { label: 'Hubs Only (CORE)', val: 'CORE' },
                            ].map(opt => (
                              <button
                                key={opt.val}
                                onClick={() => {
                                  setInventoryFilter(opt.val as any);
                                  setShowInventoryFilterMenu(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-[#F6F3F5] flex items-center justify-between cursor-pointer ${
                                  inventoryFilter === opt.val ? 'text-[#0058BE] font-bold bg-[#EBF3FF]' : 'text-[#091426]'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {inventoryFilter === opt.val && <Check className="w-3 h-3 text-[#0058BE]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Active Node Detail Card */}
                      <div className="border border-[#0058BE] rounded-[2px] bg-[#FFFFFF] overflow-hidden shadow-none font-mono">
                        {/* Blue Header Bar */}
                        <div className="bg-[#EBF3FF] border-b border-[#BFDBFE] px-3.5 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#0058BE]">
                            <Cpu className="w-3.5 h-3.5" strokeWidth={2.2} />
                            <span className="text-[11px] font-bold tracking-wider uppercase">
                              {selectedNodeData.name}
                            </span>
                          </div>
                          <span 
                            className="px-1.5 py-0.2 border text-[9px] font-bold rounded-[2px] uppercase tracking-wider"
                            style={{ 
                              backgroundColor: selectedNodeData.status === 'ONLINE' ? '#E6F4EA' : '#FEF3C7',
                              color: selectedNodeData.statusColor,
                              borderColor: selectedNodeData.statusColor
                            }}
                          >
                            {rebootingNodeId === selectedNodeData.id ? 'REBOOTING' : selectedNodeData.status}
                          </span>
                        </div>

                        {/* Node Specs Table */}
                        <div className="p-3.5 space-y-2 text-[11px] divide-y divide-[#E2E8F0]">
                          <div className="flex justify-between items-center pt-1 first:pt-0">
                            <span className="text-[#75777D]">Uptime</span>
                            <span className="font-bold text-[#091426]">{selectedNodeData.uptime}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[#75777D]">Hardware</span>
                            <span className="font-bold text-[#091426]">{selectedNodeData.hardware}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[#75777D]">Protocol Support</span>
                            <span className="font-bold text-[#091426]">{selectedNodeData.protocolSupport}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[#75777D]">Key Gen Rate</span>
                            <span className="font-bold text-[#091426]">{selectedNodeData.keyGenRate}</span>
                          </div>
                        </div>

                        {/* Ping / Reboot Action Buttons */}
                        <div className="p-3 border-t border-[#E2E8F0] bg-[#FAFAFA] flex gap-2">
                          <button 
                            onClick={() => handlePingNode(selectedNodeData.id)}
                            disabled={pingingNodeId === selectedNodeData.id}
                            className="flex-1 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F6F3F5] text-[#091426] font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {pingingNodeId === selectedNodeData.id ? 'PINGING...' : 'PING'}
                          </button>
                          <button 
                            onClick={() => handleRebootNode(selectedNodeData.id)}
                            disabled={rebootingNodeId === selectedNodeData.id}
                            className="flex-1 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F6F3F5] text-[#091426] font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {rebootingNodeId === selectedNodeData.id ? 'REBOOTING...' : 'REBOOT'}
                          </button>
                        </div>

                        {/* Live ICMP Diagnostic Console Output (Matches Clean Light SOC Theme) */}
                        {pingTerminalOutput && pingTerminalOutput.nodeId === selectedNodeData.id && (
                          <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] text-[10px] font-mono space-y-1.5 animate-fade-in">
                            <div className="flex justify-between items-center pb-1.5 border-b border-[#E2E8F0]">
                              <span className="font-bold text-[#0058BE] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0058BE] animate-ping" />
                                ICMP QKD TELEMETRY
                              </span>
                              <button 
                                onClick={() => setPingTerminalOutput(null)} 
                                className="text-[#75777D] hover:text-[#091426] cursor-pointer text-[9.5px] uppercase font-bold"
                              >
                                [Clear]
                              </button>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[10px] leading-relaxed text-[#091426]">
                              {pingTerminalOutput.lines.map((ln, idx) => {
                                if (ln.startsWith('>')) {
                                  return (
                                    <div key={idx} className="text-[#0058BE] font-bold">
                                      {ln}
                                    </div>
                                  );
                                }
                                if (ln.startsWith('---')) {
                                  return (
                                    <div key={idx} className="text-[#065F46] font-bold bg-[#E6F4EA] border border-[#A7F3D0] px-1.5 py-0.5 rounded-[2px] mt-1">
                                      {ln}
                                    </div>
                                  );
                                }
                                return (
                                  <div key={idx} className="text-[#334155]">
                                    {ln}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Connected Nodes List */}
                      <div className="pt-2 font-mono">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#75777D] block mb-2">
                          CONNECTED NODES ({filteredConnectedNodes.length})
                        </span>

                        <div className="space-y-2">
                          {filteredConnectedNodes.map((cn) => (
                            <div 
                              key={cn.id}
                              onClick={() => setSelectedTopologyNodeId(cn.id)}
                              className="p-3 border border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#0058BE] rounded-[2px] flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span 
                                  className="w-1.5 h-1.5 rounded-full shrink-0" 
                                  style={{ backgroundColor: cn.statusColor }}
                                />
                                <div>
                                  <span className="font-bold text-[11px] text-[#091426] block leading-tight">
                                    {cn.name}
                                  </span>
                                  <span className="text-[9.5px] text-[#75777D] block leading-tight mt-0.5">
                                    {cn.subtitle}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-bold text-[11px] text-[#091426] block leading-tight">
                                  {cn.latency}
                                </span>
                                <span 
                                  className="text-[9.5px] font-semibold block leading-tight mt-0.5"
                                  style={{ color: cn.statusColor }}
                                >
                                  {cn.loss}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── OPTICAL LINK DIAGNOSTICS & OPTIMIZER MODAL ─── */}
                  {selectedLinkDiagnostics && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer" onClick={() => setSelectedLinkDiagnostics(null)}>
                      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-md overflow-hidden font-sans cursor-default" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
                          <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-[#0058BE]" />
                            <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                              OPTICAL FIBER LINK DIAGNOSTICS
                            </span>
                          </div>
                          <button onClick={() => setSelectedLinkDiagnostics(null)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-5 space-y-3 font-mono text-[12px]">
                          <div className="p-3 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] flex items-center justify-between">
                            <span className="font-bold text-[#091426]">{selectedLinkDiagnostics.source} ↔ {selectedLinkDiagnostics.target}</span>
                            <span 
                              className="px-2 py-0.5 text-[9.5px] font-bold rounded-[2px] border"
                              style={{ 
                                backgroundColor: selectedLinkDiagnostics.statusColor === '#065F46' ? '#E6F4EA' : '#FEF3C7',
                                color: selectedLinkDiagnostics.statusColor,
                                borderColor: selectedLinkDiagnostics.statusColor
                              }}
                            >
                              {selectedLinkDiagnostics.status}
                            </span>
                          </div>

                          <div className="divide-y divide-[#E2E8F0] text-[11px]">
                            <div className="py-2 flex justify-between"><span className="text-[#75777D]">Fiber Attenuation:</span><strong className="text-[#091426]">{selectedLinkDiagnostics.attenuation}</strong></div>
                            <div className="py-2 flex justify-between"><span className="text-[#75777D]">Packet Loss / Sift Drop:</span><strong style={{ color: selectedLinkDiagnostics.statusColor }}>{selectedLinkDiagnostics.loss}</strong></div>
                            <div className="py-2 flex justify-between"><span className="text-[#75777D]">Latency (RTT):</span><strong className="text-[#091426]">{selectedLinkDiagnostics.latency}</strong></div>
                            <div className="py-2 flex justify-between"><span className="text-[#75777D]">Channel QBER:</span><strong style={{ color: selectedLinkDiagnostics.statusColor }}>{selectedLinkDiagnostics.qber}</strong></div>
                            <div className="py-2 flex justify-between"><span className="text-[#75777D]">Protocol Carrier:</span><strong className="text-[#0058BE]">{selectedLinkDiagnostics.protocol}</strong></div>
                            <div className="py-2 flex justify-between"><span className="text-[#75777D]">Entropy Key Rate:</span><strong className="text-[#091426]">{selectedLinkDiagnostics.keyRate}</strong></div>
                          </div>

                          <div className="pt-2 flex gap-2">
                            <button
                              onClick={() => handleOptimizeOpticalLink(selectedLinkDiagnostics.linkId)}
                              className="flex-1 py-2 bg-[#0058BE] hover:bg-[#00479E] text-white font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                            >
                              OPTIMIZE OPTICAL CHANNEL
                            </button>
                            <button
                              onClick={() => setSelectedLinkDiagnostics(null)}
                              className="px-4 py-2 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F6F3F5] text-[#091426] font-mono text-[10.5px] font-medium uppercase rounded-[2px] transition-colors cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </main>
      </div>

      {/* ─── 3. RAW TELEMETRY PACKET INSPECTOR MODAL (Ctrl+Click Triggered) ─── */}
      {selectedTelemetryDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold text-[#091426] uppercase tracking-widest">
                  PACKET INSPECTOR · {selectedTelemetryDetail.subsystem}
                </span>
              </div>
              <button onClick={() => setSelectedTelemetryDetail(null)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[12px]">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#75777D]">
                <div>Timestamp: <strong className="text-[#091426]">{selectedTelemetryDetail.timestamp}</strong></div>
                <div>Status Code: <strong className="text-[#091426]">{selectedTelemetryDetail.status_code} ({selectedTelemetryDetail.is_error ? '0xFA' : '0x00'})</strong></div>
                <div>Payload: <strong className="text-[#091426]">{selectedTelemetryDetail.latency_ms} Bytes</strong></div>
                <div>Event Type: <strong className="text-[#091426]">{selectedTelemetryDetail.event_type}</strong></div>
              </div>
              <div>
                <label className="text-[#75777D] text-[10px] uppercase tracking-wider block mb-1">Subsystem Routing Payload</label>
                <div className="p-2.5 bg-[#F6F3F5] border border-[#E2E8F0] text-[#1B1B1D] rounded-[2px] text-[11.5px] leading-relaxed">
                  {selectedTelemetryDetail.message}
                </div>
              </div>
              <div className="p-2.5 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] text-[10.5px] text-[#75777D] space-y-1">
                <div className="flex justify-between"><span>Measured QBER:</span><strong className={selectedTelemetryDetail.is_error ? 'text-[#BA1A1A]' : 'text-[#065F46]'}>{selectedTelemetryDetail.qber.toFixed(2)}%</strong></div>
                <div className="flex justify-between"><span>CHSH Score:</span><strong className="text-[#091426]">{selectedTelemetryDetail.chsh_score.toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Security State:</span><strong className="text-[#091426]">{selectedTelemetryDetail.security_score}</strong></div>
              </div>
              <button 
                onClick={() => setSelectedTelemetryDetail(null)} 
                className="w-full py-1.5 bg-[#0058BE] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. HOEFFDING BOUND ANALYZER MODAL (Ctrl+Click on QBER Card) ─── */}
      {showHoeffdingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#BA1A1A]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  HOEFFDING STATISTICAL BOUND ANALYZER
                </span>
              </div>
              <button onClick={() => setShowHoeffdingModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[12px]">
              <div className="p-3 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] text-[11px] space-y-1">
                <div className="text-[#091426] font-bold">Hoeffding Inequality Theorem:</div>
                <div className="text-[#0058BE] font-semibold text-[12px]">P(QBER - E[QBER] ≥ t) ≤ exp(-2nt²)</div>
                <p className="text-[#75777D] text-[10.5px] mt-1">Guarantees that with confidence 1 - α, no eavesdropper (Eve) can alter quantum state correlations beyond threshold without detection.</p>
              </div>
              <div className="divide-y divide-[#E2E8F0] text-[11px]">
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Current QBER:</span><strong className="text-[#BA1A1A]">{activeQber.toFixed(2)}%</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Baseline Noise (Q_0):</span><strong className="text-[#091426]">2.00%</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Statistical Bound (t):</span><strong className="text-[#091426]">3.00%</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Security Threshold (Q_0 + t):</span><strong className="text-[#BA1A1A]">5.00%</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">False Alarm Bound (α):</span><strong className="text-[#091426]">{hoeffdingAlpha}</strong></div>
              </div>
              <button onClick={() => setShowHoeffdingModal(false)} className="w-full py-2 bg-[#0058BE] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] cursor-pointer">
                Close Analyzer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. CHSH BELL NON-LOCALITY ANALYZER MODAL (Ctrl+Click on CHSH Card) ─── */}
      {showChshModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  CHSH BELL NON-LOCALITY ANALYZER
                </span>
              </div>
              <button onClick={() => setShowChshModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[12px]">
              <div className="p-3 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] text-[11px] space-y-1">
                <div className="text-[#091426] font-bold">Clauser-Horne-Shimony-Holt (CHSH) Inequality:</div>
                <div className="text-[#0058BE] font-semibold text-[12px]">S = E(a,b) - E(a,b') + E(a',b) + E(a',b')</div>
                <p className="text-[#75777D] text-[10.5px] mt-1">S &gt; 2.0 confirms genuine non-local quantum entanglement. S &lt; 2.0 proves state collapse from eavesdropping (MitM/PNS).</p>
              </div>
              <div className="divide-y divide-[#E2E8F0] text-[11px]">
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Current Correlation (S):</span><strong className={selectedItem.chsh_score < 2.0 ? 'text-[#BA1A1A]' : 'text-[#065F46]'}>{selectedItem.chsh_score.toFixed(3)}</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Classical Local Realism Limit:</span><strong className="text-[#091426]">S ≤ 2.000</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Max Quantum Tsirelson Bound:</span><strong className="text-[#0058BE]">S = 2√2 ≈ 2.828</strong></div>
                <div className="py-2 flex justify-between"><span className="text-[#75777D]">Quantum Status:</span><strong className={selectedItem.chsh_score >= 2.0 ? 'text-[#065F46]' : 'text-[#BA1A1A]'}>{selectedItem.chsh_score >= 2.0 ? 'ENTANGLED (AUTHENTIC)' : 'COLLAPSED (EVE BREACH)'}</strong></div>
              </div>
              <button onClick={() => setShowChshModal(false)} className="w-full py-2 bg-[#0058BE] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] cursor-pointer">
                Close Analyzer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. HARDWARE DIAGNOSTICS MODAL ─── */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold text-[#091426] uppercase tracking-widest">
                  OPTOELECTRONIC HARDWARE DIAGNOSTICS
                </span>
              </div>
              <button onClick={() => setShowDiagnosticsModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[12px]">
              <div className="divide-y divide-[#E2E8F0]">
                {[
                  { label: 'SPDC Pumping Laser (Arbitrator)', value: 'λ = 775.2 nm / 120 mW' },
                  { label: 'Entangled Output Telecom Window', value: 'λ = 1550.12 nm (C-Band ITU Ch. 34)' },
                  { label: 'BBO Crystal Peltier Core Temp', value: '24.81 °C (Active PID Locked)' },
                  { label: 'SNSPD Detector Quantum Efficiency', value: '92.6% (QE @ 1550nm)' },
                  { label: 'Detector Dark Count Rate', value: '4.2 × 10⁻⁷ counts/pulse' },
                  { label: 'Dark Fiber Link Attenuation', value: '0.182 dB/km (Ultra Low Loss SMF-28)' },
                ].map(item => (
                  <div key={item.label} className="py-2 flex justify-between">
                    <span className="text-[#75777D]">{item.label}:</span>
                    <strong className="text-[#091426]">{item.value}</strong>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowDiagnosticsModal(false)} 
                className="w-full mt-2 py-2 bg-[#0058BE] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. LIVE CONSOLE LOGS DRAWER (MATCHES CLEAN SOC LIGHT THEME) ─── */}
      {showLogsDrawer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-0 animate-fade-in">
          <div className="bg-[#FFFFFF] text-[#1B1B1D] border-t border-[#E2E8F0] shadow-2xl w-full max-h-[380px] h-[380px] flex flex-col font-mono text-[11.5px]">
            {/* Header */}
            <div className="px-5 py-2.5 bg-[#F6F3F5] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0058BE]" />
                <span className="font-bold tracking-widest uppercase text-[11px] text-[#091426]">
                  FASTAPI DETERMINISTIC THREAT ENGINE CONSOLE STREAM
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCopy(telemetryStream.map(t => `[${t.timestamp}] [${t.subsystem}] ${t.event_type} (${t.latency_ms}ms) -> ${t.message}`).join('\n'), 'logs')}
                  className="text-[#75777D] hover:text-[#091426] flex items-center gap-1 text-[10px] uppercase tracking-wider cursor-pointer font-medium"
                >
                  {copiedText === 'logs' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'logs' ? 'Copied' : 'Copy All'}</span>
                </button>
                <button onClick={() => setShowLogsDrawer(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Log Stream Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-[11px] bg-[#FFFFFF] divide-y divide-[#F1F5F9]">
              <div className="text-[#0058BE] font-bold pb-1">[SYSTEM INIT] Quantum Digital Signature Sentinel core v1.0.0 online.</div>
              <div className="text-[#45474C] pb-1">[ARBITRATOR] SPDC source locked at 1550.12nm. Pair generation rate 1.2M/s.</div>
              {telemetryStream.map(t => (
                <div key={t.id} className={`pb-1 ${t.is_error ? 'text-[#BA1A1A] font-semibold bg-[#FEF2F2] px-1 py-0.5 rounded-[2px]' : 'text-[#1B1B1D]'}`}>
                  <span className="text-[#75777D]">[{t.timestamp}]</span> <span className="text-[#0058BE] font-bold">[{t.subsystem}]</span> {t.event_type}: {t.message}
                </div>
              ))}
              <div className="text-[#16A34A] font-bold pt-1">[CHSH TEST] Bell non-locality S-score = 2.76. State authenticated.</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. USER PROFILE POPOVER ─── */}
      {showUserProfilePopover && (
        <div className="absolute right-6 top-14 w-84 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] text-[#091426] flex items-center justify-center font-mono font-bold text-[12px]">
                VS
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-[#091426] font-sans">Dr. Vikramaditya S.</h3>
                <p className="font-mono text-[10px] text-[#75777D]">Lead Cryptographer &amp; SOC Lead</p>
              </div>
            </div>
            <button 
              onClick={() => setShowUserProfilePopover(false)}
              className="text-[#75777D] hover:text-[#1B1B1D] text-[12px] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Details Body */}
          <div className="p-4 space-y-3 font-mono text-[11px] text-[#1B1B1D] bg-[#FFFFFF]">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <span className="text-[#75777D]">Security Clearance:</span>
              <span className="font-bold text-[#065F46] bg-[#F6F3F5] border border-[#E2E8F0] px-2 py-0.5 rounded-[2px] text-[10px] uppercase tracking-wider">
                LEVEL 5 (Q-TOP-SECRET)
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <span className="text-[#75777D]">Problem Statement:</span>
              <span className="font-bold text-[#0058BE]">SIH 2026 / PS 26141</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[#75777D] text-[10px]">
                <span>Quantum Public Key Hash:</span>
                <button 
                  onClick={() => handleCopy('0x7F8E92BA1908C42B9A450893012EFB18', 'qpk')}
                  className="text-[#0058BE] hover:underline font-bold cursor-pointer flex items-center gap-1"
                >
                  {copiedText === 'qpk' ? <span>Copied</span> : <span>Copy Key</span>}
                </button>
              </div>
              <div className="p-2 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] text-[9.5px] font-mono break-all text-[#45474C] select-all">
                0x7F8E92BA1908C42B9A450893012EFB18
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] flex justify-between text-[10px] text-[#75777D]">
              <span>Organization:</span>
              <span className="text-[#091426] font-bold">Quantum Defense Systems (QDS)</span>
            </div>

            <button 
              onClick={(e) => { 
                setShowUserProfilePopover(false); 
                if (e.ctrlKey || e.metaKey) window.open('/home', '_blank');
                else onNavigateHome(); 
              }}
              className="w-full mt-2 py-1.5 border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-mono text-[11px] font-medium rounded-[2px] transition-colors cursor-pointer uppercase tracking-wider"
              title="Return to Central Gateway (Ctrl+Click to open in new tab)"
            >
              Return to Central Gateway
            </button>
          </div>
        </div>
      )}

      {/* ─── 9. DEPLOY COUNTERMEASURE SUITE MODAL ─── */}
      {showCountermeasureModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-[2px] bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  QUANTUM COUNTERMEASURE DISPATCH ENGINE
                </span>
              </div>
              <button 
                onClick={() => !isDeployingCountermeasure && setShowCountermeasureModal(false)} 
                className="text-[#75777D] hover:text-[#091426] cursor-pointer"
                disabled={isDeployingCountermeasure}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 font-mono text-[12px]">
              <p className="text-[#45474C] text-[11.5px] leading-relaxed font-sans">
                Select an optoelectronic countermeasure protocol to mitigate detected quantum channel anomalies and restore non-locality:
              </p>

              {/* Countermeasure Options */}
              <div className="space-y-2">
                {[
                  {
                    id: 'decoy',
                    title: 'DECOY-STATE RANDOMIZATION',
                    desc: 'Inject randomly modulated vacuum & weak decoy pulses (μ=0.6, ν₁=0.2, ν₂=0.0) to expose Photon Number Splitting (PNS).',
                    icon: <Zap className="w-4 h-4 text-[#0058BE]" />
                  },
                  {
                    id: 'phase',
                    title: 'PHASE-SHIFT PERTURBATION FILTER',
                    desc: 'Apply non-deterministic π/2 phase shifts on dark fiber links to break eavesdropper basis alignment.',
                    icon: <Activity className="w-4 h-4 text-[#16A34A]" />
                  },
                  {
                    id: 'quarantine',
                    title: 'ORIGIN NODE STRICT ISOLATION',
                    desc: 'Dynamically cut SDN routing to compromised origin nodes (192.168.1.104) and enforce zero-trust re-authentication.',
                    icon: <Lock className="w-4 h-4 text-[#BA1A1A]" />
                  },
                  {
                    id: 'reroute',
                    title: 'SDN OPTICAL CHANNEL REROUTING',
                    desc: 'Autonomous photonic channel handover to backup Dark Fiber Mesh #2 with verified low noise floor.',
                    icon: <Network className="w-4 h-4 text-[#0284C7]" />
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => !isDeployingCountermeasure && setSelectedCountermeasure(opt.id as any)}
                    className={`p-3 border rounded-[2px] cursor-pointer transition-all ${
                      selectedCountermeasure === opt.id
                        ? 'border-[#0058BE] bg-[#EBF3FF] ring-1 ring-[#0058BE]'
                        : 'border-[#E2E8F0] hover:bg-[#F6F3F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-bold text-[11.5px] text-[#091426]">
                        {opt.icon}
                        <span>{opt.title}</span>
                      </div>
                      {selectedCountermeasure === opt.id && (
                        <span className="text-[10px] font-bold text-[#0058BE] uppercase tracking-wider">
                          [SELECTED]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#75777D] mt-1 font-sans leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress Indicator */}
              {isDeployingCountermeasure && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10.5px] font-bold">
                    <span className="text-[#0058BE] animate-pulse">DEPLOYING PROTOCOL VIA ARBITRATOR SDN...</span>
                    <span>{deployProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0058BE] transition-all duration-300 rounded-full"
                      style={{ width: `${deployProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setShowCountermeasureModal(false)}
                  disabled={isDeployingCountermeasure}
                  className="flex-1 py-2 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeployCountermeasure}
                  disabled={isDeployingCountermeasure}
                  className="flex-2 py-2 bg-[#091426] hover:bg-[#1E293B] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeployingCountermeasure ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>EXECUTING PROTOCOL...</span>
                    </>
                  ) : (
                    <span>EXECUTE COUNTERMEASURE</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 10. SOC CONFIGURATION & THRESHOLDS SETTINGS MODAL ─── */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  SOC CONFIGURATION &amp; SECURITY BOUNDS
                </span>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 font-mono text-[12px]">
              <div className="space-y-3 divide-y divide-[#E2E8F0]">
                {/* Setting 1: QBER Threshold */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11.5px]">
                    <span className="text-[#091426] font-bold">QBER Alert Threshold (%):</span>
                    <strong className="text-[#BA1A1A] font-mono">{qberThresholdSetting.toFixed(1)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.5"
                    value={qberThresholdSetting}
                    onChange={(e) => setQberThresholdSetting(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-[#BA1A1A]"
                  />
                  <p className="text-[10px] text-[#75777D] font-sans">
                    Pulses exceeding this error rate immediately trigger red team alert and packet quarantine.
                  </p>
                </div>

                {/* Setting 2: Hoeffding Confidence */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex justify-between items-center text-[11.5px]">
                    <span className="text-[#091426] font-bold">Hoeffding False Alarm Bound (α):</span>
                    <span className="font-bold text-[#0058BE]">{hoeffdingAlpha}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[0.001, 0.01, 0.05].map(val => (
                      <button
                        key={val}
                        onClick={() => setHoeffdingAlpha(val)}
                        className={`py-1 rounded-[2px] border text-[11px] font-bold transition-colors cursor-pointer ${
                          hoeffdingAlpha === val
                            ? 'bg-[#0058BE] border-[#0058BE] text-white'
                            : 'bg-white border-[#E2E8F0] text-[#45474C] hover:bg-[#F6F3F5]'
                        }`}
                      >
                        α = {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Setting 3: Polling Telemetry Frequency */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex justify-between items-center text-[11.5px]">
                    <span className="text-[#091426] font-bold">Telemetry Sampling Rate:</span>
                    <span className="text-[#091426] font-bold">{pollInterval} ms</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[1000, 2500, 5000].map(interval => (
                      <button
                        key={interval}
                        onClick={() => setPollInterval(interval)}
                        className={`py-1 rounded-[2px] border text-[11px] font-bold transition-colors cursor-pointer ${
                          pollInterval === interval
                            ? 'bg-[#0058BE] border-[#0058BE] text-white'
                            : 'bg-white border-[#E2E8F0] text-[#45474C] hover:bg-[#F6F3F5]'
                        }`}
                      >
                        {interval / 1000}s ({interval === 1000 ? 'High' : interval === 2500 ? 'Normal' : 'Low'})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    showToast('SOC Security Configuration updated and synchronized with Arbitrator.');
                  }}
                  className="w-full py-2 bg-[#0058BE] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                >
                  Save &amp; Apply Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 11. QUANTUM SYSTEM DOCUMENTATION MODAL ─── */}
      {showDocumentationModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden font-sans">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  QDS SENTINEL ARCHITECTURE &amp; PROTOCOL GUIDE
                </span>
              </div>
              <button onClick={() => setShowDocumentationModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-[12.5px] font-sans text-[#1B1B1D] leading-relaxed">
              <div className="p-3 bg-[#F6F3F5] border border-[#E2E8F0] rounded-[2px] font-mono text-[11.5px]">
                <strong className="text-[#091426]">System Core:</strong> Quantum Digital Signature (QDS) Telemetry &amp; Intrusion Defense Platform
              </div>

              <div>
                <h3 className="font-bold text-[#091426] text-[14px] mb-1">1. Quantum Bit Error Rate (QBER) Bound</h3>
                <p className="text-[#45474C]">
                  Under the Bennett-Brassard 1984 (BB84) quantum key distribution framework, an eavesdropper measuring photons in random conjugate bases (Z and X) introduces a minimum theoretical error rate of 25%. A threshold cutoff of <strong>5.0%</strong> guarantees that zero mutual information is leaked to Eve beyond privacy amplification limits.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#091426] text-[14px] mb-1">2. Bell Non-Locality &amp; CHSH Inequality</h3>
                <p className="text-[#45474C]">
                  The CHSH Bell parameter S test evaluates non-classical entanglement correlation between photon pairs. An authentic quantum channel satisfies <strong>2.0 &lt; S ≤ 2√2 ≈ 2.828</strong>. If S collapses to <strong>S ≤ 2.0</strong>, the quantum state is provably intercepted.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#091426] text-[14px] mb-1">3. Automated Optoelectronic Countermeasures</h3>
                <ul className="list-disc list-inside space-y-1 text-[#45474C] mt-1">
                  <li><strong>Decoy States:</strong> Modulates multi-photon pulse statistics to neutralize Photon Number Splitting (PNS) attacks.</li>
                  <li><strong>Phase Shift Filters:</strong> Injects phase perturbations on fiber cables to break eavesdropper eavesdropping coherence.</li>
                  <li><strong>SDN Node Isolation:</strong> Instantly quarantines compromised node IP addresses to protect arbitrator key stores.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setShowDocumentationModal(false)}
                  className="w-full py-2 bg-[#0058BE] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                >
                  Close Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 12. CREATE / LOG INCIDENT MODAL ─── */}
      {showCreateIncidentModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  LOG SECURITY INCIDENT
                </span>
              </div>
              <button 
                onClick={() => setShowCreateIncidentModal(false)} 
                className="text-[#75777D] hover:text-[#091426] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNewIncident} className="p-5 space-y-3.5 font-mono text-[11.5px]">
              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Incident Title / Threat Classification
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laser Damage / Intercept-Resend"
                  value={newIncidentForm.title}
                  onChange={(e) => setNewIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                    Assigned Analyst
                  </label>
                  <select
                    value={newIncidentForm.assigned}
                    onChange={(e) => setNewIncidentForm(prev => ({ ...prev, assigned: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                  >
                    <option value="J. Doe (L2)">J. Doe (L2)</option>
                    <option value="A. Smith (L3)">A. Smith (L3)</option>
                    <option value="M. Chen (L1)">M. Chen (L1)</option>
                    <option value="SYSTEM AUTO">SYSTEM AUTO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                    Severity / Impact
                  </label>
                  <select
                    value={newIncidentForm.impact}
                    onChange={(e) => setNewIncidentForm(prev => ({ ...prev, impact: e.target.value as any }))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MED">MED</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Incident Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Statistical breach observed along dark fiber channel..."
                  value={newIncidentForm.description}
                  onChange={(e) => setNewIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Initial Detection Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Parity mismatch > 5.0% on fiber node 10.0.1.99"
                  value={newIncidentForm.initialDetail}
                  onChange={(e) => setNewIncidentForm(prev => ({ ...prev, initialDetail: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                />
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateIncidentModal(false)}
                  className="flex-1 py-2 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-[10.5px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#BA1A1A] hover:bg-[#991B1B] text-white font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-[10.5px]"
                >
                  LOG INCIDENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 13. PROVISION QUANTUM SESSION / CHANNEL MODAL ─── */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-[2px] bg-[#EBF3FF] border border-[#BFDBFE] flex items-center justify-center text-[#0058BE]">
                  <Network className="w-4 h-4" />
                </div>
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  PROVISION QUANTUM CHANNEL SESSION
                </span>
              </div>
              <button 
                onClick={() => setShowCreateSessionModal(false)} 
                className="text-[#75777D] hover:text-[#091426] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSessionChannel} className="p-5 space-y-4 font-mono text-[12px]">
              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Channel / Endpoint Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QNode-Gamma-04 or DarkFiber-Mesh-03"
                  value={newSessionForm.endpoint}
                  onChange={(e) => setNewSessionForm(prev => ({ ...prev, endpoint: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                    Initial Channel Status
                  </label>
                  <select
                    value={newSessionForm.status}
                    onChange={(e) => setNewSessionForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                  >
                    <option value="STABLE">● STABLE (Nominal)</option>
                    <option value="DEGRADED">● DEGRADED (Elevated Noise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                    Initial Key Rate (kbps)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="310.5"
                    value={newSessionForm.key_rate}
                    onChange={(e) => setNewSessionForm(prev => ({ ...prev, key_rate: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Fidelity Waveform Protocol
                </label>
                <select
                  value={newSessionForm.fidelity_type}
                  onChange={(e) => setNewSessionForm(prev => ({ ...prev, fidelity_type: e.target.value as any }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                >
                  <option value="sine_tick">Sine Wave + Tick (High Entangled State)</option>
                  <option value="wave_dot">Curved Wave + Dot (Polarization Drift Mode)</option>
                  <option value="step_dip">Step Pulse + Dip (Satellite Free-Space Link)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="flex-1 py-2 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-[10.5px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0058BE] hover:bg-[#00479E] text-white font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-[10.5px]"
                >
                  INITIATE SESSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 14. FLOATING ACTION TOAST NOTIFICATION ─── */}
      {actionToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#091426] text-white px-4 py-2.5 rounded-[2px] shadow-2xl z-50 flex items-center gap-2.5 font-mono text-[11px] animate-fade-in border border-[#334155]">
          <CheckCircle className="w-4 h-4 text-[#34D399] shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

    </div>
  );
};
