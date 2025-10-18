// RecipeManager.tsx

"use client";

import React, { useState, useMemo } from "react";
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
  Calculator,
} from "lucide-react";

import { RecipesAnalytics } from "./recipes-analytics";
import { CostCalculator } from "@/components/cost-calculator";
import { RecipeProductDialog } from "./recipes-dialog";
import { RecipeTable } from "./recipes-table";
import { MetricCard } from "@/components/ui/metric-card";
import { RECIPES } from "./recipes-constants";
import type { Recipe } from "@/lib/types";

export function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);

  const [isAddMode, setIsAddMode] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // --- Optimization: Memoize expensive Quick Stat calculations ---
  const quickStats = useMemo(() => {
    const totalRecipes = recipes.length;

    if (totalRecipes === 0) {
      return {
        totalRecipes: 0,
        avgCostPerKg: 0,
        avgTargetMargin: 0,
        totalIngredients: 0,
      };
    }

    const avgCostPerKg =
      recipes.reduce((sum, r) => sum + (r.costPerKg || 0), 0) / totalRecipes;

    const avgTargetMargin =
      recipes.reduce((sum, r) => sum + (r.targetProfitMargin || 0), 0) /
      totalRecipes;

    const totalIngredients = recipes.reduce(
      (sum, r) => sum + r.ingredients.length,
      0
    );

    return {
      totalRecipes,
      avgCostPerKg,
      avgTargetMargin,
      totalIngredients,
    };
  }, [recipes]);

  const { totalRecipes, avgCostPerKg, avgTargetMargin, totalIngredients } =
    quickStats;

  const handleSaveRecipe = (recipe: Recipe) => {
    if (recipes.some((r) => r.id === recipe.id)) {
      // EDIT mode
      setRecipes(recipes.map((r) => (r.id === recipe.id ? recipe : r)));
      toast.success(`Recipe '${recipe.name}' updated successfully.`);
    } else {
      // ADD mode
      setRecipes([...recipes, recipe]);
      toast.success(`New recipe '${recipe.name}' created successfully.`);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter((r) => r.id !== id));
    toast.success("Recipe deleted successfully");
  };

  // Dialog control handlers
  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
  };

  const handleCloseDialog = () => {
    setIsAddMode(false);
    setEditingRecipe(null);
  };

  const handleAdd = () => {
    setIsAddMode(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Product Recipe Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create, manage, and analyze your product recipes.
          </p>
        </div>
      </div>

      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          {/* Quick Stats */}
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
              title="Avg Target Margin"
              value={`${avgTargetMargin.toFixed(1)}%`}
              icon={TrendingUp}
              iconClassName="text-primary"
            />

            <MetricCard
              title="Total Ingredients Used"
              value={totalIngredients}
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

          <RecipeTable
            recipes={recipes}
            onEdit={handleEdit}
            onDelete={handleDeleteRecipe}
            onAdd={handleAdd}
          />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Advanced Cost Calculator
              </CardTitle>
              <CardDescription>
                Comprehensive cost calculation and optimization tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CostCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Recipe Analytics
              </CardTitle>
              <CardDescription>
                Insights and trends for your product recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipesAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unified Recipe Dialog */}
      <RecipeProductDialog
        isOpen={isAddMode || !!editingRecipe}
        onClose={handleCloseDialog}
        onSave={handleSaveRecipe}
        initialRecipe={editingRecipe}
      />
    </div>
  );
}
