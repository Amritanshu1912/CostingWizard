// components/recipes/recipe-lab/recipe-lab.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FlaskConical,
  TrendingDown,
  GitBranch,
  Save,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import type { RecipeVariant } from "@/lib/types";
import {
  useEnrichedRecipes,
  useEnrichedRecipe,
  useRecipeVariants,
  recipeCalculator,
} from "@/hooks/use-recipes";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { useRecipeExperiment } from "@/hooks/use-recipe-experiment";
import { RecipeLabSidebar } from "./recipe-lab-sidebar";
import { RecipeLabIngredientCard } from "./recipe-lab-ingredient-card";
import { RecipeLabMetrics } from "./recipe-lab-metrics";
import { CenterPanel } from "./recipe-lab-center-panel";

type OptimizationGoal =
  | "cost_reduction"
  | "supplier_diversification"
  | "custom";

export default function RecipeLab() {
  const enrichedRecipes = useEnrichedRecipes();
  const supplierMaterials = useSupplierMaterialsWithDetails();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [updateVariantDialogOpen, setUpdateVariantDialogOpen] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [variantDescription, setVariantDescription] = useState("");
  const [optimizationGoal, setOptimizationGoal] =
    useState<OptimizationGoal>("cost_reduction");

  const selectedRecipe = useEnrichedRecipe(selectedRecipeId);
  const variants = useRecipeVariants(selectedRecipeId);

  const {
    experimentIngredients,
    metrics,
    expandedAlternatives,
    targetCost,
    loadedVariantName,
    setTargetCost,
    initializeExperiment,
    getAlternatives,
    handleQuantityChange,
    handleSupplierChange,
    handleTogglePriceLock,
    handleRemoveIngredient,
    handleResetIngredient,
    handleResetAll,
    toggleAlternatives,
    loadVariant,
  } = useRecipeExperiment(selectedRecipe);

  // Auto-select first recipe
  useEffect(() => {
    if (!selectedRecipeId && enrichedRecipes.length > 0) {
      setSelectedRecipeId(enrichedRecipes[0].id);
    }
  }, [enrichedRecipes, selectedRecipeId]);

  // Initialize experiment when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      initializeExperiment(selectedRecipe);
    }
  }, [selectedRecipe, initializeExperiment]);

  const handleSaveVariant = async () => {
    if (!selectedRecipe || !variantName.trim()) {
      toast.error("Variant name is required");
      return;
    }

    try {
      const changes = experimentIngredients
        .filter((ing) => ing._changed)
        .map((ing) => {
          const sm = supplierMaterials.find(
            (s) => s.id === ing.supplierMaterialId
          );
          const changeTypes = Array.from(ing._changeTypes || []);

          if (
            changeTypes.includes("quantity") &&
            changeTypes.includes("supplier")
          ) {
            return [
              {
                type: "quantity_change" as const,
                ingredientName: sm?.displayName || "Unknown",
                oldValue: `${ing._originalQuantity}`,
                newValue: `${ing.quantity}`,
                changedAt: new Date(),
              },
              {
                type: "supplier_change" as const,
                ingredientName: sm?.displayName || "Unknown",
                oldValue:
                  supplierMaterials.find(
                    (s) => s.id === ing._originalSupplierId
                  )?.supplier?.name || "Unknown",
                newValue: sm?.supplier?.name || "Unknown",
                changedAt: new Date(),
              },
            ];
          } else if (changeTypes.includes("quantity")) {
            return {
              type: "quantity_change" as const,
              ingredientName: sm?.displayName || "Unknown",
              oldValue: `${ing._originalQuantity}`,
              newValue: `${ing.quantity}`,
              changedAt: new Date(),
            };
          } else if (changeTypes.includes("supplier")) {
            return {
              type: "supplier_change" as const,
              ingredientName: sm?.displayName || "Unknown",
              oldValue:
                supplierMaterials.find((s) => s.id === ing._originalSupplierId)
                  ?.supplier?.name || "Unknown",
              newValue: sm?.supplier?.name || "Unknown",
              changedAt: new Date(),
            };
          }
          return null;
        })
        .flat()
        .filter(Boolean);

      const variant: RecipeVariant = {
        id: Date.now().toString(),
        originalRecipeId: selectedRecipe.id,
        name: variantName,
        description: variantDescription,
        ingredientIds: experimentIngredients.map((ing) => ing.id),
        optimizationGoal:
          optimizationGoal === "custom" ? "other" : optimizationGoal,
        isActive: false,
        changes: changes as any,
        notes: variantDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create a snapshot of the variant ingredients to keep the variant
      // immutable and isolated from later edits to the base recipe.
      const ingredientsSnapshot = experimentIngredients.map((ing) => ({
        supplierMaterialId: ing.supplierMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
        lockedPricing: ing.lockedPricing,
        createdAt: ing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Save the variant (no longer touching recipeIngredients)
      await db.recipeVariants.add({
        ...variant,
        ingredientsSnapshot,
      });

      toast.success(`Variant "${variantName}" saved successfully!`);
      // Load the newly created variant into the experiment for a smoother UX.
      // Fetch the stored record to avoid timing/shape mismatches.
      try {
        const saved = await db.recipeVariants.get(variant.id);
        if (saved) {
          loadVariant(saved as any);
        } else {
          // Fallback: optimistic load of the in-memory object
          loadVariant({ ...variant, ingredientsSnapshot } as any);
        }
      } catch (err) {
        console.debug(
          "Failed to load newly created variant into experiment",
          err
        );
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

      const changes = experimentIngredients
        .filter((ing) => ing._changed)
        .map((ing) => {
          const sm = supplierMaterials.find(
            (s) => s.id === ing.supplierMaterialId
          );
          const changeTypes = Array.from(ing._changeTypes || []);

          if (
            changeTypes.includes("quantity") &&
            changeTypes.includes("supplier")
          ) {
            return [
              {
                type: "quantity_change" as const,
                ingredientName: sm?.displayName || "Unknown",
                oldValue: `${ing._originalQuantity}`,
                newValue: `${ing.quantity}`,
                changedAt: new Date(),
              },
              {
                type: "supplier_change" as const,
                ingredientName: sm?.displayName || "Unknown",
                oldValue:
                  supplierMaterials.find(
                    (s) => s.id === ing._originalSupplierId
                  )?.supplier?.name || "Unknown",
                newValue: sm?.supplier?.name || "Unknown",
                changedAt: new Date(),
              },
            ];
          } else if (changeTypes.includes("quantity")) {
            return {
              type: "quantity_change" as const,
              ingredientName: sm?.displayName || "Unknown",
              oldValue: `${ing._originalQuantity}`,
              newValue: `${ing.quantity}`,
              changedAt: new Date(),
            };
          } else if (changeTypes.includes("supplier")) {
            return {
              type: "supplier_change" as const,
              ingredientName: sm?.displayName || "Unknown",
              oldValue:
                supplierMaterials.find((s) => s.id === ing._originalSupplierId)
                  ?.supplier?.name || "Unknown",
              newValue: sm?.supplier?.name || "Unknown",
              changedAt: new Date(),
            };
          }
          return null;
        })
        .flat()
        .filter(Boolean);

      // Create updated snapshot
      const ingredientsSnapshot = experimentIngredients.map((ing) => ({
        supplierMaterialId: ing.supplierMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
        lockedPricing: ing.lockedPricing,
        createdAt: ing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await db.recipeVariants.update(existingVariant.id, {
        ingredientIds: experimentIngredients.map((ing) => ing.id),
        ingredientsSnapshot,
        changes: changes as any,
        updatedAt: new Date().toISOString(),
      });

      toast.success(`Variant "${loadedVariantName}" updated successfully!`);
      // After updating the stored snapshot, reload the authoritative record
      // from the DB so the experiment reflects the saved snapshot.
      try {
        const saved = await db.recipeVariants.get(existingVariant.id);
        if (saved) {
          loadVariant(saved as any);
        } else {
          // Fallback: optimistic reload using the constructed object
          loadVariant({
            ...existingVariant,
            ingredientIds: experimentIngredients.map((ing) => ing.id),
            ingredientsSnapshot,
            changes: changes as any,
            updatedAt: new Date().toISOString(),
          } as any);
        }
      } catch (err) {
        console.debug("Failed to reload variant after update", err);
      }
      setUpdateVariantDialogOpen(false);
    } catch (error) {
      console.error("Update variant error:", error);
      toast.error("Failed to update variant");
    }
  };

  const handleUpdateOriginal = async () => {
    if (!selectedRecipe) return;

    const confirmed = window.confirm(
      "This will permanently update the original recipe. Are you sure?"
    );
    if (!confirmed) return;

    try {
      const totalWeight = experimentIngredients.reduce((sum, ing) => {
        return sum + recipeCalculator.convertToStandard(ing.quantity, ing.unit);
      }, 0);

      await db.transaction(
        "rw",
        [db.recipes, db.recipeIngredients],
        async () => {
          await db.recipes.update(selectedRecipe.id, {
            totalWeight,
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

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await db.recipeVariants.delete(variantId);
      toast.success("Variant deleted successfully");
      handleResetAll(); // Reset to original recipe state
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
      // Ensure the updated variant remains loaded in the experiment.
      // This fixes the UI showing the original recipe when the variant
      // name or properties were changed (e.g. renamed) because
      // `loadedVariantName` may no longer match the updated variant.
      try {
        loadVariant(variant as any);
      } catch (err) {
        // non-fatal: log and continue
        console.debug("Failed to reload updated variant into experiment", err);
      }
    } catch (error) {
      console.error("Update variant error:", error);
      toast.error("Failed to update variant");
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* EXPERIMENT VIEW (existing layout) */}
      <>
        {/* LEFT SIDEBAR */}
        <RecipeLabSidebar
          recipes={enrichedRecipes}
          selectedRecipeId={selectedRecipeId}
          variants={variants}
          changeCount={metrics.changeCount}
          loadedVariantName={loadedVariantName}
          onSelectRecipe={setSelectedRecipeId}
          onLoadVariant={(variant) => loadVariant(variant)}
        />
        <CenterPanel
          selectedRecipeName={selectedRecipe.name}
          loadedVariantName={loadedVariantName}
          currentVariant={variants.find((v) => v.name === loadedVariantName)}
          experimentIngredients={experimentIngredients}
          supplierMaterials={supplierMaterials}
          expandedAlternatives={expandedAlternatives}
          metrics={metrics}
          getAlternatives={getAlternatives}
          handleQuantityChange={handleQuantityChange}
          handleSupplierChange={handleSupplierChange}
          handleTogglePriceLock={handleTogglePriceLock}
          handleRemoveIngredient={handleRemoveIngredient}
          handleResetIngredient={handleResetIngredient}
          toggleAlternatives={toggleAlternatives}
          handleResetAll={handleResetAll}
          setSaveDialogOpen={setSaveDialogOpen}
          setUpdateVariantDialogOpen={setUpdateVariantDialogOpen}
          handleLoadOriginalRecipe={handleLoadOriginalRecipe}
          handleUpdateOriginal={handleUpdateOriginal}
          onDeleteVariant={handleDeleteVariant}
          onUpdateVariant={handleUpdateVariantDetails}
        />

        {/* RIGHT PANEL - METRICS */}
        <RecipeLabMetrics
          metrics={metrics}
          targetCost={targetCost}
          experimentIngredients={experimentIngredients}
          supplierMaterials={supplierMaterials}
          onApplySuggestion={handleSupplierChange}
          getAlternatives={getAlternatives}
        />
      </>

      {/* Save Variant Dialog */}
      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {loadedVariantName ? "Save as New Variant" : "Save as Variant"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {loadedVariantName
                ? `Create a new variant based on "${loadedVariantName}"`
                : `Create a new variant of "${selectedRecipe.name}"`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="variant-name">Variant Name *</Label>
              <Input
                id="variant-name"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g., Cost Optimized V1"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="variant-description">Description</Label>
              <Textarea
                id="variant-description"
                value={variantDescription}
                onChange={(e) => setVariantDescription(e.target.value)}
                placeholder="Describe the changes and rationale..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="optimization-goal">Optimization Goal *</Label>
              <Select
                value={optimizationGoal}
                onValueChange={(v) =>
                  setOptimizationGoal(v as OptimizationGoal)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select optimization goal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost_reduction">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      <span>Minimize Cost</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="supplier_diversification">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <span>Diversify Suppliers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      <span>Custom Experiment</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Changes Summary</p>
              <div className="space-y-1">
                {experimentIngredients
                  .filter((ing) => ing._changed)
                  .map((ing) => {
                    const sm = supplierMaterials.find(
                      (s) => s.id === ing.supplierMaterialId
                    );
                    const changeTypes = Array.from(ing._changeTypes || []);
                    return (
                      <div
                        key={ing.id}
                        className="text-xs text-muted-foreground"
                      >
                        • {sm?.displayName || "Unknown"}:{" "}
                        {changeTypes.includes("quantity") && (
                          <span>
                            Qty changed ({ing._originalQuantity} →{" "}
                            {ing.quantity})
                          </span>
                        )}
                        {changeTypes.includes("quantity") &&
                          changeTypes.includes("supplier") &&
                          ", "}
                        {changeTypes.includes("supplier") && (
                          <span>Supplier switched</span>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm font-semibold text-green-600">
                  Total Savings: ₹{metrics.savings.toFixed(2)}/kg (
                  {metrics.savingsPercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveVariant}>
              {loadedVariantName ? "Save as New Variant" : "Save as Variant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Variant Dialog */}
      <AlertDialog
        open={updateVariantDialogOpen}
        onOpenChange={setUpdateVariantDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Update the currently loaded variant "{loadedVariantName}" with
              your changes
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Changes Summary</p>
              <div className="space-y-1">
                {experimentIngredients
                  .filter((ing) => ing._changed)
                  .map((ing) => {
                    const sm = supplierMaterials.find(
                      (s) => s.id === ing.supplierMaterialId
                    );
                    const changeTypes = Array.from(ing._changeTypes || []);
                    return (
                      <div
                        key={ing.id}
                        className="text-xs text-muted-foreground"
                      >
                        • {sm?.displayName || "Unknown"}:{" "}
                        {changeTypes.includes("quantity") && (
                          <span>
                            Qty changed ({ing._originalQuantity} →{" "}
                            {ing.quantity})
                          </span>
                        )}
                        {changeTypes.includes("quantity") &&
                          changeTypes.includes("supplier") &&
                          ", "}
                        {changeTypes.includes("supplier") && (
                          <span>Supplier switched</span>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm font-semibold text-green-600">
                  Total Savings: ₹{metrics.savings.toFixed(2)}/kg (
                  {metrics.savingsPercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateVariant}>
              Update Variant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
