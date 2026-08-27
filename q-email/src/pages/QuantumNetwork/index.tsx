import React from 'react';
import { QuantumNode } from '../../types/sentinel';
import {
  Network,
  Cpu,
  Radio,
  Activity,
  Layers,
  CheckCircle2,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface QuantumNetworkProps {
  nodes: QuantumNode[];
}

export const QuantumNetworkPage: React.FC<QuantumNetworkProps> = ({ nodes }) => {
  return (
    <div className="space-y-5 pb-8 max-w-[1600px] mx-auto">
      {/* ─── Main Network Topology Card ─── */}
      <div className="sentinel-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="sentinel-card-title">Distributed Quantum Node Topology</div>
            <div className="sentinel-card-subtitle">
              Arbitrator-Mediated Entangled Mesh Network
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#4169D8] bg-[#EEF3FF] px-2.5 py-1 rounded font-semibold border border-[#D0DCFC]">
            SYNCHRONIZED · 4 / 4 NODES
          </span>
        </div>

        {/* Technical Topology SVG Graph (Light Theme) */}
        <div className="bg-[#FAFBFD] border border-[#EAECF0] rounded-lg p-6 my-2">
          <svg viewBox="0 0 700 240" className="w-full h-auto max-h-[220px]">
            {/* Background Channel Lines */}
            {/* Arbitrator to Alice */}
            <line x1="350" y1="40" x2="150" y2="120" stroke="#D0DCFC" strokeWidth="2" strokeDasharray="4 4" />
            {/* Arbitrator to Bob */}
            <line x1="350" y1="40" x2="550" y2="120" stroke="#D0DCFC" strokeWidth="2" strokeDasharray="4 4" />
            {/* Alice to Bob (EPR Channel) */}
            <line x1="150" y1="120" x2="550" y2="120" stroke="#6C63D9" strokeWidth="2" />
            {/* Alice to Threat Engine */}
            <line x1="150" y1="120" x2="350" y2="200" stroke="#EAECF0" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Bob to Threat Engine */}
            <line x1="550" y1="120" x2="350" y2="200" stroke="#EAECF0" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Arbitrator to Threat Engine */}
            <line x1="350" y1="40" x2="350" y2="200" stroke="#D0D5DD" strokeWidth="1" strokeDasharray="2 2" />

            {/* Channel Labels */}
            <rect x="290" y="112" width="120" height="18" rx="4" fill="#F4F3FC" stroke="#DCD9F7" />
            <text x="350" y="125" textAnchor="middle" fill="#6C63D9" fontSize="9" fontFamily="monospace" fontWeight="600">
              EPR QUANTUM CHANNEL
            </text>

            {/* Node 1: Arbitrator (Top) */}
            <g transform="translate(350, 40)">
              <circle r="24" fill="#FFFFFF" stroke="#4169D8" strokeWidth="2" filter="drop-shadow(0 1px 2px rgba(16,24,40,0.06))" />
              <text y="4" textAnchor="middle" fill="#182033" fontSize="10" fontFamily="monospace" fontWeight="bold">ARB-01</text>
              <text y="36" textAnchor="middle" fill="#667085" fontSize="10" fontFamily="sans-serif" fontWeight="600">Arbitrator</text>
            </g>

            {/* Node 2: Alice (Left) */}
            <g transform="translate(150, 120)">
              <circle r="24" fill="#FFFFFF" stroke="#4169D8" strokeWidth="2" filter="drop-shadow(0 1px 2px rgba(16,24,40,0.06))" />
              <text y="4" textAnchor="middle" fill="#182033" fontSize="10" fontFamily="monospace" fontWeight="bold">ALC-01</text>
              <text y="36" textAnchor="middle" fill="#667085" fontSize="10" fontFamily="sans-serif" fontWeight="600">Alice (Transmitter)</text>
            </g>

            {/* Node 3: Bob (Right) */}
            <g transform="translate(550, 120)">
              <circle r="24" fill="#FFFFFF" stroke="#4169D8" strokeWidth="2" filter="drop-shadow(0 1px 2px rgba(16,24,40,0.06))" />
              <text y="4" textAnchor="middle" fill="#182033" fontSize="10" fontFamily="monospace" fontWeight="bold">BOB-01</text>
              <text y="36" textAnchor="middle" fill="#667085" fontSize="10" fontFamily="sans-serif" fontWeight="600">Bob (Receiver)</text>
            </g>

            {/* Node 4: Threat Engine (Bottom) */}
            <g transform="translate(350, 200)">
              <rect x="-35" y="-16" width="70" height="32" rx="6" fill="#FFFFFF" stroke="#6C63D9" strokeWidth="2" filter="drop-shadow(0 1px 2px rgba(16,24,40,0.06))" />
              <text y="4" textAnchor="middle" fill="#6C63D9" fontSize="10" fontFamily="monospace" fontWeight="bold">TE-01</text>
              <text y="28" textAnchor="middle" fill="#667085" fontSize="10" fontFamily="sans-serif" fontWeight="600">Threat Engine</text>
            </g>
          </svg>
        </div>
      </div>

      {/* ─── Node Information Cards (4 Nodes) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="sentinel-card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold bg-[#F2F4F7] text-[#344054] px-2 py-0.5 rounded">
                  {node.role}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#4169D8] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4169D8]"></span>
                  {node.status}
                </span>
              </div>

              <div className="text-[13px] font-bold text-[#182033] font-mono">
                {node.name}
              </div>
              <div className="text-[10px] text-[#667085] font-mono mt-0.5 mb-3 truncate">
                {node.endpoint}
              </div>

              <div className="space-y-1.5 text-[11px] font-mono border-t border-[#F2F4F7] pt-2">
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Sync Latency:</span>
                  <strong className="text-[#182033]">{node.latency_ms} ms</strong>
                </div>
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Total Requests:</span>
                  <strong className="text-[#182033]">{node.requests_count.toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Qubit Fidelity:</span>
                  <strong className="text-[#4169D8]">{(node.qubit_fidelity * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex items-center justify-between text-[#667085]">
                  <span>Memory Buffer:</span>
                  <strong className="text-[#182033]">{node.memory_buffer_mb} MB</strong>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#F2F4F7] text-[10px] text-[#98A2B3] font-mono flex items-center justify-between">
              <span>Last heartbeat:</span>
              <span>{node.last_activity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Quantum vs Classical Channel Breakdown ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quantum Channel */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="sentinel-card-title text-[#6C63D9]">
              Quantum Physical Channel
            </div>
            <span className="text-[10px] font-mono bg-[#F4F3FC] text-[#6C63D9] px-2 py-0.5 rounded font-semibold">
              FIBER OPTIC SPDC
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-[#475467] font-mono">
            <p>• <strong>EPR Distribution:</strong> Pair emission rate 80 MHz with phase-matching stability.</p>
            <p>• <strong>Entanglement State:</strong> Verified Bell state |Φ⁺⟩ with fidelity &gt; 99.2%.</p>
            <p>• <strong>Interference Visibility:</strong> 97.8% HOM dip visibility.</p>
          </div>
        </div>

        {/* Classical Channel */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="sentinel-card-title text-[#4169D8]">
              Classical Authenticated Channel
            </div>
            <span className="text-[10px] font-mono bg-[#EEF3FF] text-[#4169D8] px-2 py-0.5 rounded font-semibold">
              TLS 1.3 + POLY1305
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-[#475467] font-mono">
            <p>• <strong>Feed-Forward:</strong> 2-bit BSM outcome transmission with sub-2.5ms latency.</p>
            <p>• <strong>Basis Reconciliation:</strong> Sifting protocol executed over authenticated TCP socket.</p>
            <p>• <strong>Verification Digest:</strong> Arbitrator 3-party cross-check validation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
