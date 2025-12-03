/**
 * Core data hook - Single source of truth for labels data
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
import type { Label, SupplierLabel } from "@/types/label-types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Base data structure returned by core hook
 */
export interface LabelsBaseData {
  // Raw arrays
  labels: Label[];
  supplierLabels: SupplierLabel[];

  // Lookup maps for O(1) access
  labelMap: Map<string, Label>;
  supplierLabelMap: Map<string, SupplierLabel>;

  // Indexed lookups
  supplierLabelsByLabel: Map<string, SupplierLabel[]>;
  supplierLabelsBySupplier: Map<string, SupplierLabel[]>;
  labelsByType: Map<string, Label[]>;
}

/**
 * Fetch all labels-related data in a single optimized query
 * Returns raw data plus lookup maps for efficient access
 */
export function useLabelsData(): LabelsBaseData | undefined {
  return useLiveQuery(async () => {
    // Single parallel fetch - prevents waterfalls
    const [labels, supplierLabels] = await Promise.all([
      db.labels.toArray(),
      db.supplierLabels.toArray(),
    ]);

    // Create lookup maps for O(1) access
    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const supplierLabelMap = new Map(supplierLabels.map((sl) => [sl.id, sl]));

    // Create indexed lookups for common queries
    const supplierLabelsByLabel = new Map<string, SupplierLabel[]>();
    const supplierLabelsBySupplier = new Map<string, SupplierLabel[]>();

    supplierLabels.forEach((sl) => {
      // Index by label
      const byLabel = supplierLabelsByLabel.get(sl.labelId || "") || [];
      byLabel.push(sl);
      supplierLabelsByLabel.set(sl.labelId || "", byLabel);

      // Index by supplier
      const bySupplier = supplierLabelsBySupplier.get(sl.supplierId) || [];
      bySupplier.push(sl);
      supplierLabelsBySupplier.set(sl.supplierId, bySupplier);
    });

    // Index labels by type
    const labelsByType = new Map<string, Label[]>();
    labels.forEach((l) => {
      const byType = labelsByType.get(l.type) || [];
      byType.push(l);
      labelsByType.set(l.type, byType);
    });

    return {
      labels,
      supplierLabels,
      labelMap,
      supplierLabelMap,
      supplierLabelsByLabel,
      supplierLabelsBySupplier,
      labelsByType,
    };
  }, []);
}
