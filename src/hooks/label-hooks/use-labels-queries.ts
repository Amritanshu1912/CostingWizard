// src/hooks/label-hooks/use-labels-queries.ts

import { db } from "@/lib/db";
import type {
  LabelDetails,
  LabelFilters,
  LabelsAnalytics,
  LabelPriceComparison,
  LabelWithSuppliers,
  SupplierLabelCard,
  SupplierLabelRow,
} from "@/types/label-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useLabelsData } from "./use-labels-data";

// ============================================================================
// LABEL QUERIES
// ============================================================================

/**
 * Get lightweight label list for tables/dropdowns
 * Returns only essential fields to minimize memory usage
 */
export function useLabelsList() {
  const data = useLabelsData();

  return useMemo(() => {
    if (!data) return [];

    return data.labels.map((label) => {
      const supplierLabels = data.supplierLabelsByLabel.get(label.id) || [];
      const uniqueSuppliers = new Set(
        supplierLabels.map((sl) => sl.supplierId)
      );

      return {
        id: label.id,
        name: label.name,
        type: label.type,
        printingType: label.printingType,
        material: label.material,
        shape: label.shape,
        supplierCount: uniqueSuppliers.size,
        updatedAt: label.updatedAt,
      };
    });
  }, [data]);
}

/**
 * Get single label with full details
 */
export function useLabelDetails(
  labelId: string | undefined
): LabelDetails | null {
  const data = useLabelsData();

  // Also fetch suppliers and inventory data
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () => db.inventoryItems.where("itemType").equals("supplierLabel").toArray(),
    []
  );

  return useMemo(() => {
    if (!data || !labelId || !suppliers || !inventory) return null;

    const label = data.labelMap.get(labelId);
    if (!label) return null;

    const supplierLabels = data.supplierLabelsByLabel.get(labelId) || [];

    // Get unique suppliers with their info
    const supplierInfoMap = new Map(suppliers.map((s) => [s.id, s]));
    const uniqueSupplierIds = new Set(
      supplierLabels.map((sl) => sl.supplierId)
    );

    const suppliersList = Array.from(uniqueSupplierIds)
      .map((supplierId) => {
        const supplier = supplierInfoMap.get(supplierId);
        return supplier
          ? {
              id: supplier.id,
              name: supplier.name,
              rating: supplier.rating,
            }
          : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // Calculate total stock across all supplier labels
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));
    let totalStock = 0;
    let hasLowStock = false;
    let hasOutOfStock = false;

    supplierLabels.forEach((sl) => {
      const inv = inventoryMap.get(sl.id);
      if (inv) {
        totalStock += inv.currentStock;
        if (inv.status === "low-stock") hasLowStock = true;
        if (inv.status === "out-of-stock") hasOutOfStock = true;
      }
    });

    const stockStatus = hasOutOfStock
      ? "out-of-stock"
      : hasLowStock
        ? "low-stock"
        : "in-stock";

    return {
      id: label.id,
      name: label.name,
      type: label.type,
      printingType: label.printingType,
      material: label.material,
      shape: label.shape,
      size: label.size,
      labelFor: label.labelFor,
      notes: label.notes,
      suppliers: suppliersList,
      totalStock,
      stockStatus,
      createdAt: label.createdAt,
      updatedAt: label.updatedAt,
    };
  }, [data, labelId, suppliers, inventory]);
}

/**
 * Get labels with full supplier list (for management drawer)
 */
export function useLabelsWithSuppliers(): LabelWithSuppliers[] {
  const data = useLabelsData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!data || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return data.labels.map((label) => {
      const supplierLabels = data.supplierLabelsByLabel.get(label.id) || [];

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
        labelFor: label.labelFor,
        notes: label.notes,
        supplierCount: suppliersList.length,
        suppliers: suppliersList,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
      };
    });
  }, [data, suppliers]);
}

// ============================================================================
// SUPPLIER LABEL QUERIES
// ============================================================================

/**
 * Get supplier labels as table rows with joined data
 */
