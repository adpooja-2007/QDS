import { useState, useEffect, useCallback } from 'react';
import { TelemetryEvent, SystemNode } from '../types';
import { apiClient } from '../api/client';

export function useTelemetry(sessionId?: string) {
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async (sid?: string) => {
    const targetId = sid || sessionId || 'MOCK-QSEC-001';
    try {
      setLoading(true);
      setError(null);
      const [tData, nData] = await Promise.all([
        apiClient.getTelemetry(targetId),
        apiClient.getNodes()
      ]);
      setTelemetry(tData);
      setNodes(nData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch telemetry');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  return { telemetry, nodes, loading, error, fetchTelemetry };
}
