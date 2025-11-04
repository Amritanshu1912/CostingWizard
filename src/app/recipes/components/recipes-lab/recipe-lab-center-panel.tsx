import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Edit3 } from "lucide-react";
import { RecipeLabIngredientCard } from "./recipe-lab-ingredient-card";
import type { ExperimentIngredient } from "@/hooks/use-recipe-experiment";
import type { SupplierMaterialWithDetails } from "@/lib/types";

interface CenterPanelProps {
  selectedRecipeName: string;
  loadedVariantName: string | null;
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
}

export function CenterPanel({
  selectedRecipeName,
  loadedVariantName,
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
}: CenterPanelProps) {
  return (
    <Card className="flex-1 flex flex-col py-2">
      <div className="p-4 border-b flex items-center justify-between">
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
