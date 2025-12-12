// src/app/suppliers/components/suppliers-items-tab/suppliers-items-content.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialsSupplierDialog } from "@/app/materials/components/materials-supplier-dialog";
import { SupplierLabelsDialog } from "@/app/labels/components/supplier-labels-dialog";
import { SupplierPackagingDialog } from "@/app/packaging/components/supplier-packaging-dialog";
import { DEFAULT_SUPPLIER_LABEL_FORM } from "@/app/labels/components/labels-constants";
import { DEFAULT_SUPPLIER_MATERIAL_FORM } from "@/app/materials/components/materials-constants";
import { DEFAULT_SUPPLIER_PACKAGING_FORM } from "@/app/packaging/components/packaging-constants";
import { useSupplierDialogs } from "@/hooks/supplier-hooks/use-supplier-dialogs";
import { useAllLabelMutations } from "@/hooks/label-hooks/use-labels-mutations";
import { useAllMaterialMutations } from "@/hooks/material-hooks/use-materials-mutations";
import { useAllPackagingMutations } from "@/hooks/packaging-hooks/use-packaging-mutations";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Supplier } from "@/types/supplier-types";
import { Box, Package, Plus, Tag } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SuppliersItemsTable } from "./suppliers-items-table";

interface SuppliersItemsContentProps {
  selectedSupplierId: string;
  selectedSupplier?: Supplier;
  supplierMaterials: any[];
  supplierPackaging: any[];
  supplierLabels: any[];
}

/**
 * Content component for managing supplier items (materials, packaging, labels).
 * Handles dialogs, form state, and CRUD operations for all item types.
 */
