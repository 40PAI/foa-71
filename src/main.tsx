// Main application entry point - FOA SmartSite
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
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

// Create persister for localStorage cache persistence
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "FOA_QUERY_CACHE", // Unique key for this app's cache
  // Optional: serialize/deserialize for custom handling
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours - cache expires after 1 day
        buster: "v1", // Increment this to invalidate old cache on version changes
        dehydrateOptions: {
          // Don't persist queries that are still loading or errored
          shouldDehydrateQuery: (query) => {
            return query.state.status === "success";
          },
        },
      }}
    >
      <BrowserRouter>
        <AllProviders>
          <TooltipProvider>
            <App />
            <Toaster />
          </TooltipProvider>
        </AllProviders>
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>
);
