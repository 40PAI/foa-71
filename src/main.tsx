<<<<<<< HEAD
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

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global optimization settings (v5 syntax)
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
=======
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(<App />);
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa
