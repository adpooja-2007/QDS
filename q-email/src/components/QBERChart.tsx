import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import type { AnalyticsPoint } from '../types';


interface Props {
  data: AnalyticsPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
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
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '3px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
          }}
        >
          <div style={{ width: '8px', height: '2px', background: p.color }} />
          <span style={{ color: '#737373' }}>{p.name}:</span>
          <span style={{ color: '#FFFFFF' }}>{(Number(p.value) * 100).toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
};

const QBERChart: React.FC<Props> = ({ data }) => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1D1D1D" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#737373', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={{ stroke: '#292929' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: '#737373', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '10px', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em', paddingTop: '8px' }}
          />
          <ReferenceLine
            y={0.11}
            stroke="#D65A5A"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: 'THRESHOLD', position: 'right', fontSize: 9, fill: '#D65A5A', fontFamily: 'IBM Plex Mono, monospace' }}
          />
          <Line
            type="monotone"
            dataKey="qber_observed"
            name="QBER Observed"
            stroke="#6366F1"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#6366F1', stroke: '#111111', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="qber_baseline"
            name="QBER Baseline"
            stroke="#404040"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QBERChart;
