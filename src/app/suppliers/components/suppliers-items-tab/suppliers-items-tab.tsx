"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Box, Tag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { nanoid } from "nanoid";

import type {
  Supplier,
  Material,
  Category,
  Packaging,
  Label,
} from "@/lib/types";
import type { MaterialFormData } from "@/app/materials/components/supplier-materials-dialog";
import type { PackagingFormData } from "@/app/packaging/components/supplier-packaging-dialog";
import type { LabelFormData } from "@/app/labels/components/supplier-labels-dialog";

import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { useSupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import { useSupplierLabelsWithDetails } from "@/hooks/use-supplier-labels-with-details";
import { useDexieTable } from "@/hooks/use-dexie-table";

import { SupplierItemDialogs } from "./suppliers-items-dialogs";
import { SuppliersItemsTable } from "./suppliers-items-table";
import { DEFAULT_MATERIAL_FORM } from "@/app/materials/components/materials-constants";
import { db } from "@/lib/db";
import { normalizeText } from "@/lib/text-utils";
import { assignCategoryColor } from "@/lib/color-utils";

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

interface SuppliersItemsTabProps {
  suppliers: Supplier[];
}

export function SuppliersItemsTab({ suppliers }: SuppliersItemsTabProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("materials");

  // --- NEW: Auto-select first supplier ---
  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      const firstActiveSupplier = suppliers.find((s) => s.isActive);
      if (firstActiveSupplier) {
        setSelectedSupplierId(firstActiveSupplier.id);
      }
    }
  }, [suppliers, selectedSupplierId]);

  // --- Data Fetching ---
  const allSupplierMaterials = useSupplierMaterialsWithDetails();
  const allSupplierPackaging = useSupplierPackagingWithDetails();
  const allSupplierLabels = useSupplierLabelsWithDetails();
  const { data: materials } = useDexieTable(db.materials, []);
  const { data: categories } = useDexieTable(db.categories, []);
  const { data: packagingList } = useDexieTable(db.packaging, []);
  const { data: labelsList } = useDexieTable(db.labels, []);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // --- Memoized Filtering for Performance ---
  const supplierMaterials = useMemo(
    () =>
      allSupplierMaterials.filter((sm) => sm.supplierId === selectedSupplierId),
    [allSupplierMaterials, selectedSupplierId]
  );
  const supplierPackaging = useMemo(
    () =>
      allSupplierPackaging.filter((sp) => sp.supplierId === selectedSupplierId),
    [allSupplierPackaging, selectedSupplierId]
  );
  const supplierLabels = useMemo(
    () =>
      allSupplierLabels.filter((sl) => sl.supplierId === selectedSupplierId),
    [allSupplierLabels, selectedSupplierId]
  );

  // --- STATE MANAGEMENT (Moved from hook to here) ---
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showPackagingDialog, setShowPackagingDialog] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [editingPackaging, setEditingPackaging] = useState<any>(null);
  const [editingLabel, setEditingLabel] = useState<any>(null);
  const [materialFormData, setMaterialFormData] = useState<MaterialFormData>(
    DEFAULT_MATERIAL_FORM
  );
  const [packagingFormData, setPackagingFormData] = useState<PackagingFormData>(
    DEFAULT_PACKAGING_FORM
  );
  const [labelFormData, setLabelFormData] =
    useState<LabelFormData>(DEFAULT_LABEL_FORM);

  // --- HANDLER FUNCTIONS (Moved from hook, wrapped in useCallback) ---

  const handleDialogClose = useCallback(
    (type: "material" | "packaging" | "label") => {
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
    },
    []
  );

  const handleAddItem = useCallback(() => {
    if (!selectedSupplierId) return;
    switch (activeTab) {
      case "materials":
        setEditingMaterial(null);
        setMaterialFormData({
          ...DEFAULT_MATERIAL_FORM,
          supplierId: selectedSupplierId,
        });
        setShowMaterialDialog(true);
        break;
      case "packaging":
        setEditingPackaging(null);
        setPackagingFormData({
          ...DEFAULT_PACKAGING_FORM,
          supplierId: selectedSupplierId,
        });
        setShowPackagingDialog(true);
        break;
      case "labels":
        setEditingLabel(null);
        setLabelFormData({
          ...DEFAULT_LABEL_FORM,
          supplierId: selectedSupplierId,
        });
        setShowLabelDialog(true);
        break;
    }
  }, [selectedSupplierId, activeTab]);

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

  const handleEditPackaging = useCallback(
    (packagingItem: any) => {
      const packagingDetails = packagingList.find(
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
    [packagingList]
  );

  const handleEditLabel = useCallback(
    (label: any) => {
      const labelDetails = labelsList.find((l) => l.id === label.labelId);
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
    [labelsList]
  );

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

          const quantityForBulkPrice =
            materialFormData.quantityForBulkPrice || 1;
          const bulkPrice = materialFormData.bulkPrice || 0;
          const unitPrice = bulkPrice / quantityForBulkPrice;

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

      toast.success("Material added successfully");
      handleDialogClose("material");
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    }
  }, [materialFormData, handleDialogClose]);

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

      toast.success("Packaging added successfully");
      handleDialogClose("packaging");
    } catch (error) {
      console.error("Error adding packaging:", error);
      toast.error("Failed to add packaging");
    }
  }, [packagingFormData, handleDialogClose]);

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

      toast.success("Label added successfully");
      handleDialogClose("label");
    } catch (error) {
      console.error("Error adding label:", error);
      toast.error("Failed to add label");
    }
  }, [labelFormData, handleDialogClose]);

  return (
    <div className="space-y-6">
      {!selectedSupplierId ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select a Supplier to Begin</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose from the list of active suppliers.
            </p>
            <Select onValueChange={setSelectedSupplierId}>
              <SelectTrigger className="w-full max-w-sm mt-4">
                <SelectValue placeholder="Choose a supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers
                  .filter((s) => s.isActive)
                  .map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[300px]">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Managing Supplier
                </CardTitle>
                <Select
                  value={selectedSupplierId}
                  onValueChange={setSelectedSupplierId}
                >
                  <SelectTrigger className="text-lg font-semibold h-auto p-0 border-0 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers
                      .filter((s) => s.isActive)
                      .map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex items-center gap-2">
                            <span>{supplier.name}</span>
                            <Badge variant="outline" className="text-xs">
                              ⭐ {supplier.rating}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="materials"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" /> Materials (
                  {supplierMaterials.length})
                </TabsTrigger>
                <TabsTrigger
                  value="packaging"
                  className="flex items-center gap-2"
                >
                  <Box className="h-4 w-4" /> Packaging (
                  {supplierPackaging.length})
                </TabsTrigger>
                <TabsTrigger value="labels" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Labels ({supplierLabels.length})
                </TabsTrigger>
              </TabsList>
              <SuppliersItemsTable
                activeTab={activeTab}
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
      )}

      <SupplierItemDialogs
        showMaterialDialog={showMaterialDialog}
        materialFormData={materialFormData}
        editingMaterial={editingMaterial}
        onMaterialDialogChange={(open) =>
          !open && handleDialogClose("material")
        }
        setMaterialFormData={setMaterialFormData}
        onSaveMaterial={handleSaveMaterial}
        showPackagingDialog={showPackagingDialog}
        packagingFormData={packagingFormData}
        editingPackaging={editingPackaging}
        onPackagingDialogChange={(open) =>
          !open && handleDialogClose("packaging")
        }
        setPackagingFormData={setPackagingFormData}
        onSavePackaging={handleSavePackaging}
        showLabelDialog={showLabelDialog}
        labelFormData={labelFormData}
        editingLabel={editingLabel}
        onLabelDialogChange={(open) => !open && handleDialogClose("label")}
        setLabelFormData={setLabelFormData}
        onSaveLabel={handleSaveLabel}
        suppliers={suppliers}
        materials={materials}
        categories={categories}
        packagingList={packagingList}
        labelsList={labelsList}
      />
    </div>
  );
}
