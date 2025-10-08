// RecipeStats.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FlaskConical,
  TrendingUp,
  BarChart3,
  Calculator,
} from "lucide-react";

interface RecipeStatsProps {
  totalRecipes: number;
  avgCostPerKg: number;
  avgProfitMargin: number;
  totalPortfolioValue: number;
  highestBatchTotalCost: number;
  totalIngredients: number;
}

export function RecipeStats({
  totalRecipes,
  avgCostPerKg,
  avgProfitMargin,
  totalPortfolioValue,
  highestBatchTotalCost,
  totalIngredients,
}: RecipeStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Recipes
          </CardTitle>
          <FlaskConical className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalRecipes}
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <TrendingUp className="h-3 w-3 text-accent" />
            <span className="text-accent font-medium">+8%</span>
            <span className="text-muted-foreground">from last quarter</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Cost per kg
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ₹{avgCostPerKg.toFixed(2)}
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <TrendingUp className="h-3 w-3 text-destructive" />
            <span className="text-destructive font-medium">-2.1%</span>
            <span className="text-muted-foreground">cost reduced</span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Profit Margin
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {avgProfitMargin.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            across all recipes
          </div>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Portfolio Value
          </CardTitle>
          <Calculator className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ₹{totalPortfolioValue.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">
            estimated batch value
          </div>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Highest Batch Cost
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ₹{highestBatchTotalCost.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            highest batch cost product
          </div>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Ingredients Used
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalIngredients}
          </div>
          <div className="text-xs text-muted-foreground">
            across all current recipes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
