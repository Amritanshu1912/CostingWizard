// src/app/suppliers/components/suppliers-items-tab/suppliers-items-content.tsx
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Box, Package, Plus, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MaterialsSupplierDialog } from "@/app/materials/components/materials-supplier-dialog";
import { SupplierLabelsDialog } from "@/app/labels/components/supplier-labels-dialog";
import { SupplierPackagingDialog } from "@/app/packaging/components/supplier-packaging-dialog";

import { useDexieTable } from "@/hooks/use-dexie-table";
import { useSupplierLabelMutations } from "@/hooks/label-hooks/use-labels-mutations";
import { useSupplierMaterialMutations } from "@/hooks/material-hooks/use-materials-mutations";
import { useSupplierPackagingMutations } from "@/hooks/packaging-hooks/use-packaging-mutations";

import type { SupplierLabelFormData } from "@/types/label-types";
import type { SupplierMaterialFormData } from "@/types/material-types";
import type { SupplierPackagingFormData } from "@/types/packaging-types";
import type { Supplier } from "@/types/shared-types";

import { DEFAULT_SUPPLIER_LABEL_FORM } from "@/app/labels/components/labels-constants";
import { DEFAULT_SUPPLIER_MATERIAL_FORM } from "@/app/materials/components/materials-constants";
import { DEFAULT_SUPPLIER_PACKAGING_FORM } from "@/app/packaging/components/packaging-constants";
import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";

import { db } from "@/lib/db";

import { SuppliersItemsTable } from "./suppliers-items-table";

interface SuppliersItemsContentProps {
  selectedSupplierId: string;
  selectedSupplier?: Supplier;
  supplierMaterials: any[];
  supplierPackaging: any[];
  supplierLabels: any[];
}

