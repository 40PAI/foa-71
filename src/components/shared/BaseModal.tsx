import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BaseModalProps } from "@/types";

export function BaseModal({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  className,
  size = "default"
}: BaseModalProps & { 
  size?: "sm" | "default" | "lg" | "xl" | "2xl" | "full";
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "w-[95vw] md:w-full md:max-w-4xl",
    "2xl": "w-[95vw] md:w-full md:max-w-6xl",
    full: "w-[95vw] max-h-[90vh]"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} ${className}`}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}