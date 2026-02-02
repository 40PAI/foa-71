import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface CriticalStockItem {
  id: string;
  nome: string;
  codigo: string;
  stock_atual: number;
  stock_minimo: number;
  projeto_id: number | null;
}

// Roles que têm acesso ao armazém
const WAREHOUSE_ROLES = [
  'diretor_tecnico',
  'coordenacao_direcao',
  'encarregado_obra',
  'assistente_compras',
  'admin'
];

// Sound utility for critical stock alerts
const playCriticalStockSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Alert tone - more urgent (three beeps)
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime); // E5
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.15); // G5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.3); // E5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.45);
  } catch (error) {
    console.log('Could not play critical stock sound:', error);
  }
};

export function useCriticalStock() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const hasAlertedRef = useRef(false);
  
  const userRole = profile?.cargo;
  const hasWarehouseAccess = userRole && WAREHOUSE_ROLES.includes(userRole);

  // Fetch materials with critical stock (< 10 units) - direct query
  const { data: criticalItems = [], isLoading, refetch } = useQuery({
    queryKey: ["critical-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais_armazem')
        .select('id, nome_material, codigo_interno, quantidade_stock, projeto_alocado_id')
        .lt('quantidade_stock', 10)
        .order('quantidade_stock', { ascending: true });
      
      if (error) {
        console.error('Error fetching critical stock:', error);
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        nome: item.nome_material,
        codigo: item.codigo_interno,
        stock_atual: Number(item.quantidade_stock),
        stock_minimo: 10,
        projeto_id: item.projeto_alocado_id
      })) as CriticalStockItem[];
    },
    enabled: !!hasWarehouseAccess,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Create notifications for critical stock
  const createNotifications = useMutation({
    mutationFn: async () => {
      // Create notifications directly in the database
      const notifications = criticalItems.map(item => ({
        tipo: 'stock_critico',
        titulo: `Stock Crítico: ${item.nome}`,
        mensagem: `O material "${item.nome}" (${item.codigo || 'S/C'}) está com apenas ${item.stock_atual} unidades em stock. Nível mínimo: 10 unidades.`,
        projeto_id: item.projeto_id,
        severidade: item.stock_atual <= 0 ? 'error' : item.stock_atual < 5 ? 'error' : 'warning',
        lida: false,
        destinatario_role: WAREHOUSE_ROLES,
        som_ativado: true,
        acao_url: '/armazem',
        entidade_tipo: 'material',
        entidade_id: item.id
      }));

      // Check for existing unread notifications for these materials
      const { data: existingNotifications } = await supabase
        .from('notificacoes')
        .select('entidade_id')
        .eq('tipo', 'stock_critico')
        .eq('lida', false)
        .in('entidade_id', criticalItems.map(i => i.id));

      const existingIds = new Set((existingNotifications || []).map(n => n.entidade_id));
      const newNotifications = notifications.filter(n => !existingIds.has(n.entidade_id));

      if (newNotifications.length > 0) {
        const { error } = await supabase
          .from('notificacoes')
          .insert(newNotifications);
        if (error) throw error;
      }

      return newNotifications.length;
    },
    onSuccess: (count) => {
      if (count > 0) {
        queryClient.invalidateQueries({ queryKey: ["notificacoes-realtime"] });
      }
    },
  });

  // Check and alert on mount (for warehouse access pages)
  const checkAndAlert = useCallback(async () => {
    if (!hasWarehouseAccess || hasAlertedRef.current) return;
    
    const soundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
    
    if (criticalItems.length > 0) {
      hasAlertedRef.current = true;
      
      // Play sound for critical stock alert if enabled
      if (soundEnabled) {
        playCriticalStockSound();
      }
      
      // Separar materiais por urgência
      const urgentItems = criticalItems.filter(i => i.stock_atual === 0);
      const warningItems = criticalItems.filter(i => i.stock_atual > 0 && i.stock_atual < 10);
      
      // Construir descrição detalhada
      let description = '';
      if (urgentItems.length > 0) {
        const urgentNames = urgentItems.slice(0, 3).map(i => i.nome).join(', ');
        description += `🔴 ${urgentItems.length} em ruptura (0 un.): ${urgentNames}`;
        if (urgentItems.length > 3) description += ` e +${urgentItems.length - 3} mais`;
      }
      if (warningItems.length > 0) {
        if (description) description += '\n';
        const warningNames = warningItems.slice(0, 3).map(i => `${i.nome} (${i.stock_atual})`).join(', ');
        description += `⚠️ ${warningItems.length} em alerta: ${warningNames}`;
        if (warningItems.length > 3) description += ` e +${warningItems.length - 3} mais`;
      }
      
      // Show toast notification with detailed description
      toast.warning('Stock Crítico - Acção Necessária', {
        description: description,
        duration: 15000, // Mais tempo para ler detalhes
        action: {
          label: 'Ver detalhes',
          onClick: () => {
            if (window.location.pathname === '/armazem') {
              // Despachar evento para activar filtro sem reload
              window.dispatchEvent(new CustomEvent('activate-critical-filter'));
            } else {
              // Navegar para armazém com parâmetro de filtro
              window.location.href = '/armazem?filter=critical';
            }
          }
        }
      });
      
      // Create notifications in database
      await createNotifications.mutateAsync();
    }
  }, [hasWarehouseAccess, criticalItems, createNotifications]);

  // Trigger alert check when critical items are loaded
  useEffect(() => {
    if (criticalItems.length > 0 && hasWarehouseAccess && !hasAlertedRef.current) {
      checkAndAlert();
    }
  }, [criticalItems.length, hasWarehouseAccess, checkAndAlert]);

  // Reset alert flag when user changes
  useEffect(() => {
    hasAlertedRef.current = false;
  }, [profile?.id]);

  return {
    criticalItems,
    criticalCount: criticalItems.length,
    isLoading,
    hasWarehouseAccess,
    refetch,
    checkAndAlert,
  };
}
