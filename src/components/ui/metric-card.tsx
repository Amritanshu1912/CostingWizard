import React from "react";
import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Package,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================================
// METRIC CARDS - Professional Dashboard Components
// ============================================================================

/**
 * MetricCard - Standard metric display with optional trend indicator
 * Perfect for: KPIs, statistics, key metrics
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  description,
  trend,
  onClick,
  className,
}: MetricCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-md ",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
              iconClassName.includes("text-destructive") &&
                "from-red-500/10 to-red-500/5",
              iconClassName.includes("text-primary") &&
                "from-blue-500/10 to-blue-500/5",
              iconClassName.includes("text-accent") &&
                "from-green-500/10 to-green-500/5",
              iconClassName.includes("text-yellow") &&
                "from-yellow-500/10 to-yellow-500/5",
              !iconClassName.includes("text-") && "from-primary/10 to-primary/5"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            {trend.isPositive !== undefined &&
              (trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ))}
            <span
              className={cn(
                "text-sm font-semibold",
                trend.isPositive === true && "text-green-500",
                trend.isPositive === false && "text-red-500",
                trend.isPositive === undefined && "text-muted-foreground"
              )}
            >
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * MetricCardWithBadge - Metric card with status badges
 * Perfect for: Alert levels, status indicators, categorical data
 */
interface MetricCardWithBadgeProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  badges: Array<{
    text: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
    className?: string;
  }>;
  onClick?: () => void;
  className?: string;
}

