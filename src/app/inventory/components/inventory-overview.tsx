// src/app/inventory/components/overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import type {
  InventoryItemWithDetails,
  InventoryStats,
} from "@/types/inventory-types";
import {
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  INVENTORY_CHART_COLORS,
  calculateTypeDistribution,
  formatChartCurrency,
  formatLegendWithValue,
  prepareStockValueByTypePieData,
  prepareTopItemsByValueBarData,
} from "@/utils/inventory-chart-utils";
import { formatCurrency } from "@/utils/inventory-utils";
import { AlertTriangle, DollarSign, Package } from "lucide-react";
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
import InventoryAlertsCard from "./alerts/inventory-alerts-card";
import InventoryTransactionCard from "./transactions/inventory-txn-card";

interface InventoryOverviewProps {
  /** Inventory statistics (from hook) */
  stats: InventoryStats | undefined;
  /** All inventory items with details (from hook) */
  items: InventoryItemWithDetails[] | undefined;
}

/**
 * Main overview dashboard for inventory
 * Displays metrics, charts, and recent activity
 */
export function InventoryOverview({ stats, items }: InventoryOverviewProps) {
  if (!stats || !items) {
    return <div>Loading...</div>;
  }

  // Prepare chart data using utilities
  const pieData = prepareStockValueByTypePieData(items);
  const topItemsData = prepareTopItemsByValueBarData(items, 10);
  const distributionData = calculateTypeDistribution(items);

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

        {/* Main content: left (3/4) charts and right (1/4) activity cards */}
        <div className="grid grid-cols-4 gap-4">
          {/* Left section: Charts and supplier info */}
          <div className="col-span-3 grid grid-rows-2 gap-4">
            {/* Top row: Two charts side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pie Chart: Stock Value by Type */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">
                    Stock Value by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
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
                            fill={
                              INVENTORY_CHART_COLORS[
                                index % INVENTORY_CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                        labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry: any) =>
                          formatLegendWithValue(value, entry.payload.value)
                        }
                        wrapperStyle={{ right: 0 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart: Top 10 Items by Value */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">
                    Top 10 Items by Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topItemsData}>
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
                        tickFormatter={formatChartCurrency}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                        labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                      />
                      <Bar
                        dataKey="value"
                        fill={INVENTORY_CHART_COLORS[0]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bottom row: Two info cards side-by-side */}
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

              {/* Stock Distribution with Progress Bars */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-base">
                    Stock Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {distributionData.map((item) => (
                      <div key={item.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              style={{ backgroundColor: item.color }}
                              className="h-3 w-3 rounded-full"
                            />
                            <div className="text-sm font-medium">
                              {item.key}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.count} • {formatCurrency(item.value)}
                          </div>
                        </div>
                        <div className="w-full bg-muted/20 h-2 rounded">
                          <div
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                            className="h-2 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column (1/4): Recent activity */}
          <div className="col-span-1 row-span-2 flex flex-col gap-4">
            <InventoryTransactionCard previewCount={10} />
            <InventoryAlertsCard previewCount={10} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default InventoryOverview;
