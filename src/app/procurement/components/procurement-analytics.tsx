"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Package, Star, DollarSign } from "lucide-react";
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
} from "recharts";
import {
  procurementCostSavings,
  procurementLeadTime,
  procurementQualityScore,
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
  return (
    <div className="space-y-6">
      {/* Comprehensive Analytics */}
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card className="border-2" key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                {metric.change ? (
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendingUp className={`h-3 w-3 ${metric.color}`} />
                    <span className={metric.color}>{metric.change}</span>
                    <span className="text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {metric.description}
                  </div>
                )}
              </CardContent>
            </Card>
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
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
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
                fill="hsl(var(--primary))"
                name="On-time Delivery %"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="quality"
                fill="hsl(var(--accent))"
                name="Quality Score %"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="price"
                fill="hsl(var(--secondary))"
                name="Price Competitiveness %"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg">Cost Savings</CardTitle>
            <CardDescription>This quarter vs last quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {procurementCostSavings.value}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {procurementCostSavings.change}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg">Avg Lead Time</CardTitle>
            <CardDescription>Across all suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {procurementLeadTime.value}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {procurementLeadTime.change}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg">Quality Score</CardTitle>
            <CardDescription>Average across suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {procurementQualityScore.value}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {procurementQualityScore.change}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
