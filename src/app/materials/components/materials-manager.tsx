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

import { MaterialsTable } from "./materials-table";
import { MaterialsPriceComparison } from "./materials-price-comparison";
import { MaterialsAnalytics } from "./materials-analytics";
import { MaterialDialog } from "./materials-dialog";

import type { SupplierMaterial } from "@/lib/types";
import {
  MATERIALS,
  CATEGORIES,
  SUPPLIERS,
  SUPPLIER_MATERIALS,
} from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { DEFAULT_MATERIAL_FORM } from "./materials-config";
import { db } from "@/lib/db";
import { MetricCard } from "@/components/ui/metric-card";

export function MaterialsManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<SupplierMaterial | null>(null);
  const [formData, setFormData] = useState<Partial<SupplierMaterial>>(
    DEFAULT_MATERIAL_FORM
  );

  // Database hooks
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const {
    data: supplierMaterials,
    addItem: addSupplierMaterial,
    updateItem: updateSupplierMaterial,
    deleteItem: deleteSupplierMaterial,
  } = useDexieTable(db.supplierMaterials, SUPPLIER_MATERIALS);
  const { data: materials, addItem: addMaterial } = useDexieTable(
    db.materials,
    MATERIALS
  );

   const totalMaterials = supplierMaterials.length;
  const avgPrice =
    supplierMaterials.reduce((sum, sm) => sum + sm.unitPrice, 0) /
    (supplierMaterials.length || 1); // Avoid division by zero
  const highestPrice =
    supplierMaterials.length > 0
      ? Math.max(...supplierMaterials.map((sm) => sm.unitPrice))
      : 0;
  const avgTax =
    supplierMaterials.reduce((sum, sm) => sum + sm.tax, 0) /
    (supplierMaterials.length || 1);
  
  // Handle add material
  const handleAddMaterial = useCallback(async () => {
    if (!formData.supplierId || !formData.materialName || !formData.unitPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Check if material exists, if not create it
      const existingMaterial = materials.find(
        (m) => m.name === formData.materialName
      );
      if (!existingMaterial && formData.materialName) {
        await addMaterial({
          name: formData.materialName,
          category: formData.materialCategory || "Other",
          unit: formData.unit || "kg",
          notes: formData.notes || "",
        });
      }

      // Add supplier material
      await addSupplierMaterial({
        supplierId: formData.supplierId,
        materialId: "",
        tax: 0,
        materialName: formData.materialName,
        materialCategory: formData.materialCategory || "Other",
        unitPrice: formData.unitPrice,
        moq: formData.moq || 1,
        unit: formData.unit || "kg",
        bulkDiscounts: formData.bulkDiscounts || [],
        leadTime: formData.leadTime || 7,
        availability: formData.availability || "in-stock",
        notes: formData.notes || "",
        priceWithTax: formData.priceWithTax || 0,
      });

      setFormData(DEFAULT_MATERIAL_FORM);
      setShowAddDialog(false);
      toast.success("Material added successfully");
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    }
  }, [formData, addMaterial, addSupplierMaterial, materials]);

  // Handle edit material
  const handleEditMaterial = useCallback((material: SupplierMaterial) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowAddDialog(true);
  }, []);

  // Handle update material
  const handleUpdateMaterial = useCallback(async () => {
    if (!editingMaterial) return;

    try {
      await updateSupplierMaterial({
        ...editingMaterial,
        ...formData,
      });
      setFormData(DEFAULT_MATERIAL_FORM);
      setEditingMaterial(null);
      setShowAddDialog(false);
      toast.success("Material updated successfully");
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Failed to update material");
    }
  }, [editingMaterial, formData, updateSupplierMaterial]);

  // Handle delete material
  const handleDeleteMaterial = useCallback(
    async (id: string) => {
      try {
        await deleteSupplierMaterial(id);
        toast.success("Material deleted successfully");
      } catch (error) {
        console.error("Error deleting material:", error);
        toast.error("Failed to delete material");
      }
    },
    [deleteSupplierMaterial]
  );

  // Reset dialog state
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowAddDialog(false);
      setEditingMaterial(null);
      setFormData(DEFAULT_MATERIAL_FORM);
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
            materials={supplierMaterials}
            suppliers={suppliers}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
          />
        </TabsContent>

        <TabsContent value="price-comparison" className="space-y-6">
          <MaterialsPriceComparison
            supplierMaterials={supplierMaterials}
            suppliers={suppliers}
          />
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
      <MaterialDialog
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
