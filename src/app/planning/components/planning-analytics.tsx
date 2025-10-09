"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Factory,
  Clock,
  Target,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { priceHistoryData, costTrends } from "@/lib/constants";
import {
  planningProductionEfficiencyCards,
  planningProductionTimeline,
  planningAIInsights,
  planningPerformanceMetrics,
  planningBenchmarkData,
} from "./planning-constants";

export function PlanningAnalytics() {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Historical Trends */}
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

        {/* Production Analytics Content */}
        <div className="space-y-6">
          {/* Production Efficiency Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {planningProductionEfficiencyCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="card-enhanced">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {card.value}
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">{card.change}</span>
                      <span className="text-muted-foreground">
                        {card.changeText}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Production Timeline */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Production Timeline
              </CardTitle>
              <CardDescription>
                Monthly production output and capacity utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={planningProductionTimeline}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
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
                    dataKey="planned"
                    fill="hsl(var(--muted-foreground))"
                    name="Planned"
                  />
                  <Bar
                    dataKey="actual"
                    fill="hsl(var(--primary))"
                    name="Actual"
                  />
                  <Bar
                    dataKey="capacity"
                    fill="hsl(var(--accent))"
                    name="Capacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Insights */}
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
              {planningAIInsights.map((insight, index) => (
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
                {planningPerformanceMetrics.map((item) => (
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
                <BarChart data={planningBenchmarkData}>
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
    </Tabs>
  );
}
