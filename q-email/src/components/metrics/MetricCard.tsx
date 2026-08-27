import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  status?: 'success' | 'danger' | 'warning' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  status = 'neutral',
  icon
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-brand-emerald';
      case 'danger':
        return 'text-brand-red';
      case 'warning':
        return 'text-brand-amber';
      default:
        return 'text-brand-dark';
    }
  };

  return (
    <div className="soc-card p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-brand-muted">{icon}</span>}
      </div>

      <div className="my-3">
        <div className={`text-2xl sm:text-3xl font-semibold font-mono-tech tracking-tight ${getStatusColor()}`}>
          {value}
        </div>
      </div>

      <div className="text-xs text-brand-muted font-normal">
        {subtext}
      </div>
    </div>
  );
};
