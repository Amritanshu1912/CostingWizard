// src/hooks/material-hooks/use-materials-mutations.ts
import { db } from "@/lib/db";
import type {
  MaterialFormData,
  SupplierMaterialFormData,
  CategoryFormData,
} from "@/types/material-types";
import { assignCategoryColor } from "@/utils/color-utils";
import { normalizeText } from "@/utils/text-utils";
import { nanoid } from "nanoid";
import { useCallback } from "react";

/**
 * Provides functions to create, update, and delete materials.
 * @returns Object with createMaterial, updateMaterial, deleteMaterial
 */
export function useMaterialMutations() {
  const createMaterial = useCallback(
    async (data: MaterialFormData): Promise<string> => {
      const now = new Date().toISOString();
      const id = nanoid();

      // Check for duplicates
      const normalized = normalizeText(data.name);
      const duplicate = await db.materials
        .filter((m) => normalizeText(m.name) === normalized)
        .first();

      if (duplicate) {
        throw new Error(`Material with these specifications already exists`);
      }

      // Ensure category exists
      await ensureCategoryExists(data.category, now);

      // Create material
      await db.materials.add({
        id,
        name: data.name.trim(),
        category: data.category.trim(),
        notes: data.notes?.trim(),
        createdAt: now,
      });

      return id;
    },
    []
  );

  const updateMaterial = useCallback(
    async (id: string, data: Partial<MaterialFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // Check for duplicate name
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.materials
          .filter((m) => m.id !== id && normalizeText(m.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error(`Material with these specifications already exists`);
        }
      }

      // Ensure category exists if being updated
      if (data.category) {
        await ensureCategoryExists(data.category, now);
      }

      // Update material
      await db.materials.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.category && { category: data.category.trim() }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() }),
        updatedAt: now,
      });
    },
    []
  );

  const deleteMaterial = useCallback(async (id: string): Promise<void> => {
    // Check if in use
    const inUse = await db.supplierMaterials
      .where("materialId")
      .equals(id)
      .count();

    if (inUse > 0) {
      throw new Error("Cannot delete material that is used by suppliers");
    }

    await db.materials.delete(id);
  }, []);

  return { createMaterial, updateMaterial, deleteMaterial };
}

/**
 * Provides functions to create, update, and delete supplier materials.
 * @returns Object with createSupplierMaterial, updateSupplierMaterial, deleteSupplierMaterial
 */
