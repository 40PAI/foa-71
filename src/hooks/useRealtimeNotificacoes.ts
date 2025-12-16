import { useEffect, useRef, useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificacaoRealtime {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  projeto_id?: number;
  centro_custo_id?: string;
  severidade: string;
  lida: boolean;
  created_at: string;
  destinatario_role?: string[];
  destinatario_user_id?: string;
  som_ativado?: boolean;
  acao_url?: string;
  entidade_tipo?: string;
  entidade_id?: string;
}

// Sound utility
const playNotificationSound = () => {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification tone
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.1); // C6
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

export function useRealtimeNotificacoes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('notification_sound_enabled');
    return stored !== 'false';
  });
  const lastNotificationRef = useRef<string | null>(null);

  const userRole = profile?.cargo;

  // Fetch notifications filtered by user role
  const { data: notificacoes = [], isLoading, refetch } = useQuery({
    queryKey: ["notificacoes-realtime", userRole],
    queryFn: async () => {
      if (!userRole) return [];

      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .or(`destinatario_role.cs.{${userRole}},destinatario_user_id.eq.${profile?.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as NotificacaoRealtime[];
    },
    enabled: !!userRole,
    staleTime: 30000,
  });

  // Calculate unread count
  useEffect(() => {
    const count = notificacoes.filter(n => !n.lida).length;
    setUnreadCount(count);
  }, [notificacoes]);

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificacaoId: string) => {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", notificacaoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes-realtime"] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userRole || !profile?.id) return;
      
      const unreadIds = notificacoes.filter(n => !n.lida).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .in("id", unreadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes-realtime"] });
    },
  });

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('notification_sound_enabled', String(newValue));
      return newValue;
    });
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userRole) return;

    const channel = supabase
      .channel('notificacoes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes'
        },
        (payload) => {
          const newNotification = payload.new as NotificacaoRealtime;
          
          // Check if notification is for this user's role
          const isForUser = 
            newNotification.destinatario_role?.includes(userRole) ||
            newNotification.destinatario_user_id === profile?.id;

          if (isForUser && newNotification.id !== lastNotificationRef.current) {
            lastNotificationRef.current = newNotification.id;
            
            // Play sound if enabled and notification has sound activated
            if (soundEnabled && newNotification.som_ativado) {
              playNotificationSound();
            }

            // Refresh notifications
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, profile?.id, soundEnabled, refetch]);

  // Run periodic check on mount
  useEffect(() => {
    const checkPeriodic = async () => {
      try {
        await supabase.rpc('verificar_notificacoes_periodicas');
        refetch();
      } catch (error) {
        console.log('Periodic notification check failed:', error);
      }
    };

    // Check on mount and every 5 minutes
    checkPeriodic();
    const interval = setInterval(checkPeriodic, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    notificacoes,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    soundEnabled,
    toggleSound,
    refetch,
  };
}
