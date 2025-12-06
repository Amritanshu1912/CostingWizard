// src/hooks/material-hooks/use-materials-mutations.ts
import { db } from "@/lib/db";
import type {
  CategoryFormData,
  MaterialFormData,
  SupplierMaterialFormData,
} from "@/types/material-types";
import { assignCategoryColor } from "@/utils/color-utils";
import { normalizeText } from "@/utils/text-utils";
import { nanoid } from "nanoid";
import { useCallback } from "react";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Ensures a category exists in the database, creating it if not found.
 * Performs case-insensitive name matching.
 * @param categoryName - Name of the category to ensure exists
 * @param timestamp - ISO timestamp for createdAt field if creating
 * @param color - Optional hex color code, auto-assigned if not provided
 */
async function ensureCategoryExists(
  categoryName: string,
  timestamp: string,
  color?: string
): Promise<void> {
  const normalized = normalizeText(categoryName);
  const existing = await db.categories
    .filter((c) => normalizeText(c.name) === normalized)
    .first();

  if (!existing) {
    await db.categories.add({
      id: nanoid(),
      name: categoryName.trim(),
      color: color || assignCategoryColor(categoryName),
      createdAt: timestamp,
    });
  }
}

/**
 * Gets existing material by name or creates a new one.
 * If material exists but has different category, updates the category.
 * @param name - Material name
 * @param category - Category name (will be ensured to exist)
 * @param notes - Optional notes
 * @param timestamp - ISO timestamp for created/updated fields
 * @returns Material ID (existing or newly created)
 */
async function getOrCreateMaterial(
  name: string,
  category: string,
  notes: string | undefined,
  timestamp: string
): Promise<string> {
  const normalized = normalizeText(name);
  const existing = await db.materials
    .filter((m) => normalizeText(m.name) === normalized)
    .first();

  if (existing) {
    // Sync category if it has changed
    if (existing.category !== category.trim()) {
      await db.materials.update(existing.id, {
        category: category.trim(),
        updatedAt: timestamp,
      });
    }
    return existing.id;
  }

  // Create new material
  const id = nanoid();
  await db.materials.add({
    id,
    name: name.trim(),
    category: category.trim(),
    notes: notes?.trim(),
    createdAt: timestamp,
  });

  return id;
}

// ============================================================================
// MATERIAL MUTATIONS
// ============================================================================

/**
 * Hook providing CRUD operations for base materials.
 * Materials are uniquely identified by name (case-insensitive).
 * @returns Object containing createMaterial, updateMaterial, and deleteMaterial functions
 */
