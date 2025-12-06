// src/hooks/label-hooks/use-labels-data.ts

import { db } from "@/lib/db";
import type { Label, SupplierLabel, LabelsBaseData } from "@/types/label-types";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Hook that provides the foundational data for labels functionality.
 *
 * Fetches all labels and supplier labels from the database and creates
 * multiple lookup maps for efficient data access throughout the app.
 * This hook serves as the single source of truth for label-related data.
 *
 * @returns {LabelsBaseData | undefined} Object containing all labels data with lookup maps, or undefined while loading
 */
export function useLabelsBaseData(): LabelsBaseData | undefined {
  return useLiveQuery(async () => {
    // Fetch all labels and supplier labels in parallel for optimal performance
    const [labels, supplierLabels] = await Promise.all([
      db.labels.toArray(),
      db.supplierLabels.toArray(),
    ]);

    // Create efficient lookup maps for O(1) access by ID
    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const supplierLabelMap = new Map(supplierLabels.map((sl) => [sl.id, sl]));

    // Initialize maps for grouping supplier labels by different criteria
    const supplierLabelsByLabel = new Map<string, SupplierLabel[]>();
    const supplierLabelsBySupplier = new Map<string, SupplierLabel[]>();

    // Build index of supplier labels grouped by label ID
    supplierLabels.forEach((sl) => {
      const labelKey = sl.labelId || "";

      const byLabel = supplierLabelsByLabel.get(labelKey) || [];
      byLabel.push(sl);
      supplierLabelsByLabel.set(labelKey, byLabel);

      // Also group by supplier ID for reverse lookups
      const bySupplier = supplierLabelsBySupplier.get(sl.supplierId) || [];
      bySupplier.push(sl);
      supplierLabelsBySupplier.set(sl.supplierId, bySupplier);
    });

    // Create categorization map for labels by type
    const labelsByType = new Map<string, Label[]>();
    labels.forEach((l) => {
      const byType = labelsByType.get(l.type) || [];
      byType.push(l);
      labelsByType.set(l.type, byType);
    });

    // Return comprehensive data structure with multiple access patterns
    return {
      labels, // Raw labels array
      supplierLabels, // Raw supplier labels array
      labelMap, // O(1) label lookup by ID
      supplierLabelMap, // O(1) supplier label lookup by ID
      supplierLabelsByLabel, // Labels grouped by their associated label
      supplierLabelsBySupplier, // Labels grouped by supplier
      labelsByType, // Labels grouped by type for categorization
    };
  }, []);
}
