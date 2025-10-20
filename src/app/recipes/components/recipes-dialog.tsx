// RecipeDialog.tsx - REFACTORED FOR NEW TYPE SYSTEM

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Lock, Unlock } from "lucide-react";

import type { Recipe, RecipeIngredient, CapacityUnit } from "@/lib/types";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { calculateRecipeCost, convertToKg } from "@/lib/recipe-calculations";
import { CAPACITY_UNITS } from "@/lib/constants";

// Helper functions for quantity conversion
function getStandardUnit(unit: CapacityUnit): "gm" | "ml" | "pcs" {
  if (unit === "kg" || unit === "gm") return "gm";
  if (unit === "L" || unit === "ml") return "ml";
  return "pcs";
}

function convertToStandard(
  quantity: number,
  materialUnit: CapacityUnit
): number {
  const standard = getStandardUnit(materialUnit);
  if (standard === "gm") {
    if (materialUnit === "kg") return quantity * 1000;
    if (materialUnit === "gm") return quantity;
  } else if (standard === "ml") {
    if (materialUnit === "L") return quantity * 1000;
    if (materialUnit === "ml") return quantity;
  } else {
    return quantity;
  }
  return quantity;
}

function convertFromStandard(
  quantityStandard: number,
  materialUnit: CapacityUnit
): number {
  const standard = getStandardUnit(materialUnit);
  if (standard === "gm") {
    if (materialUnit === "kg") return quantityStandard / 1000;
    if (materialUnit === "gm") return quantityStandard;
  } else if (standard === "ml") {
    if (materialUnit === "L") return quantityStandard / 1000;
    if (materialUnit === "ml") return quantityStandard;
  } else {
    return quantityStandard;
  }
  return quantityStandard;
}

const INITIAL_INGREDIENT: Omit<RecipeIngredient, "id" | "createdAt"> = {
  supplierMaterialId: "",
  quantity: 0,
  notes: "",
};

const INITIAL_FORM_DATA: Omit<Recipe, "id" | "createdAt" | "costPerKg"> = {
  name: "",
  description: "",
  ingredients: [],
  status: "draft",
  productionTime: undefined,
  manufacturingInstructions: "",
  targetCostPerKg: undefined,
  targetProfitMargin: undefined,
  shelfLife: undefined,
  notes: "",
};

interface RecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

