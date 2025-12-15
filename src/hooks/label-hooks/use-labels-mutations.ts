// src/hooks/label-hooks/use-labels-mutations.ts

import { db } from "@/lib/db";
import type {
  Label,
  LabelFormData,
  SupplierLabelFormData,
} from "@/types/label-types";
import { normalizeText } from "@/utils/shared-utils";
import { nanoid } from "nanoid";
import { useCallback } from "react";

interface LabelMutations {
  createLabel: (data: LabelFormData) => Promise<string>;
  updateLabel: (id: string, data: Partial<LabelFormData>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
}

// Helper function to check if a label with exact specifications already exists
async function findExactLabelMatch(
  name: string,
  type: string,
  printingType: string,
  material: string,
  shape: string,
  size: string | undefined,
  excludeId?: string
): Promise<{ id: string } | null> {
  // Query database for labels matching all specifications exactly
  const matches = await db.labels
    .filter((l) => {
      // Skip the label being updated if excludeId is provided
      if (excludeId && l.id === excludeId) return false;

      return (
        normalizeText(l.name) === normalizeText(name) &&
        l.type === type &&
        l.printingType === printingType &&
        l.material === material &&
        l.shape === shape &&
        (l.size || "") === (size?.trim() || "")
      );
    })
    .toArray();

  // Return the first match's ID, or null if no matches found
  return matches.length > 0 ? { id: matches[0].id } : null;
}

/**
 * Get or create label with exact specifications.
 *
 * This helper function checks if a label with the exact same specifications
 * already exists, and if so returns its ID. Otherwise, creates a new label
 * and returns the new ID.
 *
 * @param {Omit<Label, "id" | "createdAt">} data - Label data without ID and timestamp
 * @param {string} timestamp - ISO timestamp for creation
 * @returns {Promise<string>} The ID of the existing or newly created label
 */
async function getOrCreateLabel(
  data: Omit<Label, "id" | "createdAt">,
  timestamp: string
): Promise<string> {
  // First attempt to find an existing label with identical specifications
  const existing = await findExactLabelMatch(
    data.name,
    data.type,
    data.printingType,
    data.material,
    data.shape,
    data.size
  );

  // If exact match found, return existing label ID to avoid duplication
  if (existing) {
    return existing.id;
  }

  // No existing match found, create a new label with unique ID
  const id = nanoid();

  // Insert new label into database with cleaned/truncated data
  await db.labels.add({
    id,
    name: data.name.trim(),
    type: data.type as any,
    printingType: data.printingType as any,
    material: data.material as any,
    shape: data.shape as any,
    size: data.size?.trim(),
    notes: data.notes?.trim(),
    createdAt: timestamp,
  });

  // Return the newly created label's ID
  return id;
}

// Hook providing functions to create, update, and delete labels.
// Includes duplicate checking to prevent identical label specifications.
/**
 * @returns {LabelMutations} Object containing createLabel, updateLabel, and deleteLabel functions
 */
export function useLabelMutations(): LabelMutations {
  const createLabel = useCallback(
    async (data: LabelFormData): Promise<string> => {
      const now = new Date().toISOString();

      // Prevent duplicate labels by checking for exact specification matches
      const existing = await findExactLabelMatch(
        data.name,
        data.type,
        data.printingType,
        data.material,
        data.shape,
        data.size
      );

      // If duplicate found, reject creation with clear error message
      if (existing) {
        throw new Error(
          "A label with identical specifications already exists. Please modify at least one property to create a new entry."
        );
      }

      const id = nanoid();

      // Insert new label into database with sanitized data
      await db.labels.add({
        id,
        name: data.name.trim(),
        type: data.type,
        printingType: data.printingType,
        material: data.material,
        shape: data.shape,
        size: data.size?.trim(),
        notes: data.notes?.trim(),
        createdAt: now,
      });

      return id;
    },
    []
  );

  const updateLabel = useCallback(
    async (id: string, data: Partial<LabelFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // Get current label for merged validation
      const current = await db.labels.get(id);
      if (!current) {
        throw new Error("Label not found");
      }

      // Merge with current values
      const merged = {
        name: data.name ?? current.name,
        type: data.type ?? current.type,
        printingType: data.printingType ?? current.printingType,
        material: data.material ?? current.material,
        shape: data.shape ?? current.shape,
        size: data.size ?? current.size,
      };

      // Check for duplicate (excluding current)
      const existing = await findExactLabelMatch(
        merged.name,
        merged.type,
        merged.printingType,
        merged.material,
        merged.shape,
        merged.size,
        id // exclude current
      );

      if (existing) {
        throw new Error(
          "A label with identical specifications already exists. Please modify at least one property."
        );
      }

      // Update
      await db.labels.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type as any }),
        ...(data.printingType && { printingType: data.printingType as any }),
        ...(data.material && { material: data.material as any }),
        ...(data.shape && { shape: data.shape as any }),
        ...(data.size !== undefined && { size: data.size?.trim() }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() }),
        updatedAt: now,
      });
    },
    []
  );

  const deleteLabel = useCallback(async (id: string): Promise<void> => {
    // Check if in use
    const inUse = await db.supplierLabels.where("labelId").equals(id).count();

    if (inUse > 0) {
      throw new Error("Cannot delete label that is used by suppliers");
    }

    await db.labels.delete(id);
  }, []);

  return {
    createLabel,
    updateLabel,
    deleteLabel,
  };
}

