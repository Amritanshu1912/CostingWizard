// src/hooks/packaging-hooks/use-packaging-mutations.ts
import { db } from "@/lib/db";
import type {
  BuildMaterial,
  CapacityUnit,
  Packaging,
  PackagingFormData,
  PackagingType,
  SupplierPackagingFormData,
} from "@/types/packaging-types";
import { normalizeText } from "@/utils/text-utils";
import { nanoid } from "nanoid";
import { useCallback } from "react";

/**
 * Finds packaging with exact specifications to prevent duplicates.
 * @param name - Packaging name
 * @param type - Packaging type
 * @param capacity - Capacity value
 * @param capacityUnit - Capacity unit
 * @param buildMaterial - Build material
 * @param excludeId - Optional ID to exclude from search
 * @returns Matching packaging ID or null
 */
async function findExactPackagingMatch(
  name: string,
  type: PackagingType,
  capacity: number,
  capacityUnit: CapacityUnit,
  buildMaterial: BuildMaterial,
  excludeId?: string
): Promise<{ id: string } | null> {
  const matches = await db.packaging
    .filter((p) => {
      if (excludeId && p.id === excludeId) return false;

      return (
        normalizeText(p.name) === normalizeText(name) &&
        p.type === type &&
        p.capacity === capacity &&
        p.capacityUnit === capacityUnit &&
        p.buildMaterial === buildMaterial
      );
    })
    .toArray();

  return matches.length > 0 ? { id: matches[0].id } : null;
}

/**
 * Validates packaging form data.
 * @param data - Form data to validate
 */
function validatePackagingData(data: PackagingFormData): void {
  const trimmedName = data.name.trim();
  const capacity = data.capacity;

  if (!trimmedName || !data.type) {
    throw new Error("Name and type are required");
  }

  if (capacity !== undefined && (isNaN(capacity) || capacity < 0)) {
    throw new Error("Capacity must be a positive number");
  }

  if (capacity !== undefined && capacity > 0 && !data.capacityUnit) {
    throw new Error("Unit is required when capacity is specified");
  }
}

/**
 * Gets existing packaging or creates new one with specifications.
 * @param data - Packaging data without ID and createdAt
 * @param timestamp - Creation timestamp
 * @returns Packaging ID
 */
async function getOrCreatePackaging(
  data: Omit<Packaging, "id" | "createdAt">,
  timestamp: string
): Promise<string> {
  const existing = await findExactPackagingMatch(
    data.name,
    data.type,
    data.capacity,
    data.capacityUnit,
    data.buildMaterial
  );

  if (existing) {
    return existing.id;
  }

  const id = nanoid();
  await db.packaging.add({
    id,
    name: data.name.trim(),
    type: data.type,
    capacity: data.capacity,
    capacityUnit: data.capacityUnit,
    buildMaterial: data.buildMaterial,
    notes: data.notes?.trim(),
    createdAt: timestamp,
  });

  return id;
}

/**
 * Provides functions to create, update, and delete packagings.
 * @returns Object with createPackaging, updatePackaging, deletePackaging
 */
export function usePackagingMutations() {
  const createPackaging = useCallback(
    async (data: PackagingFormData): Promise<string> => {
      const now = new Date().toISOString();

      // Validate
      validatePackagingData(data);

      // Check for exact duplicate
      const existing = await findExactPackagingMatch(
        data.name,
        data.type,
        data.capacity,
        data.capacityUnit,
        data.buildMaterial
      );

      if (existing) {
        throw new Error(
          "A packaging with identical specifications already exists. Please modify at least one property to create a new entry."
        );
      }
      const id = nanoid();
      // Create packaging
      await db.packaging.add({
        id,
        name: data.name.trim(),
        type: data.type,
        capacity: data.capacity || 0,
        capacityUnit: data.capacityUnit || "ml",
        buildMaterial: data.buildMaterial || "Other",
        createdAt: now,
      });

      return id;
    },
    []
  );

  const updatePackaging = useCallback(
    async (id: string, data: Partial<PackagingFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // Get current packaging
      const current = await db.packaging.get(id);
      if (!current) {
        throw new Error("Packaging not found");
      }

      // Merge with current values for validation
      const merged: PackagingFormData = {
        name: data.name ?? current.name,
        type: data.type ?? current.type,
        capacity: data.capacity ?? current.capacity,
        capacityUnit: data.capacityUnit ?? current.capacityUnit,
        buildMaterial: data.buildMaterial ?? current.buildMaterial,
      };

      // Validate merged data
      validatePackagingData(merged);

      // Check for duplicate (excluding current)
      const existing = await findExactPackagingMatch(
        merged.name,
        merged.type,
        merged.capacity,
        merged.capacityUnit,
        merged.buildMaterial,
        id // exclude current
      );

      if (existing) {
        throw new Error(
          "A packaging with identical specifications already exists. Please modify at least one property."
        );
      }

      // Update
      await db.packaging.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type as any }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.capacityUnit && { capacityUnit: data.capacityUnit as any }),
        ...(data.buildMaterial !== undefined && {
          buildMaterial: data.buildMaterial as any,
        }),
        updatedAt: now,
      });
    },
    []
  );

  const deletePackaging = useCallback(async (id: string): Promise<void> => {
    // Check if in use
    const inUse = await db.supplierPackaging
      .where("packagingId")
      .equals(id)
      .count();

    if (inUse > 0) {
      throw new Error("Cannot delete packaging that is used by suppliers");
    }

    await db.packaging.delete(id);
  }, []);

  return {
    createPackaging,
    updatePackaging,
    deletePackaging,
  };
}

