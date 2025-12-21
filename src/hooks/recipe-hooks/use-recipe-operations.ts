// src/hooks/recipe-hooks/use-recipe-operations.ts
import { db } from "@/lib/db";
import type {
  Recipe,
  RecipeVariant,
  RecipeVariantChange,
  VariantIngredientSnapshot,
} from "@/types/recipe-types";
import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Centralizes all DB write operations for recipes
 * Used in: RecipesTab, RecipeDetailView, Recipe Lab
 */
export function useRecipeOperations() {
  /**
   * Create a new recipe with ingredients
   *
   * @param recipeData - Recipe fields and ingredients
   * @returns New recipe ID
   */
  const createRecipe = useCallback(
    async (recipeData: {
      name: string;
      description?: string;
      targetCostPerKg?: number;
      status?: Recipe["status"];
      instructions?: string;
      notes?: string;
      version?: number;
      ingredients: Array<{
        id: string;
        supplierMaterialId: string;
        quantity: number;
        unit: string;
        lockedPricing?: any;
      }>;
    }): Promise<string> => {
      const newRecipeId = Date.now().toString();
      const now = new Date().toISOString();

      await db.transaction(
        "rw",
        [db.recipes, db.recipeIngredients],
        async () => {
          // Create recipe
          await db.recipes.add({
            id: newRecipeId,
            name: recipeData.name,
            description: recipeData.description || "",
            targetCostPerKg: recipeData.targetCostPerKg,
            status: recipeData.status || "draft",
            version: recipeData.version || 1,
            instructions: recipeData.instructions || "",
            notes: recipeData.notes || "",
            createdAt: now,
            updatedAt: now,
          });

          // Create ingredients
          for (const ing of recipeData.ingredients) {
            await db.recipeIngredients.add({
              id: ing.id.startsWith("temp-")
                ? `${Date.now()}-${Math.random()}`
                : ing.id,
              recipeId: newRecipeId,
              supplierMaterialId: ing.supplierMaterialId,
              quantity: ing.quantity,
              unit: ing.unit as any,
              lockedPricing: ing.lockedPricing,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      );

      toast.success("Recipe created successfully");
      return newRecipeId;
    },
    []
  );

  /**
   * Update existing recipe and its ingredients
   *
   * @param recipeId - Recipe ID to update
   * @param recipeData - Updated recipe fields and ingredients
   */
  const updateRecipe = useCallback(
    async (
      recipeId: string,
      recipeData: {
        name: string;
        description?: string;
        targetCostPerKg?: number;
        status: Recipe["status"];
        instructions?: string;
        notes?: string;
        version?: number;
        ingredients: Array<{
          id: string;
          supplierMaterialId: string;
          quantity: number;
          unit: string;
          lockedPricing?: any;
        }>;
      }
    ): Promise<void> => {
      const now = new Date().toISOString();

      await db.transaction(
        "rw",
        [db.recipes, db.recipeIngredients],
        async () => {
          // Get existing recipe for version
          const existingRecipe = await db.recipes.get(recipeId);
          const newVersion =
            recipeData.version !== undefined
              ? recipeData.version
              : (existingRecipe?.version || 1) + 1;

          // Update recipe
          await db.recipes.update(recipeId, {
            name: recipeData.name,
            description: recipeData.description,
            targetCostPerKg: recipeData.targetCostPerKg,
            status: recipeData.status,
            instructions: recipeData.instructions,
            notes: recipeData.notes,
            version: newVersion,
            updatedAt: now,
          });

          // Delete existing ingredients
          await db.recipeIngredients
            .where("recipeId")
            .equals(recipeId)
            .delete();

          // Add updated ingredients
          for (const ing of recipeData.ingredients) {
            await db.recipeIngredients.add({
              id: ing.id.startsWith("temp-")
                ? `${Date.now()}-${Math.random()}`
                : ing.id,
              recipeId: recipeId,
              supplierMaterialId: ing.supplierMaterialId,
              quantity: ing.quantity,
              unit: ing.unit as any,
              lockedPricing: ing.lockedPricing,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      );

      toast.success("Recipe updated successfully");
    },
    []
  );

  /**
   * Delete recipe and all related data (ingredients, variants)
   *
   * @param recipeId - Recipe ID to delete
   */
  const deleteRecipe = useCallback(async (recipeId: string): Promise<void> => {
    await db.transaction(
      "rw",
      [db.recipes, db.recipeIngredients, db.recipeVariants],
      async () => {
        // Delete recipe
        await db.recipes.delete(recipeId);

        // Delete ingredients
        await db.recipeIngredients.where("recipeId").equals(recipeId).delete();

        // Delete variants
        await db.recipeVariants
          .where("originalRecipeId")
          .equals(recipeId)
          .delete();
      }
    );

    toast.success("Recipe deleted successfully");
  }, []);

  /**
   * Duplicate an existing recipe
   *
   * @param recipeId - Recipe ID to duplicate
   * @returns New recipe ID
   */
  const duplicateRecipe = useCallback(
    async (recipeId: string): Promise<string> => {
      const [recipe, ingredients] = await Promise.all([
        db.recipes.get(recipeId),
        db.recipeIngredients.where("recipeId").equals(recipeId).toArray(),
      ]);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      const newRecipeId = Date.now().toString();
      const now = new Date().toISOString();

      await db.transaction(
        "rw",
        [db.recipes, db.recipeIngredients],
        async () => {
          // Create duplicate recipe
          await db.recipes.add({
            ...recipe,
            id: newRecipeId,
            name: `${recipe.name} (Copy)`,
            version: 1,
            createdAt: now,
            updatedAt: now,
          });

          // Duplicate ingredients
          for (const ing of ingredients) {
            await db.recipeIngredients.add({
              ...ing,
              id: `${Date.now()}-${Math.random()}`,
              recipeId: newRecipeId,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      );

      toast.success("Recipe duplicated successfully");
      return newRecipeId;
    },
    []
  );

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    duplicateRecipe,
  };
}

/**
 * Hook for recipe variant database operations
 *
 * Handles all variant CRUD operations including:
 * - Create variant
 * - Update variant
 * - Delete variant
 * - Update variant metadata
 */
export function useVariantOperations() {
  /**
   * Create a new recipe variant
   */
  const createVariant = useCallback(
    async (variantData: {
      originalRecipeId: string;
      name: string;
      description?: string;
      optimizationGoal?: RecipeVariant["optimizationGoal"];
      ingredientsSnapshot: VariantIngredientSnapshot[];
      changes: RecipeVariantChange[];
      notes?: string;
    }): Promise<string> => {
      const newVariantId = Date.now().toString();
      const now = new Date().toISOString();

      const variant: RecipeVariant = {
        id: newVariantId,
        originalRecipeId: variantData.originalRecipeId,
        name: variantData.name,
        description: variantData.description || "",
        ingredientIds: [], // Not used when snapshot exists
        ingredientsSnapshot: variantData.ingredientsSnapshot,
        optimizationGoal: variantData.optimizationGoal || "cost_reduction",
        isActive: false,
        changes: variantData.changes,
        notes: variantData.notes || "",
        createdAt: now,
        updatedAt: now,
      };

      await db.recipeVariants.add(variant);
      toast.success(`Variant "${variantData.name}" created successfully`);

      return newVariantId;
    },
    []
  );

  /**
   * Update existing variant with new ingredient snapshot
   */
  const updateVariant = useCallback(
    async (
      variantId: string,
      updates: {
        ingredientsSnapshot: VariantIngredientSnapshot[];
        changes: RecipeVariantChange[];
      }
    ): Promise<void> => {
      await db.recipeVariants.update(variantId, {
        ingredientsSnapshot: updates.ingredientsSnapshot,
        changes: updates.changes,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Variant updated successfully");
    },
    []
  );

  /**
   * Update variant metadata (name, description, etc.)
   */
  const updateVariantMetadata = useCallback(
    async (
      variantId: string,
      metadata: {
        name?: string;
        description?: string;
        optimizationGoal?: RecipeVariant["optimizationGoal"];
        isActive?: boolean;
        notes?: string;
      }
    ): Promise<void> => {
      await db.recipeVariants.update(variantId, {
        ...metadata,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Variant details updated");
    },
    []
  );

  /**
   * Delete a variant
   */
  const deleteVariant = useCallback(
    async (variantId: string): Promise<void> => {
      await db.recipeVariants.delete(variantId);
      toast.success("Variant deleted successfully");
    },
    []
  );

  return {
    createVariant,
    updateVariant,
    updateVariantMetadata,
    deleteVariant,
  };
}
