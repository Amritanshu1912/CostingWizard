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
 * Core data hook - fetches all base data and provides lookup maps
 * Internal use only - other hooks build on this
 */
export function useMaterialsBaseData(): MaterialsBaseData | undefined {
  return useLiveQuery(async () => {
    const [materials, supplierMaterials, categories] = await Promise.all([
      db.materials.toArray(),
      db.supplierMaterials.toArray(),
      db.categories.toArray(),
    ]);

    // Create lookup maps
    const materialMap = new Map(materials.map((m) => [m.id, m]));
    const supplierMaterialMap = new Map(
      supplierMaterials.map((sm) => [sm.id, sm])
    );
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    // Create indexes
    const supplierMaterialsByMaterial = new Map<string, SupplierMaterial[]>();
    const supplierMaterialsBySupplier = new Map<string, SupplierMaterial[]>();

    supplierMaterials.forEach((sm) => {
      const byMaterial = supplierMaterialsByMaterial.get(sm.materialId) || [];
      byMaterial.push(sm);
      supplierMaterialsByMaterial.set(sm.materialId, byMaterial);

      const bySupplier = supplierMaterialsBySupplier.get(sm.supplierId) || [];
      bySupplier.push(sm);
      supplierMaterialsBySupplier.set(sm.supplierId, bySupplier);
    });

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
 * Helper: Get category color by name
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
