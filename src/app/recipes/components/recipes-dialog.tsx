// RecipeDialog.tsx

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
import { Minus, Plus, X } from "lucide-react";

import type {
  Recipe,
  RecipeIngredient,
  SupplierMaterialWithDetails,
} from "@/lib/types";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import {
  INGREDIENT_UNITS,
  convertToKilograms,
  DEFAULT_INGREDIENT_UNIT,
  IngredientUnitValue,
} from "./recipes-constants"; // NEW IMPORT

// Hook to get supplier materials with details
const useSupplierMaterials = () => {
  return useSupplierMaterialsWithDetails();
};

// Helper function to get supplier material by ID
const getSupplierMaterial = (
  supplierMaterials: SupplierMaterialWithDetails[],
  id: string
) => supplierMaterials.find((sm) => sm.id === id);

const INITIAL_INGREDIENT: RecipeIngredient = {
  id: "",
  supplierMaterialId: "",
  quantity: 0,
  notes: "",
  createdAt: "",
};

// Use existing Recipe fields as a starting point
const INITIAL_FORM_DATA: Recipe = {
  id: "",
  name: "",
  description: "",
  ingredients: [],
  costPerKg: 0,
  status: "draft",
  targetProfitMargin: 35,
  createdAt: "",
};

interface RecipeProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

