// RecipeManager.tsx - REFACTORED

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
  Beaker,
} from "lucide-react";

import { RecipeDialog } from "./recipes-dialog";
import { RecipeTable } from "./recipes-table";
import { RecipeAnalytics } from "./recipes-analytics";
import { RecipeTweaker } from "./recipes-tweaker";
import { RecipeVariants } from "./recipe-variants";

import type { Recipe } from "@/lib/types";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";
import { MetricCard } from "@/components/ui/metric-card";
import { RECIPES } from "./recipes-constants";

export function RecipeManager() {
  const {
    data: recipes,
    addItem,
    updateItem,
    deleteItem,
  } = useDexieTable<Recipe>(db.recipes, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRecipes = recipes.length;
    const activeRecipes = recipes.filter((r) => r.status === "active").length;

    const avgCostPerKg =
      recipes.length > 0
        ? recipes.reduce((sum, r) => sum + (r.costPerKg || 0), 0) /
          recipes.length
        : 0;

    const totalIngredients = recipes.reduce(
      (sum, r) => sum + r.ingredients.length,
      0
    );

    const recipesWithTarget = recipes.filter((r) => r.targetCostPerKg).length;
    const recipesMetTarget = recipes.filter(
      (r) => r.targetCostPerKg && r.costPerKg <= r.targetCostPerKg
    ).length;
    const targetAchievementRate =
      recipesWithTarget > 0 ? (recipesMetTarget / recipesWithTarget) * 100 : 0;

    return {
      totalRecipes,
      activeRecipes,
      avgCostPerKg,
      totalIngredients,
      targetAchievementRate,
    };
  }, [recipes]);

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      if (recipes.some((r) => r.id === recipe.id)) {
        await updateItem(recipe);
        toast.success(`Recipe "${recipe.name}" updated successfully`);
      } else {
        await addItem(recipe);
        toast.success(`Recipe "${recipe.name}" created successfully`);
      }
      setIsDialogOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      toast.error("Failed to save recipe");
      console.error(error);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success("Recipe deleted successfully");
    } catch (error) {
      toast.error("Failed to delete recipe");
      console.error(error);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRecipe(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecipe(null);
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
        <Button onClick={handleAdd} className="btn-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Create Recipe
        </Button>
      </div>

      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="tweaker">Optimizer</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <MetricCard
              title="Total Recipes"
              value={metrics.totalRecipes}
              icon={FlaskConical}
              iconClassName="text-primary"
            />

            <MetricCard
              title="Active Recipes"
              value={metrics.activeRecipes}
              icon={Beaker}
              iconClassName="text-green-600"
            />

            <MetricCard
              title="Avg Cost/kg"
              value={`₹${metrics.avgCostPerKg.toFixed(2)}`}
              icon={BarChart3}
              iconClassName="text-blue-600"
            />

            <MetricCard
              title="Total Ingredients"
              value={metrics.totalIngredients}
              icon={FlaskConical}
              iconClassName="text-purple-600"
            />

            <MetricCard
              title="Target Achievement"
              value={`${metrics.targetAchievementRate.toFixed(0)}%`}
              icon={TrendingUp}
              iconClassName="text-amber-600"
            />
          </div>

          <RecipeTable
            recipes={recipes}
            onEdit={handleEdit}
            onDelete={handleDeleteRecipe}
            onAdd={handleAdd}
          />
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
              <RecipeTweaker recipes={recipes} />
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
              <RecipeVariants recipes={recipes} />
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
              <RecipeAnalytics recipes={recipes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <RecipeDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveRecipe}
        initialRecipe={editingRecipe}
      />
    </div>
  );
}
