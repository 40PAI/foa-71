import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  alert?: 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, trend, alert, icon }: KPICardProps) {
  const getAlertColor = () => {
    switch (alert) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card className="relative min-w-0 h-auto max-h-28">
      <CardHeader size="sm" className="flex flex-row items-start justify-between space-y-0 pb-1">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-1 min-w-0 flex-1 truncate">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground shrink-0 ml-1">{icon}</div>}
      </CardHeader>
      <CardContent size="sm" className="space-y-0.5">
        <div className="flex items-center justify-between min-w-0 gap-1">
          <div className="text-sm sm:text-base lg:text-lg font-bold min-w-0 flex-1 truncate">
            {value}
          </div>
          <div className="shrink-0 flex items-center gap-1">
            {getTrendIcon()}
            {alert && (
              <Badge variant="secondary" className={`text-white text-[10px] px-1.5 py-0.5 ${getAlertColor()}`}>
                {alert === 'green' && <CheckCircle className="h-2.5 w-2.5" />}
                {alert !== 'green' && <AlertTriangle className="h-2.5 w-2.5" />}
              </Badge>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
