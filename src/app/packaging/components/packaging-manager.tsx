// src/app/packaging/components/packaging-manager.tsx
"use client";

import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllPackagingMutations } from "@/hooks/packaging-hooks/use-packaging-mutations";
import {
  usePackagingAnalytics,
  useSupplierPackagingTableRows,
} from "@/hooks/packaging-hooks/use-packaging-queries";
import { useDexieTable } from "@/hooks/use-dexie-table";

import { DEFAULT_SUPPLIER_PACKAGING_FORM } from "@/app/packaging/components/packaging-constants";
import { db } from "@/lib/db";
import type {
  CapacityUnit,
  PackagingType,
  SupplierPackagingFormData,
  SupplierPackagingTableRow,
} from "@/types/packaging-types";
import { BarChart3, List, Package, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PackagingAnalytics } from "./packaging-analytics";
import { PackagingDrawer } from "./packaging-drawer";
import { PackagingPriceComparison } from "./packaging-price-comparison";
import { SupplierPackagingDialog } from "./supplier-packaging-dialog";
import { SupplierPackagingTable } from "./supplier-packaging-table";

/**
 * PackagingManager component provides the main interface for managing packaging inventory
 * and supplier relationships. It includes tabs for supplier packaging, price comparison,
 * and analytics, with full CRUD operations for supplier packaging entries.
 */
