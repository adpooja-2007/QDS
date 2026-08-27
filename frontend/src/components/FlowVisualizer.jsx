import React from 'react';
import { Network, Zap, ShieldCheck, Cpu, Radio, Key, Play } from 'lucide-react';

export default function FlowVisualizer({ session, auditResult, activeAttack }) {
  const isAttackActive = (session?.attacks && session.attacks.length > 0) || activeAttack;
  const decision = auditResult?.decision?.overall || session?.security?.decision;
  const isRejected = decision === 'REJECT';

  return (
    <div className="soc-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            QUANTUM PROTOCOL TOPOLOGY & ATTACK VISUALIZER
          </h3>
        </div>
        <span className={`status-pill ${isAttackActive ? 'threat' : 'secure'}`}>
          {isAttackActive ? 'CHANNEL COMPROMISED' : 'QUANTUM CHANNEL SECURE'}
        </span>
      </div>

      {/* SVG Topology Visualizer */}
      <div style={{ background: 'rgba(5, 8, 17, 0.9)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg viewBox="0 0 700 280" style={{ width: '100%', height: '240px' }}>
          <defs>
            {/* Glow Filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Arbitrator Node (Top Center) */}
          <g transform="translate(350, 45)">
            <circle r="32" fill="#13102b" stroke="#a855f7" strokeWidth="2" filter="url(#glow-purple)" />
            <text y="-5" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">ARBITRATOR</text>
            <text y="12" fill="#c084fc" fontSize="9" textAnchor="middle">EPR Source</text>
          </g>

          {/* Alice Node (Bottom Left) */}
          <g transform="translate(120, 210)">
            <circle r="34" fill="#0c1e33" stroke="#00f0ff" strokeWidth="2" filter="url(#glow-cyan)" />
            <text y="-5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">ALICE</text>
            <text y="12" fill="#38bdf8" fontSize="9" textAnchor="middle">Signer / Bell</text>
          </g>

          {/* Bob Node (Bottom Right) */}
          <g transform="translate(580, 210)">
            <circle r="34" fill="#08261e" stroke="#00ff9d" strokeWidth="2" filter="url(#glow-cyan)" />
            <text y="-5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">BOB</text>
            <text y="12" fill="#34d399" fontSize="9" textAnchor="middle">Verifier / Pauli</text>
          </g>

          {/* Eve Node (Center Intercept) */}
          <g transform="translate(350, 195)">
            <circle
              r="26"
              fill={isAttackActive ? '#330814' : '#141a29'}
              stroke={isAttackActive ? '#ff0055' : '#475569'}
              strokeWidth={isAttackActive ? '2.5' : '1.5'}
              strokeDasharray={isAttackActive ? 'none' : '4,3'}
              filter={isAttackActive ? 'url(#glow-red)' : 'none'}
            />
            <text y="-3" fill={isAttackActive ? '#ff0055' : '#94a3b8'} fontSize="11" fontWeight="bold" textAnchor="middle">EVE</text>
            <text y="12" fill={isAttackActive ? '#f43f5e' : '#64748b'} fontSize="8" textAnchor="middle">
              {isAttackActive ? 'ATTACKING' : 'SANDBOX'}
            </text>
          </g>

          {/* Quantum EPR Distribution Channels from Arbitrator */}
          {/* Arbitrator -> Alice */}
          <line x1="325" y1="65" x2="145" y2="185" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,4" />
          <text x="215" y="115" fill="#c084fc" fontSize="9" transform="rotate(-30 215,115)">
            EPR Half (|Φ⁺⟩ q₁)
          </text>

          {/* Arbitrator -> Bob */}
          <line x1="375" y1="65" x2="555" y2="185" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,4" />
          <text x="485" y="115" fill="#c084fc" fontSize="9" transform="rotate(30 485,115)">
            EPR Half (|Φ⁺⟩ q₂)
          </text>

          {/* Classical & Quantum Link between Alice and Bob */}
          {isAttackActive ? (
            <>
              {/* Alice -> Eve */}
              <line x1="154" y1="205" x2="324" y2="198" stroke="#ff0055" strokeWidth="2.5" />
              <circle cx="240" cy="202" r="4" fill="#ff0055">
                <animate attributeName="cx" values="160;320" dur="1.2s" repeatCount="indefinite" />
              </circle>

              {/* Eve -> Bob */}
              <line x1="376" y1="198" x2="546" y2="205" stroke="#ff0055" strokeWidth="2.5" strokeDasharray="4,2" />
              <circle cx="460" cy="202" r="4" fill="#ff0055">
                <animate attributeName="cx" values="380;540" dur="1.2s" repeatCount="indefinite" />
              </circle>

              <text x="350" y="245" fill="#ff0055" fontSize="10" fontWeight="bold" textAnchor="middle">
                ⚠️ ACTIVE INTERCEPTION: {session?.attacks?.[0]?.attack_type || 'ADVERSARY INJECTION'}
              </text>
            </>
          ) : (
            <>
              {/* Direct Alice -> Bob Classical Feed Forward */}
              <line x1="155" y1="210" x2="545" y2="210" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="5,5" />
              <circle cx="350" cy="210" r="3" fill="#00f0ff">
                <animate attributeName="cx" values="160;540" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="350" y="245" fill="#38bdf8" fontSize="9" textAnchor="middle">
                2-Bit Feed-Forward (b₁b₂ ∈ &#123;00,01,10,11&#125;)
              </text>
            </>
          )}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.76rem', color: '#94a3b8' }}>
        <span>Quantum Resource: <strong style={{ color: '#c084fc' }}>Joint 3-Qubit Bell Statevector</strong></span>
        <span>Reconstruction: <strong style={{ color: '#34d399' }}>Pauli Correction (I, X, Z, XZ)</strong></span>
      </div>
    </div>
  );
}