export function SuppliersItemsContent({
  selectedSupplierId,
  selectedSupplier,
  supplierMaterials,
  supplierPackaging,
  supplierLabels,
}: SuppliersItemsContentProps) {
  const [activeTab, setActiveTab] = useState("materials");

  // Mutation hooks
  const { createSupplierMaterial, updateSupplierMaterial } =
    useAllMaterialMutations();
  const { createSupplierPackaging, updateSupplierPackaging } =
    useAllPackagingMutations();
  const { createSupplierLabel, updateSupplierLabel } = useAllLabelMutations();

  // Dialog management hook
  const {
    materialDialog,
    packagingDialog,
    labelDialog,
    openDialog,
    closeDialog,
    updateFormData,
  } = useSupplierDialogs(
    DEFAULT_SUPPLIER_MATERIAL_FORM,
    DEFAULT_SUPPLIER_PACKAGING_FORM,
    DEFAULT_SUPPLIER_LABEL_FORM
  );

  // Fetch reference data for dialogs
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), [], []);
  const materials = useLiveQuery(() => db.materials.toArray(), [], []);
  const categories = useLiveQuery(() => db.categories.toArray(), [], []);
  const packaging = useLiveQuery(() => db.packaging.toArray(), [], []);
  const labels = useLiveQuery(() => db.labels.toArray(), [], []);

  /**
   * Opens appropriate dialog based on active tab
   */
  const handleAddItem = useCallback(() => {
    if (!selectedSupplierId) return;

    switch (activeTab) {
      case "materials":
        openDialog("material", selectedSupplierId);
        break;
      case "packaging":
        openDialog("packaging", selectedSupplierId);
        break;
      case "labels":
        openDialog("label", selectedSupplierId);
        break;
    }
  }, [selectedSupplierId, activeTab, openDialog]);

  /**
   * Opens material dialog with existing data for editing
   */
  const handleEditMaterial = useCallback(
    (material: any) => {
      const materialDetails = materials.find(
        (m) => m.id === material.materialId
      );
      const editData = {
        ...material,
        materialName: materialDetails?.name,
        materialCategory: materialDetails?.category,
      };
      openDialog("material", selectedSupplierId, editData);
    },
    [materials, selectedSupplierId, openDialog]
  );

  /**
   * Opens packaging dialog with existing data for editing
   */
  const handleEditPackaging = useCallback(
    (packagingItem: any) => {
      const packagingDetails = packaging.find(
        (p) => p.id === packagingItem.packagingId
      );
      const editData = {
        ...packagingItem,
        packagingName: packagingDetails?.name,
        packagingType: packagingDetails?.type,
        capacity: packagingDetails?.capacity,
        capacityUnit: packagingDetails?.capacityUnit,
        buildMaterial: packagingDetails?.buildMaterial,
      };
      openDialog("packaging", selectedSupplierId, editData);
    },
    [packaging, selectedSupplierId, openDialog]
  );

  /**
   * Opens label dialog with existing data for editing
   */
  const handleEditLabel = useCallback(
    (label: any) => {
      const labelDetails = labels.find((l) => l.id === label.labelId);
      const editData = {
        ...label,
        labelName: labelDetails?.name,
        labelType: labelDetails?.type,
        printingType: labelDetails?.printingType,
        material: labelDetails?.material,
        shape: labelDetails?.shape,
        size: labelDetails?.size,
      };
      openDialog("label", selectedSupplierId, editData);
    },
    [labels, selectedSupplierId, openDialog]
  );

  /**
   * Saves or updates material
   */
  const handleSaveMaterial = useCallback(async () => {
    const { formData, editingItem } = materialDialog;

    if (!formData.supplierId || !formData.materialName || !formData.bulkPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingItem) {
        await updateSupplierMaterial(editingItem.id, formData);
        toast.success("Material updated successfully");
      } else {
        await createSupplierMaterial(formData);
        toast.success("Material added successfully");
      }
      closeDialog("material");
    } catch (error) {
      console.error("Error saving material:", error);
      toast.error(
        editingItem ? "Failed to update material" : "Failed to add material"
      );
    }
  }, [
    materialDialog,
    createSupplierMaterial,
    updateSupplierMaterial,
    closeDialog,
  ]);

  /**
   * Saves or updates packaging
   */
  const handleSavePackaging = useCallback(async () => {
    const { formData, editingItem } = packagingDialog;

    if (
      !formData.supplierId ||
      !formData.packagingName ||
      !formData.bulkPrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingItem) {
        await updateSupplierPackaging(editingItem.id, formData);
        toast.success("Packaging updated successfully");
      } else {
        await createSupplierPackaging(formData);
        toast.success("Packaging added successfully");
      }
      closeDialog("packaging");
    } catch (error) {
      console.error("Error saving packaging:", error);
      toast.error(
        editingItem ? "Failed to update packaging" : "Failed to add packaging"
      );
    }
  }, [
    packagingDialog,
    createSupplierPackaging,
    updateSupplierPackaging,
    closeDialog,
  ]);

  /**
   * Saves or updates label
   */
  const handleSaveLabel = useCallback(async () => {
    const { formData, editingItem } = labelDialog;

    if (!formData.supplierId || !formData.labelName || !formData.bulkPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingItem) {
        await updateSupplierLabel(editingItem.id, formData);
        toast.success("Label updated successfully");
      } else {
        await createSupplierLabel(formData);
        toast.success("Label added successfully");
      }
      closeDialog("label");
    } catch (error) {
      console.error("Error saving label:", error);
      toast.error(
        editingItem ? "Failed to update label" : "Failed to add label"
      );
    }
  }, [labelDialog, createSupplierLabel, updateSupplierLabel, closeDialog]);

  /**
   * Gets appropriate label for add button based on active tab
   */
  const getItemLabel = () => {
    switch (activeTab) {
      case "materials":
        return "Material";
      case "packaging":
        return "Packaging";
      case "labels":
        return "Label";
      default:
        return "Item";
    }
  };

  return (
    <>
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Supplier Items</CardTitle>
              <p className="text-sm text-muted-foreground mt-1.5">
                Manage materials, packaging, and labels for{" "}
                <span className="font-semibold text-foreground">
                  {selectedSupplier?.name}
                </span>
              </p>
            </div>
            <Button onClick={handleAddItem} size="lg" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add {getItemLabel()}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="materials"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Materials</span>
                <Badge variant="default" className="ml-1">
                  {supplierMaterials.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="packaging"
                className="flex items-center gap-2"
              >
                <Box className="h-4 w-4" />
                <span className="hidden sm:inline">Packaging</span>
                <Badge variant="default" className="ml-1">
                  {supplierPackaging.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="labels" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Labels</span>
                <Badge variant="default" className="ml-1">
                  {supplierLabels.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <SuppliersItemsTable
              supplierMaterials={supplierMaterials}
              supplierPackaging={supplierPackaging}
              supplierLabels={supplierLabels}
              onAddItem={handleAddItem}
              onEditMaterial={handleEditMaterial}
              onEditPackaging={handleEditPackaging}
              onEditLabel={handleEditLabel}
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Material Dialog */}
      <MaterialsSupplierDialog
        open={materialDialog.isOpen}
        onOpenChange={(open) => !open && closeDialog("material")}
        supplierMaterial={materialDialog.formData}
        isEditing={!!materialDialog.editingItem}
        onSave={handleSaveMaterial}
        suppliers={suppliers}
        materials={materials}
        categories={categories}
      />

      {/* Packaging Dialog */}
      <SupplierPackagingDialog
        open={packagingDialog.isOpen}
        onOpenChange={(open) => !open && closeDialog("packaging")}
        packaging={packagingDialog.formData}
        setPackaging={(data) => updateFormData("packaging", data)}
        onSave={handleSavePackaging}
        suppliers={suppliers}
        packagingList={packaging}
        isEditing={!!packagingDialog.editingItem}
      />

      {/* Label Dialog */}
      <SupplierLabelsDialog
        open={labelDialog.isOpen}
        onOpenChange={(open) => !open && closeDialog("label")}
        label={labelDialog.formData}
        setLabel={(data) => updateFormData("label", data)}
        onSave={handleSaveLabel}
        suppliers={suppliers}
        labelsList={labels}
        isEditing={!!labelDialog.editingItem}
      />
    </>
  );
}
