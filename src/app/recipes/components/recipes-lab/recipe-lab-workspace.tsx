// components/recipes/recipes-lab/recipe-lab-workspace.tsx
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit3, RotateCcw, Save, Trash2, Check, X } from "lucide-react";
import { RecipeLabIngredientCard } from "./recipe-lab-ingredient-card";
import type { ExperimentIngredient } from "@/hooks/use-recipe-experiment";
import type { SupplierMaterialWithDetails, RecipeVariant } from "@/lib/types";

interface RecipeLabWorkspaceProps {
  selectedRecipeName: string;
  loadedVariantName: string | null;
  currentVariant?: RecipeVariant;
  experimentIngredients: ExperimentIngredient[];
  supplierMaterials: SupplierMaterialWithDetails[];
  expandedAlternatives: Set<string>;
  metrics: any;
  getAlternatives: (ing: any) => SupplierMaterialWithDetails[];
  onQuantityChange: (index: number, quantity: number) => void;
  onSupplierChange: (index: number, supplierId: string) => void;
  onTogglePriceLock: (index: number) => void;
  onRemoveIngredient: (index: number) => void;
  onResetIngredient: (index: number) => void;
  onToggleAlternatives: (id: string) => void;
  onResetAll: () => void;
  onSaveAsVariant: () => void;
  onUpdateVariant: () => void;
  onLoadOriginalRecipe: () => void;
  onUpdateOriginal: () => void;
  onDeleteVariant: (variantId: string) => Promise<void>;
  onUpdateVariantDetails: (variant: RecipeVariant) => Promise<void>;
}

export function RecipeLabWorkspace({
  selectedRecipeName,
  loadedVariantName,
  currentVariant,
  experimentIngredients,
  supplierMaterials,
  expandedAlternatives,
  metrics,
  getAlternatives,
  onQuantityChange,
  onSupplierChange,
  onTogglePriceLock,
  onRemoveIngredient,
  onResetIngredient,
  onToggleAlternatives,
  onResetAll,
  onSaveAsVariant,
  onUpdateVariant,
  onLoadOriginalRecipe,
  onUpdateOriginal,
  onDeleteVariant,
  onUpdateVariantDetails,
}: RecipeLabWorkspaceProps) {
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [editedVariant, setEditedVariant] = useState<RecipeVariant | undefined>(
    currentVariant
  );

  useEffect(() => {
    setEditedVariant(currentVariant);
    setIsEditingVariant(false);
  }, [currentVariant]);

  const handleSaveVariantDetails = () => {
    if (editedVariant) {
      onUpdateVariantDetails(editedVariant);
      setIsEditingVariant(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedVariant(currentVariant);
    setIsEditingVariant(false);
  };

  return (
    <Card className="flex-1 flex flex-col py-2">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Experiment Workspace
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {loadedVariantName ? (
                <>
                  <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={onLoadOriginalRecipe}
                    title="Click to load original recipe"
                  >
                    {selectedRecipeName}
                  </span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-slate-900">
                    {loadedVariantName}
                  </span>
                </>
              ) : (
                <span className="font-medium">{selectedRecipeName}</span>
              )}
            </p>
          </div>
          {metrics.changeCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetAll}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </Button>
          )}
        </div>

        {/* Variant Details - Inline Editable */}
        {loadedVariantName && currentVariant && editedVariant && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              isEditingVariant
                ? "border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-slate-50"
                : "bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200"
            }`}
          >
            {!isEditingVariant ? (
              // View Mode
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-semibold text-slate-900">
                      {currentVariant.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        currentVariant.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {currentVariant.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-slate-500">
                        Description
                      </Label>
                      <p className="text-slate-700 mt-0.5">
                        {currentVariant.description || "No description"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Goal</Label>
                      <p className="text-slate-700 mt-0.5 capitalize">
                        {currentVariant.optimizationGoal?.replace(/_/g, " ") ||
                          "Not specified"}
                      </p>
                    </div>
                    {currentVariant.notes && (
                      <div className="col-span-2">
                        <Label className="text-xs text-slate-500">Notes</Label>
                        <p className="text-slate-700 mt-0.5">
                          {currentVariant.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingVariant(true)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{currentVariant.name}
                          "? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteVariant(currentVariant.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2 flex-1">
                    <Label className="text-xs text-slate-500 mb-1">
                      Name *
                    </Label>
                    <Input
                      value={editedVariant.name}
                      onChange={(e) =>
                        setEditedVariant({
                          ...editedVariant,
                          name: e.target.value,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="w-full">
                    <Label className="text-xs text-slate-500 mb-1">Goal</Label>
                    <Select
                      value={editedVariant.optimizationGoal || ""}
                      onValueChange={(value) =>
                        setEditedVariant({
                          ...editedVariant,
                          optimizationGoal:
                            value as RecipeVariant["optimizationGoal"],
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cost_reduction">
                          Cost Reduction
                        </SelectItem>
                        <SelectItem value="quality_improvement">
                          Quality Improvement
                        </SelectItem>
                        <SelectItem value="supplier_diversification">
                          Supplier Diversification
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label className="text-xs text-slate-500 mb-1">
                      Status
                    </Label>
                    <label className="flex items-center gap-2 h-9 px-3 border rounded-md bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={editedVariant.isActive}
                        onChange={(e) =>
                          setEditedVariant({
                            ...editedVariant,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-slate-500 mb-1">
                      Description
                    </Label>
                    <Textarea
                      value={editedVariant.description || ""}
                      onChange={(e) =>
                        setEditedVariant({
                          ...editedVariant,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 mb-1">Notes</Label>
                    <Textarea
                      value={editedVariant.notes || ""}
                      onChange={(e) =>
                        setEditedVariant({
                          ...editedVariant,
                          notes: e.target.value,
                        })
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveVariantDetails}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredients List */}
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
              onQuantityChange={onQuantityChange}
              onSupplierChange={onSupplierChange}
              onTogglePriceLock={onTogglePriceLock}
              onRemove={onRemoveIngredient}
              onReset={onResetIngredient}
              onToggleAlternatives={onToggleAlternatives}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Action Panel - Shows when changes exist */}
      {metrics.changeCount > 0 && (
        <div className="p-4 border-t bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {metrics.changeCount} change{metrics.changeCount > 1 ? "s" : ""}{" "}
                made
              </p>
              <p
                className={`text-lg font-bold ${
                  metrics.savings > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics.savings > 0 ? "−" : "+"}₹
                {Math.abs(metrics.savings).toFixed(2)}/kg
                <span className="text-sm font-normal ml-1">
                  ({metrics.savingsPercent.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onResetAll}
              size="sm"
            >
              Discard
            </Button>

            {loadedVariantName ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onUpdateVariant}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Variant
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onSaveAsVariant}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as New
                </Button>
                <Button className="flex-1" onClick={onUpdateOriginal} size="sm">
                  Update Original
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onSaveAsVariant}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Variant
                </Button>
                <Button className="flex-1" onClick={onUpdateOriginal} size="sm">
                  Update Recipe
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