export function useMaterialMutations() {
  /**
   * Creates a new material in the database.
   * Ensures the category exists before creating the material.
   * @param data - Material form data
   * @returns Promise resolving to the created material's ID
   */
  const createMaterial = useCallback(
    async (data: MaterialFormData): Promise<string> => {
      const now = new Date().toISOString();

      // Prevent duplicate materials
      const normalized = normalizeText(data.name);
      const duplicate = await db.materials
        .filter((m) => normalizeText(m.name) === normalized)
        .first();

      if (duplicate) {
        throw new Error("Material with this name already exists");
      }

      await ensureCategoryExists(data.category, now);

      const id = nanoid();
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

  /**
   * Updates an existing material's properties.
   * Validates name uniqueness if name is being changed.
   * @param id - Material ID to update
   * @param data - Partial material data to update
   */
  const updateMaterial = useCallback(
    async (id: string, data: Partial<MaterialFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // Check name uniqueness if being updated
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.materials
          .filter((m) => m.id !== id && normalizeText(m.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error("Material with this name already exists");
        }
      }

      if (data.category) {
        await ensureCategoryExists(data.category, now);
      }

      await db.materials.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.category && { category: data.category.trim() }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() }),
        updatedAt: now,
      });
    },
    []
  );

  /**
   * Deletes a material from the database.
   * @param id - Material ID to delete
   */
  const deleteMaterial = useCallback(async (id: string): Promise<void> => {
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

// ============================================================================
// SUPPLIER MATERIAL MUTATIONS
// ============================================================================

/**
 * Hook providing CRUD operations for supplier materials.
 * Handles complex material creation/linking and pricing calculations within transactions.
 * @returns Object containing createSupplierMaterial, updateSupplierMaterial, and deleteSupplierMaterial functions
 */
export function useSupplierMaterialMutations() {
  /**
   * Creates a new supplier material entry.
   * Automatically creates or links to existing material and category.
   * @param data - Supplier material form data
   * @returns Promise resolving to the created supplier material's ID
   */
  const createSupplierMaterial = useCallback(
    async (data: SupplierMaterialFormData): Promise<string> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.materials, db.supplierMaterials, db.categories],
        async () => {
          await ensureCategoryExists(data.materialCategory, now);

          // Link to existing material or create new one
          const materialId = data.materialId
            ? data.materialId
            : await getOrCreateMaterial(
                data.materialName,
                data.materialCategory,
                data.notes,
                now
              );

          // Sync category for existing materials
          if (data.materialId) {
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
          }

          const unitPrice = data.bulkPrice / (data.quantityForBulkPrice || 1);

          const id = nanoid();
          await db.supplierMaterials.add({
            id,
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

          return id;
        }
      );
    },
    []
  );

  /**
   * Updates an existing supplier material.
   * Handles material name/category changes and recalculates pricing.
   * @param id - Supplier material ID to update
   * @param data - Partial supplier material data to update
   */
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
          const current = await db.supplierMaterials.get(id);
          if (!current) {
            throw new Error("Supplier material not found");
          }

          const hasMaterialChanges = data.materialCategory || data.materialName;

          if (hasMaterialChanges) {
            const material = await db.materials.get(current.materialId);
            if (!material) {
              throw new Error("Material not found");
            }

            // Sync category
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

            // Update material name with duplicate check
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
                throw new Error("Material with this name already exists");
              }

              await db.materials.update(material.id, {
                name: data.materialName.trim(),
                updatedAt: now,
              });
            }
          }

          // Recalculate unit price if bulk pricing changed
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

          await db.supplierMaterials.update(id, {
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(unitPrice !== current.unitPrice && { unitPrice }),
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

  /**
   * Deletes a supplier material entry.
   * Does not delete the underlying material.
   * @param id - Supplier material ID to delete
   */
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

/**
 * Hook providing CRUD operations for material categories.
 * Categories are uniquely identified by name (case-insensitive).
 * @returns Object containing createCategory, updateCategory, and deleteCategory functions
 */
export function useCategoryMutations() {
  /**
   * Creates a new category in the database.
   * Auto-assigns color if not provided.
   * @param data - Category form data
   * @returns Promise resolving to the created category's ID
   */
  const createCategory = useCallback(
    async (data: CategoryFormData): Promise<string> => {
      const now = new Date().toISOString();

      // Prevent duplicate categories
      const normalized = normalizeText(data.name);
      const duplicate = await db.categories
        .filter((c) => normalizeText(c.name) === normalized)
        .first();

      if (duplicate) {
        throw new Error("Category with this name already exists");
      }

      const id = nanoid();
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

  /**
   * Updates an existing category's properties.
   * Validates name uniqueness if name is being changed.
   * @param id - Category ID to update
   * @param data - Partial category data to update
   */
  const updateCategory = useCallback(
    async (id: string, data: Partial<CategoryFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // Check name uniqueness if being updated
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.categories
          .filter((c) => c.id !== id && normalizeText(c.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error("Category with this name already exists");
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

  /**
   * Deletes a category from the database.
   * @param id - Category ID to delete
   */
  const deleteCategory = useCallback(async (id: string): Promise<void> => {
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

  return { createCategory, updateCategory, deleteCategory };
}

// ============================================================================
// COMBINED HOOK
// ============================================================================

/**
 * Convenience hook that combines all material-related mutations.
 * Use this when a component needs access to multiple mutation types.
 * @returns Object containing all material, supplier material, and category mutation functions
 */
export function useAllMaterialMutations() {
  const materialMutations = useMaterialMutations();
  const supplierMaterialMutations = useSupplierMaterialMutations();
  const categoryMutations = useCategoryMutations();

  return {
    ...materialMutations,
    ...supplierMaterialMutations,
    ...categoryMutations,
  };
}
