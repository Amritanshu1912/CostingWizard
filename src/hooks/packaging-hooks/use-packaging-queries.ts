// src/hooks/packaging-hooks/use-packaging-queries.ts

import { db } from "@/lib/db";
import type {
  Packaging,
  PackagingWithSupplierCount,
  SupplierPackagingTableRow,
  PackagingPriceComparison,
  SupplierPackagingForComparison,
  PackagingAnalytics,
  PackagingFilters,
  PackagingSupplierMapping,
} from "@/types/packaging-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { usePackagingBaseData } from "./use-packaging-data";
import { Supplier } from "@/types/shared-types";
import { useSuppliers } from "../use-suppliers";

// ============================================================================
// PACKAGING QUERIES
// ============================================================================

/**
 * Get packagings with supplier info for lists/dropdowns
 * Returns: id, name, type, capacity, unit, buildMaterial, supplierCount, suppliers array
 */
export function usePackagingsWithSupplierCount(): PackagingWithSupplierCount[] {
  const baseData = usePackagingBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!baseData || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return baseData.packagings.map((packaging) => {
      const supplierPackagings =
        baseData.supplierPackagingsByPackaging.get(packaging.id) || [];
      const supplierCount = new Set(
        supplierPackagings.map((sp) => sp.supplierId)
      ).size;

      // Build suppliers array with details
      const suppliers = supplierPackagings
        .map((sp) => {
          const supplier = supplierMap.get(sp.supplierId);
          return supplier
            ? { id: supplier.id, name: supplier.name, rating: supplier.rating }
            : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string; rating: number }>;

      return {
        id: packaging.id,
        name: packaging.name,
        type: packaging.type,
        capacity: packaging.capacity,
        unit: packaging.unit,
        buildMaterial: packaging.buildMaterial,
        supplierCount,
        suppliers,
        createdAt: packaging.createdAt,
        updatedAt: packaging.updatedAt,
      };
    });
  }, [baseData, suppliers]);
}

/**
 * Get supplier packagings as table rows (main table)
 * Returns: All fields needed for packaging-supplier-table
 */
export function useSupplierPackagingTableRows(
  filters?: PackagingFilters
): SupplierPackagingTableRow[] {
  const baseData = usePackagingBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierPackaging").toArray(),
    []
  );
  return useMemo(() => {
    if (!baseData || !suppliers || !inventory) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    let rows = baseData.supplierPackagings.map((sp) => {
      const packaging = baseData.packagingMap.get(sp.packagingId);
      const supplier = supplierMap.get(sp.supplierId);
      const inventoryItem = inventoryMap.get(sp.id);
      const unitPrice =
        sp.quantityForBulkPrice > 1
          ? sp.bulkPrice / sp.quantityForBulkPrice
          : sp.bulkPrice;
      const priceWithTax = unitPrice * (1 + sp.tax / 100);

      return {
        id: sp.id,
        packagingId: sp.packagingId,
        supplierId: sp.supplierId,
        packagingName: packaging?.name || "Unknown",
        packagingType: packaging?.type || "other",
        capacity: packaging?.capacity || 0,
        unit: sp.unit,
        buildMaterial: packaging?.buildMaterial,
        supplierName: supplier?.name || "Unknown",
        supplierRating: supplier?.rating || 0,
        bulkPrice: sp.bulkPrice,
        unitPrice: unitPrice,
        priceWithTax,
        quantityForBulkPrice: sp.quantityForBulkPrice,
        tax: sp.tax,
        moq: sp.moq,
        leadTime: sp.leadTime,
        currentStock: inventoryItem?.currentStock || 0,
        stockStatus: inventoryItem?.status || "Unknown",
        transportationCost: sp.transportationCost,
        notes: sp.notes,
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
      };
    });

    // Apply filters
    if (filters) {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.packagingName.toLowerCase().includes(search) ||
            r.supplierName.toLowerCase().includes(search)
        );
      }
      if (filters.type) {
        rows = rows.filter((r) => r.packagingType === filters.type);
      }
      if (filters.buildMaterial) {
        rows = rows.filter((r) => r.buildMaterial === filters.buildMaterial);
      }
      if (filters.supplierId) {
        rows = rows.filter((r) => r.supplierId === filters.supplierId);
      }
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          rows = rows.filter((r) => r.bulkPrice >= filters.priceRange!.min!);
        }
        if (filters.priceRange.max) {
          rows = rows.filter((r) => r.bulkPrice <= filters.priceRange!.max!);
        }
      }
    }

    return rows;
  }, [baseData, suppliers, inventory, filters]);
}

