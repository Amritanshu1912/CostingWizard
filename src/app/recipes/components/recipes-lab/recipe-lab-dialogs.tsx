// src/app/recipes/components/recipes-lab/recipe-lab-dialogs.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExperimentIngredient } from "@/hooks/use-recipe-experiment";
import type { OptimizationGoalType } from "@/types/shared-types";
import type { SupplierMaterialRow } from "@/types/material-types";
import { Edit3, GitBranch, TrendingDown } from "lucide-react";

interface RecipeLabDialogsProps {
  saveDialogOpen: boolean;
  updateVariantDialogOpen: boolean;
  recipeName: string;
  loadedVariantName: string | null;
  variantName: string;
  variantDescription: string;
  optimizationGoal: OptimizationGoalType;
  experimentIngredients: ExperimentIngredient[];
  supplierMaterials: SupplierMaterialRow[];
  savings: number;
  savingsPercent: number;
  onSaveDialogOpenChange: (open: boolean) => void;
  onUpdateDialogOpenChange: (open: boolean) => void;
  onVariantNameChange: (name: string) => void;
  onVariantDescriptionChange: (description: string) => void;
  onOptimizationGoalChange: (goal: OptimizationGoalType) => void;
  onSaveVariant: () => void;
  onUpdateVariant: () => void;
}

function ChangeSummary({
  experimentIngredients,
  supplierMaterials,
  savings,
  savingsPercent,
}: {
  experimentIngredients: ExperimentIngredient[];
  supplierMaterials: SupplierMaterialRow[];
  savings: number;
  savingsPercent: number;
}) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border">
      <p className="text-sm font-semibold mb-3">Changes Summary</p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
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
                className="text-sm text-slate-700 flex items-start gap-2"
              >
                <span className="text-slate-400">•</span>
                <div>
                  <span className="font-medium">
                    {sm?.materialName || "Unknown"}:
                  </span>{" "}
                  {changeTypes.includes("quantity") && (
                    <span>
                      Qty {ing._originalQuantity} → {ing.quantity}
                    </span>
                  )}
                  {changeTypes.includes("quantity") &&
                    changeTypes.includes("supplier") &&
                    ", "}
                  {changeTypes.includes("supplier") && (
                    <span>Supplier switched</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <div className="mt-3 pt-3 border-t">
        <p className="text-base font-semibold text-green-600">
          Total Savings: ₹{savings.toFixed(2)}/kg ({savingsPercent.toFixed(1)}%)
        </p>
      </div>
    </div>
  );
}

export function RecipeLabDialogs({
  saveDialogOpen,
  updateVariantDialogOpen,
  recipeName,
  loadedVariantName,
  variantName,
  variantDescription,
  optimizationGoal,
  experimentIngredients,
  supplierMaterials,
  savings,
  savingsPercent,
  onSaveDialogOpenChange,
  onUpdateDialogOpenChange,
  onVariantNameChange,
  onVariantDescriptionChange,
  onOptimizationGoalChange,
  onSaveVariant,
  onUpdateVariant,
}: RecipeLabDialogsProps) {
  return (
    <>
      {/* Save Variant Dialog */}
      <AlertDialog open={saveDialogOpen} onOpenChange={onSaveDialogOpenChange}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {loadedVariantName ? "Save as New Variant" : "Save as Variant"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {loadedVariantName
                ? `Create a new variant based on "${loadedVariantName}"`
                : `Create a new variant of "${recipeName}"`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="variant-name">Variant Name *</Label>
              <Input
                id="variant-name"
                value={variantName}
                onChange={(e) => onVariantNameChange(e.target.value)}
                placeholder="e.g., Cost Optimized V1"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="variant-description">Description</Label>
              <Textarea
                id="variant-description"
                value={variantDescription}
                onChange={(e) => onVariantDescriptionChange(e.target.value)}
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
                  onOptimizationGoalChange(v as OptimizationGoalType)
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

            <ChangeSummary
              experimentIngredients={experimentIngredients}
              supplierMaterials={supplierMaterials}
              savings={savings}
              savingsPercent={savingsPercent}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSaveVariant}>
              {loadedVariantName ? "Save as New Variant" : "Save as Variant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Variant Dialog */}
      <AlertDialog
        open={updateVariantDialogOpen}
        onOpenChange={onUpdateDialogOpenChange}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Update Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Update the currently loaded variant &quot;{loadedVariantName}
              &quot; with your changes
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <ChangeSummary
              experimentIngredients={experimentIngredients}
              supplierMaterials={supplierMaterials}
              savings={savings}
              savingsPercent={savingsPercent}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onUpdateVariant}>
              Update Variant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
