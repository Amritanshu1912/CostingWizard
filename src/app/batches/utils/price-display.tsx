// components/batches/shared/price-display.tsx
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/shared-utils";

interface PriceDisplayProps {
  amount: number;
  isLocked?: boolean;
  currency?: string;
  showPerUnit?: boolean;
  unit?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
};

export function PriceDisplay({
  amount,
  isLocked = false,
  currency = "₹",
  showPerUnit = false,
  unit,
  className,
  size = "md",
}: PriceDisplayProps) {
  const formattedAmount = amount.toFixed(2);

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        isLocked
          ? "text-blue-600 dark:text-blue-400 font-semibold"
          : "text-foreground",
        sizeStyles[size],
        className
      )}
    >
      {isLocked && <Lock className="h-3 w-3" />}
      {currency}
      {formattedAmount}
      {showPerUnit && unit && (
        <span className="text-muted-foreground text-xs">/{unit}</span>
      )}
    </span>
  );

  if (isLocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Locked pricing from recipe/formulation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

interface TotalCostDisplayProps {
  totalCost: number;
  breakdown?: {
    icon: string | React.ReactNode;
    label: string;
    amount: number;
    totalItems: number;
    percentage?: number;
  }[];
  className?: string;
}

export function TotalCostDisplay({
  totalCost,
  breakdown,
  className,
}: TotalCostDisplayProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">₹{totalCost.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">incl. tax</span>
      </div>
      {breakdown && breakdown.length > 0 && (
        <div className="space-y-1">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-center justify-between text-xs"
            >
              <span className=" col-span-10">
                <span className="mr-1">{item.icon}</span>
                {item.label}{" "}
                <span className="text-muted-foreground">
                  ({item.totalItems})
                </span>
              </span>
              <span className="font-medium text-right">
                ₹{item.amount.toFixed(2)}
              </span>
              {item.percentage !== undefined && (
                <span className="text-muted-foreground text-right font-medium ml-1">
                  ({item.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
