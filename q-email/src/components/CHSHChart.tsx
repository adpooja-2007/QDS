import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { AnalyticsPoint } from '../types';

interface Props {
  data: AnalyticsPoint[];
}

const CHSH_THRESHOLD = 2.0;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div
      style={{
        background: '#171717',
        border: '1px solid #292929',
        borderRadius: '6px',
        padding: '10px 14px',
      }}
    >
      <div className="qds-label" style={{ marginBottom: '6px', color: '#737373' }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', display: 'flex', gap: '8px' }}>
        <span style={{ color: '#737373' }}>CHSH:</span>
        <span style={{ color: v >= CHSH_THRESHOLD ? '#22D3EE' : '#D65A5A', fontWeight: 600 }}>
          {Number(v).toFixed(3)}
        </span>
      </div>
      <div style={{ fontSize: '10px', color: '#737373', marginTop: '4px', fontFamily: 'IBM Plex Mono, monospace' }}>
        Threshold: ≥ 2.000
      </div>
    </div>
  );
};

const CHSHChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1D1D1D" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#737373', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
          axisLine={{ stroke: '#292929' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 3]}
          tickFormatter={(v) => v.toFixed(1)}
          tick={{ fill: '#737373', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={CHSH_THRESHOLD}
          stroke="#D65A5A"
          strokeDasharray="4 4"
          strokeWidth={1}
          label={{ value: 'MIN', position: 'right', fontSize: 9, fill: '#D65A5A', fontFamily: 'IBM Plex Mono, monospace' }}
        />
        <Bar
          dataKey="chsh"
          name="CHSH"
          fill="#22D3EE"
          fillOpacity={0.4}
          stroke="#22D3EE"
          strokeWidth={1}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CHSHChart;