export function RecipeProductDialog({
  isOpen,
  onClose,
  onSave,
  initialRecipe,
}: RecipeProductDialogProps) {
  const [formData, setFormData] =
    useState<typeof INITIAL_FORM_DATA>(INITIAL_FORM_DATA);
  const [newIngredient, setNewIngredient] =
    useState<RecipeIngredient>(INITIAL_INGREDIENT);

  const isEditing = !!initialRecipe;
  const title = isEditing ? "Edit Recipe" : "Create New Recipe";
  const description = isEditing
    ? `Updating recipe for ${initialRecipe?.name}`
    : "Define the recipe name and ingredients.";

  // --- Effect to sync internal form state when initialRecipe changes ---
  useEffect(() => {
    if (initialRecipe) {
      setFormData(initialRecipe);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setNewIngredient(INITIAL_INGREDIENT);
  }, [initialRecipe]);

  // --- Ingredient Handlers ---

  // Get supplier materials data
  const supplierMaterials = useSupplierMaterials();

  // --- Memoization: Calculate total cost on ingredient change ---
  const totalCostPerKg = useMemo(() => {
    return formData.ingredients.reduce((sum, ingredient) => {
      const supplierMaterial = getSupplierMaterial(
        supplierMaterials,
        ingredient.supplierMaterialId
      );
      const costPerKg = supplierMaterial?.priceWithTax || 0;
      return sum + costPerKg * ingredient.quantity;
    }, 0);
  }, [formData.ingredients, supplierMaterials]);

  // Helper function to calculate cost based on quantity and material price
  const calculateIngredientCost = (ingredient: RecipeIngredient): number => {
    const material = getSupplierMaterial(
      supplierMaterials,
      ingredient.supplierMaterialId
    );
    const pricePerKg = material?.priceWithTax || 0;
    // Assume quantity is in kg for simplicity
    return pricePerKg * ingredient.quantity;
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    const updatedIngredients = formData.ingredients.map((ingredient, i) => {
      if (i === index) {
        let updatedIng = { ...ingredient, [field]: value };

        // No need to recalculate cost here as it's done in the memoization
        return updatedIng;
      }
      return ingredient;
    });

    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      // Still filtering by index since we don't need the ID for removal inside map()
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleAddNewIngredient = () => {
    if (!newIngredient.supplierMaterialId || newIngredient.quantity <= 0) {
      toast.error(
        "Please select a supplier material and enter a quantity greater than zero."
      );
      return;
    }

    const supplierMaterial = getSupplierMaterial(
      supplierMaterials,
      newIngredient.supplierMaterialId
    );
    if (!supplierMaterial) return;

    // GENERATING UNIQUE ID for the new ingredient
    const newId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const ingredientToAdd: RecipeIngredient = {
      ...newIngredient,
      id: newId,
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredientToAdd],
    });

    // Reset the new ingredient input row
    setNewIngredient(INITIAL_INGREDIENT);
  };

  const handleNewIngredientChange = (
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    // Temporarily create a draft ingredient object to calculate new cost
    const draftIngredient = {
      ...newIngredient,
      [field]: value,
    } as RecipeIngredient;

    if (field === "supplierMaterialId" && typeof value === "string") {
      setNewIngredient((prev) => ({
        ...prev,
        supplierMaterialId: value,
      }));
    } else if (field === "quantity" && typeof value === "number") {
      setNewIngredient((prev) => ({
        ...prev,
        quantity: value,
      }));
    } else {
      setNewIngredient(draftIngredient);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.ingredients.length === 0) {
      toast.error("Recipe must have a name and at least one ingredient.");
      return;
    }

    const savedRecipe: Recipe = {
      ...formData,
      costPerKg: totalCostPerKg,
      updatedAt: new Date().toISOString(),
    };

    if (!isEditing) {
      savedRecipe.id = Date.now().toString();
      savedRecipe.createdAt = new Date().toISOString();
    }

    onSave(savedRecipe);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Recipe Details --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
            <div>
              <Label htmlFor="recipe-name" className="text-foreground">
                Recipe Name *
              </Label>
              <Input
                id="recipe-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Ultra Clean Dishwash Gel"
                className="focus-enhanced"
              />
            </div>

            <div>
              <Label htmlFor="target-margin" className="text-foreground">
                Target Margin (%)
              </Label>
              <Input
                id="target-margin"
                type="number"
                value={formData.targetProfitMargin || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetProfitMargin: Number(e.target.value),
                  })
                }
                placeholder="35"
                className="focus-enhanced"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description" className="text-foreground">
                Description / Notes
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Manufacturing notes or key instructions..."
                className="focus-enhanced"
              />
            </div>
          </div>

          {/* --- Ingredients Table --- */}
          <h3 className="text-lg font-semibold text-foreground">
            Ingredients ({formData.ingredients.length})
          </h3>

          <Table className="border rounded-lg">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[10px]">#</TableHead>
                <TableHead className="w-[40%]">Supplier Material</TableHead>
                <TableHead className="w-[20%] text-right">
                  Quantity (kg)*
                </TableHead>
                <TableHead className="w-[15%] text-right">
                  Cost/kg (₹)
                </TableHead>
                <TableHead className="w-[15%] text-right">
                  Total Cost (₹)
                </TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Existing Ingredients */}
              {formData.ingredients.map((ingredient, index) => {
                const supplierMaterial = getSupplierMaterial(
                  supplierMaterials,
                  ingredient.supplierMaterialId
                );
                const costPerKg = supplierMaterial?.priceWithTax || 0;
                const totalCost = costPerKg * ingredient.quantity;

                return (
                  <TableRow key={ingredient.id} className="hover:bg-accent/10">
                    <TableCell className="font-medium">{index + 1}</TableCell>
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
                        <SelectTrigger className="h-8 text-xs focus-enhanced">
                          <SelectValue placeholder="Select Supplier Material" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierMaterials.map((sm) => (
                            <SelectItem key={sm.id} value={sm.id}>
                              {sm.displayName} ({sm.priceWithTax?.toFixed(2)}/
                              {sm.displayUnit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 text-right focus-enhanced"
                      />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {costPerKg.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {totalCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Add New Ingredient Row */}
              <TableRow className="bg-primary/5 border-t">
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
                    <SelectTrigger className="h-9 focus-enhanced">
                      <SelectValue placeholder="Select Supplier Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierMaterials.map((sm) => (
                        <SelectItem key={sm.id} value={sm.id}>
                          {sm.displayName} ({sm.priceWithTax?.toFixed(2)}/
                          {sm.displayUnit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newIngredient.quantity}
                    onChange={(e) =>
                      handleNewIngredientChange(
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="h-9 text-right focus-enhanced"
                  />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {(
                    getSupplierMaterial(
                      supplierMaterials,
                      newIngredient.supplierMaterialId
                    )?.priceWithTax || 0
                  ).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium text-primary">
                  {(
                    (getSupplierMaterial(
                      supplierMaterials,
                      newIngredient.supplierMaterialId
                    )?.priceWithTax || 0) * newIngredient.quantity
                  ).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleAddNewIngredient}
                    className="h-9 w-9 text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* --- Summary and Actions --- */}
          <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Total Recipe Cost
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{totalCostPerKg.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground">Target Margin</div>
              <div className="text-xl font-bold text-primary">
                {formData.targetProfitMargin || 0}%
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="flex-1 btn-secondary">
              {isEditing ? "Update Recipe" : "Create Recipe"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
