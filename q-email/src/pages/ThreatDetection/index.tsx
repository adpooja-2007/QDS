import React from 'react';
import { QuantumSession, HistoricalPoint } from '../../types/sentinel';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ThreatDetectionProps {
  activeSession: QuantumSession;
  historicalData: HistoricalPoint[];
}

export const ThreatDetectionPage: React.FC<ThreatDetectionProps> = ({
  activeSession,
  historicalData,
}) => {
  const { metrics, verdict } = activeSession;
  const isAccept = verdict.verdict === 'ACCEPT';

  return (
    <div className="space-y-5 pb-8 max-w-[1600px] mx-auto">
      {/* ─── Compact Security Metrics Row (4 Cards) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* QBER */}
        <div className="sentinel-card p-3.5">
          <div className="sentinel-label text-[10px] mb-1">OBSERVED QBER</div>
          <div className={`text-[22px] font-bold font-mono ${metrics.qber > metrics.hoeffding_threshold ? 'text-[#D92D20]' : 'text-[#182033]'}`}>
            {(metrics.qber * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#667085] font-mono mt-1">
            Baseline: {(metrics.baseline_qber * 100).toFixed(1)}%
          </div>
        </div>

        {/* Hoeffding Threshold */}
        <div className="sentinel-card p-3.5">
          <div className="sentinel-label text-[10px] mb-1">HOEFFDING THRESHOLD</div>
          <div className="text-[22px] font-bold font-mono text-[#4169D8]">
            {(metrics.hoeffding_threshold * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#667085] font-mono mt-1">
            Confidence: {(metrics.confidence_level * 100).toFixed(1)}% (α = 0.001)
          </div>
        </div>

        {/* CHSH Score */}
        <div className="sentinel-card p-3.5">
          <div className="sentinel-label text-[10px] mb-1">CHSH SCORE</div>
          <div className={`text-[22px] font-bold font-mono ${metrics.chsh_score < metrics.classical_limit ? 'text-[#D92D20]' : 'text-[#6C63D9]'}`}>
            {metrics.chsh_score.toFixed(3)}
          </div>
          <div className="text-[10px] text-[#667085] font-mono mt-1">
            Classical Bound: 2.000
          </div>
        </div>

        {/* Security Verdict */}
        <div className="sentinel-card p-3.5">
          <div className="sentinel-label text-[10px] mb-1">SECURITY VERDICT</div>
          <div className={`text-[22px] font-bold font-mono ${isAccept ? 'text-[#4169D8]' : 'text-[#D92D20]'}`}>
            {verdict.verdict}
          </div>
          <div className="text-[10px] text-[#667085] font-mono mt-1">
            {isAccept ? 'Integrity Confirmed' : (verdict.threat_type || 'Threat Alert')}
          </div>
        </div>
      </div>

      {/* ─── Statistical Analysis Charts (2 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* QBER Hoeffding Analysis */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="sentinel-card-title">Hoeffding Statistical Bound Analysis</div>
              <div className="sentinel-card-subtitle">
                Sample size N = {metrics.sifted_bits.toLocaleString()} bits · α = {metrics.alpha}
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${verdict.hoeffding_pass ? 'bg-[#EEF3FF] text-[#4169D8]' : 'bg-[#FEF3F2] text-[#D92D20]'}`}>
              {verdict.hoeffding_pass ? 'HOEFFDING PASS' : 'BOUND BREACHED'}
            </span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="time" tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <Tooltip />
                <ReferenceLine y={0.055} stroke="#D92D20" strokeDasharray="3 3" label={{ value: 'BOUND (5.5%)', fill: '#D92D20', fontSize: 9 }} />
                <Line type="monotone" dataKey="qber" stroke="#4169D8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 bg-[#FAFBFD] border border-[#EEF0F5] rounded text-[11px] text-[#475467] font-mono leading-relaxed">
            <strong>Statistical Rationale: </strong>
            Hoeffding inequality ensures with probability ≥ 99.9% that the asymptotic error rate does not exceed observed sample variance plus statistical deviation bound.
          </div>
        </div>

        {/* CHSH Bell Inequality Analysis */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="sentinel-card-title">CHSH Bell-Test Entanglement Correlation</div>
              <div className="sentinel-card-subtitle">
                Classical Local Realism Limit S ≤ 2.000 · Tsirelson S ≤ 2.828
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${verdict.chsh_pass ? 'bg-[#F4F3FC] text-[#6C63D9]' : 'bg-[#FEF3F2] text-[#D92D20]'}`}>
              {verdict.chsh_pass ? 'QUANTUM ENTANGLED' : 'BELL VIOLATION FAILED'}
            </span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="time" tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <YAxis domain={[1.5, 3.0]} tick={{ fill: '#667085', fontSize: 10, fontFamily: 'monospace' }} stroke="#D0D5DD" />
                <Tooltip />
                <ReferenceLine y={2.000} stroke="#667085" strokeDasharray="3 3" label={{ value: 'CLASSICAL (2.0)', fill: '#667085', fontSize: 9 }} />
                <ReferenceLine y={2.828} stroke="#6C63D9" strokeDasharray="2 2" label={{ value: 'TSIRELSON (2.828)', fill: '#6C63D9', fontSize: 9 }} />
                <Line type="monotone" dataKey="chsh" stroke="#6C63D9" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 bg-[#FAFBFD] border border-[#EEF0F5] rounded text-[11px] text-[#475467] font-mono leading-relaxed">
            <strong>Bell Physics Rationale: </strong>
            CHSH parameter S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|. A value &gt; 2.0 confirms genuine non-local quantum correlations. Combined with QBER bound, it rules out intercept-resend adversaries.
          </div>
        </div>
      </div>

      {/* ─── Security Decision Breakdown ─── */}
      <div className="sentinel-card p-4">
        <div className="sentinel-card-title mb-3">
          Comprehensive Security Verdict Evaluation
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
          {/* Check 1 */}
          <div className="p-3 bg-[#F9FAFC] border border-[#EAECF0] rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[#667085] font-semibold">1. QBER vs Statistical Bound</span>
              {verdict.hoeffding_pass ? (
                <CheckCircle2 size={14} className="text-[#4169D8]" />
              ) : (
                <XCircle size={14} className="text-[#D92D20]" />
              )}
            </div>
            <div className="text-[#182033]">
              Observed: <strong>{(metrics.qber * 100).toFixed(2)}%</strong> (Bound: ≤ {(metrics.hoeffding_threshold * 100).toFixed(2)}%)
            </div>
            <div className="text-[#667085] text-[10px] mt-1">
              {verdict.hoeffding_pass ? 'Pass: Error rate within safe threshold' : 'Fail: Excessive error rate indicates tampering'}
            </div>
          </div>

          {/* Check 2 */}
          <div className="p-3 bg-[#F9FAFC] border border-[#EAECF0] rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[#667085] font-semibold">2. CHSH vs Classical Limit</span>
              {verdict.chsh_pass ? (
                <CheckCircle2 size={14} className="text-[#6C63D9]" />
              ) : (
                <XCircle size={14} className="text-[#D92D20]" />
              )}
            </div>
            <div className="text-[#182033]">
              Observed: <strong>{metrics.chsh_score.toFixed(3)}</strong> (Limit: &gt; 2.000)
            </div>
            <div className="text-[#667085] text-[10px] mt-1">
              {verdict.chsh_pass ? 'Pass: Non-local quantum entanglement validated' : 'Fail: Collapsed to classical correlation'}
            </div>
          </div>

          {/* Check 3 */}
          <div className="p-3 bg-[#F9FAFC] border border-[#EAECF0] rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[#667085] font-semibold">3. Signature Cross-Check</span>
              {verdict.signature_pass ? (
                <CheckCircle2 size={14} className="text-[#4169D8]" />
              ) : (
                <XCircle size={14} className="text-[#D92D20]" />
              )}
            </div>
            <div className="text-[#182033]">
              Arbitrator Validation: <strong>{verdict.signature_pass ? 'MATCH' : 'MISMATCH'}</strong>
            </div>
            <div className="text-[#667085] text-[10px] mt-1">
              {verdict.signature_pass ? 'Pass: Document hash matches signed key' : 'Fail: Digest discrepancy detected'}
            </div>
          </div>
        </div>

        {/* Verdict Explanation Box */}
        <div className={`mt-4 p-3.5 rounded-md border text-[12px] leading-relaxed ${isAccept ? 'bg-[#EEF3FF]/50 border-[#D0DCFC] text-[#344054]' : 'bg-[#FEF3F2] border-[#FECDCA] text-[#7A271A]'}`}>
          <strong className="font-mono">{isAccept ? 'FINAL VERDICT: ACCEPT' : 'FINAL VERDICT: REJECT'} — </strong>
          {verdict.reason}
        </div>
      </div>
    </div>
  );
};
