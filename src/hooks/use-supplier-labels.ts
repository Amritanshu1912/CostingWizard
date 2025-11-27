// hooks/use-supplier-labels.ts
import { db } from "@/lib/db";
import type { SupplierLabelWithDetails } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";

// Hook that automatically joins supplier labels with their labels and suppliers
export function useSupplierLabelsWithDetails() {
  const data = useLiveQuery(async () => {
    // Fetch all data in parallel for best performance
    const [supplierLabels, labels, suppliers] = await Promise.all([
      db.supplierLabels.toArray(),
      db.labels.toArray(),
      db.suppliers.toArray(),
    ]);

    // Create lookup maps for O(1) access
    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    // Join data in memory
    const enriched: SupplierLabelWithDetails[] = supplierLabels.map((sl) => {
      const label = sl.labelId ? labelMap.get(sl.labelId) : undefined;
      const supplier = supplierMap.get(sl.supplierId);

      return {
        ...sl,
        label,
        supplier,

        // Computed display fields (always accurate from source)
        displayName: label?.name || "Unknown Label",
        displayType: label?.type || "Unknown",
        displayPrintingType: label?.printingType || "Unknown",
        displayMaterial: label?.material || "Unknown",
        displayShape: label?.shape || "Unknown",
        priceWithTax: sl.unitPrice * (1 + (sl.tax || 0) / 100),
      };
    });

    return enriched;
  }, []);

  return data || [];
}

/**
 * Hook for a single supplier label with details
 */
export function useSupplierLabelWithDetailsById(id: string | undefined) {
  const data = useLiveQuery(async () => {
    if (!id) return null;

    const supplierLabel = await db.supplierLabels.get(id);
    if (!supplierLabel) return null;

    const [label, supplier] = await Promise.all([
      supplierLabel.labelId ? db.labels.get(supplierLabel.labelId) : null,
      db.suppliers.get(supplierLabel.supplierId),
    ]);

    return {
      ...supplierLabel,
      label,
      supplier,
      displayName: label?.name || "Unknown Label",
      displayType: label?.type || "Unknown",
      displayPrintingType: label?.printingType || "Unknown",
      displayMaterial: label?.material || "Unknown",
      displayShape: label?.shape || "Unknown",
      priceWithTax:
        supplierLabel.unitPrice * (1 + (supplierLabel.tax || 0) / 100),
    } as SupplierLabelWithDetails;
  }, [id]);

  return data;
}

/**
 * Hook for labels grouped by name for price comparison
 * Automatically calculates cheapest/most expensive options
 */
export function useLabelPriceComparison() {
  const data = useLiveQuery(async () => {
    const [supplierLabels, labels, suppliers] = await Promise.all([
      db.supplierLabels.toArray(),
      db.labels.toArray(),
      db.suppliers.toArray(),
    ]);

    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    // Group by label name
    const grouped = new Map<string, SupplierLabelWithDetails[]>();

    supplierLabels.forEach((sl) => {
      const label = sl.labelId ? labelMap.get(sl.labelId) : undefined;
      const supplier = supplierMap.get(sl.supplierId);

      const labelName = label?.name || "Unknown";

      const enriched: SupplierLabelWithDetails = {
        ...sl,
        label,
        supplier,
        displayName: labelName,
        displayType: label?.type || "Unknown",
        displayPrintingType: label?.printingType || "Unknown",
        displayMaterial: label?.material || "Unknown",
        displayShape: label?.shape || "Unknown",
        priceWithTax: sl.unitPrice * (1 + (sl.tax || 0) / 100),
      };

      const existing = grouped.get(labelName) || [];
      grouped.set(labelName, [...existing, enriched]);
    });

    // Convert to array and filter labels with multiple suppliers
    return Array.from(grouped.entries())
      .filter(([items]) => items.length >= 2)
      .map(([labelName, alternatives]) => {
        const sorted = alternatives.sort((a, b) => a.unitPrice - b.unitPrice);
        return {
          labelName,
          alternatives: sorted,
          cheapest: sorted[0],
          mostExpensive: sorted[sorted.length - 1],
          savings: sorted[sorted.length - 1].unitPrice - sorted[0].unitPrice,
        };
      });
  }, []);

  return data || [];
}
