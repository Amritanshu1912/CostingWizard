// RecipeProductDialog.tsx

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

import type { Product, ProductIngredient, Material } from "@/lib/types";
import { MATERIALS } from "@/lib/constants";
import {
  INGREDIENT_UNITS,
  convertToKilograms,
  DEFAULT_INGREDIENT_UNIT,
  IngredientUnitValue,
} from "@/lib/recipe-constants"; // NEW IMPORT

// NOTE TO USER: Please ensure your ProductIngredient interface (in types.ts)
// now includes the 'id: string' and 'unit: string' fields.

// --- OPTIMIZATION: O(1) Material Lookup ---
const materialMap = new Map(MATERIALS.map((m) => [m.id, m]));
const getMaterial = (id: string) => materialMap.get(id);

// Since ProductIngredient now has 'unit' and will have 'id',
// we use a type that omits the id for initial state definition.
type NewProductIngredient = Omit<ProductIngredient, "id">;

const INITIAL_INGREDIENT: NewProductIngredient = {
  materialId: MATERIALS[0]?.id || "",
  materialName: MATERIALS[0]?.name || "N/A",
  quantity: 0,
  unit: DEFAULT_INGREDIENT_UNIT, // NEW: Default unit
  costPerKg: MATERIALS[0]?.priceWithTax || 0,
  totalCost: 0,
};

// Use existing Product fields as a starting point
const INITIAL_FORM_DATA: Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "totalCostPerKg"
> = {
  name: "",
  batchSizeKg: 1,
  sellingPricePerKg: 0,
  status: "draft",
  ingredients: [],
  profitMargin: 35,
  description: "",
};

interface RecipeProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}

