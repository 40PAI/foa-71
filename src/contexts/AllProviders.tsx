import { ReactNode } from "react";
import { AppProvider } from "./AppContext";
import { NotificationProvider } from "./NotificationContext";
import { ThemeProvider } from "./ThemeContext";
import { LoadingProvider } from "./LoadingContext";
import { AuthProvider } from "./AuthContext";
import { ProjectProvider } from "./ProjectContext";

interface AllProvidersProps {
  children: ReactNode;
}

export function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider>
      <AppProvider>
        <LoadingProvider>
          <NotificationProvider>
            <AuthProvider>
              <ProjectProvider>
                {children}
              </ProjectProvider>
            </AuthProvider>
          </NotificationProvider>
        </LoadingProvider>
      </AppProvider>
    </ThemeProvider>
  );
}