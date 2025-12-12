// src/app/materials/components/materials-manager.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, List, Package, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAllMaterialMutations } from "@/hooks/material-hooks/use-materials-mutations";
import {
  useAllCategories,
  useAllMaterials,
  useAllSuppliers,
  useMaterialsAnalytics,
  useSupplierMaterialTableRows,
} from "@/hooks/material-hooks/use-materials-queries";

import type { SupplierMaterialFormData } from "@/types/material-types";

import { MaterialsAnalytics } from "./materials-analytics";
import { CategoryManager } from "./materials-category-manager";
import { MaterialsListDrawer } from "./materials-list-drawer";
import { MaterialsPriceComparison } from "./materials-price-comparison";
import { MaterialsSupplierDialog } from "./materials-supplier-dialog";
import { SupplierMaterialsTable } from "./materials-supplier-table";

/**
 * Main materials management component
 * Orchestrates all material-related operations and views
 */
export function MaterialsManager() {
  // State for managing dialog visibility and editing mode
  const [showSupplierMaterialDialog, setShowSupplierMaterialDialog] =
    useState(false);
  const [showMaterialsListDrawer, setShowMaterialsListDrawer] = useState(false);
  const [editingSupplierMaterialId, setEditingSupplierMaterialId] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState<SupplierMaterialFormData | null>(
    null
  );

  // Fetch data for dropdowns and displays
  const suppliers = useAllSuppliers();
  const materials = useAllMaterials();
  const categories = useAllCategories();

  // Get transformed data for table display and analytics
  const supplierMaterialRows = useSupplierMaterialTableRows();
  const analytics = useMaterialsAnalytics();

  // Get mutation functions for all CRUD operations
  const {
    createSupplierMaterial,
    updateSupplierMaterial,
    deleteSupplierMaterial,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAllMaterialMutations();

  // Initialize dialog for adding a new supplier material
  const handleAddSupplierMaterial = () => {
    setEditingSupplierMaterialId(null);
    setFormData(null);
    setShowSupplierMaterialDialog(true);
  };

  // Initialize dialog for editing an existing supplier material
  const handleEditSupplierMaterial = (
    row: (typeof supplierMaterialRows)[0]
  ) => {
    setEditingSupplierMaterialId(row.id);

    // Map table row data to form structure
    setFormData({
      supplierId: row.supplierId,
      materialId: row.materialId,
      materialName: row.materialName,
      materialCategory: row.materialCategory,
      bulkPrice: row.bulkPrice || row.unitPrice,
      quantityForBulkPrice: row.quantityForBulkPrice || 1,
      capacityUnit: row.capacityUnit,
      tax: row.tax,
      moq: row.moq,
      leadTime: row.leadTime,
      transportationCost: row.transportationCost,
      notes: row.notes,
    });

    setShowSupplierMaterialDialog(true);
  };

  // Save supplier material data (create or update based on editing state)
  const handleSaveSupplierMaterial = async (data: SupplierMaterialFormData) => {
    try {
      if (editingSupplierMaterialId) {
        await updateSupplierMaterial(editingSupplierMaterialId, data);
        toast.success("Material updated successfully");
      } else {
        await createSupplierMaterial(data);
        toast.success("Material added successfully");
      }

      setShowSupplierMaterialDialog(false);
      setEditingSupplierMaterialId(null);
      setFormData(null);
    } catch (error) {
      console.error("Error saving supplier material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save material"
      );
    }
  };

  // Delete a supplier material entry
  const handleDeleteSupplierMaterial = async (id: string) => {
    try {
      await deleteSupplierMaterial(id);
      toast.success("Material deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete material"
      );
    }
  };

  // Close the supplier material dialog and reset editing state
  const handleCloseDialog = () => {
    setShowSupplierMaterialDialog(false);
    setEditingSupplierMaterialId(null);
    setFormData(null);
  };

  // Create a new material category
  const handleAddCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      await createCategory(data);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add category"
      );
    }
  };

  const handleUpdateCategory = async (
    id: string,
    data: { name: string; description?: string }
  ) => {
    try {
      await updateCategory(id, data);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Raw Materials Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your raw materials inventory and pricing
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <CategoryManager
            categories={categories || []}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
          <Button
            onClick={() => setShowMaterialsListDrawer(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <List className="h-4 w-4 mr-2" />
            <span className="truncate">View All Materials</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Supplier Materials</TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Materials"
              value={analytics.totalMaterials}
              icon={Package}
              iconClassName="text-primary"
              trend={{
                value: "+12%",
                isPositive: true,
                label: "from last month",
              }}
            />

            <MetricCard
              title="Avg Price (with tax)"
              value={`₹${analytics.avgPrice.toFixed(2)}`}
              icon={BarChart3}
              iconClassName="text-primary"
              trend={{
                value: "+5.2%",
                isPositive: true,
                label: "from last month",
              }}
            />

            <MetricCard
              title="Highest Price"
              value={`₹${analytics.highestPrice.toFixed(2)}`}
              icon={TrendingUp}
              iconClassName="text-primary"
              description="per unit"
            />

            <MetricCard
              title="Avg Tax Rate"
              value={`${analytics.avgTax.toFixed(1)}%`}
              icon={BarChart3}
              iconClassName="text-primary"
              description="average across all materials"
            />
          </div>

          {/* Supplier Materials Table */}
          <SupplierMaterialsTable
            items={supplierMaterialRows}
            suppliers={suppliers || []}
            onEdit={handleEditSupplierMaterial}
            onDelete={handleDeleteSupplierMaterial}
            onAddMaterial={handleAddSupplierMaterial}
          />
        </TabsContent>

        {/* Price Comparison Tab */}
        <TabsContent value="price-comparison" className="space-y-6">
          <MaterialsPriceComparison />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <MaterialsAnalytics />
        </TabsContent>
      </Tabs>

      {/* Supplier Material Dialog */}
      <MaterialsSupplierDialog
        open={showSupplierMaterialDialog}
        onOpenChange={handleCloseDialog}
        supplierMaterial={formData || undefined}
        isEditing={!!editingSupplierMaterialId}
        onSave={handleSaveSupplierMaterial}
        suppliers={suppliers || []}
        materials={materials || []}
        categories={categories || []}
      />

      {/* Materials List Drawer */}
      <MaterialsListDrawer
        open={showMaterialsListDrawer}
        onOpenChange={setShowMaterialsListDrawer}
      />
    </div>
  );
}
