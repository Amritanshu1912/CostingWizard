// RecipeTweaker.tsx - Recipe Optimization Component

"use client";

import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertCircle, TrendingDown, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { VariantDialog } from "./variant-dialog";
import { db } from "@/lib/db";
import type { Recipe, RecipeIngredient, RecipeVariant } from "@/lib/types";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import {
  calculateRecipeCost,
  findCheaperAlternatives,
  calculateSwitchingSavings,
} from "@/lib/recipe-calculations";
import type { CapacityUnit } from "@/lib/types";

interface RecipeTweakerProps {
  recipes: Recipe[];
}

export function RecipeTweaker({ recipes }: RecipeTweakerProps) {
  const supplierMaterials = useSupplierMaterialsWithDetails();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    recipes.length > 0 ? recipes[0].id : ""
  );
  const [modifiedIngredients, setModifiedIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  // Initialize modified ingredients when recipe is selected
  React.useEffect(() => {
    if (selectedRecipe) {
      setModifiedIngredients(
        JSON.parse(JSON.stringify(selectedRecipe.ingredients))
      );
    } else {
      setModifiedIngredients([]);
    }
  }, [selectedRecipe]);

  // Calculate costs
  const originalCost = useMemo(() => {
    if (!selectedRecipe) return null;
    return calculateRecipeCost(selectedRecipe.ingredients, supplierMaterials);
  }, [selectedRecipe, supplierMaterials]);

  const modifiedCost = useMemo(() => {
    if (modifiedIngredients.length === 0) return null;
    return calculateRecipeCost(modifiedIngredients, supplierMaterials);
  }, [modifiedIngredients, supplierMaterials]);

  const savings = useMemo(() => {
    if (!originalCost || !modifiedCost) return null;
    const diff = originalCost.costPerKg - modifiedCost.costPerKg;
    const percentage =
      originalCost.costPerKg > 0 ? (diff / originalCost.costPerKg) * 100 : 0;
    return { amount: diff, percentage };
  }, [originalCost, modifiedCost]);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    if (!selectedRecipe || modifiedIngredients.length === 0) return false;
    if (selectedRecipe.ingredients.length !== modifiedIngredients.length)
      return true;

    return selectedRecipe.ingredients.some((orig, index) => {
      const mod = modifiedIngredients[index];
      return (
        orig.quantity !== mod.quantity ||
        orig.supplierMaterialId !== mod.supplierMaterialId
      );
    });
  }, [selectedRecipe, modifiedIngredients]);

  // Find alternatives for each ingredient
  const alternatives = useMemo(() => {
    const map = new Map<string, any[]>();
    modifiedIngredients.forEach((ing) => {
      const alts = findCheaperAlternatives(
        ing.supplierMaterialId,
        supplierMaterials,
        3
      );
      if (alts.length > 0) {
        map.set(ing.id, alts);
      }
    });
    return map;
  }, [modifiedIngredients, supplierMaterials]);

  // Helper functions for display units
  const getDisplayUnit = (unit: CapacityUnit): string => {
    switch (unit) {
      case "kg":
        return "g";
      case "L":
        return "ml";
      default:
        return unit;
    }
  };

  const getDisplayQuantity = (quantity: number, unit: CapacityUnit): number => {
    switch (unit) {
      case "kg":
        return quantity * 1000;
      case "L":
        return quantity * 1000;
      default:
        return quantity;
    }
  };

  const getStoredQuantity = (
    displayQuantity: number,
    unit: CapacityUnit
  ): number => {
    switch (unit) {
      case "kg":
        return displayQuantity / 1000;
      case "L":
        return displayQuantity / 1000;
      default:
        return displayQuantity;
    }
  };

  const handleQuantityChange = (index: number, newDisplayQuantity: number) => {
    const currentSM = supplierMaterials.find(
      (sm) => sm.id === modifiedIngredients[index].supplierMaterialId
    );
    const storedQuantity = currentSM
      ? getStoredQuantity(newDisplayQuantity, currentSM.unit)
      : newDisplayQuantity;
    const updated = [...modifiedIngredients];
    updated[index] = { ...updated[index], quantity: storedQuantity };
    setModifiedIngredients(updated);
  };

  const handleSupplierChange = (
    index: number,
    newSupplierMaterialId: string
  ) => {
    const updated = [...modifiedIngredients];
    updated[index] = {
      ...updated[index],
      supplierMaterialId: newSupplierMaterialId,
    };
    setModifiedIngredients(updated);
  };

  const handleReset = () => {
    if (selectedRecipe) {
      setModifiedIngredients(
        JSON.parse(JSON.stringify(selectedRecipe.ingredients))
      );
      toast.success("Reset to original recipe");
    }
  };

  const handleSaveVariant = async (variant: RecipeVariant) => {
    try {
      await db.recipeVariants.add(variant);
      toast.success(`Variant "${variant.name}" saved successfully!`);
      setVariantDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save variant");
      console.error(error);
    }
  };

  if (!selectedRecipe) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Select a recipe to start optimizing
          </AlertDescription>
        </Alert>

        <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
          <SelectTrigger>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recipe Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
          <SelectTrigger className="w-[400px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {recipes.map((recipe) => (
              <SelectItem key={recipe.id} value={recipe.id}>
                {recipe.name} (₹{recipe.costPerKg.toFixed(2)}/kg)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={() => setVariantDialogOpen(true)}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Variant
          </Button>
        </div>
      </div>
      {selectedRecipe && (
        <VariantDialog
          isOpen={variantDialogOpen}
          onClose={() => setVariantDialogOpen(false)}
          onSave={handleSaveVariant}
          originalRecipe={selectedRecipe}
          modifiedIngredients={modifiedIngredients}
          costSavings={savings || { amount: 0, percentage: 0 }}
          modifiedCostPerKg={modifiedCost?.costPerKg || 0}
        />
      )}

      {/* Cost Comparison */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            Original Cost
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₹{originalCost?.costPerKg.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">per kg</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            Modified Cost
          </div>
          <div className="text-2xl font-bold text-primary">
            ₹{modifiedCost?.costPerKg.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">per kg</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            {savings && savings.amount > 0 ? "Savings" : "Increase"}
          </div>
          <div
            className={`text-2xl font-bold ${
              savings && savings.amount > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {savings ? (
              <>
                {savings.amount > 0 ? "-" : "+"}₹
                {Math.abs(savings.amount).toFixed(2)}
              </>
            ) : (
              "₹0.00"
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {savings
              ? `${savings.percentage > 0 ? "-" : "+"}${Math.abs(
                  savings.percentage
                ).toFixed(1)}%`
              : "0%"}
          </div>
        </Card>
      </div>

      {/* Ingredients Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead className="min-w-[200px]">Current Material</TableHead>
              <TableHead className="w-32">Quantity</TableHead>
              <TableHead className="w-28 text-right">Cost Price</TableHead>
              <TableHead className="w-28 text-right">
                Cost of Quantity
              </TableHead>
              <TableHead className="min-w-[250px]">
                Cheaper Alternatives
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modifiedIngredients.map((ingredient, index) => {
              const currentSM = supplierMaterials.find(
                (sm) => sm.id === ingredient.supplierMaterialId
              );
              const alts = alternatives.get(ingredient.id) || [];

              const currentCost = currentSM
                ? currentSM.unitPrice * ingredient.quantity
                : 0;

              const displayUnit = currentSM
                ? getDisplayUnit(currentSM.unit)
                : "N/A";
              const displayQuantity = currentSM
                ? getDisplayQuantity(ingredient.quantity, currentSM.unit)
                : ingredient.quantity;

              return (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {currentSM?.displayName || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentSM?.supplier?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={displayQuantity}
                        onChange={(e) =>
                          handleQuantityChange(index, Number(e.target.value))
                        }
                        className="h-9 w-24 text-right"
                      />
                      <span className="text-sm text-muted-foreground">
                        {displayUnit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{currentSM?.unitPrice.toFixed(2)}/{currentSM?.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{currentCost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {alts.length > 0 ? (
                      <Select
                        value={ingredient.supplierMaterialId}
                        onValueChange={(value) =>
                          handleSupplierChange(index, value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Current option */}
                          <SelectItem value={ingredient.supplierMaterialId}>
                            Current: ₹{currentSM?.unitPrice.toFixed(2)}/
                            {currentSM?.unit}
                          </SelectItem>
                          {/* Alternatives */}
                          {alts.map((alt) => {
                            const saving = currentSM
                              ? ((currentSM.unitPrice - alt.unitPrice) /
                                  currentSM.unitPrice) *
                                100
                              : 0;
                            return (
                              <SelectItem key={alt.id} value={alt.id}>
                                {alt.supplier?.name} - ₹
                                {alt.unitPrice.toFixed(2)}/{alt.unit}
                                <span className="text-green-600 ml-2">
                                  (-{saving.toFixed(1)}%)
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">No alternatives</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Optimization Suggestions */}
      {alternatives.size > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <TrendingDown className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Optimization Tip:</strong> {alternatives.size} ingredient(s)
            have cheaper alternatives available. Switch suppliers to reduce
            costs.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
