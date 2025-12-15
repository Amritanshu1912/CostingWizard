// src/app/recipes/components/recipes-analytics.tsx
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MetricCard,
  MetricCardWithProgress,
} from "@/components/ui/metric-card";
import { Progress } from "@/components/ui/progress";
import { useRecipeStats } from "@/hooks/recipe-hooks/use-recipe-data";
import { useRecipesForAnalytics } from "@/hooks/recipe-hooks/use-recipe-analytics";
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
  LINE_CHART_CONFIG,
  PIE_CHART_CONFIG,
} from "@/utils/chart-utils";
import {
  AlertCircle,
  Beaker,
  DollarSign,
  FlaskConical,
  GitBranch,
  Sparkles,
  Target,
} from "lucide-react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { recipesAIInsights } from "./recipes-constants";

/**
 * Recipe analytics dashboard
 * Data: Fetched via hooks (useRecipesForAnalytics, useRecipeStats)
 */
export function RecipeAnalytics() {
  // DATA FETCHING (Using Specialized Hooks)
  const recipes = useRecipesForAnalytics(); // Recipes with ingredient details
  const stats = useRecipeStats(); // Pre-calculated stats

  // KEY METRICS
  const keyMetrics = useMemo(
    () => [
      {
        type: "standard" as const,
        title: "Total Recipes",
        value: stats.totalRecipes,
        icon: FlaskConical,
        iconClassName: "text-blue-600",
        trend: {
          value: "+3",
          isPositive: true,
          label: "this month",
        },
      },
      {
        type: "standard" as const,
        title: "Active Recipes",
        value: stats.activeRecipes,
        icon: Beaker,
        iconClassName: "text-green-600",
        trend: {
          value: "+2",
          isPositive: true,
          label: "this week",
        },
      },
      {
        type: "progress" as const,
        title: "Target Achievement",
        value: `${stats.targetAchievementRate.toFixed(0)}%`,
        icon: Target,
        iconClassName: "text-primary",
        progress: {
          current: stats.targetAchievementRate,
          max: 100,
          label:
            stats.targetAchievementRate > 90
              ? "Excellent"
              : stats.targetAchievementRate > 70
                ? "Good"
                : "Needs Improvement",
          color: (stats.targetAchievementRate > 90
            ? "success"
            : stats.targetAchievementRate > 70
              ? "default"
              : "warning") as "default" | "success" | "warning" | "error",
        },
      },
      {
        type: "standard" as const,
        title: "Avg Cost/kg",
        value: `₹${stats.avgCostPerKg.toFixed(2)}`,
        icon: DollarSign,
        iconClassName: "text-purple-600",
        trend: {
          value: "-2.5%",
          isPositive: true,
          label: "vs last month",
        },
      },
      {
        type: "standard" as const,
        title: "Total Variants",
        value: stats.totalVariants,
        icon: GitBranch,
        iconClassName: "text-orange-600",
        description: "optimization versions",
      },
    ],
    [stats]
  );

  // CHART DATA - Recipe Cost vs Target
  const recipeCostVsTargetData = useMemo(() => {
    if (!recipes.length) return [];

    return recipes
      .map((recipe) => ({
        name: recipe.name,
        costPerKg: recipe.costPerKg,
        targetCostPerKg: recipe.targetCostPerKg || recipe.costPerKg * 0.95,
      }))
      .sort((a, b) => b.costPerKg - a.costPerKg)
      .slice(0, 10); // Top 10 by cost
  }, [recipes]);

  // CHART DATA - Ingredient Cost Distribution
  const ingredientCostDistribution = useMemo(() => {
    const ingredientCosts = new Map<string, { name: string; cost: number }>();

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        const key = ing.displayName;
        const existing = ingredientCosts.get(key) || { name: key, cost: 0 };
        existing.cost += ing.costForQuantity;
        ingredientCosts.set(key, existing);
      });
    });

    const totalCost = Array.from(ingredientCosts.values()).reduce(
      (sum, item) => sum + item.cost,
      0
    );

    return Array.from(ingredientCosts.values())
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10) // Top 10
      .map((item, index) => ({
        name: item.name,
        value: parseFloat(item.cost.toFixed(2)),
        percentage:
          totalCost > 0
            ? parseFloat(((item.cost / totalCost) * 100).toFixed(1))
            : 0,
        color:
          CHART_COLOR_SCHEMES.default[
            index % CHART_COLOR_SCHEMES.default.length
          ],
      }));
  }, [recipes]);

  // CHART DATA - Ingredient Weight Distribution
  const ingredientWeightDistribution = useMemo(() => {
    const supplierMaterialWeights = new Map<
      string,
      { name: string; supplier: string; weight: number }
    >();

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        const key = `${ing.materialName || "Unknown"}-${
          ing.supplierName || "Unknown"
        }`;
        const existing = supplierMaterialWeights.get(key) || {
          name: `${ing.materialName || "Unknown"} (${
            ing.supplierName || "Unknown"
          })`,
          supplier: ing.supplierName || "Unknown",

          weight: 0,
        };
        existing.weight += ing.quantity;
        supplierMaterialWeights.set(key, existing);
      });
    });

    return Array.from(supplierMaterialWeights.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10) // Top 10
      .map((item, index) => ({
        name: item.name,
        value: item.weight,
        color:
          CHART_COLOR_SCHEMES.default[
            index % CHART_COLOR_SCHEMES.default.length
          ],
      }));
  }, [recipes]);

  // RENDER - Empty State

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recipes available for analysis</p>
      </div>
    );
  }

  // RENDER - Analytics Dashboard

  return (
    <div className="space-y-6">
      {/* ===== Key Metrics ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {keyMetrics.map((metric) => {
          if (metric.type === "progress") {
            return (
              <MetricCardWithProgress
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                iconClassName={metric.iconClassName}
                progress={metric.progress}
              />
            );
          } else {
            return (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                iconClassName={metric.iconClassName}
                trend={metric.trend}
                description={metric.description}
              />
            );
          }
        })}
      </div>

      {/* ===== Recipe Cost vs Target Chart ===== */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">
            Recipe Cost vs Target
          </CardTitle>
          <CardDescription>
            Cost per kg vs target cost per kg for top 10 recipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
            <LineChart
              data={recipeCostVsTargetData}
              margin={CHART_MARGIN_CONFIG}
            >
              <CartesianGrid {...CHART_GRID_CONFIG} />
              <XAxis
                dataKey="name"
                {...CHART_XAXIS_CONFIG}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis {...CHART_YAXIS_CONFIG} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                formatter={(value) =>
                  typeof value === "number" ? `₹${value.toFixed(2)}` : value
                }
              />
              <Legend {...CHART_LEGEND_CONFIG} />
              <Line
                type="monotone"
                dataKey="costPerKg"
                stroke={CHART_COLOR_SCHEMES.default[0]}
                name="Cost/kg (₹)"
                {...LINE_CHART_CONFIG}
              />
              <Line
                type="monotone"
                dataKey="targetCostPerKg"
                stroke={CHART_COLOR_SCHEMES.default[1]}
                name="Target Cost/kg (₹)"
                {...LINE_CHART_CONFIG}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== Distribution Charts ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredient Cost Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Ingredient Cost Distribution
            </CardTitle>
            <CardDescription>
              Top 10 ingredients by total cost across all recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <PieChart margin={CHART_MARGIN_CONFIG}>
                <Pie
                  data={ingredientCostDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  labelLine={false}
                  {...PIE_CHART_CONFIG}
                >
                  {ingredientCostDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number" ? `₹${value.toFixed(2)}` : value
                  }
                />
                <Legend
                  {...CHART_LEGEND_CONFIG}
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ paddingLeft: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ingredient Weight Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Ingredient Weight Distribution
            </CardTitle>
            <CardDescription>
              Top 10 materials by total weight across all recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer {...CHART_RESPONSIVE_CONFIG} height={300}>
              <PieChart margin={CHART_MARGIN_CONFIG}>
                <Pie
                  data={ingredientWeightDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  labelLine={false}
                  {...PIE_CHART_CONFIG}
                >
                  {ingredientWeightDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                  formatter={(value) =>
                    typeof value === "number"
                      ? `${value.toFixed(1)} gms`
                      : value
                  }
                />
                <Legend
                  {...CHART_LEGEND_CONFIG}
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ paddingLeft: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ===== AI Insights (Sample Data) ===== */}
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
            {recipesAIInsights.map((insight, index) => (
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
