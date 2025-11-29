// components/batches/shared/stat-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children?: React.ReactNode; // For additional content like breakdowns
  onClick?: () => void;
}

const variantStyles = {
  default: {
    card: "border-border",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-foreground",
  },
  success: {
    card: "border-green-200 dark:border-green-900",
    iconBg: "bg-green-100 dark:bg-green-950",
    iconColor: "text-green-600 dark:text-green-400",
    valueColor: "text-green-700 dark:text-green-300",
  },
  warning: {
    card: "border-yellow-200 dark:border-yellow-900",
    iconBg: "bg-yellow-100 dark:bg-yellow-950",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    valueColor: "text-yellow-700 dark:text-yellow-300",
  },
  danger: {
    card: "border-red-200 dark:border-red-900",
    iconBg: "bg-red-100 dark:bg-red-950",
    iconColor: "text-red-600 dark:text-red-400",
    valueColor: "text-red-700 dark:text-red-300",
  },
  info: {
    card: "border-blue-200 dark:border-blue-900",
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    valueColor: "text-blue-700 dark:text-blue-300",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  variant = "default",
  children,
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        styles.card,
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              {title}
            </p>
            <div className={cn("text-3xl font-bold", styles.valueColor)}>
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", styles.iconBg)}>
            <Icon className={cn("h-6 w-6", styles.iconColor)} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <span
              className={cn(
                "font-medium",
                trend.value > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}

        {children && <div className="mt-3 pt-3 border-t">{children}</div>}
      </CardContent>
    </Card>
  );
}
