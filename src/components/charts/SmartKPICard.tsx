import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Activity
} from "lucide-react";
import { InfoTooltip, InfoTooltipContent } from "@/components/common/InfoTooltip";

interface SmartKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  type?: 'financial' | 'performance' | 'alert' | 'success' | 'warning';
  icon?: React.ComponentType<any>;
  animated?: boolean;
  info?: InfoTooltipContent;
}

export function SmartKPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  type = 'performance',
  icon: Icon,
  animated = true,
  info,
}: SmartKPICardProps) {
  
  const getCardStyles = () => {
    switch (type) {
      case 'financial':
        return 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-background';
      case 'success':
        return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-background';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-background';
      case 'alert':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-background';
      default:
        return 'border-l-4 border-l-primary bg-gradient-to-r from-muted/50 to-background';
    }
  };

  const getValueColor = () => {
    switch (type) {
      case 'financial': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'alert': return 'text-red-600';
      default: return 'text-primary';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'financial': return DollarSign;
      case 'success': return CheckCircle;
      case 'warning': return Clock;
      case 'alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const DisplayIcon = Icon || getDefaultIcon();

  return (
    <Card className={`${getCardStyles()} ${animated ? 'hover:shadow-md transition-shadow duration-200' : ''} min-w-0 h-full`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-medium text-muted-foreground break-words hyphens-auto leading-tight min-w-0" style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.875rem)" }}>
            {title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {info && <InfoTooltip {...info} title={info.title || title} />}
            <DisplayIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${getValueColor()}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 sm:space-y-2">
          <div className={`font-bold ${getValueColor()} ${animated ? 'animate-fade-in' : ''} break-words leading-tight`} style={{ fontSize: "clamp(0.95rem, 2vw, 1.5rem)" }}>
            {value}
          </div>
          
          {(trend || trendValue) && (
            <div className="flex items-center gap-1 sm:gap-2">
              {trend && (
                <div className="flex-shrink-0">
                  {getTrendIcon()}
                </div>
              )}
              {trendValue && (
                <span className={`text-xs sm:text-sm font-medium break-words ${
                  trend === 'up' ? 'text-green-500' : 
                  trend === 'down' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
          
          {subtitle && (
            <div className="text-xs text-muted-foreground break-words leading-tight">
              {subtitle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}