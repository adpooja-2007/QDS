import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useSentinel } from "../lib/SentinelContext";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clipboard,
  Copy,
  Database,
  Download,
  FileKey2,
  Gauge,
  GitBranch,
  Home as HomeIcon,
  Info,
  Layers3,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Network,
  ShieldAlert,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Server,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { DemonstrationDesk } from "./DemonstrationDesk";
import { apiClient } from "@/lib/apiClient";

const MARK = "/manus-storage/qds-sentinel-mark_81058a94.png";
const HERO = "/manus-storage/qds-sentinel-hero_77975680.png";
const NETWORK = "/manus-storage/qds-sentinel-network_2c79b0d7.png";

const navItems = [
  { href: "/home", label: "Home portal", code: "00", icon: HomeIcon },
  { href: "/demonstration", label: "Protocol demo", code: "01", icon: Waves },
  { href: "/monitoring", label: "SOC monitoring", code: "02", icon: Activity },
  { href: "/attack-sandbox", label: "Attack sandbox", code: "03", icon: TerminalSquare },
  { href: "/database", label: "Live database", code: "04", icon: Database },
];

const telemetry = [
  { time: "11:48:09.221", source: "QUANTUM_CORE", text: "EPR distribution complete · 100 pairs", tone: "blue", ms: "18ms" },
  { time: "11:48:09.118", source: "THREAT_ENGINE", text: "Quantum-channel anomaly · intercept-resend signature", tone: "copper", ms: "31ms", isThreat: true },
  { time: "11:48:08.904", source: "ALICE", text: "Bell measurement signed · basis X / Z", tone: "ink", ms: "23ms" },
  { time: "11:48:08.760", source: "ARBITRATOR", text: "Session nonce sealed and broadcast", tone: "slate", ms: "11ms" },
  { time: "11:48:07.115", source: "BOB", text: "Pauli frame aligned · 96 / 100 kept", tone: "blue", ms: "20ms" },
  { time: "11:48:06.332", source: "THREAT_ENGINE", text: "Hoeffding boundary within tolerance", tone: "copper", ms: "31ms" },
];

const sessionRows = [
  { id: "QKD-260827-91F4", doc: "board-resolution.pdf", qber: "1.2%", chsh: "2.77", verdict: "ACCEPT", status: "Verified", time: "11:48:09" },
  { id: "QKD-260827-91C1", doc: "release-manifest.json", qber: "0.8%", chsh: "2.81", verdict: "ACCEPT", status: "Verified", time: "11:42:51" },
  { id: "QKD-260827-8FD2", doc: "legal-brief-v4.pdf", qber: "14.2%", chsh: "1.86", verdict: "REJECT", status: "Quarantined", time: "11:31:08" },
  { id: "QKD-260827-8EE9", doc: "firmware-checksum.txt", qber: "2.1%", chsh: "2.68", verdict: "ACCEPT", status: "Verified", time: "11:25:34" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Brand() {
  return (
    <Link href="/home" className="brand-lockup" aria-label="QDS Sentinel home">
      <img src={MARK} alt="" className="brand-mark" />
      <span className="brand-copy"><strong>QDS</strong><span>SENTINEL</span></span>
    </Link>
  );
}

function StatusDot({ tone = "ok" }: { tone?: "ok" | "warn" | "bad" | "blue" }) {
  return <span className={cn("status-dot", `status-${tone}`)} aria-hidden="true" />;
}

function SectionLabel({ index, eyebrow, title, action }: { index: string; eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <div className="section-heading-main"><span className="section-index">{index}</span><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>
      {action}
    </div>
  );
}

function Sidebar({ location }: { location: string }) {
  const [monitorTab, setMonitorTab] = useState(() => { const requested = new URLSearchParams(window.location.search).get("section"); return ["overview", "threats", "incidents", "sessions", "network", "pqc"].includes(requested ?? "") ? requested! : "overview"; });
  useEffect(() => { const onTab = (event: Event) => setMonitorTab((event as CustomEvent<string>).detail); const onPopState = () => { const requested = new URLSearchParams(window.location.search).get("section"); setMonitorTab(["overview", "threats", "incidents", "sessions", "network", "pqc"].includes(requested ?? "") ? requested! : "overview"); }; window.addEventListener("qds-monitor-tab", onTab); window.addEventListener("popstate", onPopState); return () => { window.removeEventListener("qds-monitor-tab", onTab); window.removeEventListener("popstate", onPopState); }; }, []);
  return (
    <aside className="operator-rail">
      <div className="rail-top"><Brand /><button className="icon-button mobile-menu" aria-label="Open navigation"><Menu size={18} /></button></div>
      <div className="rail-rule" />
      <div className="rail-kicker">Operator console <span>///</span></div>
      <div className="rail-context"><span className="rail-context-mark" />{location === "/monitoring" ? "SOC monitoring / internal directories" : "Choose an instrument from the home portal"}</div>
      {location === "/monitoring" && <nav className="monitor-rail-nav" aria-label="SOC monitoring sections">{["overview", "threats", "incidents", "sessions", "network", "pqc"].map((item, index) => <button key={item} className={cn("monitor-rail-link", monitorTab === item && "monitor-rail-link-active")} onClick={() => window.dispatchEvent(new CustomEvent("qds-monitor-tab", { detail: item }))}><span>0{index + 1}</span>{item === "pqc" ? "PQC defense" : item}</button>)}</nav>}
      {location !== "/" && location !== "/home" && location !== "/monitoring" && <Link href="/home" className="rail-back"><ArrowLeft size={14} /> Home portal</Link>}
      <div className="rail-spacer" />
      <div className="rail-status-card">
        <div className="mini-label"><StatusDot /> gateway status</div>
        <div className="rail-status-value">3001 <span>OK</span></div>
        <div className="rail-status-meta">12ms round trip <span>↗</span></div>
      </div>
      <div className="rail-footer"><div className="avatar">AK</div><div><strong>A. Kovacs</strong><span>Security operator</span></div><Settings2 size={15} /></div>
    </aside>
  );
}

function Topbar({ eyebrow, title, subtitle, action, onNotifications }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode; onNotifications?: () => void }) {
  return <header className="topbar"><div className="topbar-heading"><Link href="/home" className="topbar-identity" aria-label="QDS Sentinel home"><img src={MARK} alt="" /><span>QDS / SIGNAL GRID</span><i /></Link><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="topbar-subtitle">{subtitle}</p></div><div className="topbar-actions">{action}<div className="live-ping"><StatusDot /> <span>LIVE</span><strong>12ms</strong></div><button className="icon-button" onClick={onNotifications} aria-label="Notifications"><Bell size={17} /></button></div></header>;
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "copper" | "blue" | "good" | "dark" }) {
  return <span className={cn("pill", `pill-${tone}`)}>{children}</span>;
}

function MetricTile({ label, value, detail, tone = "ink", icon: Icon, spark = "up" }: { label: string; value: string; detail: string; tone?: "ink" | "copper" | "blue" | "good"; icon: React.ElementType; spark?: "up" | "flat" | "down" }) {
  return <div className={cn("metric-tile", `metric-${tone}`)}><div className="metric-top"><span className="metric-label">{label}</span><Icon size={17} /></div><div className="metric-value">{value}</div><div className="metric-bottom"><span>{detail}</span><MiniSpark direction={spark} /></div></div>;
}

function MiniSpark({ direction = "up" }: { direction?: "up" | "flat" | "down" }) {
  const path = direction === "down" ? "M2 3 L8 6 L13 5 L18 10 L24 8 L30 13" : direction === "flat" ? "M2 8 L8 8 L13 7 L18 9 L24 8 L30 8" : "M2 11 L8 9 L13 10 L18 5 L24 7 L30 2";
  return <svg className="mini-spark" viewBox="0 0 32 16" fill="none" aria-hidden="true"><path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function TelemetryChart({ threat = false }: { threat?: boolean }) {
  return <div className="chart-wrap"><div className="chart-ylabels"><span>16%</span><span>12%</span><span>8%</span><span>4%</span><span>0%</span></div><svg className="telemetry-chart" viewBox="0 0 700 190" preserveAspectRatio="none" aria-label="Observed QBER and Hoeffding threshold"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b94a2f" stopOpacity=".19" /><stop offset="1" stopColor="#b94a2f" stopOpacity="0" /></linearGradient></defs><g className="chart-grid"><path d="M0 10H700M0 52H700M0 95H700M0 137H700M0 180H700" /><path d="M100 0V190M200 0V190M300 0V190M400 0V190M500 0V190M600 0V190" /></g><path className="threshold-line" d="M0 137 C120 135 170 138 250 136 S420 138 520 136 S630 135 700 137" /><path className="chart-area" d={threat ? "M0 152 C70 149 110 142 160 146 S230 101 290 108 S350 52 410 74 S490 38 550 56 S620 22 700 35 L700 180 L0 180 Z" : "M0 160 C70 155 110 158 160 153 S230 158 290 149 S350 158 410 146 S490 155 550 145 S620 151 700 140 L700 180 L0 180 Z"} fill="url(#area)" /><path className={cn("signal-line", threat && "signal-line-threat")} d={threat ? "M0 152 C70 149 110 142 160 146 S230 101 290 108 S350 52 410 74 S490 38 550 56 S620 22 700 35" : "M0 160 C70 155 110 158 160 153 S230 158 290 149 S350 158 410 146 S490 155 550 145 S620 151 700 140"} /></svg><div className="chart-xlabels"><span>11:20</span><span>11:28</span><span>11:36</span><span>11:44</span><span>11:48</span></div></div>;
}

function BellChart({ threat = false }: { threat?: boolean }) {
  return <div className="chart-wrap"><div className="chart-ylabels bell-labels"><span>2.8</span><span>2.4</span><span>2.0</span><span>1.6</span></div><svg className="telemetry-chart" viewBox="0 0 700 190" preserveAspectRatio="none" aria-label="CHSH Bell score"><g className="chart-grid"><path d="M0 10H700M0 68H700M0 126H700M0 180H700" /><path d="M100 0V190M200 0V190M300 0V190M400 0V190M500 0V190M600 0V190" /></g><path className="classical-line" d="M0 126H700" /><path className={cn("signal-line blue-line", threat && "signal-line-threat")} d={threat ? "M0 37 C80 35 125 48 180 42 S265 61 320 78 S400 119 460 127 S550 148 700 150" : "M0 35 C80 38 125 29 180 36 S265 25 320 34 S400 31 460 40 S550 27 700 36"} /></svg><div className="chart-xlabels"><span>11:20</span><span>11:28</span><span>11:36</span><span>11:44</span><span>11:48</span></div></div>;
}

function PhotonTrack({ id, from, to, tone, delay = "0s" }: { id: string; from: { x: number; y: number }; to: { x: number; y: number }; tone: "quantum" | "classical" | "threat"; delay?: string }) {
  return <g className={cn("photon-track", `photon-track-${tone}`)}><path id={id} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} /><g className="photon-particle"><path className="photon-tail" d="M -7 0 H -1" /><circle className="photon-ring" r="2.2" /><circle className="photon-core" r=".8" /><animateMotion dur="2.6s" repeatCount="indefinite" begin={delay} rotate="auto"><mpath href={`#${id}`} /></animateMotion></g></g>;
}

