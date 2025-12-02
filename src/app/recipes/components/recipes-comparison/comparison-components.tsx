// src/app/recipes/components/recipes-comparison/comparison-components.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils/shared-utils";
import { GitCompare, Package, TrendingDown, TrendingUp } from "lucide-react";
import type { ComparisonItem } from "./comparison-types";

// Selection Tree Component
export function SelectionTree({
  items,
  selectedIds,
  onSelect,
  maxReached,
}: {
  items: ComparisonItem[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  maxReached: boolean;
}) {
  // Group variants under their parent recipes
  const recipes = items.filter((item) => item.itemType === "recipe");
  const variants = items.filter((item) => item.itemType === "variant");

  return (
    <div className="space-y-2">
      {recipes.map((recipe) => {
        const recipeVariants = variants.filter(
          (v) => v.itemType === "variant" && v.originalRecipeId === recipe.id
        );
        const isSelected = selectedIds.includes(recipe.id);
        const isDisabled = maxReached && !isSelected;

        return (
          <div key={recipe.id}>
            {/* Recipe Row */}
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded hover:bg-slate-50 transition-colors",
                isSelected && "bg-blue-50"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(recipe.id)}
                disabled={isDisabled}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{recipe.name}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{recipe.costPerKg.toFixed(2)}/kg • {recipe.ingredientCount}{" "}
                  ingredients
                </p>
              </div>
              {recipeVariants.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {recipeVariants.length} variants
                </Badge>
              )}
            </div>

            {/* Variants */}
            {recipeVariants.map((variant) => {
              const vIsSelected = selectedIds.includes(variant.id);
              const vIsDisabled = maxReached && !vIsSelected;

              return (
                <div
                  key={variant.id}
                  className={cn(
                    "flex items-center gap-2 p-2 pl-8 rounded hover:bg-slate-50 transition-colors",
                    vIsSelected && "bg-purple-50"
                  )}
                >
                  <Checkbox
                    checked={vIsSelected}
                    onCheckedChange={() => onSelect(variant.id)}
                    disabled={vIsDisabled}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{variant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{variant.costPerKg.toFixed(2)}/kg
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    variant
                  </Badge>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Summary Cards Component
export function SummaryCards({ summary }: { summary: any }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium">Best Cost</p>
        </div>
        <p className="text-2xl font-bold text-green-600">
          ₹{summary.bestCost.cost.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {summary.bestCost.name}
        </p>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-red-50 to-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-red-600" />
          <p className="text-sm font-medium">Highest Cost</p>
        </div>
        <p className="text-2xl font-bold text-red-600">
          ₹{summary.worstCost.cost.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {summary.worstCost.name}
        </p>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-medium">Cost Difference</p>
        </div>
        <p className="text-2xl font-bold">
          ₹{summary.costRange.diff.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {((summary.costRange.diff / summary.costRange.min) * 100).toFixed(1)}%
          variance
        </p>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-amber-50 to-white">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-amber-600" />
          <p className="text-sm font-medium">Common Ingredients</p>
        </div>
        <p className="text-2xl font-bold">{summary.commonIngredients}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Shared across all items
        </p>
      </Card>
    </div>
  );
}
