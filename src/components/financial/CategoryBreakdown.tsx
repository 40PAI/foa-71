import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Truck, 
  Building,
  DollarSign 
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { BaseComponentProps } from "@/types";

interface CategoryData {
  material_expenses: number;
  payroll_expenses: number;
  patrimony_expenses: number;
  indirect_expenses: number;
  total_budget: number;
}

interface CategoryBreakdownProps extends BaseComponentProps {
  data: CategoryData;
}

export function CategoryBreakdown({ data, className }: CategoryBreakdownProps) {
  const categories = [
    {
      title: "Materiais",
      value: data.material_expenses,
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Mão de Obra",
      value: data.payroll_expenses,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Patrimônio",
      value: data.patrimony_expenses,
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Custos Indiretos",
      value: data.indirect_expenses,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {categories.map((category) => {
        const Icon = category.icon;
        const percentage = data.total_budget > 0 
          ? (category.value / data.total_budget) * 100 
          : 0;

        return (
          <Card key={category.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <Icon className={`h-4 w-4 ${category.color}`} />
                </div>
                <Badge variant="outline">
                  {percentage.toFixed(1)}%
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{category.title}</p>
                <p className="text-xl font-bold">{formatCurrency(category.value)}</p>
              </div>
              <div className="mt-3">
                <Progress 
                  value={Math.min(percentage, 100)} 
                  variant="financial"
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}