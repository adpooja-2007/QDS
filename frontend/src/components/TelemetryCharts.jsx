import React from 'react';
import { LineChart, Activity, TrendingUp, AlertCircle } from 'lucide-react';

export default function TelemetryCharts({ history = [] }) {
  // If no history yet, generate dummy initial points or show active point
  const chartData = history.length > 0 ? history : [
    { label: 'T0 (Init)', qber: 0.0, threshold: 0.024, chsh: 2.76 },
  ];

  // SVG Chart Dimensions
  const width = 600;
  const height = 220;
  const padding = 35;

  const maxQber = Math.max(0.30, ...chartData.map(d => Math.max(d.qber ?? 0, d.threshold ?? 0.05)));

  const getX = (idx) => {
    if (chartData.length <= 1) return width / 2;
    return padding + (idx / (chartData.length - 1)) * (width - 2 * padding);
  };

  const getY = (val) => {
    const safeVal = Number(val) || 0;
    const safeMax = maxQber > 0 ? maxQber : 0.3;
    return height - padding - (safeVal / safeMax) * (height - 2 * padding);
  };

  // Generate SVG paths
  const qberPoints = chartData.map((d, i) => `${getX(i)},${getY(d.qber)}`).join(' ');
  const thresholdPoints = chartData.map((d, i) => `${getX(i)},${getY(d.threshold)}`).join(' ');


  return (
    <div className="soc-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            QBER VS HOEFFDING THRESHOLD TELEMETRY
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '3px', background: '#00ff9d', display: 'inline-block' }}></span>
            <span style={{ color: '#cbd5e1' }}>Observed QBER</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '2px', background: '#ff0055', borderTop: '1px dashed #ff0055', display: 'inline-block' }}></span>
            <span style={{ color: '#cbd5e1' }}>Hoeffding Threshold</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(5, 8, 17, 0.8)', borderRadius: '10px', padding: '8px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }}>
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

          {/* Horizontal Reference lines */}
          <line x1={padding} y1={getY(0.05)} x2={width - padding} y2={getY(0.05)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
          <text x={padding - 5} y={getY(0.05) + 3} fill="#64748b" fontSize="9" textAnchor="end">5%</text>

          <line x1={padding} y1={getY(0.15)} x2={width - padding} y2={getY(0.15)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
          <text x={padding - 5} y={getY(0.15) + 3} fill="#64748b" fontSize="9" textAnchor="end">15%</text>

          <line x1={padding} y1={getY(0.25)} x2={width - padding} y2={getY(0.25)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
          <text x={padding - 5} y={getY(0.25) + 3} fill="#64748b" fontSize="9" textAnchor="end">25%</text>

          {/* Threshold Line (Dashed) */}
          <polyline
            fill="none"
            stroke="#ff0055"
            strokeWidth="2"
            strokeDasharray="5,4"
            points={thresholdPoints}
          />

          {/* QBER Line (Solid Glow) */}
          <polyline
            fill="none"
            stroke="#00ff9d"
            strokeWidth="3"
            points={qberPoints}
          />

          {/* Data Points */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.qber);
            const isBreach = d.qber > d.threshold;
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill={isBreach ? '#ff0055' : '#00ff9d'}
                  stroke="#0b0f19"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={cy - 10}
                  fill={isBreach ? '#ff0055' : '#00ff9d'}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {(d.qber * 100).toFixed(1)}%
                </text>
                <text
                  x={cx}
                  y={height - padding + 15}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {d.label || `Run ${i + 1}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
        <span>Statistical Margin: <strong style={{ color: '#00f0ff' }}>Δ = √(ln(2/α)/2N)</strong></span>
        <span>Decision Rule: <strong style={{ color: '#00ff9d' }}>QBER ≤ T → AUTHENTIC</strong></span>
      </div>
    </div>
  );
}
