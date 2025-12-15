// src/app/recipes/components/recipes-manager.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Beaker,
  FlaskConical,
  GitBranch,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useRecipeStats } from "@/hooks/recipe-hooks/use-recipe-data";
import { RecipesTab } from "./recipe-views/recipe-tab";
import { RecipeAnalytics } from "./recipes-analytics";
import { RecipeComparison } from "./recipes-comparison/recipe-comparison";
import RecipeLab from "./recipes-lab/recipe-lab";

export function RecipeManager() {
  // Use optimized hooks
  const stats = useRecipeStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Recipe Formulations
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and optimize product recipes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="lab">Recipe Lab</TabsTrigger>
          <TabsTrigger value="comparison">Compare Recipes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total Recipes"
              value={stats.totalRecipes}
              icon={FlaskConical}
              iconClassName="text-blue-600"
              trend={{
                value: "+3",
                isPositive: true,
                label: "this month",
              }}
            />

            <MetricCard
              title="Active Recipes"
              value={stats.activeRecipes}
              icon={Beaker}
              iconClassName="text-green-600"
              trend={{
                value: "+2",
                isPositive: true,
                label: "this week",
              }}
            />

            <MetricCard
              title="Avg Cost/kg"
              value={`₹${stats.avgCostPerKg.toFixed(2)}`}
              icon={BarChart3}
              iconClassName="text-purple-600"
              trend={{
                value: "-2.5%",
                isPositive: true,
                label: "vs last month",
              }}
            />

            <MetricCard
              title="Total Variants"
              value={stats.totalVariants}
              icon={GitBranch}
              iconClassName="text-orange-600"
              description="optimization versions"
            />

            <MetricCard
              title="Target Achievement"
              value={`${stats.targetAchievementRate.toFixed(0)}%`}
              icon={TrendingUp}
              iconClassName="text-amber-600"
              description="recipes meeting target"
            />
          </div>
          <RecipesTab />
        </TabsContent>
        <TabsContent value="lab" className="space-y-6">
          <RecipeLab />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <RecipeComparison />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Recipe Analytics</CardTitle>
              <CardDescription>
                Cost trends and performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipeAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