export function RecipeDialog({
  isOpen,
  onClose,
  onSave,
  initialRecipe,
}: RecipeDialogProps) {
  const supplierMaterials = useSupplierMaterialsWithDetails();

  const [formData, setFormData] = useState<typeof INITIAL_FORM_DATA | Recipe>(
    INITIAL_FORM_DATA
  );
  const [newIngredient, setNewIngredient] =
    useState<typeof INITIAL_INGREDIENT>(INITIAL_INGREDIENT);

  const isEditing = !!initialRecipe;
  const title = isEditing ? "Edit Recipe" : "Create New Recipe";
  const description = isEditing
    ? `Updating recipe for ${initialRecipe?.name}`
    : "Define the recipe name and ingredients.";

  // Sync form with initialRecipe
  useEffect(() => {
    if (initialRecipe) {
      setFormData(initialRecipe);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setNewIngredient(INITIAL_INGREDIENT);
  }, [initialRecipe]);

  // Calculate recipe cost in real-time
  const calculatedCost = useMemo(() => {
    return calculateRecipeCost(formData.ingredients, supplierMaterials);
  }, [formData.ingredients, supplierMaterials]);

  // Handle ingredient changes
  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    const updatedIngredients = formData.ingredients.map((ingredient, i) => {
      if (i === index) {
        let updatedIng = { ...ingredient, [field]: value };
        return updatedIng;
      }
      return ingredient;
    });
    setFormData({ ...formData, ingredients: updatedIngredients } as Recipe);
  };

  // Toggle price lock
  const togglePriceLock = (index: number) => {
    const ingredient = formData.ingredients[index];
    const sm = supplierMaterials.find(
      (s) => s.id === ingredient.supplierMaterialId
    );

    if (!sm) return;

    const updated = formData.ingredients.map((ing, i) => {
      if (i === index) {
        if (ing.lockedPricing) {
          // Unlock
          const { lockedPricing, ...rest } = ing;
          return rest;
        } else {
          // Lock current price
          return {
            ...ing,
            lockedPricing: {
              unitPrice: sm.unitPrice,
              tax: sm.tax,
              lockedAt: new Date(),
              reason: "cost_analysis",
            },
          };
        }
      }
      return ing;
    });

    setFormData({ ...formData, ingredients: updated } as Recipe);
    toast.success(
      ingredient.lockedPricing
        ? "Price unlocked"
        : "Price locked at current rate"
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    } as Recipe);
  };

  const handleAddNewIngredient = () => {
    if (!newIngredient.supplierMaterialId || newIngredient.quantity <= 0) {
      toast.error("Please select a material and enter quantity > 0");
      return;
    }

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { ...newIngredient, id, createdAt: now },
      ],
    } as Recipe);

    setNewIngredient(INITIAL_INGREDIENT);
  };

  const handleNewIngredientChange = (
    field: keyof typeof INITIAL_INGREDIENT,
    value: string | number
  ) => {
    setNewIngredient({ ...newIngredient, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.ingredients.length === 0) {
      toast.error("Recipe must have a name and at least one ingredient");
      return;
    }

    const recipeToSave: Recipe = {
      ...(initialRecipe || {}),
      ...formData,
      costPerKg: calculatedCost.costPerKg,
      id: initialRecipe?.id || Date.now().toString(),
      createdAt: initialRecipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Recipe;

    onSave(recipeToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Define recipe formulation with ingredients and quantities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div className="md:col-span-2">
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Ultra Clean Floor Formula"
              />
            </div>

            <div>
              <Label htmlFor="targetCost">Target Cost/kg (₹)</Label>
              <Input
                id="targetCost"
                type="number"
                step="0.01"
                value={formData.targetCostPerKg || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetCostPerKg: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Optional target"
              />
            </div>

            <div>
              <Label htmlFor="targetMargin">Target Profit Margin (%)</Label>
              <Input
                id="targetMargin"
                type="number"
                step="0.1"
                value={formData.targetProfitMargin || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetProfitMargin: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Optional target"
              />
            </div>

            <div>
              <Label htmlFor="productionTime">Production Time (minutes)</Label>
              <Input
                id="productionTime"
                type="number"
                value={formData.productionTime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productionTime: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="shelfLife">Shelf Life (days)</Label>
              <Input
                id="shelfLife"
                type="number"
                value={formData.shelfLife || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shelfLife: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Recipe description..."
                rows={2}
              />
            </div>
          </div>

          {/* Ingredients Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Ingredients ({formData.ingredients.length})
            </h3>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[250px]">Material</TableHead>
                    <TableHead className="w-28 text-right">
                      Quantity (g/ml/pcs)
                    </TableHead>
                    <TableHead className="w-28 text-right">Cost/Unit</TableHead>
                    <TableHead className="w-28 text-right">
                      Total Cost
                    </TableHead>
                    <TableHead className="w-20">Lock</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.ingredients.map((ingredient, index) => {
                    const sm = supplierMaterials.find(
                      (s) => s.id === ingredient.supplierMaterialId
                    );
                    const quantityInStandard = sm
                      ? convertToStandard(ingredient.quantity, sm.unit)
                      : ingredient.quantity;
                    const cost = sm
                      ? (ingredient.lockedPricing?.unitPrice || sm.unitPrice) *
                        convertToKg(ingredient.quantity, sm.unit)
                      : 0;

                    return (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ingredient.supplierMaterialId}
                            onValueChange={(value) =>
                              handleIngredientChange(
                                index,
                                "supplierMaterialId",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {supplierMaterials.map((sm) => (
                                <SelectItem key={sm.id} value={sm.id}>
                                  {sm.displayName} - {sm.supplier?.name} (₹
                                  {sm.unitPrice.toFixed(2)}/{sm.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={quantityInStandard}
                            onChange={(e) => {
                              const newStandardQuantity = Number(
                                e.target.value
                              );
                              const sm = supplierMaterials.find(
                                (s) => s.id === ingredient.supplierMaterialId
                              );
                              const newQuantity = sm
                                ? convertFromStandard(
                                    newStandardQuantity,
                                    sm.unit
                                  )
                                : newStandardQuantity;
                              handleIngredientChange(
                                index,
                                "quantity",
                                newQuantity
                              );
                            }}
                            className="h-9 text-right"
                          />
                        </TableCell>

                        <TableCell className="text-right text-muted-foreground">
                          ₹
                          {(
                            ingredient.lockedPricing?.unitPrice ||
                            sm?.unitPrice ||
                            0
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{cost.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePriceLock(index)}
                            className="h-8 w-8"
                          >
                            {ingredient.lockedPricing ? (
                              <Lock className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Unlock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngredient(index)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Add New Row */}
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-medium text-primary">
                      {formData.ingredients.length + 1}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newIngredient.supplierMaterialId}
                        onValueChange={(value) =>
                          handleNewIngredientChange("supplierMaterialId", value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select Material" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierMaterials.map((sm) => (
                            <SelectItem key={sm.id} value={sm.id}>
                              {sm.displayName} - {sm.supplier?.name} (₹
                              {sm.unitPrice.toFixed(2)}/{sm.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          newIngredient.supplierMaterialId &&
                          newIngredient.quantity > 0
                            ? convertToStandard(
                                newIngredient.quantity,
                                supplierMaterials.find(
                                  (s) =>
                                    s.id === newIngredient.supplierMaterialId
                                )?.unit || "kg"
                              )
                            : newIngredient.quantity
                        }
                        onChange={(e) => {
                          const newStandardQuantity = Number(e.target.value);
                          const sm = supplierMaterials.find(
                            (s) => s.id === newIngredient.supplierMaterialId
                          );
                          const newQuantity = sm
                            ? convertFromStandard(newStandardQuantity, sm.unit)
                            : newStandardQuantity;
                          handleNewIngredientChange("quantity", newQuantity);
                        }}
                        className="h-9 text-right"
                      />
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground">
                      {newIngredient.supplierMaterialId
                        ? `₹${
                            supplierMaterials
                              .find(
                                (s) => s.id === newIngredient.supplierMaterialId
                              )
                              ?.unitPrice.toFixed(2) || "0.00"
                          }`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {newIngredient.supplierMaterialId &&
                      newIngredient.quantity > 0
                        ? `₹${(
                            (supplierMaterials.find(
                              (s) => s.id === newIngredient.supplierMaterialId
                            )?.unitPrice || 0) *
                            convertToKg(
                              newIngredient.quantity,
                              supplierMaterials.find(
                                (s) => s.id === newIngredient.supplierMaterialId
                              )?.unit || "kg"
                            )
                          ).toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleAddNewIngredient}
                        className="h-9 w-9 text-primary hover:bg-primary/10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-bold text-primary">
                  ₹{calculatedCost.totalCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cost per kg</div>
                <div className="text-2xl font-bold text-primary">
                  ₹{calculatedCost.costPerKg.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Target Cost/kg
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formData.targetCostPerKg
                    ? `₹${formData.targetCostPerKg.toFixed(2)}`
                    : "Not set"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Variance</div>
                <div
                  className={`text-xl font-bold ${
                    formData.targetCostPerKg
                      ? calculatedCost.costPerKg <= formData.targetCostPerKg
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {formData.targetCostPerKg
                    ? `${(
                        ((calculatedCost.costPerKg - formData.targetCostPerKg) /
                          formData.targetCostPerKg) *
                        100
                      ).toFixed(1)}%`
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              {isEditing ? "Update Recipe" : "Create Recipe"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
