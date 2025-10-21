import { Card } from "@/components/ui/card";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { Building, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface FornecedoresFinancialSectionProps {
  data: {
    totalCredito: number;
    totalDebito: number;
    saldoLiquido: number;
    topCredores: Array<{ nome: string; saldo: number }>;
    topDevedores: Array<{ nome: string; saldo: number }>;
  };
}

export function FornecedoresFinancialSection({ data }: FornecedoresFinancialSectionProps) {
  const credoresChartData = data.topCredores.map(f => ({
    name: f.nome,
    value: f.saldo,
  }));

  const devedoresChartData = data.topDevedores.map(f => ({
    name: f.nome,
    value: f.saldo,
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <p className="text-sm text-muted-foreground">Total Crédito</p>
          </div>
          <p className="text-2xl font-bold mt-2 text-success">{formatCurrency(data.totalCredito)}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <p className="text-sm text-muted-foreground">Total Débito</p>
          </div>
          <p className="text-2xl font-bold mt-2 text-destructive">{formatCurrency(data.totalDebito)}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Saldo Líquido</p>
          </div>
          <p className={`text-2xl font-bold mt-2 ${data.saldoLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(data.saldoLiquido)}
          </p>
        </Card>
      </div>

      {/* Top Credores */}
      {data.topCredores.length > 0 && (
        <Card className="p-4">
          <HorizontalBarChart 
            data={credoresChartData}
            title="Top 5 Fornecedores por Crédito"
          />
        </Card>
      )}

      {/* Top Devedores (Amortizações) */}
      {data.topDevedores.length > 0 && (
        <Card className="p-4">
          <HorizontalBarChart 
            data={devedoresChartData}
            title="Top 5 Fornecedores por Amortização"
          />
        </Card>
      )}

      {/* Tabelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credores */}
        {data.topCredores.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Fornecedores com Maior Crédito
            </h3>
            <div className="space-y-2">
              {data.topCredores.map((fornecedor, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded">
                  <span className="text-sm">{fornecedor.nome}</span>
                  <span className="text-sm font-semibold text-success">
                    {formatCurrency(fornecedor.saldo)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Devedores */}
        {data.topDevedores.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Fornecedores com Maior Amortização
            </h3>
            <div className="space-y-2">
              {data.topDevedores.map((fornecedor, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded">
                  <span className="text-sm">{fornecedor.nome}</span>
                  <span className="text-sm font-semibold text-destructive">
                    {formatCurrency(fornecedor.saldo)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
