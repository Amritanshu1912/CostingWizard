// src/app/inventory/components/manager.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAllInventoryItemsWithDetails,
  useInventoryStats,
} from "@/hooks/inventory-hooks/use-inventory-computed";
import { Package, Plus } from "lucide-react";
import { useState } from "react";
import { BulkAdjustDialog } from "./inventory-bulk-adjust-dialog";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { InventoryOverview } from "./inventory-overview";
import { InventoryStockList } from "./inventory-stock-list";

/**
 * Main inventory management component
 * Manages tabs and global dialogs for inventory operations
 */
export function InventoryManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Pre-fetch data for tabs (will be cached by React Query/Dexie)
  const items = useAllInventoryItemsWithDetails();
  const stats = useInventoryStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track and manage your stock levels
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
          <Button
            onClick={() => setShowBulkDialog(true)}
            className="flex-1 sm:flex-initial"
          >
            <Package className="h-4 w-4" />
            Bulk Add/Adjust
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <InventoryOverview stats={stats} items={items} />
        </TabsContent>

        <TabsContent value="stock" className="mt-0">
          <InventoryStockList />
        </TabsContent>
      </Tabs>

      {/* Global Dialogs */}
      <InventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
      <BulkAdjustDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
      />
    </div>
  );
}

export default InventoryManager;
