// src/hooks/use-suppliers.ts
import { db } from "@/lib/db";
import type { Supplier } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

/**
 * Hook that returns all suppliers with enriched data
 * Uses Dexie's reactive queries for real-time updates
 */
export function useSuppliers(): Supplier[] {
  const suppliersData = useLiveQuery(() => db.suppliers.toArray(), []);
  return suppliersData || [];
}

/**
 * Hook that returns active suppliers (not soft-deleted)
 */
export function useActiveSuppliers(): Supplier[] {
  const suppliers = useSuppliers();
  return useMemo(
    () => suppliers.filter((s) => s.isActive !== false),
    [suppliers]
  );
}

/**
 * Hook that computes items count by supplier
 * Returns a map of supplierId -> number of available items
 */
export function useItemsBySupplier(): Record<string, number> {
  const suppliers = useSuppliers();

  // Use Dexie hooks for related data
  const supplierMaterials = useLiveQuery(
    () => db.supplierMaterials.toArray(),
    []
  );
  const supplierPackaging = useLiveQuery(
    () => db.supplierPackaging.toArray(),
    []
  );
  const supplierLabels = useLiveQuery(() => db.supplierLabels.toArray(), []);

  return useMemo(() => {
    const materialsBySupplier = (supplierMaterials || []).reduce<
      Record<string, number>
    >((acc, material) => {
      if (material.availability !== "out-of-stock") {
        acc[material.supplierId] = (acc[material.supplierId] || 0) + 1;
      }
      return acc;
    }, {});

    const packagingBySupplier = (supplierPackaging || []).reduce<
      Record<string, number>
    >((acc, packaging) => {
      if (packaging.availability !== "out-of-stock") {
        acc[packaging.supplierId] = (acc[packaging.supplierId] || 0) + 1;
      }
      return acc;
    }, {});

    const labelsBySupplier = (supplierLabels || []).reduce<
      Record<string, number>
    >((acc, label) => {
      if (label.availability !== "out-of-stock") {
        acc[label.supplierId] = (acc[label.supplierId] || 0) + 1;
      }
      return acc;
    }, {});

    // Combine all items
    const allItemsBySupplier: Record<string, number> = {};
    suppliers.forEach((supplier) => {
      const materialsCount = materialsBySupplier[supplier.id] || 0;
      const packagingCount = packagingBySupplier[supplier.id] || 0;
      const labelsCount = labelsBySupplier[supplier.id] || 0;
      allItemsBySupplier[supplier.id] =
        materialsCount + packagingCount + labelsCount;
    });

    return allItemsBySupplier;
  }, [suppliers, supplierMaterials, supplierPackaging, supplierLabels]);
}
