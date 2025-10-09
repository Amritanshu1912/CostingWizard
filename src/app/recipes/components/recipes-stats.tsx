// RecipeStats.tsx

import React from "react";
import { FlaskConical, TrendingUp, BarChart3, Calculator } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface RecipeStatsProps {
  totalRecipes: number;
  avgCostPerKg: number;
  avgProfitMargin: number;
  totalPortfolioValue: number;
  totalIngredients: number;
}

export function RecipeStats({
  totalRecipes,
  avgCostPerKg,
  avgProfitMargin,
  totalPortfolioValue,
  totalIngredients,
}: RecipeStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <MetricCard
        title="Total Recipes"
        value={totalRecipes}
        icon={FlaskConical}
        iconClassName="text-primary"
        trend={{ value: "+8%", isPositive: true }}
      />

      <MetricCard
        title="Avg Cost per kg"
        value={`₹${avgCostPerKg.toFixed(2)}`}
        icon={BarChart3}
        iconClassName="text-primary"
        trend={{ value: "-2.1%", isPositive: false }}
      />

      <MetricCard
        title="Avg Profit Margin"
        value={`${avgProfitMargin.toFixed(1)}%`}
        icon={TrendingUp}
        iconClassName="text-primary"
      />

      <MetricCard
        title="Total Portfolio Value"
        value={`₹${totalPortfolioValue.toFixed(0)}`}
        icon={Calculator}
        iconClassName="text-primary"
      />

      <MetricCard
        title="Total Ingredients Used"
        value={totalIngredients}
        icon={BarChart3}
        iconClassName="text-primary"
      />
    </div>
  );
}
