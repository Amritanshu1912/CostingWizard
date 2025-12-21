// src/app/recipes/components/recipe-views/recipe-detail-header.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RecipeDetail } from "@/types/recipe-types";
import { formatDate } from "@/utils/formatting-utils";
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Save,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";
import { getStatusColors } from "../recipe-colors";

interface RecipeDetailHeaderProps {
  recipe: RecipeDetail | null;
  isEditMode: boolean;
  isCreatingNew: boolean;

  // Computed metrics (passed from parent or calculated)
  totalWeight: number;
  totalCost: number;
  taxedTotalCost: number;
  costPerKg: number;
  taxedCostPerKg: number;
  varianceFromTarget?: number;
  variancePercentage?: number;

  // Edit state
  editedName: string;
  editedDescription: string;
  editedTargetCost: number | undefined;
  editedStatus: "draft" | "testing" | "active" | "archived" | "discontinued";
  editedVersion: number | undefined;

  // Handlers
  onEdit: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTargetCostChange: (value: number | undefined) => void;
  onStatusChange: (
    value: "draft" | "testing" | "active" | "archived" | "discontinued"
  ) => void;
  onVersionChange: (value: number | undefined) => void;
}

/**
 * Recipe detail header component
 */
export function RecipeDetailHeader({
  recipe,
  isEditMode,
  isCreatingNew,
  totalWeight,
  totalCost,
  taxedTotalCost,
  costPerKg,
  taxedCostPerKg,
  varianceFromTarget,
  variancePercentage,
  editedName,
  editedDescription,
  editedTargetCost,
  editedStatus,
  editedVersion,
  onEdit,
  onDelete,
  onCancelEdit,
  onSave,
  onNameChange,
  onDescriptionChange,
  onTargetCostChange,
  onStatusChange,
  onVersionChange,
}: RecipeDetailHeaderProps) {
  const statusColors = getStatusColors(
    isEditMode ? editedStatus : recipe?.status || "draft"
  );

  return (
    <div className="p-6 bg-gradient-to-r from-bg-primary-500 to-white">
      {/* ===== Title & Actions ===== */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditMode ? (
            // EDIT MODE
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipe-name">Recipe Name *</Label>
                <Input
                  id="recipe-name"
                  value={editedName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="text-2xl font-bold h-auto py-2 mb-2"
                  placeholder="e.g., Premium Floor Cleaner"
                />
              </div>
              <div>
                <Label htmlFor="recipe-description">Description</Label>
                <Textarea
                  id="recipe-description"
                  value={editedDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Brief description of the recipe"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="w-32">
                  <Label htmlFor="recipe-status">Status</Label>
                  <Select value={editedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
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
                      onTargetCostChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="recipe-version">
                    Version{" "}
                    <span className="text-xs text-slate-500">
                      (empty = auto)
                    </span>
                  </Label>
                  <Input
                    id="recipe-version"
                    type="number"
                    value={editedVersion || ""}
                    onChange={(e) =>
                      onVersionChange(
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
            // VIEW MODE
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {recipe?.name || "No Recipe Selected"}
              </h2>
              {recipe?.description && (
                <p className="text-sm text-slate-600 mb-2">
                  {recipe.description}
                </p>
              )}
              {recipe && (
                <div className="flex items-center gap-3">
                  <Badge className={`${statusColors.badge} border`}>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} mr-1`}
                    />
                    {recipe.status}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    Version {recipe.version || 1}
                  </span>
                  <span className="text-sm text-slate-500">
                    • {formatDate(recipe.updatedAt || recipe.createdAt)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        {recipe && (
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
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
        )}
      </div>

      {/* ===== Key Metrics (Always Visible) ===== */}
      {(recipe || isCreatingNew) && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {/* Composition Weight */}
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Composition Weight</p>
              <p className="text-xl font-bold text-slate-900">
                {totalWeight ? `${totalWeight.toFixed(0)}g` : "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Auto-calculated from ingredients
              </p>
            </div>

            {/* Cost of Composition */}
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Cost of Composition</p>
              <p className="text-xl font-bold text-slate-900">
                ₹{totalCost?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                For {totalWeight?.toFixed(0) || 0}gms
                {taxedTotalCost > 0 && (
                  <span className="block text-xs text-slate-400">
                    With tax: ₹{taxedTotalCost.toFixed(2)}
                  </span>
                )}
              </p>
            </div>

            {/* Cost per kg */}
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Cost per kg</p>
              <p className="text-xl font-bold text-slate-900">
                ₹{costPerKg?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                For 1000gms
                {taxedCostPerKg > 0 && (
                  <span className="block text-xs text-slate-400">
                    With tax: ₹{taxedCostPerKg.toFixed(2)}/kg
                  </span>
                )}
              </p>
            </div>

            {/* Target Cost & Variance */}
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Target Cost</p>
              <p className="text-xl font-bold text-slate-900">
                {isEditMode ? (
                  <>₹{editedTargetCost?.toFixed(2) || "Not set"}</>
                ) : (
                  <>₹{recipe?.targetCostPerKg?.toFixed(2) || "N/A"}</>
                )}
              </p>
              <p
                className={`text-xs mt-1 ${
                  varianceFromTarget && varianceFromTarget > 0
                    ? "text-red-600"
                    : varianceFromTarget && varianceFromTarget < 0
                      ? "text-green-600"
                      : "text-slate-900"
                }`}
              >
                Variance:{" "}
                {varianceFromTarget !== undefined
                  ? `${varianceFromTarget > 0 ? "+" : ""}₹${varianceFromTarget.toFixed(2)}`
                  : "N/A"}
                <span
                  className={`block text-xs ${
                    variancePercentage && variancePercentage > 0
                      ? "text-red-600"
                      : variancePercentage && variancePercentage < 0
                        ? "text-green-600"
                        : "text-slate-500"
                  }`}
                >
                  {variancePercentage !== undefined
                    ? `${variancePercentage > 0 ? "+" : ""}${variancePercentage.toFixed(1)}%`
                    : "No target set"}
                </span>
              </p>
            </div>
          </div>

          {/* ===== Target Progress (View Mode Only) ===== */}
          {!isEditMode && recipe?.targetCostPerKg && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Achievement
                </span>
                <div className="flex items-center gap-2">
                  {costPerKg <= recipe.targetCostPerKg ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      costPerKg <= recipe.targetCostPerKg
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.min(
                      (recipe.targetCostPerKg / costPerKg) * 100,
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(
                  (recipe.targetCostPerKg / costPerKg) * 100,
                  100
                )}
                className="h-2"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
