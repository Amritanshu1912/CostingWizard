// materials-manager.tsx

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CategoryManager } from "@/components/category-manager";
import { MaterialDialog } from "./materials-dialog";
import { MaterialsTab } from "./materials-tab";
import { PriceComparison } from "./PriceComparison";
import { MaterialsAnalytics } from "./materials-analytics";
import type { SupplierMaterial } from "@/lib/types";
import {
  MATERIALS,
  CATEGORIES,
  SUPPLIERS,
  SUPPLIER_MATERIALS,
} from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { DEFAULT_MATERIAL_FORM } from "./materials-constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { db } from "@/lib/db";

export function MaterialsManager() {
  const [showAddSupplierMaterial, setShowAddSupplierMaterial] = useState(false);
  const [editingSupplierMaterial, setEditingSupplierMaterial] =
    useState<SupplierMaterial | null>(null);
  const [newSupplierMaterial, setNewSupplierMaterial] = useState<
    Partial<SupplierMaterial>
  >(DEFAULT_MATERIAL_FORM);

  // Materials tab state
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState("");
  const [selectedMaterialsCategory, setSelectedMaterialsCategory] =
    useState("all");
  const [selectedMaterialsSupplier, setSelectedMaterialsSupplier] =
    useState("all");

  // Supplier materials state
  const {
    data: suppliers,
    updateItem: updateSupplier,
    addItem: addSupplier,
  } = useDexieTable(db.suppliers, SUPPLIERS);
  const {
    data: supplierMaterials,
    updateItem: updateSupplierMaterial,
    addItem: addSupplierMaterial,
    deleteItem: deleteSupplierMaterialItem,
  } = useDexieTable(db.supplierMaterials, SUPPLIER_MATERIALS);
  const {
    data: materials,
    updateItem: updateMaterial,
    addItem: addMaterial,
    deleteItem: deleteMaterial,
  } = useDexieTable(db.materials, MATERIALS);
  const {
    data: categories,
    updateItem: updateCategory,
    addItem: addCategory,
    deleteItem: deleteCategory,
  } = useDexieTable(db.categories, CATEGORIES);

  // Materials tab filtering
  const filteredMaterials = supplierMaterials.filter((material) => {
    const supplier = suppliers.find((s) => s.id === material.supplierId);
    const matchesSearch =
      material.materialName
        .toLowerCase()
        .includes(materialsSearchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(materialsSearchTerm.toLowerCase());
    const matchesCategory =
      selectedMaterialsCategory === "all" ||
      material.materialCategory === selectedMaterialsCategory;
    const matchesSupplier =
      selectedMaterialsSupplier === "all" ||
      material.supplierId === selectedMaterialsSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleAddSupplierMaterial = useCallback(async () => {
    if (
      !newSupplierMaterial.supplierId ||
      !newSupplierMaterial.materialName ||
      !newSupplierMaterial.unitPrice
    )
      return;
    try {
      // Check if material exists
      const existingMaterial = materials.find(
        (m) => m.name === newSupplierMaterial.materialName
      );
      if (!existingMaterial && newSupplierMaterial.materialName) {
        // Auto-create material
        await addMaterial({
          name: newSupplierMaterial.materialName,
          category: newSupplierMaterial.materialCategory || "Other",
          unit: newSupplierMaterial.unit || "kg",
          notes: newSupplierMaterial.notes || "",
        });
      }
      await addSupplierMaterial({
        supplierId: newSupplierMaterial.supplierId,
        materialId: "",
        materialName: newSupplierMaterial.materialName,
        materialCategory: newSupplierMaterial.materialCategory || "Other",
        unit: newSupplierMaterial.unit || "kg",
        unitPrice: newSupplierMaterial.unitPrice,
        tax: newSupplierMaterial.tax || 0,
        priceWithTax:
          newSupplierMaterial.unitPrice *
          (1 + (newSupplierMaterial.tax || 0) / 100),
        moq: newSupplierMaterial.moq || 1,
        bulkDiscounts: newSupplierMaterial.bulkDiscounts || [],
        leadTime: newSupplierMaterial.leadTime || 7,
        availability: newSupplierMaterial.availability || "in-stock",
        transportationCost: newSupplierMaterial.transportationCost || 0,
        notes: newSupplierMaterial.notes || "",
      });
      setNewSupplierMaterial(DEFAULT_MATERIAL_FORM);
      setShowAddSupplierMaterial(false);
      toast.success("Supplier material added successfully");
    } catch (error) {
      console.error("Error adding supplier material:", error);
      toast.error("Failed to add supplier material");
    }
  }, [newSupplierMaterial, addSupplierMaterial, addMaterial, materials]);

  const handleUpdateSupplierMaterial = useCallback(async () => {
    if (
      !editingSupplierMaterial ||
      !newSupplierMaterial.supplierId ||
      !newSupplierMaterial.materialName ||
      !newSupplierMaterial.unitPrice
    )
      return;
    try {
      await updateSupplierMaterial({
        ...editingSupplierMaterial,
        supplierId: newSupplierMaterial.supplierId,
        materialName: newSupplierMaterial.materialName,
        materialCategory: newSupplierMaterial.materialCategory || "Other",
        unitPrice: newSupplierMaterial.unitPrice,
        tax: newSupplierMaterial.tax || 0,
        priceWithTax:
          newSupplierMaterial.unitPrice *
          (1 + (newSupplierMaterial.tax || 0) / 100),
        moq: newSupplierMaterial.moq || 1,
        unit: newSupplierMaterial.unit || "kg",
        bulkDiscounts: newSupplierMaterial.bulkDiscounts || [],
        leadTime: newSupplierMaterial.leadTime || 7,
        availability: newSupplierMaterial.availability || "in-stock",
        transportationCost: newSupplierMaterial.transportationCost || 0,
        notes: newSupplierMaterial.notes || "",
      });
      setNewSupplierMaterial(DEFAULT_MATERIAL_FORM);
      setEditingSupplierMaterial(null);
      setShowAddSupplierMaterial(false);
      toast.success("Supplier material updated successfully");
    } catch (error) {
      console.error("Error updating supplier material:", error);
      toast.error("Failed to update supplier material");
    }
  }, [editingSupplierMaterial, newSupplierMaterial, updateSupplierMaterial]);

  // Quick Stats Calculations (using new camelCase fields)
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <CategoryManager
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
          />
          <Button
            variant="outline"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setShowAddSupplierMaterial(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Supplier Material</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          <MaterialsTab
            totalMaterials={totalMaterials}
            avgPrice={avgPrice}
            highestPrice={highestPrice}
            avgTax={avgTax}
            searchTerm={materialsSearchTerm}
            onSearchChange={setMaterialsSearchTerm}
            selectedCategory={selectedMaterialsCategory}
            onCategoryChange={setSelectedMaterialsCategory}
            selectedSupplier={selectedMaterialsSupplier}
            onSupplierChange={setSelectedMaterialsSupplier}
            categories={categories}
            suppliers={suppliers}
            filteredMaterials={filteredMaterials}
            onEditMaterial={(material) => {
              setEditingSupplierMaterial(material);
              setNewSupplierMaterial(material);
              setShowAddSupplierMaterial(true);
            }}
            onDeleteMaterial={deleteSupplierMaterialItem}
          />
        </TabsContent>

        <TabsContent value="price-comparison" className="space-y-6">
          <PriceComparison
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

      {/* Add/Edit Supplier Material Dialog */}
      <MaterialDialog
        open={showAddSupplierMaterial}
        onOpenChange={(open) => {
          setShowAddSupplierMaterial(open);
          if (!open) {
            setEditingSupplierMaterial(null);
            setNewSupplierMaterial(DEFAULT_MATERIAL_FORM);
          }
        }}
        newMaterial={newSupplierMaterial}
        setNewMaterial={setNewSupplierMaterial}
        onSubmit={
          editingSupplierMaterial
            ? handleUpdateSupplierMaterial
            : handleAddSupplierMaterial
        }
        isEditing={!!editingSupplierMaterial}
        suppliers={suppliers}
      />
    </div>
  );
}
