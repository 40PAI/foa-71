import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Package, ShoppingCart } from "lucide-react";

export type RequisitionType = "alocamento" | "compra";

interface RequisitionTypeSelectorProps {
  value: RequisitionType;
  onChange: (value: RequisitionType) => void;
  disabled?: boolean;
}

export function RequisitionTypeSelector({ 
  value, 
  onChange,
  disabled = false 
}: RequisitionTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Tipo de Requisição</Label>
      <RadioGroup 
        value={value} 
        onValueChange={(v) => onChange(v as RequisitionType)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        disabled={disabled}
      >
        <div 
          className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
            value === "alocamento" 
              ? "border-primary bg-primary/5" 
              : "border-muted hover:border-muted-foreground/30"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && onChange("alocamento")}
        >
          <RadioGroupItem value="alocamento" id="alocamento" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <Label htmlFor="alocamento" className="font-semibold cursor-pointer">
                Alocamento de Material
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Solicitar material existente no armazém para a obra
            </p>
            <Badge variant="secondary" className="mt-2">
              Material do Stock
            </Badge>
          </div>
        </div>

        <div 
          className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
            value === "compra" 
              ? "border-primary bg-primary/5" 
              : "border-muted hover:border-muted-foreground/30"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && onChange("compra")}
        >
          <RadioGroupItem value="compra" id="compra" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <Label htmlFor="compra" className="font-semibold cursor-pointer">
                Compra de Material
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Solicitar compra de material novo ao fornecedor
            </p>
            <Badge variant="secondary" className="mt-2">
              Requer Aprovação
            </Badge>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
