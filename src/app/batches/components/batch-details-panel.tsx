// components/batches/batch-details-panel.tsx (updated)
"use client";

import { useBatchOperations } from "@/hooks/use-batch-operations";
import { useBatchCostAnalysis, useBatchDetails } from "@/hooks/use-batches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertToDisplayUnit } from "@/hooks/use-unit-conversion";
import type { ProductionBatch } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Edit2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BatchAnalytics } from "./batch-analytics";
import { BatchForm } from "./batch-form";
import { BatchRequirements } from "./batch-requirements";

type ViewState =
  | { type: "VIEWING_BATCH" }
  | { type: "CREATING_BATCH" }
  | { type: "EDITING_BATCH" };

interface BatchDetailsPanelProps {
  batch: ProductionBatch | null;
  isCreating?: boolean;
  onBatchCreated?: (batch: ProductionBatch) => void;
  onBatchUpdated?: () => void;
  onBatchDeleted?: () => void;
}

export function BatchDetailsPanel({
  batch,
  isCreating = false,
  onBatchCreated,
  onBatchUpdated,
  onBatchDeleted,
}: BatchDetailsPanelProps) {
  const [viewState, setViewState] = useState<ViewState>({
    type: isCreating ? "CREATING_BATCH" : "VIEWING_BATCH",
  });

  const batchDetails = useBatchDetails(batch?.id || null);
  const costAnalysis = useBatchCostAnalysis(batch?.id || null);

  const { createBatch, updateBatch, deleteBatch } = useBatchOperations();

  useEffect(() => {
    if (isCreating) {
      setViewState({ type: "CREATING_BATCH" });
    } else if (batch) {
      setViewState({ type: "VIEWING_BATCH" });
    }
  }, [isCreating, batch]);

  const handleCreateBatch = async (
    batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => {
    const newBatch = await createBatch(batchData);
    setViewState({ type: "VIEWING_BATCH" });
    onBatchCreated?.(newBatch);
  };

  const handleUpdateBatch = async (
    batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!batch) return;
    await updateBatch(batch.id, batchData);
    setViewState({ type: "VIEWING_BATCH" });
    onBatchUpdated?.();
  };

  const handleDeleteBatch = async () => {
    if (!batch) return;
    if (!confirm(`Are you sure you want to delete "${batch.batchName}"?`))
      return;
    await deleteBatch(batch.id);
    onBatchDeleted?.();
  };

  // CREATE BATCH VIEW
  if (viewState.type === "CREATING_BATCH") {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Create New Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchForm
            onSave={handleCreateBatch}
            onCancel={() => setViewState({ type: "VIEWING_BATCH" })}
          />
        </CardContent>
      </Card>
    );
  }

  // EDIT BATCH VIEW
  if (viewState.type === "EDITING_BATCH" && batch) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Edit Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchForm
            initialBatch={batch}
            onSave={handleUpdateBatch}
            onCancel={() => setViewState({ type: "VIEWING_BATCH" })}
            onDelete={handleDeleteBatch}
          />
        </CardContent>
      </Card>
    );
  }

  // EMPTY STATE
  if (!batch) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <Calendar className="h-20 w-20 text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No batch selected
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select a batch from the list or create a new one
          </p>
          <Button onClick={() => setViewState({ type: "CREATING_BATCH" })}>
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Determine profit color
  const getProfitColor = (profit: number, margin: number) => {
    if (profit < 0) return "text-red-600 dark:text-red-400";
    if (margin >= 40) return "text-green-600 dark:text-green-400";
    if (margin >= 30) return "text-emerald-600 dark:text-emerald-400";
    if (margin >= 20) return "text-yellow-600 dark:text-yellow-400";
    if (margin >= 10) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProfitBgColor = (profit: number, margin: number) => {
    if (profit < 0)
      return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
    if (margin >= 30)
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900";
    if (margin >= 20)
      return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900";
    return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900";
  };

  // VIEWING BATCH (Default)
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{batch.batchName}</CardTitle>
              <Badge
                variant={batch.status === "draft" ? "secondary" : "default"}
              >
                {batch.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewState({ type: "EDITING_BATCH" })}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteBatch}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {batch.startDate} to {batch.endDate} • {batch.items.length}{" "}
              product
              {batch.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          {/* Sticky Tabs */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="details" className="p-6 space-y-4 m-0">
              {/* Quick Metrics */}
              {!costAnalysis ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Units
                    </div>
                    <div className="text-2xl font-bold">
                      {costAnalysis.totalUnits}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Cost
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{costAnalysis.totalCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      incl. tax
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Expected Revenue
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{costAnalysis.totalRevenue.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      selling price
                    </div>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-lg border",
                      getProfitBgColor(
                        costAnalysis.totalProfit,
                        costAnalysis.profitMargin
                      )
                    )}
                  >
                    <div className="flex items-center gap-1 text-xs mb-1">
                      {costAnalysis.totalProfit >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span
                        className={getProfitColor(
                          costAnalysis.totalProfit,
                          costAnalysis.profitMargin
                        )}
                      >
                        Expected Profit
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        getProfitColor(
                          costAnalysis.totalProfit,
                          costAnalysis.profitMargin
                        )
                      )}
                    >
                      ₹{costAnalysis.totalProfit.toFixed(0)}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        getProfitColor(
                          costAnalysis.totalProfit,
                          costAnalysis.profitMargin
                        )
                      )}
                    >
                      {costAnalysis.profitMargin.toFixed(1)}% margin
                    </div>
                  </div>
                </div>
              )}

              {/* Products & Variants */}
              {!batchDetails ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : batchDetails.products.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Products & Variants</h3>
                  {batchDetails.products.map((product) => (
                    <div
                      key={product.productId}
                      className="border rounded-lg p-4"
                    >
                      <h4 className="font-medium mb-3">
                        {product.productName}
                      </h4>
                      <div className="space-y-2">
                        {product.variants.map((variant) => {
                          const displayQty = convertToDisplayUnit(
                            variant.totalFillQuantity,
                            "kg"
                          );
                          return (
                            <div
                              key={variant.variantId}
                              className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                            >
                              <span>{variant.variantName}</span>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {displayQty.quantity.toFixed(2)}{" "}
                                  {displayQty.unit}
                                </span>
                                <span>→</span>
                                <span className="font-medium text-foreground">
                                  {variant.units} units
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No products with valid quantities in this batch
                </div>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="p-6 m-0">
              {batch && <BatchRequirements batch={batch} />}
            </TabsContent>

            <TabsContent value="analytics" className="p-6 m-0">
              {costAnalysis && <BatchAnalytics costAnalysis={costAnalysis} />}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
}
