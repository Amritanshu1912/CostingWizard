"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MetricCard,
  MetricCardWithProgress,
  MetricCardWithBadge,
} from "@/components/ui/metric-card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  priceHistoryData,
  materialUsage,
  materialsKeyMetrics,
  materialsAIInsights,
  CHART_COLORS,
} from "./materials-constants";

export function MaterialsAnalytics() {
  return (
    <div className="space-y-6">
      {/* Materials Analytics Content */}
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {materialsKeyMetrics.map((metric) => {
            const Icon = metric.icon;
            if (metric.type === "progress") {
              return (
                <MetricCardWithProgress
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  icon={Icon}
                  iconClassName={metric.iconClassName}
                  progress={metric.progress!}
                />
              );
            } else if (metric.type === "badge") {
              return (
                <MetricCardWithBadge
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  icon={Icon}
                  iconClassName={metric.iconClassName}
                  badges={metric.badges!}
                />
              );
            } else {
              return (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  icon={Icon}
                  iconClassName={metric.iconClassName}
                  trend={metric.trend}
                />
              );
            }
            return null;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price History Chart */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">Price Trends</CardTitle>
              <CardDescription>
                Average material prices over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistoryData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    className="stroke-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="stroke-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgPrice"
                    stroke={CHART_COLORS.light.chart1}
                    strokeWidth={3}
                    name="Avg Price (₹)"
                    dot={{ fill: CHART_COLORS.light.chart1, r: 4 }}
                    activeDot={{ r: 6, fill: CHART_COLORS.light.chart2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="materials"
                    stroke={CHART_COLORS.light.chart2}
                    strokeWidth={2}
                    name="Material Count"
                    dot={{ fill: CHART_COLORS.light.chart2, r: 4 }}
                    activeDot={{ r: 6, fill: CHART_COLORS.light.chart1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Material Usage Analysis */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Material Usage Analysis
              </CardTitle>
              <CardDescription>
                Usage patterns and efficiency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={materialUsage}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="material"
                    className="stroke-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="stroke-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="usage"
                    fill={CHART_COLORS.light.chart1}
                    name="Usage (kg)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">AI-Powered Insights</CardTitle>
          <CardDescription>
            Automated recommendations and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground italic">
            Note: The AI-Powered Insights shown here are currently hardcoded
            sample data for demonstration purposes only.
          </p>
          <div className="space-y-4">
            {materialsAIInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        insight.impact === "High" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {insight.impact}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {insight.confidence}% confidence
                    </div>
                  </div>
                </div>
                <Progress value={insight.confidence} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