export function RecipeProductDialog({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}: RecipeProductDialogProps) {
  const [formData, setFormData] = useState<typeof INITIAL_FORM_DATA | Product>(
    INITIAL_FORM_DATA
  );
  const [newIngredient, setNewIngredient] =
    useState<NewProductIngredient>(INITIAL_INGREDIENT);

  const isEditing = !!initialProduct;
  const title = isEditing ? "Edit Recipe" : "Create New Recipe";
  const description = isEditing
    ? `Updating recipe for ${initialProduct?.name}`
    : "Define the product name, batch size, and ingredients.";

  // --- Effect to sync internal form state when initialProduct changes ---
  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setNewIngredient(INITIAL_INGREDIENT);
  }, [initialProduct]);

  // --- Memoization: Calculate total cost and cost/kg on ingredient/size change ---
  const { batchTotalCost, totalCostPerKg } = useMemo(() => {
    const totalIngredientsCost = formData.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.totalCost,
      0
    );
    const batchSizeKg = formData.batchSizeKg || 1;

    const calculatedCostPerKg =
      totalIngredientsCost / (batchSizeKg > 0 ? batchSizeKg : 1);

    return {
      batchTotalCost: totalIngredientsCost,
      totalCostPerKg: calculatedCostPerKg,
    };
  }, [formData.ingredients, formData.batchSizeKg]);

  // --- Ingredient Handlers ---

  // Helper function to calculate cost based on quantity, unit, and material price
  const calculateIngredientCost = (
    ing: ProductIngredient | NewProductIngredient
  ): number => {
    const material = getMaterial(ing.materialId);
    const pricePerKg = material?.priceWithTax || 0;
    const quantityInKg = convertToKilograms(
      ing.quantity,
      ing.unit as IngredientUnitValue
    );
    return pricePerKg * quantityInKg;
  };

  const handleIngredientChange = (
    index: number,
    field: keyof ProductIngredient,
    value: string | number
  ) => {
    const updatedIngredients = formData.ingredients.map((ing, i) => {
      if (i === index) {
        let updatedIng = { ...ing, [field]: value };

        // Recalculate cost if material, quantity, or unit changes
        if (
          field === "materialId" ||
          field === "quantity" ||
          field === "unit"
        ) {
          const material = getMaterial(updatedIng.materialId);

          updatedIng = {
            ...updatedIng,
            materialName: material?.name || "N/A",
            costPerKg: material?.priceWithTax || 0,
            // Recalculate totalCost using the new quantity/unit
            totalCost: calculateIngredientCost(updatedIng as ProductIngredient),
          } as ProductIngredient;
        }
        return updatedIng;
      }
      return ing;
    });

    setFormData({ ...formData, ingredients: updatedIngredients } as Product);
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      // Still filtering by index since we don't need the ID for removal inside map()
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    } as Product);
  };

  const handleAddNewIngredient = () => {
    if (!newIngredient.materialId || newIngredient.quantity <= 0) {
      toast.error(
        "Please select a material and enter a quantity greater than zero."
      );
      return;
    }

    const material = getMaterial(newIngredient.materialId);
    if (!material) return;

    // GENERATING UNIQUE ID for the new ingredient
    const newId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const ingredientToAdd: ProductIngredient = {
      ...newIngredient,
      id: newId,
      materialName: material.name,
      costPerKg: material.priceWithTax || 0,
      totalCost: calculateIngredientCost(newIngredient), // Calculate cost based on new unit/quantity
      unit: newIngredient.unit,
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredientToAdd],
    } as Product);

    // Reset the new ingredient input row
    setNewIngredient(INITIAL_INGREDIENT);
  };

  const handleNewIngredientChange = (
    field: keyof NewProductIngredient,
    value: string | number
  ) => {
    // Temporarily create a draft ingredient object to calculate new cost
    const draftIngredient = {
      ...newIngredient,
      [field]: value,
    } as NewProductIngredient;

    if (field === "materialId" && typeof value === "string") {
      const material = getMaterial(value);
      setNewIngredient((prev) => ({
        ...prev,
        materialId: value,
        materialName: material?.name || "N/A",
        costPerKg: material?.priceWithTax || 0,
        // Calculate cost using the draft object
        totalCost: calculateIngredientCost(draftIngredient),
      }));
    } else if (field === "quantity" && typeof value === "number") {
      setNewIngredient((prev) => ({
        ...prev,
        quantity: value,
        // Calculate cost using the draft object
        totalCost: calculateIngredientCost(draftIngredient),
      }));
    } else if (field === "unit" && typeof value === "string") {
      setNewIngredient((prev) => ({
        ...prev,
        unit: value as IngredientUnitValue,
        // Calculate cost using the draft object
        totalCost: calculateIngredientCost(draftIngredient),
      }));
    } else {
      setNewIngredient(draftIngredient);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      (formData.batchSizeKg || 0) <= 0 ||
      formData.ingredients.length === 0
    ) {
      toast.error(
        "Recipe must have a name, a batch size, and at least one ingredient."
      );
      return;
    }

    let savedProduct: Product;

    const baseProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      name: formData.name,
      ingredients: formData.ingredients,
      totalCostPerKg,
      sellingPricePerKg: formData.sellingPricePerKg,
      profitMargin: formData.profitMargin,
      batchSizeKg: formData.batchSizeKg,
      status: formData.status,
      description: formData.description,
    };

    if (isEditing && initialProduct) {
      // Edit mode
      savedProduct = {
        ...initialProduct,
        ...baseProduct,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add mode
      const newId = Date.now().toString();
      savedProduct = {
        ...baseProduct,
        id: newId,
        createdAt: new Date().toISOString(),
      } as Product;
    }

    onSave(savedProduct);
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
          {/* --- Product Details --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4">
            <div className="sm:col-span-3">
              <Label htmlFor="product-name" className="text-foreground">
                Recipe Name *
              </Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Ultra Clean Dishwash Gel"
                className="focus-enhanced"
              />
            </div>

            <div>
              <Label htmlFor="batch-size" className="text-foreground">
                Batch Size (kg) *
              </Label>
              <Input
                id="batch-size"
                type="number"
                value={formData.batchSizeKg || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    batchSizeKg: Number(e.target.value),
                  })
                }
                placeholder="100.00"
                className="focus-enhanced"
              />
            </div>

            <div>
              <Label htmlFor="unit-price" className="text-foreground">
                Selling Price Per kg (₹)
              </Label>
              <Input
                id="unit-price"
                type="number"
                value={formData.sellingPricePerKg || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sellingPricePerKg: Number(e.target.value),
                  })
                }
                placeholder="100.00"
                className="focus-enhanced"
              />
            </div>

            <div>
              <Label htmlFor="margin" className="text-foreground">
                Target Margin (%)
              </Label>
              <Input
                id="margin"
                type="number"
                value={formData.profitMargin || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profitMargin: Number(e.target.value),
                  })
                }
                placeholder="35"
                className="focus-enhanced"
              />
            </div>

            <div className="sm:col-span-3">
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
                <TableHead className="w-[30%]">Material</TableHead>
                <TableHead className="w-[20%] text-right">Quantity*</TableHead>
                <TableHead className="w-[10%] text-left">Unit</TableHead>{" "}
                {/* NEW COLUMN */}
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
              {formData.ingredients.map((ingredient, index) => (
                <TableRow key={ingredient.id} className="hover:bg-accent/10">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <Select
                      value={ingredient.materialId}
                      onValueChange={(value) =>
                        handleIngredientChange(index, "materialId", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs focus-enhanced">
                        <SelectValue placeholder="Select Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIALS.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} ({material.priceWithTax?.toFixed(2)}
                            /kg)
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
                  <TableCell>
                    <Select
                      value={ingredient.unit}
                      onValueChange={(value) =>
                        handleIngredientChange(index, "unit", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs focus-enhanced">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INGREDIENT_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {ingredient.costPerKg.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {ingredient.totalCost.toFixed(2)}
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
              ))}

              {/* Add New Ingredient Row */}
              <TableRow className="bg-primary/5 border-t">
                <TableCell className="font-medium text-primary">
                  {formData.ingredients.length + 1}
                </TableCell>
                <TableCell>
                  <Select
                    value={newIngredient.materialId}
                    onValueChange={(value) =>
                      handleNewIngredientChange("materialId", value)
                    }
                  >
                    <SelectTrigger className="h-9 focus-enhanced">
                      <SelectValue placeholder="Select Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIALS.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.priceWithTax?.toFixed(2)}
                          /kg)
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
                <TableCell>
                  <Select
                    value={newIngredient.unit}
                    onValueChange={(value) =>
                      handleNewIngredientChange("unit", value)
                    }
                  >
                    <SelectTrigger className="h-9 focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INGREDIENT_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {newIngredient.costPerKg.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium text-primary">
                  {newIngredient.totalCost.toFixed(2)}
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
                Total Batch Cost ({formData.batchSizeKg || 0} kg)
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{batchTotalCost.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground">
                Recipe Cost Per kg (totalCostPerKg)
              </div>
              <div className="text-xl font-bold text-primary">
                ₹{totalCostPerKg.toFixed(2)} / kg
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
