import React from 'react';
import { Activity, ShieldCheck, Zap, KeyRound } from 'lucide-react';
import { SecurityReport, QuantumSession } from '../../types';
import { MetricCard } from './MetricCard';

interface PrimaryMetricCardsProps {
  report: SecurityReport | null;
  session?: QuantumSession | null;
}

export const PrimaryMetricCards: React.FC<PrimaryMetricCardsProps> = ({ report }) => {
  const qber = report?.metrics.qber ?? 0.018;
  const threshold = report?.metrics.threshold ?? 0.100;
  const chsh = report?.metrics.chsh ?? 2.74;
  const sessionValid = report?.checks.session_valid ?? true;

  const qberStatus = report?.checks.qber_pass ? 'success' : 'danger';
  const chshStatus = report?.checks.chsh_pass ? 'success' : 'danger';
  const validityStatus = sessionValid ? 'success' : 'danger';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: QBER */}
      <MetricCard
        label="QBER"
        value={qber.toFixed(3)}
        subtext="Observed error rate"
        status={qberStatus}
        icon={<Activity className="w-4 h-4" />}
      />

      {/* Card 2: Security Threshold */}
      <MetricCard
        label="SECURITY THRESHOLD"
        value={threshold.toFixed(3)}
        subtext="Configured maximum"
        status="neutral"
        icon={<ShieldCheck className="w-4 h-4" />}
      />

      {/* Card 3: CHSH */}
      <MetricCard
        label="CHSH SCORE"
        value={chsh.toFixed(2)}
        subtext="Bell correlation score"
        status={chshStatus}
        icon={<Zap className="w-4 h-4" />}
      />

      {/* Card 4: Session Validity */}
      <MetricCard
        label="SESSION VALIDITY"
        value={sessionValid ? 'VALID' : 'INVALID'}
        subtext={sessionValid ? 'Session verification passed' : 'Session validity compromised'}
        status={validityStatus}
        icon={<KeyRound className="w-4 h-4" />}
      />
    </div>
  );
};