export function useSupplierLabelRows(
  filters?: LabelFilters
): SupplierLabelRow[] {
  const data = useLabelsData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(() => db.inventoryItems.toArray(), []);

  return useMemo(() => {
    if (!data || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory?.map((i) => [i.itemId, i]) || []);

    const rows = data.supplierLabels.map((sl) => {
      const label = sl.labelId ? data.labelMap.get(sl.labelId) : undefined;
      const supplier = supplierMap.get(sl.supplierId);
      const inventoryItem = inventoryMap.get(sl.id);

      const priceWithTax = sl.unitPrice * (1 + (sl.tax || 0) / 100);

      return {
        id: sl.id,
        labelId: sl.labelId || "",
        labelName: label?.name || "Unknown",
        labelType: label?.type || "other",
        printingType: label?.printingType || "bw",
        material: label?.material || "paper",
        shape: label?.shape || "rectangular",
        supplierId: sl.supplierId,
        supplierName: supplier?.name || "Unknown",
        supplierRating: supplier?.rating || 0,
        size: label?.size,
        labelFor: label?.labelFor,
        unitPrice: sl.unitPrice,
        priceWithTax,
        bulkPrice: sl.bulkPrice,
        quantityForBulkPrice: sl.quantityForBulkPrice,
        unit: sl.unit,
        tax: sl.tax || 0,
        moq: sl.moq || 0,
        leadTime: sl.leadTime,
        transportationCost: sl.transportationCost,
        notes: sl.notes,
        currentStock: inventoryItem?.currentStock || 0,
        stockStatus:
          (inventoryItem?.status as
            | "in-stock"
            | "low-stock"
            | "out-of-stock") || "out-of-stock",
        createdAt: sl.createdAt,
        updatedAt: sl.updatedAt,
      };
    });

    // Apply filters if provided
    if (!filters) return rows;

    return rows.filter((row) => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesSearch =
          row.labelName.toLowerCase().includes(search) ||
          row.supplierName.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (filters.type && row.labelType !== filters.type) {
        return false;
      }

      if (filters.printingType && row.printingType !== filters.printingType) {
        return false;
      }

      if (filters.material && row.material !== filters.material) {
        return false;
      }

      if (filters.supplierId && row.supplierId !== filters.supplierId) {
        return false;
      }

      if (filters.priceRange) {
        if (filters.priceRange.min && row.unitPrice < filters.priceRange.min) {
          return false;
        }
        if (filters.priceRange.max && row.unitPrice > filters.priceRange.max) {
          return false;
        }
      }

      if (filters.stockStatus && row.stockStatus !== filters.stockStatus) {
        return false;
      }

      return true;
    });
  }, [data, suppliers, inventory, filters]);
}

/**
 * Get supplier labels as cards for grid view
 */
export function useSupplierLabelCards(): SupplierLabelCard[] {
  const rows = useSupplierLabelRows();

  return useMemo(() => {
    // Group by label to identify best prices
    const byLabel = new Map<string, SupplierLabelRow[]>();
    rows.forEach((row) => {
      const existing = byLabel.get(row.labelName) || [];
      existing.push(row);
      byLabel.set(row.labelName, existing);
    });

    return rows.map((row) => {
      const alternatives = byLabel.get(row.labelName) || [];
      const sorted = [...alternatives].sort(
        (a, b) => a.unitPrice - b.unitPrice
      );
      const cheapest = sorted[0];
      const mostExpensive = sorted[sorted.length - 1];

      const isBestPrice = row.id === cheapest?.id;
      const savings =
        alternatives.length > 1 ? mostExpensive.unitPrice - row.unitPrice : 0;

      return {
        id: row.id,
        labelName: row.labelName,
        labelType: row.labelType,
        printingType: row.printingType,
        material: row.material,
        shape: row.shape,
        size: row.size,
        labelFor: row.labelFor,
        supplierName: row.supplierName,
        supplierRating: row.supplierRating,
        unitPrice: row.unitPrice,
        priceWithTax: row.priceWithTax,
        unit: row.unit,
        moq: row.moq,
        leadTime: row.leadTime,
        isBestPrice,
        savings: savings > 0 ? savings : undefined,
        currentStock: row.currentStock,
        stockStatus: row.stockStatus,
      };
    });
  }, [rows]);
}

/**
 * Get supplier labels by supplier ID
 */
export function useSupplierLabelsBySupplier(
  supplierId: string | undefined
): SupplierLabelRow[] {
  const allRows = useSupplierLabelRows();

  return useMemo(() => {
    if (!supplierId) return [];
    return allRows.filter((row) => row.supplierId === supplierId);
  }, [allRows, supplierId]);
}

/**
 * Get supplier labels by label ID
 */
