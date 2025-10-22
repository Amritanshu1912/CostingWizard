"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MetricCard,
  MetricCardWithProgress,
  MetricCardWithBadge,
} from "@/components/ui/metric-card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";
import { Sparkles } from "lucide-react";
import { AI_INSIGHTS } from "./packaging-constants";
import { CHART_COLORS } from "@/lib/color-utils";
import { useSupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign,
  Clock,
} from "lucide-react";

export function PackagingAnalytics() {
  const supplierPackaging = useSupplierPackagingWithDetails();

  // Calculate key metrics dynamically
  const keyMetrics = useMemo(() => {
    if (!supplierPackaging.length) return [];

    // Price Volatility - calculate variance in prices
    const prices = supplierPackaging.map((sp) => sp.unitPrice);
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) /
      prices.length;
    const volatility = (Math.sqrt(variance) / avgPrice) * 100;

    // Stock Alerts - count packaging with limited or out-of-stock
    const stockAlerts = supplierPackaging.filter(
      (sp) =>
        sp.availability === "limited" || sp.availability === "out-of-stock"
    ).length;

    // Total Value - sum of unitPrice * quantityForBulkPrice for all packaging
    const totalValue = supplierPackaging.reduce((sum, sp) => {
      const quantity = sp.quantityForBulkPrice || sp.moq || 1000;
      return sum + sp.unitPrice * quantity;
    }, 0);

    // Avg Lead Time - average lead time across all supplier packaging
    const avgLeadTime =
      supplierPackaging.reduce((sum, sp) => sum + (sp.leadTime || 0), 0) /
      supplierPackaging.length;

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
        title: "Supply Efficiency",
        value: "91%",
        icon: Target,
        iconClassName: "text-primary",
        progress: {
          current: 91,
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
          value: "+15%",
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
          value: "-2 days",
          isPositive: true,
          label: "improvement",
        },
      },
    ];
  }, [supplierPackaging]);

  // Price History Data - create mock trend data based on current prices
  const priceHistoryData = useMemo(() => {
    if (!supplierPackaging.length) return [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseAvgPrice =
      supplierPackaging.reduce((sum, sp) => sum + sp.unitPrice, 0) /
      supplierPackaging.length;
    const basePackaging = supplierPackaging.length * 1000; // Mock packaging count

    return months.map((month, index) => {
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const avgPrice = baseAvgPrice * (1 + variation);
      const packaging = Math.round(basePackaging * (1 + index * 0.05)); // Gradual increase

      return {
        month,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        packaging,
      };
    });
  }, [supplierPackaging]);

  // Packaging Usage Data - calculate based on packaging types
  const packagingUsageData = useMemo(() => {
    if (!supplierPackaging.length) return [];

    const typeGroups = supplierPackaging.reduce((acc, sp) => {
      const type = sp.displayType || "Unknown";
      if (!acc[type]) {
        acc[type] = { count: 0, totalCost: 0 };
      }
      acc[type].count += 1;
      acc[type].totalCost +=
        sp.unitPrice * (sp.quantityForBulkPrice || sp.moq || 1000);
      return acc;
    }, {} as Record<string, { count: number; totalCost: number }>);

    return Object.entries(typeGroups).map(([packaging, data]) => ({
      packaging,
      usage: data.count * 1000, // Mock usage based on count
      cost: Math.round(data.totalCost),
      efficiency: 85 + Math.floor(Math.random() * 10), // Mock efficiency 85-95%
    }));
  }, [supplierPackaging]);

  // Packaging Type Distribution
  const packagingTypeDistribution = useMemo(() => {
    if (!supplierPackaging.length) return [];

    const typeCounts = supplierPackaging.reduce((acc, sp) => {
      const type = sp.displayType || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = supplierPackaging.length;
    const chartColors = Object.values(CHART_COLORS.light);

    return Object.entries(typeCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: chartColors[index % chartColors.length],
    }));
  }, [supplierPackaging]);

  // Supplier Performance Data
  const supplierPerformanceData = useMemo(() => {
    if (!supplierPackaging.length) return [];

    const supplierGroups = supplierPackaging.reduce((acc, sp) => {
      const supplierName = sp.supplier?.name || "Unknown Supplier";
      if (!acc[supplierName]) {
        acc[supplierName] = { leadTimes: [], prices: [] };
      }
      acc[supplierName].leadTimes.push(sp.leadTime || 0);
      acc[supplierName].prices.push(sp.unitPrice);
      return acc;
    }, {} as Record<string, { leadTimes: number[]; prices: number[] }>);

    return Object.entries(supplierGroups).map(([supplier, data]) => ({
      supplier,
      avgLeadTime: Math.round(
        data.leadTimes.reduce((sum, lt) => sum + lt, 0) / data.leadTimes.length
      ),
      avgPrice: parseFloat(
        (
          data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length
        ).toFixed(2)
      ),
    }));
  }, [supplierPackaging]);

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
            <CardDescription>
              Average packaging prices over time
            </CardDescription>
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
                  dataKey="packaging"
                  stroke={CHART_COLORS.light.chart2}
                  strokeWidth={2}
                  name="Packaging Count"
                  dot={{ fill: CHART_COLORS.light.chart2, r: 4 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.light.chart1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Packaging Usage */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Packaging Usage Analysis
            </CardTitle>
            <CardDescription>
              Usage patterns and efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={packagingUsageData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="packaging"
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
                  name="Usage (units)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packaging Type Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Packaging Type Distribution
            </CardTitle>
            <CardDescription>
              Distribution of packaging types in inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={packagingTypeDistribution}
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
                  {packagingTypeDistribution.map((entry, index) => (
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

        {/* Supplier Performance */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Supplier Performance
            </CardTitle>
            <CardDescription>Lead time and pricing comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierPerformanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="supplier"
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  yAxisId="left"
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                  yAxisId="left"
                  dataKey="avgLeadTime"
                  fill={CHART_COLORS.light.chart1}
                  name="Avg Lead Time (days)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="avgPrice"
                  fill={CHART_COLORS.light.chart2}
                  name="Avg Price (₹)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
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
