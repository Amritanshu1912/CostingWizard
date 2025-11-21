"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Tag,
  FlaskConical,
  AlertCircle,
  TrendingUp,
  Building2,
} from "lucide-react";
import { calculateBatchRequirements } from "@/hooks/use-batches";
import type {
  ProductionBatch,
  BatchRequirementsAnalysis,
  RequirementItem,
} from "@/lib/types";

interface BatchRequirementsProps {
  batch: ProductionBatch;
}

export function BatchRequirements({ batch }: BatchRequirementsProps) {
  const [analysis, setAnalysis] = useState<BatchRequirementsAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequirements();
  }, [batch.id]);

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const result = await calculateBatchRequirements(batch);
      setAnalysis(result);
    } catch (error) {
      console.error("Error calculating requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Calculating requirements...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Unable to calculate requirements
      </div>
    );
  }

  const hasShortages = analysis.criticalShortages.length > 0;

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
              {analysis.totalItemsToOrder}
            </div>
            <div className="text-xs text-muted-foreground">to procure</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
            <div className="text-2xl font-bold">
              ₹{(analysis.totalCost / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-muted-foreground">procurement</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Suppliers</div>
            <div className="text-2xl font-bold">
              {analysis.bySupplier.length}
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
              {analysis.criticalShortages.length}
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
                  {analysis.criticalShortages.length} items are currently out of
                  stock. Production cannot start until these are procured.
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
          {analysis.materials.length > 0 ? (
            <div className="space-y-2">
              {analysis.materials.map((item) => (
                <RequirementItemRow key={item.itemId} item={item} />
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Total Materials Cost
                </span>
                <span className="font-bold">
                  ₹{analysis.totalMaterialCost.toFixed(2)}
                </span>
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
          {analysis.packaging.length > 0 ? (
            <div className="space-y-2">
              {analysis.packaging.map((item) => (
                <RequirementItemRow key={item.itemId} item={item} />
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Total Packaging Cost
                </span>
                <span className="font-bold">
                  ₹{analysis.totalPackagingCost.toFixed(2)}
                </span>
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
          {analysis.labels.length > 0 ? (
            <div className="space-y-2">
              {analysis.labels.map((item) => (
                <RequirementItemRow key={item.itemId} item={item} />
              ))}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold text-sm">Total Labels Cost</span>
                <span className="font-bold">
                  ₹{analysis.totalLabelCost.toFixed(2)}
                </span>
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
            {analysis.bySupplier.map((supplier) => (
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
                          key={item.itemId}
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
                          key={item.itemId}
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
                          key={item.itemId}
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
                  ₹{analysis.totalMaterialCost.toFixed(2)} (
                  {(
                    (analysis.totalMaterialCost / analysis.totalCost) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={(analysis.totalMaterialCost / analysis.totalCost) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Packaging</span>
                <span className="font-medium">
                  ₹{analysis.totalPackagingCost.toFixed(2)} (
                  {(
                    (analysis.totalPackagingCost / analysis.totalCost) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={(analysis.totalPackagingCost / analysis.totalCost) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Labels</span>
                <span className="font-medium">
                  ₹{analysis.totalLabelCost.toFixed(2)} (
                  {(
                    (analysis.totalLabelCost / analysis.totalCost) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <Progress
                value={(analysis.totalLabelCost / analysis.totalCost) * 100}
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
function RequirementItemRow({ item }: { item: RequirementItem }) {
  const hasShortage = item.shortage > 0;

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
        <div className="text-right">
          <div className="font-medium">
            {item.required.toFixed(2)} {item.unit}
          </div>
          <div className="text-muted-foreground">needed</div>
        </div>

        {hasShortage && (
          <div className="text-right">
            <div className="font-medium text-red-600">
              {item.shortage.toFixed(2)} {item.unit}
            </div>
            <div className="text-red-600">to order</div>
          </div>
        )}

        <div className="text-right min-w-[80px]">
          <div className="font-bold">₹{item.totalCost.toFixed(2)}</div>
          <div className="text-muted-foreground">
            @ ₹{item.unitPrice.toFixed(2)}/{item.unit}
          </div>
        </div>
      </div>
    </div>
  );
}
