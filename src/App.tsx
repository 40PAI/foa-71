<<<<<<< HEAD

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import { AuthPage } from "@/pages/AuthPage";
import { RegisterInvitationPage } from "@/pages/RegisterInvitationPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/register-invitation" element={!user ? <RegisterInvitationPage /> : <Navigate to="/" />} />
      <Route path="/*" element={user ? <Index /> : <Navigate to="/auth" />} />
    </Routes>
  );
}
=======
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa

export default App;
