import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Edit3, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { RecipeLabIngredientCard } from "./recipe-lab-ingredient-card";
import type { ExperimentIngredient } from "@/hooks/use-recipe-experiment";
import type { SupplierMaterialWithDetails, RecipeVariant } from "@/lib/types";

interface CenterPanelProps {
  selectedRecipeName: string;
  loadedVariantName: string | null;
  currentVariant?: RecipeVariant;
  experimentIngredients: ExperimentIngredient[];
  supplierMaterials: SupplierMaterialWithDetails[];
  expandedAlternatives: Set<string>;
  metrics: any;
  getAlternatives: (ing: any) => SupplierMaterialWithDetails[];
  handleQuantityChange: (index: number, quantity: number) => void;
  handleSupplierChange: (index: number, supplierId: string) => void;
  handleTogglePriceLock: (index: number) => void;
  handleRemoveIngredient: (index: number) => void;
  handleResetIngredient: (index: number) => void;
  toggleAlternatives: (id: string) => void;
  handleResetAll: () => void;
  setSaveDialogOpen: (open: boolean) => void;
  setUpdateVariantDialogOpen: (open: boolean) => void;
  handleLoadOriginalRecipe: () => void;
  handleUpdateOriginal: () => void;
  onDeleteVariant?: (variantId: string) => Promise<void>;
  onUpdateVariant?: (variant: RecipeVariant) => Promise<void>;
}

export function CenterPanel({
  selectedRecipeName,
  loadedVariantName,
  currentVariant,
  experimentIngredients,
  supplierMaterials,
  expandedAlternatives,
  metrics,
  getAlternatives,
  handleQuantityChange,
  handleSupplierChange,
  handleTogglePriceLock,
  handleRemoveIngredient,
  handleResetIngredient,
  toggleAlternatives,
  handleResetAll,
  setSaveDialogOpen,
  setUpdateVariantDialogOpen,
  handleLoadOriginalRecipe,
  handleUpdateOriginal,
  onDeleteVariant,
  onUpdateVariant,
}: CenterPanelProps) {
  const [editedVariant, setEditedVariant] = useState<RecipeVariant | undefined>(
    currentVariant
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Update editedVariant when currentVariant changes
  useEffect(() => {
    setEditedVariant(currentVariant);
  }, [currentVariant]);

  const handleEditSubmit = () => {
    if (editedVariant) {
      onUpdateVariant?.(editedVariant);
      setIsEditDialogOpen(false);
    }
  };

  const handleVariantFieldChange = (field: keyof RecipeVariant, value: any) => {
    if (editedVariant) {
      setEditedVariant({
        ...editedVariant,
        [field]: value,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <Card className="flex-1 flex flex-col py-2">
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
                    onClick={handleLoadOriginalRecipe}
                  >
                    {selectedRecipeName}
                  </span>
                  {" → "}
                  <span className="text-black">{loadedVariantName}</span>
                </>
              ) : (
                selectedRecipeName
              )}
            </p>
          </div>
          {metrics.changeCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleResetAll}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Changes
            </Button>
          )}
        </div>

        {loadedVariantName && currentVariant && editedVariant && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-xs">Description</Label>
                  <p className="text-sm text-slate-600">
                    {currentVariant.description || "No description provided."}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Optimization Goal</Label>
                  <p className="text-sm text-slate-600 capitalize">
                    {currentVariant.optimizationGoal?.replace(/_/g, " ") ||
                      "Not specified"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <p className="text-sm text-slate-600">
                    {currentVariant.notes || "No notes added."}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <p className="text-sm text-slate-600">
                    {currentVariant.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Variant</DialogTitle>
                      <DialogDescription>
                        Update variant properties
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editedVariant.name}
                          onChange={(e) =>
                            setEditedVariant({
                              ...editedVariant,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editedVariant.description || ""}
                          onChange={(e) =>
                            setEditedVariant({
                              ...editedVariant,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe the purpose of this variant..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal">Optimization Goal</Label>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select a goal..." />
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
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={editedVariant.notes || ""}
                          onChange={(e) =>
                            setEditedVariant({
                              ...editedVariant,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Additional notes about this variant..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editedVariant.isActive}
                            onChange={(e) =>
                              setEditedVariant({
                                ...editedVariant,
                                isActive: e.target.checked,
                              })
                            }
                          />
                          Active
                        </Label>
                      </div>
                    </div>
                    <DialogFooter className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        onClick={() => {
                          onUpdateVariant?.(editedVariant);
                          setIsEditDialogOpen(false);
                        }}
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this variant? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteVariant?.(currentVariant.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
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
                {metrics.changeCount} change{metrics.changeCount > 1 ? "s" : ""}{" "}
                •{" "}
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
              Discard Changes
            </Button>

            {loadedVariantName ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setUpdateVariantDialogOpen(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Variant
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as New Variant
                </Button>
                <Button className="flex-1" onClick={handleUpdateOriginal}>
                  Update Original Recipe
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
