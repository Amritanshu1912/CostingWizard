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
import { Plus } from "lucide-react";

import { AnalyticsCharts } from "@/components/analytics-charts";
import { CostCalculator } from "@/components/cost-calculator";
import { RecipeProductDialog } from "./RecipeProductDialog";
import { RecipeStats } from "./recipe-stats";
import { RecipeOverviewList } from "./recipe-overview-list";
import { RecipeTableSection } from "./recipe-table-section";

import type { Product } from "@/lib/types";
import { PRODUCTS } from "@/lib/constants";
import { RECIPE_COLUMNS } from "./recipe-columns";

// Helper type to align with the columns definition
type RecipeTableRow = Product & {
  ingredientsCount: number;
  batchTotalCost: number;
};

export function RecipeManager() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddMode, setIsAddMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Optimization: Memoize the filtered products list and DERIVE batchTotalCost ---
  const filteredProducts: RecipeTableRow[] = useMemo(() => {
    return products
      .map((p) => {
        const batchSize = p.batchSizeKg || 1;
        const costPerKg = p.totalCostPerKg || 0;

        return {
          ...p,
          ingredientsCount: p.ingredients.length,
          // DERIVED FIELD for the table: total cost for the specific batch size
          batchTotalCost: batchSize * costPerKg,
        } as RecipeTableRow;
      })
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm]);

  // --- Optimization: Memoize expensive Quick Stat calculations ---
  const quickStats = useMemo(() => {
    const totalRecipes = products.length;

    if (totalRecipes === 0) {
      return {
        totalRecipes: 0,
        avgCostPerKg: 0,
        avgProfitMargin: 0,
        totalPortfolioValue: 0,
        highestBatchTotalCost: 0,
        totalIngredients: 0,
      };
    }

    const avgCostPerKg =
      products.reduce((sum, p) => sum + (p.totalCostPerKg || 0), 0) /
      totalRecipes;

    const avgProfitMargin =
      products.reduce((sum, p) => sum + (p.profitMargin || 0), 0) /
      totalRecipes;

    const totalPortfolioValue = products.reduce(
      (sum, p) => sum + ((p.sellingPricePerKg || 0) * (p.batchSizeKg || 0)),
      0
    );

    // FIX: Calculate the highest cost based on the derived total batch cost
    const highestBatchTotalCost = Math.max(
      ...products.map((p) => (p.batchSizeKg || 0) * (p.totalCostPerKg || 0))
    );

    const totalIngredients = products.reduce(
      (sum, p) => sum + p.ingredients.length,
      0
    );

    return {
      totalRecipes,
      avgCostPerKg,
      avgProfitMargin,
      totalPortfolioValue,
      highestBatchTotalCost,
      totalIngredients,
    };
  }, [products]);

  const {
    totalRecipes,
    avgCostPerKg,
    avgProfitMargin,
    totalPortfolioValue,
    highestBatchTotalCost,
    totalIngredients,
  } = quickStats;

  const handleSaveRecipe = (product: Product) => {
    if (products.some((p) => p.id === product.id)) {
      // EDIT mode
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
      toast.success(`Recipe '${product.name}' updated successfully.`);
    } else {
      // ADD mode
      setProducts([...products, product]);
      toast.success(`New recipe '${product.name}' created successfully.`);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Recipe deleted successfully");
  };

  // Dialog control handlers
  const handleEdit = (product: Product) => {
    // Cast to RecipeTableRow to pass to the column definition handler
    setEditingProduct(product);
  };

  const handleCloseDialog = () => {
    setIsAddMode(false);
    setEditingProduct(null);
  };

  // Column configuration, passed handlers
  // Note: We cast the handlers to accept the base Product type for editing,
  // even though the columns expect the derived type for rendering.
  const recipeColumns = RECIPE_COLUMNS({
    onEdit: handleEdit as (recipe: RecipeTableRow) => void,
    onDelete: handleDeleteRecipe,
  });

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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setIsAddMode(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Create Recipe</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <RecipeStats
            totalRecipes={totalRecipes}
            avgCostPerKg={avgCostPerKg}
            avgProfitMargin={avgProfitMargin}
            totalPortfolioValue={totalPortfolioValue}
            highestBatchTotalCost={highestBatchTotalCost}
            totalIngredients={totalIngredients}
          />

          {/* Recent Recipes */}
          <RecipeOverviewList products={products} />
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6">
          <RecipeTableSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredProducts={filteredProducts}
            columns={recipeColumns}
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
              <AnalyticsCharts type="recipes" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unified Recipe Dialog */}
      <RecipeProductDialog
        isOpen={isAddMode || !!editingProduct}
        onClose={handleCloseDialog}
        onSave={handleSaveRecipe}
        initialProduct={editingProduct}
      />
    </div>
  );
}
