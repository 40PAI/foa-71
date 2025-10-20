import { createContext, useContext, ReactNode, useCallback } from "react";
import { toast } from "sonner";

interface NotificationContextType {
  success: (message: string, options?: NotificationOptions) => void;
  error: (message: string, options?: NotificationOptions) => void;
  warning: (message: string, options?: NotificationOptions) => void;
  info: (message: string, options?: NotificationOptions) => void;
  loading: (message: string, options?: LoadingNotificationOptions) => string | number;
  dismiss: (toastId?: string | number) => void;
}

interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

interface LoadingNotificationOptions extends Omit<NotificationOptions, 'action' | 'cancel'> {
  promise?: Promise<any>;
  success?: string | ((data: any) => string);
  error?: string | ((error: any) => string);
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const success = useCallback((message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      cancel: options?.cancel ? {
        label: options.cancel.label,
        onClick: options.cancel.onClick,
      } : undefined,
    });
  }, []);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      duration: options?.duration || 6000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      cancel: options?.cancel ? {
        label: options.cancel.label,
        onClick: options.cancel.onClick,
      } : undefined,
    });
  }, []);

  const warning = useCallback((message: string, options?: NotificationOptions) => {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      cancel: options?.cancel ? {
        label: options.cancel.label,
        onClick: options.cancel.onClick,
      } : undefined,
    });
  }, []);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    return toast.info(message, {
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      cancel: options?.cancel ? {
        label: options.cancel.label,
        onClick: options.cancel.onClick,
      } : undefined,
    });
  }, []);

  const loading = useCallback((message: string, options?: LoadingNotificationOptions) => {
    if (options?.promise) {
      return toast.promise(options.promise, {
        loading: message,
        success: options.success || "Operação concluída com sucesso!",
        error: options.error || "Erro na operação",
        duration: options?.duration,
      });
    }
    
    return toast.loading(message, {
      duration: options?.duration || Infinity,
    });
  }, []);

  const dismiss = useCallback((toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      success,
      error,
      warning,
      info,
      loading,
      dismiss,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}