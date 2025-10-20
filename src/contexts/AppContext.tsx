import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppSettings {
  sidebarCollapsed: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  language: 'pt' | 'en';
  autoSave: boolean;
  refreshInterval: number;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSidebar: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
}

const defaultSettings: AppSettings = {
  sidebarCollapsed: false,
  density: 'comfortable',
  language: 'pt',
  autoSave: true,
  refreshInterval: 30000, // 30 seconds
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('app-settings', JSON.stringify(updated));
  };

  const toggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  };

  // Auto-clear global errors after 5 seconds
  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      toggleSidebar,
      isLoading,
      setIsLoading,
      globalError,
      setGlobalError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}