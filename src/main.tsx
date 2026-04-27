// Main application entry point - FOA SmartSite
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AllProviders } from "@/contexts/AllProviders";
import App from "./App.tsx";
import "./index.css";
import "./styles/status-theme.css";

// Optimized QueryClient configuration with persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized for cross-device sync responsiveness
      staleTime: 15 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
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
