/**
 * Supplier mutation hooks
 * Provides CRUD operations for suppliers with proper error handling and loading states
 */

import { db } from "@/lib/db";
import type { Supplier } from "@/types/supplier-types";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Hook for supplier CRUD mutations
 * Provides create, update, and delete operations with loading states and error handling
 */
export function useSupplierMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Creates a new supplier in the database
   * @param supplierData - The supplier data to create (without id and createdAt)
   * @returns Promise resolving to the created supplier with generated fields
   */
  const createSupplier = async (
    supplierData: Omit<Supplier, "id" | "createdAt">
  ): Promise<Supplier> => {
    try {
      setIsCreating(true);

      const newSupplier: Supplier = {
        ...supplierData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().split("T")[0],
      };

      await db.suppliers.add(newSupplier);

      toast.success(`Supplier "${newSupplier.name}" created successfully!`);
      return newSupplier;
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to create supplier");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Updates an existing supplier in the database
   * @param supplier - The complete supplier object to update
   */
  const updateSupplier = async (supplier: Supplier): Promise<void> => {
    try {
      setIsUpdating(true);
      await db.suppliers.put(supplier);
      toast.success(`Supplier "${supplier.name}" updated successfully!`);
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Soft-deletes a supplier by marking as inactive
   * @param id - The supplier ID to delete
   */
  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      await db.suppliers.update(id, { isActive: false });
      toast.success("Supplier deleted successfully!");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
