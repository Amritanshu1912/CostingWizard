"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { BarChart3, Package, Plus, TrendingUp, List } from "lucide-react";
import { nanoid } from "nanoid";

import { MaterialsTable } from "./supplier-materials-table";
import { MaterialsPriceComparison } from "./materials-price-comparison";
import { MaterialsAnalytics } from "./materials-analytics";
import { EnhancedMaterialDialog } from "./supplier-materials-dialog";
import { MaterialsDrawer } from "./materials-drawer";

import type { SupplierMaterial } from "@/lib/types";
import type { MaterialFormData } from "./supplier-materials-dialog";
import { SUPPLIERS } from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { DEFAULT_MATERIAL_FORM } from "./materials-config";
import { db } from "@/lib/db";
import { MetricCard } from "@/components/ui/metric-card";
import { normalizeText } from "@/lib/text-utils";
import { assignCategoryColor } from "@/lib/color-utils";

export function MaterialsManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMaterialsDrawer, setShowMaterialsDrawer] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<SupplierMaterial | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(
    DEFAULT_MATERIAL_FORM
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use the smart hook that auto-joins data
  const enrichedMaterials = useSupplierMaterialsWithDetails();

  // Database hooks
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: materials } = useDexieTable(db.materials, []);
  const { data: categories } = useDexieTable(db.categories, []);

  const totalMaterials = enrichedMaterials.length;
  const avgPrice =
    enrichedMaterials.reduce((sum, sm) => sum + sm.unitPrice, 0) /
    (enrichedMaterials.length || 1);
  const highestPrice =
    enrichedMaterials.length > 0
      ? Math.max(...enrichedMaterials.map((sm) => sm.unitPrice))
      : 0;
  const avgTax =
    enrichedMaterials.reduce((sum, sm) => sum + sm.tax, 0) /
    (enrichedMaterials.length || 1);

  // Handle add material with transaction
  const handleAddMaterial = useCallback(async () => {
    if (!formData.supplierId || !formData.materialName || !formData.bulkPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          const now = new Date().toISOString();

          // Step 1: Create/get category
          let categoryToUse = formData.materialCategory || "Other";
          const normalizedCatName = normalizeText(categoryToUse);

          const existingCategory = await db.categories
            .filter((c) => normalizeText(c.name) === normalizedCatName)
            .first();

          if (!existingCategory) {
            await db.categories.add({
              id: nanoid(),
              name: categoryToUse,
              color: assignCategoryColor(categoryToUse),
              createdAt: now,
            });
          }

          // Step 2: Get or create material
          let materialId = formData.materialId;

          if (!materialId || materialId === "") {
            const normalizedName = normalizeText(formData.materialName || "");
            const existingMaterial = await db.materials
              .filter((m) => normalizeText(m.name) === normalizedName)
              .first();

            if (existingMaterial) {
              materialId = existingMaterial.id;

              // Update category if changed
              if (existingMaterial.category !== categoryToUse) {
                await db.materials.update(existingMaterial.id, {
                  category: categoryToUse,
                  updatedAt: now,
                });
              }
            } else {
              // Create new material
              materialId = nanoid();
              await db.materials.add({
                id: materialId,
                name: (formData.materialName || "").trim(),
                category: categoryToUse,
                notes: formData.notes || "",
                createdAt: now,
              });
            }
          }

          // Step 3: Calculate unit price
          const quantityForBulkPrice = formData.quantityForBulkPrice || 1;
          const bulkPrice = formData.bulkPrice || 0;
          const unitPrice = bulkPrice / quantityForBulkPrice;

          // Step 4: Create supplier material
          await db.supplierMaterials.add({
            id: nanoid(),
            supplierId: formData.supplierId || "",
            materialId,
            unitPrice: unitPrice,
            bulkPrice: bulkPrice,
            quantityForBulkPrice: quantityForBulkPrice,
            tax: formData.tax || 0,
            unit: formData.unit || "kg",
            moq: formData.moq || 1,
            bulkDiscounts: formData.bulkDiscounts || [],
            leadTime: formData.leadTime || 7,
            availability: formData.availability || "in-stock",
            transportationCost: formData.transportationCost,
            notes: formData.notes || "",
            createdAt: now,
          });
        }
      );

      setFormData(DEFAULT_MATERIAL_FORM);
      setShowAddDialog(false);
      toast.success("Material added successfully");
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    }
  }, [formData]);

  // Handle edit
  const handleEditMaterial = useCallback(async (material: SupplierMaterial) => {
    setEditingMaterial(material);

    // Fetch the material details
    const materialDetails = await db.materials.get(material.materialId);

    setFormData({
      ...material,
      materialName: materialDetails?.name,
      materialCategory: materialDetails?.category,
    } as MaterialFormData);
    setShowAddDialog(true);
  }, []);

  // Handle update with transaction
  const handleUpdateMaterial = useCallback(async () => {
    if (!editingMaterial) return;

    try {
      await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          const now = new Date().toISOString();

          // Step 1: Create/get category
          let categoryToUse = formData.materialCategory || "Other";
          const normalizedCatName = normalizeText(categoryToUse);

          const existingCategory = await db.categories
            .filter((c) => normalizeText(c.name) === normalizedCatName)
            .first();

          if (!existingCategory) {
            await db.categories.add({
              id: nanoid(),
              name: categoryToUse,
              color: assignCategoryColor(categoryToUse),
              createdAt: now,
            });
          }

          // Step 2: Handle material
          let materialId = formData.materialId;

          if (!materialId || materialId === "") {
            // Creating new material during edit
            const normalizedName = normalizeText(formData.materialName || "");
            const existingMaterial = await db.materials
              .filter((m) => normalizeText(m.name) === normalizedName)
              .first();

            if (existingMaterial) {
              materialId = existingMaterial.id;

              // Update category if changed
              if (existingMaterial.category !== categoryToUse) {
                await db.materials.update(existingMaterial.id, {
                  category: categoryToUse,
                  updatedAt: now,
                });
              }
            } else {
              // Create new material
              materialId = nanoid();
              await db.materials.add({
                id: materialId,
                name: (formData.materialName || "").trim(),
                category: categoryToUse,
                notes: formData.notes || "",
                createdAt: now,
              });
            }
          } else {
            // Material exists - check if category changed
            const existingMaterial = await db.materials.get(materialId);
            if (
              existingMaterial &&
              existingMaterial.category !== categoryToUse
            ) {
              await db.materials.update(materialId, {
                category: categoryToUse,
                updatedAt: now,
              });
            }
          }

          // Step 3: Calculate unit price
          const quantityForBulkPrice = formData.quantityForBulkPrice || 1;
          const bulkPrice = formData.bulkPrice || 0;
          const unitPrice = bulkPrice / quantityForBulkPrice;

          // Step 4: Update supplier material
          await db.supplierMaterials.update(editingMaterial.id, {
            ...formData,
            materialId: materialId,
            unitPrice: unitPrice,
            bulkPrice: bulkPrice,
            quantityForBulkPrice: quantityForBulkPrice,
            updatedAt: now,
          });
        }
      );

      setFormData(DEFAULT_MATERIAL_FORM);
      setEditingMaterial(null);
      setShowAddDialog(false);
      toast.success("Material updated successfully");
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Failed to update material");
    }
  }, [editingMaterial, formData]);

  // Handle delete
  const handleDeleteMaterial = useCallback(async (id: string) => {
    try {
      await db.supplierMaterials.delete(id);
      toast.success("Supplier material deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier material:", error);
      toast.error("Failed to delete supplier material");
    }
  }, []);

  // Reset dialog
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowAddDialog(false);
      setEditingMaterial(null);
      setFormData(DEFAULT_MATERIAL_FORM);
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
            Raw Materials Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your raw materials inventory and pricing
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowMaterialsDrawer(true)}
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
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Materials"
              value={totalMaterials}
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
              value={`₹${avgPrice.toFixed(2)}`}
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
              value={`₹${highestPrice.toFixed(2)}`}
              icon={TrendingUp}
              iconClassName="text-primary"
              description="per kg"
            />

            <MetricCard
              title="Avg Tax Rate"
              value={`${avgTax.toFixed(1)}%`}
              icon={BarChart3}
              iconClassName="text-primary"
              description="average across all materials"
            />
          </div>
          <MaterialsTable
            materials={enrichedMaterials}
            suppliers={suppliers}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            onAddMaterial={() => setShowAddDialog(true)}
          />
        </TabsContent>

        <TabsContent value="price-comparison" className="space-y-6">
          <MaterialsPriceComparison />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Materials Analytics</CardTitle>
              <CardDescription>
                Insights and trends for your raw materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaterialsAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <EnhancedMaterialDialog
        key={refreshTrigger}
        open={showAddDialog}
        onOpenChange={handleDialogClose}
        material={formData}
        setMaterial={setFormData}
        onSave={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
        suppliers={suppliers}
        materials={materials}
        categories={categories}
        isEditing={!!editingMaterial}
      />

      {/* Materials Management Drawer */}
      <MaterialsDrawer
        open={showMaterialsDrawer}
        onOpenChange={setShowMaterialsDrawer}
        onRefresh={handleDrawerRefresh}
      />
    </div>
  );
}
