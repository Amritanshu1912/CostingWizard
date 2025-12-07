// src/app/suppliers/hooks/use-supplier-form.ts

import type {
  ContactPerson,
  Supplier,
  SupplierFormData,
} from "@/types/supplier-types";
import { useCallback, useState } from "react";

type FormMode = "view" | "edit" | "create";

interface UseSupplierFormReturn {
  formData: SupplierFormData | null;
  mode: FormMode;
  setMode: (mode: FormMode) => void;
  updateField: <K extends keyof SupplierFormData>(
    field: K,
    value: SupplierFormData[K]
  ) => void;
  updateContact: (
    index: number,
    field: keyof ContactPerson,
    value: string
  ) => void;
  addContact: () => void;
  removeContact: (index: number) => void;
  resetForm: (supplier?: Supplier) => void;
  validateForm: () => { isValid: boolean; error?: string };
}

/**
 * Hook for managing supplier form state and operations.
 * Handles form data, validation, and contact person management.
 *
 * @param initialSupplier - Optional supplier to initialize form with
 * @returns Form state and handler functions
 */
export function useSupplierForm(
  initialSupplier?: Supplier
): UseSupplierFormReturn {
  const [formData, setFormData] = useState<SupplierFormData | null>(
    initialSupplier ? toFormData(initialSupplier) : null
  );
  const [mode, setMode] = useState<FormMode>("view");

  /**
   * Updates a single form field
   */
  const updateField = useCallback(
    <K extends keyof SupplierFormData>(
      field: K,
      value: SupplierFormData[K]
    ) => {
      setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    },
    []
  );

  /**
   * Updates a specific contact person field
   */
  const updateContact = useCallback(
    (index: number, field: keyof ContactPerson, value: string) => {
      setFormData((prev) => {
        if (!prev) return null;
        const updatedContacts = [...(prev.contactPersons || [])];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        return { ...prev, contactPersons: updatedContacts };
      });
    },
    []
  );

  /**
   * Adds a new empty contact person
   */
  const addContact = useCallback(() => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        contactPersons: [
          ...(prev.contactPersons || []),
          { name: "", role: "", email: "", phone: "" },
        ],
      };
    });
  }, []);

  /**
   * Removes a contact person at specified index
   */
  const removeContact = useCallback((index: number) => {
    setFormData((prev) => {
      if (!prev || (prev.contactPersons || []).length <= 1) return prev;
      const updatedContacts = [...(prev.contactPersons || [])];
      updatedContacts.splice(index, 1);
      return { ...prev, contactPersons: updatedContacts };
    });
  }, []);

  /**
   * Resets form to initial or provided supplier data
   */
  const resetForm = useCallback((supplier?: Supplier) => {
    setFormData(supplier ? toFormData(supplier) : null);
    setMode("view");
  }, []);

  /**
   * Validates form data for submission
   */
  const validateForm = useCallback((): { isValid: boolean; error?: string } => {
    if (!formData) {
      return { isValid: false, error: "No form data" };
    }

    if (!formData.name.trim()) {
      return { isValid: false, error: "Supplier name is required" };
    }

    if (!formData.contactPersons || formData.contactPersons.length === 0) {
      return {
        isValid: false,
        error: "At least one contact person is required",
      };
    }

    if (!formData.contactPersons[0].name.trim()) {
      return { isValid: false, error: "Primary contact name is required" };
    }

    return { isValid: true };
  }, [formData]);

  return {
    formData,
    mode,
    setMode,
    updateField,
    updateContact,
    addContact,
    removeContact,
    resetForm,
    validateForm,
  };
}

/**
 * Converts Supplier to SupplierFormData by removing generated fields
 */
function toFormData(supplier: Supplier): SupplierFormData {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...formData
  } = supplier;
  return formData;
}
