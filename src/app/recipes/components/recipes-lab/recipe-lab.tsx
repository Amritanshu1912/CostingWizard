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
import { useRecipeExperiment } from "@/hooks/use-recipe-experiment";
import {
  useEnrichedRecipe,
  useEnrichedRecipes,
  useRecipeVariants,
} from "@/hooks/use-recipes";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { db } from "@/lib/db";
import type { RecipeVariant } from "@/lib/types";
import { OptimizationGoalType } from "@/lib/types";
import { FlaskConical } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RecipeLabDialogs } from "./recipe-lab-dialogs";
import { RecipeLabMetrics } from "./recipe-lab-metrics";
import { RecipeLabSidebar } from "./recipe-lab-sidebar";
import { RecipeLabWorkspace } from "./recipe-lab-workspace";

export default function RecipeLab() {
  const enrichedRecipes = useEnrichedRecipes();
  const supplierMaterials = useSupplierMaterialsWithDetails();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [updateVariantDialogOpen, setUpdateVariantDialogOpen] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [variantDescription, setVariantDescription] = useState("");
  const [optimizationGoal, setOptimizationGoal] =
    useState<OptimizationGoalType>("cost_reduction");

  // Compute initial recipe selection during render - MUST BE BEFORE usage
  const initialRecipeId = useMemo(() => {
    if (!selectedRecipeId && enrichedRecipes.length > 0) {
      return enrichedRecipes[0].id;
    }
    return selectedRecipeId;
  }, [enrichedRecipes, selectedRecipeId]);

  // Use the computed value directly instead of state
  const effectiveRecipeId = initialRecipeId || selectedRecipeId;

  // Update the state only when necessary, but don't use it for rendering
  useState(() => {
    if (initialRecipeId && initialRecipeId !== selectedRecipeId) {
      setSelectedRecipeId(initialRecipeId);
    }
  });

  // NOW use the computed effectiveRecipeId
  const selectedRecipe = useEnrichedRecipe(effectiveRecipeId);
  const variants = useRecipeVariants(effectiveRecipeId);

  const {
    experimentIngredients,
    metrics,
    expandedAlternatives,
    targetCost,
    loadedVariantName,
    initializeExperiment,
    getAlternatives,
    handleQuantityChange,
    handleSupplierChange,
    handleTogglePriceLock,
    handleRemoveIngredient,
    handleResetIngredient,
    handleResetAll,
    loadVariant,
  } = useRecipeExperiment(selectedRecipe);

  // Initialize experiment when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      initializeExperiment(selectedRecipe);
    }
  }, [selectedRecipe, initializeExperiment]);

  const createVariantChanges = useCallback(() => {
    return experimentIngredients
      .filter((ing) => ing._changed)
      .map((ing) => {
        const sm = supplierMaterials.find(
          (s) => s.id === ing.supplierMaterialId
        );
        const changeTypes = Array.from(ing._changeTypes || []);
        const changes = [];

        if (changeTypes.includes("quantity")) {
          changes.push({
            type: "quantity_change" as const,
            ingredientName: sm?.displayName || "Unknown",
            oldValue: `${ing._originalQuantity}`,
            newValue: `${ing.quantity}`,
            changedAt: new Date(),
          });
        }

        if (changeTypes.includes("supplier")) {
          changes.push({
            type: "supplier_change" as const,
            ingredientName: sm?.displayName || "Unknown",
            oldValue:
              supplierMaterials.find((s) => s.id === ing._originalSupplierId)
                ?.supplier?.name || "Unknown",
            newValue: sm?.supplier?.name || "Unknown",
            changedAt: new Date(),
          });
        }

        return changes;
      })
      .flat()
      .filter(Boolean);
  }, [experimentIngredients, supplierMaterials]);

  const createVariantSnapshot = useCallback(() => {
    return experimentIngredients.map((ing) => ({
      supplierMaterialId: ing.supplierMaterialId,
      quantity: ing.quantity,
      unit: ing.unit,
      lockedPricing: ing.lockedPricing,
      createdAt: ing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }, [experimentIngredients]);

  const handleSaveVariant = async () => {
    if (!selectedRecipe || !variantName.trim()) {
      toast.error("Variant name is required");
      return;
    }

    try {
      const variant: RecipeVariant = {
        id: Date.now().toString(),
        originalRecipeId: selectedRecipe.id,
        name: variantName,
        description: variantDescription,
        ingredientIds: experimentIngredients.map((ing) => ing.id),
        optimizationGoal:
          optimizationGoal === "custom" ? "other" : optimizationGoal,
        isActive: false,
        changes: createVariantChanges() as any,
        notes: variantDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.recipeVariants.add({
        ...variant,
        ingredientsSnapshot: createVariantSnapshot(),
      });

      toast.success(`Variant "${variantName}" saved successfully!`);

      try {
        const saved = await db.recipeVariants.get(variant.id);
        if (saved) loadVariant(saved as any);
      } catch (err) {
        console.debug("Failed to load newly created variant", err);
      }

      setSaveDialogOpen(false);
      setVariantName("");
      setVariantDescription("");
    } catch (error) {
      console.error("Save variant error:", error);
      toast.error("Failed to save variant");
    }
  };

  const handleUpdateVariant = async () => {
    if (!selectedRecipe || !loadedVariantName) {
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

      await db.recipeVariants.update(existingVariant.id, {
        ingredientIds: experimentIngredients.map((ing) => ing.id),
        ingredientsSnapshot: createVariantSnapshot(),
        changes: createVariantChanges() as any,
        updatedAt: new Date().toISOString(),
      });

      toast.success(`Variant "${loadedVariantName}" updated successfully!`);

      try {
        const saved = await db.recipeVariants.get(existingVariant.id);
        if (saved) loadVariant(saved as any);
      } catch (err) {
        console.debug("Failed to reload variant after update", err);
      }

      setUpdateVariantDialogOpen(false);
    } catch (error) {
      console.error("Update variant error:", error);
      toast.error("Failed to update variant");
    }
  };

  const [updateOriginalDialogOpen, setUpdateOriginalDialogOpen] =
    useState(false);

  const handleUpdateOriginal = () => {
    if (!selectedRecipe) return;
    setUpdateOriginalDialogOpen(true);
  };

  const performUpdateOriginal = async () => {
    if (!selectedRecipe) return;
    setUpdateOriginalDialogOpen(false);

    try {
      await db.transaction(
        "rw",
        [db.recipes, db.recipeIngredients],
        async () => {
          await db.recipes.update(selectedRecipe.id, {
            version: (selectedRecipe.version || 1) + 1,
            updatedAt: new Date().toISOString(),
          });

          await db.recipeIngredients
            .where("recipeId")
            .equals(selectedRecipe.id)
            .delete();

          for (const ing of experimentIngredients) {
            await db.recipeIngredients.add({
              id: ing.id.startsWith("temp-")
                ? Date.now().toString() + Math.random()
                : ing.id,
              recipeId: selectedRecipe.id,
              supplierMaterialId: ing.supplierMaterialId,
              quantity: ing.quantity,
              unit: ing.unit,
              lockedPricing: ing.lockedPricing,
              createdAt: ing.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      );

      toast.success("Recipe updated successfully");
      handleResetAll();
    } catch (error) {
      console.error("Update recipe error:", error);
      toast.error("Failed to update recipe");
    }
  };

  const handleLoadOriginalRecipe = useCallback(() => {
    if (selectedRecipe) {
      initializeExperiment(selectedRecipe);
    }
  }, [selectedRecipe, initializeExperiment]);

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await db.recipeVariants.delete(variantId);
      toast.success("Variant deleted successfully");
      handleResetAll();
    } catch (error) {
      console.error("Delete variant error:", error);
      toast.error("Failed to delete variant");
    }
  };

  const handleUpdateVariantDetails = async (variant: RecipeVariant) => {
    try {
      await db.recipeVariants.update(variant.id, {
        name: variant.name,
        description: variant.description,
        optimizationGoal: variant.optimizationGoal,
        isActive: variant.isActive,
        notes: variant.notes,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Variant updated successfully");
      loadVariant(variant as any);
    } catch (error) {
      console.error("Update variant error:", error);
      toast.error("Failed to update variant");
    }
  };

  if (!selectedRecipe) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Recipe Lab</h3>
          <p className="text-slate-600 mb-6">
            Select a recipe to start experimenting
          </p>

          {enrichedRecipes.length > 0 ? (
            <Select
              value={effectiveRecipeId}
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
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      <RecipeLabSidebar
        recipes={enrichedRecipes}
        selectedRecipeId={effectiveRecipeId}
        variants={variants}
        loadedVariantName={loadedVariantName}
        onSelectRecipe={setSelectedRecipeId}
        onLoadVariant={loadVariant}
      />

      <RecipeLabWorkspace
        selectedRecipeName={selectedRecipe.name}
        loadedVariantName={loadedVariantName}
        currentVariant={variants.find((v) => v.name === loadedVariantName)}
        experimentIngredients={experimentIngredients}
        supplierMaterials={supplierMaterials}
        expandedAlternatives={expandedAlternatives}
        metrics={metrics}
        getAlternatives={getAlternatives}
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

      <RecipeLabMetrics
        metrics={metrics}
        targetCost={targetCost}
        experimentIngredients={experimentIngredients}
        supplierMaterials={supplierMaterials}
        onApplySuggestion={handleSupplierChange}
        getAlternatives={getAlternatives}
      />

      <RecipeLabDialogs
        saveDialogOpen={saveDialogOpen}
        updateVariantDialogOpen={updateVariantDialogOpen}
        recipeName={selectedRecipe.name}
        loadedVariantName={loadedVariantName}
        variantName={variantName}
        variantDescription={variantDescription}
        optimizationGoal={optimizationGoal}
        experimentIngredients={experimentIngredients}
        supplierMaterials={supplierMaterials}
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
