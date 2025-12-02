// src/hooks/material-hooks/use-materials-queries.ts

import { db } from "@/lib/db";
import type {
  MaterialDetails,
  MaterialFilters,
  MaterialListItem,
  MaterialPriceComparison,
  MaterialsAnalytics,
  MaterialWithSuppliers,
  SupplierMaterialCard,
  SupplierMaterialRow,
} from "@/types/material-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { getCategoryInfo, useMaterialsData } from "./use-materials-data";

// ============================================================================
// MATERIAL QUERIES
// ============================================================================

/**
 * Get lightweight material list for tables/dropdowns
 * Returns only essential fields to minimize memory usage
 */
export function useMaterialsList(): MaterialListItem[] {
  const data = useMaterialsData();

  return useMemo(() => {
    if (!data) return [];

    return data.materials.map((material) => {
      const categoryInfo = getCategoryInfo(material.category, data.categoryMap);
      const supplierMaterials =
        data.supplierMaterialsByMaterial.get(material.id) || [];
      const uniqueSuppliers = new Set(
        supplierMaterials.map((sm) => sm.supplierId)
      );

      return {
        id: material.id,
        name: material.name,
        category: material.category,
        categoryColor: categoryInfo.color,
        supplierCount: uniqueSuppliers.size,
        updatedAt: material.updatedAt,
      };
    });
  }, [data]);
}

/**
 * Get single material with full details
 */
export function useMaterialDetails(
  materialId: string | undefined
): MaterialDetails | null {
  const data = useMaterialsData();

  // Also fetch suppliers and inventory data
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierMaterial").toArray(),
    []
  );

  return useMemo(() => {
    if (!data || !materialId || !suppliers || !inventory) return null;

    const material = data.materialMap.get(materialId);
    if (!material) return null;

    const categoryInfo = getCategoryInfo(material.category, data.categoryMap);
    const supplierMaterials =
      data.supplierMaterialsByMaterial.get(materialId) || [];

    // Get unique suppliers with their info
    const supplierInfoMap = new Map(suppliers.map((s) => [s.id, s]));
    const uniqueSupplierIds = new Set(
      supplierMaterials.map((sm) => sm.supplierId)
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

    // Calculate total stock across all supplier materials
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));
    let totalStock = 0;
    let hasLowStock = false;
    let hasOutOfStock = false;

    supplierMaterials.forEach((sm) => {
      const inv = inventoryMap.get(sm.id);
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
      id: material.id,
      name: material.name,
      category: material.category,
      categoryColor: categoryInfo.color,
      notes: material.notes,
      suppliers: suppliersList,
      totalStock,
      stockStatus,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    };
  }, [data, materialId, suppliers, inventory]);
}

/**
 * Get materials with full supplier list (for management drawer)
 */
export function useMaterialsWithSuppliers(): MaterialWithSuppliers[] {
  const data = useMaterialsData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!data || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return data.materials.map((material) => {
      const categoryInfo = getCategoryInfo(material.category, data.categoryMap);
      const supplierMaterials =
        data.supplierMaterialsByMaterial.get(material.id) || [];

      const uniqueSupplierIds = new Set(
        supplierMaterials.map((sm) => sm.supplierId)
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
        id: material.id,
        name: material.name,
        category: material.category,
        categoryColor: categoryInfo.color,
        notes: material.notes,
        supplierCount: suppliersList.length,
        suppliers: suppliersList,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
      };
    });
  }, [data, suppliers]);
}

// ============================================================================
// SUPPLIER MATERIAL QUERIES
// ============================================================================

/**
 * Get supplier materials as table rows with joined data
 */
