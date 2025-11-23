// src/app/inventory/components/inventory-overview.tsx
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
} from "recharts";
import { CHART_COLORS } from "@/lib/color-utils";

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

  // Top 10 items by value - Vertical Bar Chart
  const topItems = [...items]
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 10)
    .reverse() // Reverse for better vertical display
    .map((item) => ({
      name: item.itemName.slice(0, 25),
      value: item.stockValue,
    }));

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

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Stock Value by Type - Pie Chart */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-base">Stock Value by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, percent } = props as any;
                      return `${name}: ${(percent * 100).toFixed(1)}%`;
                    }}
                    outerRadius={80}
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 10 Items by Value - Vertical Bar Chart */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-base">Top 10 Items by Value</CardTitle>
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
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
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

        {/* By Supplier Summary and Stock Distribution Summary Container */}
        <div className="flex gap-6">
          {/* By Supplier Summary */}
          <Card className="card-enhanced flex-1">
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
          {/* Stock Distribution Summary - grid in card */}
          <Card className="card-enhanced flex-1">
            <CardHeader>
              <CardTitle className="text-base">
                Stock Distribution Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 pb-2">
                    <Beaker className="h-5 w-5 text-blue-500" />
                    <div className="text-sm font-medium">Materials</div>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.byType.materials.count}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats.byType.materials.value)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 pb-2">
                    <Box className="h-5 w-5 text-green-500" />
                    <div className="text-sm font-medium">Packaging</div>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.byType.packaging.count}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats.byType.packaging.value)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 pb-2">
                    <Tag className="h-5 w-5 text-yellow-500" />
                    <div className="text-sm font-medium">Labels</div>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.byType.labels.count}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stats.byType.labels.value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}
