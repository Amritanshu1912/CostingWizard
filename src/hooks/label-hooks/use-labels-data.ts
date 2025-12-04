import { db } from "@/lib/db";
import type { Label, SupplierLabel, LabelsBaseData } from "@/types/label-types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Core data hook - fetches all base data and provides lookup maps
 * Internal use only - other hooks build on this
 */
export function useLabelsBaseData(): LabelsBaseData | undefined {
  return useLiveQuery(async () => {
    const [labels, supplierLabels] = await Promise.all([
      db.labels.toArray(),
      db.supplierLabels.toArray(),
    ]);

    // Create lookup maps
    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const supplierLabelMap = new Map(supplierLabels.map((sl) => [sl.id, sl]));

    // Create indexes
    const supplierLabelsByLabel = new Map<string, SupplierLabel[]>();
    const supplierLabelsBySupplier = new Map<string, SupplierLabel[]>();

    supplierLabels.forEach((sl) => {
      const byLabel = supplierLabelsByLabel.get(sl.labelId || "") || [];
      byLabel.push(sl);
      supplierLabelsByLabel.set(sl.labelId || "", byLabel);

      const bySupplier = supplierLabelsBySupplier.get(sl.supplierId) || [];
      bySupplier.push(sl);
      supplierLabelsBySupplier.set(sl.supplierId, bySupplier);
    });

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
