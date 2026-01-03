// src/app/batches/components/batch-details.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, Edit2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductionBatch } from "@/types/batch-types";
import { useBatchOperations } from "@/hooks/batch-hooks/use-batch-operations";
import { useBatchDetails } from "@/hooks/batch-hooks/use-batch-data";
import {
  useBatchCostAnalysis,
  useBatchRequirements,
} from "@/hooks/batch-hooks/use-batch-analysis";
import { BatchForm } from "./batch-form";
import { BatchDetailsTab } from "./batch-details-tab";
import { BatchRequirementsTab } from "./batch-requirements/batch-requirements-tab";
import { BatchAnalyticsTab } from "./batch-analytics-tab";

interface BatchDetailsProps {
  batch: ProductionBatch | null;
  isCreating?: boolean;
  onBatchCreated?: (batch: ProductionBatch) => void;
  onBatchUpdated?: () => void;
  onBatchDeleted?: () => void;
}

type ViewMode = "viewing" | "creating" | "editing";

/**
 * Batch details component
 * Displays batch information in tabbed layout with CRUD actions
 */
export function BatchDetails({
  batch,
  isCreating = false,
  onBatchCreated,
  onBatchUpdated,
  onBatchDeleted,
}: BatchDetailsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    isCreating ? "creating" : "viewing"
  );

  // Fetch batch data for all tabs
  const batchDetails = useBatchDetails(batch?.id || null);
  const costAnalysis = useBatchCostAnalysis(batch?.id || null);
  const requirements = useBatchRequirements(batch?.id || null);

  // CRUD operations
  const { createBatch, updateBatch, deleteBatch } = useBatchOperations();

  // Sync view mode with props
  useEffect(() => {
    if (isCreating) {
      setViewMode("creating");
    } else if (batch) {
      setViewMode("viewing");
    }
  }, [isCreating, batch]);

  /** Create new batch */
  const handleCreateBatch = async (
    batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => {
    const newBatch = await createBatch(batchData);
    setViewMode("viewing");
    onBatchCreated?.(newBatch);
  };

  /** Update existing batch */
  const handleUpdateBatch = async (
    batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!batch) return;
    await updateBatch(batch.id, batchData);
    setViewMode("viewing");
    onBatchUpdated?.();
  };

  /** Delete batch with confirmation */
  const handleDeleteBatch = async () => {
    if (!batch) return;
    if (!confirm(`Are you sure you want to delete "${batch.batchName}"?`))
      return;
    await deleteBatch(batch.id);
    onBatchDeleted?.();
  };

  // CREATE MODE
  if (viewMode === "creating") {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Create New Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchForm
            onSave={handleCreateBatch}
            onCancel={() => setViewMode("viewing")}
          />
        </CardContent>
      </Card>
    );
  }

  // EDIT MODE
  if (viewMode === "editing" && batch) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Edit Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchForm
            initialBatch={batch}
            onSave={handleUpdateBatch}
            onCancel={() => setViewMode("viewing")}
            onDelete={handleDeleteBatch}
          />
        </CardContent>
      </Card>
    );
  }

  // EMPTY STATE - No batch selected
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
          <Button onClick={() => setViewMode("creating")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
          </Button>
        </CardContent>
      </Card>
    );
  }

  // VIEWING MODE - Show batch details in tabs
  return (
    <Card className="h-full flex flex-col">
      {/* Header with batch name and actions */}
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

              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("editing")}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteBatch}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Batch metadata */}
            <p className="text-sm text-muted-foreground">
              {batch.startDate} to {batch.endDate} • {batch.items.length}{" "}
              product
              {batch.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Tabbed content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          {/* Sticky tab headers */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* Details Tab */}
            <TabsContent value="details" className="p-6 space-y-4 m-0">
              {!costAnalysis || !batchDetails ? (
                <LoadingSkeleton />
              ) : (
                <BatchDetailsTab
                  batchDetails={batchDetails}
                  costAnalysis={costAnalysis}
                />
              )}
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="p-6 m-0">
              {!requirements ? (
                <LoadingSkeleton />
              ) : (
                <BatchRequirementsTab requirements={requirements} />
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="p-6 m-0">
              {!costAnalysis ? (
                <LoadingSkeleton />
              ) : (
                <BatchAnalyticsTab costAnalysis={costAnalysis} />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
}

/** Loading skeleton for tab content */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
