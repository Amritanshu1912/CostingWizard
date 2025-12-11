/* eslint-disable @typescript-eslint/no-unused-vars */
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
  LINE_CHART_CONFIG,
  PIE_CHART_CONFIG,
  formatChartCurrency,
} from "@/utils/chart-utils";
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <AreaChart data={monthlySpendData} margin={CHART_MARGIN_CONFIG}>
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis dataKey="month" {...CHART_XAXIS_CONFIG} />
                <YAxis {...CHART_YAXIS_CONFIG} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke={CHART_COLOR_SCHEMES.default[0]}
                  fill={CHART_COLOR_SCHEMES.default[0]}
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <PieChart margin={CHART_MARGIN_CONFIG}>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend {...CHART_LEGEND_CONFIG} />
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
          <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={400}>
            <BarChart
              data={supplierPerformanceData}
              margin={CHART_MARGIN_CONFIG}
            >
              <CartesianGrid {...CHART_GRID_CONFIG} />
              <XAxis dataKey="name" {...CHART_XAXIS_CONFIG} />
              <YAxis {...CHART_YAXIS_CONFIG} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(2) : value
                }
              />
              <Legend {...CHART_LEGEND_CONFIG} />
              <Bar
                dataKey="onTime"
                fill={CHART_COLOR_SCHEMES.default[0]}
                name="On-time Delivery %"
                {...BAR_CHART_CONFIG}
              />
              <Bar
                dataKey="quality"
                fill={CHART_COLOR_SCHEMES.default[1]}
                name="Quality Score %"
                {...BAR_CHART_CONFIG}
              />
              <Bar
                dataKey="price"
                fill={CHART_COLOR_SCHEMES.default[2]}
                name="Price Competitiveness %"
                {...BAR_CHART_CONFIG}
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <BarChart
                data={SPEND_BY_SUPPLIER_DATA}
                margin={CHART_MARGIN_CONFIG}
              >
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis dataKey="supplier" {...CHART_XAXIS_CONFIG} />
                <YAxis {...CHART_YAXIS_CONFIG} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Bar
                  dataKey="spend"
                  fill={CHART_COLOR_SCHEMES.default[0]}
                  {...BAR_CHART_CONFIG}
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
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <ComposedChart
                data={combinedTrendsData}
                margin={CHART_MARGIN_CONFIG}
              >
                <CartesianGrid {...CHART_GRID_CONFIG} />
                <XAxis dataKey="month" {...CHART_XAXIS_CONFIG} />
                <YAxis
                  yAxisId="left"
                  {...CHART_YAXIS_CONFIG}
                  orientation="left"
                />
                <YAxis
                  yAxisId="right"
                  {...CHART_YAXIS_CONFIG}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend {...CHART_LEGEND_CONFIG} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke={CHART_COLOR_SCHEMES.default[0]}
                  name="Orders"
                  {...LINE_CHART_CONFIG}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgDeliveryTime"
                  stroke={CHART_COLOR_SCHEMES.default[1]}
                  name="Avg Delivery Time (days)"
                  {...LINE_CHART_CONFIG}
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
