import React, { useState, useMemo } from 'react';
import { useSentinel, QuantumNotification } from '@/lib/SentinelContext';
import {
  Bell,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  Radio,
  FileKey2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationCenterDrawer() {
  const {
    notifications,
    unreadNotificationCount,
    isNotificationCenterOpen,
    closeNotificationCenter,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    deleteNotification,
    addNotification,
    eveActive,
    qber,
    chsh,
    pqcMode,
    activeAttack,
    toggleEve,
    resetChannel
  } = useSentinel();

  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'all' | 'security' | 'telemetry' | 'attestation'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qds_notif_sound') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('qds_notif_sound', String(next));
    } catch {}
    toast.info(next ? 'Audio alert signals enabled' : 'Audio alert signals muted');
  };

  const handleSimulateAlert = () => {
    const isThreat = !eveActive;
    addNotification({
      title: isThreat ? 'Simulated Channel Interception Alert' : 'Simulated Channel Sync Nominal',
      message: isThreat
        ? 'Synthetic photon-splitting tap simulated on optical route. QBER elevated to 13.80%, Bell CHSH degraded to S=1.82.'
        : 'Continuous quantum state tomography confirmed Bell state non-locality S=2.79 across Alice-Bob link.',
      severity: isThreat ? 'CRITICAL' : 'SUCCESS',
      category: isThreat ? 'security' : 'telemetry',
      qber: isThreat ? '13.8%' : '1.9%',
      chsh: isThreat ? '1.82' : '2.79',
      sourceNode: isThreat ? 'EVE-SENSOR' : 'BELL-WITNESS',
      actionLabel: isThreat ? 'Inspect in SOC' : 'View Protocol',
      actionRoute: isThreat ? '/monitoring' : '/demonstration'
    });
    toast.success('Simulated quantum notification dispatched');
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'security') {
      return notifications.filter(
        (n) => n.category === 'security' || n.severity === 'CRITICAL' || n.severity === 'WARNING'
      );
    }
    if (filter === 'telemetry') {
      return notifications.filter(
        (n) => n.category === 'telemetry' || n.category === 'protocol' || n.qber !== undefined
      );
    }
    if (filter === 'attestation') {
      return notifications.filter(
        (n) => n.category === 'attestation' || n.sourceNode === 'QN-ALICE' || n.sourceNode === 'ARB-CORE'
      );
    }
    return notifications;
  }, [notifications, filter]);

  if (!isNotificationCenterOpen) return null;

  const handleNavigate = (route: string, notifId: string) => {
    markNotificationAsRead(notifId);
    closeNotificationCenter();
    setLocation(route);
  };

  const getSeverityBadge = (severity: QuantumNotification['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-[#b94a2f]/10 text-[#b94a2f] border-[#b94a2f]/30',
          dot: 'bg-[#b94a2f]',
          icon: ShieldAlert
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          icon: AlertTriangle
        };
      case 'SUCCESS':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: CheckCircle2
        };
      default:
        return {
          bg: 'bg-[#2f6f85]/10 text-[#2f6f85] border-[#2f6f85]/30',
          dot: 'bg-[#2f6f85]',
          icon: Info
        };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={closeNotificationCenter}
      aria-modal="true"
      role="dialog"
      aria-label="Quantum Signal Notifications"
    >
      <div
        className="w-full max-w-[440px] h-full bg-[var(--paper)] text-[var(--ink)] shadow-2xl flex flex-col border-l border-[var(--line)] animate-in slide-in-from-right duration-250 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: 'var(--sans)'
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--paper-deep)]/60">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--copper)] shadow-xs">
                <Bell size={18} className={eveActive ? 'animate-bounce' : ''} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--copper)] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--slate)] flex items-center gap-1.5 font-semibold">
                  <Radio size={11} className={eveActive ? 'text-[var(--copper)] animate-pulse' : 'text-emerald-600'} />
                  QDS / Signal Alerts
                </div>
                <h2 className="text-base font-semibold leading-tight tracking-tight">Notification Center</h2>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-1.5 text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded transition-colors"
                title={soundEnabled ? 'Mute Alert Signals' : 'Enable Alert Signals'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={closeNotificationCenter}
                className="p-1.5 text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded transition-colors"
                aria-label="Close Notification Center"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Real-time Quantum Telemetry Banner */}
          <div className="mt-3 p-2.5 rounded-md bg-[var(--paper)] border border-[var(--line)] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase text-[var(--slate)]">QBER:</span>
                <strong className={qber > 0.055 ? 'text-[var(--copper)]' : 'text-emerald-700 dark:text-emerald-400'}>
                  {(qber * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase text-[var(--slate)]">CHSH S:</span>
                <strong className={chsh < 2.0 ? 'text-[var(--copper)]' : 'text-[#2f6f85]'}>
                  {chsh.toFixed(2)}
                </strong>
              </div>
            </div>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider',
                eveActive
                  ? 'bg-[var(--copper)]/15 text-[var(--copper)] border border-[var(--copper)]/30'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              )}
            >
              {eveActive ? 'Intrusion Detected' : 'Channel Secure'}
            </span>
          </div>

          {/* Action Bar */}
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={markAllNotificationsAsRead}
                disabled={unreadNotificationCount === 0}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--paper-deep)] text-[var(--slate)] hover:text-[var(--ink)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Mark all notifications as read"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
              <button
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--paper)] border border-[var(--line)] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 text-[var(--slate)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Clear all notifications"
              >
                <Trash2 size={13} />
                Clear
              </button>
            </div>
            <button
              onClick={handleSimulateAlert}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[var(--copper)] text-white hover:bg-[var(--copper)]/90 transition-all shadow-xs"
            >
              <Zap size={12} />
              Simulate Test
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-[var(--line)] flex gap-1 overflow-x-auto text-xs font-mono scrollbar-none">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            {
              id: 'security',
              label: 'Threats',
              count: notifications.filter((n) => n.severity === 'CRITICAL' || n.category === 'security').length,
              copper: true
            },
            {
              id: 'telemetry',
              label: 'Bell & QBER',
              count: notifications.filter((n) => n.category === 'telemetry' || n.category === 'protocol').length
            },
            {
              id: 'attestation',
              label: 'Attestations',
              count: notifications.filter((n) => n.category === 'attestation').length
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                'px-2.5 py-1 rounded-sm text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5 border',
                filter === tab.id
                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-semibold shadow-xs'
                  : 'bg-[var(--paper)] text-[var(--slate)] border-[var(--line)] hover:bg-[var(--paper-deep)] hover:text-[var(--ink)]'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1 py-0.2 text-[9px] rounded-full font-bold',
                  filter === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.copper && tab.count > 0
                    ? 'bg-[var(--copper)] text-white'
                    : 'bg-[var(--line)] text-[var(--slate)]'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[var(--line)]/40">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center text-[var(--slate)]">
              <div className="w-12 h-12 rounded-full bg-[var(--paper-deep)] border border-[var(--line)] flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                <Sparkles size={22} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">Quantum Channel Nominal</h3>
              <p className="text-xs max-w-[260px] leading-relaxed">
                No active notifications in this view. All photon entanglement metrics and Bell-state proofs are operating within calibrated bounds.
              </p>
              {eveActive && (
                <button
                  onClick={resetChannel}
                  className="mt-4 px-3 py-1.5 rounded text-xs font-semibold bg-[var(--copper)] text-white hover:bg-[var(--copper)]/90 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  Reset Channel to Clean
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const badge = getSeverityBadge(item.severity);
              const Icon = badge.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'pt-3 first:pt-0 group relative rounded-lg p-3 transition-all duration-150 border',
                    item.read
                      ? 'bg-[var(--paper)]/50 border-transparent hover:border-[var(--line)]'
                      : 'bg-[var(--paper-deep)]/80 border-[var(--line)] shadow-xs'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        'p-1.5 rounded-md border flex-shrink-0 mt-0.5',
                        badge.bg
                      )}
                    >
                      <Icon size={15} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.sourceNode && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--paper)] border border-[var(--line)] text-[var(--slate)] font-bold">
                              {item.sourceNode}
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold',
                              badge.bg
                            )}
                          >
                            {item.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--slate)]">
                          <span>{item.timeAgo || item.timestamp}</span>
                          {!item.read && (
                            <span className={cn('w-2 h-2 rounded-full inline-block ml-0.5', badge.dot)} />
                          )}
                        </div>
                      </div>

                      <h4
                        className={cn(
                          'text-xs leading-snug mb-1',
                          item.read ? 'font-medium text-[var(--ink)]' : 'font-bold text-[var(--ink)]'
                        )}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-[var(--slate)] leading-relaxed mb-2 line-clamp-3">
                        {item.message}
                      </p>

                      {/* Telemetry metadata strip */}
                      {(item.qber !== undefined || item.chsh !== undefined) && (
                        <div className="mb-2 p-1.5 rounded bg-[var(--paper)] border border-[var(--line)] flex items-center gap-3 text-[10px] font-mono">
                          {item.qber !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-[var(--slate)]">QBER:</span>
                              <strong className={parseFloat(item.qber) > 5.5 ? 'text-[var(--copper)]' : 'text-emerald-700 dark:text-emerald-400'}>
                                {item.qber}
                              </strong>
                            </div>
                          )}
                          {item.chsh !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-[var(--slate)]">CHSH (S):</span>
                              <strong className={parseFloat(item.chsh) < 2.0 ? 'text-[var(--copper)]' : 'text-[#2f6f85]'}>
                                {item.chsh}
                              </strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Item Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {item.actionRoute ? (
                          <button
                            onClick={() => handleNavigate(item.actionRoute!, item.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--copper)] hover:underline"
                          >
                            <span>{item.actionLabel || 'Inspect Details'}</span>
                            <ArrowRight size={12} />
                          </button>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {!item.read && (
                            <button
                              onClick={() => markNotificationAsRead(item.id)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--paper-deep)] text-[var(--slate)] hover:text-[var(--ink)]"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="p-1 text-[var(--slate)] hover:text-red-600 rounded transition-colors"
                            title="Delete notification"
                            aria-label="Delete notification"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--line)] bg-[var(--paper-deep)]/40 flex items-center justify-between text-[11px] text-[var(--slate)] font-mono">
          <span className="flex items-center gap-1.5">
            <Activity size={12} className="text-[#2f6f85]" />
            Live QDS Node Monitor
          </span>
          <button
            onClick={() => {
              closeNotificationCenter();
              setLocation('/monitoring');
            }}
            className="text-[var(--copper)] hover:underline flex items-center gap-1 font-semibold"
          >
            Open SOC Console
            <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
