import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardSkeleton } from "@/components/loading-skeleton";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const Features = lazy(() => import("@/pages/features"));
const Pricing = lazy(() => import("@/pages/pricing"));
const About = lazy(() => import("@/pages/about"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Simple loading component for public pages
function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--ink-muted)]">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public pages */}
        <Route path="/" component={Home} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/about" component={About} />

        {/* Auth pages */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        {/* App pages */}
        <Route path="/app">
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        </Route>

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
