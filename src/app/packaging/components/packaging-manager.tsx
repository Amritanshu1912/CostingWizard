// src/app/packaging/components/packaging-manager.tsx
"use client";

import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { useSupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging";
import { db } from "@/lib/db";
import { normalizeText } from "@/utils/text-utils";
import type { SupplierPackaging } from "@/types/shared-types";
import { BarChart3, List, Package, TrendingUp } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PackagingAnalytics } from "./packaging-analytics";
import { PackagingDrawer } from "./packaging-drawer";
import { PackagingPriceComparison } from "./packaging-price-comparison";
import type { PackagingFormData } from "./supplier-packaging-dialog";
import { EnhancedSupplierPackagingDialog } from "./supplier-packaging-dialog";
import { SupplierPackagingTable } from "./supplier-packaging-table";

const DEFAULT_PACKAGING_FORM: PackagingFormData = {
  supplierId: "",
  packagingName: "",
  packagingId: "",
  packagingType: undefined,
  capacity: 0,
  capacityUnit: "ml",
  buildMaterial: undefined,
  bulkPrice: 0,
  quantityForBulkPrice: 1,
  tax: 0,
  moq: 1,
  leadTime: 7,
  availability: "in-stock",
  notes: "",
};

export function PackagingManager() {
  const [showAddSupplierPackaging, setShowAddSupplierPackaging] =
    useState(false);
  const [editingSupplierPackaging, setEditingSupplierPackaging] =
    useState<SupplierPackaging | null>(null);
  const [showPackagingDrawer, setShowPackagingDrawer] = useState(false);
  const [formData, setFormData] = useState<PackagingFormData>(
    DEFAULT_PACKAGING_FORM
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Database hooks
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: packaging } = useDexieTable(db.packaging, []);

  // Enriched data
  const enrichedSupplierPackaging = useSupplierPackagingWithDetails();

  // Calculate metrics
  const totalPackaging = enrichedSupplierPackaging.length;
  const avgPrice =
    enrichedSupplierPackaging.reduce((sum, sp) => sum + sp.unitPrice, 0) /
    (enrichedSupplierPackaging.length || 1);
  const highestPrice =
    enrichedSupplierPackaging.length > 0
      ? Math.max(...enrichedSupplierPackaging.map((sp) => sp.unitPrice))
      : 0;
  const avgTax =
    enrichedSupplierPackaging.reduce((sum, sp) => sum + (sp.tax || 0), 0) /
    (enrichedSupplierPackaging.length || 1);

  // Handle add with transaction
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
      await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          const now = new Date().toISOString();

          // Step 1: Check if exact packaging combination already exists
          const existingPackaging = await db.packaging
            .filter(
              (p) =>
                normalizeText(p.name) ===
                  normalizeText(formData.packagingName!) &&
                p.type === formData.packagingType &&
                p.capacity === (formData.capacity || 0) &&
                p.unit === formData.capacityUnit &&
                p.buildMaterial === formData.buildMaterial
            )
            .first();

          // Step 2: Create new packaging (since no exact match exists)
          let packagingId: string;
          if (existingPackaging) {
            packagingId = existingPackaging.id;
          } else {
            packagingId = nanoid();
            await db.packaging.add({
              id: packagingId,
              name: formData.packagingName!.trim(),
              type: formData.packagingType!,
              capacity: formData.capacity || 0,
              unit: formData.capacityUnit!,
              buildMaterial: formData.buildMaterial,
              notes: formData.notes || "",
              createdAt: now,
            });
          }

          // Step 3: Calculate unit price
          const bulkQuantity = formData.quantityForBulkPrice || 1;
          const bulkPrice = formData.bulkPrice!;
          const unitPrice = bulkPrice / bulkQuantity;

          // Step 4: Create supplier packaging

          await db.supplierPackaging.add({
            id: nanoid(),
            supplierId: formData.supplierId!,
            packagingId: packagingId,
            unitPrice: unitPrice,
            bulkPrice: bulkPrice,
            quantityForBulkPrice: bulkQuantity,
            tax: formData.tax || 0,
            moq: formData.moq || 1,
            leadTime: formData.leadTime || 7,
            availability: formData.availability || "in-stock",
            notes: formData.notes || "",
            createdAt: now,
          });
        }
      );

      setFormData(DEFAULT_PACKAGING_FORM);
      setShowAddSupplierPackaging(false);
      toast.success("Supplier packaging added successfully");
    } catch (error: any) {
      console.error("Error adding supplier packaging:", error);
      if (error.message === "DUPLICATE_PACKAGING") {
        toast.error("This exact packaging combination already exists");
      } else {
        toast.error("Failed to add supplier packaging");
      }
    }
  }, [formData]);

  // Handle edit
  const handleEditSupplierPackaging = useCallback(
    async (item: SupplierPackaging) => {
      const pkg = packaging.find((p) => p.id === item.packagingId);
      setEditingSupplierPackaging(item);
      setFormData({
        ...item,
        packagingName: pkg?.name,
        packagingType: pkg?.type,
        capacity: pkg?.capacity,
        capacityUnit: pkg?.unit,
        buildMaterial: pkg?.buildMaterial,
      } as PackagingFormData);
      setShowAddSupplierPackaging(true);
    },
    [packaging]
  );

  // Handle update with transaction
  const handleUpdateSupplierPackaging = useCallback(async () => {
    if (!editingSupplierPackaging) return;

    try {
      await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          const now = new Date().toISOString();

          // Get original packaging data
          const originalPackaging = packaging.find(
            (p) => p.id === editingSupplierPackaging.packagingId
          );

          // Check if any packaging properties changed
          const packagingChanged =
            !originalPackaging ||
            normalizeText(originalPackaging.name) !==
              normalizeText(formData.packagingName!) ||
            originalPackaging.type !== formData.packagingType ||
            originalPackaging.capacity !== (formData.capacity || 0) ||
            originalPackaging.unit !== formData.capacityUnit ||
            originalPackaging.buildMaterial !== formData.buildMaterial;

          let packagingId = editingSupplierPackaging.packagingId;

          if (packagingChanged) {
            const existingPackaging = await db.packaging
              .filter(
                (p) =>
                  normalizeText(p.name) ===
                    normalizeText(formData.packagingName!) &&
                  p.type === formData.packagingType &&
                  p.capacity === (formData.capacity || 0) &&
                  p.unit === formData.capacityUnit &&
                  p.buildMaterial === formData.buildMaterial
              )
              .first();

            if (existingPackaging) {
              // Use existing packaging (exact duplicate)
              packagingId = existingPackaging.id;
            } else {
              // Create new packaging (always, since no exact match exists)
              packagingId = nanoid();
              await db.packaging.add({
                id: packagingId,
                name: formData.packagingName!.trim(),
                type: formData.packagingType!,
                capacity: formData.capacity || 0,
                unit: formData.capacityUnit!,
                buildMaterial: formData.buildMaterial,
                notes: formData.notes || "",
                createdAt: now,
              });
            }
          }

          // Always update supplier packaging record
          const bulkQuantity = formData.quantityForBulkPrice || 1;
          const bulkPrice = formData.bulkPrice || 0;
          const unitPrice = bulkPrice / bulkQuantity;

          await db.supplierPackaging.update(editingSupplierPackaging.id, {
            supplierId: formData.supplierId,
            packagingId: packagingId,
            unitPrice: unitPrice,
            bulkPrice: bulkPrice,
            quantityForBulkPrice: bulkQuantity,
            tax: formData.tax,
            moq: formData.moq,
            leadTime: formData.leadTime,
            availability: formData.availability,
            notes: formData.notes,
            updatedAt: now,
          });
        }
      );

      setFormData(DEFAULT_PACKAGING_FORM);
      setEditingSupplierPackaging(null);
      setShowAddSupplierPackaging(false);
      toast.success("Supplier packaging updated successfully");
    } catch (error: any) {
      console.error("Error updating supplier packaging:", error);
      if (error.message === "DUPLICATE_PACKAGING") {
        toast.error("This exact packaging combination already exists");
      } else {
        toast.error("Failed to update supplier packaging");
      }
    }
  }, [editingSupplierPackaging, formData, packaging]);

  // Handle delete
  const handleDeleteSupplierPackaging = useCallback(async (id: string) => {
    try {
      await db.supplierPackaging.delete(id);
      toast.success("Supplier packaging deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier packaging:", error);
      toast.error("Failed to delete supplier packaging");
    }
  }, []);

  // Reset dialog
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowAddSupplierPackaging(false);
      setEditingSupplierPackaging(null);
      setFormData(DEFAULT_PACKAGING_FORM);
    }
  }, []);

  // Handle refresh from drawer
  const handleDrawerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Packaging"
              value={totalPackaging}
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
              value={`₹${avgPrice.toFixed(2)}`}
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
              value={`₹${highestPrice.toFixed(2)}`}
              icon={TrendingUp}
              iconClassName="text-primary"
              description="per piece"
            />

            <MetricCard
              title="Avg Tax Rate"
              value={`${avgTax.toFixed(1)}%`}
              icon={BarChart3}
              iconClassName="text-primary"
              description="average across all packaging"
            />
          </div>

          <SupplierPackagingTable
            supplierPackaging={enrichedSupplierPackaging}
            suppliers={suppliers}
            onEditPackaging={handleEditSupplierPackaging}
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

      {/* Enhanced Supplier Packaging Dialog with refresh trigger */}
      <EnhancedSupplierPackagingDialog
        key={refreshTrigger}
        open={showAddSupplierPackaging}
        onOpenChange={handleDialogClose}
        packaging={formData}
        setPackaging={setFormData}
        onSave={
          editingSupplierPackaging
            ? handleUpdateSupplierPackaging
            : handleAddSupplierPackaging
        }
        suppliers={suppliers}
        packagingList={packaging}
        isEditing={!!editingSupplierPackaging}
      />

      {/* Packaging Management Drawer */}
      <PackagingDrawer
        open={showPackagingDrawer}
        onOpenChange={setShowPackagingDrawer}
        onRefresh={handleDrawerRefresh}
      />
    </div>
  );
}