export function SuppliersItemsContent({
  selectedSupplierId,
  selectedSupplier,
  supplierMaterials,
  supplierPackaging,
  supplierLabels,
}: SuppliersItemsContentProps) {
  const [activeTab, setActiveTab] = useState("materials");

  // Mutation hooks
  const { createSupplierMaterial } = useSupplierMaterialMutations();
  const { createSupplierPackaging } = useSupplierPackagingMutations();
  const { createSupplierLabel } = useSupplierLabelMutations();

  // Dialog states
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showPackagingDialog, setShowPackagingDialog] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [editingPackaging, setEditingPackaging] = useState<any>(null);
  const [editingLabel, setEditingLabel] = useState<any>(null);

  // Form states
  const [materialFormData, setMaterialFormData] =
    useState<SupplierMaterialFormData>(DEFAULT_SUPPLIER_MATERIAL_FORM);
  const [packagingFormData, setPackagingFormData] =
    useState<SupplierPackagingFormData>(DEFAULT_SUPPLIER_PACKAGING_FORM);
  const [labelFormData, setLabelFormData] = useState<SupplierLabelFormData>(
    DEFAULT_SUPPLIER_LABEL_FORM
  );

  // Database hooks - useLiveQuery automatically refreshes when data changes
  const { data: suppliersData } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: materials } = useDexieTable(db.materials, []);
  const { data: categories } = useDexieTable(db.categories, []);
  const { data: packaging } = useDexieTable(db.packaging, []);
  const { data: labels } = useDexieTable(db.labels, []);

  // Handle add item
  const handleAddItem = useCallback(() => {
    if (!selectedSupplierId) return;

    switch (activeTab) {
      case "materials":
        setMaterialFormData({
          ...DEFAULT_SUPPLIER_MATERIAL_FORM,
          supplierId: selectedSupplierId,
        });
        setEditingMaterial(null);
        setShowMaterialDialog(true);
        break;
      case "packaging":
        setPackagingFormData({
          ...DEFAULT_SUPPLIER_PACKAGING_FORM,
          supplierId: selectedSupplierId,
        });
        setEditingPackaging(null);
        setShowPackagingDialog(true);
        break;
      case "labels":
        setLabelFormData({
          ...DEFAULT_SUPPLIER_LABEL_FORM,
          supplierId: selectedSupplierId,
        });
        setEditingLabel(null);
        setShowLabelDialog(true);
        break;
    }
  }, [selectedSupplierId, activeTab]);

  // Handle edit material
  const handleEditMaterial = useCallback(
    (material: any) => {
      const materialDetails = materials.find(
        (m) => m.id === material.materialId
      );
      setEditingMaterial(material);
      setMaterialFormData({
        ...material,
        materialName: materialDetails?.name,
        materialCategory: materialDetails?.category,
      });
      setShowMaterialDialog(true);
    },
    [materials]
  );

  // Handle edit packaging
  const handleEditPackaging = useCallback(
    (packagingItem: any) => {
      const packagingDetails = packaging.find(
        (p) => p.id === packagingItem.packagingId
      );
      setEditingPackaging(packagingItem);
      setPackagingFormData({
        ...packagingItem,
        packagingName: packagingDetails?.name,
        packagingType: packagingDetails?.type,
        capacity: packagingDetails?.capacity,
        capacityUnit: packagingDetails?.capacityUnit,
        buildMaterial: packagingDetails?.buildMaterial,
      });
      setShowPackagingDialog(true);
    },
    [packaging]
  );

  // Handle edit label
  const handleEditLabel = useCallback(
    (label: any) => {
      const labelDetails = labels.find((l) => l.id === label.labelId);
      setEditingLabel(label);
      setLabelFormData({
        ...label,
        labelName: labelDetails?.name,
        labelType: labelDetails?.type,
        printingType: labelDetails?.printingType,
        material: labelDetails?.material,
        shape: labelDetails?.shape,
        size: labelDetails?.size,
      });
      setShowLabelDialog(true);
    },
    [labels]
  );

  // Handle save material
  const handleSaveMaterial = useCallback(async () => {
    if (
      !materialFormData.supplierId ||
      !materialFormData.materialName ||
      !materialFormData.bulkPrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSupplierMaterial(materialFormData);
      setMaterialFormData(DEFAULT_SUPPLIER_MATERIAL_FORM);
      setShowMaterialDialog(false);
      setEditingMaterial(null);
      toast.success("Material added successfully");
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    }
  }, [materialFormData, createSupplierMaterial]);

  // Handle save packaging
  const handleSavePackaging = useCallback(async () => {
    if (
      !packagingFormData.supplierId ||
      !packagingFormData.packagingName ||
      !packagingFormData.bulkPrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSupplierPackaging(packagingFormData);
      setPackagingFormData(DEFAULT_SUPPLIER_PACKAGING_FORM);
      setShowPackagingDialog(false);
      setEditingPackaging(null);
      toast.success("Packaging added successfully");
    } catch (error) {
      console.error("Error adding packaging:", error);
      toast.error("Failed to add packaging");
    }
  }, [packagingFormData, createSupplierPackaging]);

  // Handle save label
  const handleSaveLabel = useCallback(async () => {
    if (
      !labelFormData.supplierId ||
      !labelFormData.labelName ||
      !labelFormData.bulkPrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSupplierLabel(labelFormData);
      setLabelFormData(DEFAULT_SUPPLIER_LABEL_FORM);
      setShowLabelDialog(false);
      setEditingLabel(null);
      toast.success("Label added successfully");
    } catch (error) {
      console.error("Error adding label:", error);
      toast.error("Failed to add label");
    }
  }, [labelFormData, createSupplierLabel]);

  // Handle dialog close
  const handleDialogClose = useCallback(
    (open: boolean, type: "material" | "packaging" | "label") => {
      if (!open) {
        switch (type) {
          case "material":
            setShowMaterialDialog(false);
            setEditingMaterial(null);
            setMaterialFormData(DEFAULT_SUPPLIER_MATERIAL_FORM);
            break;
          case "packaging":
            setShowPackagingDialog(false);
            setEditingPackaging(null);
            setPackagingFormData(DEFAULT_SUPPLIER_PACKAGING_FORM);
            break;
          case "label":
            setShowLabelDialog(false);
            setEditingLabel(null);
            setLabelFormData(DEFAULT_SUPPLIER_LABEL_FORM);
            break;
        }
      }
    },
    []
  );

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

      {/* Dialogs */}
      <MaterialsSupplierDialog
        open={showMaterialDialog}
        onOpenChange={(open) => handleDialogClose(open, "material")}
        supplierMaterial={materialFormData || undefined}
        isEditing={!!editingMaterial}
        onSave={handleSaveMaterial}
        suppliers={suppliersData}
        materials={materials}
        categories={categories}
      />

      <SupplierPackagingDialog
        open={showPackagingDialog}
        onOpenChange={(open) => handleDialogClose(open, "packaging")}
        packaging={packagingFormData}
        setPackaging={setPackagingFormData}
        onSave={handleSavePackaging}
        suppliers={suppliersData}
        packagingList={packaging}
        isEditing={!!editingPackaging}
      />

      <SupplierLabelsDialog
        open={showLabelDialog}
        onOpenChange={(open) => handleDialogClose(open, "label")}
        label={labelFormData}
        setLabel={setLabelFormData}
        onSave={handleSaveLabel}
        suppliers={suppliersData}
        labelsList={labels}
        isEditing={!!editingLabel}
      />
    </>
  );
}