export function useSupplierMaterialRows(
  filters?: MaterialFilters
): SupplierMaterialRow[] {
  const data = useMaterialsData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!data || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    const rows = data.supplierMaterials.map((sm) => {
      const material = data.materialMap.get(sm.materialId);
      const supplier = supplierMap.get(sm.supplierId);
      const categoryInfo = material
        ? getCategoryInfo(material.category, data.categoryMap)
        : { name: "Unknown", color: "#6366f1" };

      const priceWithTax = sm.unitPrice * (1 + (sm.tax || 0) / 100);

      return {
        id: sm.id,
        materialId: sm.materialId,
        materialName: material?.name || "Unknown",
        materialCategory: material?.category || "Unknown",
        categoryColor: categoryInfo.color,
        supplierId: sm.supplierId,
        supplierName: supplier?.name || "Unknown",
        supplierRating: supplier?.rating || 0,
        unitPrice: sm.unitPrice,
        priceWithTax,
        bulkPrice: sm.bulkPrice,
        quantityForBulkPrice: sm.quantityForBulkPrice,
        unit: sm.unit,
        tax: sm.tax,
        moq: sm.moq || 1,
        leadTime: sm.leadTime || 7,
        transportationCost: sm.transportationCost,
        notes: sm.notes,
        createdAt: sm.createdAt,
        updatedAt: sm.updatedAt,
      };
    });

    // Apply filters if provided
    if (!filters) return rows;

    return rows.filter((row) => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesSearch =
          row.materialName.toLowerCase().includes(search) ||
          row.supplierName.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (filters.category && row.materialCategory !== filters.category) {
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

      return true;
    });
  }, [data, suppliers, filters]);
}

/**
 * Get supplier materials as cards for grid view
 */
export function useSupplierMaterialCards(): SupplierMaterialCard[] {
  const rows = useSupplierMaterialRows();
  const inventory = useLiveQuery(() => db.inventoryItems.toArray(), []);

  return useMemo(() => {
    // Group by material to identify best prices
    const byMaterial = new Map<string, SupplierMaterialRow[]>();
    rows.forEach((row) => {
      const existing = byMaterial.get(row.materialName) || [];
      existing.push(row);
      byMaterial.set(row.materialName, existing);
    });

    // Create inventory map for quick lookup
    const inventoryMap = new Map(
      inventory?.map((inv) => [inv.itemId, inv]) || []
    );

    return rows.map((row) => {
      const alternatives = byMaterial.get(row.materialName) || [];
      const sorted = [...alternatives].sort(
        (a, b) => a.unitPrice - b.unitPrice
      );
      const cheapest = sorted[0];
      const mostExpensive = sorted[sorted.length - 1];

      const isBestPrice = row.id === cheapest?.id;
      const savings =
        alternatives.length > 1 ? mostExpensive.unitPrice - row.unitPrice : 0;

      // Get current stock from inventory
      const inventoryItem = inventoryMap.get(row.id);
      const currentStock = inventoryItem?.currentStock || 0;

      return {
        id: row.id,
        materialName: row.materialName,
        materialCategory: row.materialCategory,
        categoryColor: row.categoryColor,
        supplierName: row.supplierName,
        supplierRating: row.supplierRating,
        unitPrice: row.unitPrice,
        priceWithTax: row.priceWithTax,
        unit: row.unit,
        moq: row.moq,
        leadTime: row.leadTime,
        isBestPrice,
        savings: savings > 0 ? savings : undefined,
        currentStock,
      };
    });
  }, [rows, inventory]);
}

/**
 * Get supplier materials by supplier ID
 */
export function useSupplierMaterialsBySupplier(
  supplierId: string | undefined
): SupplierMaterialRow[] {
  const allRows = useSupplierMaterialRows();

  return useMemo(() => {
    if (!supplierId) return [];
    return allRows.filter((row) => row.supplierId === supplierId);
  }, [allRows, supplierId]);
}

/**
 * Get supplier materials by material ID
 */