export function PackagingManager() {
  // State for controlling the add/edit supplier packaging dialog
  const [showAddSupplierPackaging, setShowAddSupplierPackaging] =
    useState(false);
  const [editingSupplierPackaging, setEditingSupplierPackaging] =
    useState<SupplierPackagingTableRow | null>(null);
  const [showPackagingDrawer, setShowPackagingDrawer] = useState(false);
  const [formData, setFormData] = useState<SupplierPackagingFormData>(
    DEFAULT_SUPPLIER_PACKAGING_FORM
  );

  // Trigger for refreshing dialog data when packaging changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data using hooks
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: packaging } = useDexieTable(db.packaging, []);
  const supplierPackagingTableData = useSupplierPackagingTableRows();
  const analytics = usePackagingAnalytics();
  const mutations = useAllPackagingMutations();

  // Handle adding new supplier packaging with validation
  const handleAddSupplierPackaging = useCallback(async () => {
    if (
      !formData.supplierId ||
      !formData.packagingName ||
      !formData.bulkPrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await mutations.createSupplierPackaging(formData);
      setFormData(DEFAULT_SUPPLIER_PACKAGING_FORM);
      setShowAddSupplierPackaging(false);
      toast.success("Supplier packaging added successfully");
    } catch (error: any) {
      console.error("Error adding supplier packaging:", error);
      toast.error(error.message || "Failed to add supplier packaging");
    }
  }, [formData, mutations]);

  // Prepare form data for editing an existing supplier packaging entry
  const handleEditSupplierPackaging = useCallback(
    (item: SupplierPackagingTableRow) => {
      setEditingSupplierPackaging(item);
      setFormData({
        supplierId: item.supplierId,
        packagingId: item.packagingId,
        packagingName: item.packagingName,
        packagingType: item.packagingType,
        capacity: item.capacity,
        capacityUnit: item.capacityUnit,
        buildMaterial: item.buildMaterial,
        bulkPrice: item.bulkPrice,
        quantityForBulkPrice: item.quantityForBulkPrice,
        unitPrice: item.unitPrice,
        tax: item.tax,
        moq: item.moq,
        leadTime: item.leadTime,
        transportationCost: 0,
        bulkDiscounts: [],
        notes: item.notes,
      });
      setShowAddSupplierPackaging(true);
    },
    []
  );

  // Handle updating existing supplier packaging entry
  const handleUpdateSupplierPackaging = useCallback(async () => {
    if (!editingSupplierPackaging) return;

    try {
      await mutations.updateSupplierPackaging(
        editingSupplierPackaging.id,
        formData
      );
      setFormData(DEFAULT_SUPPLIER_PACKAGING_FORM);
      setEditingSupplierPackaging(null);
      setShowAddSupplierPackaging(false);
      toast.success("Supplier packaging updated successfully");
    } catch (error: any) {
      console.error("Error updating supplier packaging:", error);
      toast.error(error.message || "Failed to update supplier packaging");
    }
  }, [editingSupplierPackaging, formData, mutations]);

  // Handle deleting a supplier packaging entry
  const handleDeleteSupplierPackaging = useCallback(
    async (id: string) => {
      try {
        await mutations.deleteSupplierPackaging(id);
        toast.success("Supplier packaging deleted successfully");
      } catch (error) {
        console.error("Error deleting supplier packaging:", error);
        toast.error("Failed to delete supplier packaging");
      }
    },
    [mutations]
  );

  // Reset dialog state when closed
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowAddSupplierPackaging(false);
      setEditingSupplierPackaging(null);
      setFormData(DEFAULT_SUPPLIER_PACKAGING_FORM);
    }
  }, []);

  // Trigger refresh when drawer operations complete
  const handleDrawerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with title and action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Packaging Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage bottles, containers, and packaging from suppliers
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowPackagingDrawer(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <List className="h-4 w-4 mr-2" />
            <span className="truncate">View All Packaging</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="supplier-packaging" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supplier-packaging">
            Supplier Packaging
          </TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="supplier-packaging" className="space-y-6">
          {/* Quick overview metrics for supplier packaging */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Packaging"
              value={analytics?.totalPackaging || 0}
              icon={Package}
              iconClassName="text-primary"
              trend={{
                value: "+8%",
                isPositive: true,
                label: "from last month",
              }}
            />

            <MetricCard
              title="Avg Price (with tax)"
              value={`₹${(analytics?.avgPrice || 0).toFixed(2)}`}
              icon={BarChart3}
              iconClassName="text-primary"
              trend={{
                value: "+3.5%",
                isPositive: true,
                label: "from last month",
              }}
            />

            <MetricCard
              title="Highest Price"
              value={`₹${(analytics?.highestPrice || 0).toFixed(2)}`}
              icon={TrendingUp}
              iconClassName="text-primary"
              description="per piece"
            />

            <MetricCard
              title="Avg Tax Rate"
              value={`${(analytics?.avgTax || 0).toFixed(1)}%`}
              icon={BarChart3}
              iconClassName="text-primary"
              description="average across all packaging"
            />
          </div>

          <SupplierPackagingTable
            supplierPackaging={supplierPackagingTableData}
            suppliers={[]}
            onEditPackaging={(item) => {
              // Convert table item back to row format for editing dialog
              const row: SupplierPackagingTableRow = {
                id: item.id,
                packagingId: item.packagingId,
                packagingName: item.packagingName,
                packagingType: item.packagingType as PackagingType,
                capacity: item.capacity || 0,
                capacityUnit: item.capacityUnit as CapacityUnit,
                buildMaterial: item.buildMaterial,
                supplierId: item.supplierId,
                supplierName: item.supplierName || "Unknown",
                supplierRating: item.supplierRating || 0,
                priceWithTax: item.priceWithTax,
                bulkPrice: item.bulkPrice || 0,
                quantityForBulkPrice: item.quantityForBulkPrice || 1,
                tax: item.tax || 0,
                moq: item.moq || 1,
                leadTime: item.leadTime || 7,
                transportationCost: item.transportationCost || 0,
                notes: item.notes,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                currentStock: item.currentStock || 0,
                stockStatus: item.stockStatus || "in-stock",
                unitPrice: item.unitPrice || 0,
              };
              handleEditSupplierPackaging(row);
            }}
            onDeletePackaging={handleDeleteSupplierPackaging}
            onAddSupplierPackaging={() => setShowAddSupplierPackaging(true)}
          />
        </TabsContent>

        <TabsContent value="price-comparison" className="space-y-6">
          <PackagingPriceComparison />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PackagingAnalytics />
        </TabsContent>
      </Tabs>

      {/* Dialog for adding/editing supplier packaging with key-based refresh */}
      <SupplierPackagingDialog
        key={refreshTrigger}
        open={showAddSupplierPackaging}
        onOpenChange={handleDialogClose}
        packaging={formData}
        setPackaging={setFormData} // Temporary type assertion for compatibility
        onSave={
          editingSupplierPackaging
            ? handleUpdateSupplierPackaging
            : handleAddSupplierPackaging
        }
        suppliers={suppliers}
        packagingList={packaging}
        isEditing={!!editingSupplierPackaging}
      />

      {/* Drawer for managing base packaging inventory */}
      <PackagingDrawer
        open={showPackagingDrawer}
        onOpenChange={setShowPackagingDrawer}
        onRefresh={handleDrawerRefresh}
      />
    </div>
  );
}
