// hooks/use-recipes-with-details.ts
// Optional helper hook for enriched recipe data

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useSupplierMaterialsWithDetails } from "./use-supplier-materials-with-details";
import { calculateRecipeCost, analyzeRecipeCost } from "@/lib/recipe-calculations";
import type { Recipe, RecipeCostAnalysis } from "@/lib/types";

/**
 * Recipe with enriched calculated data
 */
export interface RecipeWithDetails extends Recipe {
    // Calculated metrics
    actualCostPerKg: number;
    actualTotalCost: number;
    totalWeight: number;

    // Target comparison
    isAboveTarget: boolean;
    varianceFromTarget: number | null;
    variancePercentage: number | null;

    // Ingredient details
    ingredientCount: number;

    // Cost analysis
    costAnalysis?: RecipeCostAnalysis;
}

/**
 * Hook that provides recipes with calculated cost data
 */
export function useRecipesWithDetails() {
    const recipes = useLiveQuery(() => db.recipes.toArray(), []);
    const supplierMaterials = useSupplierMaterialsWithDetails();

    const enrichedRecipes = useMemo(() => {
        if (!recipes) return [];

        return recipes.map((recipe): RecipeWithDetails => {
            // Calculate current cost
            const costCalc = calculateRecipeCost(recipe.ingredients, supplierMaterials);

            // Calculate variance from target
            const varianceFromTarget = recipe.targetCostPerKg
                ? costCalc.costPerKg - recipe.targetCostPerKg
                : null;

            const variancePercentage =
                recipe.targetCostPerKg && recipe.targetCostPerKg > 0
                    ? (varianceFromTarget! / recipe.targetCostPerKg) * 100
                    : null;

            // Generate cost analysis
            const costAnalysis = analyzeRecipeCost(
                recipe.id,
                recipe.name,
                recipe.ingredients,
                supplierMaterials
            );

            return {
                ...recipe,
                actualCostPerKg: costCalc.costPerKg,
                actualTotalCost: costCalc.totalCost,
                totalWeight: costCalc.totalWeight,
                isAboveTarget: varianceFromTarget ? varianceFromTarget > 0 : false,
                varianceFromTarget,
                variancePercentage,
                ingredientCount: recipe.ingredients.length,
                costAnalysis,
            };
        });
    }, [recipes, supplierMaterials]);

    return enrichedRecipes;
}

/**
 * Hook for a single recipe with details
 */
export function useRecipeWithDetails(recipeId: string | undefined) {
    const recipe = useLiveQuery(
        () => (recipeId ? db.recipes.get(recipeId) : undefined),
        [recipeId]
    );
    const supplierMaterials = useSupplierMaterialsWithDetails();

    const enrichedRecipe = useMemo(() => {
        if (!recipe) return null;

        const costCalc = calculateRecipeCost(recipe.ingredients, supplierMaterials);

        const varianceFromTarget = recipe.targetCostPerKg
            ? costCalc.costPerKg - recipe.targetCostPerKg
            : null;

        const variancePercentage =
            recipe.targetCostPerKg && recipe.targetCostPerKg > 0
                ? (varianceFromTarget! / recipe.targetCostPerKg) * 100
                : null;

        const costAnalysis = analyzeRecipeCost(
            recipe.id,
            recipe.name,
            recipe.ingredients,
            supplierMaterials
        );

        return {
            ...recipe,
            actualCostPerKg: costCalc.costPerKg,
            actualTotalCost: costCalc.totalCost,
            totalWeight: costCalc.totalWeight,
            isAboveTarget: varianceFromTarget ? varianceFromTarget > 0 : false,
            varianceFromTarget,
            variancePercentage,
            ingredientCount: recipe.ingredients.length,
            costAnalysis,
        } as RecipeWithDetails;
    }, [recipe, supplierMaterials]);

    return enrichedRecipe;
}

/**
 * Hook for recipe comparison
 */
export function useRecipeComparison(recipeId1: string, recipeId2: string) {
    const recipe1 = useRecipeWithDetails(recipeId1);
    const recipe2 = useRecipeWithDetails(recipeId2);

    const comparison = useMemo(() => {
        if (!recipe1 || !recipe2) return null;

        const diff = Math.abs(recipe1.actualCostPerKg - recipe2.actualCostPerKg);
        const cheaper = recipe1.actualCostPerKg < recipe2.actualCostPerKg ? recipe1 : recipe2;
        const expensive = recipe1.actualCostPerKg >= recipe2.actualCostPerKg ? recipe1 : recipe2;
        const base = Math.max(recipe1.actualCostPerKg, recipe2.actualCostPerKg);

        return {
            recipe1,
            recipe2,
            difference: diff,
            differencePercentage: base > 0 ? (diff / base) * 100 : 0,
            cheaper: cheaper.name,
            expensive: expensive.name,
        };
    }, [recipe1, recipe2]);

    return comparison;
}