import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  progress?: {
    value: number;
    label?: string;
  };
  badge?: {
    text: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  trend,
  progress,
  badge,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "card-enhanced group hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
              iconClassName.includes("text-destructive") &&
                "from-destructive/10 to-destructive/5",
              iconClassName.includes("text-primary") &&
                "from-primary/10 to-primary/5",
              iconClassName.includes("text-accent") &&
                "from-accent/10 to-accent/5",
              !iconClassName.includes("text-") && "from-primary/10 to-primary/5"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
        </div>

        {/* Footer - Progress or Badge or Trend */}
        <div className="space-y-2">
          {progress && (
            <div className="space-y-1.5">
              <Progress value={progress.value} className="h-1.5 bg-muted/50" />
              {progress.label && (
                <p className="text-xs font-medium text-muted-foreground">
                  {progress.label}
                </p>
              )}
            </div>
          )}

          {badge && (
            <Badge
              variant={badge.variant || "default"}
              className="text-xs font-medium"
            >
              {badge.text}
            </Badge>
          )}

          {trend && !badge && !progress && (
            <p
              className={cn(
                "text-sm font-semibold",
                trend.positive !== false ? "text-accent" : "text-destructive"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Usage Example Component
/*
export function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Price Volatility"
        value="+5.2%"
        icon={TrendingUp}
        iconClassName="text-accent"
        progress={{
          value: 65,
          label: "Above average",
        }}
      />

      <MetricCard
        title="Cost Efficiency"
        value="89%"
        icon={Target}
        iconClassName="text-primary"
        progress={{
          value: 89,
          label: "Excellent",
        }}
      />

      <MetricCard
        title="Stock Alerts"
        value={3}
        icon={AlertTriangle}
        iconClassName="text-destructive"
        badge={{
          text: "Low Stock",
          variant: "destructive",
        }}
      />

      <MetricCard
        title="Total Value"
        value="₹5.2L"
        icon={DollarSign}
        iconClassName="text-accent"
        trend={{
          value: "+12% this month",
          positive: true,
        }}
      />
    </div>
  );
}
*/
// Import this at the top of your usage file:
