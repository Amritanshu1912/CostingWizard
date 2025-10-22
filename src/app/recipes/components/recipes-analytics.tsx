// RecipeAnalytics.tsx - Recipe Analytics & Insights

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
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
import { recipesAIInsights } from "./recipes-constants";
import type { Recipe } from "@/lib/types";
import { useRecipesWithDetails } from "@/hooks/use-recipes-with-details";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { analyzeRecipeCost } from "@/lib/recipe-calculations";
import { CHART_COLORS } from "@/lib/color-utils";

interface RecipeAnalyticsProps {
  recipes: Recipe[];
}

export function RecipeAnalytics({ recipes }: RecipeAnalyticsProps) {
  const recipesWithDetails = useRecipesWithDetails();
  const supplierMaterials = useSupplierMaterialsWithDetails();

  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // Initialize selected recipes when data loads
  React.useEffect(() => {
    if (recipesWithDetails.length > 0 && selectedRecipes.length === 0) {
      setSelectedRecipes(recipesWithDetails.map((r) => r.name));
    }
  }, [recipesWithDetails, selectedRecipes.length]);

  const [visibleMetrics, setVisibleMetrics] = useState({
    costPerKg: true,
    sellingPricePerKg: true,
    profitPerKg: true,
  });

  const handleRecipeToggle = (recipe: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipe)
        ? prev.filter((r) => r !== recipe)
        : [...prev, recipe]
    );
  };

  const handleMetricToggle = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  // Recipe Financial Overview data
  const recipeFinancialOverview = useMemo(() => {
    return recipesWithDetails
      .filter((r) => r.status === "active")
      .map((recipe) => {
        const sellingPricePerKg =
          recipe.actualCostPerKg * (1 + (recipe.targetProfitMargin || 0) / 100);
        const profitPerKg = sellingPricePerKg - recipe.actualCostPerKg;

        return {
          name: recipe.name,
          costPerKg: recipe.actualCostPerKg,
          sellingPricePerKg,
          profitPerKg,
        };
      });
  }, [recipesWithDetails]);

  // Profit Margins data
  const recipeProfitMargins = useMemo(() => {
    return recipesWithDetails
      .filter((r) => r.status === "active")
      .map((recipe) => {
        const sellingPricePerKg =
          recipe.actualCostPerKg * (1 + (recipe.targetProfitMargin || 0) / 100);
        const margin =
          sellingPricePerKg > 0
            ? ((sellingPricePerKg - recipe.actualCostPerKg) /
                sellingPricePerKg) *
              100
            : 0;

        return {
          recipe: recipe.name,
          margin: parseFloat(margin.toFixed(2)),
        };
      })
      .sort((a, b) => b.margin - a.margin);
  }, [recipesWithDetails]);

  // Ingredient Cost Distribution data
  const ingredientCostDistribution = useMemo(() => {
    const ingredientCosts = new Map<string, { name: string; cost: number }>();

    recipesWithDetails.forEach((recipe) => {
      const analysis = analyzeRecipeCost(
        recipe.id,
        recipe.name,
        recipe.ingredients,
        supplierMaterials
      );

      analysis.ingredientBreakdown.forEach((item) => {
        const existing = ingredientCosts.get(item.name) || {
          name: item.name,
          cost: 0,
        };
        existing.cost += item.cost;
        ingredientCosts.set(item.name, existing);
      });
    });

    const totalCost = Array.from(ingredientCosts.values()).reduce(
      (sum, item) => sum + item.cost,
      0
    );

    return Array.from(ingredientCosts.values())
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        value:
          totalCost > 0
            ? parseFloat(((item.cost / totalCost) * 100).toFixed(1))
            : 0,
        cost: item.cost,
      }));
  }, [recipesWithDetails, supplierMaterials]);

  // Product Profitability data
  const productProfitability = useMemo(() => {
    return recipesWithDetails
      .filter((r) => r.status === "active")
      .map((recipe) => {
        const sellingPricePerKg =
          recipe.actualCostPerKg * (1 + (recipe.targetProfitMargin || 0) / 100);
        const margin =
          sellingPricePerKg > 0
            ? ((sellingPricePerKg - recipe.actualCostPerKg) /
                sellingPricePerKg) *
              100
            : 0;
        const revenue = recipe.actualCostPerKg * 1000; // Assuming 1kg for demo, should be actual production volume

        // Placeholder trend logic - in real app this would come from historical data
        const trend =
          margin > 30
            ? "up"
            : margin < 20
            ? "down"
            : Math.random() > 0.5
            ? "up"
            : "down";

        return {
          name: recipe.name,
          margin: parseFloat(margin.toFixed(2)),
          revenue,
          trend,
        };
      })
      .sort((a, b) => b.margin - a.margin);
  }, [recipesWithDetails]);

  // Recipe Cost Trends data (adapted for current values)
  const recipeCostTrends = useMemo(() => {
    // Since we don't have historical data, create a single "current" month entry
    const currentData: Record<string, any> = { month: "Current" };

    recipesWithDetails
      .filter((r) => r.status === "active")
      .forEach((recipe) => {
        currentData[recipe.name] = recipe.actualCostPerKg;
      });

    return [currentData];
  }, [recipesWithDetails]);

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
      {/* Recipe Financial Overview - Grouped Bar Chart */}
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-foreground">
              Recipe Financial Overview
            </CardTitle>
            <CardDescription>
              Cost, Selling Price, and Profit per kg for all recipes
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries({
              costPerKg: "Cost Price",
              sellingPricePerKg: "Selling Price",
              profitPerKg: "Profit",
            }).map(([key, label]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={visibleMetrics[key as keyof typeof visibleMetrics]}
                  onChange={() =>
                    handleMetricToggle(key as keyof typeof visibleMetrics)
                  }
                  className="rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recipeFinancialOverview} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                className="stroke-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="stroke-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
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
              {visibleMetrics.costPerKg && (
                <Bar
                  dataKey="costPerKg"
                  fill={CHART_COLORS.light.chart1}
                  name="Cost per kg"
                  radius={[2, 2, 0, 0]}
                />
              )}
              {visibleMetrics.sellingPricePerKg && (
                <Bar
                  dataKey="sellingPricePerKg"
                  fill={CHART_COLORS.light.chart2}
                  name="Selling Price per kg"
                  radius={[2, 2, 0, 0]}
                />
              )}
              {visibleMetrics.profitPerKg && (
                <Bar
                  dataKey="profitPerKg"
                  fill={CHART_COLORS.light.chart3}
                  name="Profit per kg"
                  radius={[2, 2, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Margins and Ingredient Cost Distribution - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Margins Bar Chart */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Profit Margins by Recipe
            </CardTitle>
            <CardDescription>
              Profit margin percentage for each recipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recipeProfitMargins}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="recipe"
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                              color: "black",
                            }}
                          >
                            {label}
                          </p>
                          {payload.map((entry, index) => (
                            <p
                              key={index}
                              style={{
                                margin: 0,
                                color: "hsl(var(--foreground))",
                              }}
                            >
                              {entry.name}: {entry.value}%
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="margin"
                  fill={CHART_COLORS.light.chart1}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ingredient Cost Distribution Pie Chart */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Ingredient Cost Distribution
            </CardTitle>
            <CardDescription>
              Percentage breakdown of ingredient costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ingredientCostDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill={CHART_COLORS.light.chart1}
                  label
                >
                  {ingredientCostDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Object.values(CHART_COLORS.light)[index % 5]}
                    />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Profitability and Recipe Cost Trends - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Profitability List */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Product Profitability
            </CardTitle>
            <CardDescription>Margin analysis by product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productProfitability.map((product) => (
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

        {/* Recipe Cost Trends - Interactive Line Chart */}
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-foreground">
                Recipe Cost Trends
              </CardTitle>
              <CardDescription>
                Select recipes to view cost trends over recent months
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-64 justify-between">
                  {selectedRecipes.length === 0
                    ? "Select recipes..."
                    : `${selectedRecipes.length} recipe${
                        selectedRecipes.length > 1 ? "s" : ""
                      } selected`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  {recipesWithDetails
                    .filter((r) => r.status === "active")
                    .map((recipe) => (
                      <div
                        key={recipe.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={recipe.name}
                          checked={selectedRecipes.includes(recipe.name)}
                          onCheckedChange={() =>
                            handleRecipeToggle(recipe.name)
                          }
                        />
                        <label
                          htmlFor={recipe.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {recipe.name}
                        </label>
                      </div>
                    ))}
                </div>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recipeCostTrends}>
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
                  formatter={(value) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                {selectedRecipes.map((recipe, index) => (
                  <Line
                    key={recipe}
                    type="monotone"
                    dataKey={recipe}
                    stroke={Object.values(CHART_COLORS.light)[index % 5]}
                    strokeWidth={2}
                    name={recipe}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Insights */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">AI-Powered Insights</CardTitle>
          <CardDescription>
            Automated recommendations and predictions (Note: Using dummy data
            for demonstration)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipesAIInsights.map((insight, index) => (
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
