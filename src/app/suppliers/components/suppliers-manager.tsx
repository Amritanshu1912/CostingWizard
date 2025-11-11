"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuppliersOverviewTab } from "./suppliers-overview-tab/suppliers-overview-tab";
import { SuppliersItemsTab } from "./suppliers-items-tab/suppliers-items-tab";
import { useSuppliers, useItemsBySupplier } from "@/hooks/use-suppliers";

export function SuppliersManager() {
  // Use separate hooks for data and state management
  const suppliers = useSuppliers();
  const itemsBySupplier = useItemsBySupplier();

  return (
    <div className="space-y-6 animate-wave-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Supplier Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage suppliers and their materials, packaging, and labels
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Supplier Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SuppliersOverviewTab
            suppliers={suppliers}
            itemsBySupplier={itemsBySupplier}
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <SuppliersItemsTab suppliers={suppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
