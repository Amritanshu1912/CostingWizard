import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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

// Reuse from use-recipes
function normalizeToKg(quantity: number, unit: CapacityUnit): number {
  const conversions: Record<string, number> = {
    kg: 1,
    gm: 0.001,
    g: 0.001,
    L: 1,
    ml: 0.001,
    pcs: 0.001,
  };
  return parseFloat((quantity * (conversions[unit] ?? 1)).toFixed(3));
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

  // Check what changed
  const quantityChanged = ing._changeTypes?.has("quantity");
  const supplierChanged = ing._changeTypes?.has("supplier");

  return (
    <Card
      className={`p-4 transition-all ${
        ing._changed
          ? "border-2 border-blue-500 shadow-sm"
          : "border border-slate-200"
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-row gap-4 min-w-0">
            <h4 className="font-semibold text-base truncate">
              {sm?.material?.name || sm?.displayName || "Unknown Material"}
            </h4>
            {alternatives.length > 0 && (
              <Badge
                variant="secondary"
                className="font-medium bg-green-300/50 text-green-700 text-xs"
              >
                {alternatives.length} Alternative
                {alternatives.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {quantityChanged && (
              <Badge variant="secondary" className="text-xs">
                Qty Changed
              </Badge>
            )}
            {supplierChanged && (
              <Badge variant="secondary" className="text-xs">
                Supplier Changed
              </Badge>
            )}
            {ing._changed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onReset(index)}
                title="Reset changes"
              >
                <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onRemove(index)}
              title="Remove ingredient"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Supplier Selector */}
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Supplier</Label>
            <Select
              value={ing.supplierMaterialId}
              onValueChange={(value) => onSupplierChange(index, value)}
            >
              <SelectTrigger className="w-full h-9 mt-1">
                <SelectValue>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium truncate">
                      {sm?.supplier?.name || "Select supplier"}
                    </span>
                    <span className="text-muted-foreground text-xs ml-2 flex-shrink-0">
                      ₹{sm?.unitPrice.toFixed(2)}/{sm?.unit}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ing.supplierMaterialId}>
                  <div className="flex items-center justify-between w-full min-w-[300px]">
                    <div>
                      <p className="font-medium">{sm?.supplier?.name}</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">
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

                {alternatives.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t">
                      Alternatives ({alternatives.length})
                    </div>
                    {alternatives.map((alt) => {
                      const saving = sm ? sm.unitPrice - alt.unitPrice : 0;
                      const isExpensive = saving < 0;

                      return (
                        <SelectItem key={alt.id} value={alt.id}>
                          <div className="flex items-center justify-between w-full min-w-[300px]">
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
                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="font-semibold">
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
            {supplierChanged && ing._originalSupplierId && sm && (
              <p className="text-xs text-muted-foreground mt-1">
                Original:{" "}
                {alternatives.find((a) => a.id === ing._originalSupplierId)
                  ?.supplier?.name || "Unknown"}
              </p>
            )}
          </div>

          {/* Quantity & Cost */}

          <div className="">
            <Label className="text-xs text-muted-foreground">Quantity</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={ing.quantity.toFixed(2)}
                onChange={(e) =>
                  onQuantityChange(index, Number(e.target.value))
                }
                className="h-9"
                step="1"
                min="0"
              />
              <span className="text-sm text-muted-foreground min-w-[35px]">
                {ing.unit}
              </span>
            </div>
            {quantityChanged && ing._originalQuantity !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Original: {ing._originalQuantity.toFixed(2)} {ing.unit}
              </p>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Cost</Label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-bold">₹{cost.toFixed(2)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
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
        </div>
      </div>
    </Card>
  );
}
