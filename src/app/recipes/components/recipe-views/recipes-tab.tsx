// src/app/recipes/components/recipe-views/recipes-tab.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useEnrichedRecipe,
  useEnrichedRecipes,
  useRecipeIngredients,
  useRecipeVariants,
} from "@/hooks/recipe-hooks/use-recipes";
import { db } from "@/lib/db";
import type { Recipe, RecipeIngredient } from "@/types/shared-types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RecipeDetailView } from "./recipes-detail-view";
import { RecipeErrorBoundary } from "./recipes-error-boundary";
import { RecipeListView } from "./recipes-list-view";

type RecipeStatus = Recipe["status"];

export function RecipesTab() {
  // State
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Data hooks
  const enrichedRecipes = useEnrichedRecipes();
  const selectedRecipe = useEnrichedRecipe(selectedRecipeId);
  const selectedIngredients = useRecipeIngredients(selectedRecipeId);
  const selectedVariants = useRecipeVariants(selectedRecipeId);

  // Auto-select first recipe on mount
  useEffect(() => {
    if (!selectedRecipeId && enrichedRecipes.length > 0) {
      setSelectedRecipeId(enrichedRecipes[0].id);
    }
  }, [enrichedRecipes, selectedRecipeId]);

  // Handlers
  const handleSelectRecipe = useCallback((recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setIsEditMode(false);
    setIsCreatingNew(false);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleAdd = useCallback(() => {
    setIsCreatingNew(true);
    setIsEditMode(true);
    setSelectedRecipeId(null);
    toast.info("Create new recipe in the detail panel");
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedRecipe) return;
    setIsEditMode(true);
    setIsCreatingNew(false);
  }, [selectedRecipe]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    if (isCreatingNew) {
      setIsCreatingNew(false);
      // Restore previous selection
      if (enrichedRecipes.length > 0) {
        setSelectedRecipeId(enrichedRecipes[0].id);
      }
    }
  }, [isCreatingNew, enrichedRecipes]);

  const handleSaveEdit = useCallback(
    async (recipeData: {
      name: string;
      description?: string;
      targetCostPerKg?: number;
      status: RecipeStatus;
      instructions?: string;
      notes?: string;
      version?: number;
      ingredients: RecipeIngredient[];
    }) => {
      try {
        if (isCreatingNew) {
          // CREATE NEW RECIPE
          const newRecipeId = Date.now().toString();
          const now = new Date().toISOString();

          await db.transaction(
            "rw",
            [db.recipes, db.recipeIngredients],
            async () => {
              // Add recipe - ONLY fields from Recipe schema
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

              // Add ingredients - ONLY fields from RecipeIngredient schema
              for (const ing of recipeData.ingredients) {
                // Get supplier material to determine unit
                const sm = await db.supplierMaterials.get(
                  ing.supplierMaterialId
                );

                await db.recipeIngredients.add({
                  id: ing.id.startsWith("temp-")
                    ? Date.now().toString() + Math.random()
                    : ing.id,
                  recipeId: newRecipeId,
                  supplierMaterialId: ing.supplierMaterialId,
                  quantity: ing.quantity,
                  unit: sm?.unit || "gm", // Use supplier material's unit
                  lockedPricing: ing.lockedPricing,
                  createdAt: now,
                  updatedAt: now,
                });
              }
            }
          );

          setSelectedRecipeId(newRecipeId);
          setIsCreatingNew(false);
          setIsEditMode(false);
          toast.success("Recipe created successfully");
        } else if (selectedRecipeId) {
          // UPDATE EXISTING RECIPE
          const now = new Date().toISOString();

          await db.transaction(
            "rw",
            [db.recipes, db.recipeIngredients],
            async () => {
              // Update recipe - ONLY fields from Recipe schema
              const existingRecipe = await db.recipes.get(selectedRecipeId);
              const newVersion =
                recipeData.version !== undefined
                  ? recipeData.version
                  : (existingRecipe?.version || 1) + 1;

              await db.recipes.update(selectedRecipeId, {
                name: recipeData.name,
                description: recipeData.description,
                targetCostPerKg: recipeData.targetCostPerKg,
                status: recipeData.status,
                instructions: recipeData.instructions,
                notes: recipeData.notes,
                version: newVersion,
                updatedAt: now,
              });

              // Delete all existing ingredients
              await db.recipeIngredients
                .where("recipeId")
                .equals(selectedRecipeId)
                .delete();

              // Add updated ingredients
              for (const ing of recipeData.ingredients) {
                await db.recipeIngredients.add({
                  id: ing.id.startsWith("temp-")
                    ? Date.now().toString() + Math.random()
                    : ing.id,
                  recipeId: selectedRecipeId,
                  supplierMaterialId: ing.supplierMaterialId,
                  quantity: ing.quantity,
                  unit: ing.unit || "gm",
                  lockedPricing: ing.lockedPricing,
                  createdAt: ing.createdAt || now,
                  updatedAt: now,
                });
              }
            }
          );

          setIsEditMode(false);
          toast.success("Recipe updated successfully");
        }
      } catch (error) {
        console.error("Save recipe error:", error);
        toast.error("Failed to save recipe");
        throw error;
      }
    },
    [isCreatingNew, selectedRecipeId]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedRecipeId) return;

    const recipe = enrichedRecipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    setRecipeToDelete(recipe);
    setDeleteConfirmOpen(true);
  }, [selectedRecipeId, enrichedRecipes]);

  const confirmDelete = useCallback(async () => {
    if (!recipeToDelete) return;

    try {
      await db.transaction(
        "rw",
        [db.recipes, db.recipeIngredients, db.recipeVariants],
        async () => {
          await db.recipes.delete(recipeToDelete.id);
          await db.recipeIngredients
            .where("recipeId")
            .equals(recipeToDelete.id)
            .delete();
          // Also delete variants
          await db.recipeVariants
            .where("originalRecipeId")
            .equals(recipeToDelete.id)
            .delete();
        }
      );

      // Select another recipe or clear
      const remainingRecipes = enrichedRecipes.filter(
        (r) => r.id !== recipeToDelete.id
      );
      setSelectedRecipeId(
        remainingRecipes.length > 0 ? remainingRecipes[0].id : null
      );

      toast.success("Recipe deleted successfully");
    } catch (error) {
      console.error("Delete recipe error:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setDeleteConfirmOpen(false);
      setRecipeToDelete(null);
    }
  }, [recipeToDelete, enrichedRecipes]);

  return (
    <RecipeErrorBoundary>
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Panel - Recipe List */}
        <div className="col-span-4 flex flex-col">
          <RecipeListView
            recipes={enrichedRecipes}
            selectedRecipeId={selectedRecipeId}
            onSelectRecipe={handleSelectRecipe}
            onAdd={handleAdd}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Right Panel - Recipe Details */}
        <div className="col-span-8 flex flex-col">
          <RecipeDetailView
            recipe={isCreatingNew ? null : selectedRecipe}
            ingredients={isCreatingNew ? [] : selectedIngredients}
            variants={selectedVariants}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditMode={isEditMode}
            isCreatingNew={isCreatingNew}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{recipeToDelete?.name}&quot;
              ? This action cannot be undone and will also delete all associated
              ingredients and variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RecipeErrorBoundary>
  );
}
