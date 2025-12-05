import type {
  CategoryFormData,
  MaterialFormData,
  MaterialFormErrors,
  SupplierMaterialFormData,
} from "@/types/material-types";
import { useCallback } from "react";
import { useDuplicateCheck } from "../use-duplicate-check";

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate material form data
 */
export function validateMaterialForm(data: MaterialFormData): {
  isValid: boolean;
  errors: MaterialFormErrors;
} {
  const errors: MaterialFormErrors = {};

  if (!data.name?.trim()) {
    errors.name = "Material name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Material name must be at least 2 characters";
  }

  if (!data.category?.trim()) {
    errors.category = "Category is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate supplier material form data
 */
export function validateSupplierMaterialForm(data: SupplierMaterialFormData): {
  isValid: boolean;
  errors: MaterialFormErrors;
} {
  const errors: MaterialFormErrors = {};

  if (!data.supplierId) {
    errors.supplierId = "Supplier is required";
  }

  if (!data.materialName?.trim()) {
    errors.materialName = "Material name is required";
  } else if (data.materialName.trim().length < 2) {
    errors.materialName = "Material name must be at least 2 characters";
  }

  if (!data.materialCategory?.trim()) {
    errors.materialCategory = "Category is required";
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

  if (!data.capacityUnit) {
    errors.capacityUnit = "Unit is required";
  }

  if (data.tax < 0 || data.tax > 100) {
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

/**
 * Validate category form data
 */
export function validateCategoryForm(data: CategoryFormData): {
  isValid: boolean;
  errors: Pick<MaterialFormErrors, "name">;
} {
  const errors: Pick<MaterialFormErrors, "name"> = {};

  if (!data.name?.trim()) {
    errors.name = "Category name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Category name must be at least 2 characters";
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
export function useMaterialFormValidation<
  T extends MaterialFormData | SupplierMaterialFormData | CategoryFormData,
>(
  formType: "material" | "supplierMaterial" | "category",
  existingItems: Array<{ id: string; name: string }>,
  currentId?: string
) {
  const duplicateCheck = useDuplicateCheck(existingItems, currentId);

  const validate = useCallback(
    (data: T) => {
      switch (formType) {
        case "material":
          return validateMaterialForm(data as MaterialFormData);
        case "supplierMaterial":
          return validateSupplierMaterialForm(data as SupplierMaterialFormData);
        case "category":
          return validateCategoryForm(data as CategoryFormData);
        default:
          return { isValid: false, errors: {} };
      }
    },
    [formType]
  );

  return {
    validate,
    ...duplicateCheck,
  };
}
