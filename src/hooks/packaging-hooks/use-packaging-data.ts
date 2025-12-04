// src/hooks/packaging-hooks/use-packaging-data.ts
import { db } from "@/lib/db";
import type {
  Packaging,
  SupplierPackaging,
  PackagingBaseData,
} from "@/types/packaging-types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Core data hook - fetches all base data and provides lookup maps
 * Internal use only - other hooks build on this
 */
export function usePackagingBaseData(): PackagingBaseData | undefined {
  return useLiveQuery(async () => {
    const [packagings, supplierPackagings] = await Promise.all([
      db.packaging.toArray(),
      db.supplierPackaging.toArray(),
    ]);

    // Create lookup maps
    const packagingMap = new Map(packagings.map((p: Packaging) => [p.id, p]));
    const supplierPackagingMap = new Map(
      supplierPackagings.map((sp: SupplierPackaging) => [sp.id, sp])
    );

    // Create indexes
    const supplierPackagingsByPackaging = new Map<
      string,
      SupplierPackaging[]
    >();
    const supplierPackagingsBySupplier = new Map<string, SupplierPackaging[]>();

    supplierPackagings.forEach((sp) => {
      const byPackaging =
        supplierPackagingsByPackaging.get(sp.packagingId) || [];
      byPackaging.push(sp);
      supplierPackagingsByPackaging.set(sp.packagingId, byPackaging);

      const bySupplier = supplierPackagingsBySupplier.get(sp.supplierId) || [];
      bySupplier.push(sp);
      supplierPackagingsBySupplier.set(sp.supplierId, bySupplier);
    });

    const packagingsByType = new Map<string, Packaging[]>();
    packagings.forEach((p) => {
      const byType = packagingsByType.get(p.type) || [];
      byType.push(p);
      packagingsByType.set(p.type, byType);
    });

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
