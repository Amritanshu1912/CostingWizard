// src/app/recipes/components/recipe-views/recipes-detail-view.tsx
import { Card, CardContent } from "@/components/ui/card";
import {
  useRecipeDetail,
  useRecipeIngredients,
  useRecipeVariants,
  useSupplierMaterialsForRecipe,
  useSupplierMaterialsByMaterial,
} from "@/hooks/recipe-hooks/use-recipe-data";
import { useRecipeOperations } from "@/hooks/recipe-hooks/use-recipe-operations";
import type { EditableIngredient } from "@/types/recipe-types";
import { Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RecipeDetailHeader } from "./recipe-detail-header";
import { RecipeDetailTabs } from "./recipe-detail-tabs";
import { normalizeToKg } from "@/utils/unit-conversion-utils";

interface RecipeDetailViewProps {
  recipeId: string | null;
  isCreatingNew: boolean;
  onDelete: () => void;
  onCancelCreate: () => void;
  onCreateSuccess: (newRecipeId: string) => void;
}

/**
 * Recipe detail view - Main container component
 */
export function RecipeDetailView({
  recipeId,
  isCreatingNew,
  onDelete,
  onCancelCreate,
  onCreateSuccess,
}: RecipeDetailViewProps) {
  // DATA FETCHING (Using New Hooks)

  const recipe = useRecipeDetail(recipeId);
  const ingredients = useRecipeIngredients(recipeId);
  const variants = useRecipeVariants(recipeId);
  const materials = useSupplierMaterialsForRecipe();
  const materialsGroupedByMaterial = useSupplierMaterialsByMaterial();
  const { createRecipe, updateRecipe } = useRecipeOperations();

  // EDIT MODE STATE

  const [isEditMode, setIsEditMode] = useState(false);

  // Edit form state
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTargetCost, setEditedTargetCost] = useState<
    number | undefined
  >();
  const [editedStatus, setEditedStatus] = useState<
    "draft" | "testing" | "active" | "archived" | "discontinued"
  >("draft");
  const [editedVersion, setEditedVersion] = useState<number | undefined>();
  const [editedInstructions, setEditedInstructions] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedIngredients, setEditedIngredients] = useState<
    EditableIngredient[]
  >([]);

  // SYNC EDIT STATE (When Entering Edit Mode or Creating New)

  useEffect(() => {
    if (isCreatingNew) {
      // Creating new recipe - initialize with empty values
      setIsEditMode(true);
      setEditedName("");
      setEditedDescription("");
      setEditedTargetCost(undefined);
      setEditedStatus("draft");
      setEditedVersion(1);
      setEditedInstructions("");
      setEditedNotes("");
      setEditedIngredients([]);
    } else if (isEditMode && recipe) {
      // Editing existing recipe - populate with current values
      setEditedName(recipe.name);
      setEditedDescription(recipe.description || "");
      setEditedTargetCost(recipe.targetCostPerKg);
      setEditedStatus(recipe.status);
      setEditedVersion(recipe.version);
      setEditedInstructions(recipe.instructions || "");
      setEditedNotes(recipe.notes || "");

      // Convert ingredients to editable format
      setEditedIngredients(
        ingredients.map((ing) => {
          const material = materials.find(
            (m) => m.id === ing.supplierMaterialId
          );
          return {
            id: ing.id,
            recipeId: ing.recipeId,
            supplierMaterialId: ing.supplierMaterialId,
            quantity: ing.quantity,
            unit: ing.unit,
            lockedPricing: ing.lockedPricing,
            createdAt: ing.createdAt,
            updatedAt: ing.updatedAt,
            selectedMaterialId: material?.materialId,
          };
        })
      );
    }
  }, [isEditMode, isCreatingNew, recipe, ingredients, materials]);

  // CALCULATE REAL-TIME METRICS (During Edit Mode)
  const calculatedMetrics = useMemo(() => {
    if (!isEditMode && recipe) {
      // View mode - use recipe's computed values
      return {
        totalWeight: recipe.totalWeight,
        totalCost: recipe.totalCost,
        taxedTotalCost: recipe.taxedTotalCost,
        costPerKg: recipe.costPerKg,
        taxedCostPerKg: recipe.taxedCostPerKg,
        varianceFromTarget: recipe.varianceFromTarget,
        variancePercentage: recipe.variancePercentage,
      };
    }

    // Edit mode - calculate from editedIngredients
    if (editedIngredients.length === 0) {
      return {
        totalWeight: 0,
        totalCost: 0,
        taxedTotalCost: 0,
        costPerKg: 0,
        taxedCostPerKg: 0,
        varianceFromTarget: undefined,
        variancePercentage: undefined,
      };
    }

    let totalWeightGrams = 0;
    let totalCost = 0;
    let taxedTotalCost = 0;

    editedIngredients.forEach((ing) => {
      const sm = materials.find((s) => s.id === ing.supplierMaterialId);
      if (!sm) return;

      // Weight
      const quantityInKg = normalizeToKg(ing.quantity, ing.unit);
      const weightInGrams = quantityInKg * 1000;

      totalWeightGrams += weightInGrams;

      // Cost
      const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
      const tax = ing.lockedPricing?.tax || sm.tax || 0;

      const cost = pricePerKg * quantityInKg;
      const costWithTax = cost * (1 + tax / 100);

      totalCost += cost;
      taxedTotalCost += costWithTax;
    });

    const weightInKg = totalWeightGrams / 1000;
    const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;
    const taxedCostPerKg = weightInKg > 0 ? taxedTotalCost / weightInKg : 0;

    const varianceFromTarget = editedTargetCost
      ? costPerKg - editedTargetCost
      : undefined;
    const variancePercentage =
      varianceFromTarget && editedTargetCost
        ? (varianceFromTarget / editedTargetCost) * 100
        : undefined;

    return {
      totalWeight: totalWeightGrams,
      totalCost,
      taxedTotalCost,
      costPerKg,
      taxedCostPerKg,
      varianceFromTarget,
      variancePercentage,
    };
  }, [isEditMode, recipe, editedIngredients, editedTargetCost, materials]);

  // HANDLERS - Edit Mode
  const handleEdit = useCallback(() => {
    if (!recipe) return;
    setIsEditMode(true);
  }, [recipe]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    if (isCreatingNew) {
      onCancelCreate();
    }
  }, [isCreatingNew, onCancelCreate]);

  const handleSave = useCallback(async () => {
    // Validation
    if (!editedName.trim()) {
      toast.error("Recipe name is required");
      return;
    }
    if (editedIngredients.length === 0) {
      toast.error("At least one ingredient is required");
      return;
    }

    const hasIncompleteIngredients = editedIngredients.some(
      (ing) => !ing.supplierMaterialId || ing.quantity <= 0
    );
    if (hasIncompleteIngredients) {
      toast.error("All ingredients must have a material and quantity > 0");
      return;
    }

    try {
      const recipeData = {
        name: editedName,
        description: editedDescription,
        targetCostPerKg: editedTargetCost,
        status: editedStatus,
        instructions: editedInstructions,
        notes: editedNotes,
        version: editedVersion,
        ingredients: editedIngredients.map((ing) => ({
          id: ing.id,
          supplierMaterialId: ing.supplierMaterialId,
          quantity: ing.quantity,
          unit: ing.unit,
          lockedPricing: ing.lockedPricing,
        })),
      };

      if (isCreatingNew) {
        const newRecipeId = await createRecipe(recipeData);
        setIsEditMode(false);
        onCreateSuccess(newRecipeId);
      } else if (recipeId) {
        await updateRecipe(recipeId, recipeData);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Save recipe error:", error);
      toast.error("Failed to save recipe");
    }
  }, [
    editedName,
    editedDescription,
    editedTargetCost,
    editedStatus,
    editedInstructions,
    editedNotes,
    editedVersion,
    editedIngredients,
    isCreatingNew,
    recipeId,
    createRecipe,
    updateRecipe,
    onCreateSuccess,
  ]);

  // HANDLERS - Ingredients

  const handleAddIngredient = useCallback(() => {
    const newId = `temp-${Date.now()}`;
    setEditedIngredients([
      ...editedIngredients,
      {
        id: newId,
        recipeId: recipeId || "",
        supplierMaterialId: "",
        quantity: 0,
        unit: "gm",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _isNew: true,
      },
    ]);
  }, [editedIngredients, recipeId]);

  const handleRemoveIngredient = useCallback(
    (index: number) => {
      setEditedIngredients(editedIngredients.filter((_, i) => i !== index));
    },
    [editedIngredients]
  );

  const handleIngredientChange = useCallback(
    (index: number, field: keyof EditableIngredient, value: any) => {
      setEditedIngredients(
        editedIngredients.map((ing, i) => {
          if (i === index) {
            if (field === "selectedMaterialId") {
              return {
                ...ing,
                selectedMaterialId: value,
                supplierMaterialId: "", // Clear supplier when material changes
              };
            }
            return { ...ing, [field]: value };
          }
          return ing;
        })
      );
    },
    [editedIngredients]
  );

  const handleTogglePriceLock = useCallback(
    (index: number) => {
      const ing = editedIngredients[index];
      const sm = materials.find((s) => s.id === ing.supplierMaterialId);
      if (!sm) return;

      setEditedIngredients(
        editedIngredients.map((item, i) => {
          if (i === index) {
            if (item.lockedPricing) {
              const { lockedPricing: _lockedPricing, ...rest } = item;
              return rest;
            } else {
              return {
                ...item,
                lockedPricing: {
                  unitPrice: sm.unitPrice,
                  tax: sm.tax,
                  lockedAt: new Date(),
                  reason: "cost_analysis",
                },
              };
            }
          }
          return item;
        })
      );
    },
    [editedIngredients, materials]
  );

  // RENDER - Empty State

  if (!recipe && !isCreatingNew) {
    return (
      <Card className="flex-1 flex items-center justify-center border-none shadow-sm">
        <div className="text-center">
          <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Select a Recipe
          </h3>
          <p className="text-slate-600">
            Choose a recipe from the list to view details
          </p>
        </div>
      </Card>
    );
  }

  // RENDER - Recipe Detail

  return (
    <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {/* Header Section */}
        <RecipeDetailHeader
          recipe={recipe}
          isEditMode={isEditMode}
          isCreatingNew={isCreatingNew}
          totalWeight={calculatedMetrics.totalWeight}
          totalCost={calculatedMetrics.totalCost}
          taxedTotalCost={calculatedMetrics.taxedTotalCost}
          costPerKg={calculatedMetrics.costPerKg}
          taxedCostPerKg={calculatedMetrics.taxedCostPerKg}
          varianceFromTarget={calculatedMetrics.varianceFromTarget}
          variancePercentage={calculatedMetrics.variancePercentage}
          editedName={editedName}
          editedDescription={editedDescription}
          editedTargetCost={editedTargetCost}
          editedStatus={editedStatus}
          editedVersion={editedVersion}
          onEdit={handleEdit}
          onDelete={onDelete}
          onCancelEdit={handleCancelEdit}
          onSave={handleSave}
          onNameChange={setEditedName}
          onDescriptionChange={setEditedDescription}
          onTargetCostChange={setEditedTargetCost}
          onStatusChange={setEditedStatus}
          onVersionChange={setEditedVersion}
        />

        {/* Tabs Section */}
        <RecipeDetailTabs
          recipe={recipe}
          ingredients={ingredients}
          variants={variants}
          isEditMode={isEditMode}
          editedIngredients={editedIngredients}
          editedInstructions={editedInstructions}
          editedNotes={editedNotes}
          materials={materials}
          materialsGroupedByMaterial={materialsGroupedByMaterial}
          onInstructionsChange={setEditedInstructions}
          onNotesChange={setEditedNotes}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onIngredientChange={handleIngredientChange}
          onTogglePriceLock={handleTogglePriceLock}
        />
      </CardContent>
    </Card>
  );
}