export function MetricCardWithBadge({
  title,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  description,
  badges,
  onClick,
  className,
}: MetricCardWithBadgeProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-md",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
              iconClassName.includes("text-destructive") &&
                "from-red-500/10 to-red-500/5",
              iconClassName.includes("text-primary") &&
                "from-blue-500/10 to-blue-500/5",
              iconClassName.includes("text-accent") &&
                "from-green-500/10 to-green-500/5",
              iconClassName.includes("text-yellow") &&
                "from-yellow-500/10 to-yellow-500/5",
              !iconClassName.includes("text-") && "from-primary/10 to-primary/5"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {badges.map((badge, idx) => (
            <Badge
              key={idx}
              variant={badge.variant || "default"}
              className={cn(
                "text-xs font-medium transition-transform duration-200",
                badge.className
              )}
            >
              {badge.text}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MetricCardWithChart - Metric card with embedded chart visualization
 * Perfect for: Trend analysis, time series data, visual metrics
 */
interface MetricCardWithChartProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  chart: React.ReactNode;
  footer?: {
    label: string;
    value: string;
    trend?: {
      value: string;
      isPositive?: boolean;
    };
  };
  onClick?: () => void;
  className?: string;
}

export function MetricCardWithChart({
  title,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  description,
  chart,
  footer,
  onClick,
  className,
}: MetricCardWithChartProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-md ",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
              iconClassName.includes("text-destructive") &&
                "from-red-500/10 to-red-500/5",
              iconClassName.includes("text-primary") &&
                "from-blue-500/10 to-blue-500/5",
              iconClassName.includes("text-accent") &&
                "from-green-500/10 to-green-500/5",
              iconClassName.includes("text-yellow") &&
                "from-yellow-500/10 to-yellow-500/5",
              !iconClassName.includes("text-") && "from-primary/10 to-primary/5"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
        </div>

        <div className="my-4 transition-transform duration-300">{chart}</div>

        {footer && (
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              {footer.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{footer.value}</span>
              {footer.trend && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    footer.trend.isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {footer.trend.value}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * MetricCardWithProgress - Metric card with progress tracking
 * Perfect for: Goals, completion rates, capacity metrics
 */
interface MetricCardWithProgressProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  progress: {
    current: number;
    max: number;
    label?: string;
    showPercentage?: boolean;
    color?: "default" | "success" | "warning" | "error";
  };
  onClick?: () => void;
  className?: string;
}

export function MetricCardWithProgress({
  title,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  description,
  progress,
  onClick,
  className,
}: MetricCardWithProgressProps) {
  const percentage = (progress.current / progress.max) * 100;

  const getProgressColor = () => {
    switch (progress.color) {
      case "success":
        return "[&>div]:bg-green-500";
      case "warning":
        return "[&>div]:bg-yellow-500";
      case "error":
        return "[&>div]:bg-red-500";
      default:
        return "";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-md ",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
              iconClassName.includes("text-destructive") &&
                "from-red-500/10 to-red-500/5",
              iconClassName.includes("text-primary") &&
                "from-blue-500/10 to-blue-500/5",
              iconClassName.includes("text-accent") &&
                "from-green-500/10 to-green-500/5",
              iconClassName.includes("text-yellow") &&
                "from-yellow-500/10 to-yellow-500/5",
              !iconClassName.includes("text-") && "from-primary/10 to-primary/5"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress.label || "Progress"}
            </span>
            <span className="font-semibold">
              {progress.showPercentage !== false
                ? `${Math.round(percentage)}%`
                : `${progress.current}/${progress.max}`}
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-2 transition-all duration-300",
              getProgressColor()
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MetricCardAdvanced - All-in-one metric card with conditional rendering
 * Perfect for: Complex dashboards, adaptive layouts, multi-purpose displays
 */
interface MetricCardAdvancedProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  badges?: Array<{
    text: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
    className?: string;
  }>;
  chart?: React.ReactNode;
  progress?: {
    current: number;
    max: number;
    label?: string;
    showPercentage?: boolean;
    color?: "default" | "success" | "warning" | "error";
  };
  footer?: {
    label: string;
    value: string;
  };
  onClick?: () => void;
  className?: string;
}

export function MetricCardAdvanced({
  title,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  description,
  trend,
  badges,
  chart,
  progress,
  footer,
  onClick,
  className,
}: MetricCardAdvancedProps) {
  const percentage = progress ? (progress.current / progress.max) * 100 : 0;

  const getProgressColor = () => {
    if (!progress) return "";
    switch (progress.color) {
      case "success":
        return "[&>div]:bg-green-500";
      case "warning":
        return "[&>div]:bg-yellow-500";
      case "error":
        return "[&>div]:bg-red-500";
      default:
        return "";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-md ",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-all duration-300",
              iconClassName.includes("text-destructive") &&
                "from-red-500/10 to-red-500/5",
              iconClassName.includes("text-primary") &&
                "from-blue-500/10 to-blue-500/5",
              iconClassName.includes("text-accent") &&
                "from-green-500/10 to-green-500/5",
              iconClassName.includes("text-yellow") &&
                "from-yellow-500/10 to-yellow-500/5",
              !iconClassName.includes("text-") && "from-primary/10 to-primary/5"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
        </div>

        {chart && (
          <div className="my-4 transition-transform duration-300">{chart}</div>
        )}

        {progress && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.label || "Progress"}
              </span>
              <span className="font-semibold">
                {progress.showPercentage !== false
                  ? `${Math.round(percentage)}%`
                  : `${progress.current}/${progress.max}`}
              </span>
            </div>
            <Progress
              value={percentage}
              className={cn(
                "h-2 transition-all duration-300 group-hover:h-2.5",
                getProgressColor()
              )}
            />
          </div>
        )}

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map((badge, idx) => (
              <Badge
                key={idx}
                variant={badge.variant || "default"}
                className={cn(
                  "text-xs font-medium transition-transform duration-200",
                  badge.className
                )}
              >
                {badge.text}
              </Badge>
            ))}
          </div>
        )}

        {trend && !footer && (
          <div className="flex items-center gap-2 pt-3 border-t">
            {trend.isPositive !== undefined &&
              (trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ))}
            <span
              className={cn(
                "text-sm font-semibold",
                trend.isPositive === true && "text-green-500",
                trend.isPositive === false && "text-red-500",
                trend.isPositive === undefined && "text-muted-foreground"
              )}
            >
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {footer && (
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              {footer.label}
            </span>
            <span className="text-sm font-semibold">{footer.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
