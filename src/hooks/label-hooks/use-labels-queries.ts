// src/hooks/label-hooks/use-labels-queries.ts

import { db } from "@/lib/db";
import type {
  LabelFilters,
  LabelPriceComparison,
  LabelsAnalytics,
  LabelWithSupplierCount,
  LabelWithSuppliers,
  SupplierLabelForComparison,
  SupplierLabelTableRow,
} from "@/types/label-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useLabelsBaseData } from "./use-labels-data";

// Hooks for querying label data in various formats for different UI components

/**
 * Hook that returns labels with basic supplier information.
 * Useful for dropdowns and lists where you need to show which suppliers offer each label.
 *
 * @returns {LabelWithSupplierCount[]} Array of labels with supplier count and basic supplier details
 */
export function useLabelsWithSupplierCount(): LabelWithSupplierCount[] {
  const baseData = useLabelsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!baseData || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return baseData.labels.map((label) => {
      const supplierLabels = baseData.supplierLabelsByLabel.get(label.id) || [];
      const supplierCount = new Set(supplierLabels.map((sl) => sl.supplierId))
        .size;

      // Build suppliers array with details
      const suppliers = supplierLabels
        .map((sl) => {
          const supplier = supplierMap.get(sl.supplierId);
          return supplier
            ? { id: supplier.id, name: supplier.name, rating: supplier.rating }
            : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string; rating: number }>;

      return {
        id: label.id,
        name: label.name,
        type: label.type,
        printingType: label.printingType,
        material: label.material,
        shape: label.shape,
        supplierCount,
        suppliers,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
      };
    });
  }, [baseData, suppliers]);
}

/**
 * Hook that returns labels with full supplier list for management interfaces.
 * Used in label management drawers where detailed supplier information is needed.
 *
 * @returns {LabelWithSuppliers[]} Array of labels with complete supplier details and metadata
 */
export function useLabelsWithSuppliers(): LabelWithSuppliers[] {
  const baseData = useLabelsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!baseData || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return baseData.labels.map((label) => {
      const supplierLabels = baseData.supplierLabelsByLabel.get(label.id) || [];

      const uniqueSupplierIds = new Set(
        supplierLabels.map((sl) => sl.supplierId)
      );
      const suppliersList = Array.from(uniqueSupplierIds)
        .map((supplierId) => {
          const supplier = supplierMap.get(supplierId);
          return supplier
            ? {
                id: supplier.id,
                name: supplier.name,
                rating: supplier.rating,
                isActive: supplier.isActive,
              }
            : null;
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);

      return {
        id: label.id,
        name: label.name,
        type: label.type,
        printingType: label.printingType,
        material: label.material,
        shape: label.shape,
        size: label.size,
        notes: label.notes,
        supplierCount: suppliersList.length,
        suppliers: suppliersList,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
      };
    });
  }, [baseData, suppliers]);
}

// Hooks for querying supplier label data with filtering and formatting for UI components

/**
 * Main hook for displaying supplier labels in table format.
 * Combines label, supplier, and inventory data with optional filtering capabilities.
 *
 * @param {LabelFilters} [filters] - Optional filters to apply to the results
 * @returns {SupplierLabelTableRow[]} Array of supplier label rows formatted for table display
 */
