// src/app/orders/components/orders-analytics-tab.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { PurchaseOrder } from "@/types/order-types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
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
  BAR_CHART_CONFIG,
} from "@/utils/chart-utils";

interface OrdersAnalyticsTabProps {
  orders: PurchaseOrder[];
}

/**
 * Orders analytics tab component
 * Shows metrics, charts, and insights for orders
 */
export function OrdersAnalyticsTab({ orders }: OrdersAnalyticsTabProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpend = orders.reduce((sum, o) => sum + o.totalCost, 0);
    const activeOrders = orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const deliveryRate =
      totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalSpend,
      activeOrders,
      deliveryRate,
    };
  }, [orders]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [orders]);

  // Spend by supplier for bar chart
  const supplierData = useMemo(() => {
    const supplierSpend: Record<string, number> = {};
    orders.forEach((order) => {
      supplierSpend[order.supplierName] =
        (supplierSpend[order.supplierName] || 0) + order.totalCost;
    });

    return Object.entries(supplierSpend)
      .map(([supplier, spend]) => ({
        supplier,
        spend,
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);
  }, [orders]);

  const COLORS = CHART_COLOR_SCHEMES.default;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={Package}
          description="all time"
        />
        <MetricCard
          title="Total Spend"
          value={`₹${(metrics.totalSpend / 1000).toFixed(1)}k`}
          icon={DollarSign}
          description="procurement cost"
        />
        <MetricCard
          title="Active Orders"
          value={metrics.activeOrders}
          icon={Clock}
          description="pending delivery"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${metrics.deliveryRate.toFixed(1)}%`}
          icon={CheckCircle}
          description="completed orders"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <PieChart margin={CHART_MARGIN_CONFIG}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  dataKey="value"
                  {...PIE_CHART_CONFIG}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                />
                <Legend {...CHART_LEGEND_CONFIG} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend by Supplier */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <BarChart data={supplierData} margin={CHART_MARGIN_CONFIG}>
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis
                  dataKey="supplier"
                  {...CHART_XAXIS_CONFIG}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis {...CHART_YAXIS_CONFIG} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value: number) => `₹${value.toFixed(0)}`}
                />
                <Bar dataKey="spend" fill={COLORS[0]} {...BAR_CHART_CONFIG} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.activeOrders > 5 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📦 High Order Volume
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You have {metrics.activeOrders} active orders. Monitor
                  delivery timelines to ensure inventory availability.
                </p>
              </div>
            )}

            {metrics.deliveryRate < 70 && orders.length > 5 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Low Delivery Rate
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Only {metrics.deliveryRate.toFixed(0)}% of orders have been
                  delivered. Review supplier performance and follow up on
                  pending orders.
                </p>
              </div>
            )}

            {metrics.deliveryRate >= 90 && orders.length > 5 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✓ Excellent Delivery Rate
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {metrics.deliveryRate.toFixed(0)}% delivery rate indicates
                  strong supplier relationships. Keep maintaining these
                  standards.
                </p>
              </div>
            )}

            {orders.length === 0 && (
              <div className="p-4 bg-muted/50 rounded-lg border text-center">
                <p className="text-sm text-muted-foreground">
                  No orders yet. Create your first order to see insights.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