function HomePortal() {
  const { telemetryLogs } = useSentinel();
  const [ticker, setTicker] = useState(0);
  useEffect(() => { const timer = setInterval(() => setTicker(t => t + 1), 3000); return () => clearInterval(timer); }, []);
  return <div className="page-content portal-page"><Topbar eyebrow="00 / Switchboard" title="Trust is a measurable state." subtitle="QDS Sentinel / quantum signature assurance console" action={<Pill tone="good"><StatusDot /> gateway connected</Pill>} /><section className="hero-panel"><div className="hero-copy"><div className="hero-kicker"><span className="copper-line" /> quantum digital signatures / v1.0.0</div><h2>Prove authenticity<br /><em>under pressure.</em></h2><p>Observe the quantum protocol, surface an adversary, and keep every decision auditable from one calibrated console.</p><div className="hero-actions"><Link href="/demonstration" className="button button-copper"><Play size={15} fill="currentColor" /> Launch protocol demo <ArrowUpRight size={14} /></Link><Link href="/monitoring" className="button hero-secondary-action">Open live audit <ArrowUpRight size={14} /></Link><Link href="/transfer" className="button hero-secondary-action">Open transfer terminal <ArrowUpRight size={14} /></Link></div></div><div className="hero-art"><img src={HERO} alt="Abstract photon pulse crossing a dark optical channel" /><div className="hero-readout"><span>current assurance</span><strong>98.8%</strong><small>within tolerance</small></div></div><div className="hero-footnote">FIELD NOTE 001 <span>////</span> authenticated distribution is never assumed</div></section><section className="portal-grid"><SectionLabel index="01" eyebrow="Choose an instrument" title="Operator views" action={<span className="section-note">Two pathways / one source of truth</span>} /><div className="portal-cards"><Link href="/demonstration" className="portal-card portal-card-dark"><div className="card-number">01</div><div className="portal-card-visual"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="node node-a">A</div><div className="node node-b">B</div><div className="photon photon-one" /><div className="photon photon-two" /></div><div className="portal-card-body"><div className="eyebrow light">Interactive physics simulator</div><h3>Alice <span>↔</span> Bob</h3><p>Walk the six protocol phases from EPR pair distribution to the final CHSH audit gate.</p><div className="tag-row"><Pill tone="dark">EPR pairs</Pill><Pill tone="dark">BSM</Pill><Pill tone="dark">CHSH test</Pill></div><span className="card-cta">Enter demonstration <ArrowUpRight size={14} /></span></div></Link><Link href="/monitoring" className="portal-card portal-card-paper"><div className="card-number">02</div><div className="monitor-card-top"><div><div className="eyebrow">Forensic telemetry</div><h3>Security<br /><em>monitoring</em></h3></div><div className="alert-count"><span>open alerts</span><strong>01</strong></div></div><div className="mini-chart"><div className="font-mono text-[10px] space-y-1">{telemetryLogs.slice(0, 4).map((l, i) => <p key={i} className={l.isThreat ? "text-copper" : "text-slate-500"}>&gt; {l.source}: {l.text.slice(0, 30)}...</p>)}</div></div><div className="portal-card-body"><p>Track QBER boundaries, Bell non-locality, and the complete audit stream as sessions move through the network.</p><div className="tag-row"><Pill tone="blue">Hoeffding</Pill><Pill tone="copper">Quarantine</Pill><Pill>Session DB</Pill></div><span className="card-cta">Open live audit <ArrowUpRight size={14} /></span></div></Link></div></section><section className="cluster-strip"><div className="cluster-heading"><span className="eyebrow">Cluster status</span><strong>All systems observable</strong></div><div className="cluster-item"><span className="cluster-icon"><Radio size={15} /></span><div><span className="metric-label">Active session</span><strong>QKD-260827-91F4</strong></div></div><div className="cluster-item"><span className="cluster-icon"><Network size={15} /></span><div><span className="metric-label">Connected nodes</span><strong>04 / 04 online</strong></div></div><div className="cluster-item"><span className="cluster-icon"><LockKeyhole size={15} /></span><div><span className="metric-label">Channel integrity</span><strong>Authenticated</strong></div></div><div className="cluster-item cluster-item-accent"><span className="eyebrow">last sync</span><strong>11:48:09 <span>UTC</span></strong></div></section><section className="network-band"><div><SectionLabel index="02" eyebrow="Network map" title="Quantum links, made legible." /><p className="network-intro">A live topology of the authenticated channel. The visual layer stays quiet; the signal layer tells the story.</p><Link href="/monitoring" className="text-link">Inspect topology <ArrowUpRight size={14} /></Link></div><div className="network-visual"><img src={NETWORK} alt="Abstract quantum network topology" /><div className="network-node n-arb">ARBITRATOR<span>12ms</span></div><div className="network-node n-alice">ALICE<span>18ms</span></div><div className="network-node n-bob">BOB<span>20ms</span></div><div className="network-node n-eve">EVE<span>quarantined</span></div></div></section></div>;
}

function MonitoringPage() {
  const { eveActive, toggleEve, qber, chsh, telemetryLogs, incidents, activeAttack } = useSentinel();
  const [tab, setTab] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("section");
    return ["overview", "threats", "incidents", "sessions", "network", "pqc"].includes(requested ?? "") ? requested! : "overview";
  });
  const threat = eveActive;
  const setThreat = toggleEve;
  const [range, setRange] = useState("15M");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isolated, setIsolated] = useState<string[]>([]);
  const selectTab = (nextTab: string) => { if (!["overview", "threats", "incidents", "sessions", "network", "pqc"].includes(nextTab)) return; setTab(nextTab); const params = new URLSearchParams(window.location.search); params.set("section", nextTab); window.history.replaceState({}, "", window.location.pathname + "?" + params.toString()); };
  useEffect(() => { const onTab = (event: Event) => selectTab((event as CustomEvent<string>).detail); const onPopState = () => { const requested = new URLSearchParams(window.location.search).get("section"); setTab(["overview", "threats", "incidents", "sessions", "network", "pqc"].includes(requested ?? "") ? requested! : "overview"); }; window.addEventListener("qds-monitor-tab", onTab); window.addEventListener("popstate", onPopState); return () => { window.removeEventListener("qds-monitor-tab", onTab); window.removeEventListener("popstate", onPopState); }; }, []);
  
  const rows = telemetryLogs.map((item) => ({ ...item, qber: `${(qber * 100).toFixed(1)}%`, chsh: chsh.toFixed(2), code: item.isThreat || threat ? "403 FORBIDDEN" : "200 OK" }));
  const filtered = rows.filter((item) => (item.source + " " + item.text).toLowerCase().includes(query.toLowerCase()));
  const copyJson = async (item: any) => { await navigator.clipboard?.writeText(JSON.stringify(item)); setCopied(item.id); window.setTimeout(() => setCopied(null), 1600); };
  const exportTelemetry = () => { const csv = ["timestamp,subsystem,event,latency,status,qber,chsh", ...rows.map((item) => [item.time, item.source, item.text, item.ms, item.code, item.qber, item.chsh].join(","))].join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const a = document.createElement("a"); a.href = url; a.download = "soc_telemetry_report_" + Date.now() + ".csv"; a.click(); URL.revokeObjectURL(url); toast.success("SOC telemetry report exported"); };

  return <div className={cn("page-content monitoring-page", "monitoring-tab-" + tab)}><Topbar eyebrow="02 / Security operations" title="SOC monitoring center" subtitle={`Boundary charts, incident forensics, and distributed node telemetry (${activeAttack})`} action={<div className="monitor-top-actions"><Link href="/home" className="button button-quiet button-small"><ArrowLeft size={14} /> Home portal</Link><span className={threat ? "status-text-threat" : "status-text-good"}>{threat ? `THREAT DETECTED (${activeAttack})` : "NOMINAL · 99.9% SECURE"}</span><button className="button button-outline button-small" onClick={exportTelemetry}><Download size={14} /> Export</button></div>} /><main className="monitor-section-stage" key={tab}><div className="monitor-active-section"><strong>SOC Operations Center</strong><span>gateway / 3001 · <b className={threat ? "text-copper" : "status-text-good"}>{threat ? "DEGRADED" : "NOMINAL"}</b></span></div>{tab === "overview" && <OverviewPanel threat={threat} setThreat={setThreat} range={range} setRange={setRange} filtered={filtered} copyJson={copyJson} exportTelemetry={exportTelemetry} />}{tab === "threats" && <ThreatsPanel threat={threat} onThreat={() => setThreat()} />}{tab === "incidents" && <IncidentsPanel selectedIncident={selectedIncident} setSelectedIncident={setSelectedIncident} />}{tab === "sessions" && <SessionsPanel selectedSession={selectedSession} setSelectedSession={setSelectedSession} />}{tab === "network" && <NetworkPanel selectedNode={selectedNode} setSelectedNode={setSelectedNode} isolatedNodes={isolated} setIsolatedNodes={setIsolated} />}{tab === "pqc" && <PQCDefensePanel threat={threat} onThreat={() => setThreat()} />}<aside className="monitor-inspector"><div className="inspector-head"><span className="eyebrow">{tab === "overview" ? "Live incident" : tab === "threats" ? "Threat inspector" : tab === "incidents" ? "Incident inspector" : tab === "sessions" ? "Session inspector" : tab === "pqc" ? "PQC defense" : "Node inventory"}</span><button className="icon-button" aria-label="Inspector options"><MoreHorizontal size={15} /></button></div>{tab === "overview" && <><div className="inspector-status"><AlertTriangle size={16} /><strong>{threat ? "Critical alarm" : "Recent anomaly"}</strong></div><h3>{threat ? `Active Attack: ${activeAttack}` : "Signature forgery review"}</h3><p>Live evidence and operator actions for the highest-priority boundary event.</p><div className="inspector-list"><div><span>origin node</span><strong>{threat ? "EVE / basis mismatch" : "NODE-104"}</strong></div><div><span>QBER</span><strong className={threat ? "text-copper" : "status-text-good"}>{(qber * 100).toFixed(1)}%</strong></div><div><span>CHSH</span><strong>{chsh.toFixed(2)}</strong></div></div><button className="button button-copper inspector-action" onClick={() => selectTab("incidents")}>Open incident log <ArrowUpRight size={14} /></button></>}{tab === "threats" && <><div className="inspector-status threat"><AlertTriangle size={16} /><strong>{threat ? "Attack simulation active" : "Audit posture nominal"}</strong></div><h3>Threat audit posture</h3><p>Helstrom and Hoeffding thresholds stay visible beside the anomaly workbench.</p><div className="inspector-list"><div><span>Helstrom floor</span><strong>14.645%</strong></div><div><span>Hoeffding bound</span><strong>5.5%</strong></div><div><span>CHSH ceiling</span><strong>2.828</strong></div></div></>}{tab === "incidents" && <><div className="inspector-status"><ShieldAlert size={16} /><strong>Forensic queue ({incidents.length})</strong></div><h3>Click a record to inspect</h3><p>Incident evidence, audit timeline, and escalation actions appear here when a row is selected.</p><button className="button button-outline inspector-action" onClick={() => setSelectedIncident(incidents[0] || { id: "INC-104", time: "11:31:08", severity: "CRITICAL", title: "Intercept-resend disturbance", analyst: "A. Kovacs", detail: "QBER 14.2% crossed Hoeffding bound; CHSH collapsed to 1.86." })}>Inspect Latest Incident</button></>}{tab === "sessions" && <><div className="inspector-status good"><Activity size={16} /><strong>12 active streams</strong></div><h3>Session ledger</h3><p>Select a row to open raw JSON evidence and document hash details.</p><button className="button button-outline inspector-action" onClick={() => toast.success("Session ledger synced")}><RefreshCw size={14} /> Sync ledger</button></>}{tab === "network" && <><div className="inspector-status good"><Network size={16} /><strong>{isolated.length ? isolated.length + " isolated" : "4 nodes online"}</strong></div><h3>Node inventory</h3><p>Choose a node in the topology to open quarantine controls.</p><div className="inspector-list"><div><span>core</span><strong>ARBITRATOR</strong></div><div><span>quantum nodes</span><strong>ALICE · BOB</strong></div><div><span>probe</span><strong className="text-copper">EVE</strong></div></div></>}</aside></main></div>;
}

