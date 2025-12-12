// src/app/recipes/components/recipe-views/recipes-detail-view.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useSupplierMaterialTableRows,
  useMaterialsWithSupplierCount,
} from "@/hooks/material-hooks/use-materials-queries";

import {
  convertToBaseUnit,
  formatQuantity,
  normalizeToKg,
} from "@/utils/unit-conversion-utils";
import type {
  LockedPricing,
  Recipe,
  RecipeDisplay,
  RecipeIngredient,
  RecipeIngredientDisplay,
  RecipeVariant,
} from "@/types/recipe-types";
import { formatDate } from "@/utils/formatting-utils";
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Eye,
  FileText,
  Info,
  Lock,
  Package,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Unlock,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getStatusColors } from "../recipe-colors";
import { RecipeCostDistributionChart } from "./recipe-cost-distribution-chart";
import { RecipeWeightDistributionChart } from "./recipe-weight-distribution-chart";

type RecipeStatus = Recipe["status"];

interface RecipeDetailViewProps {
  recipe: RecipeDisplay | null;
  ingredients: RecipeIngredientDisplay[];
  variants: RecipeVariant[];
  onEdit: () => void;
  onDelete: () => void;
  isEditMode: boolean;
  isCreatingNew?: boolean;
  onCancelEdit: () => void;
  onSaveEdit: (recipeData: {
    name: string;
    description?: string;
    targetCostPerKg?: number;
    instructions?: string;
    status: RecipeStatus;
    notes?: string;
    version?: number;
    ingredients: RecipeIngredient[];
  }) => Promise<void>;
}

interface EditableIngredient extends RecipeIngredient {
  _isNew?: boolean;
  // Temporary fields for two-dropdown selection
  selectedMaterialId?: string;
  lockedPricing?: LockedPricing;
}

