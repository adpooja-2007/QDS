import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SecurityReport } from '../../types';

interface QBERChartProps {
  report: SecurityReport | null;
  runs?: { run: number; observed: number; baseline: number; threshold: number }[];
}

export const QBERChart: React.FC<QBERChartProps> = ({ report, runs }) => {
  const currentQber = report?.metrics.qber ?? 0.018;
  const baseline = report?.metrics.baseline_qber ?? 0.020;
  const threshold = report?.metrics.threshold ?? 0.100;
  const sifted = report?.metrics.sifted_count ?? 500;
  const errors = report?.metrics.error_count ?? 8;

  const chartData = runs && runs.length > 0
    ? runs.map(r => ({
        name: `Run ${r.run}`,
        Observed: r.observed,
        Baseline: r.baseline,
        Threshold: r.threshold
      }))
    : [
        { name: 'Run 1', Observed: 0.018, Baseline: 0.020, Threshold: 0.100 },
        { name: 'Run 2', Observed: 0.021, Baseline: 0.020, Threshold: 0.100 },
        { name: 'Run 3', Observed: 0.019, Baseline: 0.020, Threshold: 0.100 },
        { name: 'Run 4', Observed: 0.020, Baseline: 0.020, Threshold: 0.100 },
        { name: 'Run 5', Observed: 0.017, Baseline: 0.020, Threshold: 0.100 },
        { name: 'Run 6', Observed: 0.019, Baseline: 0.020, Threshold: 0.100 },
        { name: 'Run 7', Observed: currentQber, Baseline: baseline, Threshold: threshold }
      ];

  const maxVal = Math.max(0.12, ...chartData.map(d => Math.max(d.Observed, d.Threshold)));

  return (
    <div className="soc-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-dark">QBER Analysis</h3>
          <span className="text-[11px] font-mono-tech text-brand-muted uppercase">
            Monte Carlo Sifting
          </span>
        </div>
        <p className="text-xs text-brand-muted mt-0.5">
          Observed error rate across simulation runs
        </p>

        {/* 2D Flat Recharts Visualization */}
        <div className="h-56 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                domain={[0, Math.ceil(maxVal * 10) / 10]}
                tickFormatter={(val) => val.toFixed(2)}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08)'
                }}
                formatter={(value: any) => [Number(value).toFixed(3), '']}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <ReferenceLine
                y={threshold}
                stroke="#DC2626"
                strokeDasharray="4 4"
                label={{
                  value: 'Max Threshold (0.100)',
                  fill: '#DC2626',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              <Line
                type="monotone"
                dataKey="Observed"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Baseline"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="mt-4 pt-3 border-t border-brand-border grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-tech">
        <div className="p-2 bg-brand-background-secondary rounded">
          <span className="text-[10px] uppercase font-sans text-brand-muted block">Current QBER</span>
          <strong className="text-brand-dark">{currentQber.toFixed(3)}</strong>
        </div>
        <div className="p-2 bg-brand-background-secondary rounded">
          <span className="text-[10px] uppercase font-sans text-brand-muted block">Baseline</span>
          <span className="text-brand-slate">{baseline.toFixed(3)}</span>
        </div>
        <div className="p-2 bg-brand-background-secondary rounded">
          <span className="text-[10px] uppercase font-sans text-brand-muted block">Threshold</span>
          <span className="text-brand-red font-medium">{threshold.toFixed(3)}</span>
        </div>
        <div className="p-2 bg-brand-background-secondary rounded">
          <span className="text-[10px] uppercase font-sans text-brand-muted block">Sifted Samples</span>
          <span className="text-brand-dark">{sifted}</span>
        </div>
        <div className="p-2 bg-brand-background-secondary rounded col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-sans text-brand-muted block">Error Count</span>
          <span className={errors > 25 ? 'text-brand-red font-bold' : 'text-brand-dark'}>{errors}</span>
        </div>
      </div>
    </div>
  );
};