/**
 * Get price comparison data grouped by packaging
 * Returns: Packagings with multiple suppliers for comparison
 */
export function usePackagingPriceComparison(): PackagingPriceComparison[] {
  const baseData = usePackagingBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierPackaging").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !suppliers || !inventory) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Group supplier packagings by packaging
    const byPackaging = new Map<string, SupplierPackagingForComparison[]>();

    baseData.supplierPackagings.forEach((sp) => {
      const packaging = baseData.packagingMap.get(sp.packagingId);
      const supplier = supplierMap.get(sp.supplierId);
      if (!packaging || !supplier) return;

      const inventoryItem = inventoryMap.get(sp.id);
      const priceWithTax = sp.bulkPrice * (1 + sp.tax / 100);

      const comparison: SupplierPackagingForComparison = {
        id: sp.id,
        supplierId: sp.supplierId,
        supplierName: supplier.name,
        supplierRating: supplier.rating,
        bulkPrice: sp.bulkPrice,
        priceWithTax,
        unit: sp.unit,
        moq: sp.moq,
        leadTime: sp.leadTime,
        currentStock: inventoryItem?.currentStock || 0,
        stockStatus: inventoryItem?.status || "Unknown",
        packagingName: packaging.name,
        packagingType: packaging.type,
        buildMaterial: packaging.buildMaterial,
      };

      const existing = byPackaging.get(packaging.name) || [];
      existing.push(comparison);
      byPackaging.set(packaging.name, existing);
    });

    // Only include packagings with 2+ suppliers
    return Array.from(byPackaging.entries())
      .filter(([, alternatives]) => alternatives.length >= 2)
      .map(([packagingName, alternatives]) => {
        const sorted = [...alternatives].sort(
          (a, b) => a.bulkPrice - b.bulkPrice
        );
        const cheapest = sorted[0];
        const mostExpensive = sorted[sorted.length - 1];
        const savings = mostExpensive.bulkPrice - cheapest.bulkPrice;
        const averagePrice =
          alternatives.reduce((sum, a) => sum + a.bulkPrice, 0) /
          alternatives.length;

        const packaging = baseData.packagings.find(
          (p) => p.name === packagingName
        )!;

        return {
          packagingId: packaging.id,
          packagingName,
          packagingType: packaging.type,
          buildMaterial: packaging.buildMaterial,
          alternatives: sorted,
          cheapest,
          mostExpensive,
          savings,
          savingsPercentage: (savings / mostExpensive.bulkPrice) * 100,
          averagePrice,
        };
      })
      .sort((a, b) => b.savings - a.savings);
  }, [baseData, suppliers, inventory]);
}

/**
 * Get analytics data for dashboard
 */
