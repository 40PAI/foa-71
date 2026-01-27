import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
  showTrend?: boolean;
}

export function SparklineChart({ 
  data, 
  color = "hsl(var(--primary))", 
  height = 40,
  showTrend = true 
}: SparklineChartProps) {
  if (!data || data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        Sem dados
      </div>
    );
  }

  // Calculate trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trend = lastValue - firstValue;
  const trendPercent = firstValue > 0 ? ((trend / firstValue) * 100).toFixed(1) : "0";
  const isPositive = trend >= 0;

  // Determine color based on trend if not specified
  const chartColor = showTrend 
    ? isPositive 
      ? "hsl(var(--chart-1))" 
      : "hsl(var(--destructive))"
    : color;

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 80, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={`sparklineGradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={1.5}
              fill={`url(#sparklineGradient-${isPositive})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {showTrend && (
        <span 
          className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(Number(trendPercent))}%
        </span>
      )}
    </div>
  );
}