/**
 * Provides functions to create, update, and delete supplier packagings.
 * @returns Object with createSupplierPackaging, updateSupplierPackaging, deleteSupplierPackaging
 */
export function useSupplierPackagingMutations() {
  const createSupplierPackaging = useCallback(
    async (data: SupplierPackagingFormData): Promise<string> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          // Get or create packaging with exact specifications
          const packagingId = await getOrCreatePackaging(
            {
              name: data.packagingName,
              type: data.packagingType!,
              capacity: data.capacity,
              capacityUnit: data.capacityUnit,
              buildMaterial: data.buildMaterial,
              notes: data.notes,
            },
            now
          );

          // Create supplier packaging
          const id = nanoid();
          await db.supplierPackaging.add({
            id,
            supplierId: data.supplierId,
            packagingId,
            unitPrice: data.unitPrice,
            bulkPrice: data.bulkPrice,
            quantityForBulkPrice: data.quantityForBulkPrice || 1,
            capacityUnit: data.capacityUnit,
            tax: data.tax,
            moq: data.moq,
            leadTime: data.leadTime,
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

  const updateSupplierPackaging = useCallback(
    async (
      id: string,
      data: Partial<SupplierPackagingFormData>
    ): Promise<void> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          const current = await db.supplierPackaging.get(id);
          if (!current) {
            throw new Error("Supplier packaging not found");
          }

          // Handle packaging changes if any packaging property is updated
          const hasPackagingChanges =
            data.packagingName ||
            data.packagingType ||
            data.capacity !== undefined ||
            data.capacityUnit ||
            data.buildMaterial !== undefined;

          if (hasPackagingChanges) {
            // Get current packaging for fallback values
            const currentPackaging = await db.packaging.get(
              current.packagingId
            );
            if (!currentPackaging) {
              throw new Error("Current packaging not found");
            }

            // Get or create packaging with new specifications
            const newPackagingId = await getOrCreatePackaging(
              {
                name: data.packagingName || currentPackaging.name,
                type: data.packagingType || currentPackaging.type,
                capacity: data.capacity ?? currentPackaging.capacity,
                capacityUnit:
                  data.capacityUnit || currentPackaging.capacityUnit,
                buildMaterial:
                  data.buildMaterial ?? currentPackaging.buildMaterial,
                notes: data.notes,
              },
              now
            );

            // Update supplier packaging to reference new/correct packaging
            await db.supplierPackaging.update(id, {
              packagingId: newPackagingId,
            });
          }

          // Update supplier packaging fields
          await db.supplierPackaging.update(id, {
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
            ...(data.bulkPrice !== undefined && { bulkPrice: data.bulkPrice }),
            ...(data.quantityForBulkPrice !== undefined && {
              quantityForBulkPrice: data.quantityForBulkPrice,
            }),
            ...(data.tax !== undefined && { tax: data.tax }),
            ...(data.moq !== undefined && { moq: data.moq }),
            ...(data.leadTime !== undefined && { leadTime: data.leadTime }),
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

  const deleteSupplierPackaging = useCallback(
    async (id: string): Promise<void> => {
      await db.supplierPackaging.delete(id);
    },
    []
  );

  return {
    createSupplierPackaging,
    updateSupplierPackaging,
    deleteSupplierPackaging,
  };
}

/**
 * Combined hook for all packaging mutations.
 * @returns Object with all mutation functions
 */
export function useAllPackagingMutations() {
  const packagingMutations = usePackagingMutations();
  const supplierPackagingMutations = useSupplierPackagingMutations();

  return {
    ...packagingMutations,
    ...supplierPackagingMutations,
  };
}
