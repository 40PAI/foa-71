import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HeatmapData {
  frente: string;
  categories: {
    [category: string]: {
      value: number;
      intensity: 'low' | 'medium' | 'high';
    };
  };
}

interface HeatmapTableProps {
  data: HeatmapData[];
  title: string;
  categories: string[];
}

export function HeatmapTable({ data, title, categories }: HeatmapTableProps) {
  const getIntensityColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="text-left p-2 border-b font-semibold text-xs sm:text-sm">Frente</th>
                {categories.map((category) => (
                  <th key={category} className="text-center p-2 border-b font-semibold text-xs sm:text-sm">
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.frente} className="hover:bg-muted/50">
                  <td className="p-2 border-b font-medium text-xs sm:text-sm">{row.frente}</td>
                  {categories.map((category) => {
                    const cellData = row.categories[category];
                    if (!cellData) {
                      return (
                        <td key={category} className="p-2 border-b text-center">
                          <div className="w-8 sm:w-12 h-6 sm:h-8 bg-muted rounded mx-auto"></div>
                        </td>
                      );
                    }
                    
                    return (
                      <td key={category} className="p-2 border-b text-center">
                        <Badge 
                          variant="outline" 
                          className={`${getIntensityColor(cellData.intensity)} w-8 sm:w-12 h-6 sm:h-8 flex items-center justify-center mx-auto text-xs`}
                        >
                          {cellData.value}
                        </Badge>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="font-medium">Intensidade:</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Baixa</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Média</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Alta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}