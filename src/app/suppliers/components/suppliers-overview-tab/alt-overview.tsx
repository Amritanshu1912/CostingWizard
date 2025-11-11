"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Supplier } from "@/lib/types";
import { SuppliersList } from "./suppliers-list";
import { SuppliersDetailsCard } from "./suppliers-details-card";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";

interface SuppliersOverviewTabProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export function SuppliersOverviewTab({
  suppliers: initialSuppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersOverviewTabProps) {
  const [isCreating, setIsCreating] = useState(false);

  // Use the suppliers hook
  const {
    filteredSuppliers,
    selectedSupplier,
    selectedSupplierId,
    searchTerm,
    setSearchTerm,
    setSelectedSupplierId,
  } = useSuppliers(initialSuppliers);

  // Get supplier materials to count items per supplier
  const supplierMaterials = useSupplierMaterialsWithDetails();

  // Calculate materials count per supplier
  const itemsBySupplier = supplierMaterials.reduce<Record<string, number>>(
    (acc, sm) => {
      acc[sm.supplierId] = (acc[sm.supplierId] || 0) + 1;
      return acc;
    },
    {}
  );

  // Auto-select first supplier on mount
  useEffect(() => {
    if (!selectedSupplierId && !isCreating && filteredSuppliers.length > 0) {
      setSelectedSupplierId(filteredSuppliers[0].id);
    }
  }, [
    filteredSuppliers,
    selectedSupplierId,
    isCreating,
    setSelectedSupplierId,
  ]);

  // Handle start creating
  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedSupplierId(null);
  };

  // Handle create - auto-select the new supplier
  const handleCreate = (supplier: Supplier) => {
    onAddSupplier(supplier);
    setIsCreating(false);
    setSelectedSupplierId(supplier.id);
  };

  // Handle cancel create
  const handleCancelCreate = () => {
    setIsCreating(false);
    // Re-select first supplier if available
    if (filteredSuppliers.length > 0) {
      setSelectedSupplierId(filteredSuppliers[0].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Directory</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your supplier relationships and materials
          </p>
        </div>
        <Button onClick={handleStartCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* List + Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List - 1/3 width */}
        <div className="lg:col-span-1">
          <SuppliersList
            suppliers={filteredSuppliers}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={(id) => {
              setIsCreating(false);
              setSelectedSupplierId(id);
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsBySupplier={itemsBySupplier}
          />
        </div>

        {/* Details Card - 2/3 width */}
        <div className="lg:col-span-2">
          <SuppliersDetailsCard
            supplier={selectedSupplier}
            isCreating={isCreating}
            onUpdate={onEditSupplier}
            onCreate={handleCreate}
            onDelete={onDeleteSupplier}
            onCancelCreate={handleCancelCreate}
            materialCount={
              selectedSupplierId ? itemsBySupplier[selectedSupplierId] || 0 : 0
            }
          />
        </div>
      </div>
    </div>
  );
}
