import React from 'react';
import type { DecisionType } from '../types';


interface Props {
  decision: DecisionType;
  reason: string;
  attackType: string | null;
}

const DECISION_CONFIG: Record<DecisionType, {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}> = {
  ACCEPT: {
    label: 'ACCEPTED',
    bgColor: 'rgba(99,102,241,0.04)',
    borderColor: '#6366F1',
    textColor: '#6366F1',
    icon: '✓',
  },
  REJECT: {
    label: 'REJECTED',
    bgColor: 'rgba(214,90,90,0.06)',
    borderColor: '#D65A5A',
    textColor: '#D65A5A',
    icon: '✕',
  },
  FLAG: {
    label: 'FLAGGED FOR REVIEW',
    bgColor: 'rgba(212,167,44,0.06)',
    borderColor: '#D4A72C',
    textColor: '#D4A72C',
    icon: '⚑',
  },
  PENDING: {
    label: 'PENDING',
    bgColor: 'rgba(255,255,255,0.02)',
    borderColor: '#404040',
    textColor: '#B8B8B8',
    icon: '○',
  },
};

const DecisionBanner: React.FC<Props> = ({ decision, reason, attackType }) => {
  const cfg = DECISION_CONFIG[decision];

  return (
    <div
      style={{
        background: cfg.bgColor,
        borderLeft: `3px solid ${cfg.borderColor}`,
        borderRadius: '0 8px 8px 0',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      {/* Decision badge */}
      <div style={{ flexShrink: 0, paddingTop: '1px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: `1.5px solid ${cfg.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cfg.textColor,
            fontSize: '14px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontWeight: 600,
          }}
        >
          {cfg.icon}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.08em',
              color: cfg.textColor,
              textTransform: 'uppercase',
            }}
          >
            {cfg.label}
          </span>
          {attackType && (
            <span
              style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#737373',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #292929',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {attackType.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: '#B8B8B8', lineHeight: 1.5, margin: 0 }}>
          {reason}
        </p>
      </div>
    </div>
  );
};

export default DecisionBanner;
