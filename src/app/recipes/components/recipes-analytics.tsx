// RecipeAnalytics.tsx - Recipe Analytics & Insights

"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { useEnrichedRecipes, recipeCalculator } from "@/hooks/use-recipes";
import { CHART_COLORS } from "@/lib/color-utils";

interface RecipeAnalyticsProps {
  recipes: Recipe[];
}

export function RecipeAnalytics({ recipes }: RecipeAnalyticsProps) {
  const recipesWithDetails = useEnrichedRecipes();

  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // Initialize selected recipes when data loads
  useEffect(() => {
    if (recipesWithDetails.length > 0 && selectedRecipes.length === 0) {
      setSelectedRecipes(recipesWithDetails.map((r) => r.name));
    }
  }, [recipesWithDetails, selectedRecipes.length]);

  const handleRecipeToggle = (recipe: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipe)
        ? prev.filter((r) => r !== recipe)
        : [...prev, recipe]
    );
  };

  // Ingredient Cost Distribution data
  const ingredientCostDistribution = useMemo(() => {
    const ingredientCosts = new Map<string, { name: string; cost: number }>();

    // Use calculator to get proper cost analysis
    recipesWithDetails.forEach((recipe) => {
      recipe.ingredients.forEach((item) => {
        const existing = ingredientCosts.get(item.displayName) || {
          name: item.displayName,
          cost: 0,
        };
        existing.cost += item.costForQuantity;
        ingredientCosts.set(item.displayName, existing);
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
  }, [recipesWithDetails]);

  // Recipe Cost Trends data (adapted for current values)
  const recipeCostTrends = useMemo(() => {
    // Since we don't have historical data, create a single "current" month entry
    const currentData: Record<string, any> = { month: "Current" };

    recipesWithDetails
      .filter((r) => r.status === "active")
      .forEach((recipe) => {
        currentData[recipe.name] = recipe.costPerKg;
      });

    return [currentData];
  }, [recipesWithDetails]);

  // Recipe Financial Overview data - Cost Price only
  const recipeFinancialOverview = useMemo(() => {
    return recipesWithDetails
      .filter((r) => r.status === "active")
      .map((recipe) => ({
        name: recipe.name,
        costPerKg: recipe.costPerKg,
      }));
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipe Financial Overview - Cost Price Only */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Recipe Cost Overview
            </CardTitle>
            <CardDescription>
              Cost per kg for all active recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recipeFinancialOverview} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
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
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? `₹${value.toFixed(2)}` : value
                  }
                />
                <Bar
                  dataKey="costPerKg"
                  fill={CHART_COLORS.light.chart1}
                  name="Cost per kg"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margins and Ingredient Cost Distribution - Side by Side */}

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