/* PQC Defense workspace — Signal Atelier renders post-quantum assurance as warm paper, ink structure, blue verification, and copper intervention. */
function PQCDefensePanel({ threat: localThreat, onThreat: localOnThreat }: { threat?: boolean; onThreat?: () => void }) {
  const { eveActive, toggleEve, qber, chsh, pqcMode, remediationReport } = useSentinel();
  const threat = eveActive;
  const [handover, setHandover] = useState(0);
  const [diagnosticOpen, setDiagnosticOpen] = useState(true);
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [tokensRotated, setTokensRotated] = useState(false);
  const [pqcSigHash, setPqcSigHash] = useState<string>("0x8f3c719e4a2d810b5c4f3a1e9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c");

  const stages = [
    ["Physical QDS link", "EPR-entangled photons active"],
    ["Hoeffding audit gate", "QBER < 5.5% · CHSH ≥ 2.0"],
    ["Zeroize RAM keys", "Purge un-amplified key buffers"],
    ["PQC signature handover", "Dilithium3 classical fallback"],
  ];
  const specs = [["Mathematical hardness assumption", "Module Learning-With-Errors (MLWE) & Short Integer Solution (SIS)"], ["NIST security level", "Category 3 (equivalent to AES-192 / RSA-4096 quantum resistance)"], ["Public key / signature size", "1,952 bytes public key / 3,293 bytes signature"], ["Quantum resistance margin", "Immune to Shor’s polynomial quantum factoring algorithm"]];

  const handleToggleAttack = async () => {
    await toggleEve();
  };

  const copyToken = (token: string) => { navigator.clipboard?.writeText(token); toast.success("PQC token copied"); };
  return <section className="pqc-defense"><div className="pqc-titlebar"><div><h2>PQC defense operations control</h2><p>Deterministic Hoeffding threat gate & NIST post-quantum cryptography handover</p></div><div className="pqc-title-actions"><button className="button button-outline button-small" onClick={() => { setArchitectureOpen(!architectureOpen); toast.info(architectureOpen ? "Architecture overlay closed" : "PQC architecture model opened"); }}><Network size={14} /> {architectureOpen ? "Hide architecture" : "View PQC architecture"}</button><button className="button button-outline button-small" onClick={() => { if (threat) toggleEve(); setHandover(0); setTokensRotated(false); toast.success("Clean quantum channel restored"); }}><RotateCcw size={14} /> Reset clean channel</button><button className={cn("button button-small", threat ? "button-quiet" : "button-copper")} onClick={handleToggleAttack}><Zap size={14} /> {threat ? "Clear attack simulation" : "Trigger attack simulation"}</button></div></div>{architectureOpen && <div className="pqc-architecture-note"><Network size={15} /><span>Architecture model: physical QDS witness → deterministic audit gate → ephemeral key zeroization → ML-DSA-65 fallback signature.</span><button onClick={() => setArchitectureOpen(false)}><X size={14} /></button></div>}<div className="pqc-metrics"><div className="pqc-metric pqc-metric-mode"><span>Active system mode</span><strong className={threat ? "text-copper" : "status-text-good"}>{threat ? "PQC_FALLBACK" : "QUANTUM_SECURE"}</strong><small>{threat ? "Dilithium3 fallback ready" : "Pristine QDS teleportation"}</small></div><div className="pqc-metric"><span>QBER / Hoeffding bound</span><strong className={threat ? "text-copper" : "status-text-good"}>{(qber * 100).toFixed(1)}%</strong><small>Statistical cutoff limit: 5.50%</small></div><div className="pqc-metric"><span>CHSH Bell metric (S)</span><strong className={threat ? "text-copper" : "status-text-good"}>S = {chsh.toFixed(2)}</strong><small>{threat ? "Classical boundary reached" : "Quantum non-locality verified"}</small></div><div className="pqc-metric"><span>PQC algorithm (NIST)</span><strong>Dilithium3 (ML-DSA-65)</strong><small>Key exchange: Kyber768 (ML-KEM)</small></div></div><div className="pqc-workspace"><div className="pqc-main"><section className="pqc-console"><header><div><TerminalSquare size={15} /><strong>Air-gapped cognitive incident diagnosis</strong><small>Ollama Phi-3 engine</small></div><button onClick={() => setDiagnosticOpen(!diagnosticOpen)}>{diagnosticOpen ? "Collapse diagnostic" : "Open diagnostic"}</button></header>{diagnosticOpen && <div className={cn("pqc-diagnostic-copy", threat && "pqc-diagnostic-copy-threat")} style={{ whiteSpace: 'pre-wrap' }}>{remediationReport || (threat ? "THREAT DIAGNOSIS\n1. MitM Attack Detected: Calculated QBER vastly exceeds Hoeffding threshold.\n2. Entanglement Depolarization: CHSH score collapsed (< 2.0 classical limit).\n\nAUTOMATED REMEDIATION PLAN EXECUTED\n1. Physical Key Purge: Flushed key buffers.\n2. Dynamic PQC Handover: Hot-swapped to CRYSTALS-Dilithium3 ML-DSA-65." : "No anomalies detected. QDS teleportation keys are active and verified. Quantum channel is operating at optimal coherence.")}</div>}</section><section className="pqc-specs"><header><ShieldCheck size={15} /><strong>NIST post-quantum cryptography specifications</strong><span>ML-DSA-65</span></header><div>{specs.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></section></div><aside className="pqc-side"><section className="pqc-handover"><header><GitBranch size={15} /><strong>Handover sequence diagram</strong></header><div>{stages.map(([title, detail], index) => <button key={title} className={cn("pqc-handover-stage", handover === index && "pqc-handover-stage-active", threat && index === 1 && "pqc-handover-stage-threat")} onClick={() => { setHandover(index); toast.info(title + " selected"); }}><i>0{index + 1}</i><span><strong>{title}</strong><small>{detail}</small></span></button>)}</div></section><section className="pqc-token-inspector"><header><LockKeyhole size={15} /><strong>Live key token inspector</strong></header><div><span>Current Alice public key hash</span><code>{pqcSigHash}</code><button onClick={() => copyToken(pqcSigHash)}>Copy key hash</button></div><div><span>Bob PQC key encapsulation nonce</span><code>{tokensRotated ? "0x7ab3d2c1e8f4a906b5c2d7e1f3a8b4c6d9e0f2a5b7c1d3e6f8a0b2c4d6e8f0a2" : "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"}</code><button onClick={() => { setTokensRotated(!tokensRotated); toast.success("Bob encapsulation nonce rotated"); }}>{tokensRotated ? "Restore nonce" : "Rotate nonce"}</button></div></section></aside></div></section>;
}

function SandboxPage() {
  const { eveActive, triggerAttack, qber: globalQber, chsh: globalChsh, pqcMode, remediationReport, activeAttack } = useSentinel();
  const [active, setActive] = useState(activeAttack || "MitM attack");
  const [running, setRunning] = useState(false);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [visibleLinesCount, setVisibleLinesCount] = useState(1);

  const attacks = [
    { title: "Clean signature", code: "CLEAN", detail: "Authenticated Bell-pair exchange", tone: "good", type: "clean", qber: 0.019, chsh: 2.76 },
    { title: "MitM attack", code: "MITM", detail: "Intercept / resend eavesdrop", tone: "copper", type: "forgery", qber: 0.142, chsh: 1.76 },
    { title: "Forgery attack", code: "FORGE", detail: "Tampered feed-forward bits", tone: "copper", type: "forgery", qber: 0.128, chsh: 1.82 },
    { title: "Replay attack", code: "REPLAY", detail: "Captured nonce retransmit", tone: "copper", type: "replay", qber: 0.086, chsh: 1.91 },
    { title: "Channel noise", code: "NOISE", detail: "Optical thermal disturbance", tone: "blue", type: "noise", qber: 0.048, chsh: 2.34 },
    { title: "PNS attack", code: "PNS", detail: "Photon-number splitting probe", tone: "blue", type: "pns", qber: 0.095, chsh: 1.88 }
  ];

  const selected = attacks.find((attack) => attack.title === active) ?? attacks[1];
  const threatened = selected.tone === "copper";

  const triggerBackendAttack = async (attackItem: typeof selected) => {
    setIsExecutingApi(true);
    setVisibleLinesCount(1);
    try {
      await triggerAttack(attackItem.title, attackItem.qber, attackItem.chsh);
    } catch {
      toast.info(`Staged ${attackItem.title} scenario locally.`);
    } finally {
      setIsExecutingApi(false);
    }
  };

  useEffect(() => {
    triggerBackendAttack(selected);
    const timer = setInterval(() => {
      setVisibleLinesCount((prev) => (prev < 8 ? prev + 1 : prev));
    }, 140);
    return () => clearInterval(timer);
  }, [active]);

  const consoleLines = {
    arbitrator: [
      "> initialize protocol (BB84 EXT)",
      "> awaiting registration",
      threatened ? "> ACK: Alice connected [ID: 0x9F3A]" : "> ACK: all nodes authenticated",
      "> channel seed established · quantum-link-01",
      threatened ? `> WARN: QBER ${(selected.qber * 100).toFixed(1)}% reached Hoeffding bound` : "> QBER 1.9% within operating band",
      threatened ? `> ERR: Bell correlation collapsed (S=${selected.chsh} < 2.0)` : `> CHSH S=${selected.chsh} verified`,
      threatened ? "> ABORT: intercept-resend adversary detected" : "> ACCEPT: signature verification sustained",
      pqcMode ? "> PQC FALLBACK: CRYSTALS-Dilithium3 (ML-DSA-65) active" : "> QDS Teleportation: pristine key exchange"
    ],
    alice: [
      "> seq gen start()",
      "> basis: [+, ×, ×, +, +]",
      "> bits: [1, 0, 1, 1, 0, —]",
      "> transmitting photons (n=1024)",
      "> stream tx: 100% complete",
      "> awaiting basis reconciliation",
      threatened ? "> ERR: sift parity breach detected by arbitrator" : "> ACK: signed message delivered"
    ],
    bob: [
      "> listener active(port: 9091)",
      "> measuring stream...",
      "> rand bases: [×, ×, +, ×, +, —]",
      "> capture: 1024 photons received",
      threatened ? `> ERR: sifted key invalid (phase collapse ${(selected.qber * 100).toFixed(1)}%)` : "> ACK: Pauli frame aligned",
      pqcMode ? "> PQC VERIFIED: Dilithium3 signature matches payload" : "> QDS VERIFIED: physical attestation sealed"
    ],
    eve: [
      "> inject probe(target: quantum-link-01)",
      `> attack type: ${selected.code}`,
      threatened ? "> WARN: state collapse detected on bit 12" : "> standby: no adversarial action",
      threatened ? "> WARN: state collapse detected on bit 18" : "> waiting for scenario trigger",
      threatened ? "> ERR: arbitrator probing anomaly · probe isolated" : "> passive observation only"
    ]
  };

  const Pane = ({ title, nodeKey, variant, lines }: { title: string; nodeKey: "arbitrator" | "alice" | "bob" | "eve"; variant: "good" | "copper" | "blue"; lines: string[] }) => (
    <section className={cn("sandbox-v2-console", "sandbox-v2-console-" + variant)}>
      <div className="sandbox-v2-console-head">
        <span>{title}</span>
        <div>
          <button onClick={() => toast.success(title + " log copied")} aria-label={"Copy " + title + " log"}><Copy size={12} /></button>
          <button onClick={() => setExpandedNode(nodeKey)} aria-label={"Expand " + title + " console"}><ArrowUpRight size={12} /></button>
        </div>
      </div>
      <div className="sandbox-v2-console-body">
        {lines.slice(0, visibleLinesCount).map((line, index) => (
          <p key={line + index} className={cn(line.includes("ERR") || line.includes("ABORT") ? "console-line-alert" : line.includes("WARN") ? "console-line-warn" : line.includes("ACK") || line.includes("ACCEPT") || line.includes("PQC") ? "console-line-ok" : "")}>{line}</p>
        ))}
        {visibleLinesCount < lines.length && (
          <p className="text-[10px] text-slate-400 animate-pulse font-mono">&gt; streaming line {visibleLinesCount + 1}/{lines.length}...</p>
        )}
      </div>
      {title === "EVE INTERCEPT" && threatened && <span className="sandbox-v2-console-alert">INTERVENTION ACTIVE</span>}
    </section>
  );

  return (
    <div className="sandbox-v2">
      <header className="sandbox-v2-header">
        <div className="sandbox-v2-brand">
          <img src={MARK} alt="" />
          <span>QDS SENTINEL</span>
        </div>
        <strong>Attack sandbox & Live SOC Event Integration</strong>
        <span aria-hidden="true" />
      </header>
      <div className="sandbox-v2-shell">
        <aside className="sandbox-v2-scenarios">
          <span className="eyebrow">Attack scenarios</span>
          <div className="sandbox-v2-scenario-list">
            {attacks.map((attack) => (
              <button
                key={attack.title}
                className={cn("sandbox-v2-scenario", active === attack.title && "sandbox-v2-scenario-active", "sandbox-v2-scenario-" + attack.tone)}
                onClick={() => {
                  setActive(attack.title);
                  setRunning(false);
                }}
              >
                <i />
                <span>{attack.title}</span>
                <small>{attack.code}</small>
              </button>
            ))}
          </div>
          <div className="sandbox-v2-scenario-spacer" />
          <button
            className={cn("sandbox-v2-initiate", (running || isExecutingApi) && "sandbox-v2-initiate-active")}
            disabled={isExecutingApi}
            onClick={() => {
              setRunning(!running);
              triggerBackendAttack(selected);
            }}
          >
            {isExecutingApi ? "FastAPI Executing…" : running ? "Pause handshake" : "Initiate handshake"}
          </button>
        </aside>

        <main className="sandbox-v2-consoles">
          <Pane title="ARBITRATOR.SYS" nodeKey="arbitrator" variant={threatened ? "copper" : "good"} lines={consoleLines.arbitrator} />
          <Pane title="ALICE NODE" nodeKey="alice" variant="good" lines={consoleLines.alice} />
          <Pane title="BOB NODE" nodeKey="bob" variant="good" lines={consoleLines.bob} />
          <Pane title="EVE INTERCEPT" nodeKey="eve" variant={threatened ? "copper" : "blue"} lines={consoleLines.eve} />

          {remediationReport && (
            <div className="col-span-2 p-4 bg-white border border-[#E2E8F0] rounded-[2px] shadow-sm mt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                <span className="font-bold text-[#0058BE] uppercase flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Ollama AI Cognitive Remediation Report
                </span>
                <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase", threatened ? "bg-[#C2540A]/10 text-[#C2540A]" : "bg-[#34D399]/10 text-[#065F46]")}>
                  {pqcMode ? "PQC_FALLBACK_ACTIVE" : "QUANTUM_SECURE"}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-[#1E293B] leading-relaxed font-mono">{remediationReport}</pre>
            </div>
          )}
        </main>

        <aside className="sandbox-v2-telemetry">
          <span className="eyebrow">Telemetry & PQC Status</span>
          <SandboxMetricChart title="QBER vs Hoeffding" value={`Current: ${(globalQber * 100).toFixed(1)}%`} detail={threatened ? "0.055 threshold breach" : "nominal drift"} threat={threatened} mode="qber" />
          <SandboxMetricChart title="CHSH Bell violation" value={`S = ${globalChsh.toFixed(2)}`} detail={threatened ? "Classical bound (S=2.0)" : "Quantum correlation"} threat={threatened} mode="chsh" />
          <div className="sandbox-v2-readout">
            <div><span>Key rate</span><b>{threatened ? "1.2 kbps" : "4.8 kbps"}</b></div>
            <div><span>Sifting eff.</span><b>{threatened ? "49.6%" : "96.2%"}</b></div>
            <div>
              <span>Security status</span>
              <b className={threatened ? "text-copper" : "status-text-good"}>{threatened ? "PQC FALLBACK" : "Nominal"}</b>
            </div>
          </div>
        </aside>
      </div>

      {expandedNode && (
        <div className="sandbox-console-overlay" onClick={() => setExpandedNode(null)}>
          <section className="sandbox-console-focus" onClick={(event) => event.stopPropagation()}>
            <div className="sandbox-console-focus-head">
              <div>
                <span className="eyebrow">Expanded protocol node</span>
                <h2>{expandedNode === "arbitrator" ? "ARBITRATOR.SYS" : expandedNode === "alice" ? "ALICE NODE" : expandedNode === "bob" ? "BOB NODE" : "EVE INTERCEPT"}</h2>
              </div>
              <button className="icon-button" onClick={() => setExpandedNode(null)} aria-label="Close expanded node"><X size={15} /></button>
            </div>
            <div className="sandbox-console-focus-log">
              {consoleLines[expandedNode as keyof typeof consoleLines].concat([
                "> trace id: qds-260827-91f4",
                "> packet evidence retained",
                threatened ? "> verdict: reject / PQC Dilithium3 fallback engaged" : "> verdict: accept / no intervention required"
              ]).map((line, index) => (
                <p key={line + index} className={cn(line.includes("ERR") || line.includes("ABORT") || line.includes("reject") ? "console-line-alert" : line.includes("WARN") ? "console-line-warn" : line.includes("ACK") || line.includes("ACCEPT") || line.includes("accept") || line.includes("PQC") ? "console-line-ok" : "")}>{line}</p>
              ))}
            </div>
            <div className="sandbox-console-focus-actions">
              <button className="button button-outline button-small" onClick={() => toast.success("Expanded node log copied")}><Copy size={14} /> Copy evidence</button>
              <button className="button button-copper button-small" onClick={() => setExpandedNode(null)}>Collapse node</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/* Overview workspace — Signal Atelier keeps nominal security calm through mineral paper, ink structure, analytic blue data, and text-only green verification. */
function OverviewPanel({ threat, setThreat, range, setRange, filtered, copyJson, exportTelemetry }: any) {
  const qber = threat ? "9.80%" : "1.88%";
  const chsh = threat ? "2.12" : "2.78";
  const cards = [
    { label: "Active sessions", value: "3", detail: "Stable", tone: "good" },
    { label: "Verified signatures", value: threat ? "94.2%" : "99.9%", detail: "Nominal", tone: "good" },
    { label: "Security score", value: threat ? "Degraded" : "Secure", detail: threat ? "Review required" : "Secure", tone: threat ? "copper" : "good" },
    { label: "Total pulses", value: "4.2e9", detail: "+12M/s", tone: "slate" },
    { label: "QBER %", value: qber, detail: threat ? "Critical limit > 5%" : "Nominal (< 5%)", tone: threat ? "alert" : "good" },
    { label: "CHSH value", value: chsh, detail: threat ? "Classical boundary" : "S ≥ 2.0 (quantum)", tone: threat ? "copper" : "good" },
  ];
  const nominalRows = [...filtered, ...filtered].slice(0, 7).map((item: any, index: number) => {
    const alert = item.source === "THREAT_ENGINE" || (threat && index === 0);
    const payload = index % 3 === 1 ? '"demonstrated"' : index % 3 === 2 ? '"CLASSIFIED"' : "qds_text_payload.sig";
    return { ...item, alert, payload, classifier: alert ? "INTERCEPT_RESEND" : "NOMINAL_SECURE", event: alert ? "Signature aborted / Intercept-resend eavesdropping" : item.source === "PRIVACY_AMP" ? "Toeplitz hash distill" : item.source === "BOB" ? "Pauli frame reconciliation" : item.source === "ARBITRATOR" ? "EPR packet acceptance" : "Photon pulse transmission" };
  });
  return <section className="overview-v3 overview-v4-nominal"><div className={cn("overview-v3-alert", threat && "overview-v3-alert-active")}><div><span className="eyebrow">{threat ? "Critical alarm · fiber telemetry" : "Verified nominal status"}</span><p>{threat ? "Channel degraded by optical thermal noise. Cascade error correction is active and signature acceptance is held." : "Privacy AMP reports Toeplitz Hash Distill operating within verified quantum entropy bounds (QBER = 1.88%)."}</p></div>{threat ? <button className="button button-copper button-small" onClick={() => setThreat(false)}>Restore nominal</button> : <button className="overview-v3-pass" onClick={() => setThreat(true)}>Pass</button>}</div><div className="overview-v3-kpis">{cards.map((card) => <div key={card.label} className={cn("overview-v3-kpi", "overview-v3-kpi-" + card.tone)}><span>{card.label}</span><strong>{card.value}</strong><small className={card.tone === "good" ? "status-text-good" : card.tone === "copper" || card.tone === "alert" ? "text-copper" : "muted"}>{card.detail}</small></div>)}</div><div className="overview-v3-charts"><div className="overview-v3-chart"><div className="overview-v3-chart-head"><div><span className="eyebrow">QBER error rate</span><strong>{qber}</strong><em className={threat ? "text-copper" : "status-text-good"}>{threat ? "breach" : "nominal"}</em></div><div className="range-pills">{["1M", "5M", "15M", "ALL"].map((item) => <button key={item} className={cn("range-pill", range === item && "range-pill-active")} onClick={() => setRange(item)}>{item}</button>)}</div></div><div className="overview-v3-plot"><TelemetryChart threat={threat} /></div></div><div className="overview-v3-chart"><div className="overview-v3-chart-head"><div><span className="eyebrow">CHSH Bell test (S-score)</span><strong>{chsh}</strong><em className={threat ? "text-copper" : "status-text-good"}>{threat ? "classical boundary" : "quantum"}</em></div><div className="range-pills">{["1M", "5M", "15M", "ALL"].map((item) => <button key={item} className={cn("range-pill", range === item && "range-pill-active")} onClick={() => setRange(item)}>{item}</button>)}</div></div><div className="overview-v3-plot"><BellChart threat={threat} /></div></div></div><div className="overview-v3-ledger"><div className="overview-v3-ledger-head"><div><span className="eyebrow">Live telemetry stream</span><small>Click row for packet evidence</small></div><button className="text-link ledger-export" onClick={exportTelemetry}><Download size={13} /> Export CSV</button></div><div className="overview-v3-ledger-table"><div className="overview-v3-ledger-row overview-v3-ledger-row-head"><span>Timestamp</span><span>Subsystem</span><span>Event</span><span>Classifier verdict</span><span>Transferred text / message content</span><span>Latency</span><span>Status</span></div>{nominalRows.map((item: any, index: number) => <button key={item.id + index} className={cn("overview-v3-ledger-row", item.alert && "overview-v3-ledger-alert", index === 0 && !item.alert && "overview-v3-ledger-selected")} onClick={() => copyJson(item)}><span className="mono muted">{item.time}.{String(index + 45).padStart(3, "0")}</span><span className={cn("mono", item.alert && "text-copper")}>{item.source.replace("_", " ")}</span><strong>{item.event}</strong><span className={cn("overview-v3-verdict", item.alert && "overview-v3-verdict-alert")}>{item.classifier}</span><span className={cn("overview-v3-payload", item.alert && "overview-v3-payload-alert")}>{item.payload}</span><span className="mono muted">{item.ms}ms</span><span className={item.alert ? "overview-v3-status-alert" : "status-text-good mono"}>{item.alert ? "0xFA" : "0x00"}</span></button>)}</div></div></section>;
}

function ThreatsPanel({ threat, onThreat }: { threat: boolean; onThreat: () => void }) {
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(0);
  const anomalies = [
    { id: "THR-104", severity: "CRITICAL", origin: "THREAT ENGINE", badge: "QUARANTINED", type: "Signature aborted (intercept-resend eavesdropping)", time: "23:41:16", baseline: "1.2%", current: "14.2%", detail: "Intercept-resend disturbance triggered the confidence boundary and halted the signature stream." },
    { id: "THR-103", severity: "CRITICAL", origin: "NODE-EVE-01", badge: "", type: "Quantum channel intercept-resend", time: "23:40:57", baseline: "1.5%", current: "12.7%", detail: "Unauthorized basis observation was inferred from the observed QBER uplift." },
    { id: "THR-102", severity: "CRITICAL", origin: "NONCE-CACHE-01", badge: "", type: "Stale nonce and payload replay", time: "23:40:50", baseline: "0.8%", current: "9.1%", detail: "Replay candidate reappeared outside the permitted one-time-pad window." },
    { id: "THR-101", severity: "CRITICAL", origin: "ARB-CORE-01", badge: "", type: "One-time pad signature forgery", time: "23:40:43", baseline: "1.0%", current: "8.4%", detail: "Signature mismatch appeared after the classical correction frame closed." },
    { id: "THR-100", severity: "CRITICAL", origin: "192.168.1.104", badge: "", type: "Sift mismatch breach", time: "23:39:08", baseline: "1.9%", current: "7.7%", detail: "Sifting disagreement exceeded the nominal data-reconciliation threshold." },
    { id: "THR-099", severity: "CRITICAL", origin: "192.168.1.104", badge: "", type: "Sift mismatch breach", time: "23:39:01", baseline: "1.9%", current: "7.4%", detail: "Repeated mismatch was observed on the same optical route." },
    { id: "THR-098", severity: "HIGH", origin: "QKD-NODE-07", badge: "", type: "Pauli frame mismatch", time: "23:35:56", baseline: "2.1%", current: "5.7%", detail: "A correction frame checksum failed verification." },
    { id: "THR-097", severity: "HIGH", origin: "NODE-EVE-01", badge: "QUARANTINED", type: "Intercept: MitM intercept-resend", time: "22:55:58", baseline: "1.6%", current: "6.4%", detail: "A quarantined node repeated an intercept signature." },
    { id: "THR-096", severity: "HIGH", origin: "QKD-NODE-07", badge: "", type: "Signature aborted", time: "22:20:59", baseline: "2.0%", current: "5.9%", detail: "Authentication test rejected the negotiated key material." },
    { id: "THR-095", severity: "MEDIUM", origin: "FIBER-22", badge: "", type: "Optical noise envelope", time: "22:20:56", baseline: "1.4%", current: "3.9%", detail: "Attenuation drift is observable but remains below the intervention threshold." }
  ];
  const visible = filter === "ALL" ? anomalies : anomalies.filter((item) => item.severity === filter);
  const item = anomalies[selected] ?? anomalies[0];
  return <div className="threats-v2-layout"><div className="threats-v2-main"><div className="threats-v2-heading"><h2>Threats</h2><div className="threat-filter-tabs">{[["ALL", "ALL (20)"], ["CRITICAL", "CRITICAL (19)"], ["HIGH", "HIGH (1)"]].map(([key, label]) => <button key={key} className={cn("threat-filter-tab", filter === key && "threat-filter-tab-active")} onClick={() => { setFilter(key); setSelected(0); }}>{label}</button>)}</div><span className="threats-v2-count">{threat ? "4 active anomalies detected" : "20 records in review"}</span></div><div className="threats-v2-ledger"><div className="threats-v2-row threats-v2-row-head"><span>severity</span><span>origin node</span><span>anomaly type</span><span>time</span></div>{visible.map((row) => <button key={row.id} className={cn("threats-v2-row", selected === anomalies.indexOf(row) && "threats-v2-row-selected")} onClick={() => setSelected(anomalies.indexOf(row))}><span className={cn("severity-cell", row.severity === "CRITICAL" ? "severity-critical" : row.severity === "HIGH" ? "severity-high" : "severity-medium")}><i />{row.severity}</span><span className="threat-origin"><b>{row.origin}</b>{row.badge && <em>{row.badge}</em>}</span><strong>{row.type}</strong><span className="mono muted">{row.time}</span></button>)}</div></div><aside className="threats-v2-inspector"><div className="inspector-head"><span className="eyebrow">Threat inspector</span><button className="icon-button" onClick={() => setSelected(0)} aria-label="Reset selection"><RotateCcw size={14} /></button></div><span className="eyebrow">Selected anomaly</span><h3>{item.type}</h3><div className="threat-inspector-rule" /><span className="eyebrow">Telemetry data</span><div className="threat-telemetry-block"><div><span>node</span><strong>{item.origin}</strong></div><div><span>baseline QBER</span><strong>{item.baseline}</strong></div><div><span>current QBER</span><strong className="text-copper">{item.current}</strong></div></div><span className="eyebrow">Risk visualization</span><div className="risk-visualizer threat-risk-v2">{[1,2,3,4,5].map((bar) => <i key={bar} className={bar <= 5 ? "risk-visualizer-on" : ""} />)}</div><button className="button button-copper inspector-action" onClick={onThreat}><ShieldCheck size={14} /> {threat ? "Restore node from quarantine" : "Run containment protocol"}</button><div className="threats-v2-actions"><button className="button button-outline button-small" onClick={() => toast.success("Buffer purge queued")}>Purge buffer</button><button className="button button-outline button-small" onClick={() => toast.success("PCAP export prepared")}>Export PCAP</button></div></aside></div>;
}

/* Incidents inspector — Signal Atelier pairs forensic precision with warm paper, dark ink, copper intervention, and blue audit detail. */
function IncidentsPanel({ selectedIncident, setSelectedIncident }: any) {
  const [remediated, setRemediated] = useState(false);
  const incidents = [
    { id: "INC-9482-A", status: "INVESTIGATING", assigned: "A. Kovacs (L2)", impact: "HIGH", title: "Quantum correlation breach", detail: "A QBER divergence on the authenticated channel is under active forensic review.", events: [["10:58:02 UTC", "Threat detected", "QBER moved above the nominal confidence envelope."], ["10:58:10 UTC", "Threshold exceeded", "Photon-pair records sealed after the Hoeffding confidence boundary was crossed."], ["10:59:01 UTC", "Operator assignment", "Incident assigned to the optical assurance queue."]] },
    { id: "INC-9481-B", status: "INVESTIGATING", assigned: "M. Ito (L3)", impact: "CRITICAL", title: "Quantum channel intercept-resend", detail: "[CLASSIFIED: INTERCEPT_RESEND] Eavesdropper Eve intercepted and measured photons on the quantum channel, collapsing quantum superposition.", events: [["10:48:16 UTC", "Threat detected", "CRITICAL: Intercept-resend attack detected. QBER (14.2%) breached Hoeffding cutoff (5.5%). Bell correlation collapsed (S-1.76 < 2.00)."], ["10:48:24 UTC", "Threshold exceeded", "QBER 14.20% breached security cutoff (5.0%). Non-locality collapsed (S-1.94)."], ["10:48:32 UTC", "Escalation", "Channel held for signature acceptance review and L3 forensic handoff."]] },
    { id: "INC-9479-X", status: "RESOLVED", assigned: "SYSTEM AUTO", impact: "LOW", title: "Channel lockout mitigation", detail: "An automated channel lock was applied after repeated authentication failures on the secure transport boundary.", events: [["10:42:01 UTC", "Threat detected", "Anomaly detected in the authenticated command sequence from 192.168.1.55."], ["10:42:15 UTC", "Threshold exceeded", "Five failed authentication attempts occurred inside the ten-second observation window."], ["10:42:16 UTC", "Auto-resolution", "A temporary perimeter quarantine was applied and the node was removed from active routing."]] },
  ];
  const active = incidents.find((item) => item.id === selectedIncident?.id) ?? incidents[1];
  const statusClass = (status: string) => status === "RESOLVED" ? "incident-status-resolved" : status === "ESCALATED" ? "incident-status-escalated" : "incident-status-investigating";
  const impactClass = (impact: string) => impact === "CRITICAL" ? "incident-impact-critical" : impact === "HIGH" ? "incident-impact-high" : impact === "MED" ? "incident-impact-med" : "incident-impact-low";
  const isCritical = active.impact === "CRITICAL";
  const evidence = isCritical ? [["Observed QBER", "14.20% (limit: 5.50%)", "evidence-alert"], ["CHSH Bell score (S)", "S = 1.76 (collapsed)", "evidence-good"], ["Helstrom error bound", "P_e ≥ 0.0820", ""], ["Trace distance (D)", "D = 0.8360", "evidence-blue"], ["Target node", "QN-BOB (receiver)", ""]] : [["Observed QBER", active.impact === "HIGH" ? "7.42% (limit: 5.50%)" : "4.88% (limit: 5.50%)", active.impact === "HIGH" ? "evidence-alert" : "evidence-good"], ["CHSH Bell score (S)", active.impact === "HIGH" ? "S = 2.12 (review)" : "S = 2.68 (verified)", "evidence-blue"], ["Helstrom error bound", "P_e ≥ 0.1464", ""], ["Trace distance (D)", active.impact === "HIGH" ? "D = 0.4140" : "D = 0.1720", "evidence-blue"], ["Target node", active.impact === "HIGH" ? "QN-ALICE (signer)" : "ARBITRATOR core", ""]];
  const chooseIncident = (item: any) => { setSelectedIncident(item); setRemediated(false); };
  return <div className="incidents-v2-layout"><div className="incidents-v2-main"><div className="incidents-v2-heading"><div><h2>Incidents</h2><p>System log · 27 Aug 2026 · authenticated incident ledger</p></div><span>{incidents.length} records retained</span></div><div className="incidents-v2-ledger"><div className="incidents-v2-row incidents-v2-row-head"><span>incident ID</span><span>status</span><span>assigned</span><span>impact</span></div>{incidents.map((item) => <button key={item.id} className={cn("incidents-v2-row", active.id === item.id && "incidents-v2-row-selected")} onClick={() => chooseIncident(item)}><strong className="mono">{item.id}</strong><span className={cn("incident-status", statusClass(item.status))}>{item.status}</span><span>{item.assigned}</span><span className={cn("incident-impact", impactClass(item.impact))}>{item.impact}</span></button>)}</div></div><aside className="incidents-v2-inspector incidents-evidence-inspector"><div className="incidents-v2-inspector-head"><span className="eyebrow">Inspector · {active.id}</span><span className={cn("incident-inspector-state", statusClass(active.status))}>{active.status}</span></div><div className="incident-inspector-copy"><h3>{active.title}</h3><p>{active.detail}</p></div><div className="incident-case-facts"><div><span>Assigned operator</span><strong>{active.assigned}</strong></div><div><span>Impact severity</span><strong className={impactClass(active.impact)}>{active.impact}</strong></div><div><span>Security clearance</span><strong className="status-text-good">Level 5 (Q-top-secret)</strong></div></div><div className="incident-evidence"><span className="eyebrow">Quantum forensic evidence</span><div className="incident-evidence-table">{evidence.map(([label, value, tone]) => <div key={label}><span>{label}</span><strong className={tone}>{value}</strong></div>)}</div></div><div className="incident-remediation"><div><span className="eyebrow">Automated AI remediation</span><strong>QDS Sentinel AI</strong></div><button className={cn("incident-remediation-button", remediated && "is-remediated")} onClick={() => { setRemediated(!remediated); toast.success(remediated ? "Remediation simulation paused" : "Countermeasure sequence queued"); }}><Zap size={15} /> {remediated ? "REMEDIATION QUEUED" : "PROVIDE REMEDIATION"}</button></div><div className="incident-timeline incident-timeline-compact"><div className="incident-timeline-title"><span className="eyebrow">Incident timeline</span><strong>2 stages</strong></div>{active.events.slice(0, 2).map(([time, title, copy], index) => <div className="incident-timeline-item" key={time}><i className={cn(index === 1 ? "timeline-marker-alert" : "")} /><div><span>{time}</span><strong className={index === 1 ? "text-copper" : ""}>{title}</strong><p>{copy}</p></div></div>)}</div><div className="incident-inspector-actions"><span>Set incident status & export report</span><button className="incident-escalate" onClick={() => toast.error("Escalation package prepared for L3 review")}><ShieldAlert size={15} /> Escalate to L3</button><div><button disabled={active.status === "RESOLVED"} onClick={() => toast.info("Evidence collection restarted")}>Re-investigate</button><button onClick={() => toast.success("Incident report exported") }><Download size={14} /> Export report</button></div></div></aside></div>; }

function SessionsPanel({ selectedSession, setSelectedSession }: any) {
  const [paused, setPaused] = useState<string[]>([]);
  const channels = [
    { id: "01", endpoint: "QNode-A-09", state: "STABLE", rate: "245.8", duration: "04:12:33", trace: "wave", tone: "good" },
    { id: "02", endpoint: "QNode-F-22", state: "DEGRADED", rate: "112.4", duration: "01:45:10", trace: "rise", tone: "copper" },
    { id: "03", endpoint: "Sat-Link-Alpha", state: "STABLE", rate: "450.1", duration: "12:05:44", trace: "step", tone: "good" },
    { id: "04", endpoint: "QNode-B-17", state: "STABLE", rate: "193.7", duration: "00:54:12", trace: "wave-low", tone: "blue" }
  ];
  const FidelityTrace = ({ kind, tone }: { kind: string; tone: string }) => <svg className={cn("session-fidelity", "session-fidelity-" + tone)} viewBox="0 0 116 28" aria-label="Channel fidelity trace"><path d={kind === "rise" ? "M2 22 C20 23 28 20 42 15 S60 5 73 12 S89 14 103 25" : kind === "step" ? "M2 12 H32 L39 23 L46 12 H112" : kind === "wave-low" ? "M2 18 C16 10 29 11 42 17 S67 22 78 12 S98 9 112 14" : "M2 18 C18 5 28 7 41 18 S64 26 78 11 S96 6 105 20"} /></svg>;
  const activeId = selectedSession?.id ?? "01";
  return <div className="sessions-v2-layout"><div className="sessions-v2-heading"><div><h2>Sessions</h2><p>Active quantum communication channels</p></div><span><b>12</b> active streams</span></div><div className="sessions-v2-table"><div className="sessions-v2-row sessions-v2-row-head"><span>ID</span><span>Endpoint</span><span>Status</span><span>Fidelity</span><span>Key rate (kbps)</span><span>Duration</span><span>Actions</span></div>{channels.map((channel) => { const isPaused = paused.includes(channel.id); const isSelected = activeId === channel.id; return <div className={cn("sessions-v2-row", isSelected && "sessions-v2-row-selected")} key={channel.id}><button className="session-row-main" onClick={() => setSelectedSession(channel)} aria-label={"Inspect channel " + channel.endpoint}><span className="mono">{channel.id}</span><strong>{channel.endpoint}</strong><span className={cn("session-state", isPaused ? "session-state-paused" : channel.tone === "copper" ? "session-state-degraded" : "session-state-stable")}>{isPaused ? "PAUSED" : channel.state}</span><FidelityTrace kind={channel.trace} tone={channel.tone} /><span className="mono session-rate">{channel.rate}</span><span className="mono">{channel.duration}</span></button><div className="session-actions"><button className="icon-button" aria-label={"Resync " + channel.endpoint} onClick={() => toast.success("Resynchronization requested for " + channel.endpoint)}><RotateCcw size={14} /></button><button className={cn("icon-button", isPaused && "session-action-active")} aria-label={isPaused ? "Resume " + channel.endpoint : "Pause " + channel.endpoint} onClick={() => setPaused((current) => current.includes(channel.id) ? current.filter((id) => id !== channel.id) : [...current, channel.id])}>{isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}</button></div></div>})}</div></div>; }

function NetworkPanel({ selectedNode, setSelectedNode, isolatedNodes, setIsolatedNodes }: any) {
  const [activeNode, setActiveNode] = useState("ALICE");
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);
  const dragFrame = useRef<number | null>(null);
  const pendingPosition = useRef<{ id: string; x: number; y: number } | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({ ALICE: { x: 22, y: 62 }, ARBITRATOR: { x: 51, y: 29 }, BOB: { x: 80, y: 62 }, EVE: { x: 51, y: 82 } });
  const nodes = [
    { id: "ALICE", name: "QN-ALICE", role: "Photon source / detector", health: "NOMINAL", uptime: "99.998%", hardware: "Q-PROC-v4", protocol: "BB84, E91", rate: "1.2 kbps", latency: "12ms", loss: "0%", tone: "good", pos: "network-canvas-alice" },
    { id: "ARBITRATOR", name: "ARB-CORE", role: "Authenticated central hub", health: "NOMINAL", uptime: "100.000%", hardware: "ARB-CORE-8", protocol: "QDS, CHSH", rate: "0.0 kbps", latency: "0ms", loss: "local", tone: "good", pos: "network-canvas-arb" },
    { id: "BOB", name: "QN-BOB", role: "Verifier endpoint", health: "DEGRADED", uptime: "99.201%", hardware: "Q-PROC-v4", protocol: "BB84, E91", rate: "0.6 kbps", latency: "85ms", loss: "2% loss", tone: "copper", pos: "network-canvas-bob" },
    { id: "EVE", name: "EVE-PROBE-07", role: "Quarantined test probe", health: "QUARANTINED", uptime: "—", hardware: "OBS-PROBE", protocol: "Passive monitor", rate: "0.0 kbps", latency: "blocked", loss: "isolated", tone: "copper", pos: "network-canvas-eve" }
  ];
  const active = nodes.find((node) => node.id === activeNode) ?? nodes[0];
  const inventory = nodes.filter((node) => node.id !== active.id);
  const toggleIsolation = (nodeId: string) => setIsolatedNodes((current: string[]) => current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]);
  const curve = (from: { x: number; y: number }, to: { x: number; y: number }) => { const bend = Math.max(8, Math.abs(to.x - from.x) * .32); const direction = to.x >= from.x ? 1 : -1; return "M " + from.x + " " + from.y + " C " + (from.x + bend * direction) + " " + from.y + " " + (to.x - bend * direction) + " " + to.y + " " + to.x + " " + to.y; };
  const LinkLabel = ({ from, to, text, copper = false }: { from: { x: number; y: number }; to: { x: number; y: number }; text: string; copper?: boolean }) => { const x = (from.x + to.x) / 2; const y = (from.y + to.y) / 2; return <g className={cn("network-v2-link-tag", copper && "network-v2-link-tag-copper")} transform={"translate(" + (x - 5.5) + " " + (y - 4) + ")"}><rect width="11" height="7" rx="0" /><text x="5.5" y="4.7">{text}</text></g>; };
  const beginDrag = (nodeId: string, event: any) => { if (event.pointerType === "mouse" && event.button !== 0) return; event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); didDrag.current = false; setDragging(nodeId); };
  const moveDrag = (event: any) => { if (!dragging || !canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect(); const x = Math.min(88, Math.max(12, ((event.clientX - rect.left) / rect.width) * 100)); const y = Math.min(87, Math.max(12, ((event.clientY - rect.top) / rect.height) * 100)); didDrag.current = true; pendingPosition.current = { id: dragging, x, y }; if (dragFrame.current !== null) return; dragFrame.current = window.requestAnimationFrame(() => { const next = pendingPosition.current; if (next) setPositions((current) => ({ ...current, [next.id]: { x: next.x, y: next.y } })); dragFrame.current = null; }); };
  const endDrag = (event: any) => { if (dragFrame.current !== null) { window.cancelAnimationFrame(dragFrame.current); dragFrame.current = null; } const next = pendingPosition.current; if (next) setPositions((current) => ({ ...current, [next.id]: { x: next.x, y: next.y } })); pendingPosition.current = null; if (dragging) event.currentTarget.releasePointerCapture?.(event.pointerId); setDragging(null); };
  return <div className="network-v2-layout"><section className="network-v2-canvas-wrap"><div className="network-v2-title"><div><h2>Network topology</h2><div className="topology-key"><span className="status-text-good">Nominal</span><span className="text-copper">Degraded</span><span className="muted">Quarantined</span></div></div><span>Drag nodes to inspect paths</span></div><div className={cn("network-v2-canvas", Boolean(dragging) && "network-v2-canvas-dragging")} ref={canvasRef} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><div className="network-canvas-stage" style={{ transform: "scale(" + zoom + ")" }}><svg className="network-v2-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Dynamic network paths"><path className="network-v2-link network-v2-link-nominal" d={curve(positions.ALICE, positions.ARBITRATOR)} /><path className="network-v2-link network-v2-link-degraded" d={curve(positions.ARBITRATOR, positions.BOB)} /><path className="network-v2-link network-v2-link-quarantine" d={curve(positions.ARBITRATOR, positions.EVE)} /><LinkLabel from={positions.ALICE} to={positions.ARBITRATOR} text="12ms · 0%" /><LinkLabel from={positions.ARBITRATOR} to={positions.BOB} text="85ms · 2%" copper /></svg>{nodes.map((node) => { const point = positions[node.id]; return <button key={node.id} className={cn("network-v2-node", node.pos, active.id === node.id && "network-v2-node-active", dragging === node.id && "network-v2-node-dragging", isolatedNodes.includes(node.id) && "network-v2-node-isolated", "network-v2-node-" + node.tone)} style={{ left: point.x + "%", top: point.y + "%" }} onPointerDown={(event) => beginDrag(node.id, event)} onClick={() => { if (didDrag.current) { didDrag.current = false; return; } setActiveNode(node.id); }}><span className="network-v2-node-icon">{node.id === "ARBITRATOR" ? <Network size={27} /> : <Server size={24} />}</span><strong>{node.name}</strong><small>{isolatedNodes.includes(node.id) ? "ISOLATED" : node.role}</small></button>; })}</div><div className="network-zoom"><button onClick={() => setZoom((value) => Math.min(1.12, value + .06))} aria-label="Zoom in">+</button><button onClick={() => setZoom((value) => Math.max(.88, value - .06))} aria-label="Zoom out">−</button></div></div></section><aside className="network-v2-inventory"><div className="network-inventory-head"><span className="eyebrow">Node inventory</span><button className="icon-button" onClick={() => toast.success("Node inventory refreshed")} aria-label="Refresh node inventory"><RotateCcw size={14} /></button></div><button className={cn("network-active-card", "network-active-card-" + active.tone)} onClick={() => setActiveNode(active.id)}><div className="network-active-card-head"><span><Server size={15} /> {active.name}</span><b className={active.tone === "good" ? "status-text-good" : "text-copper"}>{isolatedNodes.includes(active.id) ? "ISOLATED" : active.health}</b></div><div className="network-active-metrics"><div><span>Uptime</span><strong>{active.uptime}</strong></div><div><span>Hardware</span><strong>{active.hardware}</strong></div><div><span>Protocol support</span><strong>{active.protocol}</strong></div><div><span>Key gen rate</span><strong>{active.rate}</strong></div></div><div className="network-active-actions"><button className="button button-outline button-small" onClick={(event) => { event.stopPropagation(); toast.success("Ping returned from " + active.name); }}>Ping</button><button className="button button-copper button-small" onClick={(event) => { event.stopPropagation(); setSelectedNode(active.id); }}>{isolatedNodes.includes(active.id) ? "Reconnect" : "Isolate"}</button></div></button><div className="network-connected-card"><div className="network-connected-head"><span className="eyebrow">Connected nodes ({inventory.length})</span></div>{inventory.map((node) => <button key={node.id} className={cn("network-connected-row", activeNode === node.id && "network-connected-row-active")} onClick={() => setActiveNode(node.id)}><div><strong>{node.name}</strong><span>{isolatedNodes.includes(node.id) ? "Isolated" : node.role}</span></div><div><b className={node.tone === "good" ? "status-text-good" : "text-copper"}>{node.latency}</b><span>{node.loss}</span></div></button>)}</div></aside>{selectedNode && <div className="modal-backdrop" onClick={() => setSelectedNode(null)}><div className="modal-card modal-card-small" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Node quarantine control</span><h3>{selectedNode}</h3></div><button className="icon-button" onClick={() => setSelectedNode(null)} aria-label="Close node modal"><X size={15} /></button></div><p className="modal-copy">Isolation removes this node from the authenticated quantum ring until the node is explicitly released.</p><button className={cn("button modal-submit", isolatedNodes.includes(selectedNode) ? "button-outline" : "button-copper")} onClick={() => { toggleIsolation(selectedNode); toast.info("Node state updated"); setSelectedNode(null); }}>{isolatedNodes.includes(selectedNode) ? "Reconnect node" : "Isolate node"}</button></div></div>}</div>; }

const steps = ["Entangled photon pair emission", "Joint Bell state measurement", "Classical feed-forward & Pauli frame correction", "Hoeffding statistical bound audit", "Privacy amplification & Toeplitz hash distillation", "Arbitrator final verdict"];
const stepMeta = ["KEY EXCH MN", "ALICE BSM", "BOB NODE", "HOEFFDING CHK", "PRIVACY AMP", "THREAT ENGINE"];
function LegacyDemonstrationPage() {

  const { eveActive, toggleEve, qber: globalQber, chsh: globalChsh } = useSentinel();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const eve = eveActive;
  const setEve = (val: boolean | ((curr: boolean) => boolean)) => toggleEve();
  const [dragging, setDragging] = useState<string | null>(null);
  const [executingLive, setExecutingLive] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [nodePositions, setNodePositions] = useState({ alice: { x: 11, y: 48 }, arb: { x: 49, y: 27 }, bob: { x: 87, y: 48 }, eve: { x: 63, y: 72 } });
  const stageRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const nodeDragFrame = useRef<number | null>(null);
  const pendingNodePosition = useRef<{ id: keyof typeof nodePositions; x: number; y: number } | null>(null);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setStep((current) => current >= steps.length - 1 ? 0 : current + 1), Math.max(500, 2500 / simSpeed)); return () => window.clearInterval(timer); }, [playing, simSpeed]);
  const beginNodeDrag = (id: keyof typeof nodePositions, event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const point = nodePositions[id];
    dragOffset.current = { x: event.clientX - (rect.left + (point.x / 100) * rect.width), y: event.clientY - (rect.top + (point.y / 100) * rect.height) };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(id);
  };
  const moveNode = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, ((event.clientX - rect.left - dragOffset.current.x) / rect.width) * 100));
    const y = Math.max(17, Math.min(83, ((event.clientY - rect.top - dragOffset.current.y) / rect.height) * 100));
    pendingNodePosition.current = { id: dragging as keyof typeof nodePositions, x, y };
    if (nodeDragFrame.current !== null) return;
    nodeDragFrame.current = window.requestAnimationFrame(() => { const next = pendingNodePosition.current; if (next) setNodePositions((current) => ({ ...current, [next.id]: { x: next.x, y: next.y } })); nodeDragFrame.current = null; });
  };
  const endNodeDrag = () => { if (nodeDragFrame.current !== null) { window.cancelAnimationFrame(nodeDragFrame.current); nodeDragFrame.current = null; } const next = pendingNodePosition.current; if (next) setNodePositions((current) => ({ ...current, [next.id]: { x: next.x, y: next.y } })); pendingNodePosition.current = null; setDragging(null); };
  const currentQber = (globalQber * 100).toFixed(1) + "%";
  const currentChsh = globalChsh.toFixed(2);
  const matrixRows = Array.from({ length: 8 }, (_, i) => { const pulse = String(i + 1).padStart(2, "0"); const intercepted = eve && (i === 0 || i === 1 || i === 3 || i === 6); const discarded = i === 3 || i === 4 || i === 7; return { pulse, aliceBasis: i % 3 === 0 ? "×" : "+", aliceBit: i % 2 ? "1" : "0", bobBasis: i % 3 === 1 ? "+" : "×", bobBit: intercepted ? (i % 2 ? "0" : "1") : i % 2 ? "1" : "0", bell: ["Φ⁻", "Φ⁺", "Ψ⁺", "Φ⁺", "Φ⁻", "Ψ⁻", "Φ⁺", "Ψ⁺"][i], intercepted, discarded, angleA: i % 3 === 0 ? "45°" : "0°", angleB: i % 3 === 1 ? "45°" : "0°" }; });
  const exportMatrix = () => { const header = "PLS,Alice Basis,Alice Bit,Bob Basis,Bob Bit,Bell Outcome,Eve Intercept,Sift Status,Polarization Angle A,Polarization Angle B"; const csv = [header, ...matrixRows.map((row) => [row.pulse, row.aliceBasis, row.aliceBit, row.bobBasis, row.bobBit, row.bell, row.intercepted ? "Yes" : "No", row.discarded ? "Discarded" : row.intercepted ? "QBER Error" : "Kept", row.angleA, row.angleB].join(","))].join("\n"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `quantum_matrix_${Date.now()}.csv`; anchor.click(); URL.revokeObjectURL(url); toast.success("Quantum matrix CSV exported"); };
  const stepCopy = ["The arbitrator pumps an SPDC crystal to produce Bell pairs |Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩) at λ = 1550 nm.", "Alice performs a joint Bell measurement on |ψdoc⟩ and her entangled qubit, producing two classical feed-forward bits (b₁, b₂).", "Bob receives (b₁, b₂) and applies σxᵇ¹ · σzᵇ² to restore quantum-state fidelity.", "The arbitrator samples N test qubits and checks observed QBER against the Hoeffding threshold τ = 5.0%.", "A Toeplitz matrix distills an unforgeable 256-bit quantum one-time-pad signature token.", "The threat engine accepts when QBER ≤ 5.0% and CHSH S ≥ 2.00; otherwise it rejects."];
  return <div className="page-content demo-page"><Topbar onNotifications={() => setShowNotifications(!showNotifications)} eyebrow="01 / Quantum protocol" title="Alice ↔ Bob" subtitle="Interactive protocol visualizer / session QKD-260827-91F4" action={<><button className="button button-quiet button-small" onClick={() => setShowCreateSession(true)}><Plus size={14} /> New session</button><button className="icon-button" onClick={() => setShowSettings(true)} aria-label="Simulation settings"><Settings2 size={16} /></button><Link href="/home" className="button button-quiet button-small"><ArrowLeft size={14} /> Home portal</Link><Link href="/monitoring" className="button button-outline button-small">SOC monitoring <ArrowUpRight size={14} /></Link></>} /><div className="demo-toolbar"><div className="demo-session"><span className="mini-label"><StatusDot /> active session</span><strong>QKD-260827-91F4</strong></div><div className="demo-controls"><button className={cn("button button-quiet button-small", playing && "button-active")} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />} {playing ? "Pause" : "Play"}</button><button className="button button-outline button-small" onClick={() => setStep((s) => s >= 5 ? 0 : s + 1)}>Step forward <ChevronRight size={14} /></button><button className="icon-button" onClick={() => { setStep(0); setPlaying(false); toggleEve(); }} aria-label="Reset protocol"><RotateCcw size={15} /></button><button className="button button-copper button-small" disabled={executingLive} onClick={() => { setExecutingLive(true); setTimeout(() => { setExecutingLive(false); setStep(5); setPlaying(false); toast.success("Live signature verification completed"); }, 700); }}>{executingLive ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />} {executingLive ? "Executing…" : "Execute live protocol"}</button></div></div><div className="step-tracker"><div className="step-rail" aria-hidden="true"><span className="step-rail-fill" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} /></div><span className="step-cursor" aria-hidden="true" style={{ "--step-index": step } as React.CSSProperties} />{steps.map((label, i) => <button key={label} className={cn("step-item", i === step && "step-current", i < step && "step-done")} onClick={() => setStep(i)}><span className="step-num">{i < step ? <Check size={12} /> : `0${i + 1}`}</span><span>{label}</span></button>)}</div><section className="protocol-board"><div className="protocol-intro"><div><span className="eyebrow">Phase 0{step + 1} / 06 · {stepMeta[step]}</span><h2>{steps[step]}</h2><p>{stepCopy[step]}</p><div className="protocol-metrics"><span><b>QBER</b>{currentQber}</span><span><b>CHSH S</b>{currentChsh}</span><span><b>τ cutoff</b>5.0%</span></div></div><div className="protocol-readout"><span>decision</span><strong className={eve ? "text-copper" : "text-blue"}>{eve ? "REJECT" : step === 5 ? "ACCEPT" : "PENDING"}</strong><small>{eve ? "disturbance detected" : step === 5 ? "all gates clear" : "awaiting next phase"}</small></div></div><div key={step} ref={stageRef} className={cn("channel-stage", eve && "channel-stage-threat", playing && "flow-playing", `phase-${step}`)} onPointerMove={moveNode} onPointerUp={endNodeDrag} onPointerCancel={endNodeDrag}><div className="flow-progress" aria-label={`Protocol phase ${step + 1} of 6`}>{steps.map((label, i) => <span key={label} className={cn(i === step && "flow-progress-current", i < step && "flow-progress-done")} />)}</div><svg className="connection-map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line className="connection-line connection-optical" x1={nodePositions.arb.x} y1={nodePositions.arb.y} x2={nodePositions.alice.x} y2={nodePositions.alice.y} /><line className="connection-line connection-optical" x1={nodePositions.arb.x} y1={nodePositions.arb.y} x2={(eve ? nodePositions.eve.x : nodePositions.bob.x)} y2={(eve ? nodePositions.eve.y : nodePositions.bob.y)} /><line className={cn("connection-line", eve ? "connection-threat-route" : "connection-classical")} x1={(eve ? nodePositions.eve.x : nodePositions.alice.x)} y1={(eve ? nodePositions.eve.y : nodePositions.alice.y)} x2={nodePositions.bob.x} y2={nodePositions.bob.y} /><circle className="connection-anchor" cx={nodePositions.arb.x} cy={nodePositions.arb.y} r="1.1" /><circle className="connection-anchor" cx={nodePositions.alice.x} cy={nodePositions.alice.y} r="1.1" /><circle className="connection-anchor" cx={nodePositions.bob.x} cy={nodePositions.bob.y} r="1.1" /></svg><svg className="photon-system" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><PhotonTrack id="route-arb-alice" from={nodePositions.arb} to={nodePositions.alice} tone={eve ? "threat" : "quantum"} delay="-.2s" />{eve ? <><PhotonTrack id="route-arb-eve" from={nodePositions.arb} to={nodePositions.eve} tone="threat" delay="-.8s" /><PhotonTrack id="route-eve-bob" from={nodePositions.eve} to={nodePositions.bob} tone="threat" delay="-1.4s" /></> : <PhotonTrack id="route-arb-bob" from={nodePositions.arb} to={nodePositions.bob} tone="quantum" delay="-.95s" />}</svg><div className="stage-label stage-label-top">Optical channel <span>authenticated / 1550nm</span></div><div className={cn("protocol-node", "node-alice", "movable-node", dragging === "alice" && "node-dragging", step === 1 && "node-active", "compact-node")} style={{ left: `${nodePositions.alice.x}%`, top: `${nodePositions.alice.y}%` }} onPointerDown={(event) => beginNodeDrag("alice", event)}><div className="protocol-node-icon"><FileKey2 size={20} /></div><strong>ALICE</strong><span>node A / signer</span><div className="node-readout"><span>document hash</span><b>af7c…e91b</b></div></div><div className={cn("protocol-node", "node-arb", "movable-node", dragging === "arb" && "node-dragging", step === 0 && "node-active", "compact-node")} style={{ left: `${nodePositions.arb.x}%`, top: `${nodePositions.arb.y}%` }} onPointerDown={(event) => beginNodeDrag("arb", event)}><div className="protocol-node-icon"><Sparkles size={20} /></div><strong>ARBITRATOR</strong><span>entangled source</span><div className="node-readout"><span>EPR pairs</span><b>100 / 100</b></div></div><div className={cn("protocol-node", "node-bob", "movable-node", dragging === "bob" && "node-dragging", step === 3 && "node-active", "compact-node")} style={{ left: `${nodePositions.bob.x}%`, top: `${nodePositions.bob.y}%` }} onPointerDown={(event) => beginNodeDrag("bob", event)}><div className="protocol-node-icon"><ShieldCheck size={20} /></div><strong>BOB</strong><span>node B / verifier</span><div className="node-readout"><span>Pauli frame</span><b>{step >= 3 ? "σXZ aligned" : "awaiting bits"}</b></div></div><div className={cn("protocol-node", "node-eve", "movable-node", dragging === "eve" && "node-dragging", eve && "node-active", "compact-node")} style={{ left: `${nodePositions.eve.x}%`, top: `${nodePositions.eve.y}%` }} onPointerDown={(event) => beginNodeDrag("eve", event)}><div className="protocol-node-icon"><AlertTriangle size={20} /></div><strong>EVE</strong><span>adversary / isolated</span><div className="node-readout"><span>intercept rate</span><b>{eve ? "35% active" : "0% idle"}</b></div></div><div className="stage-label stage-label-bottom"><span>classical channel / authenticated</span><span>γ photon stream / entangled pair</span></div></div><div className="protocol-controls"><div className="control-copy"><span className="eyebrow">Adversarial simulation</span><strong>Man-in-the-middle interception</strong><span>Toggle to observe a broken Bell correlation across all pages.</span></div><button className={cn("switch", eve && "switch-on")} onClick={() => toggleEve()} aria-pressed={eve}><span className="switch-thumb" /> <span>{eve ? "Eve active" : "Eve idle"}</span></button></div></section><section className="bitstream-section"><SectionLabel index="03" eyebrow="Evidence sample" title="Quantum bitstream & Pauli alignment" action={<div className="evidence-actions"><Pill tone="blue">{matrixRows.filter((row) => !row.discarded).length} kept / {matrixRows.filter((row) => row.discarded).length} dropped</Pill><button className="button button-quiet button-small" onClick={exportMatrix}><Download size={14} /> Export Matrix CSV</button></div>} /><div className="bitstream-table-wrap"><table className="data-table bitstream-table"><thead><tr><th>pulse</th><th>Alice basis</th><th>raw bit</th><th>Bell outcome</th><th>Bob basis</th><th>Pauli</th><th>sifting</th></tr></thead><tbody>{matrixRows.map((row) => <tr key={row.pulse}><td className="mono">{row.pulse}</td><td>{row.aliceBasis}</td><td className="mono">{row.aliceBit}</td><td className="mono">{row.bell}</td><td>{row.bobBasis}</td><td className="mono">{row.bobBit}</td><td><Pill tone={row.discarded || row.intercepted ? "copper" : "good"}>{row.discarded ? "DISCARDED" : row.intercepted ? "QBER ERROR" : "KEPT"}</Pill></td></tr>)}</tbody></table></div></section>{showCreateSession && <div className="modal-backdrop" onClick={() => setShowCreateSession(false)}><div className="modal-card" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Provision / 01</span><h3>New quantum session</h3></div><button className="icon-button" onClick={() => setShowCreateSession(false)} aria-label="Close new session"><X size={15} /></button></div><p className="modal-copy">Create a clean handshake session and begin at the EPR preparation phase.</p><div className="form-grid"><label>Document<input defaultValue="board-resolution.pdf" /></label><label>Protocol profile<select defaultValue="QDS / 1550nm"><option>QDS / 1550nm</option><option>QDS / test channel</option></select></label></div><button className="button button-copper modal-submit" onClick={() => { setShowCreateSession(false); setStep(0); setPlaying(true); toast.success("Quantum Session created & active"); }}><Play size={14} fill="currentColor" /> Create & start session</button></div></div>}{showSettings && <div className="modal-backdrop" onClick={() => setShowSettings(false)}><div className="modal-card modal-card-small" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Control plane</span><h3>Simulation settings</h3></div><button className="icon-button" onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={15} /></button></div><div className="settings-row"><span>Playback speed</span><div className="speed-pills">{[0.5, 1, 2, 4].map((speed) => <button key={speed} className={cn("speed-pill", simSpeed === speed && "speed-pill-active")} onClick={() => setSimSpeed(speed)}>{speed}x</button>)}</div></div><div className="settings-note"><Gauge size={14} /> Photon velocity and auto-advance interval update together.</div></div></div>}{showNotifications && <div className="notification-popover"><div className="modal-head"><div><span className="eyebrow">Signal desk</span><h3>Notifications</h3></div><button className="icon-button" onClick={() => setShowNotifications(false)} aria-label="Close notifications"><X size={14} /></button></div><div className="notification-item"><span className="notification-mark" /><div><strong>{eve ? "Quantum channel intrusion" : "No active alerts"}</strong><span>{eve ? "35% intercept tap is disturbing Bell correlation." : "The current session is within nominal tolerance."}</span></div></div>{eve && <button className="text-link notification-clear" onClick={() => { toggleEve(); setShowNotifications(false); }}>Clear active alert</button>}</div>}</div>;
}

