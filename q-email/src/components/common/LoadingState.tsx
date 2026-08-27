import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading security data...',
  subtext = 'Connecting to Quantum Security Engine'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="w-6 h-6 text-brand-indigo animate-spin mb-3" />
      <p className="text-sm font-medium text-brand-dark">{message}</p>
      {subtext && <p className="text-xs text-brand-muted mt-1">{subtext}</p>}
    </div>
  );
};