export function useSupplierLabelTableRows(
  filters?: LabelFilters
): SupplierLabelTableRow[] {
  const baseData = useLabelsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () => db.inventoryItems.where("itemType").equals("supplierLabel").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !suppliers || !inventory) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    let rows = baseData.supplierLabels.map((sl) => {
      const label = sl.labelId ? baseData.labelMap.get(sl.labelId) : undefined;
      const supplier = supplierMap.get(sl.supplierId);
      const inventoryItem = inventoryMap.get(sl.id);
      const priceWithTax = sl.unitPrice * (1 + sl.tax / 100);

      return {
        id: sl.id,
        labelId: sl.labelId || "",
        supplierId: sl.supplierId,
        labelName: label?.name || "Unknown",
        labelType: label?.type || "other",
        printingType: label?.printingType || "bw",
        material: label?.material || "paper",
        shape: label?.shape || "rectangular",
        supplierName: supplier?.name || "Unknown",
        supplierRating: supplier?.rating || 0,
        unitPrice: sl.unitPrice,
        priceWithTax,
        bulkPrice: sl.bulkPrice,
        quantityForBulkPrice: sl.quantityForBulkPrice,
        tax: sl.tax,
        unit: sl.unit,
        moq: sl.moq || 0,
        leadTime: sl.leadTime,
        currentStock: inventoryItem?.currentStock || 0,
        stockStatus: inventoryItem?.status || "Unknown",
        transportationCost: sl.transportationCost,
        size: label?.size,
        notes: sl.notes,
        createdAt: sl.createdAt,
        updatedAt: sl.updatedAt,
      };
    });

    // Apply filters
    if (filters) {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.labelName.toLowerCase().includes(search) ||
            r.supplierName.toLowerCase().includes(search)
        );
      }
      if (filters.type) {
        rows = rows.filter((r) => r.labelType === filters.type);
      }
      if (filters.printingType) {
        rows = rows.filter((r) => r.printingType === filters.printingType);
      }
      if (filters.material) {
        rows = rows.filter((r) => r.material === filters.material);
      }
      if (filters.supplierId) {
        rows = rows.filter((r) => r.supplierId === filters.supplierId);
      }
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          rows = rows.filter((r) => r.unitPrice >= filters.priceRange!.min!);
        }
        if (filters.priceRange.max) {
          rows = rows.filter((r) => r.unitPrice <= filters.priceRange!.max!);
        }
      }
    }

    return rows;
  }, [baseData, suppliers, inventory, filters]);
}

/**
 * Hook that returns supplier labels filtered by a specific supplier ID.
 * Useful for supplier-specific views and filtering.
 *
 * @param {string | undefined} supplierId - The supplier ID to filter by, or undefined to return empty array
 * @returns {SupplierLabelTableRow[]} Array of supplier label rows for the specified supplier
 */
export function useSupplierLabelsBySupplier(
  supplierId: string | undefined
): SupplierLabelTableRow[] {
  const allRows = useSupplierLabelTableRows();
  return useMemo(() => {
    if (!supplierId) return [];
    return allRows.filter((row) => row.supplierId === supplierId);
  }, [allRows, supplierId]);
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Hook that provides price comparison data for labels with multiple suppliers.
 * Shows potential savings by comparing prices across different suppliers for the same label.
 * Only includes labels that have 2 or more suppliers for meaningful comparison.
 *
 * @returns {LabelPriceComparison[]} Array of price comparison data sorted by potential savings
 */
export function useLabelPriceComparison(): LabelPriceComparison[] {
  const baseData = useLabelsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () => db.inventoryItems.where("itemType").equals("supplierLabel").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !suppliers || !inventory) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Group supplier labels by label
    const byLabel = new Map<string, SupplierLabelForComparison[]>();

    baseData.supplierLabels.forEach((sl) => {
      const label = sl.labelId ? baseData.labelMap.get(sl.labelId) : undefined;
      const supplier = supplierMap.get(sl.supplierId);
      if (!label || !supplier) return;

      const inventoryItem = inventoryMap.get(sl.id);
      const priceWithTax = sl.unitPrice * (1 + sl.tax / 100);

      const comparison: SupplierLabelForComparison = {
        id: sl.id,
        supplierId: sl.supplierId,
        supplierName: supplier.name,
        supplierRating: supplier.rating,
        unitPrice: sl.unitPrice,
        priceWithTax,
        unit: sl.unit,
        moq: sl.moq || 0,
        leadTime: sl.leadTime,
        currentStock: inventoryItem?.currentStock || 0,
      };

      const existing = byLabel.get(label.name) || [];
      existing.push(comparison);
      byLabel.set(label.name, existing);
    });

    // Only include labels with 2+ suppliers
    return Array.from(byLabel.entries())
      .filter(([, alternatives]) => alternatives.length >= 2)
      .map(([labelName, alternatives]) => {
        const sorted = [...alternatives].sort(
          (a, b) => a.unitPrice - b.unitPrice
        );
        const cheapest = sorted[0];
        const mostExpensive = sorted[sorted.length - 1];
        const savings = mostExpensive.unitPrice - cheapest.unitPrice;
        const averagePrice =
          alternatives.reduce((sum, a) => sum + a.unitPrice, 0) /
          alternatives.length;

        const label = baseData.labels.find((l) => l.name === labelName)!;

        return {
          labelId: label.id,
          labelName,
          labelType: label.type,
          printingType: label.printingType,
          alternatives: sorted,
          cheapest,
          mostExpensive,
          savings,
          savingsPercentage: (savings / mostExpensive.unitPrice) * 100,
          averagePrice,
        };
      })
      .sort((a, b) => b.savings - a.savings);
  }, [baseData, suppliers, inventory]);
}

