/**
 * Mutation hooks - All database write operations
 *
 * Encapsulates all CRUD operations for labels, supplier labels,
 * and related entities. Components should never import db directly.
 *
 * Benefits:
 * - Single source for all mutations
 * - Consistent error handling
 * - Automatic timestamp management
 * - Transaction support for complex operations
 */

import { db } from "@/lib/db";
import type { LabelFormData, SupplierLabelFormData } from "@/types/label-types";
import { normalizeText } from "@/utils/text-utils";
import { nanoid } from "nanoid";
import { useCallback } from "react";

// ============================================================================
// LABEL MUTATIONS
// ============================================================================

export function useLabelMutations() {
  const createLabel = useCallback(
    async (data: LabelFormData): Promise<string> => {
      const now = new Date().toISOString();
      const id = nanoid();

      // Check for exact combination duplicates (same name + all properties)
      const duplicate = await db.labels
        .filter(
          (l) =>
            normalizeText(l.name) === normalizeText(data.name) &&
            l.type === data.type &&
            l.printingType === data.printingType &&
            l.material === data.material &&
            l.shape === data.shape &&
            (l.size || "") === (data.size?.trim() || "")
        )
        .first();

      if (duplicate) {
        throw new Error(`Label with these exact specifications already exists`);
      }

      // Create label
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

      // Check for exact combination duplicates (same name + all properties)
      // This prevents creating duplicate combinations when editing
      if (
        data.name !== undefined &&
        data.type !== undefined &&
        data.printingType !== undefined &&
        data.material !== undefined &&
        data.shape !== undefined
      ) {
        const duplicate = await db.labels
          .filter(
            (l) =>
              l.id !== id && // exclude current label
              normalizeText(l.name) === normalizeText(data.name!) &&
              l.type === data.type &&
              l.printingType === data.printingType &&
              l.material === data.material &&
              l.shape === data.shape &&
              (l.size || "") === (data.size?.trim() || "")
          )
          .first();

        if (duplicate) {
          throw new Error(`Label with these specifications already exists`);
        }
      }

      // Update label
      await db.labels.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type }),
        ...(data.printingType && { printingType: data.printingType }),
        ...(data.material && { material: data.material }),
        ...(data.shape && { shape: data.shape }),
        ...(data.size !== undefined && { size: data.size?.trim() }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() }),
        updatedAt: now,
      });
    },
    []
  );

  const deleteLabel = useCallback(async (id: string): Promise<void> => {
    // Check if label is in use by any supplier labels
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

// ============================================================================
// SUPPLIER LABEL MUTATIONS
// ============================================================================

export function useSupplierLabelMutations() {
  const createSupplierLabel = useCallback(
    async (data: SupplierLabelFormData): Promise<string> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.labels, db.supplierLabels],
        async () => {
          // Step 1: Get or create label
          let labelId: string;

          // Check if label with exact combination already exists
          // Business rule: each unique combination of (name + type + printing + material + shape + size) is separate
          const existingLabel = await db.labels
            .filter(
              (l) =>
                normalizeText(l.name) === normalizeText(data.labelName) &&
                l.type === data.labelType &&
                l.printingType === data.printingType &&
                l.material === data.material &&
                l.shape === data.shape &&
                (l.size || "") === (data.size?.trim() || "")
            )
            .first();

          if (existingLabel) {
            // Use existing label with exact match
            labelId = existingLabel.id;
          } else {
            // Create new label - no exact match found
            labelId = nanoid();
            await db.labels.add({
              id: labelId,
              name: data.labelName.trim(),
              type: data.labelType,
              printingType: data.printingType,
              material: data.material,
              shape: data.shape,
              size: data.size?.trim(),
              notes: data.notes?.trim(),
              createdAt: now,
            });
          }

          // Step 2: Calculate unit price
          const unitPrice = data.bulkPrice / (data.quantityForBulkPrice || 1);

          // Step 3: Create supplier label
          const supplierLabelId = nanoid();
          await db.supplierLabels.add({
            id: supplierLabelId,
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

          return supplierLabelId;
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
          const supplierLabel = await db.supplierLabels.get(id);
          if (!supplierLabel) {
            throw new Error("Supplier label not found");
          }

          // Handle label changes - use combination logic like createSupplierLabel
          if (
            data.labelName ||
            data.labelType ||
            data.printingType ||
            data.material ||
            data.shape ||
            data.size
          ) {
            // Ensure required fields are present for combination check
            if (
              !data.labelName ||
              !data.labelType ||
              !data.printingType ||
              !data.material ||
              !data.shape
            ) {
              throw new Error("All label properties are required for updates");
            }

            // Check if the new label combination already exists
            // Business rule: each unique combination is separate
            const existingLabel = await db.labels
              .filter(
                (l) =>
                  normalizeText(l.name) === normalizeText(data.labelName!) &&
                  l.type === data.labelType &&
                  l.printingType === data.printingType &&
                  l.material === data.material &&
                  l.shape === data.shape &&
                  (l.size || "") === (data.size?.trim() || "")
              )
              .first();

            let newLabelId: string;

            if (existingLabel) {
              // Use existing label with exact match
              newLabelId = existingLabel.id;
            } else {
              // Create new label - no exact match found
              newLabelId = nanoid();
              await db.labels.add({
                id: newLabelId,
                name: data.labelName.trim(),
                type: data.labelType,
                printingType: data.printingType,
                material: data.material,
                shape: data.shape,
                size: data.size?.trim(),
                notes: data.notes?.trim(),
                createdAt: now,
              });
            }

            // Update supplier label to reference the new/correct label
            await db.supplierLabels.update(id, {
              labelId: newLabelId,
              updatedAt: now,
            });
          }

          // Calculate unit price if bulk pricing changed
          let unitPrice = supplierLabel.unitPrice;
          if (
            data.bulkPrice !== undefined ||
            data.quantityForBulkPrice !== undefined
          ) {
            const bulkPrice = data.bulkPrice ?? supplierLabel.bulkPrice ?? 0;
            const quantity =
              data.quantityForBulkPrice ??
              supplierLabel.quantityForBulkPrice ??
              1;
            unitPrice = bulkPrice / quantity;
          }

          // Update supplier label
          await db.supplierLabels.update(id, {
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(unitPrice !== supplierLabel.unitPrice && { unitPrice }),
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

// ============================================================================
// COMBINED MUTATIONS HOOK
// ============================================================================

/**
 * Get all mutation hooks in one place
 * Convenient for components that need multiple mutation types
 */
export function useLabelsMutations() {
  const labelMutations = useLabelMutations();
  const supplierLabelMutations = useSupplierLabelMutations();

  return {
    ...labelMutations,
    ...supplierLabelMutations,
  };
}
