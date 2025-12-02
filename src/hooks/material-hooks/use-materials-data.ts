/**
 * Core data hook - Single source of truth for materials data
 *
 * This hook fetches all base data in one optimized query and provides
 * lookup maps for O(1) access. All other hooks should derive from this.
 *
 * Benefits:
 * - Prevents query waterfalls
 * - Single reactive subscription
 * - Provides efficient lookup maps
 * - Type-safe access to all base data
 */

import { db } from "@/lib/db";
import type {
  Category,
  Material,
  SupplierMaterial,
} from "@/types/material-types";
import { useLiveQuery } from "dexie-react-hooks";
import { MATERIAL_CATEGORIES } from "@/lib/constants";

/**
 * Base data structure returned by core hook
 */
export interface MaterialsBaseData {
  // Raw arrays
  materials: Material[];
  supplierMaterials: SupplierMaterial[];
  categories: Category[];

  // Lookup maps for O(1) access
  materialMap: Map<string, Material>;
  supplierMaterialMap: Map<string, SupplierMaterial>;
  categoryMap: Map<string, Category>;

  // Indexed lookups
  supplierMaterialsByMaterial: Map<string, SupplierMaterial[]>;
  supplierMaterialsBySupplier: Map<string, SupplierMaterial[]>;
  materialsByCategory: Map<string, Material[]>;
}

/**
 * Fetch all materials-related data in a single optimized query
 * Returns raw data plus lookup maps for efficient access
 */
export function useMaterialsData(): MaterialsBaseData | undefined {
  return useLiveQuery(async () => {
    // Single parallel fetch - prevents waterfalls
    const [materials, supplierMaterials, categories] = await Promise.all([
      db.materials.toArray(),
      db.supplierMaterials.toArray(),
      db.categories.toArray(),
    ]);

    // Create lookup maps for O(1) access
    const materialMap = new Map(materials.map((m) => [m.id, m]));
    const supplierMaterialMap = new Map(
      supplierMaterials.map((sm) => [sm.id, sm])
    );
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    // Create indexed lookups for common queries
    const supplierMaterialsByMaterial = new Map<string, SupplierMaterial[]>();
    const supplierMaterialsBySupplier = new Map<string, SupplierMaterial[]>();

    supplierMaterials.forEach((sm) => {
      // Index by material
      const byMaterial = supplierMaterialsByMaterial.get(sm.materialId) || [];
      byMaterial.push(sm);
      supplierMaterialsByMaterial.set(sm.materialId, byMaterial);

      // Index by supplier
      const bySupplier = supplierMaterialsBySupplier.get(sm.supplierId) || [];
      bySupplier.push(sm);
      supplierMaterialsBySupplier.set(sm.supplierId, bySupplier);
    });

    // Index materials by category
    const materialsByCategory = new Map<string, Material[]>();
    materials.forEach((m) => {
      const byCategory = materialsByCategory.get(m.category) || [];
      byCategory.push(m);
      materialsByCategory.set(m.category, byCategory);
    });

    return {
      materials,
      supplierMaterials,
      categories,
      materialMap,
      supplierMaterialMap,
      categoryMap,
      supplierMaterialsByMaterial,
      supplierMaterialsBySupplier,
      materialsByCategory,
    };
  }, []);
}

/**
 * Get category by name with color
 * Returns category info or creates default
 */
export function getCategoryInfo(
  categoryName: string,
  categoryMap: Map<string, Category>
): { name: string; color: string; description?: string } {
  // Try to find by name in database first
  const category = Array.from(categoryMap.values()).find(
    (c) => c.name === categoryName
  );

  if (category) {
    return {
      name: category.name,
      color: category.color || "#6366f1",
      description: category.description,
    };
  }

  // Fall back to MATERIAL_CATEGORIES constant
  const constantCategory = MATERIAL_CATEGORIES.find(
    (c) => c.name === categoryName
  );

  if (constantCategory) {
    return {
      name: constantCategory.name,
      color: constantCategory.color || "#6366f1",
      description: constantCategory.description || undefined,
    };
  }

  // Return default if not found anywhere
  return {
    name: categoryName,
    color: "#6366f1", // Default indigo color
  };
}
