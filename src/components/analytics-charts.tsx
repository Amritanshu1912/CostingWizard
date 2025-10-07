"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/ui/metric-card";
import {
  LineChart,
  Line,
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
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Target,
} from "lucide-react";
import {
  priceHistoryData,
  supplierPerformance,
  costTrends,
  materialUsage,
  qualityMetrics,
} from "@/lib/constants";
import type { AnalyticsChartsProps } from "@/lib/types";

export function AnalyticsCharts({ type }: AnalyticsChartsProps) {
  const renderMaterialsAnalytics = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Price Volatility"
          value="+5.2%"
          icon={TrendingUp}
          iconClassName="text-accent"
          progress={{
            value: 65,
            label: "Above average",
          }}
        />

        <MetricCard
          title="Cost Efficiency"
          value="89%"
          icon={Target}
          iconClassName="text-primary"
          progress={{
            value: 89,
            label: "Excellent",
          }}
        />

        <MetricCard
          title="Stock Alerts"
          value={3}
          icon={AlertTriangle}
          iconClassName="text-destructive"
          badge={{
            text: "Low Stock",
            variant: "destructive",
          }}
        />

        <MetricCard
          title="Total Value"
          value="₹5.2L"
          icon={DollarSign}
          iconClassName="text-accent"
          trend={{
            value: "+12% this month",
            positive: true,
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price History Chart */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Price Trends</CardTitle>
            <CardDescription>Average material prices over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistoryData}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Avg Price (₹)"
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
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={materialUsage}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="material"
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
                <Legend />
                <Bar
                  dataKey="usage"
                  fill="hsl(var(--chart-1))"
                  name="Usage (kg)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFormulationsAnalytics = () => (
    <div className="space-y-6">
      {/* Cost Breakdown */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">
            Cost Breakdown Analysis
          </CardTitle>
          <CardDescription>Raw materials vs production costs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={costTrends}>
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
              <Legend />
              <Area
                type="monotone"
                dataKey="rawMaterials"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                name="Raw Materials"
              />
              <Area
                type="monotone"
                dataKey="production"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                name="Production"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Product Profitability
            </CardTitle>
            <CardDescription>Margin analysis by product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Floor Cleaner",
                  margin: 32.5,
                  revenue: 125000,
                  trend: "up",
                },
                {
                  name: "Toilet Cleaner",
                  margin: 28.8,
                  revenue: 98000,
                  trend: "up",
                },
                {
                  name: "Glass Cleaner",
                  margin: 35.2,
                  revenue: 76000,
                  trend: "down",
                },
                {
                  name: "Dish Soap",
                  margin: 24.1,
                  revenue: 145000,
                  trend: "up",
                },
              ].map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {product.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Revenue: ₹{product.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {product.margin}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        margin
                      </div>
                    </div>
                    {product.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-accent" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Quality Metrics</CardTitle>
            <CardDescription>Quality trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityMetrics}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="customerSatisfaction"
                  stroke="hsl(var(--chart-1))"
                  name="Satisfaction %"
                />
                <Line
                  type="monotone"
                  dataKey="defectRate"
                  stroke="hsl(var(--chart-3))"
                  name="Defect Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProductionAnalytics = () => (
    <div className="space-y-6">
      {/* Production Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">78%</div>
              <div className="text-sm text-muted-foreground mb-3">
                Capacity Utilization
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">94%</div>
              <div className="text-sm text-muted-foreground mb-3">
                Quality Score
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">89%</div>
              <div className="text-sm text-muted-foreground mb-3">
                On-time Delivery
              </div>
              <Progress value={89} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Timeline */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">Production Timeline</CardTitle>
          <CardDescription>Planned vs actual production</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={[
                { week: "Week 1", planned: 1200, actual: 1150, efficiency: 96 },
                { week: "Week 2", planned: 1300, actual: 1280, efficiency: 98 },
                { week: "Week 3", planned: 1100, actual: 1050, efficiency: 95 },
                { week: "Week 4", planned: 1400, actual: 1320, efficiency: 94 },
              ]}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
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
                dataKey="planned"
                fill="hsl(var(--chart-1))"
                name="Planned"
              />
              <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcurementAnalytics = () => (
    <div className="space-y-6">
      {/* Supplier Performance */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">
            Supplier Performance
          </CardTitle>
          <CardDescription>Reliability vs pricing analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={supplierPerformance}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                dataKey="avgPrice"
                name="Average Price"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                type="number"
                dataKey="reliability"
                name="Reliability %"
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Scatter dataKey="orders" fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Cost Savings Opportunities
            </CardTitle>
            <CardDescription>Potential savings by optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  category: "Bulk Purchasing",
                  savings: 15000,
                  percentage: 8.5,
                },
                {
                  category: "Supplier Negotiation",
                  savings: 12000,
                  percentage: 6.8,
                },
                {
                  category: "Alternative Materials",
                  savings: 8500,
                  percentage: 4.2,
                },
                {
                  category: "Inventory Optimization",
                  savings: 6200,
                  percentage: 3.1,
                },
              ].map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {item.category}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage}% potential savings
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-accent">
                      ₹{item.savings.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per month
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Order Frequency</CardTitle>
            <CardDescription>Purchase patterns by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierPerformance}>
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
                  dataKey="orders"
                  fill="hsl(var(--chart-3))"
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {type === "materials" && renderMaterialsAnalytics()}
        {type === "formulations" && renderFormulationsAnalytics()}
        {type === "production" && renderProductionAnalytics()}
        {type === "procurement" && renderProcurementAnalytics()}
      </TabsContent>

      <TabsContent value="trends">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Historical Trends</CardTitle>
            <CardDescription>
              Long-term patterns and forecasting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={priceHistoryData}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Average Price"
                />
                <Line
                  type="monotone"
                  dataKey="materials"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="Material Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Performance Metrics
              </CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    metric: "Cost Efficiency",
                    value: 89,
                    target: 85,
                    status: "good",
                  },
                  {
                    metric: "Quality Score",
                    value: 94,
                    target: 90,
                    status: "excellent",
                  },
                  {
                    metric: "Delivery Performance",
                    value: 87,
                    target: 90,
                    status: "warning",
                  },
                  {
                    metric: "Supplier Reliability",
                    value: 92,
                    target: 88,
                    status: "good",
                  },
                ].map((item) => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.metric}
                      </span>
                      <span className="font-medium text-foreground">
                        {item.value}%
                      </span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Target: {item.target}%
                      </span>
                      <Badge
                        variant={
                          item.status === "excellent"
                            ? "default"
                            : item.status === "good"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Benchmark Comparison
              </CardTitle>
              <CardDescription>Industry vs your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { metric: "Cost Efficiency", yours: 89, industry: 82 },
                    { metric: "Quality", yours: 94, industry: 88 },
                    { metric: "Delivery", yours: 87, industry: 85 },
                    { metric: "Innovation", yours: 76, industry: 79 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="metric"
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
                  <Legend />
                  <Bar
                    dataKey="yours"
                    fill="hsl(var(--primary))"
                    name="Your Performance"
                  />
                  <Bar
                    dataKey="industry"
                    fill="hsl(var(--muted-foreground))"
                    name="Industry Average"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="insights">
        <div className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Automated recommendations and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "cost-optimization",
                    title: "Cost Optimization Opportunity",
                    description:
                      "Switch to Supplier B for Caustic Soda to save ₹8,500/month",
                    impact: "High",
                    confidence: 92,
                  },
                  {
                    type: "inventory",
                    title: "Inventory Alert",
                    description:
                      "CBS-X stock will run low in 2 weeks based on current usage",
                    impact: "Medium",
                    confidence: 87,
                  },
                  {
                    type: "quality",
                    title: "Quality Improvement",
                    description:
                      "Adjusting AOS Powder ratio could improve product quality by 3%",
                    impact: "Medium",
                    confidence: 78,
                  },
                  {
                    type: "market",
                    title: "Market Trend",
                    description:
                      "Citric Acid prices expected to increase 12% next quarter",
                    impact: "High",
                    confidence: 85,
                  },
                ].map((insight, index) => (
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
      </TabsContent>
    </Tabs>
  );
}
