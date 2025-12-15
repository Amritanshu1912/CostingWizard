// src/app/recipes/components/recipes-lab/recipe-lab-ingredient-card.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ExperimentIngredient,
  SupplierMaterialForRecipe,
} from "@/types/recipe-types";
import { normalizeToKg } from "@/utils/unit-conversion-utils";
import { Lock, RotateCcw, Trash2, Unlock } from "lucide-react";

interface RecipeLabIngredientCardProps {
  ingredient: ExperimentIngredient;
  index: number;
  supplierMaterial: SupplierMaterialForRecipe | undefined;
  alternatives: SupplierMaterialForRecipe[];
  onQuantityChange: (index: number, quantity: number) => void;
  onSupplierChange: (index: number, supplierId: string) => void;
  onTogglePriceLock: (index: number) => void;
  onRemove: (index: number) => void;
  onReset: (index: number) => void;
}

/**
 * Recipe Lab Ingredient Card Component
 * Props: Display data + handlers (pure UI component) *
 * UTILITY FUNCTION NOTE: normalizeToKg used here - extract to utils
 */
export function RecipeLabIngredientCard({
  ingredient: ing,
  index,
  supplierMaterial: sm,
  alternatives,
  onQuantityChange,
  onSupplierChange,
  onTogglePriceLock,
  onRemove,
  onReset,
}: RecipeLabIngredientCardProps) {
  // UTILITY FUNCTION CANDIDATE - normalizeToKg
  const quantityInKg = normalizeToKg(ing.quantity, ing.unit);

  const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
  const cost = pricePerKg * quantityInKg;

  const hasAlternatives = alternatives.length > 0;

  const quantityIsDifferent =
    ing._changeTypes?.has("quantity") && ing.quantity !== ing._originalQuantity;

  const supplierIsDifferent =
    ing._changeTypes?.has("supplier") &&
    ing.supplierMaterialId !== ing._originalSupplierId;

  return (
    <Card
      className={`p-3 transition-all ${
        ing._changed
          ? "border-l-4 border-l-blue-500 bg-blue-50/30"
          : "border border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Serial Number */}
        <div className="w-6 text-center text-sm font-medium text-slate-500">
          {index + 1}.
        </div>

        {/* Material Name & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm truncate">
              {sm?.materialName || "Unknown Material"}
            </h4>
            {hasAlternatives && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                {alternatives.length} alt
              </Badge>
            )}
            {quantityIsDifferent && (
              <Badge
                variant="outline"
                className="text-xs font-normal bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
              >
                Qty
                <RotateCcw className="h-2.5 w-2.5" />
              </Badge>
            )}
            {supplierIsDifferent && (
              <Badge
                variant="outline"
                className="text-xs font-normal bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
              >
                Supplier
                <RotateCcw className="h-2.5 w-2.5" />
              </Badge>
            )}
          </div>
        </div>

        {/* Supplier Selector */}
        <div className="w-64">
          <Select
            value={ing.supplierMaterialId}
            onValueChange={(value) => onSupplierChange(index, value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium truncate">
                    {sm?.supplierName || "Select"}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ₹{sm?.unitPrice.toFixed(2)}/{sm?.capacityUnit}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {/* Current Supplier */}
              <SelectItem value={ing.supplierMaterialId}>
                <div className="flex items-center justify-between w-full min-w-[280px]">
                  <div>
                    <p className="font-medium">{sm?.supplierName}</p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-sm">
                      ₹{sm?.unitPrice.toFixed(2)}/{sm?.capacityUnit}
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
                              {alt.supplierName}
                            </p>
                            {alt.stockStatus !== "in-stock" && (
                              <p className="text-xs text-red-600">
                                {alt.stockStatus === "out-of-stock"
                                  ? "Out of Stock"
                                  : "Limited"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className="text-right">
                              <p className="font-semibold text-sm">
                                ₹{alt.unitPrice.toFixed(2)}/{alt.capacityUnit}
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

        {/* Quantity Input */}
        <div className="w-32">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={ing.quantity.toFixed(2)}
              onChange={(e) => onQuantityChange(index, Number(e.target.value))}
              className="h-9 text-sm text-center"
              step="1"
              min="0"
            />
            <span className="text-xs text-muted-foreground w-8">
              {ing.unit}
            </span>
          </div>
        </div>

        {/* Cost Display */}
        <div className="w-[97px] text-right ml-2">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 transition-opacity ${
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
            className="h-6 w-6"
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
