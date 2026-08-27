import { useState, useEffect, useCallback } from 'react';
import { sentinelService } from '../services/sentinelService';
import {
  QuantumSession,
  PipelineStep,
  QuantumNode,
  SecurityIncident,
  TelemetryLog,
  SystemPerformance,
  HistoricalPoint,
} from '../types/sentinel';

export function useSentinel() {
  const [sessions, setSessions] = useState<QuantumSession[]>(() => sentinelService.getSessions());
  const [activeSession, setActiveSessionState] = useState<QuantumSession>(() => sentinelService.getActiveSession());
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(() => sentinelService.getPipelineSteps());
  const [nodes, setNodes] = useState<QuantumNode[]>(() => sentinelService.getNodes());
  const [incidents, setIncidents] = useState<SecurityIncident[]>(() => sentinelService.getIncidents());
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>(() => sentinelService.getHistoricalData());
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>(() => sentinelService.getTelemetryLogs());
  const [performance, setPerformance] = useState<SystemPerformance>(() => sentinelService.getPerformance());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshState = useCallback(() => {
    setSessions(sentinelService.getSessions());
    setActiveSessionState(sentinelService.getActiveSession());
    setPipelineSteps(sentinelService.getPipelineSteps());
    setNodes(sentinelService.getNodes());
    setIncidents(sentinelService.getIncidents());
    setHistoricalData(sentinelService.getHistoricalData());
    setTelemetryLogs(sentinelService.getTelemetryLogs());
    setPerformance(sentinelService.getPerformance());
  }, []);

  useEffect(() => {
    // Initial sync
    sentinelService.syncWithBackend().then(refreshState);

    // Periodic auto-sync every 2.5s
    const timer = setInterval(() => {
      sentinelService.syncWithBackend().then(refreshState);
    }, 2500);

    return () => clearInterval(timer);
  }, [refreshState]);


  const selectSession = useCallback((sessionId: string) => {
    sentinelService.setActiveSession(sessionId);
    setActiveSessionState(sentinelService.getActiveSession());
  }, []);

  const createNewSignature = useCallback(async (docName: string, sizeKb: number, isEveActive?: boolean, attackType?: string) => {
    setIsLoading(true);
    const newSession = await sentinelService.createSessionAsync(docName, sizeKb, isEveActive, attackType);
    refreshState();
    setIsLoading(false);
    return newSession;
  }, [refreshState]);

  return {
    sessions,
    activeSession,
    pipelineSteps,
    nodes,
    incidents,
    historicalData,
    telemetryLogs,
    performance,
    isLoading,
    selectSession,
    createNewSignature,
    refreshState,
  };
}

