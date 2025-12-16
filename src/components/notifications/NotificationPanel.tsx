import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  Package,
  FileWarning,
  CreditCard,
  Volume2,
  VolumeX,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRealtimeNotificacoes, NotificacaoRealtime } from "@/hooks/useRealtimeNotificacoes";

const getNotificationIcon = (tipo: string) => {
  switch (tipo) {
    case 'tarefa_atrasada':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'novo_incidente':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'nova_requisicao':
      return <Package className="h-4 w-4 text-blue-500" />;
    case 'orcamento_80':
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case 'orcamento_90':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'credito_expirando':
      return <CreditCard className="h-4 w-4 text-orange-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const getSeverityColor = (severidade: string) => {
  switch (severidade) {
    case 'error':
      return 'border-l-red-500 bg-red-500/5';
    case 'warning':
      return 'border-l-amber-500 bg-amber-500/5';
    case 'info':
    default:
      return 'border-l-blue-500 bg-blue-500/5';
  }
};

interface NotificationItemProps {
  notification: NotificacaoRealtime;
  onMarkAsRead: (id: string) => void;
  onNavigate: (url: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onNavigate }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: pt,
  });

  const handleClick = () => {
    if (!notification.lida) {
      onMarkAsRead(notification.id);
    }
    if (notification.acao_url) {
      onNavigate(notification.acao_url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 border-l-4 cursor-pointer transition-colors hover:bg-accent/50",
        getSeverityColor(notification.severidade),
        notification.lida && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getNotificationIcon(notification.tipo)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "text-sm font-medium truncate",
              !notification.lida && "text-foreground"
            )}>
              {notification.titulo}
            </p>
            {!notification.lida && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.mensagem}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {timeAgo}
          </p>
        </div>
        {notification.acao_url && (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notificacoes,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    soundEnabled,
    toggleSound,
  } = useRealtimeNotificacoes();

  const handleNavigate = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  const unreadNotifications = notificacoes.filter(n => !n.lida);
  const readNotifications = notificacoes.filter(n => n.lida);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="font-semibold text-sm">Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSound}
              title={soundEnabled ? "Desativar som" : "Ativar som"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Carregando...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BellOff className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem notificações</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Unread notifications */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Não lidas
                    </span>
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              )}

              {/* Read notifications */}
              {readNotifications.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Anteriores
                    </span>
                  </div>
                  {readNotifications.slice(0, 10).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
