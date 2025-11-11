"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Supplier } from "@/lib/types";
import { db } from "@/lib/db";
import { SuppliersList } from "./suppliers-list";
import { SuppliersDetailsCard } from "./suppliers-details-card";

interface SuppliersOverviewTabProps {
  suppliers: Supplier[];
  itemsBySupplier: Record<string, number>;
}

export function SuppliersOverviewTab({
  suppliers,
  itemsBySupplier,
}: SuppliersOverviewTabProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Auto-select first supplier on mount or when suppliers change
  useEffect(() => {
    if (!selectedSupplierId && !isCreating && suppliers.length > 0) {
      const firstActiveSupplier = suppliers.find((s) => s.isActive !== false);
      if (firstActiveSupplier) {
        setSelectedSupplierId(firstActiveSupplier.id);
      }
    }
  }, [suppliers, selectedSupplierId, isCreating]);

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      supplier.isActive !== false
  );

  // Get the selected supplier
  const selectedSupplier =
    suppliers.find((s) => s.id === selectedSupplierId) || null;

  // Handle start creating
  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedSupplierId(null); // Deselect any selected supplier
  };

  // Handle create - auto-select the new supplier
  const handleCreate = async (supplier: Supplier) => {
    await db.suppliers.add(supplier);
    setIsCreating(false);
    setSelectedSupplierId(supplier.id); // Auto-select new supplier
  };

  // Handle edit supplier
  const handleEditSupplier = async (supplier: Supplier) => {
    await db.suppliers.put(supplier);
  };

  // Handle delete supplier
  const handleDeleteSupplier = async (id: string) => {
    await db.suppliers.update(id, { isActive: false });
  };

  // Handle cancel create
  const handleCancelCreate = () => {
    setIsCreating(false);
    // Re-select first supplier if available
    if (suppliers.length > 0) {
      const firstActiveSupplier = suppliers.find((s) => s.isActive !== false);
      if (firstActiveSupplier) {
        setSelectedSupplierId(firstActiveSupplier.id);
      }
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
        <div className="lg:col-span-3">
          <SuppliersDetailsCard
            supplier={selectedSupplier}
            isCreating={isCreating}
            onUpdate={handleEditSupplier}
            onCreate={handleCreate}
            onDelete={handleDeleteSupplier}
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
