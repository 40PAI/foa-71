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

interface SmartKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  type?: 'financial' | 'performance' | 'alert' | 'success' | 'warning';
  icon?: React.ComponentType<any>;
  animated?: boolean;
}

export function SmartKPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  type = 'performance',
  icon: Icon,
  animated = true 
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
    <Card className={`${getCardStyles()} ${animated ? 'hover:scale-105 transition-all duration-200' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
            {title}
          </CardTitle>
          <DisplayIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${getValueColor()} flex-shrink-0`} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 sm:space-y-2">
          <div className={`text-base sm:text-xl lg:text-2xl font-bold ${getValueColor()} ${animated ? 'animate-fade-in' : ''} break-all leading-tight`}>
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
                <span className={`text-xs sm:text-sm font-medium line-clamp-1 ${
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
            <div className="text-xs text-muted-foreground line-clamp-2">
              {subtitle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}