// Hook providing functions to create, update, and delete supplier labels.
// Handles the relationship between suppliers and labels with pricing information.
/**
 * @returns {Object} Object containing createSupplierLabel, updateSupplierLabel, and deleteSupplierLabel functions
 */
export function useSupplierLabelMutations() {
  const createSupplierLabel = useCallback(
    async (data: SupplierLabelFormData): Promise<string> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.labels, db.supplierLabels],
        async () => {
          // Get or create label with exact specifications
          const labelId = await getOrCreateLabel(
            {
              name: data.labelName,
              type: data.labelType,
              printingType: data.printingType,
              material: data.material,
              shape: data.shape,
              size: data.size,
              notes: data.notes,
            },
            now
          );

          // Calculate unit price
          const unitPrice = data.bulkPrice / (data.quantityForBulkPrice || 1);

          // Create supplier label
          const id = nanoid();
          await db.supplierLabels.add({
            id,
            supplierId: data.supplierId,
            labelId,
            unit: data.unit,
            unitPrice,
            bulkPrice: data.bulkPrice,
            quantityForBulkPrice: data.quantityForBulkPrice || 1,
            moq: data.moq,
            leadTime: data.leadTime,
            tax: data.tax,
            transportationCost: data.transportationCost,
            bulkDiscounts: data.bulkDiscounts || [],
            notes: data.notes?.trim(),
            createdAt: now,
          });

          return id;
        }
      );
    },
    []
  );

  const updateSupplierLabel = useCallback(
    async (id: string, data: Partial<SupplierLabelFormData>): Promise<void> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.labels, db.supplierLabels],
        async () => {
          const current = await db.supplierLabels.get(id);
          if (!current) {
            throw new Error("Supplier label not found");
          }

          // Handle label changes if any label property is updated
          const hasLabelChanges =
            data.labelName ||
            data.labelType ||
            data.printingType ||
            data.material ||
            data.shape ||
            data.size !== undefined;

          if (hasLabelChanges) {
            // Get current label for fallback values
            const currentLabel = await db.labels.get(current.labelId);
            if (!currentLabel) {
              throw new Error("Current label not found");
            }

            // Get or create label with new specifications
            const newLabelId = await getOrCreateLabel(
              {
                name: data.labelName || currentLabel.name,
                type: data.labelType || currentLabel.type,
                printingType: data.printingType || currentLabel.printingType,
                material: data.material || currentLabel.material,
                shape: data.shape || currentLabel.shape,
                size: data.size ?? currentLabel.size,
                notes: data.notes,
              },
              now
            );

            // Update supplier label to reference new/correct label
            await db.supplierLabels.update(id, {
              labelId: newLabelId,
            });
          }

          // Calculate unit price if bulk pricing changed
          let unitPrice = current.unitPrice;
          if (
            data.bulkPrice !== undefined ||
            data.quantityForBulkPrice !== undefined
          ) {
            const bulkPrice = data.bulkPrice ?? current.bulkPrice ?? 0;
            const quantity =
              data.quantityForBulkPrice ?? current.quantityForBulkPrice ?? 1;
            unitPrice = bulkPrice / quantity;
          }

          // Update supplier label fields
          await db.supplierLabels.update(id, {
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(unitPrice !== current.unitPrice && { unitPrice }),
            ...(data.bulkPrice !== undefined && { bulkPrice: data.bulkPrice }),
            ...(data.quantityForBulkPrice !== undefined && {
              quantityForBulkPrice: data.quantityForBulkPrice,
            }),
            ...(data.unit && { unit: data.unit }),
            ...(data.moq !== undefined && { moq: data.moq }),
            ...(data.leadTime !== undefined && { leadTime: data.leadTime }),
            ...(data.tax !== undefined && { tax: data.tax }),
            ...(data.transportationCost !== undefined && {
              transportationCost: data.transportationCost,
            }),
            ...(data.bulkDiscounts && { bulkDiscounts: data.bulkDiscounts }),
            ...(data.notes !== undefined && { notes: data.notes?.trim() }),
            updatedAt: now,
          });
        }
      );
    },
    []
  );

  const deleteSupplierLabel = useCallback(async (id: string): Promise<void> => {
    await db.supplierLabels.delete(id);
  }, []);

  return {
    createSupplierLabel,
    updateSupplierLabel,
    deleteSupplierLabel,
  };
}

// Convenience hook that combines all label mutation functions.
// Provides a single interface to access all CRUD operations for labels and supplier labels.
/**
 * @returns {Object} Combined object with all label and supplier label mutation functions
 */
export function useAllLabelMutations() {
  const labelMutations = useLabelMutations();
  const supplierLabelMutations = useSupplierLabelMutations();

  return {
    ...labelMutations,
    ...supplierLabelMutations,
  };
}
