"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus } from "lucide-react";
import { SUPPLIERS } from "@/lib/constants";
import { SUPPLIER_MATERIALS } from "../../materials/components/materials-constants";
import type { Supplier } from "@/lib/types";
import { SuppliersOverviewTab } from "./suppliers-overview-tab";
import { SuppliersItemsTab } from "./suppliers-items-tab";
import { MoqAnalysisTab } from "./suppliers-moq-analysis-tab";

export function SuppliersManager() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>(
    "suppliers",
    SUPPLIERS
  );

  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplier.id ? supplier : s))
    );
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: false } : s))
    );
  };

  // Compute a map of supplierId → number of available materials
  const materialsBySupplier = (SUPPLIER_MATERIALS || []).reduce<
    Record<string, number>
  >((acc, material) => {
    if (material.availability !== "out-of-stock") {
      acc[material.supplierId] = (acc[material.supplierId] || 0) + 1;
    }
    return acc;
  }, {});

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Supplier Items</TabsTrigger>
          <TabsTrigger value="moq-analysis">MOQ Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SuppliersOverviewTab
            suppliers={suppliers}
            materialsBySupplier={materialsBySupplier}
            supplierMaterials={SUPPLIER_MATERIALS}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <SuppliersItemsTab suppliers={suppliers} />
        </TabsContent>

        <TabsContent value="moq-analysis" className="space-y-6">
          <MoqAnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
