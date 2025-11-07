import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useDetailedExpenses } from "@/hooks/useIntegratedFinances";
import { ExpenseManagement } from "@/components/ExpenseManagement";

interface CategoryExpenseCardProps {
  category: string;
  title: string;
  icon: LucideIcon;
  projectId: number;
  totalBudget?: number;
  fromTasks?: number;
  manualExpenses?: number;
}

export function CategoryExpenseCard({
  category,
  title,
  icon: Icon,
  projectId,
  totalBudget = 1000000,
  fromTasks = 0,
  manualExpenses = 0,
}: CategoryExpenseCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Total amount is sum of tasks + manual expenses
  const totalAmount = fromTasks + manualExpenses;

  // Calculate percentage of budget
  const percentageOfBudget = useMemo(() => {
    if (totalBudget === 0) return 0;
    return Math.min((totalAmount / totalBudget) * 100, 100);
  }, [totalAmount, totalBudget]);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setIsOpen(true)}>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header with icon and percentage */}
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {percentageOfBudget.toFixed(1)}%
              </span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                {title}
              </h3>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </p>
              
              {/* Breakdown of sources */}
              {totalAmount > 0 && (
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <div className="flex justify-between items-center">
                    <span>Das Tarefas:</span>
                    <span className="font-medium">{formatCurrency(fromTasks)}</span>
                  </div>
                  {manualExpenses > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Gastos Manuais:</span>
                      <span className="font-medium">{formatCurrency(manualExpenses)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <Progress value={percentageOfBudget} className="h-2" />

            {/* View More button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 group-hover:bg-primary/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              Ver Mais
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal with filtered expenses */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Icon className="h-6 w-6 text-primary" />
              Gastos Detalhados - {title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <ExpenseManagement 
              projectId={projectId} 
              filterByCategory={category}
              showAddButton={false}
              fromTasksValue={fromTasks}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
