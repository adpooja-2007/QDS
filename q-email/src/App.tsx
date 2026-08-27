import React, { useState, useEffect } from 'react';
import { useSentinel } from './hooks/useSentinel';

import { HomePage } from './pages/Home/index';
import { DemonstrationPage } from './pages/Demonstration/index';
import { MonitoringPage } from './pages/Monitoring/index';
import { AttackSandboxPage } from './pages/AttackSandbox/index';
import { DatabaseInspectorPage } from './pages/DatabaseInspector/index';

type ActiveView = 'home' | 'demonstration' | 'monitoring' | 'attack-sandbox' | 'database';

export const App: React.FC = () => {
  // Parse initial route from window.location.pathname
  const getInitialRoute = (): ActiveView => {
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    if (path.startsWith('demonstration') || path.startsWith('demo')) return 'demonstration';
    if (path.startsWith('monitoring') || path.startsWith('monitor')) return 'monitoring';
    if (path.startsWith('attack') || path.startsWith('sandbox')) return 'attack-sandbox';
    if (path.startsWith('database') || path.startsWith('db')) return 'database';
    return 'home';
  };

  const [activeView, setActiveView] = useState<ActiveView>(getInitialRoute);

  // Core Sentinel telemetry engine hooks
  const {
    activeSession,
    sessions,
    incidents,
    telemetryLogs,
    performance,
    historicalData,
    nodes,
    selectSession,
    createNewSignature
  } = useSentinel();

  // Handle SPA routing & browser history
  const handleNavigate = (route: string) => {
    const cleanRoute = route.replace(/^\//, '').toLowerCase();
    let targetView: ActiveView = 'home';
    if (cleanRoute.startsWith('demonstration') || cleanRoute.startsWith('demo')) targetView = 'demonstration';
    else if (cleanRoute.startsWith('monitoring') || cleanRoute.startsWith('monitor')) targetView = 'monitoring';
    else if (cleanRoute.startsWith('attack') || cleanRoute.startsWith('sandbox')) targetView = 'attack-sandbox';
    else if (cleanRoute.startsWith('database') || cleanRoute.startsWith('db')) targetView = 'database';

    setActiveView(targetView);
    const targetPath = targetView === 'home' ? '/' : `/${targetView}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: targetView }, '', targetPath);
    }
  };

  // Sync browser back/forward buttons with active page
  useEffect(() => {
    const onPopState = () => {
      setActiveView(getInitialRoute());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Render dedicated standalone webpages with natural viewport fit and overflow scroll
  return (
    <div className="h-screen w-screen overflow-auto bg-[#FBF8FA] text-[#1B1B1D]">
      <div className={`h-full w-full ${activeView === 'home' ? 'flex flex-col' : 'hidden'}`}>
        <HomePage
          onNavigate={handleNavigate}
          activeSession={activeSession}
          sessions={sessions}
          incidents={incidents}
          telemetryLogs={telemetryLogs}
          performance={performance}
        />
      </div>

      <div className={`h-full w-full ${activeView === 'demonstration' ? 'flex flex-col' : 'hidden'}`}>
        <DemonstrationPage
          activeSession={activeSession}
          sessions={sessions}
          incidents={incidents}
          telemetryLogs={telemetryLogs}
          performance={performance}
          onNavigateHome={() => handleNavigate('home')}
          onNavigateMonitoring={() => handleNavigate('monitoring')}
          onGenerateSignature={createNewSignature}
        />
      </div>

      <div className={`h-full w-full ${activeView === 'monitoring' ? 'flex flex-col' : 'hidden'}`}>
        <MonitoringPage
          telemetryLogs={telemetryLogs}
          performance={performance}
          historicalData={historicalData}
          sessions={sessions}
          activeSession={activeSession}
          nodes={nodes}
          incidents={incidents}
          onSelectSession={selectSession}
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDemonstration={() => handleNavigate('demonstration')}
        />
      </div>

      <div className={`h-full w-full ${activeView === 'attack-sandbox' ? 'flex flex-col' : 'hidden'}`}>
        <AttackSandboxPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDemonstration={() => handleNavigate('demonstration')}
          onNavigateMonitoring={() => handleNavigate('monitoring')}
        />
      </div>

      <div className={`h-full w-full ${activeView === 'database' ? 'flex flex-col' : 'hidden'}`}>
        <DatabaseInspectorPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDemonstration={() => handleNavigate('demonstration')}
          onNavigateMonitoring={() => handleNavigate('monitoring')}
          onNavigateAttackSandbox={() => handleNavigate('attack-sandbox')}
        />
      </div>
    </div>
  );
};

export default App;
