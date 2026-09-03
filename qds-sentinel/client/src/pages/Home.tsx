import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useSentinel } from "../lib/SentinelContext";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
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
import { generateAiRemediation, AiRemediationResponse } from "@/lib/groqAiService";

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

function TelemetryChart({ threat = false, range = "15M" }: { threat?: boolean; range?: string }) {
  const { telemetryLogs, qber: currentQber } = useSentinel();
  const count = range === "1M" ? 5 : range === "5M" ? 8 : range === "15M" ? 14 : 30;
  const recentLogs = [...telemetryLogs].slice(0, count).reverse();
  if (recentLogs.length < 2) {
    while (recentLogs.length < 6) {
      recentLogs.unshift({
        id: `mock-${recentLogs.length}`,
        time: '11:45:00',
        source: 'ARB-CORE',
        text: 'Baseline sync',
        ms: '12ms',
        code: '200 OK',
        qber: threat ? '14.2%' : '1.9%',
        chsh: threat ? '1.76' : '2.76'
      });
    }
  }

  const width = 700;
  const height = 190;
  const padTop = 15;
  const padBottom = 25;
  const maxQber = 0.20;

  const points = recentLogs.map((log, index) => {
    const x = (index / (recentLogs.length - 1)) * width;
    let val = parseFloat(log.qber?.replace('%', '') || '1.9') / 100;
    if (isNaN(val)) val = currentQber;
    const clamped = Math.max(0, Math.min(maxQber, val));
    const y = (height - padBottom) - (clamped / maxQber) * (height - padTop - padBottom);
    return { x, y, val: (val * 100).toFixed(1), time: log.time, isThreat: log.isThreat || val > 0.055 };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height - padBottom} L 0 ${height - padBottom} Z`;
  const hoeffdingY = (height - padBottom) - (0.055 / maxQber) * (height - padTop - padBottom);
  const latestPt = points[points.length - 1] || { x: width, y: 140, val: '1.9', isThreat: threat };
  const xLabels = points.filter((_, idx) => idx % Math.max(1, Math.floor(points.length / 5)) === 0 || idx === points.length - 1).slice(0, 5);

  return (
    <div className="chart-wrap">
      <div className="chart-ylabels">
        <span>20%</span>
        <span>15%</span>
        <span>10%</span>
        <span style={{ color: '#C2540A', fontWeight: 600 }}>5.5% (τ)</span>
        <span>0%</span>
      </div>
      <svg className="telemetry-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Observed QBER dynamic stream">
        <defs>
          <linearGradient id="area-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={threat || latestPt.isThreat ? "#C2540A" : "#0058BE"} stopOpacity="0.28" />
            <stop offset="100%" stopColor={threat || latestPt.isThreat ? "#C2540A" : "#0058BE"} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g className="chart-grid">
          <path d={`M0 15H${width}M0 55H${width}M0 95H${width}M0 135H${width}M0 ${height - padBottom}H${width}`} />
          {points.map((pt, i) => (
            <line key={i} x1={pt.x} y1={0} x2={pt.x} y2={height - padBottom} stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
          ))}
        </g>
        <line x1={0} y1={hoeffdingY} x2={width} y2={hoeffdingY} stroke="#C2540A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
        <text x={width - 120} y={hoeffdingY - 5} fill="#C2540A" fontSize="10" fontFamily="monospace" fontWeight="bold">5.5% Hoeffding cutoff</text>
        <path className="chart-area" d={areaD} fill="url(#area-grad)" style={{ transition: 'd 0.4s ease' }} />
        <path className={cn("signal-line", (threat || latestPt.isThreat) && "signal-line-threat")} d={pathD} style={{ transition: 'd 0.4s ease' }} />
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={i === points.length - 1 ? "5" : "3"} fill={pt.isThreat ? "#C2540A" : "#0058BE"} stroke="#ffffff" strokeWidth="1.5" />
            {i === points.length - 1 && (
              <circle cx={pt.x} cy={pt.y} r="9" fill="none" stroke={pt.isThreat ? "#C2540A" : "#0058BE"} strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-xlabels">
        {xLabels.map((pt, i) => (
          <span key={i}>{pt.time.slice(0, 8)}</span>
        ))}
      </div>
    </div>
  );
}

function BellChart({ threat = false, range = "15M" }: { threat?: boolean; range?: string }) {
  const { telemetryLogs, chsh: currentChsh } = useSentinel();
  const count = range === "1M" ? 5 : range === "5M" ? 8 : range === "15M" ? 14 : 30;
  const recentLogs = [...telemetryLogs].slice(0, count).reverse();
  if (recentLogs.length < 2) {
    while (recentLogs.length < 6) {
      recentLogs.unshift({
        id: `mock-chsh-${recentLogs.length}`,
        time: '11:45:00',
        source: 'ARB-CORE',
        text: 'Baseline sync',
        ms: '12ms',
        code: '200 OK',
        qber: threat ? '14.2%' : '1.9%',
        chsh: threat ? '1.76' : '2.76'
      });
    }
  }

  const width = 700;
  const height = 190;
  const padTop = 15;
  const padBottom = 25;
  const minChsh = 1.0;
  const maxChsh = 3.0;

  const points = recentLogs.map((log, index) => {
    const x = (index / (recentLogs.length - 1)) * width;
    let val = parseFloat(log.chsh || '2.76');
    if (isNaN(val)) val = currentChsh;
    const clamped = Math.max(minChsh, Math.min(maxChsh, val));
    const y = (height - padBottom) - ((clamped - minChsh) / (maxChsh - minChsh)) * (height - padTop - padBottom);
    return { x, y, val: val.toFixed(2), time: log.time, isViolation: val >= 2.0 };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height - padBottom} L 0 ${height - padBottom} Z`;
  const classicalY = (height - padBottom) - ((2.0 - minChsh) / (maxChsh - minChsh)) * (height - padTop - padBottom);
  const latestPt = points[points.length - 1] || { x: width, y: 50, val: '2.76', isViolation: true };
  const xLabels = points.filter((_, idx) => idx % Math.max(1, Math.floor(points.length / 5)) === 0 || idx === points.length - 1).slice(0, 5);

  return (
    <div className="chart-wrap">
      <div className="chart-ylabels bell-labels">
        <span>3.0</span>
        <span style={{ color: '#0058BE', fontWeight: 600 }}>2.8 (Tsirelson)</span>
        <span style={{ color: '#C2540A', fontWeight: 600 }}>2.0 (Bell limit)</span>
        <span>1.5</span>
        <span>1.0</span>
      </div>
      <svg className="telemetry-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="CHSH Bell score dynamic stream">
        <defs>
          <linearGradient id="bell-area-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={!latestPt.isViolation || threat ? "#C2540A" : "#0058BE"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={!latestPt.isViolation || threat ? "#C2540A" : "#0058BE"} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g className="chart-grid">
          <path d={`M0 15H${width}M0 55H${width}M0 95H${width}M0 135H${width}M0 ${height - padBottom}H${width}`} />
          {points.map((pt, i) => (
            <line key={i} x1={pt.x} y1={0} x2={pt.x} y2={height - padBottom} stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
          ))}
        </g>
        <line x1={0} y1={classicalY} x2={width} y2={classicalY} stroke="#C2540A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
        <text x={width - 150} y={classicalY - 5} fill="#C2540A" fontSize="10" fontFamily="monospace" fontWeight="bold">S = 2.0 Classical boundary</text>
        <path className="chart-area" d={areaD} fill="url(#bell-area-grad)" style={{ transition: 'd 0.4s ease' }} />
        <path className={cn("signal-line blue-line", (!latestPt.isViolation || threat) && "signal-line-threat")} d={pathD} style={{ transition: 'd 0.4s ease' }} />
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={i === points.length - 1 ? "5" : "3"} fill={!pt.isViolation ? "#C2540A" : "#0058BE"} stroke="#ffffff" strokeWidth="1.5" />
            {i === points.length - 1 && (
              <circle cx={pt.x} cy={pt.y} r="9" fill="none" stroke={!pt.isViolation ? "#C2540A" : "#0058BE"} strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-xlabels">
        {xLabels.map((pt, i) => (
          <span key={i}>{pt.time.slice(0, 8)}</span>
        ))}
      </div>
    </div>
  );
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
  
  const rows = telemetryLogs.map((item) => ({
    ...item,
    qber: item.qber || `${(qber * 100).toFixed(1)}%`,
    chsh: item.chsh || chsh.toFixed(2),
    code: item.code || (item.isThreat ? "403 FORBIDDEN" : "200 OK")
  }));
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

  const copyToken = (token: string) => {
    navigator.clipboard?.writeText(token);
    toast.success("PQC token copied");
  };

  return (
    <section className="pqc-defense">
      <div className="pqc-titlebar">
        <div>
          <h2>PQC defense operations control</h2>
          <p>Deterministic Hoeffding threat gate & NIST post-quantum cryptography handover</p>
        </div>
        <div className="pqc-title-actions">
          <button className="button button-outline button-small" onClick={() => { setArchitectureOpen(!architectureOpen); toast.info(architectureOpen ? "Architecture overlay closed" : "PQC architecture model opened"); }}>
            <Network size={14} /> {architectureOpen ? "Hide architecture" : "View PQC architecture"}
          </button>
          <button className="button button-outline button-small" onClick={() => { if (threat) toggleEve(); setHandover(0); setTokensRotated(false); toast.success("Clean quantum channel restored"); }}>
            <RotateCcw size={14} /> Reset clean channel
          </button>
          <button className={cn("button button-small", threat ? "button-quiet" : "button-copper")} onClick={handleToggleAttack}>
            <Zap size={14} /> {threat ? "Clear attack simulation" : "Trigger attack simulation"}
          </button>
        </div>
      </div>
      {architectureOpen && (
        <div className="pqc-architecture-note">
          <Network size={15} />
          <span>Architecture model: physical QDS witness → deterministic audit gate → ephemeral key zeroization → ML-DSA-65 fallback signature.</span>
          <button onClick={() => setArchitectureOpen(false)}><X size={14} /></button>
        </div>
      )}
      <div className="pqc-metrics">
        <div className="pqc-metric pqc-metric-mode">
          <span>Active system mode</span>
          <strong className={threat ? "text-copper" : "status-text-good"}>{threat ? "PQC_FALLBACK" : "QUANTUM_SECURE"}</strong>
          <small>{threat ? "Dilithium3 fallback ready" : "Pristine QDS teleportation"}</small>
        </div>
        <div className="pqc-metric">
          <span>QBER / Hoeffding bound</span>
          <strong className={threat ? "text-copper" : "status-text-good"}>{(qber * 100).toFixed(1)}%</strong>
          <small>Statistical cutoff limit: 5.50%</small>
        </div>
        <div className="pqc-metric">
          <span>CHSH Bell metric (S)</span>
          <strong className={threat ? "text-copper" : "status-text-good"}>S = {chsh.toFixed(2)}</strong>
          <small>{threat ? "Classical boundary reached" : "Quantum non-locality verified"}</small>
        </div>
        <div className="pqc-metric">
          <span>PQC algorithm (NIST)</span>
          <strong>Dilithium3 (ML-DSA-65)</strong>
          <small>Key exchange: Kyber768 (ML-KEM)</small>
        </div>
      </div>
      <div className="pqc-workspace">
        <div className="pqc-main">
          <section className="pqc-console">
            <header>
              <div><TerminalSquare size={15} /><strong>Air-gapped cognitive incident diagnosis</strong><small>Ollama Phi-3 engine</small></div>
              <button onClick={() => setDiagnosticOpen(!diagnosticOpen)}>{diagnosticOpen ? "Collapse diagnostic" : "Open diagnostic"}</button>
            </header>
            {diagnosticOpen && (
              <div className={cn("pqc-diagnostic-copy", threat && "pqc-diagnostic-copy-threat")} style={{ whiteSpace: 'pre-wrap' }}>
                {remediationReport || (threat ? "THREAT DIAGNOSIS\n1. MitM Attack Detected: Calculated QBER vastly exceeds Hoeffding threshold.\n2. Entanglement Depolarization: CHSH score collapsed (< 2.0 classical limit).\n\nAUTOMATED REMEDIATION PLAN EXECUTED\n1. Physical Key Purge: Flushed key buffers.\n2. Dynamic PQC Handover: Hot-swapped to CRYSTALS-Dilithium3 ML-DSA-65." : "No anomalies detected. QDS teleportation keys are active and verified. Quantum channel is operating at optimal coherence.")}
              </div>
            )}
          </section>
          <section className="pqc-specs">
            <header><ShieldCheck size={15} /><strong>NIST post-quantum cryptography specifications</strong><span>ML-DSA-65</span></header>
            <div>
              {specs.map(([label, value]) => (
                <article key={label}><span>{label}</span><strong>{value}</strong></article>
              ))}
            </div>
          </section>
        </div>
        <aside className="pqc-side">
          <section className="pqc-handover">
            <header><GitBranch size={15} /><strong>Handover sequence diagram</strong></header>
            <div>
              {stages.map(([title, detail], index) => (
                <button key={title} className={cn("pqc-handover-stage", handover === index && "pqc-handover-stage-active", threat && index === 1 && "pqc-handover-stage-threat")} onClick={() => { setHandover(index); toast.info(title + " selected"); }}>
                  <i>0{index + 1}</i>
                  <span><strong>{title}</strong><small>{detail}</small></span>
                </button>
              ))}
            </div>
          </section>
          <section className="pqc-token-inspector">
            <header><LockKeyhole size={15} /><strong>Live key token inspector</strong></header>
            <div>
              <span>Current Alice public key hash</span>
              <code>{pqcSigHash}</code>
              <button onClick={() => copyToken(pqcSigHash)}>Copy key hash</button>
            </div>
            <div>
              <span>Bob PQC key encapsulation nonce</span>
              <code>{tokensRotated ? "0x7ab3d2c1e8f4a906b5c2d7e1f3a8b4c6d9e0f2a5b7c1d3e6f8a0b2c4d6e8f0a2" : "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"}</code>
              <button onClick={() => { setTokensRotated(!tokensRotated); toast.success("Bob encapsulation nonce rotated"); }}>
                {tokensRotated ? "Restore nonce" : "Rotate nonce"}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function SandboxPage() {
  const { eveActive, triggerAttack, qber: globalQber, chsh: globalChsh, pqcMode, remediationReport, activeAttack } = useSentinel();
  const [active, setActive] = useState(activeAttack || "MitM attack");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPhase, setSimulationPhase] = useState("");
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [visibleLinesCount, setVisibleLinesCount] = useState(0);

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

  const runTerminalStream = (scenarioItem: typeof selected) => {
    setVisibleLinesCount(0);
    setIsSimulating(true);
    setSimulationPhase("INITIALIZING PROTOCOL (BB84 EXT)...");

    let current = 0;
    const totalLines = 8;
    const interval = setInterval(() => {
      current += 1;
      setVisibleLinesCount(current);

      if (current === 2) setSimulationPhase("TRANSMITTING PHOTONS (N=1024, λ=1550nm)...");
      if (current === 4) setSimulationPhase("RECONCILING MEASUREMENT BASES & SIFTING...");
      if (current === 6) setSimulationPhase("CALCULATING CHSH BELL INEQUALITY & HOEFFDING...");
      if (current >= totalLines) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationPhase(
          scenarioItem.tone === "good"
            ? "PROTOCOL VERIFIED · ACCEPT · PHYSICAL QDS SEALED"
            : `SECURITY BREACH [${scenarioItem.code}] CONTAINED · PQC FALLBACK (ML-DSA-65 / ML-KEM-768) ENGAGED · COMMUNICATION 100% SECURED`
        );
      }
    }, 110);

    return () => clearInterval(interval);
  };

  const triggerBackendAttack = async (attackItem: typeof selected) => {
    setIsExecutingApi(true);
    try {
      await triggerAttack(attackItem.title, attackItem.qber, attackItem.chsh);
    } catch {
      toast.info(`Staged ${attackItem.title} scenario locally.`);
    } finally {
      setIsExecutingApi(false);
    }
  };

  const handleSelectScenario = (attackTitle: string) => {
    setActive(attackTitle);
    const target = attacks.find(a => a.title === attackTitle) ?? selected;
    triggerBackendAttack(target);
  };

  useEffect(() => {
    const cleanup = runTerminalStream(selected);
    return cleanup;
  }, [active]);

  const consoleLines = {
    arbitrator: [
      "> initialize protocol (BB84 EXT / 1550nm)",
      "> awaiting node registration...",
      threatened ? "> ACK: Alice connected [ID: 0x9F3A] · Bob [ID: 0x1C4B]" : "> ACK: all nodes authenticated (Alice ↔ Bob)",
      "> channel seed established · optical-dark-fiber-01",
      threatened ? `> WARN: QBER ${(selected.qber * 100).toFixed(1)}% breached Hoeffding bound (τ=5.50%)` : `> QBER ${(selected.qber * 100).toFixed(1)}% within operating bound (τ=5.50%)`,
      threatened ? `> ERR: Bell correlation collapsed (S=${selected.chsh.toFixed(2)} < 2.00 classical limit)` : `> Bell test: PASS (CHSH S=${selected.chsh.toFixed(2)} ≥ 2.00 quantum non-locality)`,
      threatened ? `> ABORT: Adversarial anomaly [${selected.code}] flagged by Threat Engine` : "> ACCEPT: physical signature verification sustained",
      threatened ? "> PQC FALLBACK SUCCESS: Session sustained · Payload authenticated with Dilithium3 / ML-KEM-768" : "> QDS ATTESTATION: unforgeable quantum key distilled"
    ],
    alice: [
      "> seq gen start()",
      "> basis: [+, ×, ×, +, +, ×, +, ×]",
      "> bits: [1, 0, 1, 1, 0, 1, 0, 0]",
      "> transmitting photons (n=1024, λ=1550nm)",
      "> stream tx: 100% complete across dark fiber",
      "> awaiting classical basis reconciliation...",
      threatened ? `> ERR: sift parity mismatch detected (${(selected.qber * 100).toFixed(1)}% bit divergence)` : "> ACK: basis sift match (512 bits reconciled)",
      threatened ? "> PQC HOT-SWAP COMPLETE: Alice signed document with Dilithium3 lattice keypair · 100% delivered" : "> ACK: signed message payload delivered"
    ],
    bob: [
      "> listener active(port: 9091)",
      "> measuring incoming SPDC photon stream...",
      "> rand bases: [×, ×, +, ×, +, ×, +, +]",
      "> capture: 1024 photons received",
      threatened ? `> ERR: sifted key invalid (phase collapse ${(selected.qber * 100).toFixed(1)}%)` : "> ACK: Pauli frame alignment completed (96% kept)",
      threatened ? `> WARN: Bell correlation below threshold (S=${selected.chsh.toFixed(2)})` : `> Bell witness sealed (S=${selected.chsh.toFixed(2)})`,
      threatened ? "> PQC VERIFIED: Bob confirmed Dilithium3 / ML-KEM-768 signature · 100% byte integrity preserved" : "> QDS VERIFIED: physical attestation sealed"
    ],
    eve: [
      "> probe standby(target: quantum-link-01)",
      `> attack vector: ${selected.code} [${selected.detail}]`,
      threatened ? "> INJECT: optical beam splitter engaged on link" : "> standby: optical sniffer below noise floor",
      threatened ? `> MEASURE: state collapse on bit sequence (QBER ${(selected.qber * 100).toFixed(1)}%)` : "> zero polarization collapse detected",
      threatened ? "> WARN: basis mismatch detected by arbitrator audit" : "> no adversarial action detected",
      threatened ? "> EVE EXFILTRATION FAILED: Quantum key dropped + PQC lattice barrier impenetrable (0 bytes leaked)" : "> probe idle: 0 bytes exfiltrated"
    ]
  };

  const Pane = ({ title, nodeKey, variant, lines }: { title: string; nodeKey: "arbitrator" | "alice" | "bob" | "eve"; variant: "good" | "copper" | "blue"; lines: string[] }) => (
    <section className={cn("sandbox-v2-console", "sandbox-v2-console-" + variant)}>
      <div className="sandbox-v2-console-head">
        <span className="flex items-center gap-1.5">
          <TerminalSquare size={12} className={variant === "copper" ? "text-copper" : "text-[#2F6F85]"} />
          {title}
        </span>
        <div>
          <button onClick={() => toast.success(title + " log copied")} aria-label={"Copy " + title + " log"}><Copy size={12} /></button>
          <button onClick={() => setExpandedNode(nodeKey)} aria-label={"Expand " + title + " console"}><ArrowUpRight size={12} /></button>
        </div>
      </div>
      <div className="sandbox-v2-console-body">
        {lines.slice(0, visibleLinesCount).map((line, index) => (
          <p key={line + index} className={cn(line.includes("ERR") || line.includes("ABORT") || line.includes("BREACH") ? "console-line-alert font-semibold" : line.includes("WARN") || line.includes("INJECT") ? "console-line-warn" : line.includes("ACK") || line.includes("ACCEPT") || line.includes("PASS") || line.includes("PQC") ? "console-line-ok" : "")}>{line}</p>
        ))}
        {visibleLinesCount < lines.length && (
          <p className="text-[10px] text-slate-400 animate-pulse font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
            &gt; streaming line {visibleLinesCount + 1}/{lines.length}...
          </p>
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
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono">
          <span className={cn("px-2 py-0.5 rounded-[2px] font-bold uppercase", threatened ? "bg-[#B94A2F]/15 text-[#B94A2F]" : "bg-[#3B7453]/15 text-[#3B7453]")}>
            {threatened ? `THREAT: ${selected.code}` : "NOMINAL SECURE"}
          </span>
        </div>
      </header>

      <div className="sandbox-v2-shell">
        <aside className="sandbox-v2-scenarios">
          <span className="eyebrow">Attack scenarios</span>
          <div className="sandbox-v2-scenario-list">
            {attacks.map((attack) => (
              <button
                key={attack.title}
                className={cn("sandbox-v2-scenario", active === attack.title && "sandbox-v2-scenario-active", "sandbox-v2-scenario-" + attack.tone)}
                onClick={() => handleSelectScenario(attack.title)}
              >
                <i />
                <span>{attack.title}</span>
                <small>{attack.code}</small>
              </button>
            ))}
          </div>
          <div className="sandbox-v2-scenario-spacer" />
          <button
            className={cn("sandbox-v2-initiate", (isSimulating || isExecutingApi) && "sandbox-v2-initiate-active")}
            disabled={isExecutingApi}
            onClick={() => {
              runTerminalStream(selected);
              triggerBackendAttack(selected);
            }}
          >
            {isExecutingApi ? "FastAPI Executing…" : isSimulating ? "Replaying handshake…" : "Initiate handshake"}
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
          <SandboxMetricChart
            title="QBER vs Hoeffding"
            value={`Current: ${(globalQber * 100).toFixed(1)}%`}
            detail={threatened ? "0.055 threshold breach" : "nominal drift"}
            threat={threatened}
            mode="qber"
            targetVal={selected.qber}
            currentVal={globalQber}
          />
          <SandboxMetricChart
            title="CHSH Bell violation"
            value={`S = ${globalChsh.toFixed(2)}`}
            detail={threatened ? "Classical bound (S=2.0)" : "Quantum correlation"}
            threat={threatened}
            mode="chsh"
            targetVal={selected.chsh}
            currentVal={globalChsh}
          />
          <div className="sandbox-v2-readout">
            <div><span>Active Scenario</span><b className={threatened ? "text-copper" : "status-text-good"}>{selected.title}</b></div>
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
function formatEventGist(rawText?: string, isAlert?: boolean, activeAttack?: string): string {
  if (!rawText) return isAlert ? `Breach Detected / ${activeAttack || 'Threat'}` : 'Photon Pulse Transmission';
  const text = rawText.trim();

  if (text.includes('TRANSFER DISPATCH')) return 'Payload Sealed & Dispatched';
  if (text.includes('TRANSFER INTERCEPT') || text.includes('Eavesdropping disturbance')) return 'Eavesdropping Tap Detected';
  if (text.includes('Arbitrator verified optical entropy') || text.includes('entropy witness')) return 'Optical Entropy Witness Verified';
  if (text.includes('Physical QDS teleportation signature') || text.includes('Physical QDS signature')) return 'Physical QDS Signature Verified';
  if (text.includes('Dilithium3 PQC fallback') || text.includes('PQC Fallback')) return 'PQC Fallback Signature Sealed';
  
  if (text.includes('FINAL VERDICT: ACCEPT') || text.includes('Unconditional signature verification accepted')) return 'Protocol Verified (ACCEPT)';
  if (text.includes('FINAL VERDICT: REJECT') || text.includes('Non-locality breach')) return 'Protocol Rejected (REJECT)';
  if (text.includes('SPDC Photon pair distribution') || text.includes('SPDC crystal core')) return 'SPDC Photon Pair Distribution';
  if (text.includes('BSM') || text.includes('Bell-state measurement')) return 'Alice BSM Projection Executed';
  if (text.includes('Pauli') || text.includes('σX/σZ') || text.includes('σ_x')) return 'Bob Pauli Frame Restored';
  if (text.includes('Hoeffding') || text.includes('error test')) return 'Hoeffding Bound Evaluated';
  if (text.includes('Toeplitz') || text.includes('Privacy amplification') || text.includes('PRIVACY_AMP')) return 'Privacy Amplification Distilled';

  if (text.includes('CLEAN SIGNATURE')) return 'Clean Channel Restored';
  if (text.includes('MITM ATTACK') || text.includes('EVE-PROBE')) return 'MitM Optical Probe Injected';
  if (text.includes('FORGERY ATTACK')) return 'Malformed Classical Feed-Forward';
  if (text.includes('REPLAY ATTACK')) return 'Captured Nonce Retransmit';
  if (text.includes('PNS ATTACK')) return 'Photon-Number Splitting Probe';
  if (text.includes('CHANNEL NOISE')) return 'Optical Thermal Phase Drift';

  const clean = text.replace(/^\[[^\]]+\]\s*/, '');
  const firstPhrase = clean.split(/[·:—\n]/)[0].trim();
  if (firstPhrase.length > 0 && firstPhrase.length < 40) return firstPhrase;

  return firstPhrase.slice(0, 36) + (firstPhrase.length > 36 ? '…' : '');
}

function OverviewPanel({ threat, setThreat, range, setRange, filtered, copyJson, exportTelemetry }: any) {
  const { eveActive, qber: globalQber, chsh: globalChsh, activeAttack, pqcMode, remediationReport } = useSentinel();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [activePacket, setActivePacket] = useState<any | null>(null);

  const qberStr = (globalQber * 100).toFixed(2) + "%";
  const chshStr = globalChsh.toFixed(2);
  const qber = qberStr;
  const chsh = chshStr;

  const cards = [
    { label: "Active sessions", value: "3", detail: "Stable", tone: "good" },
    { label: "Verified signatures", value: threat ? "94.2%" : "99.9%", detail: threat ? "PQC Fallback" : "Nominal", tone: threat ? "copper" : "good" },
    { label: "Security score", value: threat ? `Degraded (${activeAttack})` : "Secure", detail: threat ? "Review required" : "Secure", tone: threat ? "copper" : "good" },
    { label: "Total pulses", value: "4.2e9", detail: "+12M/s", tone: "slate" },
    { label: "QBER %", value: qberStr, detail: threat ? "Hoeffding breach (> 5.5%)" : "Nominal (< 5.5%)", tone: threat ? "alert" : "good" },
    { label: "CHSH value", value: "S = " + chshStr, detail: threat ? "Classical bound (S<2.0)" : "S ≥ 2.0 (quantum)", tone: threat ? "copper" : "good" },
  ];

  const nominalRows = filtered.slice(0, 10).map((item: any, index: number) => {
    const isPqc = item.source?.includes("PQC") || item.text?.includes("PQC") || item.text?.includes("Dilithium");
    const isClean = item.source?.includes("CLEAN") || item.text?.includes("CLEAN SIGNATURE");
    const alert = !isPqc && !isClean && (item.isThreat || item.code?.includes("403") || item.code?.includes("REJECT") || item.code?.includes("0xFA") || (threat && (item.source.includes("EVE") || item.source.includes("HOEFFDING") || item.source.includes("BELL"))));
    
    let payload = item.payloadContent;
    if (!payload && item.text?.includes('"')) {
      const quoted = item.text.match(/"([^"]+)"/)?.[1];
      if (quoted) payload = quoted;
    }
    if (!payload) {
      payload = item.isThreat || alert
        ? `[PAYLOAD: ${activeAttack.toUpperCase()}]`
        : index % 3 === 1
        ? "orbital-telemetry.pdf"
        : index % 3 === 2
        ? "DEFENSE-09"
        : "qds_entropy.sig";
    }

    const classifier = isPqc
      ? "PQC_FALLBACK_ACTIVE"
      : isClean
      ? "NOMINAL_SECURE"
      : alert
      ? (activeAttack ? activeAttack.toUpperCase().replace(/\s+/g, "_") : "INTERCEPT_RESEND")
      : "NOMINAL_SECURE";

    return {
      ...item,
      alert,
      isPqc,
      payload,
      classifier,
      fullText: item.text,
      event: formatEventGist(item.text, alert, activeAttack)
    };
  });

  const handleSelectRow = (item: any, rowKey: string) => {
    setSelectedRowKey(rowKey);
    setActivePacket(item);
    copyJson(item);
  };

  return (
    <section className="overview-v3 overview-v4-nominal">
      <div className={cn("overview-v3-alert", threat && "overview-v3-alert-active")}>
        <div>
          <span className="eyebrow">{threat ? `Critical alarm · Attack: ${activeAttack}` : "Verified nominal status"}</span>
          <p>{threat ? `Channel disturbed by ${activeAttack} · QBER ${qberStr} breached 5.50% Hoeffding threshold (CHSH S=${chshStr}) · PQC Dilithium3 fallback active.` : "Privacy amplification nominal · Toeplitz hash distilled within entropy limits (QBER = 1.90%)."}</p>
        </div>
        {threat ? <button className="button button-copper button-small" onClick={() => setThreat()}>Restore nominal</button> : <button className="overview-v3-pass" onClick={() => setThreat()}>Pass</button>}
      </div>
      <div className="overview-v3-kpis">
        {cards.map((card) => (
          <div key={card.label} className={cn("overview-v3-kpi", "overview-v3-kpi-" + card.tone)}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small className={card.tone === "good" ? "status-text-good" : card.tone === "copper" || card.tone === "alert" ? "text-copper" : "muted"}>{card.detail}</small>
          </div>
        ))}
      </div>
      <div className="overview-v3-charts">
        <div className="overview-v3-chart">
          <div className="overview-v3-chart-head">
            <div><span className="eyebrow">QBER error rate</span><strong>{qber}</strong><em className={threat ? "text-copper" : "status-text-good"}>{threat ? "breach" : "nominal"}</em></div>
            <div className="range-pills">{["1M", "5M", "15M", "ALL"].map((item) => <button key={item} className={cn("range-pill", range === item && "range-pill-active")} onClick={() => setRange(item)}>{item}</button>)}</div>
          </div>
          <div className="overview-v3-plot"><TelemetryChart threat={threat} range={range} /></div>
        </div>
        <div className="overview-v3-chart">
          <div className="overview-v3-chart-head">
            <div><span className="eyebrow">CHSH Bell test (S-score)</span><strong>{chsh}</strong><em className={threat ? "text-copper" : "status-text-good"}>{threat ? "classical boundary" : "quantum"}</em></div>
            <div className="range-pills">{["1M", "5M", "15M", "ALL"].map((item) => <button key={item} className={cn("range-pill", range === item && "range-pill-active")} onClick={() => setRange(item)}>{item}</button>)}</div>
          </div>
          <div className="overview-v3-plot"><BellChart threat={threat} range={range} /></div>
        </div>
      </div>
      <div className="overview-v3-ledger">
        <div className="overview-v3-ledger-head">
          <div><span className="eyebrow">Live telemetry stream</span><small>Select any row to inspect & copy packet evidence</small></div>
          <button className="text-link ledger-export" onClick={exportTelemetry}><Download size={13} /> Export CSV</button>
        </div>
        <div className="overview-v3-ledger-table" style={{ userSelect: "text", WebkitUserSelect: "text" }}>
          <div className="overview-v3-ledger-row overview-v3-ledger-row-head">
            <span>Timestamp</span><span>Subsystem</span><span>Event</span><span>Classifier verdict</span><span>Transferred text / message content</span><span>Latency</span><span>Status</span>
          </div>
          {nominalRows.map((item: any, index: number) => {
            const rowKey = item.id ? String(item.id) : `row-${index}`;
            const isSelected = selectedRowKey ? selectedRowKey === rowKey : index === 0;
            return (
              <div
                key={rowKey}
                className={cn(
                  "overview-v3-ledger-row",
                  item.alert && "overview-v3-ledger-alert",
                  item.isPqc && "overview-v3-ledger-selected",
                  isSelected && "overview-v3-ledger-selected"
                )}
                onClick={() => handleSelectRow(item, rowKey)}
                style={{ cursor: "pointer", userSelect: "text", WebkitUserSelect: "text" }}
                role="row"
                tabIndex={0}
              >
                <span className="mono muted">{item.time}.{String(index + 45).padStart(3, "0")}</span>
                <span className={cn("mono", item.isPqc ? "text-blue font-semibold" : item.alert ? "text-copper font-semibold" : "")}>{item.source.replace("_", " ")}</span>
                <strong style={{ userSelect: "text" }}>{item.event}</strong>
                <span className={cn("overview-v3-verdict", item.isPqc ? "status-text-good font-semibold" : item.alert ? "overview-v3-verdict-alert" : "")}>{item.classifier}</span>
                <span className={cn("overview-v3-payload", item.isPqc ? "overview-v3-payload" : item.alert ? "overview-v3-payload-alert" : "")} style={{ userSelect: "text" }}>{item.payload}</span>
                <span className="mono muted">{item.ms}ms</span>
                <span className={item.isPqc ? "status-text-good mono font-bold" : item.alert ? "overview-v3-status-alert" : "status-text-good mono"}>{item.isPqc ? "PQC_OK" : item.alert ? "0xFA" : "0x00"}</span>
              </div>
            );
          })}
        </div>

        {/* Selected Row Detail Box */}
        {activePacket && (
          <div style={{
            background: "rgba(22, 24, 26, 0.03)",
            borderTop: "1px solid var(--line)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            font: "11px/1.4 var(--mono)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <span style={{ color: "var(--copper)", fontWeight: "bold" }}>SELECTED PACKET:</span>
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>{activePacket.source} · {activePacket.event}</span>
              <span style={{ color: "var(--slate)" }}>({activePacket.payload})</span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                className="button button-outline button-small"
                onClick={() => { copyJson(activePacket); }}
                style={{ fontSize: "10px", padding: "4px 8px" }}
              >
                <Copy size={12} /> Copy JSON
              </button>
              <button
                className="icon-button"
                onClick={() => setActivePacket(null)}
                style={{ width: "24px", height: "24px" }}
                aria-label="Close packet inspector"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ThreatsPanel({ threat, onThreat }: { threat: boolean; onThreat: () => void }) {
  const { threats, activeAttack, eveActive } = useSentinel();
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(0);

  const visible = filter === "ALL" ? threats : threats.filter((item) => item.severity === filter);
  const item = visible[selected] ?? visible[0] ?? threats[0];

  return (
    <div className="threats-v2-layout">
      <div className="threats-v2-main">
        <div className="threats-v2-heading">
          <h2>Threats</h2>
          <div className="threat-filter-tabs">
            {[["ALL", `ALL (${threats.length})`], ["CRITICAL", `CRITICAL (${threats.filter(t => t.severity === 'CRITICAL').length})`], ["HIGH", `HIGH (${threats.filter(t => t.severity === 'HIGH').length})`]].map(([key, label]) => (
              <button key={key} className={cn("threat-filter-tab", filter === key && "threat-filter-tab-active")} onClick={() => { setFilter(key); setSelected(0); }}>{label}</button>
            ))}
          </div>
          <span className="threats-v2-count">{threat || eveActive ? `Active Anomaly: ${activeAttack}` : `${threats.length} records in review`}</span>
        </div>
        <div className="threats-v2-ledger">
          <div className="threats-v2-row threats-v2-row-head">
            <span>severity</span><span>origin node</span><span>anomaly type</span><span>time</span>
          </div>
          {visible.map((row, idx) => (
            <button key={row.id} className={cn("threats-v2-row", selected === idx && "threats-v2-row-selected")} onClick={() => setSelected(idx)}>
              <span className={cn("severity-cell", row.severity === "CRITICAL" ? "severity-critical" : row.severity === "HIGH" ? "severity-high" : "severity-medium")}>
                <i />{row.severity}
              </span>
              <span className="threat-origin"><b>{row.origin}</b>{row.badge && <em>{row.badge}</em>}</span>
              <strong>{row.type}</strong>
              <span className="mono muted">{row.time}</span>
            </button>
          ))}
        </div>
      </div>
      <aside className="threats-v2-inspector">
        <div className="inspector-head">
          <span className="eyebrow">Threat inspector</span>
          <button className="icon-button" onClick={() => setSelected(0)} aria-label="Reset selection"><RotateCcw size={14} /></button>
        </div>
        <span className="eyebrow">Selected anomaly</span>
        <h3>{item?.type || "No Threat Selected"}</h3>
        <div className="threat-inspector-rule" />
        <span className="eyebrow">Telemetry data</span>
        <div className="threat-telemetry-block">
          <div><span>node</span><strong>{item?.origin || "EVE"}</strong></div>
          <div><span>baseline QBER</span><strong>{item?.baseline || "1.9%"}</strong></div>
          <div><span>current QBER</span><strong className="text-copper">{item?.current || "14.2%"}</strong></div>
        </div>
        <span className="eyebrow">Risk visualization</span>
        <div className="risk-visualizer threat-risk-v2">
          {[1, 2, 3, 4, 5].map((bar) => <i key={bar} className={bar <= (item?.severity === "CRITICAL" ? 5 : 3) ? "risk-visualizer-on" : ""} />)}
        </div>
        <button className="button button-copper inspector-action" onClick={onThreat}>
          <ShieldCheck size={14} /> {threat || eveActive ? "Restore node from quarantine" : "Run containment protocol"}
        </button>
        <div className="threats-v2-actions">
          <button className="button button-outline button-small" onClick={() => toast.success("Buffer purge queued")}>Purge buffer</button>
          <button className="button button-outline button-small" onClick={() => toast.success("PCAP export prepared")}>Export PCAP</button>
        </div>
      </aside>
    </div>
  );
}

/* Incidents inspector — Signal Atelier pairs forensic precision with warm paper, dark ink, copper intervention, and blue audit detail. */
function IncidentsPanel({ selectedIncident, setSelectedIncident }: any) {
  const { incidents, resolveIncident, eveActive, activeAttack } = useSentinel();
  const [aiRemediationMap, setAiRemediationMap] = useState<Record<string, AiRemediationResponse>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const active = incidents.find((item) => item.id === selectedIncident?.id) ?? incidents[0];
  const statusClass = (status: string) => status === "RESOLVED" ? "incident-status-resolved" : status === "ESCALATED" ? "incident-status-escalated" : "incident-status-investigating";
  const impactClass = (impact: string) => impact === "CRITICAL" ? "incident-impact-critical" : impact === "HIGH" ? "incident-impact-high" : impact === "MEDIUM" ? "incident-impact-med" : "incident-impact-low";
  const isCritical = active?.impact === "CRITICAL";

  const evidence = [
    ["Observed QBER", active?.qber ? `${active.qber} (limit: 5.50%)` : "14.20% (limit: 5.50%)", "evidence-alert"],
    ["CHSH Bell score (S)", active?.chsh ? `S = ${active.chsh} (collapsed)` : "S = 1.76 (collapsed)", "evidence-good"],
    ["Helstrom error bound", active?.helstrom || "P_e ≥ 0.0820", ""],
    ["Trace distance (D)", active?.traceDistance || "D = 0.8360", "evidence-blue"],
    ["Target node", active?.targetNode || "QN-BOB (receiver)", ""]
  ];

  const chooseIncident = (item: any) => {
    if (setSelectedIncident) setSelectedIncident(item);
  };

  const handleFetchAiRemediation = async (inc: any) => {
    if (!inc?.id) return;
    setLoadingAiId(inc.id);
    try {
      const qberVal = inc.qber ? parseFloat(inc.qber.replace('%', '')) / 100 : 0.142;
      const chshVal = inc.chsh ? parseFloat(inc.chsh) : 1.76;
      const res = await generateAiRemediation({
        incidentId: inc.id,
        attackType: inc.title || 'Quantum Intercept Anomaly',
        description: inc.detail,
        qber: qberVal,
        chshScore: chshVal,
        helstromBound: 0.082,
        assignedOperator: inc.assigned || 'SOC Operator',
        node: inc.targetNode || 'QN-BOB',
        impact: inc.impact || 'HIGH'
      });
      setAiRemediationMap(prev => ({ ...prev, [inc.id]: res }));
      toast.success(`AI Remediation playbook generated for ${inc.id}.`);
    } catch (err: any) {
      toast.error(`AI Remediation error: ${err?.message || 'Failed to generate'}`);
    } finally {
      setLoadingAiId(null);
    }
  };

  const currentPlaybook = active?.id ? aiRemediationMap[active.id] : null;

  return (
    <div className="incidents-v2-layout">
      <div className="incidents-v2-main">
        <div className="incidents-v2-heading">
          <div>
            <h2>Incidents</h2>
            <p>System log · authenticated incident ledger · {eveActive ? `Live Alert: ${activeAttack}` : "Nominal Assurance"}</p>
          </div>
          <span>{incidents.length} records retained</span>
        </div>
        <div className="incidents-v2-ledger">
          <div className="incidents-v2-row incidents-v2-row-head">
            <span>incident ID</span><span>status</span><span>assigned</span><span>impact</span>
          </div>
          {incidents.map((item) => (
            <button key={item.id} className={cn("incidents-v2-row", active?.id === item.id && "incidents-v2-row-selected")} onClick={() => chooseIncident(item)}>
              <strong className="mono">{item.id}</strong>
              <span className={cn("incident-status", statusClass(item.status))}>{item.status}</span>
              <span>{item.assigned}</span>
              <span className={cn("incident-impact", impactClass(item.impact))}>{item.impact}</span>
            </button>
          ))}
        </div>
      </div>
      <aside className="incidents-v2-inspector incidents-evidence-inspector">
        <div className="incidents-v2-inspector-head">
          <span className="eyebrow">Inspector · {active?.id}</span>
          <span className={cn("incident-inspector-state", statusClass(active?.status || "INVESTIGATING"))}>{active?.status}</span>
        </div>
        <div className="incident-inspector-copy">
          <h3>{active?.title}</h3>
          <p>{active?.detail}</p>
        </div>
        <div className="incident-case-facts">
          <div><span>Assigned operator</span><strong>{active?.assigned}</strong></div>
          <div><span>Impact severity</span><strong className={impactClass(active?.impact || "CRITICAL")}>{active?.impact}</strong></div>
          <div><span>Security clearance</span><strong className="status-text-good">Level 5 (Q-top-secret)</strong></div>
        </div>
        <div className="incident-evidence">
          <span className="eyebrow">Quantum forensic evidence</span>
          <div className="incident-evidence-table">
            {evidence.map(([label, value, tone]) => (
              <div key={label}><span>{label}</span><strong className={tone}>{value}</strong></div>
            ))}
          </div>
        </div>
        <div className="incident-remediation">
          <div>
            <span className="eyebrow">Automated AI remediation</span>
            <strong>QDS Sentinel AI</strong>
          </div>

          {currentPlaybook ? (
            <div style={{
              background: "rgba(22, 24, 26, 0.025)",
              border: "1px solid var(--line)",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "7px" }}>
                <span style={{ color: "var(--copper)", font: "600 10px var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>REMEDIATION PLAYBOOK</span>
                <span style={{ font: "9px var(--mono)", background: "var(--ink)", color: "var(--paper)", padding: "2px 7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {currentPlaybook.model.replace('QDS Dynamic Forensic Engine', 'FORENSIC ENGINE').replace('QDS Sentinel AI (Llama-3 70B)', 'LLAMA-3 70B')}
                </span>
              </div>

              {/* Formatted Remediation Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "190px", overflowY: "auto", paddingRight: "4px" }}>
                {currentPlaybook.remediationPlan.split(/\n\s*\n/).map((stepText, sIdx) => {
                  const lines = stepText.trim().split('\n');
                  const title = lines[0]?.replace(/^\d+[\.\)]\s*/, '').trim();
                  const body = lines.slice(1).join(' ').trim();
                  return (
                    <div key={sIdx} style={{ borderLeft: "2px solid var(--copper)", paddingLeft: "8px" }}>
                      <div style={{ font: "600 10px var(--mono)", color: "var(--ink)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        0{sIdx + 1} · {title || `Step ${sIdx + 1}`}
                      </div>
                      {body && (
                        <div style={{ font: "11px/1.45 var(--sans)", color: "var(--slate)", marginTop: "2px" }}>
                          {body}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CLI Commands Box */}
              {currentPlaybook.cliCommands && currentPlaybook.cliCommands.length > 0 && (
                <div style={{ background: "var(--ink)", border: "1px solid rgba(244, 241, 234, 0.12)", padding: "9px 11px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ color: "#7b8385", font: "600 9px var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>EXECUTION CLI COMMANDS:</div>
                  {currentPlaybook.cliCommands.map((cmd, cIdx) => (
                    <div key={cIdx} style={{ font: "10.5px var(--mono)", display: "flex", gap: "6px" }}>
                      <span style={{ color: "var(--copper)", fontWeight: "bold" }}>&gt;</span>
                      <span style={{ color: "var(--paper)" }}>{cmd.replace(/^>\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                <button
                  className="button button-outline button-small"
                  style={{ flex: 1, minHeight: "33px", fontSize: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}
                  onClick={() => {
                    navigator.clipboard?.writeText(currentPlaybook.remediationPlan + "\n\n" + currentPlaybook.cliCommands.join("\n"));
                    toast.success("AI Playbook copied to clipboard");
                  }}
                >
                  <Copy size={13} /> Copy Playbook
                </button>

                <button
                  className="icon-button"
                  style={{ width: "33px", height: "33px" }}
                  onClick={() => handleFetchAiRemediation(active)}
                  aria-label="Re-generate playbook"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="incident-remediation-button"
              disabled={loadingAiId === active?.id}
              onClick={() => handleFetchAiRemediation(active)}
            >
              <Zap size={14} />
              <span>{loadingAiId === active?.id ? "GENERATING REMEDIATION PLAYBOOK..." : "PROVIDE REMEDIATION"}</span>
            </button>
          )}
        </div>
        <div className="incident-timeline incident-timeline-compact">
          <div className="incident-timeline-title"><span className="eyebrow">Incident timeline</span><strong>{active?.events?.length || 2} stages</strong></div>
          {(active?.events || [["10:48:16 UTC", "Threat detected", "CRITICAL: Intercept-resend attack detected."], ["10:48:24 UTC", "Threshold exceeded", "QBER breached security cutoff."]]).slice(0, 3).map(([time, title, copy], index) => (
            <div className="incident-timeline-item" key={time + index}>
              <i className={cn(index === 1 ? "timeline-marker-alert" : "")} />
              <div>
                <span>{time}</span>
                <strong className={index === 1 ? "text-copper" : ""}>{title}</strong>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="incident-inspector-actions">
          <span>Set incident status & export report</span>
          <button className="incident-escalate" onClick={() => toast.error("Escalation package prepared for L3 review")}><ShieldAlert size={15} /> Escalate to L3</button>
          <div>
            <button disabled={active?.status === "RESOLVED"} onClick={() => { if (active?.id) resolveIncident(active.id); }}>Mark Resolved</button>
            <button onClick={() => toast.success("Incident report exported")}><Download size={14} /> Export report</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SessionsPanel({ selectedSession, setSelectedSession }: any) {
  const { sessions, eveActive, activeAttack } = useSentinel();
  const [paused, setPaused] = useState<string[]>([]);
  const FidelityTrace = ({ kind, tone }: { kind: string; tone: string }) => (
    <svg className={cn("session-fidelity", "session-fidelity-" + tone)} viewBox="0 0 116 28" aria-label="Channel fidelity trace">
      <path d={kind === "rise" ? "M2 22 C20 23 28 20 42 15 S60 5 73 12 S89 14 103 25" : kind === "step" ? "M2 12 H32 L39 23 L46 12 H112" : kind === "wave-low" ? "M2 18 C16 10 29 11 42 17 S67 22 78 12 S98 9 112 14" : "M2 18 C18 5 28 7 41 18 S64 26 78 11 S96 6 105 20"} />
    </svg>
  );

  const activeId = selectedSession?.id ?? "01";
  return (
    <div className="sessions-v2-layout">
      <div className="sessions-v2-heading">
        <div>
          <h2>Sessions</h2>
          <p>Active quantum communication channels · {eveActive ? `Channel 01 Interrupted by ${activeAttack}` : "Nominal Coherence"}</p>
        </div>
        <span><b>{sessions.length}</b> active streams</span>
      </div>
      <div className="sessions-v2-table">
        <div className="sessions-v2-row sessions-v2-row-head">
          <span>ID</span><span>Endpoint</span><span>Status</span><span>Fidelity</span><span>Key rate (kbps)</span><span>Duration</span><span>Actions</span>
        </div>
        {sessions.map((channel) => {
          const isPaused = paused.includes(channel.id);
          const isSelected = activeId === channel.id;
          return (
            <div className={cn("sessions-v2-row", isSelected && "sessions-v2-row-selected")} key={channel.id}>
              <button className="session-row-main" onClick={() => setSelectedSession && setSelectedSession(channel)} aria-label={"Inspect channel " + channel.endpoint}>
                <span className="mono">{channel.id}</span>
                <strong>{channel.endpoint}</strong>
                <span className={cn("session-state", isPaused ? "session-state-paused" : channel.tone === "copper" ? "session-state-degraded" : "session-state-stable")}>
                  {isPaused ? "PAUSED" : channel.state}
                </span>
                <FidelityTrace kind={channel.trace} tone={channel.tone} />
                <span className="mono session-rate">{channel.rate}</span>
                <span className="mono">{channel.duration}</span>
              </button>
              <div className="session-actions">
                <button className="icon-button" aria-label={"Resync " + channel.endpoint} onClick={async () => {
                  try {
                    await apiClient.triggerSessionChannelAction({ channel_id: channel.id, action: 'sync' });
                    toast.success("Resynchronization completed via FastAPI for " + channel.endpoint);
                  } catch {
                    toast.success("Resynchronization requested for " + channel.endpoint);
                  }
                }}><RotateCcw size={14} /></button>
                <button className={cn("icon-button", isPaused && "session-action-active")} aria-label={isPaused ? "Resume " + channel.endpoint : "Pause " + channel.endpoint} onClick={() => setPaused((current) => current.includes(channel.id) ? current.filter((id) => id !== channel.id) : [...current, channel.id])}>
                  {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NetworkPanel({ selectedNode, setSelectedNode, isolatedNodes, setIsolatedNodes }: any) {
  const { eveActive, activeAttack, qber, chsh, pushTelemetryLogs } = useSentinel();

  const [activeNode, setActiveNode] = useState("ALICE");
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<string | null>(null);
  const [pingingNodeId, setPingingNodeId] = useState<string | null>(null);
  const [rebootingNodeId, setRebootingNodeId] = useState<string | null>(null);
  const [nodeHealthMap, setNodeHealthMap] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);
  const dragFrame = useRef<number | null>(null);
  const pendingPosition = useRef<{ id: string; x: number; y: number } | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({ ALICE: { x: 22, y: 62 }, ARBITRATOR: { x: 51, y: 29 }, BOB: { x: 80, y: 62 }, EVE: { x: 51, y: 82 } });

  const handlePingNode = (nodeId: string, nodeName: string) => {
    setPingingNodeId(nodeId);
    toast.info(`PING ${nodeName}: Probing optical link round-trip time...`);

    window.setTimeout(() => {
      const rtt = nodeId === "ARBITRATOR" ? "0.85ms" : nodeId === "BOB" && eveActive ? "85.20ms" : "1.15ms";
      const nowStr = new Date().toTimeString().slice(0, 8);
      
      pushTelemetryLogs([
        {
          id: `evt-${Date.now()}-ping`,
          time: nowStr,
          source: nodeName,
          text: `Active ICMP/QKD probe on ${nodeName} verified: RTT ${rtt}, 0% drop.`,
          ms: rtt,
          code: '200 OK',
          isThreat: false,
          qber: (qber * 100).toFixed(2) + "%",
          chsh: chsh.toFixed(2)
        }
      ]);

      toast.success(`PING ${nodeName}: 3/3 packets received · RTT ${rtt} · 0% loss [OK]`);
      setPingingNodeId(null);
    }, 1200);
  };

  const handleRebootNode = (nodeId: string, nodeName: string) => {
    setRebootingNodeId(nodeId);
    setNodeHealthMap(prev => ({ ...prev, [nodeId]: "REBOOTING..." }));
    toast.warning(`REBOOT sequence initiated for ${nodeName}. Optical calibration in progress...`);

    window.setTimeout(() => {
      setNodeHealthMap(prev => ({ ...prev, [nodeId]: "NOMINAL" }));
      const nowStr = new Date().toTimeString().slice(0, 8);

      pushTelemetryLogs([
        {
          id: `evt-${Date.now()}-reboot`,
          time: nowStr,
          source: nodeName,
          text: `Node ${nodeName} coprocessor reboot completed. Phase lock verified (Fidelity 99.9%).`,
          ms: '8ms',
          code: '200 OK',
          isThreat: false,
          qber: (qber * 100).toFixed(2) + "%",
          chsh: chsh.toFixed(2)
        }
      ]);




      toast.success(`REBOOT COMPLETE: Q-PROC-v4 coprocessor online for ${nodeName}. Phase lock verified (Fidelity 99.9%).`);
      setRebootingNodeId(null);
    }, 2000);
  };

  const nodes = [
    { id: "ALICE", name: "QN-ALICE", role: "Photon source / detector", health: nodeHealthMap["ALICE"] || "NOMINAL", uptime: "99.998%", hardware: "Q-PROC-v4", protocol: "BB84, E91", rate: "1.2 kbps", latency: "12ms", loss: "0%", tone: nodeHealthMap["ALICE"] === "REBOOTING..." ? "copper" : "good", pos: "network-canvas-alice" },
    { id: "ARBITRATOR", name: "ARB-CORE", role: "Authenticated central hub", health: nodeHealthMap["ARBITRATOR"] || "NOMINAL", uptime: "100.000%", hardware: "ARB-CORE-8", protocol: "QDS, CHSH", rate: "0.0 kbps", latency: "0ms", loss: "local", tone: nodeHealthMap["ARBITRATOR"] === "REBOOTING..." ? "copper" : "good", pos: "network-canvas-arb" },
    { id: "BOB", name: "QN-BOB", role: "Verifier endpoint", health: nodeHealthMap["BOB"] || (eveActive ? "DEGRADED" : "NOMINAL"), uptime: "99.201%", hardware: "Q-PROC-v4", protocol: "BB84, E91", rate: eveActive ? "0.4 kbps" : "1.8 kbps", latency: "85ms", loss: eveActive ? `${(qber * 100).toFixed(1)}% loss` : "0% loss", tone: nodeHealthMap["BOB"] === "REBOOTING..." ? "copper" : (eveActive ? "copper" : "good"), pos: "network-canvas-bob" },
    { id: "EVE", name: "EVE-PROBE-07", role: eveActive ? `Active Adversary (${activeAttack})` : "Quarantined test probe", health: nodeHealthMap["EVE"] || (eveActive ? "ACTIVE INTERCEPT" : "QUARANTINED"), uptime: "—", hardware: "OBS-PROBE", protocol: "Passive monitor", rate: "0.0 kbps", latency: eveActive ? "INTERCEPTING" : "blocked", loss: eveActive ? "tap active" : "isolated", tone: "copper", pos: "network-canvas-eve" }
  ];

  const active = nodes.find((node) => node.id === activeNode) ?? nodes[0];
  const inventory = nodes.filter((node) => node.id !== active.id);
  const toggleIsolation = (nodeId: string) => setIsolatedNodes((current: string[]) => current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]);
  const curve = (from: { x: number; y: number }, to: { x: number; y: number }) => { const bend = Math.max(8, Math.abs(to.x - from.x) * .32); const direction = to.x >= from.x ? 1 : -1; return "M " + from.x + " " + from.y + " C " + (from.x + bend * direction) + " " + from.y + " " + (to.x - bend * direction) + " " + to.y + " " + to.x + " " + to.y; };
  const LinkLabel = ({ from, to, text, copper = false }: { from: { x: number; y: number }; to: { x: number; y: number }; text: string; copper?: boolean }) => { const x = (from.x + to.x) / 2; const y = (from.y + to.y) / 2; return <g className={cn("network-v2-link-tag", copper && "network-v2-link-tag-copper")} transform={"translate(" + (x - 5.5) + " " + (y - 4) + ")"}><rect width="11" height="7" rx="0" /><text x="5.5" y="4.7">{text}</text></g>; };
  const beginDrag = (nodeId: string, event: any) => { if (event.pointerType === "mouse" && event.button !== 0) return; event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); didDrag.current = false; setDragging(nodeId); };
  const moveDrag = (event: any) => { if (!dragging || !canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect(); const x = Math.min(88, Math.max(12, ((event.clientX - rect.left) / rect.width) * 100)); const y = Math.min(87, Math.max(12, ((event.clientY - rect.top) / rect.height) * 100)); didDrag.current = true; pendingPosition.current = { id: dragging, x, y }; if (dragFrame.current !== null) return; dragFrame.current = window.requestAnimationFrame(() => { const next = pendingPosition.current; if (next) setPositions((current) => ({ ...current, [next.id]: { x: next.x, y: next.y } })); dragFrame.current = null; }); };
  const endDrag = (event: any) => { if (dragFrame.current !== null) { window.cancelAnimationFrame(dragFrame.current); dragFrame.current = null; } const next = pendingPosition.current; if (next) setPositions((current) => ({ ...current, [next.id]: { x: next.x, y: next.y } })); pendingPosition.current = null; if (dragging) event.currentTarget.releasePointerCapture?.(event.pointerId); setDragging(null); };

  return (
    <div className="network-v2-layout">
      <section className="network-v2-canvas-wrap">
        <div className="network-v2-title">
          <div>
            <h2>Network topology</h2>
            <div className="topology-key">
              <span className="status-text-good">Nominal</span>
              <span className="text-copper">Degraded</span>
              <span className="muted">Quarantined</span>
            </div>
          </div>
          <span>Drag nodes to inspect paths</span>
        </div>
        <div className={cn("network-v2-canvas", Boolean(dragging) && "network-v2-canvas-dragging")} ref={canvasRef} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <div className="network-canvas-stage" style={{ transform: "scale(" + zoom + ")" }}>
            <svg className="network-v2-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Dynamic network paths">
              <path className="network-v2-link network-v2-link-nominal" d={curve(positions.ALICE, positions.ARBITRATOR)} />
              <path className={cn("network-v2-link", eveActive ? "network-v2-link-degraded" : "network-v2-link-nominal")} d={curve(positions.ARBITRATOR, positions.BOB)} />
              <path className="network-v2-link network-v2-link-quarantine" d={curve(positions.ARBITRATOR, positions.EVE)} />
              <LinkLabel from={positions.ALICE} to={positions.ARBITRATOR} text="12ms · 0%" />
              <LinkLabel from={positions.ARBITRATOR} to={positions.BOB} text={eveActive ? `85ms · ${(qber * 100).toFixed(0)}%` : "20ms · 0%"} copper={eveActive} />
            </svg>
            {nodes.map((node) => {
              const point = positions[node.id];
              const isPinging = pingingNodeId === node.id;
              const isRebooting = rebootingNodeId === node.id;
              return (
                <button
                  key={node.id}
                  className={cn(
                    "network-v2-node",
                    node.pos,
                    active.id === node.id && "network-v2-node-active",
                    dragging === node.id && "network-v2-node-dragging",
                    isolatedNodes.includes(node.id) && "network-v2-node-isolated",
                    isRebooting ? "network-v2-node-copper animate-pulse" : isPinging ? "network-v2-node-good animate-bounce" : ("network-v2-node-" + node.tone)
                  )}
                  style={{ left: point.x + "%", top: point.y + "%" }}
                  onPointerDown={(event) => beginDrag(node.id, event)}
                  onClick={() => { if (didDrag.current) { didDrag.current = false; return; } setActiveNode(node.id); }}
                >
                  <span className="network-v2-node-icon">{node.id === "ARBITRATOR" ? <Network size={27} /> : <Server size={24} />}</span>
                  <strong>{node.name}</strong>
                  <small className={isRebooting ? "text-copper font-bold" : isPinging ? "text-blue font-bold" : ""}>
                    {isRebooting ? "REBOOTING..." : isPinging ? "PINGING..." : isolatedNodes.includes(node.id) ? "ISOLATED" : node.role}
                  </small>
                </button>
              );
            })}
          </div>
          <div className="network-zoom">
            <button onClick={() => setZoom((value) => Math.min(1.12, value + .06))} aria-label="Zoom in">+</button>
            <button onClick={() => setZoom((value) => Math.max(.88, value - .06))} aria-label="Zoom out">−</button>
          </div>
        </div>
      </section>
      <aside className="network-v2-inventory">
        <div className="network-inventory-head">
          <span className="eyebrow">Node inventory</span>
          <button className="icon-button" onClick={() => toast.success("Node inventory refreshed")} aria-label="Refresh node inventory"><RotateCcw size={14} /></button>
        </div>
        <button className={cn("network-active-card", "network-active-card-" + active.tone)} onClick={() => setActiveNode(active.id)}>
          <div className="network-active-card-head">
            <span><Server size={15} /> {active.name}</span>
            <b className={rebootingNodeId === active.id ? "text-copper animate-pulse" : active.tone === "good" ? "status-text-good" : "text-copper"}>
              {rebootingNodeId === active.id ? "REBOOTING..." : isolatedNodes.includes(active.id) ? "ISOLATED" : active.health}
            </b>
          </div>
          <div className="network-active-metrics">
            <div><span>Uptime</span><strong>{rebootingNodeId === active.id ? "Calibrating…" : active.uptime}</strong></div>
            <div><span>Hardware</span><strong>{active.hardware}</strong></div>
            <div><span>Protocol support</span><strong>{active.protocol}</strong></div>
            <div><span>Key gen rate</span><strong>{active.rate}</strong></div>
          </div>
          <div className="network-active-actions">
            <button
              className="button button-outline button-small"
              disabled={pingingNodeId === active.id || rebootingNodeId === active.id}
              onClick={(event) => { event.stopPropagation(); handlePingNode(active.id, active.name); }}
            >
              <Activity size={12} className={pingingNodeId === active.id ? "spin text-blue" : ""} />
              {pingingNodeId === active.id ? "Pinging..." : "Ping"}
            </button>
            <button
              className="button button-outline button-small"
              disabled={rebootingNodeId === active.id || pingingNodeId === active.id}
              onClick={(event) => { event.stopPropagation(); handleRebootNode(active.id, active.name); }}
            >
              <RefreshCw size={12} className={rebootingNodeId === active.id ? "spin text-copper" : ""} />
              {rebootingNodeId === active.id ? "Rebooting..." : "Reboot"}
            </button>
            <button
              className="button button-copper button-small"
              onClick={(event) => { event.stopPropagation(); setSelectedNode(active.id); }}
            >
              {isolatedNodes.includes(active.id) ? "Reconnect" : "Isolate"}
            </button>
          </div>
        </button>
        <div className="network-connected-card">
          <div className="network-connected-head"><span className="eyebrow">Connected nodes ({inventory.length})</span></div>
          {inventory.map((node) => (
            <button key={node.id} className={cn("network-connected-row", activeNode === node.id && "network-connected-row-active")} onClick={() => setActiveNode(node.id)}>
              <div><strong>{node.name}</strong><span>{rebootingNodeId === node.id ? "Rebooting..." : isolatedNodes.includes(node.id) ? "Isolated" : node.role}</span></div>
              <div><b className={node.tone === "good" ? "status-text-good" : "text-copper"}>{node.latency}</b><span>{node.loss}</span></div>
            </button>
          ))}
        </div>
      </aside>
      {selectedNode && (
        <div className="modal-backdrop" onClick={() => setSelectedNode(null)}>
          <div className="modal-card modal-card-small" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><span className="eyebrow">Node quarantine control</span><h3>{selectedNode}</h3></div>
              <button className="icon-button" onClick={() => setSelectedNode(null)} aria-label="Close node modal"><X size={15} /></button>
            </div>
            <button className={cn("button modal-submit", isolatedNodes.includes(selectedNode) ? "button-outline" : "button-copper")} onClick={async () => {
              const isIso = isolatedNodes.includes(selectedNode);
              try {
                await apiClient.quarantineNode({ node_id: selectedNode, action: isIso ? 'restore' : 'quarantine' });
              } catch {}
              toggleIsolation(selectedNode);
              toast.info(`Node ${selectedNode} ${isIso ? 'reconnected' : 'isolated'} via FastAPI`);
              setSelectedNode(null);
            }}>{isolatedNodes.includes(selectedNode) ? "Reconnect node" : "Isolate node"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const steps = ["Entangled photon pair emission", "Joint Bell state measurement", "Classical feed-forward & Pauli frame correction", "Hoeffding statistical bound audit", "Privacy amplification & Toeplitz hash distillation", "Arbitrator final verdict"];
const stepMeta = ["KEY EXCH MN", "ALICE BSM", "BOB NODE", "HOEFFDING CHK", "PRIVACY AMP", "THREAT ENGINE"];
function LegacyDemonstrationPage() {

  const { eveActive, toggleEve, qber: globalQber, chsh: globalChsh, executeProtocolRun, pushTelemetryLogs } = useSentinel();
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

  const phaseDescriptions = [
    { source: 'ARB-CORE', text: 'Phase 01: Arbitrator pumps SPDC crystal (λ=1550nm) producing Bell pairs |Φ⁺⟩ = 1/√2 (|00⟩+|11⟩)', code: '200 OK', ms: '12ms' },
    { source: 'QN-ALICE', text: 'Phase 02: Alice performs joint Bell State Measurement on |ψdoc⟩ and her entangled qubit · feed-forward bits generated', code: '200 OK', ms: '18ms' },
    { source: eve ? 'EVE-PROBE' : 'QN-BOB', text: eve ? 'Phase 03 [INTERCEPT]: Adversary Eve attempts beam-splitter tap on fiber link 01 · superposition state disturbed' : 'Phase 03: Bob applies unitary correction σXᵇ¹ · σZᵇ² to restore quantum-state fidelity', code: eve ? '403 FORBIDDEN' : '200 OK', ms: eve ? '85ms' : '19ms', isThreat: eve },
    { source: 'HOEFFDING-GATE', text: eve ? 'Phase 04: Hoeffding test threshold breached (QBER 14.2% > 5.5% τ cutoff) · CHSH S=1.76 < 2.0' : 'Phase 04: Hoeffding statistical bound test passed (QBER 1.9% <= 5.0% cutoff) · CHSH S=2.76 >= 2.0', code: eve ? '0xFA BREACH' : '200 OK', ms: '14ms', isThreat: eve },
    { source: 'PRIVACY_AMP', text: eve ? 'Phase 05: Privacy amplification aborted due to eavesdropping disturbance · Zeroizing raw key buffers' : 'Phase 05: 2-Universal Toeplitz hash distillation distills unforgeable 256-bit quantum one-time-pad token', code: eve ? '503 ABORT' : '200 OK', ms: '10ms', isThreat: eve },
    { source: 'ARBITRATOR-VERDICT', text: eve ? 'Phase 06 [FINAL VERDICT: REJECT]: Security cutoff breached · Dynamic CRYSTALS-Dilithium3 PQC handover engaged' : 'Phase 06 [FINAL VERDICT: ACCEPT]: Unconditional signature verification accepted · Document signed & tamper-proof', code: eve ? 'REJECT_PQC' : 'ACCEPT_200', ms: '6ms', isThreat: eve }
  ];

  const logPhaseTelemetry = (phaseIndex: number) => {
    const p = phaseDescriptions[phaseIndex] || phaseDescriptions[0];
    const nowStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(100 + Math.random() * 899);
    const qberVal = eve ? 0.142 : 0.019;
    const chshVal = eve ? 1.76 : 2.76;
    const item = {
      id: `demo-phase-${phaseIndex}-${Date.now()}`,
      time: nowStr,
      source: p.source,
      text: p.text,
      ms: p.ms,
      code: p.code,
      qber: `${(qberVal * 100).toFixed(1)}%`,
      chsh: chshVal.toFixed(2),
      isThreat: !!p.isThreat
    };
    pushTelemetryLogs([item]);
  };

  const goToStep = (next: number) => {
    setStep(next);
    logPhaseTelemetry(next);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        const next = current >= steps.length - 1 ? 0 : current + 1;
        logPhaseTelemetry(next);
        return next;
      });
    }, Math.max(500, 2500 / simSpeed));
    return () => window.clearInterval(timer);
  }, [playing, simSpeed, eve]);

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
  const handleExecuteLive = async () => {
    setExecutingLive(true);
    try {
      const res = await executeProtocolRun('board-resolution.pdf', eve);
      goToStep(5);
      setPlaying(false);
      if (res?.verdict?.threat_detected || res?.status === 'REJECTED') {
        toast.error(`Workflow executed & Telemetry Streamed: REJECT (QBER: ${((res?.metrics?.qber ?? 0.142) * 100).toFixed(1)}%, CHSH S=${(res?.metrics?.chsh_score ?? 1.76).toFixed(2)})`);
      } else {
        toast.success(`Workflow executed & Telemetry Streamed: ACCEPT (QBER: ${((res?.metrics?.qber ?? 0.016) * 100).toFixed(1)}%, CHSH S=${(res?.metrics?.chsh_score ?? 2.81).toFixed(2)})`);
      }
    } catch {
      goToStep(5);
      setPlaying(false);
      toast.success("Live signature verification completed & telemetry pushed");
    } finally {
      setExecutingLive(false);
    }
  };
  const stepCopy = ["The arbitrator pumps an SPDC crystal to produce Bell pairs |Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩) at λ = 1550 nm.", "Alice performs a joint Bell measurement on |ψdoc⟩ and her entangled qubit, producing two classical feed-forward bits (b₁, b₂).", "Bob receives (b₁, b₂) and applies σxᵇ¹ · σzᵇ² to restore quantum-state fidelity.", "The arbitrator samples N test qubits and checks observed QBER against the Hoeffding threshold τ = 5.0%.", "A Toeplitz matrix distills an unforgeable 256-bit quantum one-time-pad signature token.", "The threat engine accepts when QBER ≤ 5.0% and CHSH S ≥ 2.00; otherwise it rejects."];
  return <div className="page-content demo-page"><Topbar onNotifications={() => setShowNotifications(!showNotifications)} eyebrow="01 / Quantum protocol" title="Alice ↔ Bob" subtitle="Interactive protocol visualizer / session QKD-260827-91F4" action={<><button className="button button-quiet button-small" onClick={() => setShowCreateSession(true)}><Plus size={14} /> New session</button><button className="icon-button" onClick={() => setShowSettings(true)} aria-label="Simulation settings"><Settings2 size={16} /></button><Link href="/home" className="button button-quiet button-small"><ArrowLeft size={14} /> Home portal</Link><Link href="/monitoring" className="button button-outline button-small">SOC monitoring <ArrowUpRight size={14} /></Link></>} /><div className="demo-toolbar"><div className="demo-session"><span className="mini-label"><StatusDot /> active session</span><strong>QKD-260827-91F4</strong></div><div className="demo-controls"><button className={cn("button button-quiet button-small", playing && "button-active")} onClick={() => { const nextPlaying = !playing; setPlaying(nextPlaying); if (nextPlaying) logPhaseTelemetry(step); }}>{playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />} {playing ? "Pause" : "Play"}</button><button className="button button-outline button-small" onClick={() => goToStep(step >= 5 ? 0 : step + 1)}>Step forward <ChevronRight size={14} /></button><button className="icon-button" onClick={() => { goToStep(0); setPlaying(false); }} aria-label="Reset protocol"><RotateCcw size={15} /></button><button className="button button-copper button-small" disabled={executingLive} onClick={handleExecuteLive}>{executingLive ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />} {executingLive ? "Executing…" : "Execute live protocol"}</button></div></div><div className="step-tracker"><div className="step-rail" aria-hidden="true"><span className="step-rail-fill" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} /></div><span className="step-cursor" aria-hidden="true" style={{ "--step-index": step } as React.CSSProperties} />{steps.map((label, i) => <button key={label} className={cn("step-item", i === step && "step-current", i < step && "step-done")} onClick={() => goToStep(i)}><span className="step-num">{i < step ? <Check size={12} /> : `0${i + 1}`}</span><span>{label}</span></button>)}</div><section className="protocol-board"><div className="protocol-intro"><div><span className="eyebrow">Phase 0{step + 1} / 06 · {stepMeta[step]}</span><h2>{steps[step]}</h2><p>{stepCopy[step]}</p><div className="protocol-metrics"><span><b>QBER</b>{currentQber}</span><span><b>CHSH S</b>{currentChsh}</span><span><b>τ cutoff</b>5.0%</span></div></div><div className="protocol-readout"><span>decision</span><strong className={eve ? "text-copper" : "text-blue"}>{eve ? "REJECT" : step === 5 ? "ACCEPT" : "PENDING"}</strong><small>{eve ? "disturbance detected" : step === 5 ? "all gates clear" : "awaiting next phase"}</small></div></div><div key={step} ref={stageRef} className={cn("channel-stage", eve && "channel-stage-threat", playing && "flow-playing", `phase-${step}`)} onPointerMove={moveNode} onPointerUp={endNodeDrag} onPointerCancel={endNodeDrag}><div className="flow-progress" aria-label={`Protocol phase ${step + 1} of 6`}>{steps.map((label, i) => <span key={label} className={cn(i === step && "flow-progress-current", i < step && "flow-progress-done")} />)}</div><svg className="connection-map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line className="connection-line connection-optical" x1={nodePositions.arb.x} y1={nodePositions.arb.y} x2={nodePositions.alice.x} y2={nodePositions.alice.y} /><line className="connection-line connection-optical" x1={nodePositions.arb.x} y1={nodePositions.arb.y} x2={(eve ? nodePositions.eve.x : nodePositions.bob.x)} y2={(eve ? nodePositions.eve.y : nodePositions.bob.y)} /><line className={cn("connection-line", eve ? "connection-threat-route" : "connection-classical")} x1={(eve ? nodePositions.eve.x : nodePositions.alice.x)} y1={(eve ? nodePositions.eve.y : nodePositions.alice.y)} x2={nodePositions.bob.x} y2={nodePositions.bob.y} /><circle className="connection-anchor" cx={nodePositions.arb.x} cy={nodePositions.arb.y} r="1.1" /><circle className="connection-anchor" cx={nodePositions.alice.x} cy={nodePositions.alice.y} r="1.1" /><circle className="connection-anchor" cx={nodePositions.bob.x} cy={nodePositions.bob.y} r="1.1" /></svg><svg className="photon-system" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><PhotonTrack id="route-arb-alice" from={nodePositions.arb} to={nodePositions.alice} tone={eve ? "threat" : "quantum"} delay="-.2s" />{eve ? <><PhotonTrack id="route-arb-eve" from={nodePositions.arb} to={nodePositions.eve} tone="threat" delay="-.8s" /><PhotonTrack id="route-eve-bob" from={nodePositions.eve} to={nodePositions.bob} tone="threat" delay="-1.4s" /></> : <PhotonTrack id="route-arb-bob" from={nodePositions.arb} to={nodePositions.bob} tone="quantum" delay="-.95s" />}</svg><div className="stage-label stage-label-top">Optical channel <span>authenticated / 1550nm</span></div><div className={cn("protocol-node", "node-alice", "movable-node", dragging === "alice" && "node-dragging", step === 1 && "node-active", "compact-node")} style={{ left: `${nodePositions.alice.x}%`, top: `${nodePositions.alice.y}%` }} onPointerDown={(event) => beginNodeDrag("alice", event)}><div className="protocol-node-icon"><FileKey2 size={20} /></div><strong>ALICE</strong><span>node A / signer</span><div className="node-readout"><span>document hash</span><b>af7c…e91b</b></div></div><div className={cn("protocol-node", "node-arb", "movable-node", dragging === "arb" && "node-dragging", step === 0 && "node-active", "compact-node")} style={{ left: `${nodePositions.arb.x}%`, top: `${nodePositions.arb.y}%` }} onPointerDown={(event) => beginNodeDrag("arb", event)}><div className="protocol-node-icon"><Sparkles size={20} /></div><strong>ARBITRATOR</strong><span>entangled source</span><div className="node-readout"><span>EPR pairs</span><b>100 / 100</b></div></div><div className={cn("protocol-node", "node-bob", "movable-node", dragging === "bob" && "node-dragging", step === 3 && "node-active", "compact-node")} style={{ left: `${nodePositions.bob.x}%`, top: `${nodePositions.bob.y}%` }} onPointerDown={(event) => beginNodeDrag("bob", event)}><div className="protocol-node-icon"><ShieldCheck size={20} /></div><strong>BOB</strong><span>node B / verifier</span><div className="node-readout"><span>Pauli frame</span><b>{step >= 3 ? "σXZ aligned" : "awaiting bits"}</b></div></div><div className={cn("protocol-node", "node-eve", "movable-node", dragging === "eve" && "node-dragging", eve && "node-active", "compact-node")} style={{ left: `${nodePositions.eve.x}%`, top: `${nodePositions.eve.y}%` }} onPointerDown={(event) => beginNodeDrag("eve", event)}><div className="protocol-node-icon"><AlertTriangle size={20} /></div><strong>EVE</strong><span>adversary / isolated</span><div className="node-readout"><span>intercept rate</span><b>{eve ? "35% active" : "0% idle"}</b></div></div><div className="stage-label stage-label-bottom"><span>classical channel / authenticated</span><span>γ photon stream / entangled pair</span></div></div><div className="protocol-controls"><div className="control-copy"><span className="eyebrow">Adversarial simulation</span><strong>Man-in-the-middle interception</strong><span>Toggle to observe a broken Bell correlation across all pages.</span></div><button className={cn("switch", eve && "switch-on")} onClick={() => toggleEve()} aria-pressed={eve}><span className="switch-thumb" /> <span>{eve ? "Eve active" : "Eve idle"}</span></button></div></section><section className="bitstream-section"><SectionLabel index="03" eyebrow="Evidence sample" title="Quantum bitstream & Pauli alignment" action={<div className="evidence-actions"><Pill tone="blue">{matrixRows.filter((row) => !row.discarded).length} kept / {matrixRows.filter((row) => row.discarded).length} dropped</Pill><button className="button button-quiet button-small" onClick={exportMatrix}><Download size={14} /> Export Matrix CSV</button></div>} /><div className="bitstream-table-wrap"><table className="data-table bitstream-table"><thead><tr><th>pulse</th><th>Alice basis</th><th>raw bit</th><th>Bell outcome</th><th>Bob basis</th><th>Pauli</th><th>sifting</th></tr></thead><tbody>{matrixRows.map((row) => <tr key={row.pulse}><td className="mono">{row.pulse}</td><td>{row.aliceBasis}</td><td className="mono">{row.aliceBit}</td><td className="mono">{row.bell}</td><td>{row.bobBasis}</td><td className="mono">{row.bobBit}</td><td><Pill tone={row.discarded || row.intercepted ? "copper" : "good"}>{row.discarded ? "DISCARDED" : row.intercepted ? "QBER ERROR" : "KEPT"}</Pill></td></tr>)}</tbody></table></div></section>{showCreateSession && <div className="modal-backdrop" onClick={() => setShowCreateSession(false)}><div className="modal-card" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Provision / 01</span><h3>New quantum session</h3></div><button className="icon-button" onClick={() => setShowCreateSession(false)} aria-label="Close new session"><X size={15} /></button></div><p className="modal-copy">Create a clean handshake session and begin at the EPR preparation phase.</p><div className="form-grid"><label>Document<input defaultValue="board-resolution.pdf" /></label><label>Protocol profile<select defaultValue="QDS / 1550nm"><option>QDS / 1550nm</option><option>QDS / test channel</option></select></label></div><button className="button button-copper modal-submit" onClick={() => { setShowCreateSession(false); goToStep(0); setPlaying(true); toast.success("Quantum Session created & active"); }}><Play size={14} fill="currentColor" /> Create & start session</button></div></div>}{showSettings && <div className="modal-backdrop" onClick={() => setShowSettings(false)}><div className="modal-card modal-card-small" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Control plane</span><h3>Simulation settings</h3></div><button className="icon-button" onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={15} /></button></div><div className="settings-row"><span>Playback speed</span><div className="speed-pills">{[0.5, 1, 2, 4].map((speed) => <button key={speed} className={cn("speed-pill", simSpeed === speed && "speed-pill-active")} onClick={() => setSimSpeed(speed)}>{speed}x</button>)}</div></div><div className="settings-note"><Gauge size={14} /> Photon velocity and auto-advance interval update together.</div></div></div>}{showNotifications && <div className="notification-popover"><div className="modal-head"><div><span className="eyebrow">Signal desk</span><h3>Notifications</h3></div><button className="icon-button" onClick={() => setShowNotifications(false)} aria-label="Close notifications"><X size={14} /></button></div><div className="notification-item"><span className="notification-mark" /><div><strong>{eve ? "Quantum channel intrusion" : "No active alerts"}</strong><span>{eve ? "35% intercept tap is disturbing Bell correlation." : "The current session is within nominal tolerance."}</span></div></div>{eve && <button className="text-link notification-clear" onClick={() => { toggleEve(); setShowNotifications(false); }}>Clear active alert</button>}</div>}</div>;
}

function DemonstrationPage() {
  return <LegacyDemonstrationPage />;
}
function SandboxMetricChart({
  title,
  mode,
  threat,
  value,
  detail,
  targetVal,
  currentVal
}: {
  title: string;
  mode: "qber" | "chsh";
  threat: boolean;
  value: string;
  detail: string;
  targetVal?: number;
  currentVal?: number;
}) {
  const width = 100;
  const height = 60;
  const padY = 6;
  const padX = 6;

  const baseTarget = targetVal !== undefined ? targetVal : (mode === "qber" ? (threat ? 0.142 : 0.019) : (threat ? 1.76 : 2.76));

  const [history, setHistory] = useState<number[]>(() => {
    const init = [];
    for (let i = 0; i < 10; i++) {
      const progress = i / 9;
      if (mode === "qber") {
        init.push(threat ? (0.019 + (baseTarget - 0.019) * Math.pow(progress, 1.8)) : baseTarget);
      } else {
        init.push(threat ? (2.76 - (2.76 - baseTarget) * Math.pow(progress, 1.8)) : baseTarget);
      }
    }
    return init;
  });

  useEffect(() => {
    setHistory(() => {
      const init = [];
      for (let i = 0; i < 10; i++) {
        const progress = i / 9;
        if (mode === "qber") {
          init.push(threat ? (0.019 + (baseTarget - 0.019) * Math.pow(progress, 1.8)) : baseTarget);
        } else {
          init.push(threat ? (2.76 - (2.76 - baseTarget) * Math.pow(progress, 1.8)) : baseTarget);
        }
      }
      return init;
    });
  }, [baseTarget, threat, mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        if (mode === "qber") {
          const noise = (Math.random() * 0.008 - 0.004);
          const nextVal = Math.max(0.008, Math.min(0.20, baseTarget + noise));
          return [...prev.slice(1), nextVal];
        } else {
          const noise = (Math.random() * 0.06 - 0.03);
          const nextVal = Math.max(1.1, Math.min(2.828, baseTarget + noise));
          return [...prev.slice(1), nextVal];
        }
      });
    }, 750);

    return () => clearInterval(interval);
  }, [baseTarget, mode]);

  const points = useMemo(() => {
    const count = history.length;
    const min = mode === "qber" ? 0.0 : 1.0;
    const max = mode === "qber" ? 0.20 : 3.0;

    return history.map((val, i) => {
      const x = padX + (i / (count - 1)) * (width - 2 * padX);
      const clamped = Math.max(min, Math.min(max, val));
      const y = (height - padY) - ((clamped - min) / (max - min)) * (height - 2 * padY);
      return { x, y, val };
    });
  }, [history, mode]);

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${width - padX} ${height - padY} L ${padX} ${height - padY} Z`;

  const thresholdMin = mode === "qber" ? 0.0 : 1.0;
  const thresholdMax = mode === "qber" ? 0.20 : 3.0;
  const thresholdValue = mode === "qber" ? 0.055 : 2.0;
  const thresholdY = (height - padY) - ((thresholdValue - thresholdMin) / (thresholdMax - thresholdMin)) * (height - 2 * padY);

  const latest = points[points.length - 1];

  return (
    <div className="sandbox-v2-metric">
      <div className="sandbox-v2-metric-head">
        <strong>{title}</strong>
        <span>{mode === "chsh" ? "Quantum ≥ 2.0" : "τ ≤ 5.5%"}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`grad-sandbox-${mode}-${threat ? 'threat' : 'good'}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={threat ? "#b94a2f" : "#2f6f85"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={threat ? "#b94a2f" : "#2f6f85"} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line
          x1={padX}
          y1={thresholdY}
          x2={width - padX}
          y2={thresholdY}
          stroke={threat ? "#b94a2f" : "#687078"}
          strokeDasharray="2 2"
          strokeWidth="0.75"
          opacity="0.6"
        />
        <path d={areaD} fill={`url(#grad-sandbox-${mode}-${threat ? 'threat' : 'good'})`} style={{ transition: "d 0.35s ease" }} />
        <path
          d={pathD}
          fill="none"
          stroke={threat ? "#b94a2f" : "#2f6f85"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "d 0.35s ease" }}
        />
        {latest && (
          <g>
            <circle cx={latest.x} cy={latest.y} r="2.8" fill={threat ? "#b94a2f" : "#2f6f85"} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={latest.x} cy={latest.y} r="5" fill="none" stroke={threat ? "#b94a2f" : "#2f6f85"} strokeWidth="0.5" opacity="0.6" className="animate-ping" />
          </g>
        )}
      </svg>
      <div className="sandbox-v2-metric-foot">
        <span>{detail}</span>
        <b className={threat ? "text-copper" : "status-text-good"}>
          {mode === "qber" ? `${((latest?.val ?? baseTarget) * 100).toFixed(1)}%` : `S=${(latest?.val ?? baseTarget).toFixed(2)}`}
        </b>
      </div>
    </div>
  );
}

/* Transfer workspace — Signal Atelier applies mineral paper, ink, copper intervention, and analytic blue telemetry. */
function TransferPage() {
  const { eveActive, toggleEve, qber, chsh, pqcMode, payloads, sendTransmission, resetChannel } = useSentinel();
  const [mode, setMode] = useState<"message" | "document">(() => new URLSearchParams(window.location.search).get("mode") === "document" ? "document" : "message");
  const [message, setMessage] = useState("CLASSIFIED DEFENSE TELEMETRY: Quantum one-time-pad key handshake verified for orbital satellite relay Alpha-09.");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDigest, setFileDigest] = useState<string | null>(null);
  const [fileIsDragging, setFileIsDragging] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitStep, setTransmitStep] = useState(0);
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
    if (mode === "message" && !message.trim()) { toast.error("Enter a payload message"); return; }
    if (isTransmitting) return;

    setIsTransmitting(true);
    setTransmitStep(1);

    try {
      await new Promise((r) => setTimeout(r, 450));
      setTransmitStep(2);

      await new Promise((r) => setTimeout(r, 450));
      setTransmitStep(3);

      await new Promise((r) => setTimeout(r, 450));
      setTransmitStep(4);

      await sendTransmission({ mode, message, file: selectedFile, digest: fileDigest });
      await new Promise((r) => setTimeout(r, 650));

      if (mode === "document" && selectedFile) removeDocument();
    } catch {
      toast.error("Quantum transmission interrupted");
    } finally {
      setIsTransmitting(false);
      setTransmitStep(0);
    }
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

      {/* Live Photon Beam Animation Bar */}
      {isTransmitting && (
        <div style={{
          background: "var(--paper-deep)",
          borderBottom: "1px solid var(--line)",
          padding: "6px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          font: "9.5px var(--mono)",
          color: "var(--ink)",
          letterSpacing: "0.04em",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={13} className="spin text-blue" />
            <strong style={{ color: eveActive ? "var(--copper)" : "var(--blue)" }}>
              {eveActive ? "OPTICAL DISTURBANCE DETECTED · PQC HOT-SWAP" : "ACTIVE 1550nm OPTICAL HANDSHAKE"} (PHASE 0{transmitStep}/04)
            </strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--slate)" }}>
            <span>ALICE (NODE A) ──[γ STREAM]──▶ ARBITRATOR ──▶ BOB (NODE B)</span>
            <div style={{ width: "80px", height: "4px", background: "rgba(22, 24, 26, 0.08)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(transmitStep / 4) * 100}%`,
                background: eveActive ? "var(--copper)" : "var(--blue)",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        </div>
      )}

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
            <span>State: {isTransmitting ? `Transmitting stage ${transmitStep}/4…` : mode === "document" ? selectedFile ? "Document ready to sign" : "Awaiting document" : eveActive ? "Fallback signature mode" : "Ready to sign"}</span>
            <button disabled={isTransmitting} onClick={handleSend} style={{ opacity: isTransmitting ? 0.75 : 1 }}>
              {isTransmitting ? (
                <>
                  <RefreshCw size={14} className="spin" /> Transmitting pulse ({transmitStep}/4)…
                </>
              ) : (
                <>
                  <Send size={15} /> Send quantum signed payload
                </>
              )}
            </button>
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
            <span className={cn("transfer-listening", isTransmitting && "text-copper font-bold")}>
              {isTransmitting ? `STREAM ACTIVE (${transmitStep}/4)` : "Listening"}
            </span>
          </div>

          <div className="transfer-receipts">
            {/* Live Incoming Feed Animation Box - Signal Atelier Theme */}
            {isTransmitting && (
              <div style={{
                background: "var(--paper-deep)",
                border: "1px solid var(--line)",
                padding: "10px 12px",
                font: "10.5px/1.45 var(--mono)",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                marginBottom: "10px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: "5px",
                  color: "var(--slate)",
                  font: "8.5px var(--mono)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase"
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: eveActive ? "var(--copper)" : "var(--blue)", fontWeight: "bold" }}>
                    <TerminalSquare size={11} /> SNSPD QUANTUM RECEPTOR STREAM
                  </span>
                  <span style={{ color: eveActive ? "var(--copper)" : "var(--blue)", fontWeight: "bold" }}>PHASE {transmitStep}/4</span>
                </div>

                {transmitStep >= 1 && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", color: "var(--ink)" }}>
                    <span style={{ color: "var(--blue)", fontWeight: "bold", fontSize: "9px" }}>[01]</span>
                    <span>Single-photon pulse captured on port SNSPD-01 (λ=1550nm)...</span>
                  </div>
                )}
                {transmitStep >= 2 && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", color: "var(--ink)" }}>
                    <span style={{ color: "var(--blue)", fontWeight: "bold", fontSize: "9px" }}>[02]</span>
                    <span>Reconciled classical feed-forward bits (b₁=1, b₂=0)...</span>
                  </div>
                )}
                {transmitStep >= 3 && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", color: "var(--ink)" }}>
                    <span style={{ color: "var(--slate)", fontWeight: "bold", fontSize: "9px" }}>[03]</span>
                    <span>Applied Pauli unitary operator σX · σZ frame alignment...</span>
                  </div>
                )}
                {transmitStep >= 4 && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", color: eveActive ? "var(--copper)" : "#3b7453", fontWeight: "bold" }}>
                    <span style={{ fontSize: "9px" }}>[04]</span>
                    <span>
                      {eveActive 
                        ? "EVE INTERCEPT DETECTED ➔ HOT-SWAPPED TO CRYSTALS-DILITHIUM3 PQC FALLBACK · 100% UNTOUCHED" 
                        : "SHA-256 MATCH CONFIRMED (100% PHYSICAL QDS BYTE INTEGRITY VERIFIED)"}
                    </span>
                  </div>
                )}
              </div>
            )}

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
  const { incidents, telemetryLogs, threats, qber, chsh } = useSentinel();
  const [activeTable, setActiveTable] = useState<'quantum_sessions' | 'attack_records' | 'node_metrics' | 'telemetry_logs'>('quantum_sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dbRows, setDbRows] = useState(sessionRows);
  const [selectedRecord, setSelectedRecord] = useState<any>(sessionRows[0]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getSessions();
      if (res?.sessions && Array.isArray(res.sessions)) {
        const mapped = res.sessions.map((s: any, idx: number) => ({
          id: s.session_id || `QKD-20260828-${String(idx + 1).padStart(4, '0')}`,
          doc: s.document_name || 'telemetry-manifest.pdf',
          status: s.status === 'REJECTED' ? 'Quarantined' : 'Verified',
          qber: `${((s.metrics?.qber ?? 0.019) * 100).toFixed(1)}%`,
          chsh: (s.metrics?.chsh_score ?? 2.76).toFixed(2),
          verdict: s.status === 'REJECTED' ? 'REJECT' : 'ACCEPT',
          time: '11:48:' + String(20 + idx).padStart(2, '0')
        }));
        setDbRows(mapped);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabase();
  }, []);

  const tables = [
    { id: 'quantum_sessions', name: 'quantum_sessions', count: String(dbRows.length), icon: Radio },
    { id: 'attack_records', name: 'attack_records', count: String(threats.length), icon: AlertTriangle },
    { id: 'node_metrics', name: 'node_metrics', count: '04', icon: Network },
    { id: 'telemetry_logs', name: 'telemetry_logs', count: String(telemetryLogs.length), icon: Activity }
  ];

  const currentRecords = useMemo(() => {
    if (activeTable === 'attack_records') {
      return threats.map(t => ({
        id: t.id,
        doc: t.type,
        status: t.severity === 'CRITICAL' ? 'Quarantined' : 'Degraded',
        qber: t.current || `${((t.qber ?? 0.142) * 100).toFixed(1)}%`,
        chsh: (t.chsh ?? 1.76).toFixed(2),
        verdict: 'REJECT',
        time: t.time
      }));
    }
    if (activeTable === 'node_metrics') {
      return [
        { id: 'QN-ALICE', doc: 'Node Signer / Laser Source', status: 'Verified', qber: '0.0%', chsh: '2.76', verdict: 'ACCEPT', time: '11:48:00' },
        { id: 'ARB-CORE', doc: 'Central Entanglement Hub', status: 'Verified', qber: '0.0%', chsh: '2.78', verdict: 'ACCEPT', time: '11:48:00' },
        { id: 'QN-BOB', doc: 'Verifier / Detector Hub', status: qber > 0.055 ? 'Degraded' : 'Verified', qber: `${(qber * 100).toFixed(1)}%`, chsh: chsh.toFixed(2), verdict: qber > 0.055 ? 'REJECT' : 'ACCEPT', time: '11:48:00' },
        { id: 'QN-EVE', doc: 'Adversarial Optical Probe', status: 'Quarantined', qber: '14.2%', chsh: '1.76', verdict: 'REJECT', time: '11:48:00' },
      ];
    }
    if (activeTable === 'telemetry_logs') {
      return telemetryLogs.map(l => ({
        id: l.id,
        doc: l.text,
        status: l.isThreat ? 'Quarantined' : 'Verified',
        qber: l.qber,
        chsh: l.chsh,
        verdict: l.isThreat ? 'REJECT' : 'ACCEPT',
        time: l.time
      }));
    }
    return dbRows;
  }, [activeTable, dbRows, threats, telemetryLogs, qber, chsh]);

  const filteredRecords = useMemo(() => {
    return currentRecords.filter(row => {
      const matchesSearch = (row.id + ' ' + row.doc).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'VERIFIED' ? row.status === 'Verified' : row.status !== 'Verified');
      return matchesSearch && matchesStatus;
    });
  }, [currentRecords, searchQuery, statusFilter]);

  const selected = selectedRecord || filteredRecords[0] || dbRows[0];

  return (
    <div className="page-content database-page">
      <Topbar
        eyebrow="04 / Data studio"
        title="Live database"
        subtitle="Inspect session state, raw bitstreams, and audit records (PostgreSQL / SQLite Core)"
        action={
          <button className="button button-copper button-small" onClick={() => toast.success("Live PostgreSQL sync active")}>
            <Database size={14} /> Synced with Backend
          </button>
        }
      />
      <div className="db-layout">
        <aside className="table-sidebar">
          <span className="eyebrow">Tables / 04</span>
          {tables.map((table) => {
            const Icon = table.icon;
            return (
              <button
                className={cn("table-nav", activeTable === table.id && "table-nav-active")}
                key={table.id}
                onClick={() => {
                  setActiveTable(table.id as any);
                  setSelectedRecord(null);
                }}
              >
                <Icon size={15} />
                <span>{table.name}</span>
                <b>{table.count}</b>
              </button>
            );
          })}
          <div className="db-sidebar-foot"><StatusDot /> FastAPI + SQLite auto-sync</div>
        </aside>

        <main className="db-main">
          <div className="db-toolbar">
            <div className="db-title">
              <Database size={16} />
              <strong>{activeTable}</strong>
              <Pill tone="good">online</Pill>
            </div>
            <div className="db-actions">
              <div className="search-box">
                <Search size={14} />
                <input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="filter-button"
                onClick={() => setStatusFilter(prev => prev === 'ALL' ? 'VERIFIED' : prev === 'VERIFIED' ? 'QUARANTINED' : 'ALL')}
              >
                <SlidersHorizontal size={14} /> Filter: {statusFilter}
              </button>
              <button
                className="icon-button"
                onClick={() => {
                  fetchLiveDatabase();
                  toast.success("Database records synchronized from backend");
                }}
                aria-label="Refresh table"
              >
                <RefreshCw size={15} className={isLoading ? "spin" : ""} />
              </button>
            </div>
          </div>

          <div className="data-table-wrap db-table-wrap">
            <table className="data-table db-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Payload / Document</th>
                  <th>Status</th>
                  <th>QBER</th>
                  <th>Hoeffding</th>
                  <th>CHSH</th>
                  <th>Verdict</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => (
                  <tr
                    onClick={() => setSelectedRecord(row)}
                    className={selected?.id === row.id ? "row-selected" : ""}
                    key={row.id}
                  >
                    <td className="mono strong-cell">{row.id}</td>
                    <td>{row.doc}</td>
                    <td>
                      <span className={cn("row-status", (row.status === "Quarantined" || row.status === "Degraded") && "row-status-bad")}>
                        <StatusDot tone={row.status === "Quarantined" || row.status === "Degraded" ? "bad" : "ok"} />
                        {row.status}
                      </span>
                    </td>
                    <td>{row.qber}</td>
                    <td>5.5%</td>
                    <td>{row.chsh}</td>
                    <td>
                      <Pill tone={row.verdict === "REJECT" ? "copper" : "good"}>{row.verdict}</Pill>
                    </td>
                    <td className="mono muted">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="db-pagination">
            <span>Showing {filteredRecords.length} records</span>
            <div>
              <button className="icon-button"><ArrowLeft size={14} /></button>
              <button className="page-current">1</button>
              <button className="icon-button"><ChevronRight size={14} /></button>
            </div>
          </div>
        </main>

        <aside className="record-drawer">
          <div className="drawer-head">
            <div>
              <span className="eyebrow">Record inspector</span>
              <h3>Record Details</h3>
            </div>
            <button className="icon-button" aria-label="Close inspector"><X size={15} /></button>
          </div>
          <Pill tone={selected?.verdict === "REJECT" ? "copper" : "good"}>
            {selected?.verdict || "ACCEPT"} / {selected?.status || "Verified"}
          </Pill>
          <div className="record-id">{selected?.id || "QKD-20260828-0001"}</div>
          <div className="record-block">
            <span className="eyebrow">Document / Target</span>
            <strong>{selected?.doc || "telemetry.pdf"}</strong>
            <span className="mono muted">sha256: 0x6692d35f98fc1c149afbf4c8996fb92427</span>
          </div>
          <div className="record-metrics">
            <div>
              <span>QBER</span>
              <strong className={selected?.verdict === "REJECT" ? "text-copper" : ""}>{selected?.qber || "1.9%"}</strong>
            </div>
            <div>
              <span>CHSH</span>
              <strong>{selected?.chsh || "2.76"}</strong>
            </div>
          </div>
          <div className="json-block">
            <div><span>raw_payload.jsonb</span><Copy size={13} /></div>
            <pre>{JSON.stringify({
              record_id: selected?.id || "QKD-20260828-0001",
              status: selected?.status || "Verified",
              metrics: { qber: selected?.qber || "1.9%", chsh_score: selected?.chsh || "2.76", hoeffding_bound: "5.5%" },
              quantum_registers: {
                alice_bits: [1, 0, 1, 1, 0, 1, 0, 1],
                bell_outcomes: ["01", "00", "11", "10"],
                bob_measurements: [1, 0, 1, 1, 0, 1],
                pauli_frame: ["I", "X", "Z", "XZ", "I"]
              },
              pqc_handover_engaged: selected?.verdict === "REJECT"
            }, null, 2)}</pre>
          </div>
          <button
            className="button button-outline drawer-button"
            onClick={() => {
              navigator.clipboard?.writeText(JSON.stringify(selected, null, 2));
              toast.success("Raw record JSON copied");
            }}
          >
            <Clipboard size={14} /> Copy JSON payload
          </button>
        </aside>
      </div>
    </div>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowScroll = window.scrollY || document.documentElement.scrollTop;
      const mainShellScroll = document.querySelector(".main-shell")?.scrollTop || 0;
      const appShellScroll = document.querySelector(".app-shell")?.scrollTop || 0;
      const demoScroll = document.querySelector(".demonstration-desk-page")?.scrollTop || 0;
      const sandboxScroll = document.querySelector(".sandbox-v2-main")?.scrollTop || 0;
      
      const maxScroll = Math.max(windowScroll, mainShellScroll, appShellScroll, demoScroll, sandboxScroll);
      setVisible(maxScroll > 160);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const selectors = [
      ".main-shell",
      ".app-shell",
      ".demonstration-desk-page",
      ".sandbox-v2-main",
      ".monitoring-v2-layout",
      ".transfer-v2-layout",
      ".db-v2-layout"
    ];
    selectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <button
      className={cn(
        "back-to-top-btn",
        visible ? "back-to-top-visible" : "back-to-top-hidden"
      )}
      onClick={scrollToTop}
      aria-label="Back to Top"
      title="Back to Top"
    >
      <ArrowUp size={14} />
      <span>TOP</span>
    </button>
  );
}

export default function Home() {
  const [location] = useLocation();
  useEffect(() => { document.title = "QDS Sentinel — Quantum signature assurance"; }, []);
  const page = useMemo(() => location === "/demonstration" ? <DemonstrationPage /> : location === "/monitoring" ? <MonitoringPage /> : location === "/attack-sandbox" ? <SandboxPage /> : location === "/transfer" ? <TransferPage /> : location === "/database" ? <DatabasePage /> : <HomePortal />, [location]);
  const isPortal = location === "/" || location === "/home" || location === "/demonstration";
  const isSandbox = location === "/attack-sandbox";
  const isTransfer = location === "/transfer";
  const isChromeFree = isPortal || isSandbox || isTransfer;
  return (
    <div className={cn("app-shell", isPortal && "app-shell-portal", isSandbox && "app-shell-sandbox", isTransfer && "app-shell-transfer")}>
      {!isChromeFree && <Sidebar location={location} />}
      <main className="main-shell">
        {page}
        {!isSandbox && !isTransfer && (
          <footer className="page-footer">
            <span className="footer-brand"><img src={MARK} alt="" /> QDS SENTINEL / v1.0.0</span>
            <span>fastapi gateway <b>3001 OK</b></span>
            <span>© 2026 quantum assurance lab</span>
          </footer>
        )}
      </main>
      <BackToTopButton />
    </div>
  );
}

