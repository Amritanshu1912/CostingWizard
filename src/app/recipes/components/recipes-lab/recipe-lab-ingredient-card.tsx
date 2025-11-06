// components/recipes/recipes-lab/recipe-lab-ingredient-card.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Unlock, Trash2, RotateCcw } from "lucide-react";
import type {
  RecipeIngredient,
  SupplierMaterialWithDetails,
  CapacityUnit,
} from "@/lib/types";
import { recipeCalculator } from "@/hooks/use-recipes";

interface ExperimentIngredient extends RecipeIngredient {
  _changed?: boolean;
  _changeTypes?: Set<"quantity" | "supplier">;
  _originalQuantity?: number;
  _originalSupplierId?: string;
}

interface RecipeLabIngredientCardProps {
  ingredient: ExperimentIngredient;
  index: number;
  supplierMaterial: SupplierMaterialWithDetails | undefined;
  alternatives: SupplierMaterialWithDetails[];
  isExpanded: boolean;
  onQuantityChange: (index: number, quantity: number) => void;
  onSupplierChange: (index: number, supplierId: string) => void;
  onTogglePriceLock: (index: number) => void;
  onRemove: (index: number) => void;
  onReset: (index: number) => void;
  onToggleAlternatives: (ingredientId: string) => void;
}

export function RecipeLabIngredientCard({
  ingredient: ing,
  index,
  supplierMaterial: sm,
  alternatives,
  isExpanded,
  onQuantityChange,
  onSupplierChange,
  onTogglePriceLock,
  onRemove,
  onReset,
  onToggleAlternatives,
}: RecipeLabIngredientCardProps) {
  const quantityInKg = recipeCalculator.normalizeToKg(ing.quantity, ing.unit);
  const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
  const cost = pricePerKg * quantityInKg;

  const quantityChanged = ing._changeTypes?.has("quantity");
  const supplierChanged = ing._changeTypes?.has("supplier");
  const hasAlternatives = alternatives.length > 0;

  return (
    <Card
      className={`p-3 transition-all ${
        ing._changed
          ? "border-l-4 border-l-primary bg-blue-50/30"
          : "border border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* 0. Serial Number (NEW) */}
        <div className="w-8 text-center text-sm font-medium text-slate-500">
          {index + 1}.
        </div>

        {/* 1. Material Name & Status Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm truncate">
              {sm?.material?.name || sm?.displayName || "Unknown Material"}
            </h4>
            {hasAlternatives && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                {alternatives.length} alt
              </Badge>
            )}
            {quantityChanged && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                Qty ↻
              </Badge>
            )}
            {supplierChanged && (
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
              >
                Supplier ↻
              </Badge>
            )}
          </div>
        </div>

        {/* 2. Supplier Selector */}
        <div className="w-64">
          {/* FIXED: Placeholder for "Was:" text to prevent vertical shift */}
          <div className="h-5">
            {supplierChanged && ing._originalSupplierId && (
              <p className="text-xs text-muted-foreground mb-1">
                Was:{" "}
                {alternatives.find((a) => a.id === ing._originalSupplierId)
                  ?.supplier?.name ||
                  sm?.supplier?.name ||
                  "Unknown"}
              </p>
            )}
          </div>
          <Select
            value={ing.supplierMaterialId}
            onValueChange={(value) => onSupplierChange(index, value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium truncate">
                    {sm?.supplier?.name || "Select"}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ₹{sm?.unitPrice.toFixed(2)}/{sm?.unit}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {/* Current Supplier */}
              <SelectItem value={ing.supplierMaterialId}>
                <div className="flex items-center justify-between w-full min-w-[280px]">
                  <div>
                    <p className="font-medium">{sm?.supplier?.name}</p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-sm">
                      ₹{sm?.unitPrice.toFixed(2)}/{sm?.unit}
                    </p>
                    {sm?.moq && (
                      <p className="text-xs text-muted-foreground">
                        MOQ: {sm.moq}
                      </p>
                    )}
                  </div>
                </div>
              </SelectItem>

              {/* Alternatives */}
              {hasAlternatives && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t">
                    Alternatives ({alternatives.length})
                  </div>
                  {alternatives.map((alt) => {
                    const saving = sm ? sm.unitPrice - alt.unitPrice : 0;
                    const isExpensive = saving < 0;

                    return (
                      <SelectItem key={alt.id} value={alt.id}>
                        <div className="flex items-center justify-between w-full min-w-[280px]">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {alt.supplier?.name}
                            </p>
                            {alt.availability !== "in-stock" && (
                              <p className="text-xs text-red-600">
                                {alt.availability === "out-of-stock"
                                  ? "Out of Stock"
                                  : "Limited"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className="text-right">
                              <p className="font-semibold text-sm">
                                ₹{alt.unitPrice.toFixed(2)}/{alt.unit}
                              </p>
                              {alt.moq && (
                                <p className="text-xs text-muted-foreground">
                                  MOQ: {alt.moq}
                                </p>
                              )}
                            </div>
                            {Math.abs(saving) > 0.01 && (
                              <Badge
                                className={`text-xs ${
                                  isExpensive ? "bg-red-600" : "bg-green-600"
                                } text-white`}
                              >
                                {isExpensive ? "+" : "-"}₹
                                {Math.abs(saving).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Quantity Input */}
        <div className="w-32">
          {/* FIXED: Placeholder for "Was:" text to prevent vertical shift */}
          <div className="h-5">
            {quantityChanged && ing._originalQuantity !== undefined && (
              <p className="text-xs text-muted-foreground mb-1">
                Was: {ing._originalQuantity.toFixed(2)} {ing.unit}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={ing.quantity.toFixed(2)}
              onChange={(e) => onQuantityChange(index, Number(e.target.value))}
              className="h-9 text-sm text-center"
              step="0.1"
              min="0"
            />
            <span className="text-xs text-muted-foreground w-8">
              {ing.unit}
            </span>
          </div>
        </div>

        {/* 4. Cost Display */}
        <div className="w-32 text-right">
          <div className="flex items-center justify-end gap-1">
            <div>
              <p className="text-base font-bold">₹{cost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                @₹{pricePerKg.toFixed(2)}/kg
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onTogglePriceLock(index)}
              title={ing.lockedPricing ? "Unlock price" : "Lock price"}
            >
              {ing.lockedPricing ? (
                <Lock className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* 5. Action Buttons */}
        <div className="flex items-center gap-1">
          {/* FIXED: Reset button is now always rendered but invisible to prevent horizontal shift */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 transition-opacity ${
              ing._changed ? "opacity-100" : "opacity-0 invisible"
            }`}
            onClick={() => onReset(index)}
            title="Reset changes"
            disabled={!ing._changed}
          >
            <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(index)}
            title="Remove ingredient"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
