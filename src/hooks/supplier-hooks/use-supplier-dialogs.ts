// src/app/suppliers/hooks/use-supplier-dialogs.ts

import type { SupplierLabelFormData } from "@/types/label-types";
import type { SupplierMaterialFormData } from "@/types/material-types";
import type { SupplierPackagingFormData } from "@/types/packaging-types";
import { useCallback, useState } from "react";

type ItemType = "material" | "packaging" | "label";

interface DialogState<T> {
  isOpen: boolean;
  formData: T;
  editingItem: any | null;
}

interface UseSupplierDialogsReturn {
  materialDialog: DialogState<SupplierMaterialFormData>;
  packagingDialog: DialogState<SupplierPackagingFormData>;
  labelDialog: DialogState<SupplierLabelFormData>;
  openDialog: (type: ItemType, supplierId: string, editingItem?: any) => void;
  closeDialog: (type: ItemType) => void;
  updateFormData: <T>(type: ItemType, data: T) => void;
}

/**
 * Hook for managing supplier item dialog states (materials, packaging, labels).
 * Centralizes dialog open/close logic and form data management.
 *
 * @param defaultMaterialForm - Default form state for materials
 * @param defaultPackagingForm - Default form state for packaging
 * @param defaultLabelForm - Default form state for labels
 * @returns Dialog states and handler functions
 */
export function useSupplierDialogs(
  defaultMaterialForm: SupplierMaterialFormData,
  defaultPackagingForm: SupplierPackagingFormData,
  defaultLabelForm: SupplierLabelFormData
): UseSupplierDialogsReturn {
  const [materialDialog, setMaterialDialog] = useState<
    DialogState<SupplierMaterialFormData>
  >({
    isOpen: false,
    formData: defaultMaterialForm,
    editingItem: null,
  });

  const [packagingDialog, setPackagingDialog] = useState<
    DialogState<SupplierPackagingFormData>
  >({
    isOpen: false,
    formData: defaultPackagingForm,
    editingItem: null,
  });

  const [labelDialog, setLabelDialog] = useState<
    DialogState<SupplierLabelFormData>
  >({
    isOpen: false,
    formData: defaultLabelForm,
    editingItem: null,
  });

  /**
   * Opens a dialog with optional editing data
   */
  const openDialog = useCallback(
    (type: ItemType, supplierId: string, editingItem?: any) => {
      switch (type) {
        case "material":
          setMaterialDialog({
            isOpen: true,
            formData: editingItem
              ? { ...editingItem, supplierId }
              : { ...defaultMaterialForm, supplierId },
            editingItem: editingItem || null,
          });
          break;
        case "packaging":
          setPackagingDialog({
            isOpen: true,
            formData: editingItem
              ? { ...editingItem, supplierId }
              : { ...defaultPackagingForm, supplierId },
            editingItem: editingItem || null,
          });
          break;
        case "label":
          setLabelDialog({
            isOpen: true,
            formData: editingItem
              ? { ...editingItem, supplierId }
              : { ...defaultLabelForm, supplierId },
            editingItem: editingItem || null,
          });
          break;
      }
    },
    [defaultMaterialForm, defaultPackagingForm, defaultLabelForm]
  );

  /**
   * Closes a dialog and resets its state
   */
  const closeDialog = useCallback(
    (type: ItemType) => {
      switch (type) {
        case "material":
          setMaterialDialog({
            isOpen: false,
            formData: defaultMaterialForm,
            editingItem: null,
          });
          break;
        case "packaging":
          setPackagingDialog({
            isOpen: false,
            formData: defaultPackagingForm,
            editingItem: null,
          });
          break;
        case "label":
          setLabelDialog({
            isOpen: false,
            formData: defaultLabelForm,
            editingItem: null,
          });
          break;
      }
    },
    [defaultMaterialForm, defaultPackagingForm, defaultLabelForm]
  );

  /**
   * Updates form data for a specific dialog
   */
  const updateFormData = useCallback(<T>(type: ItemType, data: T) => {
    switch (type) {
      case "material":
        setMaterialDialog((prev) => ({ ...prev, formData: data as any }));
        break;
      case "packaging":
        setPackagingDialog((prev) => ({ ...prev, formData: data as any }));
        break;
      case "label":
        setLabelDialog((prev) => ({ ...prev, formData: data as any }));
        break;
    }
  }, []);

  return {
    materialDialog,
    packagingDialog,
    labelDialog,
    openDialog,
    closeDialog,
    updateFormData,
  };
}
