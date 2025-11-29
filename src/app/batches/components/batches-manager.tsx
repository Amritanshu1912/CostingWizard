// src/app/batches/components/batches-manager.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import type { ProductionBatch } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { BatchDetailsPanel } from "./batch-details-panel";
import { BatchesListView } from "./batches-list-view";
import { LoadingState } from "./empty-batch-state";

export function BatchesManager() {
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const batches = useLiveQuery(() => db.productionBatches.toArray());

  // Auto-select first batch on load
  useEffect(() => {
    if (batches && batches.length > 0 && !selectedBatch && !isCreatingNew) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, isCreatingNew, selectedBatch]);

  // Sync selected batch with database changes
  useEffect(() => {
    if (selectedBatch && batches) {
      const updatedBatch = batches.find((b) => b.id === selectedBatch.id);
      if (updatedBatch) {
        setSelectedBatch(updatedBatch);
      }
    }
  }, [batches, selectedBatch]);

  const handleBatchCreated = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setIsCreatingNew(false);
  };

  const handleBatchDeleted = () => {
    if (batches && batches.length > 0) {
      setSelectedBatch(batches[0]);
    } else {
      setSelectedBatch(null);
    }
    setIsCreatingNew(false);
  };

  const handleCreateBatch = () => {
    setIsCreatingNew(true);
    setSelectedBatch(null);
  };

  if (!batches) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Production Batches
        </h1>
        <p className="text-muted-foreground">
          Plan production runs, analyze costs, and manage procurement
          requirements
        </p>
      </div>

      <Tabs defaultValue="batches" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <BatchesListView
                batches={batches || []}
                selectedBatchId={selectedBatch?.id}
                onSelectBatch={setSelectedBatch}
                onCreateBatch={handleCreateBatch}
              />
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-8 xl:col-span-9">
              <BatchDetailsPanel
                batch={selectedBatch}
                isCreating={isCreatingNew}
                onBatchCreated={handleBatchCreated}
                onBatchUpdated={() => {
                  setIsCreatingNew(false);
                }}
                onBatchDeleted={handleBatchDeleted}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Analytics Dashboard - Coming Soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
