// src/hooks/material-hooks/use-materials-data.ts
import { db } from "@/lib/db";
import type {
  Material,
  SupplierMaterial,
  Category,
  MaterialsBaseData,
} from "@/types/material-types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Fetches all base materials data and creates optimized lookup maps.
 * @returns {MaterialsBaseData | undefined} Base data with materials, suppliers, categories, and maps
 */
export function useMaterialsBaseData(): MaterialsBaseData | undefined {
  return useLiveQuery(async () => {
    // Fetch all data in parallel for performance
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

    // Create grouping indexes for efficient queries
    const supplierMaterialsByMaterial = new Map<string, SupplierMaterial[]>();
    const supplierMaterialsBySupplier = new Map<string, SupplierMaterial[]>();

    // Group supplier materials by material and supplier for quick lookups
    supplierMaterials.forEach((sm) => {
      const byMaterial = supplierMaterialsByMaterial.get(sm.materialId) || [];
      byMaterial.push(sm);
      supplierMaterialsByMaterial.set(sm.materialId, byMaterial);

      const bySupplier = supplierMaterialsBySupplier.get(sm.supplierId) || [];
      bySupplier.push(sm);
      supplierMaterialsBySupplier.set(sm.supplierId, bySupplier);
    });

    const materialsByCategory = new Map<string, Material[]>();
    // Group materials by category for categorization features
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
 * Gets the color for a category by name.
 * @param categoryName - The category name
 * @param categoryMap - Map of categories by ID
 * @returns The category color or default
 */
export function getCategoryColor(
  categoryName: string,
  categoryMap: Map<string, Category>
): string {
  const category = Array.from(categoryMap.values()).find(
    (c) => c.name === categoryName
  );
  return category?.color || "#6366f1";
}
