// Main application entry point - FOA SmartSite
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AllProviders } from "@/contexts/AllProviders";
import { setupCachePersistence } from "@/lib/queryPersistence";
import App from "./App.tsx";
import "./index.css";
import "./styles/status-theme.css";

// Optimized QueryClient configuration with persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized for cross-device sync responsiveness
      staleTime: 60 * 1000, // 1 minute (was 5min) — fresher data
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true, // refetch when user returns to tab
      refetchOnMount: true, // refetch on mount to catch external changes
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Setup automatic cache persistence (load on mount, save on unload/hide)
setupCachePersistence(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AllProviders>
          <TooltipProvider>
            <App />
            <Toaster />
          </TooltipProvider>
        </AllProviders>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
