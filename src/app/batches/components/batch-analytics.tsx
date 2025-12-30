// src/app/batches/components/batch-analytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BatchCostAnalysis } from "@/types/batch-types";
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
  PIE_CHART_CONFIG,
} from "@/utils/chart-utils";
import { formatINR, formatPercentage } from "@/utils/formatting-utils";
import { AlertCircle, DollarSign, Package, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BatchAnalyticsProps {
  costAnalysis: BatchCostAnalysis | null;
}

const COLORS = {
  materials: CHART_COLOR_SCHEMES.default[0],
  packaging: CHART_COLOR_SCHEMES.default[1],
  labels: CHART_COLOR_SCHEMES.default[2],
};

export function BatchAnalytics({ costAnalysis }: BatchAnalyticsProps) {
  if (!costAnalysis) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No analytics available</p>
      </div>
    );
  }

  const costBreakdownData = [
    {
      name: "Materials",
      value: costAnalysis.materialsCost,
      percentage: costAnalysis.materialsPercentage,
    },
    {
      name: "Packaging",
      value: costAnalysis.packagingCost,
      percentage: costAnalysis.packagingPercentage,
    },
    {
      name: "Labels",
      value: costAnalysis.labelsCost,
      percentage: costAnalysis.labelsPercentage,
    },
  ];

  const variantComparisonData = (costAnalysis.variantCosts || []).map((v) => ({
    name: `${v.productName} ${v.variantName}`,
    cost: Math.round(v.totalCost),
    revenue: Math.round(v.totalRevenue),
    profit: Math.round(v.profit),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {formatINR(costAnalysis.totalCost)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">incl. tax</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Expected Revenue
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(costAnalysis.totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">incl. tax</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Expected Profit
              </span>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(costAnalysis.totalProfit)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">incl. tax</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Profit Margin
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div
              className={`text-2xl font-bold ${
                costAnalysis.profitMargin >= 30
                  ? "text-green-600"
                  : costAnalysis.profitMargin >= 20
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {formatPercentage(costAnalysis.profitMargin)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <ResponsiveContainer
                {...CHART_RESPONSIVE_CONFIG}
                height={250}
                className="flex-1"
              >
                <PieChart margin={CHART_MARGIN_CONFIG}>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    dataKey="value"
                    {...PIE_CHART_CONFIG}
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? COLORS.materials
                            : index === 1
                              ? COLORS.packaging
                              : COLORS.labels
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                    labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                    formatter={(value: number) => `₹${value.toFixed(0)}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Custom Legend */}
              <div className="flex-none w-52 space-y-2">
                {costBreakdownData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            index === 0
                              ? COLORS.materials
                              : index === 1
                                ? COLORS.packaging
                                : COLORS.labels,
                        }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{
                        color:
                          index === 0
                            ? COLORS.materials
                            : index === 1
                              ? COLORS.packaging
                              : COLORS.labels,
                      }}
                    >
                      {formatINR(item.value)} (
                      {formatPercentage(item.percentage)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Variant Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Cost vs Revenue by Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <BarChart
                data={variantComparisonData}
                margin={CHART_MARGIN_CONFIG}
              >
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  {...CHART_XAXIS_CONFIG}
                  fontSize={12}
                />
                <YAxis {...CHART_YAXIS_CONFIG} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value, name) => [
                    `₹${value.toLocaleString()}`,
                    name,
                  ]}
                />
                <Legend {...CHART_LEGEND_CONFIG} />
                <Bar
                  dataKey="cost"
                  fill={COLORS.materials}
                  {...BAR_CHART_CONFIG}
                />
                <Bar
                  dataKey="revenue"
                  fill={COLORS.packaging}
                  {...BAR_CHART_CONFIG}
                />
                <Bar
                  dataKey="profit"
                  fill={COLORS.labels}
                  {...BAR_CHART_CONFIG}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Per-Variant Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Profitability Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(costAnalysis.variantCosts || []).map((variant) => {
              const marginColor =
                variant.margin >= 30
                  ? "text-green-600"
                  : variant.margin >= 20
                    ? "text-yellow-600"
                    : "text-red-600";

              return (
                <div key={variant.variantId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {variant.productName} - {variant.variantName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {variant.fillQuantity}
                        {variant.fillUnit} ({variant.units} units)
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${marginColor}`}>
                      {formatPercentage(variant.margin)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Cost/Unit</div>
                      <div className="font-medium">
                        {formatINR(variant.costPerUnit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Selling Price</div>
                      <div className="font-medium">
                        {formatINR(variant.revenuePerUnit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Cost</div>
                      <div className="font-medium">
                        {formatINR(variant.totalCost)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Profit</div>
                      <div className="font-medium text-green-600">
                        {formatINR(variant.profit)}
                      </div>
                    </div>
                  </div>

                  {/* Margin Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Profit Margin</span>
                      <span className={marginColor}>
                        {formatPercentage(variant.margin)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(variant.margin, 100)}
                      className="h-2"
                    />
                  </div>

                  {variant.margin < 20 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Low margin - consider reviewing costs</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costAnalysis.profitMargin < 25 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900 dark:text-yellow-100">
                    Low Overall Margin
                  </div>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your batch has a margin of{" "}
                    {formatPercentage(costAnalysis.profitMargin)}. Consider
                    reviewing supplier prices or adjusting selling prices.
                  </div>
                </div>
              </div>
            )}

            {costAnalysis.materialsPercentage > 70 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    Material-Heavy Composition
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    Materials account for{" "}
                    {formatPercentage(costAnalysis.materialsPercentage)} of
                    costs. Look for bulk discounts or alternative suppliers.
                  </div>
                </div>
              </div>
            )}

            {(costAnalysis.variantCosts || []).some((v) => v.margin > 40) && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900 dark:text-green-100">
                    High-Margin Products Identified
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">
                    Some variants have margins above 40%. Consider increasing
                    production of these high-margin products.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