export function usePackagingAnalytics(): PackagingAnalytics {
  const baseData = usePackagingBaseData();
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierPackaging").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !inventory) {
      return {
        totalPackaging: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        typeDistribution: [],
        materialDistribution: [],
        priceRanges: [],
      };
    }

    const totalPackaging = baseData.supplierPackagings.length;
    if (totalPackaging === 0) {
      return {
        totalPackaging: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        typeDistribution: [],
        materialDistribution: [],
        priceRanges: [],
      };
    }

    const avgPrice =
      baseData.supplierPackagings.reduce((sum, sp) => sum + sp.bulkPrice, 0) /
      totalPackaging;
    const avgTax =
      baseData.supplierPackagings.reduce((sum, sp) => sum + sp.tax, 0) /
      totalPackaging;
    const highestPrice = Math.max(
      ...baseData.supplierPackagings.map((sp) => sp.bulkPrice)
    );

    const stockAlerts = inventory.filter(
      (item) => item.status === "low-stock" || item.status === "out-of-stock"
    ).length;

    // Type distribution
    const typeStats = new Map<string, { count: number; totalPrice: number }>();
    baseData.supplierPackagings.forEach((sp) => {
      const packaging = baseData.packagingMap.get(sp.packagingId);
      if (!packaging) return;

      const stats = typeStats.get(packaging.type) || {
        count: 0,
        totalPrice: 0,
      };
      stats.count++;
      stats.totalPrice += sp.bulkPrice;
      typeStats.set(packaging.type, stats);
    });

    const typeDistribution = Array.from(typeStats.entries())
      .map(([type, stats]) => ({
        type: type as any, // PackagingType
        count: stats.count,
        percentage: (stats.count / totalPackaging) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Material distribution
    const materialStats = new Map<
      string,
      { count: number; totalPrice: number }
    >();
    baseData.supplierPackagings.forEach((sp) => {
      const packaging = baseData.packagingMap.get(sp.packagingId);
      if (!packaging?.buildMaterial) return;

      const stats = materialStats.get(packaging.buildMaterial) || {
        count: 0,
        totalPrice: 0,
      };
      stats.count++;
      stats.totalPrice += sp.bulkPrice;
      materialStats.set(packaging.buildMaterial, stats);
    });

    const materialDistribution = Array.from(materialStats.entries())
      .map(([material, stats]) => ({
        material: material as any, // BuildMaterial
        count: stats.count,
        percentage: (stats.count / totalPackaging) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    // Price ranges
    const priceRanges = [
      { range: "₹0-50", count: 0 },
      { range: "₹50-100", count: 0 },
      { range: "₹100-500", count: 0 },
      { range: "₹500+", count: 0 },
    ];

    baseData.supplierPackagings.forEach((sp) => {
      if (sp.bulkPrice < 50) priceRanges[0].count++;
      else if (sp.bulkPrice < 100) priceRanges[1].count++;
      else if (sp.bulkPrice < 500) priceRanges[2].count++;
      else priceRanges[3].count++;
    });

    const priceRangesWithPercentage = priceRanges.map((range) => ({
      ...range,
      percentage: (range.count / totalPackaging) * 100,
    }));

    return {
      totalPackaging,
      avgPrice,
      avgTax,
      highestPrice,
      stockAlerts,
      typeDistribution,
      materialDistribution,
      priceRanges: priceRangesWithPercentage,
    };
  }, [baseData, inventory]);
}

// ============================================================================
// Lightweight hooks for specific needs
// ============================================================================

/**
 * Get raw packagings array for dropdowns (minimal data)
 */
export function usePackagingsForDropdown(): Pick<
  Packaging,
  "id" | "name" | "type" | "capacity" | "unit"
>[] {
  return (
    useLiveQuery(async () => {
      const packagings = await db.packaging.toArray();
      return packagings.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        capacity: p.capacity,
        unit: p.unit,
      }));
    }, []) || []
  );
}

/**
 * Get all packagings (for packaging manager)
 */
export function useAllPackagings(): Packaging[] {
  return useLiveQuery(() => db.packaging.toArray(), []) || [];
}

/**
 * Get all suppliers (for supplier selection)
 */
export function useAllSuppliers(): Supplier[] {
  return useLiveQuery(() => db.suppliers.toArray(), []) || [];
}

/**
 * Get supplier packagings by supplier ID
 */
export function useSupplierPackagingsBySupplier(
  supplierId: string | undefined
): SupplierPackagingTableRow[] {
  const allRows = useSupplierPackagingTableRows();
  return useMemo(() => {
    if (!supplierId) return [];
    return allRows.filter((row) => row.supplierId === supplierId);
  }, [allRows, supplierId]);
}

/**
 * Get minimal packaging-supplier mappings for analytics calculations
 * Returns: packagingName and supplierId for supplier diversity analysis
 */
export function usePackagingSupplierMappings(): PackagingSupplierMapping[] {
  const baseData = usePackagingBaseData();
  const suppliers = useSuppliers();

  return useMemo(() => {
    if (!baseData || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return baseData.supplierPackagings.map((sp) => {
      const packaging = baseData.packagingMap.get(sp.packagingId);
      const supplier = supplierMap.get(sp.supplierId);
      return {
        packagingName: packaging?.name || "Unknown",
        supplierId: sp.supplierId,
        supplierName: supplier?.name || "Unknown",
      };
    });
  }, [baseData, suppliers]);
}
