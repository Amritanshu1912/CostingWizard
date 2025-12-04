import type {
  PackagingFormErrors,
  PackagingFormData,
  SupplierPackagingFormData,
} from "@/types/packaging-types";
import { useCallback } from "react";
import { useDuplicateCheck } from "../use-duplicate-check";

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate packaging form data
 */
export function validatePackagingForm(data: PackagingFormData): {
  isValid: boolean;
  errors: Pick<PackagingFormErrors, "name" | "type" | "capacity" | "unit">;
} {
  const errors: Pick<
    PackagingFormErrors,
    "name" | "type" | "capacity" | "unit"
  > = {};

  if (!data.name?.trim()) {
    errors.name = "Packaging name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Packaging name must be at least 2 characters";
  }

  if (!data.type) {
    errors.type = "Packaging type is required";
  }

  if (data.capacity !== undefined && data.capacity < 0) {
    errors.capacity = "Capacity must be positive";
  }

  if (data.capacity !== undefined && data.capacity > 0 && !data.unit) {
    errors.unit = "Unit is required when capacity is specified";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate supplier packaging form data
 */
export function validateSupplierPackagingForm(
  data: SupplierPackagingFormData
): {
  isValid: boolean;
  errors: PackagingFormErrors;
} {
  const errors: PackagingFormErrors = {};

  if (!data.supplierId) {
    errors.supplierId = "Supplier is required";
  }

  if (!data.packagingName?.trim()) {
    errors.packagingName = "Packaging name is required";
  } else if (data.packagingName.trim().length < 2) {
    errors.packagingName = "Packaging name must be at least 2 characters";
  }

  if (!data.packagingType) {
    errors.packagingType = "Packaging type is required";
  }

  if (data.capacity !== undefined && data.capacity < 0) {
    errors.capacity = "Capacity must be positive";
  }

  if (data.capacity !== undefined && data.capacity > 0 && !data.unit) {
    errors.unit = "Unit is required when capacity is specified";
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

  if (!data.unitPrice || data.unitPrice <= 0) {
    errors.unitPrice = "Unit price must be greater than 0";
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
export function usePackagingFormValidation<
  T extends PackagingFormData | SupplierPackagingFormData,
>(
  formType: "packaging" | "supplierPackaging",
  existingItems: Array<{ id: string; name: string }>,
  currentId?: string
) {
  const duplicateCheck = useDuplicateCheck(existingItems, currentId);

  const validate = useCallback(
    (data: T) => {
      switch (formType) {
        case "packaging":
          return validatePackagingForm(data as PackagingFormData);
        case "supplierPackaging":
          return validateSupplierPackagingForm(
            data as SupplierPackagingFormData
          );
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
