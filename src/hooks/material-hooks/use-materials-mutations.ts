/**
 * Mutation hooks - All database write operations
 *
 * Encapsulates all CRUD operations for materials, supplier materials,
 * and categories. Components should never import db directly.
 *
 * Benefits:
 * - Single source for all mutations
 * - Consistent error handling
 * - Automatic timestamp management
 * - Transaction support for complex operations
 */

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

// ============================================================================
// MATERIAL MUTATIONS
// ============================================================================

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
        throw new Error(`Material "${duplicate.name}" already exists`);
      }

      // Create category if it doesn't exist
      const categoryNormalized = normalizeText(data.category);
      const existingCategory = await db.categories
        .filter((c) => normalizeText(c.name) === categoryNormalized)
        .first();

      if (!existingCategory) {
        await db.categories.add({
          id: nanoid(),
          name: data.category.trim(),
          color: assignCategoryColor(data.category),
          createdAt: now,
        });
      }

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

      // If name is being updated, check for duplicates
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.materials
          .filter((m) => m.id !== id && normalizeText(m.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error(`Material "${duplicate.name}" already exists`);
        }
      }

      // If category is being updated, ensure it exists
      if (data.category) {
        const categoryNormalized = normalizeText(data.category);
        const existingCategory = await db.categories
          .filter((c) => normalizeText(c.name) === categoryNormalized)
          .first();

        if (!existingCategory) {
          await db.categories.add({
            id: nanoid(),
            name: data.category.trim(),
            color: assignCategoryColor(data.category),
            createdAt: now,
          });
        }
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
    // Check if material is in use by any supplier materials
    const inUse = await db.supplierMaterials
      .where("materialId")
      .equals(id)
      .count();

    if (inUse > 0) {
      throw new Error("Cannot delete material that is used by suppliers");
    }

    await db.materials.delete(id);
  }, []);

  return {
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
}

// ============================================================================
// SUPPLIER MATERIAL MUTATIONS
// ============================================================================

export function useSupplierMaterialMutations() {
  const createSupplierMaterial = useCallback(
    async (data: SupplierMaterialFormData): Promise<string> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          // Step 1: Ensure category exists
          const categoryNormalized = normalizeText(data.materialCategory);
          const existingCategory = await db.categories
            .filter((c) => normalizeText(c.name) === categoryNormalized)
            .first();

          if (!existingCategory) {
            await db.categories.add({
              id: nanoid(),
              name: data.materialCategory.trim(),
              color: assignCategoryColor(data.materialCategory),
              createdAt: now,
            });
          }

          // Step 2: Get or create material
          let materialId: string;

          if (data.materialId) {
            // Using existing material
            materialId = data.materialId;

            // Update category if it changed
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
            // Check if material with this name already exists
            const normalized = normalizeText(data.materialName);
            const existingMaterial = await db.materials
              .filter((m) => normalizeText(m.name) === normalized)
              .first();

            if (existingMaterial) {
              materialId = existingMaterial.id;

              // Update category if it changed
              if (existingMaterial.category !== data.materialCategory.trim()) {
                await db.materials.update(materialId, {
                  category: data.materialCategory.trim(),
                  updatedAt: now,
                });
              }
            } else {
              // Create new material
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

          // Step 3: Calculate unit price
          const unitPrice = data.bulkPrice / (data.quantityForBulkPrice || 1);

          // Step 4: Create supplier material
          const supplierMaterialId = nanoid();
          await db.supplierMaterials.add({
            id: supplierMaterialId,
            supplierId: data.supplierId,
            materialId,
            unitPrice,
            bulkPrice: data.bulkPrice,
            quantityForBulkPrice: data.quantityForBulkPrice || 1,
            unit: data.unit,
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

            // Update category if changed
            if (
              data.materialCategory &&
              material.category !== data.materialCategory.trim()
            ) {
              const categoryNormalized = normalizeText(data.materialCategory);
              const existingCategory = await db.categories
                .filter((c) => normalizeText(c.name) === categoryNormalized)
                .first();

              if (!existingCategory) {
                await db.categories.add({
                  id: nanoid(),
                  name: data.materialCategory.trim(),
                  color: assignCategoryColor(data.materialCategory),
                  createdAt: now,
                });
              }

              await db.materials.update(material.id, {
                category: data.materialCategory.trim(),
                updatedAt: now,
              });
            }

            // Update material name if changed
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
                throw new Error(`Material "${duplicate.name}" already exists`);
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
            ...(data.unit && { unit: data.unit }),
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

// ============================================================================
// CATEGORY MUTATIONS
// ============================================================================

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
        throw new Error(`Category "${duplicate.name}" already exists`);
      }

      await db.categories.add({
        id,
        name: data.name.trim(),
        description: data.description?.trim(),
        color: assignCategoryColor(data.name),
        createdAt: now,
      });

      return id;
    },
    []
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<CategoryFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // If name is being updated, check for duplicates
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.categories
          .filter((c) => c.id !== id && normalizeText(c.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error(`Category "${duplicate.name}" already exists`);
        }
      }

      await db.categories.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim(),
        }),
        updatedAt: now,
      });
    },
    []
  );

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    // Check if category is in use
    const category = await db.categories.get(id);
    if (!category) {
      throw new Error("Category not found");
    }

    const inUse = await db.materials
      .filter((m) => m.category === category.name)
      .count();

    if (inUse > 0) {
      throw new Error("Cannot delete category that is in use");
    }

    await db.categories.delete(id);
  }, []);

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// ============================================================================
// COMBINED MUTATIONS HOOK
// ============================================================================

/**
 * Get all mutation hooks in one place
 * Convenient for components that need multiple mutation types
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
