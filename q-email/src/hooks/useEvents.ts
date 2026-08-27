import { useState, useEffect, useCallback } from 'react';
import { ProtocolEvent } from '../types';
import { apiClient } from '../api/client';

export function useEvents(sessionId?: string) {
  const [events, setEvents] = useState<ProtocolEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (sid?: string) => {
    const targetId = sid || sessionId || 'MOCK-QSEC-001';
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getEvents(targetId);
      setEvents(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch protocol events');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, fetchEvents };
}
