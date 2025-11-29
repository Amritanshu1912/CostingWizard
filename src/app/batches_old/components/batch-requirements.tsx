// src/app/batches/components/batch-requirements.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import { calculateBatchRequirements } from "@/hooks/use-batches";
import { db } from "@/lib/db";
import type {
  BatchRequirementsAnalysis,
  ProductionBatch,
  RequirementItem,
} from "@/lib/types";
import {
  AlertCircle,
  Building2,
  FlaskConical,
  Package,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { calculateUnits, normalizeToKg } from "@/hooks/use-unit-conversion";

// Product-wise procurement breakdown
interface VariantProcurement {
  variantId: string;
  variantName: string;
  fillQuantity: number;
  fillUnit: string;
  units: number;
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalCost: number;
}

interface ProductProcurement {
  productId: string;
  productName: string;
  variants: VariantProcurement[];
  totalCost: number;
}

async function calculateProductWiseProcurement(
  batch: ProductionBatch
): Promise<ProductProcurement[]> {
  const productMap = new Map<string, ProductProcurement>();

  for (const item of batch.items) {
    const product = await db.products.get(item.productId);
    if (!product) continue;

    const procurement: ProductProcurement = {
      productId: item.productId,
      productName: product.name,
      variants: [],
      totalCost: 0,
    };

    for (const variantItem of item.variants) {
      const variant = await db.productVariants.get(variantItem.variantId);
      if (!variant) continue;

      const units = calculateUnits(
        variant.fillQuantity,
        variant.fillUnit,
        variantItem.totalFillQuantity,
        variantItem.fillUnit
      );

      if (units === 0) continue;

      const fillQtyInKg = normalizeToKg(
        variantItem.totalFillQuantity,
        variantItem.fillUnit
      );

      const variantProcurement: VariantProcurement = {
        variantId: variant.id,
        variantName: variant.name,
        fillQuantity: variantItem.totalFillQuantity,
        fillUnit: variantItem.fillUnit,
        units,
        materials: [],
        packaging: [],
        labels: [],
        totalCost: 0,
      };

      // Calculate materials for this variant
      const recipeId = product.isRecipeVariant
        ? (await db.recipeVariants.get(product.recipeId))?.originalRecipeId
        : product.recipeId;

      if (recipeId) {
        const ingredients = await db.recipeIngredients
          .where("recipeId")
          .equals(recipeId)
          .toArray();

        for (const ing of ingredients) {
          const sm = await db.supplierMaterials.get(ing.supplierMaterialId);
          if (!sm) continue;

          const material = await db.materials.get(sm.materialId);
          const supplier = await db.suppliers.get(sm.supplierId);

          const ingQtyInKg = normalizeToKg(ing.quantity, ing.unit);
          const requiredQty = ingQtyInKg * fillQtyInKg;
          const costWithTax = requiredQty * sm.unitPrice * (1 + sm.tax / 100);

          variantProcurement.materials.push({
            itemType: "material",
            itemId: sm.id,
            itemName: material?.name || "Unknown",
            supplierId: sm.supplierId,
            supplierName: supplier?.name || "Unknown",
            required: requiredQty,
            available: 0,
            shortage: requiredQty,
            unit: sm.unit,
            unitPrice: sm.unitPrice,
            tax: sm.tax,
            totalCost: costWithTax,
          });
          variantProcurement.totalCost += costWithTax;
        }
      }

      // Calculate packaging for this variant
      const packaging = await db.supplierPackaging.get(
        variant.packagingSelectionId
      );
      if (packaging) {
        const packagingDef = await db.packaging.get(packaging.packagingId);
        const supplier = await db.suppliers.get(packaging.supplierId);
        const costWithTax =
          units * packaging.unitPrice * (1 + (packaging.tax || 0) / 100);

        variantProcurement.packaging.push({
          itemType: "packaging",
          itemId: packaging.id,
          itemName: packagingDef?.name || "Unknown",
          supplierId: packaging.supplierId,
          supplierName: supplier?.name || "Unknown",
          required: units,
          available: 0,
          shortage: units,
          unit: "pcs",
          unitPrice: packaging.unitPrice,
          tax: packaging.tax || 0,
          totalCost: costWithTax,
        });
        variantProcurement.totalCost += costWithTax;
      }

      // Calculate labels for this variant
      if (variant.frontLabelSelectionId) {
        const label = await db.supplierLabels.get(
          variant.frontLabelSelectionId
        );
        if (label) {
          const labelDef = label.labelId
            ? await db.labels.get(label.labelId)
            : null;
          const supplier = await db.suppliers.get(label.supplierId);
          const costWithTax =
            units * label.unitPrice * (1 + (label.tax || 0) / 100);

          variantProcurement.labels.push({
            itemType: "label",
            itemId: label.id,
            itemName: labelDef?.name || "Front Label",
            supplierId: label.supplierId,
            supplierName: supplier?.name || "Unknown",
            required: units,
            available: 0,
            shortage: units,
            unit: label.unit,
            unitPrice: label.unitPrice,
            tax: label.tax || 0,
            totalCost: costWithTax,
          });
          variantProcurement.totalCost += costWithTax;
        }
      }

      // Add back label if exists
      if (variant.backLabelSelectionId) {
        const label = await db.supplierLabels.get(variant.backLabelSelectionId);
        if (label) {
          const labelDef = label.labelId
            ? await db.labels.get(label.labelId)
            : null;
          const supplier = await db.suppliers.get(label.supplierId);
          const costWithTax =
            units * label.unitPrice * (1 + (label.tax || 0) / 100);

          variantProcurement.labels.push({
            itemType: "label",
            itemId: label.id,
            itemName: labelDef?.name || "Back Label",
            supplierId: label.supplierId,
            supplierName: supplier?.name || "Unknown",
            required: units,
            available: 0,
            shortage: units,
            unit: label.unit,
            unitPrice: label.unitPrice,
            tax: label.tax || 0,
            totalCost: costWithTax,
          });
          variantProcurement.totalCost += costWithTax;
        }
      }

      procurement.variants.push(variantProcurement);
      procurement.totalCost += variantProcurement.totalCost;
    }

    if (procurement.variants.length > 0) {
      productMap.set(item.productId, procurement);
    }
  }

  return Array.from(productMap.values());
}

interface BatchRequirementsProps {
  batch: ProductionBatch;
  requirements: BatchRequirementsAnalysis; // Add this line
}

export function BatchRequirements({
  batch,
  requirements,
}: BatchRequirementsProps) {
  // const [analysis, setAnalysis] = useState<BatchRequirementsAnalysis | null>(
  //   null
  // );
  const [productProcurement, setProductProcurement] = useState<
    ProductProcurement[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductProcurement = async () => {
      setLoading(true);
      try {
        const productWise = await calculateProductWiseProcurement(batch);
        setProductProcurement(productWise);
      } catch (error) {
        console.error("Error calculating product procurement:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductProcurement();
  }, [batch, batch.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Calculating product breakdown...
          </p>
        </div>
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Unable to calculate requirements
      </div>
    );
  }

  const hasShortages = requirements.criticalShortages.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Total Items
            </div>
            <div className="text-2xl font-bold">
              {requirements.totalItemsToOrder}
            </div>
            <div className="text-xs text-muted-foreground">to procure</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
            <div className="text-2xl font-bold">
              ₹{requirements.totalCost.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">procurement</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Suppliers</div>
            <div className="text-2xl font-bold">
              {requirements.bySupplier.length}
            </div>
            <div className="text-xs text-muted-foreground">to contact</div>
          </CardContent>
        </Card>

        <Card
          className={
            hasShortages
              ? "border-red-200 dark:border-red-900"
              : "border-green-200 dark:border-green-900"
          }
        >
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Shortages</div>
            <div
              className={`text-2xl font-bold ${
                hasShortages ? "text-red-600" : "text-green-600"
              }`}
            >
              {requirements.criticalShortages.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {hasShortages ? "items short" : "all available"}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Shortages Alert */}
      {hasShortages && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-1">
                  Critical Shortages Detected
                </h4>
                <p className="text-xs text-red-800 dark:text-red-200">
                  {requirements.criticalShortages.length} items are currently
                  out of stock. Production cannot start until these are
                  procured.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Materials Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="h-5 w-5" />
            Materials (Recipe Ingredients)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.materials.length > 0 ? (
            <div className="space-y-2">
              {requirements.materials.map((item) => (
                <RequirementItemRow
                  key={`material-${item.itemId}-${item.supplierId}`}
                  item={item}
                />
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Total Materials Cost
                </span>
                <div className="text-right">
                  <div className="font-bold">
                    ₹{requirements.totalMaterialCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">incl. tax</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No materials required
            </p>
          )}
        </CardContent>
      </Card>
      {/* Packaging Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Packaging
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.packaging.length > 0 ? (
            <div className="space-y-2">
              {requirements.packaging.map((item) => (
                <RequirementItemRow
                  key={`packaging-${item.itemId}-${item.supplierId}`}
                  item={item}
                />
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Total Packaging Cost
                </span>
                <div className="text-right">
                  <div className="font-bold">
                    ₹{requirements.totalPackagingCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">incl. tax</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No packaging required
            </p>
          )}
        </CardContent>
      </Card>
      {/* Labels Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-5 w-5" />
            Labels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.labels.length > 0 ? (
            <div className="space-y-2">
              {requirements.labels.map((item) => (
                <RequirementItemRow
                  key={`label-${item.itemId}-${item.supplierId}`}
                  item={item}
                />
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-sm">Total Labels Cost</span>
                <div className="text-right">
                  <div className="font-bold">
                    ₹{requirements.totalLabelCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">incl. tax</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No labels required
            </p>
          )}
        </CardContent>
      </Card>
      {/* Supplier-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" />
            Supplier-wise Procurement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements.bySupplier.map((supplier) => (
              <div key={supplier.supplierId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{supplier.supplierName}</h4>
                  <div className="text-right">
                    <div className="font-bold">
                      ₹{supplier.totalCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {supplier.materials.length +
                        supplier.packaging.length +
                        supplier.labels.length}{" "}
                      items
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {supplier.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Materials ({supplier.materials.length})
                      </p>
                      {supplier.materials.map((item) => (
                        <div
                          key={`supplier-material-${supplier.supplierId}-${item.itemId}`}
                          className="text-xs flex justify-between py-1"
                        >
                          <span>{item.itemName}</span>
                          <span>
                            {item.required.toFixed(2)} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {supplier.packaging.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Packaging ({supplier.packaging.length})
                      </p>
                      {supplier.packaging.map((item) => (
                        <div
                          key={`supplier-packaging-${supplier.supplierId}-${item.itemId}`}
                          className="text-xs flex justify-between py-1"
                        >
                          <span>{item.itemName}</span>
                          <span>
                            {item.required} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {supplier.labels.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Labels ({supplier.labels.length})
                      </p>
                      {supplier.labels.map((item) => (
                        <div
                          key={`supplier-label-${supplier.supplierId}-${item.itemId}`}
                          className="text-xs flex justify-between py-1"
                        >
                          <span>{item.itemName}</span>
                          <span>
                            {item.required} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product-wise Procurement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Product-wise Procurement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {productProcurement.map((product) => (
              <div key={product.productId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{product.productName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {product.variants.length} variant
                      {product.variants.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ₹{product.totalCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      total cost
                    </div>
                  </div>
                </div>

                {/* Variants breakdown */}
                <div className="space-y-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.variantId}
                      className="border-l-2 border-muted pl-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{variant.variantName}</h5>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            ₹{variant.totalCost.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {variant.units} units
                          </div>
                        </div>
                      </div>

                      {/* Materials for this variant */}
                      {variant.materials.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Materials ({variant.materials.length})
                          </p>
                          <div className="space-y-1">
                            {variant.materials.map((item) => (
                              <div
                                key={item.itemId}
                                className="text-xs flex justify-between py-1 px-2"
                              >
                                <span>{item.itemName}</span>
                                <span className="text-muted-foreground">
                                  {item.required.toFixed(2)} {item.unit} • ₹
                                  {item.totalCost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Packaging for this variant */}
                      {variant.packaging.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Packaging ({variant.packaging.length})
                          </p>
                          <div className="space-y-1">
                            {variant.packaging.map((item) => (
                              <div
                                key={item.itemId}
                                className="text-xs flex justify-between py-1 px-2"
                              >
                                <span>{item.itemName}</span>
                                <span className="text-muted-foreground">
                                  {item.required} {item.unit} • ₹
                                  {item.totalCost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Labels for this variant */}
                      {variant.labels.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Labels ({variant.labels.length})
                          </p>
                          <div className="space-y-1">
                            {variant.labels.map((item) => (
                              <div
                                key={item.itemId}
                                className="text-xs flex justify-between py-1 px-2"
                              >
                                <span>{item.itemName}</span>
                                <span className="text-muted-foreground">
                                  {item.required} {item.unit} • ₹
                                  {item.totalCost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Cost Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Materials</span>
                <span className="font-medium">
                  ₹{requirements.totalMaterialCost.toFixed(2)} (
                  {(
                    (requirements.totalMaterialCost / requirements.totalCost) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (requirements.totalMaterialCost / requirements.totalCost) *
                  100
                }
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Packaging</span>
                <span className="font-medium">
                  ₹{requirements.totalPackagingCost.toFixed(2)} (
                  {(
                    (requirements.totalPackagingCost / requirements.totalCost) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (requirements.totalPackagingCost / requirements.totalCost) *
                  100
                }
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Labels</span>
                <span className="font-medium">
                  ₹{requirements.totalLabelCost.toFixed(2)} (
                  {(
                    (requirements.totalLabelCost / requirements.totalCost) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (requirements.totalLabelCost / requirements.totalCost) * 100
                }
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Requirement Item Row Component
// Enhanced RequirementItemRow component
function RequirementItemRow({ item }: { item: RequirementItem }) {
  const hasShortage = item.shortage > 0;
  const orderCost = item.shortage * item.unitPrice * (1 + item.tax / 100);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        hasShortage
          ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20"
          : "bg-muted/30"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              hasShortage ? "bg-red-600" : "bg-green-600"
            }`}
          />
          <span className="font-medium text-sm truncate">{item.itemName}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {item.supplierName}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {/* Total Required */}
        <div className="text-right">
          <div className="font-medium">
            {item.required.toFixed(2)} {item.unit}
          </div>
          <div className="text-muted-foreground">needed</div>
        </div>

        {/* Available in Inventory */}
        <div className="text-right">
          <div className="font-medium">
            {item.available.toFixed(2)} {item.unit}
          </div>
          <div className="text-muted-foreground">in stock</div>
        </div>

        {/* Shortage */}
        {hasShortage && (
          <div className="text-right">
            <div className="font-medium text-red-600">
              {item.shortage.toFixed(2)} {item.unit}
            </div>
            <div className="text-red-600">to order</div>
          </div>
        )}

        {/* Costs */}
        <div className="text-right min-w-[100px]">
          <div className="font-bold">₹{item.totalCost.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            @ ₹{item.unitPrice.toFixed(2)}/{item.unit}
          </div>
          {hasShortage && (
            <div className="text-xs text-red-600">
              Order: ₹{orderCost.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
