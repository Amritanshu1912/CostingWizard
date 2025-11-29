// src/app/batches/components/batch-analytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BatchCostAnalysis } from "@/lib/types";
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
  materials: "hsl(var(--chart-1))",
  packaging: "hsl(var(--chart-2))",
  labels: "hsl(var(--chart-3))",
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

  const variantComparisonData = costAnalysis.variantCosts.map((v) => ({
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
              ₹{costAnalysis.totalCost.toFixed(0)}
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
              ₹{costAnalysis.totalRevenue.toFixed(0)}
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
              ₹{costAnalysis.totalProfit.toFixed(0)}
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
              {costAnalysis.profitMargin.toFixed(1)}%
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { name } = props as any;
                    const percent = (props as any).percent as number;

                    return `${name}: ${(percent * 100).toFixed(1)}%`;
                  }}
                  outerRadius={80}
                  dataKey="value"
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
                  formatter={(value: number) => `₹${value.toFixed(0)}`}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-2 mt-4">
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
                  <div className="text-sm font-medium">
                    ₹{item.value.toFixed(0)} ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Variant Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Cost vs Revenue by Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={variantComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: "12px" }}
                />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value}`} />
                <Legend />
                <Bar dataKey="cost" fill={COLORS.materials} name="Cost" />
                <Bar dataKey="revenue" fill={COLORS.packaging} name="Revenue" />
                <Bar dataKey="profit" fill={COLORS.labels} name="Profit" />
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
            {costAnalysis.variantCosts.map((variant) => {
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
                      {variant.margin.toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Cost/Unit</div>
                      <div className="font-medium">
                        ₹{variant.costPerUnit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Selling Price</div>
                      <div className="font-medium">
                        ₹{variant.revenuePerUnit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Cost</div>
                      <div className="font-medium">
                        ₹{variant.totalCost.toFixed(0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Profit</div>
                      <div className="font-medium text-green-600">
                        ₹{variant.profit.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {/* Margin Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Profit Margin</span>
                      <span className={marginColor}>
                        {variant.margin.toFixed(1)}%
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
                    {costAnalysis.profitMargin.toFixed(1)}%. Consider reviewing
                    supplier prices or adjusting selling prices.
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
                    {costAnalysis.materialsPercentage.toFixed(1)}% of costs.
                    Look for bulk discounts or alternative suppliers.
                  </div>
                </div>
              </div>
            )}

            {costAnalysis.variantCosts.some((v) => v.margin > 40) && (
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
