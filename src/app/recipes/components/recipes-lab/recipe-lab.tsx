// components/recipes/recipe-lab/recipe-lab.tsx
import React, { useState, useEffect } from "react";
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
import { VariantComparison } from "./recipe-lab-comparison";

type OptimizationGoal =
  | "cost_reduction"
  | "supplier_diversification"
  | "custom";

export default function RecipeLab() {
  const enrichedRecipes = useEnrichedRecipes();
  const supplierMaterials = useSupplierMaterialsWithDetails();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [variantDescription, setVariantDescription] = useState("");
  const [optimizationGoal, setOptimizationGoal] =
    useState<OptimizationGoal>("cost_reduction");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

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

      await db.recipeVariants.add(variant);
      toast.success(`Variant "${variantName}" saved successfully!`);
      setSaveDialogOpen(false);
      setVariantName("");
      setVariantDescription("");
    } catch (error) {
      console.error("Save variant error:", error);
      toast.error("Failed to save variant");
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

  const handleCompareVariant = (variantId: string) => {
    setSelectedVariantIds((prev) => {
      if (prev.includes(variantId)) {
        return prev.filter((id) => id !== variantId);
      }
      if (prev.length >= 3) {
        toast.error("Maximum 3 variants can be compared");
        return prev;
      }
      return [...prev, variantId];
    });
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
    <div className="flex gap-6 h-[calc(100vh-12rem)] relative">
      {/* Show compare button when 2+ variants selected */}
      {selectedVariantIds.length >= 2 && !comparisonMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Button onClick={() => setComparisonMode(true)} className="shadow-lg">
            <GitBranch className="w-4 h-4 mr-2" />
            Compare {selectedVariantIds.length} Variants
          </Button>
        </div>
      )}
      {comparisonMode ? (
        // COMPARISON VIEW
        <div className="flex-1">
          <VariantComparison
            baseRecipe={selectedRecipe}
            variants={variants}
            selectedVariantIds={selectedVariantIds}
            onClose={() => {
              setComparisonMode(false);
              setSelectedVariantIds([]);
            }}
          />
        </div>
      ) : (
        // EXPERIMENT VIEW (existing layout)
        <>
          {/* LEFT SIDEBAR */}
          <RecipeLabSidebar
            recipes={enrichedRecipes}
            selectedRecipeId={selectedRecipeId}
            variants={variants}
            changeCount={metrics.changeCount}
            onSelectRecipe={setSelectedRecipeId}
            onLoadVariant={loadVariant}
            onCompareVariant={handleCompareVariant}
            onResetAll={handleResetAll}
          />

          {/* CENTER CANVAS */}
          <Card className="flex-1 flex flex-col py-2">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  {loadedVariantName ? (
                    <>
                      Editing Variant:{" "}
                      <span className="text-blue-600">{loadedVariantName}</span>
                    </>
                  ) : (
                    "Experiment Workspace"
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRecipe.name}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 px-4 py-0">
              <div className="space-y-3">
                {experimentIngredients.map((ing, index) => (
                  <RecipeLabIngredientCard
                    key={ing.id}
                    ingredient={ing}
                    index={index}
                    supplierMaterial={supplierMaterials.find(
                      (s) => s.id === ing.supplierMaterialId
                    )}
                    alternatives={getAlternatives(ing)}
                    isExpanded={expandedAlternatives.has(ing.id)}
                    onQuantityChange={handleQuantityChange}
                    onSupplierChange={handleSupplierChange}
                    onTogglePriceLock={handleTogglePriceLock}
                    onRemove={handleRemoveIngredient}
                    onReset={handleResetIngredient}
                    onToggleAlternatives={toggleAlternatives}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Floating Action Panel */}
            {metrics.changeCount > 0 && (
              <div className="p-4 border-t bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {metrics.changeCount} change
                      {metrics.changeCount > 1 ? "s" : ""} •{" "}
                      <span
                        className={
                          metrics.savings > 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {metrics.savings > 0 ? "-" : "+"}₹
                        {Math.abs(metrics.savings).toFixed(2)}/kg
                      </span>{" "}
                      ({metrics.savingsPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleResetAll}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Variant
                  </Button>
                  <Button className="flex-1" onClick={handleUpdateOriginal}>
                    Update Recipe
                  </Button>
                </div>
              </div>
            )}
          </Card>

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
      )}

      {/* Save Variant Dialog */}
      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save as Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new variant of {selectedRecipe.name}
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
              Save Variant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
