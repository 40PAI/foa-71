import React from "react";
import { Button } from "@/components/ui/button";
import type { BaseComponentProps } from "@/types";

interface FormActionsProps extends BaseComponentProps {
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  showCancel?: boolean;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FormActions({
  onCancel,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar", 
  isSubmitting = false,
  showCancel = true,
  submitVariant = "default",
  className
}: FormActionsProps) {
  return (
    <div className={`flex justify-end gap-2 ${className}`}>
      {showCancel && onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit" 
        variant={submitVariant}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </div>
  );
}