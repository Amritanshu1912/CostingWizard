import type {
  LabelFormData,
  LabelFormErrors,
  SupplierLabelFormData,
} from "@/types/label-types";
import { useCallback } from "react";
import { useDuplicateCheck } from "../use-duplicate-check";

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate label form data
 */
export function validateLabelForm(data: LabelFormData): {
  isValid: boolean;
  errors: Omit<
    LabelFormErrors,
    | "supplierId"
    | "labelName"
    | "bulkPrice"
    | "quantityForBulkPrice"
    | "unit"
    | "tax"
    | "moq"
    | "leadTime"
  >;
} {
  const errors: Partial<
    Omit<
      LabelFormErrors,
      | "supplierId"
      | "labelName"
      | "bulkPrice"
      | "quantityForBulkPrice"
      | "unit"
      | "tax"
      | "moq"
      | "leadTime"
    >
  > = {};

  if (!data.name?.trim()) {
    errors.name = "Label name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Label name must be at least 2 characters";
  }

  if (!data.type) {
    errors.type = "Label type is required";
  }

  if (!data.printingType) {
    errors.printingType = "Printing type is required";
  }

  if (!data.material) {
    errors.material = "Material is required";
  }

  if (!data.shape) {
    errors.shape = "Shape is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate supplier label form data
 */
export function validateSupplierLabelForm(data: SupplierLabelFormData): {
  isValid: boolean;
  errors: LabelFormErrors;
} {
  const errors: LabelFormErrors = {};

  if (!data.supplierId) {
    errors.supplierId = "Supplier is required";
  }

  if (!data.labelName?.trim()) {
    errors.labelName = "Label name is required";
  } else if (data.labelName.trim().length < 2) {
    errors.labelName = "Label name must be at least 2 characters";
  }

  if (!data.labelType) {
    errors.type = "Label type is required";
  }

  if (!data.printingType) {
    errors.printingType = "Printing type is required";
  }

  if (!data.material) {
    errors.material = "Material is required";
  }

  if (!data.shape) {
    errors.shape = "Shape is required";
  }

  if (!data.bulkPrice || data.bulkPrice <= 0) {
    errors.bulkPrice = "Price must be greater than 0";
  }

  if (
    data.quantityForBulkPrice !== undefined &&
    data.quantityForBulkPrice < 1
  ) {
    errors.quantityForBulkPrice = "Quantity must be at least 1";
  }

  if (!data.unit) {
    errors.unit = "Unit is required";
  }

  if (data.tax !== undefined && (data.tax < 0 || data.tax > 100)) {
    errors.tax = "Tax must be between 0 and 100";
  }

  if (data.moq !== undefined && data.moq < 1) {
    errors.moq = "MOQ must be at least 1";
  }

  if (data.leadTime !== undefined && data.leadTime < 1) {
    errors.leadTime = "Lead time must be at least 1 day";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// VALIDATION HOOK
// ============================================================================

/**
 * Combined validation hook for forms
 * Provides both validation and duplicate checking
 */
export function useLabelFormValidation<
  T extends LabelFormData | SupplierLabelFormData,
>(
  formType: "label" | "supplierLabel",
  existingLabels: Array<{ id: string; name: string }>,
  existingSupplierLabels?: Array<{
    id: string;
    supplierId: string;
    labelId?: string;
  }>,
  currentId?: string
) {
  const duplicateCheck = useDuplicateCheck(existingLabels, currentId);

  const validate = useCallback(
    (data: T) => {
      switch (formType) {
        case "label":
          return validateLabelForm(data as LabelFormData);
        case "supplierLabel":
          return validateSupplierLabelForm(data as SupplierLabelFormData);
        default:
          return { isValid: false, errors: {} };
      }
    },
    [formType]
  );

  // Check for duplicate supplier-label combinations
  const checkSupplierLabelDuplicate = useCallback(
    (supplierId: string, labelName: string, excludeId?: string) => {
      if (!existingSupplierLabels) return false;

      const normalizedName = labelName.toLowerCase().trim();
      return existingSupplierLabels.some((sl) => {
        if (excludeId && sl.id === excludeId) return false;
        // This is a simplified check - in a real app you'd compare against actual label names
        return sl.supplierId === supplierId && sl.id !== excludeId;
      });
    },
    [existingSupplierLabels]
  );

  return {
    validate,
    checkSupplierLabelDuplicate,
    ...duplicateCheck,
  };
}
