
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
      case 'up': return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card className="relative min-w-0 h-fit">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-1 min-w-0 flex-1 truncate" title={title}>
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground shrink-0 ml-1">{icon}</div>}
      </CardHeader>
      <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4 space-y-1">
        <div className="flex items-start justify-between min-w-0 gap-1">
          <div className="text-sm sm:text-base lg:text-lg font-bold min-w-0 flex-1 break-words leading-tight" title={String(value)}>
            {value}
          </div>
          <div className="shrink-0 flex items-center gap-1">
            {getTrendIcon()}
            {alert && (
              <Badge variant="secondary" className={`text-white text-xs whitespace-nowrap ${getAlertColor()}`}>
                {alert === 'green' && <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />}
                {alert !== 'green' && <AlertTriangle className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />}
                <span className="hidden sm:inline">{alert.toUpperCase()}</span>
                <span className="sm:hidden">{alert.charAt(0).toUpperCase()}</span>
              </Badge>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight line-clamp-2" title={subtitle}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
