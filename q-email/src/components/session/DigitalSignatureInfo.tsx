import React from 'react';
import { FileSignature, Lock } from 'lucide-react';
import { SignatureInfo } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface DigitalSignatureInfoProps {
  signature: SignatureInfo | null;
}

export const DigitalSignatureInfo: React.FC<DigitalSignatureInfoProps> = ({ signature }) => {
  const sig = signature || {
    signature_id: 'SIG-000001',
    document_name: 'contract.pdf',
    hash_algorithm: 'SHA-256',
    document_hash: 'a8f91c9e7428e21a367469a531b79f64a78129038276f5b9d21c435508a47812',
    bit_length: 256,
    status: 'SIGNED',
    timestamp: '2026-08-25T21:11:15Z'
  };

  return (
    <div className="soc-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-brand-indigo" />
            <h3 className="text-sm font-semibold text-brand-dark">Digital Signature</h3>
          </div>
          <StatusBadge status={sig.status} size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
          <div className="p-2.5 rounded bg-brand-background-secondary border border-brand-border">
            <span className="text-[10px] uppercase font-sans text-brand-muted block font-medium">Signature ID</span>
            <span className="font-mono-tech font-semibold text-brand-dark mt-0.5 block">{sig.signature_id}</span>
          </div>

          <div className="p-2.5 rounded bg-brand-background-secondary border border-brand-border">
            <span className="text-[10px] uppercase font-sans text-brand-muted block font-medium">Document</span>
            <span className="font-semibold text-brand-dark mt-0.5 block">{sig.document_name}</span>
          </div>

          <div className="p-2.5 rounded bg-brand-background-secondary border border-brand-border">
            <span className="text-[10px] uppercase font-sans text-brand-muted block font-medium">Hash Algorithm</span>
            <span className="font-mono-tech font-semibold text-brand-dark mt-0.5 block">{sig.hash_algorithm}</span>
          </div>

          <div className="p-2.5 rounded bg-brand-background-secondary border border-brand-border">
            <span className="text-[10px] uppercase font-sans text-brand-muted block font-medium">Key Bit Length</span>
            <span className="font-mono-tech font-semibold text-brand-dark mt-0.5 block">{sig.bit_length} bits</span>
          </div>
        </div>

        {/* Document Hash */}
        <div className="mt-3 p-2.5 rounded bg-brand-background-secondary border border-brand-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-sans text-brand-muted font-medium">Document SHA-256 Digest</span>
            <span className="text-[10px] font-mono-tech text-brand-emerald flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Verified Digest
            </span>
          </div>
          <div className="font-mono-tech text-[11px] text-brand-dark break-all leading-tight bg-surface p-2 rounded border border-brand-border">
            {sig.document_hash}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-muted">
        <span>Timestamp: <strong className="font-mono-tech text-brand-dark">{sig.timestamp}</strong></span>
        <span>Bell-State Nonce Bound</span>
      </div>
    </div>
  );
};
