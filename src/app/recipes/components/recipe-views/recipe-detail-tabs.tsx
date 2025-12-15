// src/app/recipes/components/recipe-views/recipe-detail-tabs.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type {
  EditableIngredient,
  RecipeDetail,
  RecipeIngredientDetail,
  RecipeVariantWithMetrics,
  SupplierMaterialForRecipe,
} from "@/types/recipe-types";
import { formatDate } from "@/utils/formatting-utils";
import { formatQuantity } from "@/utils/unit-conversion-utils";
import {
  AlertCircle,
  Eye,
  FileText,
  Info,
  Lock,
  Package,
  Plus,
  Sparkles,
  Unlock,
  X,
} from "lucide-react";
import {
  RecipeCostDistributionChart,
  RecipeWeightDistributionChart,
} from "./recipe-view-charts";

interface RecipeDetailTabsProps {
  recipe: RecipeDetail | null;
  ingredients: RecipeIngredientDetail[];
  variants: RecipeVariantWithMetrics[];
  isEditMode: boolean;

  // Edit state for ingredients
  editedIngredients: EditableIngredient[];
  editedInstructions: string;
  editedNotes: string;

  // Material data for dropdowns
  materials: SupplierMaterialForRecipe[];
  materialsGroupedByMaterial: Map<string, SupplierMaterialForRecipe[]>;

  // Handlers
  onInstructionsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onIngredientChange: (
    index: number,
    field: keyof EditableIngredient,
    value: any
  ) => void;
  onTogglePriceLock: (index: number) => void;
}

/**
 * Recipe detail tabs component
 */
export function RecipeDetailTabs({
  recipe,
  ingredients,
  variants,
  isEditMode,
  editedIngredients,
  editedInstructions,
  editedNotes,
  materials,
  materialsGroupedByMaterial,
  onInstructionsChange,
  onNotesChange,
  onAddIngredient,
  onRemoveIngredient,
  onIngredientChange,
  onTogglePriceLock,
}: RecipeDetailTabsProps) {
  // Helper to get material name by ID
  const getMaterialName = (materialId: string) => {
    const material = materials.find((m) => m.materialId === materialId);
    return material?.materialName || "Unknown";
  };

  return (
    <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
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
        {/* ===== DETAILS TAB ===== */}
        <TabsContent value="details" className="p-6 mt-0">
          {isEditMode ? (
            // EDIT MODE
            <div className="space-y-4">
              <div>
                <Label htmlFor="instructions">Production Instructions</Label>
                <Textarea
                  id="instructions"
                  value={editedInstructions}
                  onChange={(e) => onInstructionsChange(e.target.value)}
                  placeholder="Step-by-step manufacturing instructions..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            // VIEW MODE
            <div className="space-y-6">
              {recipe?.instructions && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Production Instructions
                  </h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {recipe.instructions}
                  </p>
                </div>
              )}

              {/* Cost and Weight Distribution Charts */}
              <div className="grid grid-cols-2 gap-6">
                <RecipeCostDistributionChart ingredients={ingredients} />
                <RecipeWeightDistributionChart ingredients={ingredients} />
              </div>

              {/* Variants */}
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
                                    variant.isActive ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {variant.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <span
                                  className={`text-xs font-medium ${
                                    variant.costDifference < 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {variant.costDifference < 0 ? "-" : "+"}₹
                                  {Math.abs(variant.costDifference).toFixed(2)}
                                </span>
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

        {/* ===== INGREDIENTS TAB ===== */}
        <TabsContent value="ingredients" className="p-6 mt-0">
          {isEditMode ? (
            // EDIT MODE - Table
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
                      const sm = materials.find(
                        (s) => s.id === ing.supplierMaterialId
                      );
                      const pricePerKg =
                        ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;

                      // Convert quantity to kg for cost
                      const quantityInKg =
                        ing.unit === "kg"
                          ? ing.quantity
                          : ing.unit === "L"
                            ? ing.quantity
                            : ing.quantity / 1000;
                      const cost = pricePerKg * quantityInKg;

                      const availableSuppliers =
                        materialsGroupedByMaterial.get(
                          ing.selectedMaterialId || ""
                        ) || [];

                      return (
                        <TableRow key={ing.id}>
                          <TableCell>{index + 1}</TableCell>

                          {/* Material Selection */}
                          <TableCell>
                            <Select
                              value={ing.selectedMaterialId || ""}
                              onValueChange={(value) =>
                                onIngredientChange(
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
                                {Array.from(
                                  materialsGroupedByMaterial.keys()
                                ).map((materialId) => (
                                  <SelectItem
                                    key={materialId}
                                    value={materialId}
                                  >
                                    {getMaterialName(materialId)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Supplier Selection */}
                          <TableCell>
                            <Select
                              value={ing.supplierMaterialId}
                              onValueChange={(value) =>
                                onIngredientChange(
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

                          {/* Quantity */}
                          <TableCell>
                            <Input
                              type="number"
                              value={ing.quantity || ""}
                              onChange={(e) =>
                                onIngredientChange(
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

                          {/* Cost/Unit */}
                          <TableCell className="text-right text-muted-foreground">
                            ₹{pricePerKg.toFixed(2)}
                          </TableCell>

                          {/* Total Cost */}
                          <TableCell className="text-right font-medium">
                            ₹{cost.toFixed(2)}
                          </TableCell>

                          {/* Price Lock */}
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onTogglePriceLock(index)}
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

                          {/* Remove */}
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveIngredient(index)}
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
                onClick={onAddIngredient}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          ) : (
            // VIEW MODE - Cards
            <div className="space-y-3">
              {ingredients.map((ing) => {
                const displayQuantity = formatQuantity(ing.quantity, ing.unit);
                const getAvailabilityColors = (status: string) => {
                  if (status === "in-stock")
                    return "bg-green-100 text-green-800 border-green-200";
                  return "bg-red-100 text-red-800 border-red-200";
                };
                const availabilityText =
                  ing.stockStatus === "in-stock" ? "In Stock" : "Out of Stock";
                const taxRate = ing.lockedPricing
                  ? ing.lockedPricing.tax
                  : ing.pricePerKg || 0;

                return (
                  <Card key={ing.id} className="border-slate-200 py-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-900">
                              {ing.materialName}
                            </h4>
                            <Badge
                              className={`text-xs ${getAvailabilityColors(ing.stockStatus)}`}
                            >
                              {availabilityText}
                            </Badge>
                            {ing.priceChangedSinceLock && (
                              <div className="flex items-center gap-1 text-orange-600">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-xs">Price changed</span>
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
                                  {ing.lockedPricing.unitPrice.toFixed(2)}/kg
                                </span>
                                <span
                                  title={`Locked on ${formatDate(ing.lockedPricing.lockedAt)} | Reason: ${ing.lockedPricing.reason || "N/A"}`}
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
  );
}