export function useSupplierMaterialsByMaterial(
  materialId: string | undefined
): SupplierMaterialRow[] {
  const allRows = useSupplierMaterialRows();

  return useMemo(() => {
    if (!materialId) return [];
    return allRows.filter((row) => row.materialId === materialId);
  }, [allRows, materialId]);
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Calculate price comparison data grouped by material
 */
export function useMaterialPriceComparison(): MaterialPriceComparison[] {
  const cards = useSupplierMaterialCards();

  return useMemo(() => {
    // Group by material
    const byMaterial = new Map<string, SupplierMaterialCard[]>();
    cards.forEach((card) => {
      const existing = byMaterial.get(card.materialName) || [];
      existing.push(card);
      byMaterial.set(card.materialName, existing);
    });

    // Only include materials with multiple suppliers
    return Array.from(byMaterial.entries())
      .filter(([, items]) => items.length >= 2)
      .map(([materialName, items]) => {
        const sorted = [...items].sort((a, b) => a.unitPrice - b.unitPrice);
        const cheapest = sorted[0];
        const mostExpensive = sorted[sorted.length - 1];
        const savings = mostExpensive.unitPrice - cheapest.unitPrice;
        const averagePrice =
          items.reduce((sum, item) => sum + item.unitPrice, 0) / items.length;

        return {
          materialId: cheapest.id,
          materialName,
          materialCategory: cheapest.materialCategory,
          categoryColor: cheapest.categoryColor,
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
 * Calculate materials analytics
 */
export function useMaterialsAnalytics(): MaterialsAnalytics {
  const rows = useSupplierMaterialRows();
  const data = useMaterialsData();
  const inventory = useLiveQuery(() => db.inventoryItems.toArray(), []);

  return useMemo(() => {
    if (rows.length === 0 || !data) {
      return {
        totalMaterials: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        costEfficiency: 0,
        categoryDistribution: [],
        priceRanges: [],
      };
    }

    const totalMaterials = rows.length;
    const avgPrice =
      rows.reduce((sum, r) => sum + r.unitPrice, 0) / totalMaterials;
    const avgTax = rows.reduce((sum, r) => sum + r.tax, 0) / totalMaterials;
    const highestPrice = Math.max(...rows.map((r) => r.unitPrice));

    // Stock alerts - count inventory items with low-stock or out-of-stock status
    const stockAlerts =
      inventory?.filter(
        (item) =>
          item.itemType === "supplierMaterial" &&
          (item.status === "low-stock" || item.status === "out-of-stock")
      ).length || 0;

    // Cost efficiency (materials with bulk discounts)
    const withBulkDiscounts = data.supplierMaterials.filter(
      (sm) => sm.bulkDiscounts && sm.bulkDiscounts.length > 0
    ).length;
    const costEfficiency =
      totalMaterials > 0 ? (withBulkDiscounts / totalMaterials) * 100 : 0;

    // Category distribution
    const categoryCount = new Map<
      string,
      { count: number; totalPrice: number }
    >();
    rows.forEach((r) => {
      const existing = categoryCount.get(r.materialCategory) || {
        count: 0,
        totalPrice: 0,
      };
      existing.count++;
      existing.totalPrice += r.unitPrice;
      categoryCount.set(r.materialCategory, existing);
    });

    const categoryDistribution = Array.from(categoryCount.entries())
      .map(([category, stats]) => {
        const categoryInfo = getCategoryInfo(category, data.categoryMap);
        return {
          category,
          categoryColor: categoryInfo.color,
          count: stats.count,
          percentage: (stats.count / totalMaterials) * 100,
          avgPrice: stats.totalPrice / stats.count,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Price ranges
    const priceRanges = [
      {
        range: "₹0-50",
        count: rows.filter((r) => r.unitPrice < 50).length,
        percentage: 0,
      },
      {
        range: "₹50-100",
        count: rows.filter((r) => r.unitPrice >= 50 && r.unitPrice < 100)
          .length,
        percentage: 0,
      },
      {
        range: "₹100-500",
        count: rows.filter((r) => r.unitPrice >= 100 && r.unitPrice < 500)
          .length,
        percentage: 0,
      },
      {
        range: "₹500+",
        count: rows.filter((r) => r.unitPrice >= 500).length,
        percentage: 0,
      },
    ].map((range) => ({
      ...range,
      percentage: (range.count / totalMaterials) * 100,
    }));

    return {
      totalMaterials,
      avgPrice,
      avgTax,
      highestPrice,
      stockAlerts,
      costEfficiency,
      categoryDistribution,
      priceRanges,
    };
  }, [rows, data, inventory]);
}
