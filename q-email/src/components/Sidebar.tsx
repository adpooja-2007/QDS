import React from 'react';
import { SCENARIOS, SCENARIO_LABELS } from '../services/mockService';
import type { Scenario } from '../services/mockService';

type Page = 'dashboard' | 'analytics' | 'nodes' | 'protocol' | 'telemetry' | 'about';

interface SidebarProps {
  activePage: Page;
  onNavigate: (p: Page) => void;
  scenario: Scenario;
  onScenario: (s: Scenario) => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const Icon = ({ d }: { d: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'SOC Overview',
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <Icon d="M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3" />,
  },
  {
    id: 'nodes',
    label: 'System Nodes',
    icon: <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  {
    id: 'protocol',
    label: 'Protocol Flow',
    icon: <Icon d="M8 6l4-4 4 4 M16 18l-4 4-4-4 M12 2v20 M2 12h3m14 0h3" />,
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    icon: <Icon d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20 M12 8v4l3 3" />,
  },
  {
    id: 'about',
    label: 'About',
    icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
];

const SCENARIO_DECISION: Record<Scenario, 'ACCEPT' | 'REJECT' | 'FLAG'> = {
  CLEAN: 'ACCEPT',
  NORMAL_NOISE: 'ACCEPT',
  MITM: 'REJECT',
  FORGERY: 'REJECT',
  REPLAY: 'REJECT',
  PNS: 'FLAG',
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, scenario, onScenario }) => {
  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        height: '100vh',
        background: '#0A0A0A',
        borderRight: '1px solid #1D1D1D',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #1D1D1D',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          {/* QDS Logo mark */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="white" fillOpacity="0.9" />
              <line x1="10" y1="2" x2="10" y2="5" stroke="white" strokeWidth="1.5" />
              <line x1="10" y1="15" x2="10" y2="18" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '0.06em',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              QDS
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: '10px',
            color: '#404040',
            fontFamily: 'IBM Plex Mono, monospace',
            letterSpacing: '0.06em',
            lineHeight: 1.4,
          }}
        >
          QUANTUM DIGITAL SECURITY<br />
          SOC PLATFORM v2.3
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 12px', flex: 1 }}>
        <div className="qds-label" style={{ padding: '0 8px', marginBottom: '6px' }}>Navigation</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`qds-nav-item ${activePage === item.id ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Scenario Selector */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #1D1D1D',
        }}
      >
        <div className="qds-label" style={{ padding: '0 4px', marginBottom: '8px' }}>Test Scenario</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {SCENARIOS.map((s) => {
            const isActive = scenario === s;
            const dec = SCENARIO_DECISION[s];
            const decColor = dec === 'ACCEPT' ? '#6366F1' : dec === 'REJECT' ? '#D65A5A' : '#D4A72C';
            return (
              <button
                key={s}
                onClick={() => onScenario(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  border: 'none',
                  background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 120ms ease',
                }}
              >
                <div
                  style={{
                    width: '2px',
                    height: '14px',
                    borderRadius: '1px',
                    background: isActive ? decColor : '#292929',
                    flexShrink: 0,
                    transition: 'background 120ms ease',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: isActive ? '#FFFFFF' : '#737373',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: 1.3,
                  }}
                >
                  {SCENARIO_LABELS[s]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #1D1D1D',
        }}
      >
        <div style={{ fontSize: '10px', color: '#292929', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1.5 }}>
          EGREEN QUANTA<br />
          SIH 2026 · PS-26141<br />
          Module 5 — React Cyber-SOC
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
