import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp } from "lucide-react";
import { useRegisterWeeklyPPC, useCalculateWeeklyAveragePPC } from "@/hooks/useWeeklyPPC";

interface WeeklyPPCButtonProps {
  projectId: number;
  variant?: "register" | "calculate";
  size?: "sm" | "default";
}

export function WeeklyPPCButton({ 
  projectId, 
  variant = "register", 
  size = "sm" 
}: WeeklyPPCButtonProps) {
  const registerPPC = useRegisterWeeklyPPC();
  const calculateAverage = useCalculateWeeklyAveragePPC();

  const handleRegister = () => {
    registerPPC.mutate(projectId);
  };

  const handleCalculate = () => {
    calculateAverage.mutate(projectId);
  };

  if (variant === "calculate") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleCalculate}
        disabled={calculateAverage.isPending}
        title="Calcular PPC médio semanal"
      >
        <TrendingUp className={`h-4 w-4 ${calculateAverage.isPending ? 'animate-pulse' : ''}`} />
        {size === "default" && (calculateAverage.isPending ? "Calculando..." : "Calcular PPC Médio")}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleRegister}
      disabled={registerPPC.isPending}
      title="Registrar PPCs semanais automaticamente"
    >
      <Calendar className={`h-4 w-4 ${registerPPC.isPending ? 'animate-spin' : ''}`} />
      {size === "default" && (registerPPC.isPending ? "Registrando..." : "Registrar PPCs Semanais")}
    </Button>
  );
}