// --- START OF FILE suppliers-items-dialogs.tsx ---

"use client";
import type { Dispatch, SetStateAction } from "react";

import { EnhancedMaterialDialog } from "@/app/materials/components/supplier-materials-dialog";
import { EnhancedSupplierPackagingDialog } from "@/app/packaging/components/supplier-packaging-dialog";
import { EnhancedSupplierLabelsDialog } from "@/app/labels/components/supplier-labels-dialog";
import type { MaterialFormData } from "@/app/materials/components/supplier-materials-dialog";
import type { PackagingFormData } from "@/app/packaging/components/supplier-packaging-dialog";
import type { LabelFormData } from "@/app/labels/components/supplier-labels-dialog";
import type {
  Supplier,
  Material,
  Category,
  Packaging,
  Label,
} from "@/lib/types";

interface SupplierItemDialogsProps {
  // Material Dialog Props
  showMaterialDialog: boolean;
  materialFormData: MaterialFormData;
  editingMaterial: any | null;
  onMaterialDialogChange: (open: boolean) => void;
  setMaterialFormData: Dispatch<SetStateAction<MaterialFormData>>;
  onSaveMaterial: () => Promise<void>;

  // Packaging Dialog Props
  showPackagingDialog: boolean;
  packagingFormData: PackagingFormData;
  editingPackaging: any | null;
  onPackagingDialogChange: (open: boolean) => void;
  setPackagingFormData: Dispatch<SetStateAction<PackagingFormData>>;
  onSavePackaging: () => Promise<void>;

  // Label Dialog Props
  showLabelDialog: boolean;
  labelFormData: LabelFormData;
  editingLabel: any | null;
  onLabelDialogChange: (open: boolean) => void;
  setLabelFormData: Dispatch<SetStateAction<LabelFormData>>;
  onSaveLabel: () => Promise<void>;

  // Shared Data Props
  suppliers: Supplier[];
  materials: Material[];
  categories: Category[];
  packagingList: Packaging[];
  labelsList: Label[];
}

export function SupplierItemDialogs({
  showMaterialDialog,
  materialFormData,
  editingMaterial,
  onMaterialDialogChange,
  setMaterialFormData,
  onSaveMaterial,
  showPackagingDialog,
  packagingFormData,
  editingPackaging,
  onPackagingDialogChange,
  setPackagingFormData,
  onSavePackaging,
  showLabelDialog,
  labelFormData,
  editingLabel,
  onLabelDialogChange,
  setLabelFormData,
  onSaveLabel,
  suppliers,
  materials,
  categories,
  packagingList,
  labelsList,
}: SupplierItemDialogsProps) {
  return (
    <>
      <EnhancedMaterialDialog
        open={showMaterialDialog}
        onOpenChange={onMaterialDialogChange}
        material={materialFormData}
        setMaterial={setMaterialFormData}
        onSave={onSaveMaterial}
        suppliers={suppliers}
        materials={materials}
        categories={categories}
        isEditing={!!editingMaterial}
      />

      <EnhancedSupplierPackagingDialog
        open={showPackagingDialog}
        onOpenChange={onPackagingDialogChange}
        packaging={packagingFormData}
        setPackaging={setPackagingFormData}
        onSave={onSavePackaging}
        suppliers={suppliers}
        packagingList={packagingList}
        isEditing={!!editingPackaging}
      />

      <EnhancedSupplierLabelsDialog
        open={showLabelDialog}
        onOpenChange={onLabelDialogChange}
        label={labelFormData}
        setLabel={setLabelFormData}
        onSave={onSaveLabel}
        suppliers={suppliers}
        labelsList={labelsList}
        isEditing={!!editingLabel}
      />
    </>
  );
}