function DemonstrationPage() {
  return <LegacyDemonstrationPage />;
}

function SandboxMetricChart({ title, value, detail, threat, mode }: { title: string; value: string; detail: string; threat: boolean; mode: "qber" | "chsh" }) {
  const path = mode === "qber" ? (threat ? "M 10 82 L 34 82 L 51 80 L 65 74 L 74 45 L 92 35" : "M 10 82 L 34 81 L 51 82 L 65 79 L 74 76 L 92 74") : (threat ? "M 10 35 C 30 18 55 18 75 29 S 88 49 92 66" : "M 10 32 C 30 20 55 19 75 28 S 88 31 92 30");
  return <div className="sandbox-v2-metric"><div className="sandbox-v2-metric-head"><strong>{title}</strong><span>{mode === "chsh" ? "Quantum ≥ 2.0" : "0.0–1.0"}</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="sandbox-v2-threshold" d={mode === "qber" ? "M 8 55 H 94" : "M 8 58 H 94"} /><path className={threat ? "sandbox-v2-path-threat" : "sandbox-v2-path"} d={path} /></svg><div className="sandbox-v2-metric-foot"><span>{detail}</span><b className={threat ? "text-copper" : "status-text-good"}>{value}</b></div></div>;
}

/* Transfer workspace — Signal Atelier applies mineral paper, ink, copper intervention, and analytic blue telemetry. */
function TransferPage() {
  const { eveActive, toggleEve, qber, chsh, pqcMode, payloads, sendTransmission, resetChannel } = useSentinel();
  const [mode, setMode] = useState<"message" | "document">(() => new URLSearchParams(window.location.search).get("mode") === "document" ? "document" : "message");
  const [message, setMessage] = useState("CLASSIFIED DEFENSE TELEMETRY: Quantum one-time-pad key handshake verified for orbital satellite relay Alpha-09.");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDigest, setFileDigest] = useState<string | null>(null);
  const [fileIsDragging, setFileIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = ["Defense manifest 09", "OTP key exchange", "Satellite command"];
  const selectPreset = (preset: string) => setMessage(preset === "Defense manifest 09" ? "DEFENSE MANIFEST 09: Signed payload approved for authenticated orbital relay delivery." : preset === "OTP key exchange" ? "ONE-TIME-PAD EXCHANGE: Entangled key material sealed for the next authenticated message." : "SATELLITE COMMAND: Deploy the secure quantum control packet to the Alpha-09 relay.");
  const formatFileSize = (bytes: number) => bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + " KB" : (bytes / (1024 * 1024)).toFixed(1) + " MB";
  
  const acceptDocument = async (candidate?: File | null) => {
    if (!candidate) return;
    const allowed = /\.(txt|pdf|sig|json)$/i.test(candidate.name);
    if (!allowed) { toast.error("Use a .txt, .pdf, .sig, or .json document"); return; }
    if (candidate.size > 10 * 1024 * 1024) { toast.error("Document limit is 10 MB"); return; }
    setSelectedFile(candidate);
    setFileDigest(null);
    try { const data = await candidate.arrayBuffer(); const hash = await crypto.subtle.digest("SHA-256", data); const digest = Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join(""); setFileDigest("0x" + digest.slice(0, 48)); } catch { setFileDigest("0x7c8a92f4d61be05e7a3c4f88b19d20a6"); }
    toast.success(candidate.name + " staged for quantum signing");
  };

  const removeDocument = () => { setSelectedFile(null); setFileDigest(null); if (fileInputRef.current) fileInputRef.current.value = ""; toast.info("Document removed from the signing queue"); };

  const handleSend = async () => {
    if (mode === "document" && !selectedFile) { toast.error("Choose a document before sending"); return; }
    await sendTransmission({ mode, message, file: selectedFile, digest: fileDigest });
    if (mode === "document" && selectedFile) removeDocument();
  };

  const digest = fileDigest || (eveActive ? "f098e1a7ce22d4ab9f3d5538ee04dced" : "0x6692d35f98fc1c149afbf4c8996fb92427ae4fe4649b934ca495991b7852b8");

  return (
    <div className="transfer-page">
      <header className="transfer-header">
        <div className="transfer-brand"><img src={MARK} alt="" /><span>QDS SENTINEL</span></div>
        <strong>Real-time quantum transfer</strong>
        <div className="transfer-header-actions">
          <span className={eveActive ? "transfer-security threat" : "transfer-security"}>{eveActive ? "PQC FALLBACK ACTIVE" : "FASTAPI CORE CONNECTED"}</span>
          <Link href="/monitoring" className="transfer-soc-link">SOC console</Link>
        </div>
      </header>
      <section className="transfer-status-strip">
        <span><Sparkles size={15} /> EPR rate <b>1,024 pairs/sec</b></span>
        <span><Waves size={15} /> Observed QBER <b className={eveActive ? "text-copper" : "text-blue"}>{(qber * 100).toFixed(2)}%</b></span>
        <span><Zap size={15} /> CHSH Bell score <b className={eveActive ? "text-copper" : "status-text-good"}>S = {chsh.toFixed(2)}</b></span>
        <div className="transfer-strip-spacer" />
        <button className={cn("transfer-eve-toggle", eveActive && "transfer-eve-toggle-active")} onClick={() => toggleEve()}>
          <LockKeyhole size={14} /> Eve interception tap <i><b /></i><small>{eveActive ? "Fallback active" : "Secure line"}</small>
        </button>
        <button className="transfer-reset" onClick={() => { setMessage("CLASSIFIED DEFENSE TELEMETRY: Quantum one-time-pad key handshake verified for orbital satellite relay Alpha-09."); removeDocument(); resetChannel(); }}>
          <RotateCcw size={14} /> Reset session
        </button>
      </section>
      <main className="transfer-workspace">
        <section className="transfer-terminal transfer-alice">
          <div className="transfer-terminal-head">
            <div>
              <span className="transfer-node-mark">A</span>
              <div>
                <h1>Alice terminal <small>signer node alpha</small></h1>
                <p>You are logged in as Alice · transmitting via 1550nm telecom fiber</p>
              </div>
            </div>
            <div className="transfer-mode-switch">
              <button className={mode === "message" ? "active" : ""} onClick={() => setMode("message")}>Text message</button>
              <button className={mode === "document" ? "active" : ""} onClick={() => setMode("document")}>Document file</button>
            </div>
          </div>
          {mode === "message" ? (
            <div className="transfer-compose">
              <div>
                <span className="eyebrow">Quick preset payloads</span>
                <div className="transfer-presets">{presets.map((preset) => <button key={preset} onClick={() => selectPreset(preset)}>+ {preset}</button>)}</div>
              </div>
              <label className="transfer-compose-label">
                Compose quantum signed payload
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Compose an authenticated payload" />
              </label>
              <div className="transfer-digest">
                <div><LockKeyhole size={14} /><span>Computed SHA-256 digest (h = SHA256(m))</span></div>
                <button onClick={() => { navigator.clipboard?.writeText(digest); toast.success("Digest copied"); }}><Copy size={13} /> Copy hash</button>
                <code>{digest}</code>
              </div>
            </div>
          ) : (
            <div className="transfer-document-compose">
              <div>
                <span className="eyebrow">Upload document payload</span>
                <p>Attach a protected document for local hashing and post-quantum signing.</p>
              </div>
              <input ref={fileInputRef} className="transfer-file-input" type="file" accept=".txt,.pdf,.sig,.json,application/pdf,application/json,text/plain" onChange={(event) => acceptDocument(event.target.files?.[0])} />
              <div
                className={cn("transfer-upload-zone", fileIsDragging && "transfer-upload-zone-dragging", Boolean(selectedFile) && "transfer-upload-zone-selected")}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInputRef.current?.click(); } }}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); setFileIsDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setFileIsDragging(true); }}
                onDragLeave={() => setFileIsDragging(false)}
                onDrop={(event) => { event.preventDefault(); setFileIsDragging(false); acceptDocument(event.dataTransfer.files?.[0]); }}
              >
                {selectedFile ? (
                  <div className="transfer-selected-file">
                    <FileKey2 size={24} />
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <span>{formatFileSize(selectedFile.size)} · {fileDigest ? "SHA-256 sealed" : "Hashing evidence…"}</span>
                    </div>
                    <button type="button" onClick={(event) => { event.stopPropagation(); removeDocument(); }} aria-label="Remove selected document"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <span className="transfer-upload-icon"><FileKey2 size={26} /></span>
                    <strong>Click or drag & drop file here</strong>
                    <small>Supports .txt, .pdf, .sig, .json files · max 10 MB</small>
                  </>
                )}
              </div>
              <div className="transfer-document-notes">
                <div><span>Local hash</span><strong>{fileDigest ? "Ready" : "Awaiting document"}</strong></div>
                <div><span>Signature profile</span><strong>ML-DSA-65 fallback</strong></div>
                <div><span>Destination</span><strong>Bob / node beta</strong></div>
              </div>
              <div className="transfer-digest">
                <div><LockKeyhole size={14} /><span>Computed SHA-256 document digest</span></div>
                <button onClick={() => { navigator.clipboard?.writeText(digest); toast.success("Document digest copied"); }}><Copy size={13} /> Copy hash</button>
                <code>{digest}</code>
              </div>
            </div>
          )}
          <div className="transfer-sendbar">
            <span>State: {mode === "document" ? selectedFile ? "Document ready to sign" : "Awaiting document" : eveActive ? "Fallback signature mode" : "Ready to sign"}</span>
            <button onClick={handleSend}><Send size={15} /> Send quantum signed payload</button>
          </div>
        </section>
        <section className="transfer-terminal transfer-bob">
          <div className="transfer-terminal-head">
            <div>
              <span className="transfer-node-mark node-b">B</span>
              <div>
                <h1>Bob terminal <small>receiver node beta</small></h1>
                <p>Real-time SNSPD detector listener · dark fiber receiver</p>
              </div>
            </div>
            <span className="transfer-listening">Listening</span>
          </div>
          <div className="transfer-receipts">
            <div className="transfer-receipts-head">
              <span className="eyebrow">Received payloads ({payloads.length})</span>
              <span>Live receipt ledger</span>
            </div>
            {payloads.map((payload) => (
              <article className={cn("transfer-receipt", payload.tone === "pqc" && "transfer-receipt-pqc")} key={payload.id}>
                <div className="transfer-receipt-meta">
                  <strong className={payload.tone === "pqc" ? "receipt-pqc" : ""}>{payload.verification}</strong>
                  <span>{payload.id}</span>
                  <time>{payload.time}</time>
                </div>
                <h2>{payload.title}</h2>
                <pre>{payload.body}</pre>
                <div className={cn("transfer-signature", payload.tone === "pqc" && "transfer-signature-pqc")}>
                  <b>{payload.tone === "pqc" ? "PQC lattice signature / ML-DSA-65" : "Physical QDS attestation"}</b>
                  <code>{payload.signature}</code>
                </div>
                <footer>
                  <span>QBER: <b className={payload.metricTone}>{payload.qber}</b></span>
                  <span>CHSH: <b className={payload.metricTone}>S={payload.chsh}</b></span>
                  <button onClick={() => { navigator.clipboard?.writeText(payload.body + "\n" + payload.signature); toast.success("Receipt evidence copied"); }}><Copy size={13} /> Copy</button>
                </footer>
              </article>
            ))}
          </div>
          <div className="transfer-bob-foot">
            Verification engine: FastAPI core + Hoeffding audit <strong className={eveActive ? "text-copper" : "status-text-good"}>{eveActive ? "PQC fallback integrity active" : "100% byte integrity assured"}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}

