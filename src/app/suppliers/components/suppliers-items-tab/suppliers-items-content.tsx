// src/app/suppliers/components/suppliers-items-tab/suppliers-items-content.tsx
"use client";

import type { LabelFormData } from "@/app/labels/components/supplier-labels-dialog";
import { EnhancedSupplierLabelsDialog } from "@/app/labels/components/supplier-labels-dialog";
import { DEFAULT_MATERIAL_FORM } from "@/app/materials/components/materials-constants";
import type { SupplierMaterialFormData } from "@/types/material-types";
import { MaterialsSupplierDialog } from "@/app/materials/components/materials-supplier-dialog";
import type { PackagingFormData } from "@/app/packaging/components/supplier-packaging-dialog";
import { EnhancedSupplierPackagingDialog } from "@/app/packaging/components/supplier-packaging-dialog";
import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { assignCategoryColor } from "@/utils/color-utils";
import { db } from "@/lib/db";
import { normalizeText } from "@/utils/text-utils";
import type { Supplier } from "@/types/shared-types";
import { Box, Package, Plus, Tag } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SuppliersItemsTable } from "./suppliers-items-table";

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

const DEFAULT_LABEL_FORM: LabelFormData = {
  supplierId: "",
  labelName: "",
  labelId: "",
  labelType: undefined,
  printingType: undefined,
  material: undefined,
  shape: undefined,
  size: "",
  labelFor: "",
  bulkPrice: 0,
  quantityForBulkPrice: 1,
  tax: 0,
  moq: 1,
  leadTime: 7,
  availability: "in-stock",
  notes: "",
};

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

  // Dialog states
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showPackagingDialog, setShowPackagingDialog] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [editingPackaging, setEditingPackaging] = useState<any>(null);
  const [editingLabel, setEditingLabel] = useState<any>(null);

  // Form states
  const [materialFormData, setMaterialFormData] =
    useState<SupplierMaterialFormData>(DEFAULT_MATERIAL_FORM);
  const [packagingFormData, setPackagingFormData] = useState<PackagingFormData>(
    DEFAULT_PACKAGING_FORM
  );
  const [labelFormData, setLabelFormData] =
    useState<LabelFormData>(DEFAULT_LABEL_FORM);

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
          ...DEFAULT_MATERIAL_FORM,
          supplierId: selectedSupplierId,
        });
        setEditingMaterial(null);
        setShowMaterialDialog(true);
        break;
      case "packaging":
        setPackagingFormData({
          ...DEFAULT_PACKAGING_FORM,
          supplierId: selectedSupplierId,
        });
        setEditingPackaging(null);
        setShowPackagingDialog(true);
        break;
      case "labels":
        setLabelFormData({
          ...DEFAULT_LABEL_FORM,
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
        capacityUnit: packagingDetails?.unit,
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
        labelFor: labelDetails?.labelFor,
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
      await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          const now = new Date().toISOString();

          // Step 1: Create/get category
          let categoryToUse = materialFormData.materialCategory || "Other";
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
          let materialId = materialFormData.materialId;

          if (!materialId || materialId === "") {
            const normalizedName = normalizeText(
              materialFormData.materialName || ""
            );
            const existingMaterial = await db.materials
              .filter((m) => normalizeText(m.name) === normalizedName)
              .first();

            if (existingMaterial) {
              materialId = existingMaterial.id;

              if (existingMaterial.category !== categoryToUse) {
                await db.materials.update(existingMaterial.id, {
                  category: categoryToUse,
                  updatedAt: now,
                });
              }
            } else {
              materialId = nanoid();
              await db.materials.add({
                id: materialId,
                name: (materialFormData.materialName || "").trim(),
                category: categoryToUse,
                notes: materialFormData.notes || "",
                createdAt: now,
              });
            }
          }

          // Step 3: Calculate unit price
          const quantityForBulkPrice =
            materialFormData.quantityForBulkPrice || 1;
          const bulkPrice = materialFormData.bulkPrice || 0;
          const unitPrice = bulkPrice / quantityForBulkPrice;

          // Step 4: Create supplier material
          await db.supplierMaterials.add({
            id: nanoid(),
            supplierId: materialFormData.supplierId || "",
            materialId,
            unitPrice: unitPrice,
            bulkPrice: bulkPrice,
            quantityForBulkPrice: quantityForBulkPrice,
            tax: materialFormData.tax || 0,
            unit: materialFormData.unit || "kg",
            moq: materialFormData.moq || 1,
            bulkDiscounts: materialFormData.bulkDiscounts || [],
            leadTime: materialFormData.leadTime || 7,
            availability: materialFormData.availability || "in-stock",
            transportationCost: materialFormData.transportationCost,
            notes: materialFormData.notes || "",
            createdAt: now,
          });
        }
      );

      setMaterialFormData(DEFAULT_MATERIAL_FORM);
      setShowMaterialDialog(false);
      setEditingMaterial(null);
      toast.success("Material added successfully");
      // No need to refresh - useLiveQuery automatically updates
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    }
  }, [materialFormData]);

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
      await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          const now = new Date().toISOString();

          const existingPackaging = await db.packaging
            .filter(
              (p) =>
                normalizeText(p.name) ===
                  normalizeText(packagingFormData.packagingName!) &&
                p.type === packagingFormData.packagingType &&
                p.capacity === (packagingFormData.capacity || 0) &&
                p.unit === packagingFormData.capacityUnit &&
                p.buildMaterial === packagingFormData.buildMaterial
            )
            .first();

          let packagingId: string;
          if (existingPackaging) {
            packagingId = existingPackaging.id;
          } else {
            packagingId = nanoid();
            await db.packaging.add({
              id: packagingId,
              name: packagingFormData.packagingName!.trim(),
              type: packagingFormData.packagingType!,
              capacity: packagingFormData.capacity || 0,
              unit: packagingFormData.capacityUnit!,
              buildMaterial: packagingFormData.buildMaterial,
              notes: packagingFormData.notes || "",
              createdAt: now,
            });
          }

          const bulkQuantity = packagingFormData.quantityForBulkPrice || 1;
          const bulkPrice = packagingFormData.bulkPrice!;
          const unitPrice = bulkPrice / bulkQuantity;

          await db.supplierPackaging.add({
            id: nanoid(),
            supplierId: packagingFormData.supplierId!,
            packagingId: packagingId,
            unitPrice: unitPrice,
            bulkPrice: bulkPrice,
            quantityForBulkPrice: bulkQuantity,
            tax: packagingFormData.tax || 0,
            moq: packagingFormData.moq || 1,
            leadTime: packagingFormData.leadTime || 7,
            availability: packagingFormData.availability || "in-stock",
            notes: packagingFormData.notes || "",
            createdAt: now,
          });
        }
      );

      setPackagingFormData(DEFAULT_PACKAGING_FORM);
      setShowPackagingDialog(false);
      setEditingPackaging(null);
      toast.success("Packaging added successfully");
      // No need to refresh - useLiveQuery automatically updates
    } catch (error) {
      console.error("Error adding packaging:", error);
      toast.error("Failed to add packaging");
    }
  }, [packagingFormData]);

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
      await db.transaction("rw", [db.labels, db.supplierLabels], async () => {
        const now = new Date().toISOString();

        const normalizedName = normalizeText(labelFormData.labelName!);
        const existingLabel = await db.labels
          .filter(
            (l) =>
              normalizeText(l.name) === normalizedName &&
              l.type === labelFormData.labelType &&
              l.printingType === labelFormData.printingType &&
              l.material === labelFormData.material &&
              l.shape === labelFormData.shape &&
              normalizeText(l.size || "") ===
                normalizeText(labelFormData.size || "") &&
              normalizeText(l.labelFor || "") ===
                normalizeText(labelFormData.labelFor || "")
          )
          .first();

        let labelId: string;
        if (existingLabel) {
          labelId = existingLabel.id;
        } else {
          labelId = nanoid();
          await db.labels.add({
            id: labelId,
            name: labelFormData.labelName!.trim(),
            type: labelFormData.labelType!,
            printingType: labelFormData.printingType!,
            material: labelFormData.material!,
            shape: labelFormData.shape!,
            size: labelFormData.size || undefined,
            labelFor: labelFormData.labelFor || undefined,
            notes: labelFormData.notes || "",
            createdAt: now,
          });
        }

        const bulkQuantity = labelFormData.quantityForBulkPrice || 1;
        const bulkPrice = labelFormData.bulkPrice!;
        const unitPrice = bulkPrice / bulkQuantity;

        await db.supplierLabels.add({
          id: nanoid(),
          supplierId: labelFormData.supplierId!,
          labelId: labelId,
          unit: labelFormData.unit || "pieces",
          unitPrice: unitPrice,
          bulkPrice: bulkPrice,
          quantityForBulkPrice: bulkQuantity,
          moq: labelFormData.moq || 1,
          leadTime: labelFormData.leadTime || 7,
          availability: labelFormData.availability || "in-stock",
          tax: labelFormData.tax || 0,
          notes: labelFormData.notes || "",
          createdAt: now,
        });
      });

      setLabelFormData(DEFAULT_LABEL_FORM);
      setShowLabelDialog(false);
      setEditingLabel(null);
      toast.success("Label added successfully");
      // No need to refresh - useLiveQuery automatically updates
    } catch (error) {
      console.error("Error adding label:", error);
      toast.error("Failed to add label");
    }
  }, [labelFormData]);

  // Handle dialog close
  const handleDialogClose = useCallback(
    (open: boolean, type: "material" | "packaging" | "label") => {
      if (!open) {
        switch (type) {
          case "material":
            setShowMaterialDialog(false);
            setEditingMaterial(null);
            setMaterialFormData(DEFAULT_MATERIAL_FORM);
            break;
          case "packaging":
            setShowPackagingDialog(false);
            setEditingPackaging(null);
            setPackagingFormData(DEFAULT_PACKAGING_FORM);
            break;
          case "label":
            setShowLabelDialog(false);
            setEditingLabel(null);
            setLabelFormData(DEFAULT_LABEL_FORM);
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

      <EnhancedSupplierPackagingDialog
        open={showPackagingDialog}
        onOpenChange={(open) => handleDialogClose(open, "packaging")}
        packaging={packagingFormData}
        setPackaging={setPackagingFormData}
        onSave={handleSavePackaging}
        suppliers={suppliersData}
        packagingList={packaging}
        isEditing={!!editingPackaging}
      />

      <EnhancedSupplierLabelsDialog
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
