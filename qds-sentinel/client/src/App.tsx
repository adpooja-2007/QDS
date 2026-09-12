import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import NotificationCenterDrawer from "./components/NotificationCenterDrawer";

import { SentinelProvider } from "./lib/SentinelContext";

const getBase = () => {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname.toLowerCase().startsWith("/qds")) {
      return "/QDS";
    }
  }
  return "";
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SentinelProvider>
            <Toaster />
            <WouterRouter base={getBase()}>
              <NotificationCenterDrawer />
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/home" component={Home} />
                <Route path="/demonstration" component={Home} />
                <Route path="/monitoring" component={Home} />
                <Route path="/attack-sandbox" component={Home} />
                <Route path="/transfer" component={Home} />
                <Route path="/database" component={Home} />
                <Route path="/chat" component={ChatPage} />
                <Route path="/404" component={NotFound} />
                <Route component={NotFound} />
              </Switch>
            </WouterRouter>
          </SentinelProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
