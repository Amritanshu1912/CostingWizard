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
import { BarChart3, Package, Plus, TrendingUp } from "lucide-react";
import { nanoid } from "nanoid";

import { MaterialsTable } from "./materials-table";
import { MaterialsPriceComparison } from "./materials-price-comparison";
import { MaterialsAnalytics } from "./materials-analytics";
import { EnhancedMaterialDialog } from "./materials-dialog";

import type { SupplierMaterial } from "@/lib/types";
import type { MaterialFormData } from "./materials-dialog";
import { SUPPLIERS } from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { DEFAULT_MATERIAL_FORM } from "./materials-config";
import { db } from "@/lib/db";
import { MetricCard } from "@/components/ui/metric-card";

export function MaterialsManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<SupplierMaterial | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(
    DEFAULT_MATERIAL_FORM
  );

  // Use the smart hook that auto-joins data
  const enrichedMaterials = useSupplierMaterialsWithDetails();

  // Database hooks
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: materials, addItem: addMaterialToDb } = useDexieTable(
    db.materials,
    []
  );

  const totalMaterials = enrichedMaterials.length;
  const avgPrice =
    enrichedMaterials.reduce((sum, sm) => sum + sm.unitPrice, 0) /
    (enrichedMaterials.length || 1); // Avoid division by zero
  const highestPrice =
    enrichedMaterials.length > 0
      ? Math.max(...enrichedMaterials.map((sm) => sm.unitPrice))
      : 0;
  const avgTax =
    enrichedMaterials.reduce((sum, sm) => sum + sm.tax, 0) /
    (enrichedMaterials.length || 1);

  // Handle add material
  const handleAddMaterial = useCallback(async () => {
    if (!formData.supplierId || !formData.materialName || !formData.unitPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const now = new Date().toISOString();

      // Step 1: Get or create material (material name is unique identifier)
      const normalizedName = formData.materialName.trim().toLowerCase();
      const existingMaterial = await db.materials
        .filter((m) => m.name.trim().toLowerCase() === normalizedName)
        .first();

      let materialId: string;

      if (existingMaterial) {
        // Material exists by name - use existing materialId
        materialId = existingMaterial.id;

        // If category changed, update the master material (affects all supplier materials)
        if (existingMaterial.category !== formData.materialCategory) {
          await db.materials.update(existingMaterial.id, {
            category: formData.materialCategory,
            updatedAt: now,
          });
        }
      } else {
        // Create new material with name + category
        materialId = nanoid();
        await db.materials.add({
          id: materialId,
          name: formData.materialName.trim(),
          category: formData.materialCategory || "Other",
          notes: formData.notes || "",
          createdAt: now,
        });
      }

      // Step 2: Create supplier material
      await db.supplierMaterials.add({
        id: nanoid(),
        supplierId: formData.supplierId,
        materialId,
        tax: formData.tax || 0,
        unitPrice: formData.unitPrice,
        unit: formData.unit || "kg",
        moq: formData.moq || 1,
        bulkDiscounts: formData.bulkDiscounts || [],
        leadTime: formData.leadTime || 7,
        availability: formData.availability || "in-stock",
        transportationCost: formData.transportationCost,
        notes: formData.notes || "",
        createdAt: now,
      });

      setFormData(DEFAULT_MATERIAL_FORM);
      setShowAddDialog(false);
      toast.success("Material added successfully");
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    }
  }, [formData]);

  // Handle edit
  const handleEditMaterial = useCallback((material: SupplierMaterial) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowAddDialog(true);
  }, []);

  // Handle update
  const handleUpdateMaterial = useCallback(async () => {
    if (!editingMaterial) return;

    try {
      const now = new Date().toISOString();

      // Get the original material for comparison
      const originalMaterial = await db.materials.get(
        editingMaterial.materialId
      );
      if (!originalMaterial) {
        toast.error("Original material not found");
        return;
      }

      const normalizedNewName = formData.materialName!.trim().toLowerCase();
      const normalizedOriginalName = originalMaterial.name.trim().toLowerCase();

      let materialId = editingMaterial.materialId;

      // Check if material name changed
      if (normalizedNewName !== normalizedOriginalName) {
        // Scenario A: User changed material name to new name
        const existingMaterialWithNewName = await db.materials
          .filter((m) => m.name.trim().toLowerCase() === normalizedNewName)
          .first();

        if (existingMaterialWithNewName) {
          // Scenario C: Changed to existing material name - use existing materialId
          materialId = existingMaterialWithNewName.id;

          // Update category if changed
          if (
            existingMaterialWithNewName.category !== formData.materialCategory
          ) {
            await db.materials.update(existingMaterialWithNewName.id, {
              category: formData.materialCategory,
              updatedAt: now,
            });
          }
        } else {
          // Create new material with new name
          materialId = nanoid();
          await db.materials.add({
            id: materialId,
            name: formData.materialName!.trim(),
            category: formData.materialCategory || "Other",
            notes: formData.notes || "",
            createdAt: now,
          });
        }
      } else {
        // Scenario B: Same material name, check if category changed
        if (originalMaterial.category !== formData.materialCategory) {
          // Update master material's category (affects all supplier materials using this material)
          await db.materials.update(originalMaterial.id, {
            category: formData.materialCategory,
            updatedAt: now,
          });
        }
      }

      // Update supplier material with new/existing materialId
      await db.supplierMaterials.update(editingMaterial.id, {
        ...formData,
        materialId: materialId,
        updatedAt: now,
      });

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
      toast.success("Material deleted successfully");
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    }
  }, []);

  // Reset dialog
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowAddDialog(false);
      setEditingMaterial(null);
      setFormData(DEFAULT_MATERIAL_FORM);
      // Note: duplicateWarning is handled in the dialog component itself
    }
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
        <Button
          onClick={() => setShowAddDialog(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="truncate">Add Material</span>
        </Button>
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
        open={showAddDialog}
        onOpenChange={handleDialogClose}
        material={formData}
        setMaterial={setFormData}
        onSave={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
        suppliers={suppliers}
        materials={materials}
        isEditing={!!editingMaterial}
      />
    </div>
  );
}
