// src/app/inventory/components/overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import type {
  InventoryItemWithDetails,
  InventoryStats,
} from "@/types/inventory-types";
import {
  BAR_CHART_CONFIG,
  CHART_GRID_CONFIG,
  CHART_LEGEND_CONFIG,
  CHART_MARGIN_CONFIG,
  CHART_RESPONSIVE_CONFIG,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  CHART_XAXIS_CONFIG,
  CHART_YAXIS_CONFIG,
  INVENTORY_CHART_COLORS,
  PIE_CHART_CONFIG,
  calculateTypeDistribution,
  formatChartCurrency,
  formatLegendWithValue,
  prepareStockValueByTypePieData,
  prepareTopItemsByValueBarData,
} from "@/utils/chart-utils";
import { formatINR } from "@/utils/formatting-utils";
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
            value={formatINR(stats.totalStockValue)}
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
                  <ResponsiveContainer
                    {...CHART_RESPONSIVE_CONFIG}
                    height={250}
                  >
                    <PieChart margin={CHART_MARGIN_CONFIG}>
                      <Pie
                        data={pieData}
                        cx="40%"
                        cy="50%"
                        label={false}
                        dataKey="value"
                        {...PIE_CHART_CONFIG}
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
                        formatter={(value: number) => formatINR(value)}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                        labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                      />
                      <Legend
                        formatter={(value, entry: any) =>
                          formatLegendWithValue(value, entry.payload.value)
                        }
                        {...CHART_LEGEND_CONFIG}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
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
                  <ResponsiveContainer
                    {...CHART_RESPONSIVE_CONFIG}
                    height={250}
                  >
                    <BarChart data={topItemsData} margin={CHART_MARGIN_CONFIG}>
                      <CartesianGrid {...CHART_GRID_CONFIG} />
                      <XAxis
                        dataKey="name"
                        {...CHART_XAXIS_CONFIG}
                        width={120}
                        fontSize={11}
                      />
                      <YAxis
                        {...CHART_YAXIS_CONFIG}
                        fontSize={11}
                        tickFormatter={formatChartCurrency}
                      />
                      <Tooltip
                        formatter={(value: number) => formatINR(value)}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                        labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                      />
                      <Bar
                        dataKey="value"
                        fill={INVENTORY_CHART_COLORS[0]}
                        {...BAR_CHART_CONFIG}
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
                              {formatINR(supplier.totalValue)}
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
                            {item.count} • {formatINR(item.value)}
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