/**
 * Hook that provides comprehensive analytics data for labels.
 * Calculates statistics including pricing, distribution by type/material, and stock alerts.
 * Used for dashboard widgets and reporting features.
 *
 * @returns {LabelsAnalytics} Analytics object with pricing stats, distributions, and alerts
 */
export function useLabelsAnalytics(): LabelsAnalytics {
  const baseData = useLabelsBaseData();
  const inventory = useLiveQuery(
    () => db.inventoryItems.where("itemType").equals("supplierLabel").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !inventory) {
      return {
        totalLabels: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        typeDistribution: [],
        printingTypeDistribution: [],
        priceRanges: [],
      };
    }

    const totalLabels = baseData.supplierLabels.length;
    if (totalLabels === 0) {
      return {
        totalLabels: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        typeDistribution: [],
        printingTypeDistribution: [],
        priceRanges: [],
      };
    }

    const avgPrice =
      baseData.supplierLabels.reduce((sum, sl) => sum + sl.unitPrice, 0) /
      totalLabels;
    const avgTax =
      baseData.supplierLabels.reduce((sum, sl) => sum + sl.tax, 0) /
      totalLabels;
    const highestPrice = Math.max(
      ...baseData.supplierLabels.map((sl) => sl.unitPrice)
    );

    const stockAlerts = inventory.filter(
      (item) => item.status === "low-stock" || item.status === "out-of-stock"
    ).length;

    // Type distribution
    const typeStats = new Map<string, { count: number; totalPrice: number }>();
    baseData.supplierLabels.forEach((sl) => {
      const label = sl.labelId ? baseData.labelMap.get(sl.labelId) : undefined;
      if (!label) return;

      const stats = typeStats.get(label.type) || { count: 0, totalPrice: 0 };
      stats.count++;
      stats.totalPrice += sl.unitPrice;
      typeStats.set(label.type, stats);
    });

    const typeDistribution = Array.from(typeStats.entries())
      .map(([type, stats]) => ({
        type: type as any,
        count: stats.count,
        percentage: (stats.count / totalLabels) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Printing type distribution
    const printingTypeStats = new Map<
      string,
      { count: number; totalPrice: number }
    >();
    baseData.supplierLabels.forEach((sl) => {
      const label = sl.labelId ? baseData.labelMap.get(sl.labelId) : undefined;
      if (!label) return;

      const stats = printingTypeStats.get(label.printingType) || {
        count: 0,
        totalPrice: 0,
      };
      stats.count++;
      stats.totalPrice += sl.unitPrice;
      printingTypeStats.set(label.printingType, stats);
    });

    const printingTypeDistribution = Array.from(printingTypeStats.entries())
      .map(([printingType, stats]) => ({
        printingType: printingType as any,
        count: stats.count,
        percentage: (stats.count / totalLabels) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Price ranges
    const priceRanges = [
      { range: "₹0-10", count: 0 },
      { range: "₹10-25", count: 0 },
      { range: "₹25-50", count: 0 },
      { range: "₹50+", count: 0 },
    ];

    baseData.supplierLabels.forEach((sl) => {
      if (sl.unitPrice < 10) priceRanges[0].count++;
      else if (sl.unitPrice < 25) priceRanges[1].count++;
      else if (sl.unitPrice < 50) priceRanges[2].count++;
      else priceRanges[3].count++;
    });

    const priceRangesWithPercentage = priceRanges.map((range) => ({
      ...range,
      percentage: (range.count / totalLabels) * 100,
    }));

    return {
      totalLabels,
      avgPrice,
      avgTax,
      highestPrice,
      stockAlerts,
      typeDistribution,
      printingTypeDistribution,
      priceRanges: priceRangesWithPercentage,
    };
  }, [baseData, inventory]);
}
