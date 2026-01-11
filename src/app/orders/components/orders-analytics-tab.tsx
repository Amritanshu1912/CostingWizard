// src/app/orders/components/orders-analytics-tab.tsx
"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import type { PurchaseOrder } from "@/types/order-types";
import { AI_INSIGHTS } from "./order-constants";
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
