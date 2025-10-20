// Centralized context hooks for better performance and consistency

import { useApp } from "@/contexts/AppContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLoading } from "@/contexts/LoadingContext";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useMemo } from "react";

// Combined hooks for common patterns - OPTIMIZED with memoization
export function useAppState() {
  const app = useApp();
  const theme = useTheme();
  const loading = useLoading();
  
  // Memoize to prevent unnecessary re-renders
  return useMemo(() => ({
    ...app,
    ...theme,
    ...loading,
  }), [app, theme, loading]);
}

export function useProjectState() {
  const project = useProjectContext();
  const notification = useNotification();
  const loading = useLoading();
  
  const selectProject = useCallback((id: number | null) => {
    if (id) {
      loading.startLoading('project-selection');
    }
    
    project.setSelectedProjectId(id);
    
    if (id) {
      notification.info(`Projeto ${id} selecionado`);
      setTimeout(() => loading.stopLoading('project-selection'), 500);
    }
  }, [project.setSelectedProjectId, notification.info, loading]);

  // Memoize to prevent unnecessary re-renders
  return useMemo(() => ({
    ...project,
    selectProject,
  }), [project, selectProject]);
}

export function useUserState() {
  const auth = useAuth();
  const notification = useNotification();
  const loading = useLoading();
  
  const signInWithFeedback = useCallback(async (email: string, password: string) => {
    loading.startLoading('signin');
    
    try {
      const result = await auth.signIn(email, password);
      
      loading.stopLoading('signin');
      
      if (result.error) {
        notification.error('Erro no login: ' + result.error.message);
        return result;
      }
      
      notification.success('Login realizado com sucesso!');
      return result;
    } catch (error) {
      loading.stopLoading('signin');
      notification.error('Erro inesperado no login');
      return { error };
    }
  }, [auth.signIn, notification, loading]);

  const signOutWithFeedback = useCallback(async () => {
    loading.startLoading('signout');
    
    try {
      await auth.signOut();
      loading.stopLoading('signout');
      notification.success('Logout realizado com sucesso!');
    } catch (error) {
      loading.stopLoading('signout');
      notification.error('Erro no logout');
    }
  }, [auth.signOut, notification, loading]);

  // Memoize to prevent unnecessary re-renders
  return useMemo(() => ({
    ...auth,
    signInWithFeedback,
    signOutWithFeedback,
  }), [auth, signInWithFeedback, signOutWithFeedback]);
}

// Performance and UX helpers
export function useOptimizedNotifications() {
  const notification = useNotification();
  
  const successOperation = useCallback((message: string, operation?: string) => {
    notification.success(message, {
      action: operation ? {
        label: 'Desfazer',
        onClick: () => notification.info(`Ação "${operation}" desfeita`),
      } : undefined,
    });
  }, [notification]);

  const errorWithRetry = useCallback((message: string, retryFn?: () => void) => {
    notification.error(message, {
      action: retryFn ? {
        label: 'Tentar Novamente',
        onClick: retryFn,
      } : undefined,
    });
  }, [notification]);

  const confirmAction = useCallback((message: string, onConfirm: () => void) => {
    notification.warning(message, {
      duration: 10000,
      action: {
        label: 'Confirmar',
        onClick: onConfirm,
      },
      cancel: {
        label: 'Cancelar',
      },
    });
  }, [notification]);

  // Memoize to prevent unnecessary re-renders
  return useMemo(() => ({
    ...notification,
    successOperation,
    errorWithRetry,
    confirmAction,
  }), [notification, successOperation, errorWithRetry, confirmAction]);
}