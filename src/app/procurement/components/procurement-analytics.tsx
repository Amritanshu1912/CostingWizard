"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  TrendingUp,
  Package,
  Star,
  DollarSign,
  CheckCircle,
  Award,
  Clock4,
  Brain,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { CHART_COLORS } from "@/lib/color-utils";
import {
  SPEND_BY_SUPPLIER_DATA,
  ORDER_VOLUME_TRENDS_DATA,
  MATERIAL_COST_BREAKDOWN_DATA,
  DELIVERY_TIME_TRENDS_DATA,
} from "./procurement-constants";

interface ProcurementAnalyticsProps {
  metrics: any[];
  monthlySpendData: any[];
  supplierPerformanceData: any[];
  materialCostData: any[];
  orderStatusData: any[];
}

export function ProcurementAnalytics({
  metrics,
  monthlySpendData,
  supplierPerformanceData,
  materialCostData,
  orderStatusData,
}: ProcurementAnalyticsProps) {
  // Combine order volume and delivery time data for dual-axis chart
  const combinedTrendsData = ORDER_VOLUME_TRENDS_DATA.map((item, index) => ({
    ...item,
    avgDeliveryTime: DELIVERY_TIME_TRENDS_DATA[index]?.avgDeliveryTime || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Comprehensive Analytics */}
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              icon={Icon}
              iconClassName={metric.color}
              description={metric.description}
              trend={
                metric.change
                  ? {
                      value: metric.change,
                      isPositive: metric.trend === "up",
                      label: metric.description,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Procurement Spend
            </CardTitle>
            <CardDescription>
              Track spending trends and order patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlySpendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke={CHART_COLORS.light.chart1}
                  fill={CHART_COLORS.light.chart1}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Order Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of all purchase orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-secondary" />
            Supplier Performance Comparison
          </CardTitle>
          <CardDescription>
            Multi-dimensional performance analysis across all suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={supplierPerformanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="onTime"
                fill={CHART_COLORS.light.chart1}
                name="On-time Delivery %"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="quality"
                fill={CHART_COLORS.light.chart2}
                name="Quality Score %"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="price"
                fill={CHART_COLORS.light.chart3}
                name="Price Competitiveness %"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* New Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Spend by Supplier
            </CardTitle>
            <CardDescription>
              Total procurement spend across suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={SPEND_BY_SUPPLIER_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="supplier"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="spend"
                  fill={CHART_COLORS.light.chart1}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Order Trends & Delivery Time
            </CardTitle>
            <CardDescription>
              Order volume and average delivery times over months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={combinedTrendsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="#000" />
                <YAxis
                  yAxisId="left"
                  stroke={CHART_COLORS.light.chart2}
                  orientation="left"
                />
                <YAxis
                  yAxisId="right"
                  stroke={CHART_COLORS.light.chart4}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke={CHART_COLORS.light.chart2}
                  strokeWidth={3}
                  name="Orders"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgDeliveryTime"
                  stroke={CHART_COLORS.light.chart4}
                  strokeWidth={3}
                  name="Avg Delivery Time (days)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis and recommendations based on procurement data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                📈 Trend Analysis
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Order volume has increased by 25% over the last 6 months.
                Consider scaling supplier capacity for peak seasons.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎯 Optimization Opportunity
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                BulkChem Traders offers 15% better pricing for high-volume
                orders. Consolidate orders to reduce costs.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ⚡ Performance Alert
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Delivery times are improving across all suppliers. Maintain
                current supplier relationships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
