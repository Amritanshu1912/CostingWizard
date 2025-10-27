// recipes-manager.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  FlaskConical,
  TrendingUp,
  BarChart3,
  Beaker,
  GitBranch,
} from "lucide-react";

import { RecipesTab } from "./recipes-tab";
import { RecipeAnalytics } from "./recipes-analytics";
import { RecipeTweaker } from "./recipes-tweaker";
import { RecipeVariants } from "./recipe-variants";

import type { Recipe } from "@/lib/types";
import { MetricCard } from "@/components/ui/metric-card";
import { useEnrichedRecipes, useRecipeStats } from "@/hooks/use-recipes";

export function RecipeManager() {
  // Use optimized hooks
  const enrichedRecipes = useEnrichedRecipes();
  const stats = useRecipeStats();

  // Handlers - simplified since inline editing is used
  const handleEdit = (recipe: Recipe) => {
    // Inline editing handled in RecipesTab
  };

  const handleDeleteRecipe = async (id: string) => {
    // Deletion handled in RecipesTab
  };

  const handleAdd = () => {
    // Addition handled in RecipesTab
  };

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
          <TabsTrigger value="tweaker">Optimizer</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
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

        <TabsContent value="tweaker" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Recipe Optimizer</CardTitle>
              <CardDescription>
                Tweak recipes to maximize profitability and find cost savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipeTweaker recipes={enrichedRecipes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Recipe Variants</CardTitle>
              <CardDescription>
                View and manage saved recipe optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipeVariants recipes={enrichedRecipes} />
            </CardContent>
          </Card>
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
              <RecipeAnalytics recipes={enrichedRecipes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
