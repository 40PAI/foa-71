import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrencyInput, formatCurrencyRealtime } from "@/utils/currency";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: number;
  onValueChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, onBlur, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(() => 
      value ? formatCurrencyInput(value) : ''
    );
    const [isFocused, setIsFocused] = React.useState(false);

    // Update display value when prop value changes (external updates)
    React.useEffect(() => {
      if (!isFocused && value !== undefined) {
        setDisplayValue(value ? formatCurrencyInput(value) : '');
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      
      // Format in real-time while typing
      const formatted = formatCurrencyRealtime(input);
      setDisplayValue(formatted);
      
      // Parse and notify parent of numeric value
      if (onValueChange) {
        const numericValue = parseCurrencyInput(formatted);
        onValueChange(numericValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Format on blur
      const numericValue = parseCurrencyInput(displayValue);
      const formatted = formatCurrencyInput(numericValue);
      setDisplayValue(formatted);
      
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    return (
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
