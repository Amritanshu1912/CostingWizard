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
import {
  useLabelsAnalytics,
  useSupplierLabelTableRows,
} from "@/hooks/label-hooks/use-labels-queries";
import { SupplierLabelTableRow } from "@/types/label-types";
import {
  BAR_CHART_CONFIG,
  CHART_COLOR_SCHEMES,
  CHART_GRID_CONFIG,
  CHART_LEGEND_CONFIG,
  CHART_MARGIN_CONFIG,
  CHART_RESPONSIVE_CONFIG,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  CHART_XAXIS_CONFIG,
  CHART_YAXIS_CONFIG,
  LINE_CHART_CONFIG,
  PIE_CHART_CONFIG,
} from "@/utils/chart-utils";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Sparkles,
  Target,
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

/**
 * LabelsAnalytics component provides comprehensive analytics for labels data
 * including key metrics, trend charts, usage analysis, and AI-powered insights.
 * It visualizes supplier performance, pricing trends, and inventory status for labels.
 */
export function LabelsAnalytics() {
  const supplierLabels = useSupplierLabelTableRows();
  const analytics = useLabelsAnalytics();

  const keyMetrics = useMemo(() => {
    if (!supplierLabels.length) return [];

    const stockAlerts = supplierLabels.filter(
      (sl) =>
        sl.stockStatus === "low-stock" || sl.stockStatus === "out-of-stock"
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

    const avgTaxRate = analytics.avgTax || 0;

    return [
      {
        type: "progress",
        title: "Average Unit Price",
        value: `₹${analytics.avgPrice?.toFixed(2) || "0.00"}`,
        icon: DollarSign,
        iconClassName: "text-green-600",
        progress: {
          current: Math.min((analytics.avgPrice || 0) / 2, 100), // Scale for visual
          max: 100,
          label:
            analytics.avgPrice > 10
              ? "Premium"
              : analytics.avgPrice > 5
                ? "Standard"
                : "Budget",
          color: "success" as const,
        },
      },
      {
        type: "progress",
        title: "Tax Efficiency",
        value: `${avgTaxRate.toFixed(1)}%`,
        icon: Target,
        iconClassName: "text-blue-600",
        progress: {
          current: Math.min(avgTaxRate * 2, 100),
          max: 100,
          label:
            avgTaxRate > 15 ? "High" : avgTaxRate > 10 ? "Moderate" : "Low",
          color: (avgTaxRate > 15 ? "warning" : "success") as
            | "warning"
            | "success",
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
  }, [supplierLabels, analytics]);

  // Generate mock price history data based on current pricing
  function generatePriceHistory(supplierLabels: SupplierLabelTableRow[]) {
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

  // Generate mock price history data based on current pricing
  const priceHistoryData = useMemo(
    () => generatePriceHistory(supplierLabels),
    [supplierLabels]
  );

  // Generate labels usage data by grouping items by type
  function generateLabelsUsageData(supplierLabels: SupplierLabelTableRow[]) {
    if (!supplierLabels.length) return [];

    const typeGroups = supplierLabels.reduce(
      (acc, sl) => {
        const type = sl.labelType || "Unknown";
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

  // Label Type Distribution - use analytics data if available, otherwise calculate
  const labelTypeDistribution = useMemo(() => {
    if (analytics?.typeDistribution) {
      return analytics.typeDistribution.map((item, index) => ({
        name: item.type,
        value: item.percentage,
        color:
          CHART_COLOR_SCHEMES.default[
            index % CHART_COLOR_SCHEMES.default.length
          ],
      }));
    }

    if (!supplierLabels.length) return [];

    const typeCounts = supplierLabels.reduce(
      (acc, sl) => {
        const type = sl.labelType || "Other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = supplierLabels.length;
    return Object.entries(typeCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color:
        CHART_COLOR_SCHEMES.default[index % CHART_COLOR_SCHEMES.default.length],
    }));
  }, [supplierLabels, analytics]);

  // Calculate distribution of printing types for pie chart
  const printingTypeDistribution = useMemo(() => {
    if (analytics?.printingTypeDistribution) {
      return analytics.printingTypeDistribution.map((item, index) => ({
        name: item.printingType,
        value: item.percentage,
        color:
          CHART_COLOR_SCHEMES.default[
            index % CHART_COLOR_SCHEMES.default.length
          ],
      }));
    }

    if (!supplierLabels.length) return [];

    const printingCounts = supplierLabels.reduce(
      (acc, sl) => {
        const printing = sl.printingType || "Other";
        acc[printing] = (acc[printing] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = supplierLabels.length;
    return Object.entries(printingCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color:
        CHART_COLOR_SCHEMES.default[index % CHART_COLOR_SCHEMES.default.length],
    }));
  }, [supplierLabels, analytics]);

  return (
    <div className="space-y-6">
      {/* Display key performance metrics in a responsive grid */}
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

      {/* First row of charts: price trends and usage analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends Chart */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Price Trends</CardTitle>
            <CardDescription>Average label prices over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <LineChart data={priceHistoryData} margin={CHART_MARGIN_CONFIG}>
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis dataKey="month" {...CHART_XAXIS_CONFIG} />
                <YAxis {...CHART_YAXIS_CONFIG} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend {...CHART_LEGEND_CONFIG} />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke={CHART_COLOR_SCHEMES.default[0]}
                  name="Avg Price (₹)"
                  {...LINE_CHART_CONFIG}
                />
                <Line
                  type="monotone"
                  dataKey="labels"
                  stroke={CHART_COLOR_SCHEMES.default[1]}
                  name="Label Count"
                  {...LINE_CHART_CONFIG}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Labels Usage Analysis Chart */}
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <BarChart data={labelsUsageData} margin={CHART_MARGIN_CONFIG}>
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis dataKey="label" {...CHART_XAXIS_CONFIG} />
                <YAxis {...CHART_YAXIS_CONFIG} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend {...CHART_LEGEND_CONFIG} />
                <Bar
                  dataKey="usage"
                  fill={CHART_COLOR_SCHEMES.default[0]}
                  name="Usage (pieces)"
                  {...BAR_CHART_CONFIG}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second row of charts: type distribution and printing distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Label Type Distribution Pie Chart */}
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <PieChart margin={CHART_MARGIN_CONFIG}>
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
                  dataKey="value"
                  {...PIE_CHART_CONFIG}
                >
                  {labelTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Printing Type Distribution Pie Chart */}
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <PieChart margin={CHART_MARGIN_CONFIG}>
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
                  dataKey="value"
                  {...PIE_CHART_CONFIG}
                >
                  {printingTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights section with hardcoded sample data */}
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