export function RecipeDetailView({
  recipe,
  ingredients,
  variants,
  onEdit,
  onDelete,
  isEditMode,
  isCreatingNew = false,
  onCancelEdit,
  onSaveEdit,
}: RecipeDetailViewProps) {
  const supplierMaterials = useSupplierMaterialTableRows();
  const materialsWithSuppliers = useMaterialsWithSupplierCount();

  // Edit state - ONLY for fields we save to DB
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTargetCost, setEditedTargetCost] = useState<
    number | undefined
  >();

  const [editedVersion, setEditedVersion] = useState<number | undefined>();
  const [editedInstructions, setEditedInstructions] = useState("");
  const [editedStatus, setEditedStatus] = useState<RecipeStatus>("draft");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedIngredients, setEditedIngredients] = useState<
    EditableIngredient[]
  >([]);
  const [activeTab, setActiveTab] = useState("details");

  // Sync edit state when entering edit mode
  // Compute initial edit state during render
  const initialEditState = useMemo(() => {
    if (!isEditMode) return null;

    if (recipe && !isCreatingNew) {
      // EDITING EXISTING RECIPE: populate with existing data
      return {
        name: recipe.name,
        description: recipe.description || "",
        targetCost: recipe.targetCostPerKg,
        version: recipe.version,
        instructions: recipe.instructions || "",
        status: recipe.status,
        notes: recipe.notes || "",
        ingredients: ingredients.map((ing) => {
          const sm = supplierMaterials.find(
            (s) => s.id === ing.supplierMaterialId
          );
          return {
            id: ing.id,
            recipeId: ing.recipeId,
            supplierMaterialId: ing.supplierMaterialId,
            quantity: ing.quantity,
            unit: ing.unit,
            createdAt: ing.createdAt,
            updatedAt: ing.updatedAt,
            selectedMaterialId: sm?.materialId,
          };
        }),
      };
    } else if (!recipe || isCreatingNew) {
      // CREATING NEW RECIPE: initialize with empty/default values
      return {
        name: "",
        description: "",
        targetCost: undefined,
        version: 1,
        instructions: "",
        status: "draft" as RecipeStatus,
        notes: "",
        ingredients: [],
      };
    }
    return null;
  }, [isEditMode, recipe, ingredients, isCreatingNew, supplierMaterials]);

  // Initialize edit state when computed values change
  useState(() => {
    if (initialEditState) {
      setEditedName(initialEditState.name);
      setEditedDescription(initialEditState.description);
      setEditedTargetCost(initialEditState.targetCost);
      setEditedVersion(initialEditState.version);
      setEditedInstructions(initialEditState.instructions);
      setEditedStatus(initialEditState.status);
      setEditedNotes(initialEditState.notes);
      setEditedIngredients(initialEditState.ingredients);
    }
  });

  // Calculate REAL-TIME metrics in edit mode (these are NOT saved, just displayed)
  const calculatedMetrics = useMemo(() => {
    if (!isEditMode || editedIngredients.length === 0) {
      return {
        totalWeight: recipe?.totalWeight || 0,
        totalCost: recipe?.totalCost || 0,
        taxedTotalCost: recipe?.taxedTotalCost || 0,
        costPerKg: recipe?.costPerKg || 0,
        taxedCostPerKg: recipe?.taxedCostPerKg || 0,
        varianceFromTarget: recipe?.varianceFromTarget,
        variancePercentage: recipe?.variancePercentage,
      };
    }

    // Calculate total weight from ingredients (sum of all quantities in standard units)
    const totalWeightGrams = editedIngredients.reduce((sum, ing) => {
      return sum + convertToBaseUnit(ing.quantity, ing.unit).quantity;
    }, 0);

    // Calculate costs from ingredients
    const enrichedIngredients = editedIngredients.map((ing) => {
      const sm = supplierMaterials.find((s) => s.id === ing.supplierMaterialId);
      if (!sm) return { costForQuantity: 0, taxedPriceForQuantity: 0 };

      const quantityInKg = normalizeToKg(ing.quantity, ing.unit);
      const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
      const effectiveTax = ing.lockedPricing?.tax || sm.tax || 0;
      const costForQuantity = pricePerKg * quantityInKg;
      const taxedPriceForQuantity = costForQuantity * (1 + effectiveTax / 100);

      return { costForQuantity, taxedPriceForQuantity };
    });

    const totalCost = enrichedIngredients.reduce(
      (sum, ing) => sum + ing.costForQuantity,
      0
    );
    const taxedTotalCost = enrichedIngredients.reduce(
      (sum, ing) => sum + ing.taxedPriceForQuantity,
      0
    );

    // Calculate per kg costs
    const costPerKg =
      totalWeightGrams > 0 ? (totalCost / totalWeightGrams) * 1000 : 0;
    const taxedCostPerKg =
      totalWeightGrams > 0 ? (totalCost / totalWeightGrams) * 1000 : 0;

    // Calculate variance from target
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
  }, [
    isEditMode,
    editedIngredients,
    editedTargetCost,
    supplierMaterials,
    recipe,
  ]);

  // Handlers for edit mode
  const handleAddIngredient = () => {
    const newId = `temp-${Date.now()}`;
    setEditedIngredients([
      ...editedIngredients,
      {
        id: newId,
        recipeId: recipe?.id || "",
        supplierMaterialId: "",
        quantity: 0,
        unit: "gm",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _isNew: true,
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setEditedIngredients(editedIngredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof EditableIngredient,
    value: any
  ) => {
    setEditedIngredients(
      editedIngredients.map((ing, i) => {
        if (i === index) {
          if (field === "selectedMaterialId") {
            // When material changes, clear supplier selection
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
  };

  const handleTogglePriceLock = (index: number) => {
    const ingredient = editedIngredients[index];
    const sm = supplierMaterials.find(
      (s) => s.id === ingredient.supplierMaterialId
    );

    if (!sm) return;

    setEditedIngredients(
      editedIngredients.map((ing, i) => {
        if (i === index) {
          if (ing.lockedPricing) {
            const { lockedPricing: _, ...rest } = ing;
            return rest;
          } else {
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
      })
    );
  };

  const handleSave = async () => {
    // Validation
    if (!editedName.trim()) {
      toast.error("Recipe name is required");
      return;
    }
    if (editedIngredients.length === 0) {
      toast.error("At least one ingredient is required");
      return;
    }

    // Check for incomplete ingredients
    const hasIncompleteIngredients = editedIngredients.some(
      (ing) => !ing.supplierMaterialId || ing.quantity <= 0
    );
    if (hasIncompleteIngredients) {
      toast.error(
        "All ingredients must have a material selected and quantity > 0"
      );
      return;
    }

    // Version validation
    if (editedVersion !== undefined && editedVersion < 1) {
      toast.error("Version must be a positive integer");
      return;
    }

    // Version change confirmation for significant changes
    if (
      recipe &&
      editedVersion !== undefined &&
      editedVersion < (recipe.version || 1)
    ) {
      const confirmed = window.confirm(
        `You are setting version ${editedVersion}, which is lower than the current version ${
          recipe.version || 1
        }. This may cause confusion. Continue?`
      );
      if (!confirmed) return;
    }

    try {
      await onSaveEdit({
        name: editedName,
        description: editedDescription,
        targetCostPerKg: editedTargetCost,
        instructions: editedInstructions,
        status: editedStatus,
        notes: editedNotes,
        version: editedVersion,
        ingredients: editedIngredients.map((ing) => {
          return { ...ing };
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Show create form when creating new recipe (no recipe selected, but in edit mode)
  if (!recipe && isEditMode && isCreatingNew) {
    // This will render the edit form below with empty fields
  } else if (!recipe) {
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

  const statusColors = getStatusColors(
    isEditMode ? editedStatus : recipe!.status
  );
  const displayMetrics = isEditMode
    ? calculatedMetrics
    : {
        totalWeight: recipe!.totalWeight,
        totalCost: recipe!.totalCost,
        taxedTotalCost: recipe!.taxedTotalCost,
        costPerKg: recipe!.costPerKg,
        taxedCostPerKg: recipe!.taxedCostPerKg,
        varianceFromTarget: recipe!.varianceFromTarget,
        variancePercentage: recipe!.variancePercentage,
      };

  return (
    <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {/* Header - PRESERVE ORIGINAL STYLING */}
        <div className="p-6 bg-gradient-to-r from-bg-primary-500 to-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditMode ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="recipe-name">Recipe Name *</Label>
                    <Input
                      id="recipe-name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-2xl font-bold h-auto py-2 mb-2"
                      placeholder="e.g., Premium Floor Cleaner"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipe-description">Description</Label>
                    <Textarea
                      id="recipe-description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Brief description of the recipe"
                      rows={2}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 items-center">
                    <div className="w-32">
                      <Label htmlFor="recipe-status">Status</Label>
                      <Select
                        value={editedStatus}
                        onValueChange={(v) =>
                          setEditedStatus(v as RecipeStatus)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="discontinued">
                            Discontinued
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor="target-cost">Target Cost/kg (₹)</Label>
                      <Input
                        id="target-cost"
                        type="number"
                        value={editedTargetCost || ""}
                        onChange={(e) =>
                          setEditedTargetCost(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        min="0"
                        step="0.01"
                        placeholder="Optional target"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="recipe-version"
                        className="flex items-center gap-2"
                      >
                        Version
                        <span className="text-xs text-slate-500">
                          (leave empty to auto-increment)
                        </span>
                      </Label>
                      <Input
                        id="recipe-version"
                        type="number"
                        value={editedVersion || ""}
                        onChange={(e) =>
                          setEditedVersion(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        min="1"
                        step="0.1"
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {recipe!.name}
                  </h2>
                  {recipe!.description && (
                    <p className="text-sm text-slate-600 mb-2">
                      {recipe!.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusColors.badge} border`}>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} mr-1`}
                      />
                      {recipe!.status}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      Version {recipe!.version || 1}
                    </span>
                    <span className="text-sm text-slate-500">
                      • {formatDate(recipe!.updatedAt || recipe!.createdAt)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button size="sm" variant="outline" onClick={onCancelEdit}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Key Metrics - CALCULATED, DISPLAY ONLY */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Composition Weight</p>
              <p className="text-xl font-bold text-slate-900">
                {displayMetrics.totalWeight
                  ? `${displayMetrics.totalWeight.toFixed(0)}g`
                  : "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Auto-calculated from ingredients
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">
                Cost of Composition{" "}
              </p>
              <p className="text-xl font-bold text-slate-900">
                ₹{displayMetrics.totalCost?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                For {displayMetrics.totalWeight?.toFixed(0) || 0}gms
                {displayMetrics.taxedTotalCost && (
                  <span className="block text-xs text-slate-400">
                    With tax: ₹{displayMetrics.taxedTotalCost.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Cost per kg</p>
              <p className="text-xl font-bold text-slate-900">
                ₹{displayMetrics.costPerKg?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                For 1000gms
                {displayMetrics.taxedCostPerKg && (
                  <span className="block text-xs text-slate-400">
                    With tax: ₹{displayMetrics.taxedCostPerKg.toFixed(2)}/kg
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Target Cost</p>

              <p className="text-xl font-bold text-slate-900">
                {isEditMode ? (
                  <>Target: ₹{editedTargetCost?.toFixed(2) || "Not set"}</>
                ) : (
                  <>₹{recipe!.targetCostPerKg?.toFixed(2) || "N/A"}</>
                )}
              </p>
              <p
                className={`text-xs mt-1 ${
                  displayMetrics.varianceFromTarget &&
                  displayMetrics.varianceFromTarget > 0
                    ? "text-red-600"
                    : displayMetrics.varianceFromTarget &&
                        displayMetrics.varianceFromTarget < 0
                      ? "text-green-600"
                      : "text-slate-900"
                }`}
              >
                Variance:{" "}
                {displayMetrics.varianceFromTarget !== undefined
                  ? `${
                      displayMetrics.varianceFromTarget > 0 ? "+" : ""
                    }₹${displayMetrics.varianceFromTarget.toFixed(2)}`
                  : "N/A"}{" "}
                <span
                  className={`block text-xs  ${
                    displayMetrics.variancePercentage &&
                    displayMetrics.variancePercentage > 0
                      ? "text-red-600"
                      : displayMetrics.variancePercentage &&
                          displayMetrics.variancePercentage < 0
                        ? "text-green-600"
                        : "text-slate-500"
                  }`}
                >
                  Percentage:{" "}
                  {displayMetrics.variancePercentage !== undefined
                    ? `${
                        displayMetrics.variancePercentage > 0 ? "+" : ""
                      }${displayMetrics.variancePercentage.toFixed(1)}%`
                    : "No target set"}
                </span>
              </p>
            </div>
          </div>

          {/* Editable Target Cost in Edit Mode */}
          {isEditMode && <div className="mt-4 grid grid-cols-3 gap-4"></div>}

          {/* Target Progress (View Mode Only) */}
          {!isEditMode && recipe!.targetCostPerKg && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Achievement
                </span>
                <div className="flex items-center gap-2">
                  {recipe!.costPerKg <= recipe!.targetCostPerKg ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      recipe!.costPerKg <= recipe!.targetCostPerKg
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.min(
                      (recipe!.targetCostPerKg / recipe!.costPerKg) * 100,
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(
                  (recipe!.targetCostPerKg / recipe!.costPerKg) * 100,
                  100
                )}
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Tabs Content - PRESERVE ORIGINAL */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              <Eye className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="ingredients">
              <Package className="w-4 h-4 mr-2" />
              Ingredients (
              {isEditMode ? editedIngredients.length : ingredients.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="details" className="p-6 mt-0">
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instructions">
                      Production Instructions
                    </Label>
                    <Textarea
                      id="instructions"
                      value={editedInstructions}
                      onChange={(e) => setEditedInstructions(e.target.value)}
                      placeholder="Step-by-step manufacturing instructions..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {recipe!.instructions && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Production Instructions
                      </h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {recipe!.instructions}
                      </p>
                    </div>
                  )}

                  {/* Cost and Weight Distribution Charts */}
                  <div className="grid grid-cols-2 gap-6">
                    <RecipeCostDistributionChart ingredients={ingredients} />
                    <RecipeWeightDistributionChart ingredients={ingredients} />
                  </div>

                  {/* Variants - PRESERVE ORIGINAL */}
                  {variants && variants.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Recipe Variants ({variants.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {variants.map((variant) => (
                          <Card
                            key={variant.id}
                            className="border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-slate-900">
                                    {variant.name}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant={
                                        variant.isActive
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {variant.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {variant.description && (
                                <p className="text-sm text-slate-600 mb-2">
                                  {variant.description}
                                </p>
                              )}
                              <p className="text-xs text-slate-500">
                                Created {formatDate(variant.createdAt)}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ingredients" className="p-6 mt-0">
              {isEditMode ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="w-32">Quantity (gms)</TableHead>
                          <TableHead className="w-28">Cost/Unit</TableHead>
                          <TableHead className="w-28">Total</TableHead>
                          <TableHead className="w-20">Lock</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedIngredients.map((ing, index) => {
                          const sm = supplierMaterials.find(
                            (s) => s.id === ing.supplierMaterialId
                          );
                          const quantityInKg = normalizeToKg(
                            ing.quantity,
                            ing.unit
                          );
                          const pricePerKg =
                            ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
                          const cost = pricePerKg * quantityInKg;

                          // Get suppliers for the selected material
                          const selectedMaterial = materialsWithSuppliers.find(
                            (m) => m.id === ing.selectedMaterialId
                          );
                          const availableSuppliers =
                            selectedMaterial?.suppliers || [];

                          return (
                            <TableRow key={ing.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Select
                                  value={ing.selectedMaterialId || ""}
                                  onValueChange={(value) =>
                                    handleIngredientChange(
                                      index,
                                      "selectedMaterialId",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {materialsWithSuppliers.map((material) => (
                                      <SelectItem
                                        key={material.id}
                                        value={material.id}
                                      >
                                        {material.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={ing.supplierMaterialId}
                                  onValueChange={(value) =>
                                    handleIngredientChange(
                                      index,
                                      "supplierMaterialId",
                                      value
                                    )
                                  }
                                  disabled={!ing.selectedMaterialId}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select supplier" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableSuppliers.map((supplierSM) => (
                                      <SelectItem
                                        key={supplierSM.id}
                                        value={supplierSM.id}
                                      >
                                        {supplierSM.supplierName} - ₹
                                        {supplierSM.unitPrice.toFixed(2)}/kg
                                        {supplierSM.moq &&
                                          ` - MOQ: ${supplierSM.moq}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={ing.quantity || ""}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      index,
                                      "quantity",
                                      Number(e.target.value)
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                  className="h-9 text-right"
                                />
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                ₹{pricePerKg.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ₹{cost.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleTogglePriceLock(index)}
                                  className="h-8 w-8"
                                  disabled={!sm}
                                >
                                  {ing.lockedPricing ? (
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
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    onClick={handleAddIngredient}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ingredients.map((ing) => {
                    const sm = supplierMaterials.find(
                      (s) => s.id === ing.supplierMaterialId
                    );

                    const displayQuantity = formatQuantity(
                      ing.quantity,
                      ing.unit
                    );
                    const getAvailabilityColors = (isAvailable: boolean) => {
                      if (isAvailable)
                        return "bg-green-100 text-green-800 border-green-200";
                      return "bg-red-100 text-red-800 border-red-200";
                    };
                    const availabilityText =
                      ing.stockStatus === "in-stock"
                        ? "In Stock"
                        : "Out of Stock";
                    const taxRate = ing.lockedPricing
                      ? ing.lockedPricing.tax
                      : sm?.tax || 0;

                    return (
                      <Card key={ing.id} className="border-slate-200 py-0">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-900">
                                  {ing.displayName}
                                </h4>
                                <Badge
                                  className={`text-xs ${getAvailabilityColors(
                                    ing.stockStatus === "in-stock"
                                  )}`}
                                >
                                  {availabilityText}
                                </Badge>
                                {ing.priceChangedSinceLock && (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-xs">
                                      Price changed
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-600">
                                <span>{displayQuantity}</span>
                                <span>•</span>
                                {ing.lockedPricing ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-blue-600">
                                      Price locked at ₹
                                      {ing.lockedPricing.unitPrice.toFixed(2)}
                                      /kg
                                    </span>
                                    <span
                                      title={`Locked on ${formatDate(
                                        ing.lockedPricing.lockedAt
                                      )} | Reason: ${
                                        ing.lockedPricing.reason || "N/A"
                                      }`}
                                    >
                                      <Info className="w-3 h-3 text-blue-500 cursor-help" />
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500">
                                    ₹{ing.pricePerKg.toFixed(2)}/kg
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="gap-2 text-right">
                              <p className="text-lg font-bold text-slate-900">
                                ₹ {ing.costForQuantity.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                With{" "}
                                <span className="font-bold text-slate-900">
                                  {taxRate}%{" "}
                                </span>
                                Tax: ₹ {ing.taxedPriceForQuantity.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
