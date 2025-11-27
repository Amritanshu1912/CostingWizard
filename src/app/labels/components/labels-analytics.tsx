// src/app/labels/components/labels-analytics.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MetricCard,
  MetricCardWithBadge,
  MetricCardWithProgress,
} from "@/components/ui/metric-card";
import { Progress } from "@/components/ui/progress";
import { useSupplierLabelsWithDetails } from "@/hooks/use-supplier-labels-with-details";
import { CHART_COLORS } from "@/lib/color-utils";
import { SupplierLabel, SupplierLabelWithDetails } from "@/lib/types";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AI_INSIGHTS } from "./labels-constants";

export function LabelsAnalytics() {
  const supplierLabels = useSupplierLabelsWithDetails();

  // Calculate key metrics dynamically
  const keyMetrics = useMemo(() => {
    if (!supplierLabels.length) return [];

    // Price Volatility - calculate variance in prices
    const prices = supplierLabels.map((sl) => sl.unitPrice);
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) /
      prices.length;
    const volatility = (Math.sqrt(variance) / avgPrice) * 100;

    // Stock Alerts - count labels with limited or out-of-stock
    const stockAlerts = supplierLabels.filter(
      (sl) =>
        sl.availability === "limited" || sl.availability === "out-of-stock"
    ).length;

    // Total Value - sum of unitPrice * quantityForBulkPrice for all labels
    const totalValue = supplierLabels.reduce((sum, sl) => {
      const quantity = sl.quantityForBulkPrice || sl.moq || 1000;
      return sum + sl.unitPrice * quantity;
    }, 0);

    // Avg Lead Time - average lead time across all supplier labels
    const avgLeadTime =
      supplierLabels.reduce((sum, sl) => sum + sl.leadTime, 0) /
      supplierLabels.length;

    return [
      {
        type: "progress",
        title: "Price Volatility",
        value: `+${volatility.toFixed(1)}%`,
        icon: TrendingUp,
        iconClassName: "text-accent",
        progress: {
          current: Math.min(volatility * 2, 100), // Scale for progress bar
          max: 100,
          label: volatility > 10 ? "High" : volatility > 5 ? "Moderate" : "Low",
          color: (volatility > 10 ? "warning" : "success") as
            | "warning"
            | "success",
        },
      },
      {
        type: "progress",
        title: "Print Quality Score",
        value: "92%",
        icon: Target,
        iconClassName: "text-primary",
        progress: {
          current: 92,
          max: 100,
          label: "Excellent",
          color: "success" as const,
        },
      },
      {
        type: "badge",
        title: "Stock Alerts",
        value: stockAlerts,
        icon: AlertTriangle,
        iconClassName:
          stockAlerts > 0 ? "text-destructive" : "text-muted-foreground",
        badges:
          stockAlerts > 0
            ? [
                {
                  text: "Low Stock",
                  variant: "destructive" as const,
                },
              ]
            : [],
      },
      {
        type: "standard",
        title: "Total Value",
        value: `₹${(totalValue / 100000).toFixed(1)}L`,
        icon: DollarSign,
        iconClassName: "text-accent",
        trend: {
          value: "+18%",
          isPositive: true,
          label: "this month",
        },
      },
      {
        type: "standard",
        title: "Avg Lead Time",
        value: `${Math.round(avgLeadTime)} days`,
        icon: Clock,
        iconClassName: "text-primary",
        trend: {
          value: "-1 day",
          isPositive: true,
          label: "improvement",
        },
      },
    ];
  }, [supplierLabels]);

  function generatePriceHistory(supplierLabels: SupplierLabel[]) {
    if (!supplierLabels.length) return [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseAvgPrice =
      supplierLabels.reduce((sum, sl) => sum + sl.unitPrice, 0) /
      supplierLabels.length;
    const baseLabels = supplierLabels.length * 1000;

    return months.map((month, index) => {
      const variation = (Math.random() - 0.5) * 0.4;
      const avgPrice = baseAvgPrice * (1 + variation);
      const labels = Math.round(baseLabels * (1 + index * 0.05));

      return {
        month,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        labels,
      };
    });
  }

  // Price History Data - create mock trend data based on current prices
  const priceHistoryData = useMemo(
    () => generatePriceHistory(supplierLabels),
    [supplierLabels]
  );

  // ---------------------------------------------------------
  // Mock Generator for Labels Usage Data (outside component)
  // ---------------------------------------------------------
  function generateLabelsUsageData(supplierLabels: SupplierLabelWithDetails[]) {
    if (!supplierLabels.length) return [];

    const typeGroups = supplierLabels.reduce(
      (acc, sl) => {
        const type = sl.displayType || "Unknown";
        if (!acc[type]) {
          acc[type] = { count: 0, totalCost: 0 };
        }
        acc[type].count += 1;
        acc[type].totalCost +=
          sl.unitPrice * (sl.quantityForBulkPrice || sl.moq || 1000);
        return acc;
      },
      {} as Record<string, { count: number; totalCost: number }>
    );

    return Object.entries(typeGroups).map(([label, data]) => {
      const efficiency = 85 + Math.floor(Math.random() * 10); // 85–94

      return {
        label,
        usage: data.count * 1000,
        cost: Math.round(data.totalCost),
        efficiency,
      };
    });
  }

  // Labels Usage Data - calculate based on label types
  const labelsUsageData = useMemo(() => {
    return generateLabelsUsageData(supplierLabels);
  }, [supplierLabels]);

  // Label Type Distribution
  const labelTypeDistribution = useMemo(() => {
    if (!supplierLabels.length) return [];

    const typeCounts = supplierLabels.reduce(
      (acc, sl) => {
        const type = sl.displayType || "Other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = supplierLabels.length;
    const chartColors = Object.values(CHART_COLORS.light);
    return Object.entries(typeCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: chartColors[index % chartColors.length],
    }));
  }, [supplierLabels]);

  // Printing Type Distribution
  const printingTypeDistribution = useMemo(() => {
    if (!supplierLabels.length) return [];

    const printingCounts = supplierLabels.reduce(
      (acc, sl) => {
        const printing = sl.displayPrintingType || "Other";
        acc[printing] = (acc[printing] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = supplierLabels.length;
    const chartColors = Object.values(CHART_COLORS.light);
    return Object.entries(printingCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: chartColors[index % chartColors.length],
    }));
  }, [supplierLabels]);
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          if (metric.type === "progress") {
            return (
              <MetricCardWithProgress
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={Icon}
                iconClassName={metric.iconClassName}
                progress={metric.progress!}
              />
            );
          } else if (metric.type === "badge") {
            return (
              <MetricCardWithBadge
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={Icon}
                iconClassName={metric.iconClassName}
                badges={metric.badges!}
              />
            );
          } else {
            return (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={Icon}
                iconClassName={metric.iconClassName}
                trend={metric.trend}
              />
            );
          }
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Price Trends</CardTitle>
            <CardDescription>Average label prices over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="month"
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke={CHART_COLORS.light.chart1}
                  strokeWidth={3}
                  name="Avg Price (₹)"
                  dot={{ fill: CHART_COLORS.light.chart1, r: 4 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.light.chart2 }}
                />
                <Line
                  type="monotone"
                  dataKey="labels"
                  stroke={CHART_COLORS.light.chart2}
                  strokeWidth={2}
                  name="Label Count"
                  dot={{ fill: CHART_COLORS.light.chart2, r: 4 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.light.chart1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Labels Usage */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Labels Usage Analysis
            </CardTitle>
            <CardDescription>
              Usage patterns and efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={labelsUsageData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="label"
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Bar
                  dataKey="usage"
                  fill={CHART_COLORS.light.chart1}
                  name="Usage (pieces)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Label Type Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Label Type Distribution
            </CardTitle>
            <CardDescription>
              Distribution of label types in inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={labelTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const { percent, payload } = props;
                    const p = percent as number;
                    const name = (payload as { name: string }).name;
                    return `${name} ${(p * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {labelTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Printing Type Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Printing Type Distribution
            </CardTitle>
            <CardDescription>
              Distribution by printing technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={printingTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const { percent, payload } = props;
                    const p = percent as number;
                    const name = (payload as { name: string }).name;
                    return `${name} ${(p * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {printingTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="card-enhanced border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Automated recommendations and predictions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg border border-border/50">
            Note: The AI-Powered Insights shown here are currently hardcoded
            sample data for demonstration purposes only.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_INSIGHTS.map((insight, index) => (
              <div
                key={index}
                className="group p-5 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        insight.impact === "High" ? "default" : "secondary"
                      }
                      className="text-xs font-medium"
                    >
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {insight.confidence}% confidence
                    </div>
                    <Progress value={insight.confidence} className="h-1 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
