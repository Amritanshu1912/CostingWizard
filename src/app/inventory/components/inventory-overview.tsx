"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Beaker,
  Box,
  Tag,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import type { InventoryStats, InventoryItemWithDetails } from "@/lib/types";
import { formatCurrency } from "@/app/inventory/utils/inventory-utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/lib/color-utils";
import TransactionHistoryCard from "./transaction-history-card";
import AlertsCard from "./alerts-card";

interface InventoryOverviewProps {
  stats: InventoryStats | undefined;
  items: InventoryItemWithDetails[] | undefined;
}

export function InventoryOverview({ stats, items }: InventoryOverviewProps) {
  if (!stats || !items) {
    return <div>Loading...</div>;
  }

  // Pie chart data
  const pieData = [
    {
      name: "Materials",
      value: stats.byType.materials.value,
      count: stats.byType.materials.count,
    },
    {
      name: "Packaging",
      value: stats.byType.packaging.value,
      count: stats.byType.packaging.count,
    },
    {
      name: "Labels",
      value: stats.byType.labels.value,
      count: stats.byType.labels.count,
    },
  ];

  const COLORS = [
    CHART_COLORS.light.chart1,
    CHART_COLORS.light.chart5,
    CHART_COLORS.light.chart4,
  ];

  // Standard tooltip style for charts (consistent across app)
  const CHART_TOOLTIP_STYLE = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--foreground))",
    padding: "8px",
  } as const;

  // Top 10 items by value - Vertical Bar Chart
  const topItems = [...items]
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 10)
    .reverse() // Reverse for better vertical display
    .map((item) => ({
      name: item.itemName.slice(0, 25),
      value: item.stockValue,
    }));

  // Mock transactions for preview (first N items as sample transactions)
  // Transactions preview now uses hook inside the card — no mock data here.

  return (
    <Card className="p-6">
      <div className="space-y-6 animate-wave-in">
        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            description="Across all categories"
          />

          <MetricCard
            title="Low Stock"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            iconClassName="text-yellow-600"
            description="Below minimum level"
          />

          <MetricCard
            title="Out of Stock"
            value={stats.outOfStockCount}
            icon={AlertTriangle}
            iconClassName="text-destructive"
            description="Requires immediate action"
          />

          <MetricCard
            title="Stock Value"
            value={formatCurrency(stats.totalStockValue)}
            icon={DollarSign}
            iconClassName="text-primary"
            description="Total inventory worth"
          />
        </div>

        {/* Main content: left (4/5) with nested rows and right (1/5) stacked */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 grid grid-rows-2 gap-4">
            {/* Top: two charts side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">
                    Stock Value by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      {/* Legend moved to the right; disable floating labels */}
                      <Pie
                        data={pieData}
                        cx="40%"
                        cy="50%"
                        label={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry) => {
                          const item: any = pieData.find(
                            (d) => d.name === value
                          );
                          return `${value} (${
                            item ? formatCurrency(item.value) : ""
                          })`;
                        }}
                        wrapperStyle={{ right: 0 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">
                    Top 10 Items by Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topItems}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={(value) =>
                          `₹${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                      />
                      <Bar
                        dataKey="value"
                        fill={CHART_COLORS.light.chart1}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bottom: two cards side-by-side (each half of left area) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Stock by Supplier */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">Stock by Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.bySupplier
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 8)
                      .map((supplier) => (
                        <div
                          key={supplier.supplierId}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {supplier.supplierName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {supplier.itemCount} items
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              {formatCurrency(supplier.totalValue)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Distribution Summary - improved layout with progress bars */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">
                    Stock Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const materialVal = stats.byType.materials.value;
                    const packagingVal = stats.byType.packaging.value;
                    const labelsVal = stats.byType.labels.value;
                    const total = materialVal + packagingVal + labelsVal || 1;

                    const rows = [
                      {
                        key: "Materials",
                        value: materialVal,
                        color: CHART_COLORS.light.chart1,
                        count: stats.byType.materials.count,
                      },
                      {
                        key: "Packaging",
                        value: packagingVal,
                        color: CHART_COLORS.light.chart5,
                        count: stats.byType.packaging.count,
                      },
                      {
                        key: "Labels",
                        value: labelsVal,
                        color: CHART_COLORS.light.chart4,
                        count: stats.byType.labels.count,
                      },
                    ];

                    return (
                      <div className="space-y-3">
                        {rows.map((r) => {
                          const pct = Math.round((r.value / total) * 100);
                          return (
                            <div key={r.key}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    style={{ backgroundColor: r.color }}
                                    className="h-3 w-3 rounded-full"
                                  />
                                  <div className="text-sm font-medium">
                                    {r.key}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {r.count} • {formatCurrency(r.value)}
                                </div>
                              </div>
                              <div className="w-full bg-muted/20 h-2 rounded">
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: r.color,
                                  }}
                                  className="h-2 rounded"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column (1/5) spanning both rows: transactions + alerts */}
          <div className="col-span-1 row-span-2 flex flex-col gap-4">
            <TransactionHistoryCard previewCount={10} />
            <AlertsCard previewCount={10} />
          </div>
        </div>
      </div>
    </Card>
  );
}
