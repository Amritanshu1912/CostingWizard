// src/app/inventory/components/inventory-manager.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus } from "lucide-react";
import {
  useInventoryItemsWithDetails,
  useInventoryStats,
  useInventoryAlerts,
} from "@/hooks/use-inventory";
import { InventoryOverview } from "./inventory-overview";
import { InventoryStockList } from "./inventory-stock-list";
import { InventoryTransactionsList } from "./inventory-transactions-list";
import { InventoryAlertsList } from "./inventory-alerts-list";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { BulkAdjustDialog } from "./inventory-bulk-adjust-dialog";

export function InventoryManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  const items = useInventoryItemsWithDetails();
  const stats = useInventoryStats();
  const alerts = useInventoryAlerts();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your inventory here
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus /> Add Stock
          </Button>
          <Button onClick={() => setShowBulkDialog(true)}>
            <Package /> Bulk Adjust
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock List</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts && alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <InventoryOverview stats={stats} items={items} />
        </TabsContent>

        <TabsContent value="stock" className="mt-0">
          <InventoryStockList />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <InventoryTransactionsList />
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <InventoryAlertsList />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
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
