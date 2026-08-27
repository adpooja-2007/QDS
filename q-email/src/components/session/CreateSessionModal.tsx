import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { CreateSessionPayload } from '../../types';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSessionPayload) => Promise<void>;
  loading?: boolean;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [eprPairCount, setEprPairCount] = useState<number>(1000);
  const [keyLength, setKeyLength] = useState<number>(256);
  const [baselineQber, setBaselineQber] = useState<number>(0.02);
  const [alpha, setAlpha] = useState<number>(0.000001);
  const [protocolVersion, setProtocolVersion] = useState<string>('1.0');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      epr_pair_count: Number(eprPairCount),
      key_length: Number(keyLength),
      baseline_qber: Number(baselineQber),
      alpha: Number(alpha),
      protocol_version: protocolVersion
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-surface border border-brand-border rounded-xl shadow-hover w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-brand-indigo-light text-brand-indigo">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-dark">Create Security Session</h3>
              <p className="text-[11px] text-brand-muted">Initialize quantum entanglement channel parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-dark p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-brand-dark mb-1">
              Number of EPR Pairs
            </label>
            <input
              type="number"
              value={eprPairCount}
              onChange={(e) => setEprPairCount(Number(e.target.value))}
              min={100}
              max={10000}
              step={100}
              className="w-full px-3 py-1.5 rounded border border-brand-border bg-brand-background-secondary font-mono-tech text-xs focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-brand-dark mb-1">
              Key Length (Bits)
            </label>
            <input
              type="number"
              value={keyLength}
              onChange={(e) => setKeyLength(Number(e.target.value))}
              min={128}
              max={1024}
              step={64}
              className="w-full px-3 py-1.5 rounded border border-brand-border bg-brand-background-secondary font-mono-tech text-xs focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-brand-dark mb-1">
                Baseline QBER
              </label>
              <input
                type="number"
                value={baselineQber}
                onChange={(e) => setBaselineQber(Number(e.target.value))}
                min={0}
                max={0.2}
                step={0.005}
                className="w-full px-3 py-1.5 rounded border border-brand-border bg-brand-background-secondary font-mono-tech text-xs focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-brand-dark mb-1">
                Alpha (Tolerance)
              </label>
              <input
                type="number"
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                min={0.0000001}
                max={0.01}
                step={0.000001}
                className="w-full px-3 py-1.5 rounded border border-brand-border bg-brand-background-secondary font-mono-tech text-xs focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-brand-dark mb-1">
              Protocol Version
            </label>
            <input
              type="text"
              value={protocolVersion}
              onChange={(e) => setProtocolVersion(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-brand-border bg-brand-background-secondary font-mono-tech text-xs focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-1.5 px-4"
            >
              <Plus className="w-3.5 h-3.5" />
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