export function useSupplierLabelsByLabel(
  labelId: string | undefined
): SupplierLabelRow[] {
  const allRows = useSupplierLabelRows();

  return useMemo(() => {
    if (!labelId) return [];
    return allRows.filter((row) => row.labelId === labelId);
  }, [allRows, labelId]);
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Calculate price comparison data grouped by label
 */
export function useLabelPriceComparison(): LabelPriceComparison[] {
  const cards = useSupplierLabelCards();

  return useMemo(() => {
    // Group by label
    const byLabel = new Map<string, SupplierLabelCard[]>();
    cards.forEach((card) => {
      const existing = byLabel.get(card.labelName) || [];
      existing.push(card);
      byLabel.set(card.labelName, existing);
    });

    // Only include labels with multiple suppliers
    return Array.from(byLabel.entries())
      .filter(([, items]) => items.length >= 2)
      .map(([labelName, items]) => {
        const sorted = [...items].sort((a, b) => a.unitPrice - b.unitPrice);
        const cheapest = sorted[0];
        const mostExpensive = sorted[sorted.length - 1];
        const savings = mostExpensive.unitPrice - cheapest.unitPrice;
        const averagePrice =
          items.reduce((sum, item) => sum + item.unitPrice, 0) / items.length;

        return {
          labelId: cheapest.id,
          labelName,
          labelType: cheapest.labelType,
          printingType: cheapest.printingType,
          alternatives: sorted,
          cheapest,
          mostExpensive,
          savings,
          savingsPercentage: (savings / mostExpensive.unitPrice) * 100,
          averagePrice,
        };
      })
      .sort((a, b) => b.savings - a.savings);
  }, [cards]);
}

/**
 * Calculate labels analytics
 */
export function useLabelsAnalytics(): LabelsAnalytics {
  const rows = useSupplierLabelRows();
  const data = useLabelsData();

  return useMemo(() => {
    if (rows.length === 0 || !data) {
      return {
        totalLabels: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        costEfficiency: 0,
        typeDistribution: [],
        printingTypeDistribution: [],
        priceRanges: [],
        stockStatusDistribution: [],
      };
    }

    const totalLabels = rows.length;
    const avgPrice =
      rows.reduce((sum, r) => sum + r.unitPrice, 0) / totalLabels;
    const avgTax = rows.reduce((sum, r) => sum + r.tax, 0) / totalLabels;
    const highestPrice = Math.max(...rows.map((r) => r.unitPrice));

    // Stock alerts - count items with low-stock or out-of-stock status
    const stockAlerts = rows.filter(
      (r) => r.stockStatus === "low-stock" || r.stockStatus === "out-of-stock"
    ).length;

    // Cost efficiency (labels with bulk discounts)
    const withBulkDiscounts = data.supplierLabels.filter(
      (sl) => sl.bulkDiscounts && sl.bulkDiscounts.length > 0
    ).length;
    const costEfficiency =
      totalLabels > 0 ? (withBulkDiscounts / totalLabels) * 100 : 0;

    // Type distribution
    const typeCount = new Map<string, { count: number; totalPrice: number }>();
    rows.forEach((r) => {
      const existing = typeCount.get(r.labelType) || {
        count: 0,
        totalPrice: 0,
      };
      existing.count++;
      existing.totalPrice += r.unitPrice;
      typeCount.set(r.labelType, existing);
    });

    const typeDistribution = Array.from(typeCount.entries())
      .map(([type, stats]) => ({
        type: type as any,
        count: stats.count,
        percentage: (stats.count / totalLabels) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Printing type distribution
    const printingTypeCount = new Map<
      string,
      { count: number; totalPrice: number }
    >();
    rows.forEach((r) => {
      const existing = printingTypeCount.get(r.printingType) || {
        count: 0,
        totalPrice: 0,
      };
      existing.count++;
      existing.totalPrice += r.unitPrice;
      printingTypeCount.set(r.printingType, existing);
    });

    const printingTypeDistribution = Array.from(printingTypeCount.entries())
      .map(([printingType, stats]) => ({
        printingType: printingType as any,
        count: stats.count,
        percentage: (stats.count / totalLabels) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Price ranges
    const priceRanges = [
      {
        range: "₹0-10",
        count: rows.filter((r) => r.unitPrice < 10).length,
        percentage: 0,
      },
      {
        range: "₹10-25",
        count: rows.filter((r) => r.unitPrice >= 10 && r.unitPrice < 25).length,
        percentage: 0,
      },
      {
        range: "₹25-50",
        count: rows.filter((r) => r.unitPrice >= 25 && r.unitPrice < 50).length,
        percentage: 0,
      },
      {
        range: "₹50+",
        count: rows.filter((r) => r.unitPrice >= 50).length,
        percentage: 0,
      },
    ].map((range) => ({
      ...range,
      percentage: (range.count / totalLabels) * 100,
    }));

    // Stock status distribution
    const stockStatusCount = new Map<string, number>();
    rows.forEach((r) => {
      const existing = stockStatusCount.get(r.stockStatus) || 0;
      stockStatusCount.set(r.stockStatus, existing + 1);
    });

    const stockStatusDistribution = Array.from(stockStatusCount.entries())
      .map(([status, count]) => ({
        status: status as "in-stock" | "low-stock" | "out-of-stock",
        count,
        percentage: (count / totalLabels) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLabels,
      avgPrice,
      avgTax,
      highestPrice,
      stockAlerts,
      costEfficiency,
      typeDistribution,
      printingTypeDistribution,
      priceRanges,
      stockStatusDistribution,
    };
  }, [rows, data]);
}
