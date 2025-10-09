"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Supplier, SupplierMaterial } from "@/lib/types";
import { SUPPLIERS, SUPPLIER_MATERIALS } from "@/lib/constants";
import {
  DEFAULT_SUPPLIER_FORM,
  DEFAULT_MATERIAL_FORM,
} from "./supplier-management-constants";
import { AddSupplierDialog } from "./AddSupplierDialog";
import { AddMaterialDialog } from "./AddMaterialDialog";
import { MaterialsFilters } from "./MaterialsFilters";
import { MaterialsTable } from "./MaterialsTable";
import { SuppliersGrid } from "./SuppliersGrid";
import { PriceComparison } from "./PriceComparison";

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useLocalStorage("suppliers", SUPPLIERS);
  const [supplierMaterials, setSupplierMaterials] = useLocalStorage(
    "supplier-materials",
    SUPPLIER_MATERIALS
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingMaterial, setEditingMaterial] =
    useState<SupplierMaterial | null>(null);

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>(
    DEFAULT_SUPPLIER_FORM
  );
  const [newMaterial, setNewMaterial] = useState<Partial<SupplierMaterial>>(
    DEFAULT_MATERIAL_FORM
  );

  const categories = Array.from(
    new Set(supplierMaterials.map((m) => m.materialCategory))
  );

  const filteredMaterials = supplierMaterials.filter((material) => {
    const supplier = suppliers.find((s) => s.id === material.supplierId);
    const matchesSearch =
      material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      material.materialCategory === selectedCategory;
    const matchesSupplier =
      selectedSupplier === "all" || material.supplierId === selectedSupplier;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const addSupplier = () => {
    if (!newSupplier.name || !newSupplier.contactPerson) return;

    const supplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson,
      email: newSupplier.email || "",
      phone: newSupplier.phone || "",
      address: newSupplier.address || "",
      rating: newSupplier.rating || 5,
      isActive: newSupplier.isActive ?? true,
      paymentTerms: newSupplier.paymentTerms || "30 days",
      leadTime: newSupplier.leadTime || 7,
      notes: newSupplier.notes || "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier(DEFAULT_SUPPLIER_FORM);
    setShowAddSupplier(false);
  };

  const addMaterial = () => {
    if (
      !newMaterial.supplierId ||
      !newMaterial.materialName ||
      !newMaterial.unitPrice
    )
      return;

    const material: SupplierMaterial = {
      id: Date.now().toString(),
      supplierId: newMaterial.supplierId,
      materialName: newMaterial.materialName,
      materialCategory: newMaterial.materialCategory || "Other",
      unitPrice: newMaterial.unitPrice,
      currency: newMaterial.currency || "INR",
      moq: newMaterial.moq || 1,
      unit: newMaterial.unit || "kg",
      bulkDiscounts: newMaterial.bulkDiscounts || [],
      leadTime: newMaterial.leadTime || 7,
      availability: newMaterial.availability || "in-stock",
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: newMaterial.notes || "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSupplierMaterials([...supplierMaterials, material]);
    setNewMaterial(DEFAULT_MATERIAL_FORM);
    setShowAddMaterial(false);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
    setSupplierMaterials(supplierMaterials.filter((m) => m.supplierId !== id));
  };

  const deleteMaterial = (id: string) => {
    setSupplierMaterials(supplierMaterials.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Supplier Management
          </h2>
          <p className="text-muted-foreground">
            Manage suppliers, materials, pricing, and MOQ requirements
          </p>
        </div>
        <div className="flex gap-2">
          <AddSupplierDialog
            open={showAddSupplier}
            onOpenChange={setShowAddSupplier}
            newSupplier={newSupplier}
            setNewSupplier={setNewSupplier}
            addSupplier={addSupplier}
          />
          <AddMaterialDialog
            open={showAddMaterial}
            onOpenChange={setShowAddMaterial}
            newMaterial={newMaterial}
            setNewMaterial={setNewMaterial}
            addMaterial={addMaterial}
            suppliers={suppliers}
          />
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Materials & Pricing</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="comparison">Price Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          <MaterialsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSupplier={selectedSupplier}
            setSelectedSupplier={setSelectedSupplier}
            suppliers={suppliers}
            categories={categories}
          />
          <MaterialsTable
            filteredMaterials={filteredMaterials}
            suppliers={suppliers}
            onEditMaterial={setEditingMaterial}
            onDeleteMaterial={deleteMaterial}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <SuppliersGrid
            suppliers={suppliers}
            supplierMaterials={supplierMaterials}
            onEditSupplier={setEditingSupplier}
            onDeleteSupplier={deleteSupplier}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <PriceComparison
            supplierMaterials={supplierMaterials}
            suppliers={suppliers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
