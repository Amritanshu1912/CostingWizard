// hooks/use-supplier-materials.ts
import { db } from "@/lib/db";
import type {
  Material,
  Supplier,
  SupplierMaterialWithDetails,
} from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Returns all supplier materials enriched with their material and supplier details.
 * This fetches supplierMaterials + materials + suppliers in parallel once and returns
 * an array of enriched objects. The hook is reactive via useLiveQuery.
 */
export function useSupplierMaterialsWithDetails(): SupplierMaterialWithDetails[] {
  const data = useLiveQuery(async () => {
    const [supplierMaterials, materials, suppliers] = await Promise.all([
      db.supplierMaterials.toArray(),
      db.materials.toArray(),
      db.suppliers.toArray(),
    ]);

    // Build lookup maps for O(1) lookups
    const materialById = new Map<string, Material>(
      materials.map((m) => [m.id, m])
    );
    const supplierById = new Map<string, Supplier>(
      suppliers.map((s) => [s.id, s])
    );

    // Join and enrich
    const enriched: SupplierMaterialWithDetails[] = supplierMaterials.map(
      (sm) => {
        const material = materialById.get(sm.materialId);
        const supplier = supplierById.get(sm.supplierId);

        // compute unitPrice fallback if not provided
        const unitPrice =
          sm.unitPrice ||
          (sm.bulkPrice || 0) / (sm.quantityForBulkPrice || 1) ||
          0;

        return {
          ...sm,
          unitPrice,
          material,
          supplier,
          displayName: material ? material.name : `Material ${sm.materialId}`,
          displayCategory: material ? material.category : "Uncategorized",
          displayUnit: sm.unit ?? "kg",
          priceWithTax: unitPrice * (1 + (sm.tax ?? 0) / 100),
        };
      }
    );

    return enriched;
  }, []);

  return data ?? [];
}

/**
 * Single supplier material by id (enriched). Returns null if not found or id falsy.
 */
export function useSupplierMaterialWithDetails(id?: string | null) {
  const data = useLiveQuery(async () => {
    if (!id) return null;

    const sm = await db.supplierMaterials.get(id);
    if (!sm) return null;

    const [material, supplier] = await Promise.all([
      db.materials.get(sm.materialId),
      db.suppliers.get(sm.supplierId),
    ]);

    const unitPrice =
      sm.unitPrice || (sm.bulkPrice || 0) / (sm.quantityForBulkPrice || 1) || 0;

    const enriched: SupplierMaterialWithDetails = {
      ...sm,
      unitPrice,
      material,
      supplier,
      displayName: material ? material.name : `Material ${sm.materialId}`,
      displayCategory: material ? material.category : "Uncategorized",
      displayUnit: sm.unit ?? "kg",
      priceWithTax: unitPrice * (1 + (sm.tax ?? 0) / 100),
    };

    return enriched;
  }, [id]);

  return data ?? null;
}

/**
 * Material price comparison grouped by material name.
 * Returns array of groups with alternatives sorted by price (cheapest first).
 */
export function useMaterialPriceComparison() {
  const data = useLiveQuery(async () => {
    const [supplierMaterials, materials, suppliers] = await Promise.all([
      db.supplierMaterials.toArray(),
      db.materials.toArray(),
      db.suppliers.toArray(),
    ]);

    const materialById = new Map(materials.map((m) => [m.id, m]));
    const supplierById = new Map(suppliers.map((s) => [s.id, s]));

    const grouped = new Map<string, SupplierMaterialWithDetails[]>();

    for (const sm of supplierMaterials) {
      const material = materialById.get(sm.materialId);
      if (!material) continue; // ignore orphan supplierMaterials

      const supplier = supplierById.get(sm.supplierId);
      const unitPrice =
        sm.unitPrice ||
        (sm.bulkPrice || 0) / (sm.quantityForBulkPrice || 1) ||
        0;

      const enriched: SupplierMaterialWithDetails = {
        ...sm,
        unitPrice,
        material,
        supplier,
        displayName: material.name,
        displayCategory: material.category,
        displayUnit: sm.unit ?? "kg",
        priceWithTax: unitPrice * (1 + (sm.tax ?? 0) / 100),
      };

      const list = grouped.get(material.name) ?? [];
      list.push(enriched);
      grouped.set(material.name, list);
    }

    // Build result groups for materials with at least 2 suppliers
    const groups = Array.from(grouped.entries())
      .filter(([arr]) => arr.length >= 2)
      .map(([materialName, arr]) => {
        const sorted = arr.sort((a, b) => a.unitPrice - b.unitPrice);
        return {
          materialName,
          alternatives: sorted,
          cheapest: sorted[0],
          mostExpensive: sorted[sorted.length - 1],
          savings: sorted[sorted.length - 1].unitPrice - sorted[0].unitPrice,
        };
      });

    return groups;
  }, []);

  return data ?? [];
}
