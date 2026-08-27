import React from 'react';
import type { Scenario } from '../services/mockService';
import { SCENARIO_LABELS } from '../services/mockService';
import type { DecisionType } from '../types';

interface TopBarProps {
  scenario: Scenario;
  decision: DecisionType;
  page: string;
}

const PAGE_TITLE: Record<string, string> = {
  dashboard: 'SOC Overview',
  analytics: 'Security Analytics',
  nodes: 'System Nodes',
  protocol: 'Protocol Flow',
  telemetry: 'Telemetry Log',
  about: 'About QDS Platform',
};

const DECISION_CONFIG: Record<DecisionType, { color: string; label: string }> = {
  ACCEPT: { color: '#6366F1', label: 'ACCEPTED' },
  REJECT: { color: '#D65A5A', label: 'REJECTED' },
  FLAG: { color: '#D4A72C', label: 'FLAGGED' },
  PENDING: { color: '#737373', label: 'PENDING' },
};

const TopBar: React.FC<TopBarProps> = ({ scenario, decision, page }) => {
  const dec = DECISION_CONFIG[decision];
  const now = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header
      style={{
        height: '52px',
        background: '#0A0A0A',
        borderBottom: '1px solid #1D1D1D',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Page title */}
      <div
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 600,
          fontSize: '15px',
          letterSpacing: '0.04em',
          color: '#FFFFFF',
        }}
      >
        {PAGE_TITLE[page] ?? page}
      </div>

      <div style={{ flex: 1 }} />

      {/* Scenario badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #222222',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'IBM Plex Mono, monospace',
          color: '#737373',
        }}
      >
        <span style={{ color: '#404040' }}>SCENARIO:</span>
        <span style={{ color: '#E5E5E5', fontWeight: 500 }}>
          {SCENARIO_LABELS[scenario]}
        </span>
      </div>

      {/* Decision badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: `${dec.color}15`,
          border: `1px solid ${dec.color}40`,
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontWeight: 600,
          color: dec.color,
          letterSpacing: '0.05em',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dec.color,
            display: 'inline-block',
          }}
        />
        {dec.label}
      </div>

      {/* Protocol state */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #222222',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'IBM Plex Mono, monospace',
          color: '#737373',
        }}
      >
        <span style={{ color: '#404040' }}>STATE:</span>
        <span style={{ color: '#6366F1', fontWeight: 500 }}>
          {page === 'dashboard' ? 'AUDITED' : 'ACTIVE'}
        </span>
      </div>

      {/* Clock */}
      <div
        style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '11px',
          color: '#404040',
          letterSpacing: '0.06em',
        }}
      >
        {now} IST
      </div>
    </header>
  );
};

export default TopBar;
