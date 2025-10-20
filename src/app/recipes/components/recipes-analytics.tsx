// RecipeAnalytics.tsx - Recipe Analytics & Insights

"use client";

import React, { useMemo } from "react";
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
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

import type { Recipe } from "@/lib/types";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { analyzeRecipeCost } from "@/lib/recipe-calculations";
import { CHART_COLORS } from "@/lib/color-utils";

interface RecipeAnalyticsProps {
  recipes: Recipe[];
}

export function RecipeAnalytics({ recipes }: RecipeAnalyticsProps) {
  const supplierMaterials = useSupplierMaterialsWithDetails();

  // Cost comparison data
  const costComparisonData = useMemo(() => {
    return recipes
      .filter((r) => r.status === "active")
      .map((recipe) => ({
        name: recipe.name,
        costPerKg: recipe.costPerKg,
        targetCostPerKg: recipe.targetCostPerKg || 0,
        variance: recipe.targetCostPerKg
          ? ((recipe.costPerKg - recipe.targetCostPerKg) /
              recipe.targetCostPerKg) *
            100
          : 0,
      }))
      .sort((a, b) => b.costPerKg - a.costPerKg);
  }, [recipes]);

  // Target achievement data
  const targetAchievementData = useMemo(() => {
    const withTargets = recipes.filter((r) => r.targetCostPerKg);
    const met = withTargets.filter(
      (r) => r.costPerKg <= r.targetCostPerKg!
    ).length;
    const exceeded = withTargets.length - met;

    return [
      { name: "Met Target", value: met, color: CHART_COLORS.light.chart3 },
      {
        name: "Exceeded Target",
        value: exceeded,
        color: CHART_COLORS.light.chart5,
      },
    ];
  }, [recipes]);

  // Top cost drivers analysis
  const topCostDrivers = useMemo(() => {
    const ingredientCosts = new Map<
      string,
      { name: string; totalCost: number }
    >();

    recipes.forEach((recipe) => {
      const analysis = analyzeRecipeCost(
        recipe.id,
        recipe.name,
        recipe.ingredients,
        supplierMaterials
      );

      analysis.ingredientBreakdown.forEach((item) => {
        const existing = ingredientCosts.get(item.name) || {
          name: item.name,
          totalCost: 0,
        };
        existing.totalCost += item.cost;
        ingredientCosts.set(item.name, existing);
      });
    });

    return Array.from(ingredientCosts.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        cost: item.totalCost,
      }));
  }, [recipes, supplierMaterials]);

  // Recipe complexity (ingredient count)
  const complexityData = useMemo(() => {
    return recipes.map((recipe) => ({
      name: recipe.name,
      ingredients: recipe.ingredients.length,
      costPerKg: recipe.costPerKg,
    }));
  }, [recipes]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts = recipes.reduce((acc, recipe) => {
      acc[recipe.status] = (acc[recipe.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [recipes]);

  // Insights
  const insights = useMemo(() => {
    const insights: Array<{
      title: string;
      description: string;
      impact: "High" | "Medium" | "Low";
      confidence: number;
    }> = [];

    // Check for high-cost recipes
    const avgCost =
      recipes.reduce((sum, r) => sum + r.costPerKg, 0) / recipes.length;
    const expensiveRecipes = recipes.filter((r) => r.costPerKg > avgCost * 1.2);
    if (expensiveRecipes.length > 0) {
      insights.push({
        title: "High-Cost Recipes Detected",
        description: `${expensiveRecipes.length} recipe(s) are 20% above average cost. Consider optimization.`,
        impact: "High",
        confidence: 92,
      });
    }

    // Check target achievement
    const withTargets = recipes.filter((r) => r.targetCostPerKg);
    const belowTarget = withTargets.filter(
      (r) => r.costPerKg > r.targetCostPerKg!
    );
    if (belowTarget.length > 0) {
      insights.push({
        title: "Target Cost Exceeded",
        description: `${belowTarget.length} recipe(s) exceeded their target cost. Review formulations.`,
        impact: "Medium",
        confidence: 88,
      });
    }

    // Check for complex recipes
    const avgIngredients =
      recipes.reduce((sum, r) => sum + r.ingredients.length, 0) /
      recipes.length;
    const complexRecipes = recipes.filter(
      (r) => r.ingredients.length > avgIngredients * 1.5
    );
    if (complexRecipes.length > 0) {
      insights.push({
        title: "Complex Formulations",
        description: `${complexRecipes.length} recipe(s) have high ingredient counts. Consider simplification.`,
        impact: "Low",
        confidence: 75,
      });
    }

    return insights;
  }, [recipes]);

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recipes available for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cost Comparison Chart */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Recipe Cost Comparison</CardTitle>
          <CardDescription>Cost per kg for active recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costComparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                className="stroke-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
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
                }}
              />
              <Legend />
              <Bar
                dataKey="costPerKg"
                fill={CHART_COLORS.light.chart1}
                name="Actual Cost/kg"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="targetCostPerKg"
                fill={CHART_COLORS.light.chart2}
                name="Target Cost/kg"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Achievement Pie Chart */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Target Achievement</CardTitle>
            <CardDescription>Recipes meeting cost targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={targetAchievementData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {targetAchievementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Cost Drivers */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Top Cost Drivers</CardTitle>
            <CardDescription>
              Most expensive ingredients across all recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCostDrivers} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="cost"
                  fill={CHART_COLORS.light.chart4}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>
              Automated recommendations and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
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
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          insight.impact === "High" ? "default" : "secondary"
                        }
                      >
                        {insight.impact}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                  <Progress value={insight.confidence} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
