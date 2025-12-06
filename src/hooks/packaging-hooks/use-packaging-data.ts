// src/hooks/packaging-hooks/use-packaging-data.ts
import { db } from "@/lib/db";
import type {
  Packaging,
  SupplierPackaging,
  PackagingBaseData,
} from "@/types/packaging-types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Fetches all base packaging data and creates optimized lookup maps.
 * @returns {PackagingBaseData | undefined} Base data with packagings, suppliers, and maps
 */
export function usePackagingBaseData(): PackagingBaseData | undefined {
  return useLiveQuery(async () => {
    // Fetch data in parallel for performance
    const [packagings, supplierPackagings] = await Promise.all([
      db.packaging.toArray(),
      db.supplierPackaging.toArray(),
    ]);

    // Create lookup maps for O(1) access
    const packagingMap = new Map(packagings.map((p: Packaging) => [p.id, p]));
    const supplierPackagingMap = new Map(
      supplierPackagings.map((sp: SupplierPackaging) => [sp.id, sp])
    );

    // Group supplier packagings by their associated packaging ID for quick filtering
    const supplierPackagingsByPackaging = new Map<
      string,
      SupplierPackaging[]
    >();
    // Group supplier packagings by supplier ID to find all packagings from a supplier
    const supplierPackagingsBySupplier = new Map<string, SupplierPackaging[]>();

    supplierPackagings.forEach((sp) => {
      const byPackaging =
        supplierPackagingsByPackaging.get(sp.packagingId) || [];
      byPackaging.push(sp);
      supplierPackagingsByPackaging.set(sp.packagingId, byPackaging);

      // Add to supplier-based grouping
      const bySupplier = supplierPackagingsBySupplier.get(sp.supplierId) || [];
      bySupplier.push(sp);
      supplierPackagingsBySupplier.set(sp.supplierId, bySupplier);
    });

    // Group packagings by type for categorization
    const packagingsByType = new Map<string, Packaging[]>();
    packagings.forEach((p) => {
      const byType = packagingsByType.get(p.type) || [];
      byType.push(p);
      packagingsByType.set(p.type, byType);
    });

    // Group packagings by build material
    const packagingsByMaterial = new Map<string, Packaging[]>();
    packagings.forEach((p) => {
      if (p.buildMaterial) {
        const byMaterial = packagingsByMaterial.get(p.buildMaterial) || [];
        byMaterial.push(p);
        packagingsByMaterial.set(p.buildMaterial, byMaterial);
      }
    });

    return {
      packagings,
      supplierPackagings,
      packagingMap,
      supplierPackagingMap,
      supplierPackagingsByPackaging,
      supplierPackagingsBySupplier,
      packagingsByType,
      packagingsByMaterial,
    };
  }, []);
}
