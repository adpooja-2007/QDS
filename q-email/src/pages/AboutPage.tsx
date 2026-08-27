import React from 'react';

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1D1D1D' }}>
    <span style={{ fontSize: '12px', color: '#737373' }}>{label}</span>
    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#B8B8B8' }}>{value}</span>
  </div>
);

const AboutPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
      {/* Hero */}
      <div className="qds-panel" style={{ padding: '32px 32px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {/* Logo */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: 'rgba(99,102,241,0.1)',
            border: '1.5px solid rgba(99,102,241,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3.5" fill="#6366F1" fillOpacity="0.7" />
              <line x1="12" y1="2" x2="12" y2="5.5" stroke="#6366F1" strokeWidth="1.5" />
              <line x1="12" y1="18.5" x2="12" y2="22" stroke="#6366F1" strokeWidth="1.5" />
              <line x1="2" y1="12" x2="5.5" y2="12" stroke="#6366F1" strokeWidth="1.5" />
              <line x1="18.5" y1="12" x2="22" y2="12" stroke="#6366F1" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h1 style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '24px',
              letterSpacing: '0.04em', color: '#FFFFFF', margin: '0 0 4px',
            }}>
              Quantum Digital Signature Security Platform
            </h1>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#737373', letterSpacing: '0.06em' }}>
              ENTERPRISE QUANTUM SECURITY OPERATIONS · SIH 2026
            </div>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#737373', lineHeight: 1.7, marginTop: '20px' }}>
          The QDS Platform is a Quantum-Inspired Cyber Threat Detection system designed for Digital Signature Security.
          It implements the BB84-EPR quantum key distribution protocol with entanglement verification via CHSH Bell tests,
          providing provably-secure authentication against quantum and classical adversaries.
        </p>
      </div>

      {/* Project info */}
      <div className="qds-panel">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1D1D1D' }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em', color: '#FFFFFF', textTransform: 'uppercase', margin: 0 }}>
            Project Information
          </h2>
        </div>
        <div style={{ padding: '20px' }}>
          <Row label="Competition" value="Smart India Hackathon 2026" />
          <Row label="Problem Statement" value="PS-26141" />
          <Row label="Sponsor / Ministry" value="Egreen Quanta" />
          <Row label="Module" value="Module 5 — React Cyber-SOC" />
          <Row label="Protocol" value="BB84-EPR-QDS v2.3" />
          <Row label="Frontend Version" value="2.0.0" />
          <Row label="Build" value="2026.08.25" />
        </div>
      </div>

      {/* Architecture */}
      <div className="qds-panel">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1D1D1D' }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em', color: '#FFFFFF', textTransform: 'uppercase', margin: 0 }}>
            System Architecture
          </h2>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              {
                title: 'Frontend (Module 5)',
                items: ['React 18 + TypeScript', 'Vite build system', 'Tailwind CSS', 'Recharts visualizations'],
              },
              {
                title: 'Security Engine (Backend)',
                items: ['FastAPI Python service', 'QBER computation', 'CHSH Bell test evaluator', 'Attack classification'],
              },
              {
                title: 'Quantum Layer',
                items: ['BB84 state preparation', 'EPR pair generation', 'Basis reconciliation', 'Key sifting protocol'],
              },
              {
                title: 'Data Infrastructure',
                items: ['PostgreSQL session store', 'WebSocket telemetry', 'REST API contracts', 'Event audit logging'],
              },
            ].map(({ title, items }) => (
              <div key={title} style={{
                padding: '14px', background: '#0A0A0A',
                borderRadius: '6px', border: '1px solid #1D1D1D',
              }}>
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '12px',
                  color: '#6366F1', letterSpacing: '0.04em', marginBottom: '8px',
                }}>
                  {title}
                </div>
                {items.map(item => (
                  <div key={item} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '12px', color: '#737373', marginBottom: '4px',
                  }}>
                    <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#292929', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security model */}
      <div className="qds-panel">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1D1D1D' }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em', color: '#FFFFFF', textTransform: 'uppercase', margin: 0 }}>
            Security Model
          </h2>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'QBER Threshold', value: '11.0%', desc: 'Maximum tolerable error rate' },
              { label: 'CHSH Minimum', value: '2.000', desc: 'Bell inequality classical bound' },
              { label: 'EPR Pairs', value: '8,192', desc: 'Per session entangled pairs' },
              { label: 'Security Level', value: 'α = 0.001', desc: 'False-accept probability' },
              { label: 'Attack Coverage', value: '4 types', desc: 'MITM, Forgery, Replay, PNS' },
              { label: 'Protocol', value: 'BB84-EPR', desc: 'Quantum key distribution' },
            ].map(({ label, value, desc }) => (
              <div key={label} style={{
                padding: '12px', background: '#0A0A0A',
                borderRadius: '6px', border: '1px solid #1D1D1D',
              }}>
                <div className="qds-label" style={{ marginBottom: '4px' }}>{label}</div>
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '18px',
                  color: '#FFFFFF', marginBottom: '2px',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: '11px', color: '#737373' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: '#292929', letterSpacing: '0.08em' }}>
          QDS PLATFORM · EGREEN QUANTA · SIH 2026 · PS-26141 · MODULE 5
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
