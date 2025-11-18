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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
import { ProductionPlan } from "@/lib/types";
import { MetricCard } from "@/components/ui/metric-card";
import { usePlanningStats } from "@/hooks/use-planning";
import { planningAIInsights } from "./planning-constants";
import { CHART_COLORS } from "@/lib/color-utils";

interface PlanningAnalyticsProps {
  plans: ProductionPlan[];
}

export function PlanningAnalytics({ plans }: PlanningAnalyticsProps) {
  // Use the planning stats hook
  const stats = usePlanningStats();

  // Calculate KPIs

  const planningKPIs = [
    {
      title: "Total Plans Revenue",
      value: `₹${(stats.totalRevenue / 100000).toFixed(1)}M`,
      icon: TrendingUp,
      trend: { value: "+15.3%", isPositive: true, label: "vs last month" },
    },
    {
      title: "Total Profit",
      value: `₹${(stats.totalProfit / 100000).toFixed(1)}M`,
      icon: DollarSign,
      trend: { value: "+12.5%", isPositive: true, label: "vs last month" },
    },
    {
      title: "Average Profit Margin",
      value: `${stats.avgProfitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      trend: { value: "+1.2%", isPositive: true, label: "vs last month" },
    },
    {
      title: "Total Plans",
      value: `${stats.totalPlans}`,
      icon: Factory,
      trend: { value: "+5.2%", isPositive: true, label: "vs last month" },
    },
    {
      title: "Active Plans",
      value: `${stats.activePlans}`,
      icon: Target,
      trend: { value: "+2.1%", isPositive: true, label: "vs last month" },
    },
  ];

  // Cost breakdown from active plans
  const activePlansList = plans.filter(
    (p) => p.status === "in-progress" || p.status === "scheduled"
  );
  const materialCosts: { [key: string]: number } = {};
  activePlansList.forEach((plan) => {
    plan.products.forEach((product) => {
      product.materialsRequired.forEach((material) => {
        if (!materialCosts[material.materialName]) {
          materialCosts[material.materialName] = 0;
        }
        materialCosts[material.materialName] += material.totalCost;
      });
    });
  });
  const costBreakdownData = Object.entries(materialCosts).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Plan performance data
  const planPerformanceData = activePlansList.map((plan) => ({
    plan: plan.planName,
    profit: plan.totalProfit,
  }));

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {planningKPIs.map((kpi) => (
          <MetricCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Cost Breakdown and Plan Performance - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Material Cost Breakdown
            </CardTitle>
            <CardDescription>
              Cost distribution across materials in active plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill={CHART_COLORS.light.chart1}
                  label
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Object.values(CHART_COLORS.light)[index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0 0.3)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 400,
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Performance Comparison */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Plan Performance Comparison
            </CardTitle>
            <CardDescription>
              Profit and efficiency across active plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planPerformanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="plan" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0 0.3)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 400,
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Bar
                  dataKey="profit"
                  fill={CHART_COLORS.light.chart1}
                  name="Profit (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
    </div>
  );
}
