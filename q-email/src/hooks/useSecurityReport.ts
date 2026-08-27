import { useState, useEffect, useCallback } from 'react';
import { SecurityReport, SignatureInfo } from '../types';
import { apiClient } from '../api/client';
import { mockApiClient } from '../api/mockClient';

export function useSecurityReport(sessionId?: string) {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [signature, setSignature] = useState<SignatureInfo | null>(null);
  const [qberRuns, setQberRuns] = useState<{ run: number; observed: number; baseline: number; threshold: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditInProgress, setAuditInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (sid?: string) => {
    const targetId = sid || sessionId || 'MOCK-QSEC-001';
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSecurityReport(targetId);
      setReport(data);

      const runs = await apiClient.getQberRuns(targetId);
      setQberRuns(runs);

      // Fetch signature info
      const sigData = await mockApiClient.signDocument({ session_id: targetId, document_name: 'contract.pdf' });
      setSignature(sigData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch security report');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const runSecurityAudit = async () => {
    const targetId = sessionId || 'MOCK-QSEC-001';
    try {
      setAuditInProgress(true);
      setError(null);
      const auditResult = await apiClient.runSecurityAudit(targetId);
      setReport(auditResult);
      const runs = await apiClient.getQberRuns(targetId);
      setQberRuns(runs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to run security audit');
      }
    } finally {
      setAuditInProgress(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    signature,
    qberRuns,
    loading,
    auditInProgress,
    error,
    fetchReport,
    runSecurityAudit
  };
}
