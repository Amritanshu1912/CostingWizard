// src/app/suppliers/components/suppliers-overview-tab/suppliers-overview-tab.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSupplierMutations } from "@/hooks/supplier-hooks/use-supplier-mutations";
import type { Supplier, SupplierFormData } from "@/types/supplier-types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { SuppliersDetailsCard } from "./suppliers-details-card";
import { SuppliersList } from "./suppliers-list-card";

interface SuppliersOverviewTabProps {
  suppliers: Supplier[];
  itemsBySupplier: Record<string, number>;
}

/**
 * Overview tab for supplier management.
 * Displays supplier list and detailed information with CRUD operations.
 */
export function SuppliersOverviewTab({
  suppliers,
  itemsBySupplier,
}: SuppliersOverviewTabProps) {
  const { createSupplier, updateSupplier, deleteSupplier } =
    useSupplierMutations();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Auto-select first active supplier on mount
  useEffect(() => {
    if (!selectedSupplierId && !isCreating && suppliers.length > 0) {
      const firstActive = suppliers.find((s) => s.isActive);
      if (firstActive) {
        setSelectedSupplierId(firstActive.id);
      }
    }
  }, [suppliers, selectedSupplierId, isCreating]);

  // Filter active suppliers by search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.isActive &&
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSupplier =
    suppliers.find((s) => s.id === selectedSupplierId) || null;

  /**
   * Initiates supplier creation mode
   */
  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedSupplierId(null);
  };

  /**
   * Creates new supplier and selects it
   */
  const handleCreate = async (data: SupplierFormData) => {
    const newSupplier = await createSupplier(data);
    setIsCreating(false);
    setSelectedSupplierId(newSupplier.id);
  };

  /**
   * Updates existing supplier
   */
  const handleUpdate = async (id: string, data: Partial<SupplierFormData>) => {
    const existingSupplier = suppliers.find((s) => s.id === id);
    if (existingSupplier) {
      const updatedSupplier: Supplier = { ...existingSupplier, ...data };
      await updateSupplier(updatedSupplier);
    }
  };

  /**
   * Soft-deletes supplier
   */
  const handleDelete = async (id: string) => {
    await deleteSupplier(id);
    // Select first available supplier after deletion
    if (suppliers.length > 1) {
      const nextSupplier = suppliers.find((s) => s.id !== id && s.isActive);
      if (nextSupplier) {
        setSelectedSupplierId(nextSupplier.id);
      }
    }
  };

  /**
   * Cancels creation and returns to view mode
   */
  const handleCancelCreate = () => {
    setIsCreating(false);
    // Auto-select first available supplier
    if (suppliers.length > 0) {
      const firstActive = suppliers.find((s) => s.isActive);
      if (firstActive) {
        setSelectedSupplierId(firstActive.id);
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
        {/* Supplier List - 1/4 width */}
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

        {/* Details Card - 3/4 width */}
        <div className="lg:col-span-3">
          <SuppliersDetailsCard
            supplier={selectedSupplier}
            isCreating={isCreating}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
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
