// components/batches/shared/shortage-badge.tsx
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShortageBadgeProps {
  required: number;
  available: number;
  shortage: number;
  unit: string;
  variant?: "default" | "subtle";
  showIcon?: boolean;
}

export function ShortageBadge({
  required,
  available,
  shortage,
  unit,
  variant = "default",
  showIcon = true,
}: ShortageBadgeProps) {
  const shortagePercent = required > 0 ? (shortage / required) * 100 : 0;
  const hasInventoryTracking = available > 0 || shortage < required;

  // Determine severity
  const severity =
    shortage === 0
      ? "success"
      : !hasInventoryTracking && available === 0
        ? "warning" // No inventory tracking
        : shortagePercent >= 50
          ? "high"
          : shortagePercent >= 20
            ? "medium"
            : "low";

  const config = {
    success: {
      icon: CheckCircle,
      label: "Available",
      className:
        variant === "subtle"
          ? "text-green-600 dark:text-green-400"
          : "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    },
    warning: {
      icon: AlertTriangle,
      label: "Not Tracked",
      className:
        variant === "subtle"
          ? "text-yellow-600 dark:text-yellow-400"
          : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900",
    },
    low: {
      icon: AlertTriangle,
      label: `Short ${shortage.toFixed(2)} ${unit}`,
      className:
        variant === "subtle"
          ? "text-yellow-600 dark:text-yellow-400"
          : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900",
    },
    medium: {
      icon: AlertTriangle,
      label: `Short ${shortage.toFixed(2)} ${unit}`,
      className:
        variant === "subtle"
          ? "text-orange-600 dark:text-orange-400"
          : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
    },
    high: {
      icon: AlertCircle,
      label: `Short ${shortage.toFixed(2)} ${unit}`,
      className:
        variant === "subtle"
          ? "text-red-600 dark:text-red-400"
          : "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    },
  };

  const { icon: Icon, label, className } = config[severity];

  if (variant === "subtle") {
    return (
      <span
        className={cn(
          "text-xs font-medium inline-flex items-center gap-1",
          className
        )}
      >
        {showIcon && <Icon className="h-3 w-3" />}
        {label}
      </span>
    );
  }

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}
