
import { Card, CardContent } from "@/components/ui/card";
import { FinancialOverview } from "@/components/financial/FinancialOverview";
import { CategoryBreakdown } from "@/components/financial/CategoryBreakdown";
import { DetailedBreakdown } from "@/components/financial/DetailedBreakdown";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useIntegratedFinancialProgress, useDetailedExpenseBreakdown } from "@/hooks/useIntegratedFinances";

interface IntegratedFinancialDashboardProps {
  projectId: number;
}

export function IntegratedFinancialDashboard({ projectId }: IntegratedFinancialDashboardProps) {
  const { data: financialData, isLoading: loadingFinancial } = useIntegratedFinancialProgress(projectId);
  const { data: breakdown = [], isLoading: loadingBreakdown } = useDetailedExpenseBreakdown(projectId);

  if (loadingFinancial || loadingBreakdown) {
    return <LoadingSkeleton variant="card" className="mb-6" />;
  }

  if (!financialData) return null;

  const hasDiscrepancies = breakdown.some(item => Math.abs(item.discrepancia) > 0);

  return (
    <div className="space-y-6">
      <FinancialOverview 
        data={financialData}
        hasDiscrepancies={hasDiscrepancies}
      />
      
      <CategoryBreakdown data={financialData} />
      
      <DetailedBreakdown breakdown={breakdown} />
    </div>
  );
}
