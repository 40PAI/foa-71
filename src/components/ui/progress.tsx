
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "financial" | "success" | "warning" | "destructive"
  }
>(({ className, value, variant = "default", ...props }, ref) => {
  const getIndicatorColor = () => {
    if (variant === "financial") {
      if (!value) return "bg-muted"
      if (value > 100) return "bg-danger"
      if (value > 80) return "bg-warning"
      return "bg-primary"
    }
    
    switch (variant) {
      case "success":
        return "bg-success"
      case "warning":
        return "bg-warning"
      case "destructive":
        return "bg-danger"
      default:
        return "bg-primary"
    }
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          getIndicatorColor()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
