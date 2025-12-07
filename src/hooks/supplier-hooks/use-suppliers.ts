// src/hooks/supplier-hooks/use-suppliers.ts

import { db } from "@/lib/db";
import type { Supplier } from "@/types/supplier-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

/**
 * Fetches all suppliers from the database.
 * Automatically re-renders when supplier data changes.
 *
 * @returns Array of all suppliers (including inactive)
 */
export function useSuppliers(): Supplier[] {
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  return suppliers || [];
}

/**
 * Fetches only active suppliers (not soft-deleted).
 *
 * @returns Array of active suppliers
 */
export function useActiveSuppliers(): Supplier[] {
  const suppliers = useSuppliers();

  return useMemo(() => suppliers.filter((s) => s.isActive), [suppliers]);
}

/**
 * Computes total item count (materials + packaging + labels) per supplier.
 *
 * @returns Object mapping supplier IDs to their total item count
 */
export function useItemsBySupplier(): Record<string, number> {
  const suppliers = useSuppliers();

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
    if (!supplierMaterials || !supplierPackaging || !supplierLabels) {
      return {};
    }

    const itemCounts: Record<string, number> = {};

    // Initialize counts for all suppliers
    suppliers.forEach((supplier) => {
      itemCounts[supplier.id] = 0;
    });

    // Count materials per supplier
    supplierMaterials.forEach((material) => {
      itemCounts[material.supplierId] =
        (itemCounts[material.supplierId] || 0) + 1;
    });

    // Count packaging per supplier
    supplierPackaging.forEach((packaging) => {
      itemCounts[packaging.supplierId] =
        (itemCounts[packaging.supplierId] || 0) + 1;
    });

    // Count labels per supplier
    supplierLabels.forEach((label) => {
      itemCounts[label.supplierId] = (itemCounts[label.supplierId] || 0) + 1;
    });

    return itemCounts;
  }, [suppliers, supplierMaterials, supplierPackaging, supplierLabels]);
}
