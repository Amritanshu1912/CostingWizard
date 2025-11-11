"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Supplier, SupplierMaterial } from "@/lib/types";
import { AddSupplierDialog } from "./suppliers-dialog";
import { SuppliersList } from "./suppliers-list";
import { SuppliersDetailsCard } from "./suppliers-details-card";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useState } from "react";

interface SuppliersOverviewTabProps {
  suppliers: Supplier[];
  materialsBySupplier: Record<string, number>;
  supplierMaterials: SupplierMaterial[];
  onAddSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export function SuppliersOverviewTab({
  suppliers,
  materialsBySupplier,
  supplierMaterials,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersOverviewTabProps) {
  const {
    filteredSuppliers,
    selectedSupplier,
    selectedSupplierId,
    searchTerm,
    setSearchTerm,
    setSelectedSupplierId,
  } = useSuppliers(suppliers);

  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const handleSaveSupplier = (supplier: Supplier) => {
    onAddSupplier(supplier);
    setSelectedSupplierId(supplier.id);
    setShowAddSupplier(false);
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
        <Button onClick={() => setShowAddSupplier(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* List + Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Supplier List - 1/3 width */}
        <div className="lg:col-span-1">
          <SuppliersList
            suppliers={filteredSuppliers}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={setSelectedSupplierId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            materialsBySupplier={materialsBySupplier}
          />
        </div>

        {/* Details Card - 2/3 width */}
        <div className="lg:col-span-3">
          <SuppliersDetailsCard
            supplier={selectedSupplier}
            onUpdate={onEditSupplier}
            onDelete={onDeleteSupplier}
            materialCount={
              selectedSupplierId ? materialsBySupplier[selectedSupplierId] : 0
            }
          />
        </div>
      </div>

      {/* Add Supplier Dialog */}
      <AddSupplierDialog
        isOpen={showAddSupplier}
        setIsOpen={setShowAddSupplier}
        onSave={handleSaveSupplier}
      />
    </div>
  );
}
