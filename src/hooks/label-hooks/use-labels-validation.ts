import type {
  LabelFormData,
  LabelFormErrors,
  SupplierLabelFormData,
} from "@/types/label-types";
import { useCallback } from "react";
import { useDuplicateCheck } from "../use-duplicate-check";

// Validation functions for label forms
// Checks required fields, data types, and business rules for label creation/editing

/**
 * Validates basic label form data including required fields and constraints.
 *
 * @param {LabelFormData} data - The label form data to validate
 * @returns {Object} Validation result with isValid boolean and error object
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
 * Validates complete supplier label form data including supplier and pricing information.
 *
 * @param {SupplierLabelFormData} data - The supplier label form data to validate
 * @returns {Object} Validation result with isValid boolean and error object
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

/**
 * Hook providing comprehensive form validation combining field validation and duplicate checking.
 * Supports both basic label forms and supplier label forms with different validation rules.
 *
 * @template T - Either LabelFormData or SupplierLabelFormData
 * @param {string} formType - Type of form being validated ("label" or "supplierLabel")
 * @param {Array<{id: string, name: string}>} existingLabels - Array of existing labels for duplicate checking
 * @param {string} [currentId] - ID of current item being edited (excluded from duplicate check)
 * @returns {Object} Validation functions and duplicate checking utilities
 */
export function useLabelFormValidation<
  T extends LabelFormData | SupplierLabelFormData,
>(
  formType: "label" | "supplierLabel",
  existingLabels: Array<{ id: string; name: string }>,
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

  return {
    validate,
    ...duplicateCheck,
  };
}
