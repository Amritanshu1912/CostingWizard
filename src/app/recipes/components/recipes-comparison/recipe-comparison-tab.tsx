"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch, FlaskConical } from "lucide-react";
import { useEnrichedRecipes, useRecipeVariants } from "@/hooks/use-recipes";
import { RecipeComparison } from "./recipe-comparison";

export function RecipeComparisonTab() {
  const enrichedRecipes = useEnrichedRecipes();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  const selectedRecipe = enrichedRecipes.find((r) => r.id === selectedRecipeId);
  const variants = useRecipeVariants(selectedRecipeId);

  // Auto-select first recipe
  useEffect(() => {
    if (!selectedRecipeId && enrichedRecipes.length > 0) {
      setSelectedRecipeId(enrichedRecipes[0].id);
    }
  }, [enrichedRecipes, selectedRecipeId]);

  // Reset selection when recipe changes
  useEffect(() => {
    setSelectedVariantIds([]);
  }, [selectedRecipeId]);

  const handleCompareVariant = (variantId: string) => {
    setSelectedVariantIds((prev) => {
      if (prev.includes(variantId)) {
        return prev.filter((id) => id !== variantId);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 variants
      }
      return [...prev, variantId];
    });
  };

  const enrichedVariants = useMemo(() => {
    if (!selectedRecipe) return [];

    return variants.map((variant) => {
      // Calculate cost per kg for variant (simplified - would need actual calculation logic)
      const costPerKg = selectedRecipe.costPerKg; // Placeholder
      const costDifference = 0; // Placeholder
      const costDifferencePercentage = 0; // Placeholder

      return {
        ...variant,
        costPerKg,
        costDifference,
        costDifferencePercentage,
      };
    });
  }, [variants, selectedRecipe]);

  if (!selectedRecipe) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Recipe Comparison</h3>
          <p className="text-slate-600 mb-6">
            Select a recipe to start comparing variants
          </p>

          {enrichedRecipes.length > 0 ? (
            <Select
              value={selectedRecipeId}
              onValueChange={setSelectedRecipeId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent>
                {enrichedRecipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name} (₹{recipe.costPerKg.toFixed(2)}/kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                No recipes found. Create a recipe first in the Recipes tab.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compare Recipe Variants</h2>
          <p className="text-muted-foreground">
            Select variants of {selectedRecipe.name} to compare their
            performance
          </p>
        </div>
      </div>

      {/* Recipe Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Select Recipe
            </label>
            <Select
              value={selectedRecipeId}
              onValueChange={setSelectedRecipeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a recipe..." />
              </SelectTrigger>
              <SelectContent>
                {enrichedRecipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name} (₹{recipe.costPerKg.toFixed(2)}/kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Variants Selection */}
      {variants.length > 0 ? (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Select Variants to Compare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <Card
                key={variant.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedVariantIds.includes(variant.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => handleCompareVariant(variant.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{variant.name}</h4>
                    {variant.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {variant.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          variant.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {variant.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  {selectedVariantIds.includes(variant.id) && (
                    <div className="text-blue-600">
                      <GitBranch className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Selected: {selectedVariantIds.length} of {variants.length} variants
            {selectedVariantIds.length >= 2 && (
              <span className="text-blue-600 ml-2">(Ready to compare)</span>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Variants Found</h3>
          <p className="text-muted-foreground">
            Create variants in the Recipe Lab to start comparing them.
          </p>
        </Card>
      )}

      {/* Comparison Display */}
      {selectedVariantIds.length >= 2 && (
        <RecipeComparison
          baseRecipe={selectedRecipe}
          variants={enrichedVariants}
          selectedVariantIds={selectedVariantIds}
          onClose={() => setSelectedVariantIds([])}
        />
      )}
    </div>
  );
}
