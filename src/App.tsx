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

export default App;
