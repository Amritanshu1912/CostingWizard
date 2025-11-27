// src/app/recipes/components/recipes-lab/recipe-lab-workspace.tsx
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExperimentIngredient } from "@/hooks/use-recipe-experiment";
import type { RecipeVariant, SupplierMaterialWithDetails } from "@/lib/types";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RecipeLabIngredientCard } from "./recipe-lab-ingredient-card";

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
  /** Reset all ingredient changes made to the current recipe/variant back to their original state */
  onResetAll: () => void;
  onSaveAsVariant: () => void;
  onUpdateVariant: () => void;
  /** Load and display the original recipe when viewing a variant */
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
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

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
      <div className="flex items-start justify-between p-4">
        {/* Card for Recipe/Variant Info */}
        <Card className="flex-1 p-4 gap-4 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 shadow-sm relative">
          {/* Top Row: Name, Links, and Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {loadedVariantName ? loadedVariantName : selectedRecipeName}
                </h3>
                {loadedVariantName && (
                  <p className="text-sm text-muted-foreground">
                    Original:{" "}
                    <span
                      onClick={onLoadOriginalRecipe}
                      className="text-blue-600 cursor-pointer hover:underline"
                      title="Click to load original recipe"
                    >
                      {selectedRecipeName}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* --- Actions for Variants --- */}

            <div className="flex items-center gap-2">
              {metrics.changeCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetAll}
                  className="flex items-center gap-2"
                  title="Reset all ingredient changes back to their original values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Changes
                </Button>
              )}
              {loadedVariantName && currentVariant && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // When clicking edit, always expand the details
                      setIsDetailsExpanded(true);
                      setIsEditingVariant(true);
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="w-9 h-9"
                        title={`Delete variant "${currentVariant.name}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;
                          {currentVariant.name}
                          &quot;? This action cannot be undone.
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
              )}
            </div>
          </div>
          {/* Chevron for Details Toggle */}
          {loadedVariantName && currentVariant && (
            <button
              className="absolute left-1/2 bottom-1 transform -translate-x-1/2 -mb-px text-slate-400 hover:text-blue-500 transition-colors"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              title={isDetailsExpanded ? "Hide details" : "Show details"}
            >
              {isDetailsExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}{" "}
          {/* --- Expandable Details Section --- */}
          {isDetailsExpanded &&
            loadedVariantName &&
            currentVariant &&
            editedVariant && (
              <div className="pt-4 border-t border-slate-200">
                {!isEditingVariant ? (
                  // --- View Mode for Details ---
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <Label className="text-xs text-slate-500">Status</Label>
                        <p
                          className={`inline-flex items-center gap-2 font-medium ${
                            currentVariant.isActive
                              ? "text-green-700"
                              : "text-slate-600"
                          }`}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              currentVariant.isActive
                                ? "bg-green-500"
                                : "bg-slate-400"
                            }`}
                          ></span>
                          {currentVariant.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-500">
                          Optimization Goal
                        </Label>
                        <p className="text-slate-700 capitalize">
                          {currentVariant.optimizationGoal?.replace(
                            /_/g,
                            " "
                          ) || (
                            <span className="italic text-slate-500">
                              Not specified
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <Label className="text-xs text-slate-500">
                          Description
                        </Label>
                        <p className="text-slate-700 leading-relaxed">
                          {currentVariant.description || (
                            <span className="italic text-slate-500">
                              No description provided
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-500">Notes</Label>
                        <p className="text-slate-700 leading-relaxed">
                          {currentVariant.notes ? (
                            currentVariant.notes
                          ) : (
                            <span className="italic text-slate-500">
                              No notes available
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  // --- Edit Mode for Details ---
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label className="text-xs">Name *</Label>
                        <Input
                          value={editedVariant.name}
                          onChange={(e) =>
                            setEditedVariant({
                              ...editedVariant,
                              name: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Goal</Label>
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
                          <SelectTrigger className="mt-1">
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
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer ml-1 mb-1">
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
                          <span className="text-sm font-medium">
                            Active Variant
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={editedVariant.description || ""}
                          onChange={(e) =>
                            setEditedVariant({
                              ...editedVariant,
                              description: e.target.value,
                            })
                          }
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Notes</Label>
                        <Textarea
                          value={editedVariant.notes || ""}
                          onChange={(e) =>
                            setEditedVariant({
                              ...editedVariant,
                              notes: e.target.value,
                            })
                          }
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveVariantDetails}>
                        <Check className="w-4 h-4 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </Card>
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
              title="Reset all ingredient changes back to their original values"
            >
              Reset Changes
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
