"use client";

import { useState } from "react";
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
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  productProfitability,
  recipesAIInsights,
  recipeFinancialOverview,
  recipeProfitMargins,
  ingredientCostDistribution,
  recipeCostTrends,
  costVsProfitData,
  CHART_COLORS,
} from "./recipes-constants";

export function RecipesAnalytics() {
  const [selectedRecipes, setSelectedRecipes] = useState(
    Object.keys(recipeCostTrends[0]).filter((key) => key !== "month")
  );

  const handleRecipeToggle = (recipe: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipe)
        ? prev.filter((r) => r !== recipe)
        : [...prev, recipe]
    );
  };

  const [visibleMetrics, setVisibleMetrics] = useState({
    costPerKg: true,
    sellingPricePerKg: true,
    profitPerKg: true,
  });

  const handleMetricToggle = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

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
                  {Object.keys(recipeCostTrends[0])
                    .filter((key) => key !== "month")
                    .map((recipe) => (
                      <div key={recipe} className="flex items-center space-x-2">
                        <Checkbox
                          id={recipe}
                          checked={selectedRecipes.includes(recipe)}
                          onCheckedChange={() => handleRecipeToggle(recipe)}
                        />
                        <label
                          htmlFor={recipe}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {recipe}
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
            Automated recommendations and predictions
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
