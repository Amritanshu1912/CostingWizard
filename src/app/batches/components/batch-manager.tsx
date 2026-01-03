// src/app/batches/components/batch-manager.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, Package, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductionBatch } from "@/types/batch-types";
import { useProductionBatches } from "@/hooks/batch-hooks/use-batch-data";
import { BatchList } from "./batch-list";
import { BatchDetails } from "./batch-details";

/**
 * Batch manager component
 * Top-level orchestrator with Batches/Analytics/Orders tabs
 */
export function BatchManager() {
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Fetch all batches
  const batches = useProductionBatches();

  // Auto-select first batch on initial load
  useEffect(() => {
    if (batches && batches.length > 0 && !selectedBatch && !isCreatingNew) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, selectedBatch, isCreatingNew]);

  // Sync selected batch with database updates
  useEffect(() => {
    if (selectedBatch && batches) {
      const updatedBatch = batches.find((b) => b.id === selectedBatch.id);
      if (updatedBatch) {
        setSelectedBatch(updatedBatch);
      }
    }
  }, [batches, selectedBatch]);

  /** Handle new batch created */
  const handleBatchCreated = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setIsCreatingNew(false);
  };

  /** Handle batch deleted */
  const handleBatchDeleted = () => {
    if (batches && batches.length > 0) {
      setSelectedBatch(batches[0]);
    } else {
      setSelectedBatch(null);
    }
    setIsCreatingNew(false);
  };

  /** Handle create new batch button */
  const handleCreateBatch = () => {
    setIsCreatingNew(true);
    setSelectedBatch(null);
  };

  // Loading state
  if (!batches) {
    return <LoadingState />;
  }

  // Empty state - no batches exist
  if (batches.length === 0 && !isCreatingNew) {
    return <EmptyState onCreateBatch={handleCreateBatch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Production Batches
        </h1>
        <p className="text-muted-foreground">
          Plan production runs, analyze costs, and manage procurement
          requirements
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="batches" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Batch List */}
            <div className="lg:col-span-4 xl:col-span-3">
              <BatchList
                batches={batches}
                selectedBatchId={selectedBatch?.id}
                onSelectBatch={setSelectedBatch}
                onCreateBatch={handleCreateBatch}
              />
            </div>

            {/* Right: Batch Details */}
            <div className="lg:col-span-8 xl:col-span-9">
              <BatchDetails
                batch={selectedBatch}
                isCreating={isCreatingNew}
                onBatchCreated={handleBatchCreated}
                onBatchUpdated={() => setIsCreatingNew(false)}
                onBatchDeleted={handleBatchDeleted}
              />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Analytics Dashboard - Coming Soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Orders & Procurement - Coming Soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Loading skeleton */
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <Skeleton className="h-[600px]" />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    </div>
  );
}

/** Empty state when no batches exist */
function EmptyState({ onCreateBatch }: { onCreateBatch: () => void }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Production Batches
        </h1>
        <p className="text-muted-foreground">
          Plan production runs, analyze costs, and manage procurement
          requirements
        </p>
      </div>

      {/* Empty State Card */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-24 px-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border-2 border-primary/20">
            <Package className="h-12 w-12 text-primary" />
          </div>

          <h3 className="text-2xl font-semibold mb-2">No batches yet</h3>

          <p className="text-muted-foreground text-center max-w-md mb-8">
            Create your first production batch to start planning, tracking
            costs, and managing procurement
          </p>

          <Button onClick={onCreateBatch} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Production Batch
          </Button>

          {/* Quick Tips */}
          <div className="w-full max-w-md space-y-3 pt-8 border-t mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Quick Tips:</span>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Add multiple products and variants to a single batch
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Track material requirements and costs automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Monitor inventory levels and shortages in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Generate purchase orders directly from batch requirements
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
