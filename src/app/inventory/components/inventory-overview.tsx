// src/app/inventory/components/inventory-overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Beaker,
  Box,
  Tag,
} from "lucide-react";
import type { InventoryStats, InventoryItemWithDetails } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface InventoryOverviewProps {
  stats: InventoryStats | undefined;
  items: InventoryItemWithDetails[] | undefined;
}

export function InventoryOverview({ stats, items }: InventoryOverviewProps) {
  if (!stats || !items) {
    return <div>Loading...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

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

  const COLORS = ["#60a5fa", "#34d399", "#fbbf24"];

  // Top 10 items by value
  const topItems = [...items]
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 10)
    .map((item) => ({
      name: item.itemName.slice(0, 20),
      value: item.stockValue,
    }));

  return (
    <div className="space-y-6 animate-wave-in">
      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Below minimum level
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {stats.outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate action
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced gradient-ocean text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.totalStockValue)}
            </div>
            <p className="text-xs opacity-90 mt-1">Total inventory worth</p>
          </CardContent>
        </Card>
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
                    const { name } = props as any;
                    const percent = (props as any).percent as number;
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
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Items by Value - Bar Chart */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-base">Top 10 Items by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topItems} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  fontSize={11}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--color-primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* By Supplier Summary */}
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

      {/* Stock Distribution Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Beaker className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byType.materials.count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.byType.materials.value)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Box className="h-5 w-5 text-green-500" />
            <CardTitle className="text-sm font-medium">Packaging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byType.packaging.count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.byType.packaging.value)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Tag className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-sm font-medium">Labels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byType.labels.count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.byType.labels.value)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
