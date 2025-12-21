// src/app/recipes/components/recipes-lab/recipe-lab.tsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRecipeDetail,
  useRecipeIngredients,
  useRecipeVariants,
  useRecipeList,
} from "@/hooks/recipe-hooks/use-recipe-data";
import {
  useRecipeOperations,
  useVariantOperations,
} from "@/hooks/recipe-hooks/use-recipe-operations";
import { useRecipeExperiment } from "@/hooks/recipe-hooks/use-recipe-analytics";
import { db } from "@/lib/db";
import type { OptimizationGoalType } from "@/types/recipe-types";
import {
  createVariantChanges,
  createVariantSnapshot,
} from "@/utils/recipe-utils";
import { FlaskConical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RecipeLabDialogs } from "./recipe-lab-dialogs";
import { RecipeLabMetrics } from "./recipe-lab-metrics";
import { RecipeLabSidebar } from "./recipe-lab-sidebar";
import { RecipeLabWorkspace } from "./recipe-lab-workspace";

/**
 * Recipe Lab - Main coordinator
 */
export default function RecipeLab() {
  // STATE - UI Orchestration Only
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [updateVariantDialogOpen, setUpdateVariantDialogOpen] = useState(false);
  const [updateOriginalDialogOpen, setUpdateOriginalDialogOpen] =
    useState(false);

  // Variant form state
  const [variantName, setVariantName] = useState("");
  const [variantDescription, setVariantDescription] = useState("");
  const [optimizationGoal, setOptimizationGoal] =
    useState<OptimizationGoalType>("cost_reduction");

  // DATA HOOKS
  const recipes = useRecipeList();
  const selectedRecipe = useRecipeDetail(selectedRecipeId || null);
  const selectedIngredients = useRecipeIngredients(selectedRecipeId || null);
  const variants = useRecipeVariants(selectedRecipeId || null);

  // OPERATIONS HOOKS
  const { updateRecipe } = useRecipeOperations();
  const { createVariant, updateVariant, updateVariantMetadata, deleteVariant } =
    useVariantOperations();

  // EXPERIMENT HOOK - Manages Experiment State
  const {
    experimentIngredients,
    metrics,
    loadedVariantName,
    initializeExperiment,
    handleQuantityChange,
    handleSupplierChange,
    handleTogglePriceLock,
    handleRemoveIngredient,
    handleResetIngredient,
    handleResetAll,
    loadVariant,
  } = useRecipeExperiment(selectedRecipe);

  // AUTO-SELECT FIRST RECIPE
  useEffect(() => {
    if (!selectedRecipeId && recipes.length > 0) {
      setSelectedRecipeId(recipes[0].id);
    }
  }, [selectedRecipeId, recipes]);

  // INITIALIZE EXPERIMENT WHEN RECIPE CHANGES
  useEffect(() => {
    if (selectedRecipe && selectedIngredients.length > 0) {
      initializeExperiment(selectedRecipe, selectedIngredients);
    }
  }, [selectedRecipe, selectedIngredients, initializeExperiment]);

  // HANDLERS - Variant CRUD
  const handleSaveVariant = useCallback(async () => {
    if (!selectedRecipe || !variantName.trim()) {
      toast.error("Variant name is required");
      return;
    }

    try {
      // Use utility functions from recipe-utils.ts
      const changes = createVariantChanges(experimentIngredients, []); // Will be computed in workspace
      const snapshot = createVariantSnapshot(experimentIngredients);

      const newVariantId = await createVariant({
        originalRecipeId: selectedRecipe.id,
        name: variantName,
        description: variantDescription,
        optimizationGoal,
        ingredientsSnapshot: snapshot,
        changes,
        notes: variantDescription,
      });

      // Load newly created variant
      const saved = await db.recipeVariants.get(newVariantId);
      if (saved && saved.ingredientsSnapshot) {
        loadVariant(saved, saved.ingredientsSnapshot);
      }

      setSaveDialogOpen(false);
      setVariantName("");
      setVariantDescription("");
    } catch (error) {
      console.error("Save variant error:", error);
      toast.error("Failed to save variant");
    }
  }, [
    selectedRecipe,
    variantName,
    variantDescription,
    optimizationGoal,
    experimentIngredients,
    createVariant,
    loadVariant,
  ]);

  const handleUpdateVariant = useCallback(async () => {
    if (!loadedVariantName) {
      toast.error("No variant loaded to update");
      return;
    }

    try {
      const existingVariant = variants.find(
        (v) => v.name === loadedVariantName
      );
      if (!existingVariant) {
        toast.error("Variant not found");
        return;
      }

      const changes = createVariantChanges(experimentIngredients, []);
      const snapshot = createVariantSnapshot(experimentIngredients);

      await updateVariant(existingVariant.id, {
        ingredientsSnapshot: snapshot,
        changes,
      });

      // Reload variant
      const saved = await db.recipeVariants.get(existingVariant.id);
      if (saved && saved.ingredientsSnapshot) {
        loadVariant(saved, saved.ingredientsSnapshot);
      }

      setUpdateVariantDialogOpen(false);
    } catch (error) {
      console.error("Update variant error:", error);
      toast.error("Failed to update variant");
    }
  }, [
    loadedVariantName,
    variants,
    experimentIngredients,
    updateVariant,
    loadVariant,
  ]);

  const handleUpdateOriginal = useCallback(() => {
    if (!selectedRecipe) return;
    setUpdateOriginalDialogOpen(true);
  }, [selectedRecipe]);

  const performUpdateOriginal = useCallback(async () => {
    if (!selectedRecipe) return;
    setUpdateOriginalDialogOpen(false);

    try {
      await updateRecipe(selectedRecipe.id, {
        name: selectedRecipe.name,
        description: selectedRecipe.description,
        targetCostPerKg: selectedRecipe.targetCostPerKg,
        status: selectedRecipe.status,
        instructions: selectedRecipe.instructions,
        notes: selectedRecipe.notes,
        version: (selectedRecipe.version || 1) + 1,
        ingredients: experimentIngredients.map((ing) => ({
          id: ing.id,
          supplierMaterialId: ing.supplierMaterialId,
          quantity: ing.quantity,
          unit: ing.unit,
          lockedPricing: ing.lockedPricing,
        })),
      });

      handleResetAll();
    } catch (error) {
      console.error("Update recipe error:", error);
      toast.error("Failed to update recipe");
    }
  }, [selectedRecipe, experimentIngredients, updateRecipe, handleResetAll]);

  const handleLoadOriginalRecipe = useCallback(() => {
    if (selectedRecipe && selectedIngredients.length > 0) {
      initializeExperiment(selectedRecipe, selectedIngredients);
    }
  }, [selectedRecipe, selectedIngredients, initializeExperiment]);

  const handleDeleteVariant = useCallback(
    async (variantId: string) => {
      await deleteVariant(variantId);
      handleResetAll();
    },
    [deleteVariant, handleResetAll]
  );

  const handleUpdateVariantDetails = useCallback(
    async (variant: any) => {
      await updateVariantMetadata(variant.id, {
        name: variant.name,
        description: variant.description,
        optimizationGoal: variant.optimizationGoal,
        isActive: variant.isActive,
        notes: variant.notes,
      });

      // Reload variant with dual strategy
      const saved = await db.recipeVariants.get(variant.id);
      if (saved) {
        let ingredients;

        // Dual strategy: prefer snapshot if available, fallback to database
        if (saved.ingredientsSnapshot && saved.ingredientsSnapshot.length > 0) {
          // Use snapshot for variants that have it (newer variants)
          ingredients = saved.ingredientsSnapshot;
        } else {
          // Fallback to fetching ingredients by variant ID (legacy variants)
          ingredients = await db.recipeIngredients
            .where("recipeId")
            .equals(saved.id)
            .toArray();
        }

        loadVariant(saved, ingredients);
      }
    },
    [updateVariantMetadata, loadVariant]
  );

  const handleLoadVariant = useCallback(
    async (variant: any) => {
      let ingredients;

      // Dual strategy: prefer snapshot if available, fallback to database
      if (
        variant.ingredientsSnapshot &&
        variant.ingredientsSnapshot.length > 0
      ) {
        // Use snapshot for variants that have it (newer variants)
        ingredients = variant.ingredientsSnapshot;
      } else {
        // Fallback to fetching ingredients by variant ID (legacy variants)
        ingredients = await db.recipeIngredients
          .where("recipeId")
          .equals(variant.id)
          .toArray();
      }

      loadVariant(variant, ingredients);
    },
    [loadVariant]
  );

  // RENDER - Empty State
  if (!selectedRecipe) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Recipe Lab</h3>
          <p className="text-slate-600 mb-6">
            Select a recipe to start experimenting
          </p>

          {recipes.length > 0 ? (
            <Select
              value={selectedRecipeId}
              onValueChange={setSelectedRecipeId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
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
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Sidebar - Only needs display data */}
      <RecipeLabSidebar
        recipes={recipes}
        selectedRecipeId={selectedRecipeId}
        variants={variants}
        loadedVariantName={loadedVariantName}
        onSelectRecipe={setSelectedRecipeId}
        onLoadVariant={handleLoadVariant}
      />

      {/* Workspace - Fetches its own material data internally */}
      <RecipeLabWorkspace
        selectedRecipeName={selectedRecipe.name}
        loadedVariantName={loadedVariantName}
        currentVariant={variants.find((v) => v.name === loadedVariantName)}
        experimentIngredients={experimentIngredients}
        metrics={metrics}
        onQuantityChange={handleQuantityChange}
        onSupplierChange={handleSupplierChange}
        onTogglePriceLock={handleTogglePriceLock}
        onRemoveIngredient={handleRemoveIngredient}
        onResetIngredient={handleResetIngredient}
        onResetAll={handleResetAll}
        onSaveAsVariant={() => setSaveDialogOpen(true)}
        onUpdateVariant={() => setUpdateVariantDialogOpen(true)}
        onLoadOriginalRecipe={handleLoadOriginalRecipe}
        onUpdateOriginal={handleUpdateOriginal}
        onDeleteVariant={handleDeleteVariant}
        onUpdateVariantDetails={handleUpdateVariantDetails}
      />

      {/* Metrics - Computes suggestions internally */}
      <RecipeLabMetrics
        metrics={metrics}
        experimentIngredients={experimentIngredients}
        onApplySuggestion={handleSupplierChange}
      />

      {/* Dialogs */}
      <RecipeLabDialogs
        saveDialogOpen={saveDialogOpen}
        updateVariantDialogOpen={updateVariantDialogOpen}
        recipeName={selectedRecipe.name}
        loadedVariantName={loadedVariantName}
        variantName={variantName}
        variantDescription={variantDescription}
        optimizationGoal={optimizationGoal}
        experimentIngredients={experimentIngredients}
        savings={metrics.savings}
        savingsPercent={metrics.savingsPercent}
        onSaveDialogOpenChange={setSaveDialogOpen}
        onUpdateDialogOpenChange={setUpdateVariantDialogOpen}
        onVariantNameChange={setVariantName}
        onVariantDescriptionChange={setVariantDescription}
        onOptimizationGoalChange={setOptimizationGoal}
        onSaveVariant={handleSaveVariant}
        onUpdateVariant={handleUpdateVariant}
      />

      {/* Update Original Recipe Confirmation */}
      <AlertDialog
        open={updateOriginalDialogOpen}
        onOpenChange={setUpdateOriginalDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Original Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently update the original recipe with the current
              changes. This action cannot be undone. Are you sure you want to
              proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performUpdateOriginal}>
              Update Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
