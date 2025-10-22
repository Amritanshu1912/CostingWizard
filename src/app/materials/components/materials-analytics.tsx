"use client";

import { useMemo } from "react";
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
  Sparkles,
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { AI_INSIGHTS } from "./materials-constants";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { useRecipesWithDetails } from "@/hooks/use-recipes-with-details";
import { CHART_COLORS } from "@/lib/color-utils";
import { calculateMaterialStats } from "./materials-constants";

export function MaterialsAnalytics() {
  const supplierMaterials = useSupplierMaterialsWithDetails();
  const recipes = useRecipesWithDetails();

  // Calculate real metrics using utility function
  const keyMetrics = useMemo(() => {
    if (!supplierMaterials.length) return [];

    const stats = calculateMaterialStats(supplierMaterials);

    // Price Volatility: Calculate coefficient of variation across materials with multiple suppliers
    const materialGroups = supplierMaterials.reduce((acc, sm) => {
      const materialId = sm.materialId;
      if (!materialId) return acc;
      if (!acc[materialId]) acc[materialId] = [];
      acc[materialId].push(sm.unitPrice);
      return acc;
    }, {} as Record<string, number[]>);

    const volatilities = Object.values(materialGroups)
      .filter((prices) => prices.length > 1)
      .map((prices) => {
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance =
          prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
        return (Math.sqrt(variance) / mean) * 100;
      });

    const avgVolatility =
      volatilities.length > 0
        ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length
        : 0;

    // Cost Efficiency: Calculate average discount utilization
    const totalMaterials = supplierMaterials.length;
    const materialsWithDiscounts = supplierMaterials.filter(
      (sm) => sm.bulkDiscounts && sm.bulkDiscounts.length > 0
    ).length;
    const costEfficiency =
      totalMaterials > 0 ? (materialsWithDiscounts / totalMaterials) * 100 : 0;

    // Stock Alerts: Count materials with limited or out-of-stock
    const stockAlerts = supplierMaterials.filter(
      (sm) =>
        sm.availability === "limited" || sm.availability === "out-of-stock"
    ).length;

    // Total Value: Sum of all supplier material values (unitPrice * MOQ)
    const totalValue = supplierMaterials.reduce((sum, sm) => {
      const moq = sm.moq || 1;
      return sum + sm.unitPrice * moq;
    }, 0);

    const color: "default" | "success" | "warning" | "error" =
      costEfficiency > 75
        ? "success"
        : costEfficiency > 50
        ? "warning"
        : "error";

    return [
      {
        type: "progress",
        title: "Price Volatility",
        value: `${avgVolatility.toFixed(1)}%`,
        icon: TrendingUp,
        iconClassName: "text-accent",
        progress: {
          current: Math.min(avgVolatility, 100),
          max: 100,
          label: avgVolatility > 50 ? "High volatility" : "Stable",
          color:
            avgVolatility > 50 ? ("warning" as const) : ("success" as const),
        },
      },
      {
        type: "progress",
        title: "Cost Efficiency",
        value: `${costEfficiency.toFixed(0)}%`,
        icon: Target,
        iconClassName: "text-primary",
        progress: {
          current: costEfficiency,
          max: 100,
          label:
            costEfficiency > 75
              ? "Excellent"
              : costEfficiency > 50
              ? "Good"
              : "Needs improvement",
          color,
        },
      },
      {
        type: "badge",
        title: "Stock Alerts",
        value: stockAlerts,
        icon: AlertTriangle,
        iconClassName: "text-destructive",
        badges:
          stockAlerts > 0
            ? [
                {
                  text: `${stockAlerts} items`,
                  variant: "destructive" as const,
                },
              ]
            : [],
      },
      {
        type: "standard",
        title: "Total Value",
        value: `₹${(totalValue / 100000).toFixed(1)}L`,
        icon: DollarSign,
        iconClassName: "text-accent",
        trend: {
          value: "+8.5%",
          isPositive: true,
          label: "this month",
        },
      },
    ];
  }, [supplierMaterials]);

  // Calculate price trends data
  const priceTrendsData = useMemo(() => {
    if (!supplierMaterials.length) return [];

    // Group by material category
    const categoryData = supplierMaterials.reduce((acc, sm) => {
      const category = sm.material?.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, min: Infinity, max: -Infinity };
      }
      acc[category].total += sm.unitPrice;
      acc[category].count += 1;
      acc[category].min = Math.min(acc[category].min, sm.unitPrice);
      acc[category].max = Math.max(acc[category].max, sm.unitPrice);
      return acc;
    }, {} as Record<string, { total: number; count: number; min: number; max: number }>);

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      avgPrice: (data.total / data.count).toFixed(2),
      minPrice: data.min,
      maxPrice: data.max,
      materialCount: data.count,
    }));
  }, [supplierMaterials]);

  // Calculate material usage data
  const materialUsageData = useMemo(() => {
    if (!recipes.length || !supplierMaterials.length) return [];

    // Aggregate usage from recipes
    const usageMap = new Map<
      string,
      { totalUsage: number; totalCost: number; recipeCount: number }
    >();

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const supplierMaterial = supplierMaterials.find(
          (sm) => sm.id === ingredient.supplierMaterialId
        );
        if (supplierMaterial && supplierMaterial.material) {
          const materialName = supplierMaterial.material.name;
          const existing = usageMap.get(materialName) || {
            totalUsage: 0,
            totalCost: 0,
            recipeCount: 0,
          };

          existing.totalUsage += ingredient.quantity;
          existing.totalCost +=
            supplierMaterial.unitPrice * ingredient.quantity;
          existing.recipeCount += 1;

          usageMap.set(materialName, existing);
        }
      });
    });

    return Array.from(usageMap.entries())
      .map(([material, data]) => ({
        material,
        usage: data.totalUsage,
        cost: data.totalCost,
        efficiency: data.recipeCount > 0 ? 85 + Math.random() * 15 : 85, // Mock efficiency
        recipes: data.recipeCount,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 8); // Top 8 materials
  }, [recipes, supplierMaterials]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric) => {
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
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Price Trends by Category
            </CardTitle>
            <CardDescription>
              Average material prices across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceTrendsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="category"
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
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Bar
                  dataKey="avgPrice"
                  fill={CHART_COLORS.light.chart1}
                  name="Avg Price (₹)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="materialCount"
                  fill={CHART_COLORS.light.chart2}
                  name="Material Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Material Usage */}
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
                data={materialUsageData}
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
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
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
