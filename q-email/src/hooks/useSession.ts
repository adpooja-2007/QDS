import { useState, useEffect, useCallback } from 'react';
import { QuantumSession, CreateSessionPayload, MockScenarioType } from '../types';
import { apiClient } from '../api/client';

export function useSession() {
  const [session, setSession] = useState<QuantumSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<MockScenarioType>('CLEAN');

  const fetchSession = useCallback(async (sessionId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSession(sessionId || 'MOCK-QSEC-001');
      setSession(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load session');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = async (payload: CreateSessionPayload) => {
    try {
      setLoading(true);
      setError(null);
      const newSession = await apiClient.createSession(payload);
      setSession(newSession);
      return newSession;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create session');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runVerification = async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      await apiClient.runSession(session.session_id);
      const updated = await apiClient.getSession(session.session_id);
      setSession(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to run verification workflow');
      }
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      await apiClient.closeSession(session.session_id);
      const updated = await apiClient.getSession(session.session_id);
      setSession(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchScenario = (scenario: MockScenarioType) => {
    apiClient.setMockScenario(scenario);
    setActiveScenario(scenario);
    fetchSession();
  };

  const resetSession = () => {
    apiClient.resetMockSession();
    setActiveScenario('CLEAN');
    fetchSession();
  };

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
    activeScenario,
    fetchSession,
    createSession,
    runVerification,
    closeSession,
    switchScenario,
    resetSession,
    isMockMode: apiClient.isMockMode()
  };
}
