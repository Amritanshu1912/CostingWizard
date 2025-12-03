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

      // Check for duplicates
      const normalized = normalizeText(data.name);
      const duplicate = await db.labels
        .filter((l) => normalizeText(l.name) === normalized)
        .first();

      if (duplicate) {
        throw new Error(`Label "${duplicate.name}" already exists`);
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
        labelFor: data.labelFor?.trim(),
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

      // If name is being updated, check for duplicates
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.labels
          .filter((l) => l.id !== id && normalizeText(l.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error(`Label "${duplicate.name}" already exists`);
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
        ...(data.labelFor !== undefined && { labelFor: data.labelFor?.trim() }),
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

          if (data.labelId) {
            // Using existing label
            labelId = data.labelId;
          } else {
            // Check if label with this name already exists
            const normalized = normalizeText(data.labelName);
            const existingLabel = await db.labels
              .filter((l) => normalizeText(l.name) === normalized)
              .first();

            if (existingLabel) {
              labelId = existingLabel.id;

              // Update label properties if they differ
              const needsUpdate =
                existingLabel.type !== data.labelType ||
                existingLabel.printingType !== data.printingType ||
                existingLabel.material !== data.material ||
                existingLabel.shape !== data.shape ||
                existingLabel.size !== data.size ||
                existingLabel.labelFor !== data.labelFor;

              if (needsUpdate) {
                await db.labels.update(labelId, {
                  type: data.labelType,
                  printingType: data.printingType,
                  material: data.material,
                  shape: data.shape,
                  size: data.size,
                  labelFor: data.labelFor,
                  updatedAt: now,
                });
              }
            } else {
              // Create new label
              labelId = nanoid();
              await db.labels.add({
                id: labelId,
                name: data.labelName.trim(),
                type: data.labelType,
                printingType: data.printingType,
                material: data.material,
                shape: data.shape,
                size: data.size?.trim(),
                labelFor: data.labelFor?.trim(),
                notes: data.notes?.trim(),
                createdAt: now,
              });
            }
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

          // Handle label updates
          if (
            data.labelName ||
            data.labelType ||
            data.printingType ||
            data.material ||
            data.shape ||
            data.size ||
            data.labelFor
          ) {
            const label = await db.labels.get(supplierLabel.labelId || "");
            if (!label) {
              throw new Error("Label not found");
            }

            // Update label if name changed
            if (data.labelName && data.labelName.trim() !== label.name) {
              const normalized = normalizeText(data.labelName);
              const duplicate = await db.labels
                .filter(
                  (l) =>
                    l.id !== label.id && normalizeText(l.name) === normalized
                )
                .first();

              if (duplicate) {
                throw new Error(`Label "${duplicate.name}" already exists`);
              }

              await db.labels.update(label.id, {
                name: data.labelName.trim(),
                updatedAt: now,
              });
            }

            // Update other label properties
            await db.labels.update(label.id, {
              ...(data.labelType && { type: data.labelType }),
              ...(data.printingType && { printingType: data.printingType }),
              ...(data.material && { material: data.material }),
              ...(data.shape && { shape: data.shape }),
              ...(data.size !== undefined && { size: data.size?.trim() }),
              ...(data.labelFor !== undefined && {
                labelFor: data.labelFor?.trim(),
              }),
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