export function useSupplierMaterialMutations() {
  const createSupplierMaterial = useCallback(
    async (data: SupplierMaterialFormData): Promise<string> => {
      const now = new Date().toISOString();

      // Use database transaction for atomic operations
      return await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          await ensureCategoryExists(data.materialCategory, now);

          let materialId: string;

          if (data.materialId) {
            // Using existing material
            materialId = data.materialId;

            const material = await db.materials.get(materialId);
            if (
              material &&
              material.category !== data.materialCategory.trim()
            ) {
              await db.materials.update(materialId, {
                category: data.materialCategory.trim(),
                updatedAt: now,
              });
            }
          } else {
            // Check if material exists
            const normalized = normalizeText(data.materialName);
            const existingMaterial = await db.materials
              .filter((m) => normalizeText(m.name) === normalized)
              .first();

            if (existingMaterial) {
              materialId = existingMaterial.id;

              // Update category if changed
              if (existingMaterial.category !== data.materialCategory.trim()) {
                await db.materials.update(materialId, {
                  category: data.materialCategory.trim(),
                  updatedAt: now,
                });
              }
            } else {
              materialId = nanoid();
              await db.materials.add({
                id: materialId,
                name: data.materialName.trim(),
                category: data.materialCategory.trim(),
                notes: data.notes?.trim(),
                createdAt: now,
              });
            }
          }

          const unitPrice = data.bulkPrice / (data.quantityForBulkPrice || 1);

          const supplierMaterialId = nanoid();
          await db.supplierMaterials.add({
            id: supplierMaterialId,
            supplierId: data.supplierId,
            materialId,
            unitPrice,
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

          return supplierMaterialId;
        }
      );
    },
    []
  );

  const updateSupplierMaterial = useCallback(
    async (
      id: string,
      data: Partial<SupplierMaterialFormData>
    ): Promise<void> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          const supplierMaterial = await db.supplierMaterials.get(id);
          if (!supplierMaterial) {
            throw new Error("Supplier material not found");
          }

          // Handle material/category updates
          if (data.materialCategory || data.materialName) {
            const material = await db.materials.get(
              supplierMaterial.materialId
            );
            if (!material) {
              throw new Error("Material not found");
            }

            // Update category
            if (
              data.materialCategory &&
              material.category !== data.materialCategory.trim()
            ) {
              await ensureCategoryExists(data.materialCategory, now);
              await db.materials.update(material.id, {
                category: data.materialCategory.trim(),
                updatedAt: now,
              });
            }

            // Update material name
            if (
              data.materialName &&
              material.name !== data.materialName.trim()
            ) {
              const normalized = normalizeText(data.materialName);
              const duplicate = await db.materials
                .filter(
                  (m) =>
                    m.id !== material.id && normalizeText(m.name) === normalized
                )
                .first();

              if (duplicate) {
                throw new Error(
                  `Material with these specifications already exists`
                );
              }

              await db.materials.update(material.id, {
                name: data.materialName.trim(),
                updatedAt: now,
              });
            }
          }

          // Calculate unit price if bulk pricing changed
          let unitPrice = supplierMaterial.unitPrice;
          if (
            data.bulkPrice !== undefined ||
            data.quantityForBulkPrice !== undefined
          ) {
            const bulkPrice = data.bulkPrice ?? supplierMaterial.bulkPrice ?? 0;
            const quantity =
              data.quantityForBulkPrice ??
              supplierMaterial.quantityForBulkPrice ??
              1;
            unitPrice = bulkPrice / quantity;
          }

          // Update supplier material
          await db.supplierMaterials.update(id, {
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(unitPrice !== supplierMaterial.unitPrice && { unitPrice }),
            ...(data.bulkPrice !== undefined && { bulkPrice: data.bulkPrice }),
            ...(data.quantityForBulkPrice !== undefined && {
              quantityForBulkPrice: data.quantityForBulkPrice,
            }),
            ...(data.capacityUnit && { capacityUnit: data.capacityUnit }),
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

  const deleteSupplierMaterial = useCallback(
    async (id: string): Promise<void> => {
      await db.supplierMaterials.delete(id);
    },
    []
  );

  return {
    createSupplierMaterial,
    updateSupplierMaterial,
    deleteSupplierMaterial,
  };
}

/**
 * Provides functions to create, update, and delete categories.
 * @returns Object with createCategory, updateCategory, deleteCategory
 */
export function useCategoryMutations() {
  const createCategory = useCallback(
    async (data: CategoryFormData): Promise<string> => {
      const now = new Date().toISOString();
      const id = nanoid();

      // Check for duplicates
      const normalized = normalizeText(data.name);
      const duplicate = await db.categories
        .filter((c) => normalizeText(c.name) === normalized)
        .first();

      if (duplicate) {
        throw new Error(`Category with these specifications already exists`);
      }

      await db.categories.add({
        id,
        name: data.name.trim(),
        description: data.description?.trim(),
        color: data.color || assignCategoryColor(data.name),
        createdAt: now,
      });

      return id;
    },
    []
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<CategoryFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // Check for duplicate name
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.categories
          .filter((c) => c.id !== id && normalizeText(c.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error(`Category with these specifications already exists`);
        }
      }

      await db.categories.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim(),
        }),
        ...(data.color && { color: data.color }),
        updatedAt: now,
      });
    },
    []
  );

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    const category = await db.categories.get(id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if in use
    const inUse = await db.materials
      .filter((m) => m.category === category.name)
      .count();

    if (inUse > 0) {
      throw new Error("Cannot delete category that is in use");
    }

    await db.categories.delete(id);
  }, []);

  return { createCategory, updateCategory, deleteCategory };
}

/**
 * Combined hook for all material mutations.
 * @returns Object with all mutation functions
 */
export function useMaterialsMutations() {
  const materialMutations = useMaterialMutations();
  const supplierMaterialMutations = useSupplierMaterialMutations();
  const categoryMutations = useCategoryMutations();

  return {
    ...materialMutations,
    ...supplierMaterialMutations,
    ...categoryMutations,
  };
}

// HELPER FUNCTION

/**
 * Ensure category exists, create if not
 */
async function ensureCategoryExists(
  categoryName: string,
  timestamp: string
): Promise<void> {
  const normalized = normalizeText(categoryName);
  const existing = await db.categories
    .filter((c) => normalizeText(c.name) === normalized)
    .first();

  if (!existing) {
    await db.categories.add({
      id: nanoid(),
      name: categoryName.trim(),
      color: assignCategoryColor(categoryName),
      createdAt: timestamp,
    });
  }
}
