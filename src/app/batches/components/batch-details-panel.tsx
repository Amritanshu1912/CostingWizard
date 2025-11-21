"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Trash2, Calendar, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { BatchForm } from "./batch-form";
import { BatchRequirements } from "./batch-requirements";
import { BatchAnalytics } from "./batch-analytics";
import {
  getBatchWithDetails,
  calculateBatchCostAnalysis,
} from "@/hooks/use-batches";
import type {
  ProductionBatch,
  BatchWithDetails,
  BatchCostAnalysis,
} from "@/lib/types";

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
  const [batchDetails, setBatchDetails] = useState<BatchWithDetails | null>(
    null
  );
  const [costAnalysis, setCostAnalysis] = useState<BatchCostAnalysis | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCreating) {
      setViewState({ type: "CREATING_BATCH" });
    } else if (batch) {
      setViewState({ type: "VIEWING_BATCH" });
    }
  }, [isCreating, batch?.id]);

  useEffect(() => {
    if (batch && viewState.type === "VIEWING_BATCH") {
      loadBatchData();
    }
  }, [batch?.id, viewState]);

  const loadBatchData = async () => {
    if (!batch) return;

    setIsLoading(true);
    try {
      // Fetch only the data this component is directly responsible for.
      const [details, analysis] = await Promise.all([
        getBatchWithDetails(batch.id),
        calculateBatchCostAnalysis(batch),
      ]);

      setBatchDetails(details);
      setCostAnalysis(analysis);
    } catch (error) {
      console.error("Error loading batch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBatch = async (
    batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => {
    const batchId = crypto.randomUUID();
    const newBatch: ProductionBatch = {
      id: batchId,
      ...batchData,
      createdAt: new Date().toISOString(),
    };

    await db.productionBatches.add(newBatch);
    setViewState({ type: "VIEWING_BATCH" });
    onBatchCreated?.(newBatch);
  };

  const handleUpdateBatch = async (
    batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!batch) return;

    await db.productionBatches.update(batch.id, batchData);
    setViewState({ type: "VIEWING_BATCH" });
    onBatchUpdated?.();
  };

  const handleDeleteBatch = async () => {
    if (!batch) return;

    if (!confirm(`Are you sure you want to delete "${batch.batchName}"?`))
      return;

    await db.productionBatches.delete(batch.id);
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

  // VIEWING BATCH (Default)
  return (
    <Card className="h-full">
      <CardHeader>
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

      <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading batch details...
              </div>
            ) : batchDetails ? (
              <div className="space-y-4">
                {/* Quick Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Units
                    </div>
                    <div className="text-2xl font-bold">{batch.totalUnits}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Cost
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{batch.totalCost.toFixed(0)}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Revenue
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{batch.totalRevenue.toFixed(0)}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                      Profit
                    </div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ₹{batch.totalProfit.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Products & Variants */}
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
                        {product.variants.map((variant) => (
                          <div
                            key={variant.variantId}
                            className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                          >
                            <span>{variant.variantName}</span>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {variant.fillQuantity}
                                {variant.fillUnit}
                              </span>
                              <span>→</span>
                              <span className="font-medium text-foreground">
                                {variant.units} units
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="requirements">
            {/* FIX 1: Pass the `batch` object directly */}
            <BatchRequirements batch={batch} />
          </TabsContent>

          <TabsContent value="analytics">
            {/* FIX 2: Correct the prop name to `costAnalysis` */}
            {costAnalysis && <BatchAnalytics costAnalysis={costAnalysis} />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