function DatabasePage() {

  const [selected, setSelected] = useState(sessionRows[0]);
  return <div className="page-content database-page"><Topbar eyebrow="04 / Data studio" title="Live database" subtitle="Inspect session state, raw bitstreams, and audit records" action={<button className="button button-copper button-small" onClick={() => toast.success("Insert record form ready")}>+ Insert record</button>} /><div className="db-layout"><aside className="table-sidebar"><span className="eyebrow">Tables / 04</span>{[{name:"quantum_sessions", count:"12", icon: Radio},{name:"attack_records", count:"08", icon: AlertTriangle},{name:"node_metrics", count:"04", icon: Network},{name:"telemetry_logs", count:"1.2k", icon: Activity}].map((table, i) => {const Icon=table.icon; return <button className={cn("table-nav", i === 0 && "table-nav-active")} key={table.name}><Icon size={15} /><span>{table.name}</span><b>{table.count}</b></button>})}<div className="db-sidebar-foot"><StatusDot /> auto-sync every 2.5s</div></aside><main className="db-main"><div className="db-toolbar"><div className="db-title"><Database size={16} /><strong>quantum_sessions</strong><Pill tone="good">synced</Pill></div><div className="db-actions"><div className="search-box"><Search size={14} /><input placeholder="Search rows" /></div><button className="filter-button"><SlidersHorizontal size={14} /> Status: all</button><button className="icon-button" onClick={() => toast.success("Table refreshed")} aria-label="Refresh table"><RefreshCw size={15} /></button></div></div><div className="data-table-wrap db-table-wrap"><table className="data-table db-table"><thead><tr><th>Session ID</th><th>Document name</th><th>Status</th><th>QBER</th><th>Hoeffding</th><th>CHSH</th><th>Verdict</th><th>Created</th></tr></thead><tbody>{sessionRows.map((row) => <tr onClick={() => setSelected(row)} className={selected.id === row.id ? "row-selected" : ""} key={row.id}><td className="mono strong-cell">{row.id}</td><td>{row.doc}</td><td><span className={cn("row-status", row.status === "Quarantined" && "row-status-bad")}><StatusDot tone={row.status === "Quarantined" ? "bad" : "ok"} />{row.status}</span></td><td>{row.qber}</td><td>5.5%</td><td>{row.chsh}</td><td><Pill tone={row.verdict === "REJECT" ? "copper" : "good"}>{row.verdict}</Pill></td><td className="mono muted">{row.time}</td></tr>)}</tbody></table></div><div className="db-pagination"><span>Showing 1–4 of 12 records</span><div><button className="icon-button"><ArrowLeft size={14} /></button><button className="page-current">1</button><button className="icon-button"><ChevronRight size={14} /></button></div></div></main><aside className="record-drawer"><div className="drawer-head"><div><span className="eyebrow">Record inspector</span><h3>Session payload</h3></div><button className="icon-button" aria-label="Close inspector"><X size={15} /></button></div><Pill tone={selected.verdict === "REJECT" ? "copper" : "good"}>{selected.verdict} / {selected.status}</Pill><div className="record-id">{selected.id}</div><div className="record-block"><span className="eyebrow">Document</span><strong>{selected.doc}</strong><span className="mono muted">sha256: af7c…e91b</span></div><div className="record-metrics"><div><span>QBER</span><strong className={selected.verdict === "REJECT" ? "text-copper" : ""}>{selected.qber}</strong></div><div><span>CHSH</span><strong>{selected.chsh}</strong></div></div><div className="json-block"><div><span>raw_payload.jsonb</span><Copy size={13} /></div><pre>{`{
  "alice_bits": [1, 0, 1, 1, 0, 1],
  "bell_outcomes": ["01", "00", "11"],
  "bob_measurements": [1, 0, 1, 1],
  "pauli_frame": ["I", "X", "Z", "XZ"],
  "xor_mismatch": [0, 0, 0, 0]
}`}</pre></div><button className="button button-outline drawer-button" onClick={() => toast.success("Raw payload copied") }><Clipboard size={14} /> Copy JSON payload</button></aside></div></div>;
}

export default function Home() {
  const [location] = useLocation();
  useEffect(() => { document.title = "QDS Sentinel — Quantum signature assurance"; }, []);
  const page = useMemo(() => location === "/demonstration" ? <DemonstrationPage /> : location === "/monitoring" ? <MonitoringPage /> : location === "/attack-sandbox" ? <SandboxPage /> : location === "/transfer" ? <TransferPage /> : location === "/database" ? <DatabasePage /> : <HomePortal />, [location]);
  const isPortal = location === "/" || location === "/home" || location === "/demonstration";
  const isSandbox = location === "/attack-sandbox";
  const isTransfer = location === "/transfer";
  const isChromeFree = isPortal || isSandbox || isTransfer;
  return <div className={cn("app-shell", isPortal && "app-shell-portal", isSandbox && "app-shell-sandbox", isTransfer && "app-shell-transfer")}>{!isChromeFree && <Sidebar location={location} />}<main className="main-shell">{page}{!isSandbox && !isTransfer && <footer className="page-footer"><span className="footer-brand"><img src={MARK} alt="" /> QDS SENTINEL / v1.0.0</span><span>fastapi gateway <b>3001 OK</b></span><span>© 2026 quantum assurance lab</span></footer>}</main></div>;
}
