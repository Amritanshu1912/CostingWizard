// materials-manager.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { CategoryManager } from "@/components/category-manager";
import { MaterialDialog } from "./materials-dialog";
import { MaterialsTab } from "./materials-tab";
import { MaterialsFilters } from "./MaterialsFilters";
import { MaterialsTable } from "./MaterialsTable";
import { PriceComparison } from "./PriceComparison";
import { AddMaterialDialog } from "./AddMaterialDialogFromSupplierPage";

import type {
  Category,
  Material,
  Supplier,
  SupplierMaterial,
} from "@/lib/types";
import {
  MATERIALS,
  CATEGORIES,
  SUPPLIERS,
  SUPPLIER_MATERIALS,
} from "@/lib/constants";
import { MATERIAL_COLUMNS } from "./materials-columns";
import { MaterialsAnalytics } from "./materials-analytics";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  DEFAULT_MATERIAL_FORM,
  MATERIAL_CATEGORIES,
} from "./materials-constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  // State to control the single unified dialog
  // If null, the dialog is closed. If a Material object, the dialog is in Edit mode.
  // We use a separate boolean for the Add button trigger for cleaner UX.
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Supplier materials state
  const [suppliers, setSuppliers] = useLocalStorage("suppliers", SUPPLIERS);
  const [supplierMaterials, setSupplierMaterials] = useLocalStorage(
    "supplier-materials",
    SUPPLIER_MATERIALS
  );
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [selectedSupplierCategory, setSelectedSupplierCategory] =
    useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [showAddSupplierMaterial, setShowAddSupplierMaterial] = useState(false);
  const [editingSupplierMaterial, setEditingSupplierMaterial] =
    useState<SupplierMaterial | null>(null);
  const [newSupplierMaterial, setNewSupplierMaterial] = useState<
    Partial<SupplierMaterial>
  >(DEFAULT_MATERIAL_FORM);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveMaterial = (material: Material) => {
    if (materials.some((m) => m.id === material.id)) {
      // Logic for EDIT mode
      setMaterials(materials.map((m) => (m.id === material.id ? material : m)));
      toast.success("Material updated successfully");
    } else {
      // Logic for ADD mode
      setMaterials([...materials, material]);
      toast.success("Material added successfully");
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    toast.success("Material deleted successfully");
  };

  // Quick Stats Calculations (using new camelCase fields)
  const totalMaterials = materials.length;
  const avgPrice =
    materials.reduce((sum, m) => sum + (m.priceWithTax || 0), 0) /
    (materials.length || 1); // Avoid division by zero
  const highestPrice = Math.max(...materials.map((m) => m.priceWithTax || 0));
  const avgTax =
    materials.reduce((sum, m) => sum + (m.tax || 0), 0) /
    (materials.length || 1);

  // Action Handlers for Table
  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
  };

  const handleCloseDialog = () => {
    setIsAddMode(false);
    setEditingMaterial(null);
  };

  // Supplier materials logic
  const filteredSupplierMaterials = supplierMaterials.filter((material) => {
    const supplier = suppliers.find((s) => s.id === material.supplierId);
    const matchesSearch =
      material.materialName
        .toLowerCase()
        .includes(supplierSearchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(supplierSearchTerm.toLowerCase());
    const matchesCategory =
      selectedSupplierCategory === "all" ||
      material.materialCategory === selectedSupplierCategory;
    const matchesSupplier =
      selectedSupplier === "all" || material.supplierId === selectedSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const addSupplierMaterial = () => {
    if (
      !newSupplierMaterial.supplierId ||
      !newSupplierMaterial.materialName ||
      !newSupplierMaterial.unitPrice
    )
      return;
    const material: SupplierMaterial = {
      id: Date.now().toString(),
      supplierId: newSupplierMaterial.supplierId,
      materialName: newSupplierMaterial.materialName,
      materialCategory: newSupplierMaterial.materialCategory || "Other",
      unitPrice: newSupplierMaterial.unitPrice,
      currency: newSupplierMaterial.currency || "INR",
      moq: newSupplierMaterial.moq || 1,
      unit: newSupplierMaterial.unit || "kg",
      bulkDiscounts: newSupplierMaterial.bulkDiscounts || [],
      leadTime: newSupplierMaterial.leadTime || 7,
      availability: newSupplierMaterial.availability || "in-stock",
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: newSupplierMaterial.notes || "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSupplierMaterials([...supplierMaterials, material]);
    setNewSupplierMaterial(DEFAULT_MATERIAL_FORM);
    setShowAddSupplierMaterial(false);
  };

  const deleteSupplierMaterial = (id: string) => {
    setSupplierMaterials(supplierMaterials.filter((m) => m.id !== id));
  };

  // Material Columns are now imported
  const materialColumns = MATERIAL_COLUMNS({
    onEdit: handleEdit,
    onDelete: handleDeleteMaterial,
  });

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
            onCategoriesChange={setCategories}
          />
          <Button
            variant="outline"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setShowAddSupplierMaterial(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Supplier Material</span>
          </Button>
          <Button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setIsAddMode(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Material</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="supplier-materials">
            Supplier Materials
          </TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          <MaterialsTab
            totalMaterials={totalMaterials}
            avgPrice={avgPrice}
            highestPrice={highestPrice}
            avgTax={avgTax}
            materials={materials}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            filteredMaterials={filteredMaterials}
            materialColumns={materialColumns}
          />
        </TabsContent>

        <TabsContent value="supplier-materials" className="space-y-6">
          <MaterialsFilters
            searchTerm={supplierSearchTerm}
            setSearchTerm={setSupplierSearchTerm}
            selectedCategory={selectedSupplierCategory}
            setSelectedCategory={setSelectedSupplierCategory}
            selectedSupplier={selectedSupplier}
            setSelectedSupplier={setSelectedSupplier}
            suppliers={suppliers}
            categories={[...MATERIAL_CATEGORIES]}
          />
          <MaterialsTable
            filteredMaterials={filteredSupplierMaterials}
            suppliers={suppliers}
            onEditMaterial={setEditingSupplierMaterial}
            onDeleteMaterial={deleteSupplierMaterial}
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

      {/* Add Supplier Material Dialog */}
      <AddMaterialDialog
        open={showAddSupplierMaterial}
        onOpenChange={setShowAddSupplierMaterial}
        newMaterial={newSupplierMaterial}
        setNewMaterial={setNewSupplierMaterial}
        addMaterial={addSupplierMaterial}
        suppliers={suppliers}
      />

      {/* Unified Material Dialog */}
      <MaterialDialog
        isOpen={isAddMode || !!editingMaterial}
        onClose={handleCloseDialog}
        onSave={handleSaveMaterial}
        categories={categories}
        initialMaterial={editingMaterial}
      />
    </div>
  );
}
