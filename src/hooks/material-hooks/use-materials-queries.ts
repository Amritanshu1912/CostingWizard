// src/hooks/material-hooks/use-materials-queries.ts
import { db } from "@/lib/db";
import type {
  MaterialWithSupplierCount,
  SupplierMaterialTableRow,
  MaterialPriceComparison,
  SupplierMaterialForComparison,
  MaterialsAnalytics,
  MaterialFilters,
  Category,
  Material,
  MaterialSupplierMapping,
} from "@/types/material-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { getCategoryColor, useMaterialsBaseData } from "./use-materials-data";
import { Supplier } from "@/types/supplier-types";

/**
 * Returns materials with supplier count and details.
 * @returns Array of materials with supplier information
 */
export function useMaterialsWithSupplierCount(): MaterialWithSupplierCount[] {
  const baseData = useMaterialsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  return useMemo(() => {
    if (!baseData || !suppliers) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return baseData.materials.map((material) => {
      const categoryColor = getCategoryColor(
        material.category,
        baseData.categoryMap
      );
      const supplierMaterials =
        baseData.supplierMaterialsByMaterial.get(material.id) || [];
      const supplierCount = new Set(
        supplierMaterials.map((sm) => sm.supplierId)
      ).size;

      // Build suppliers array with details
      const suppliers = supplierMaterials
        .map((sm) => {
          const supplier = supplierMap.get(sm.supplierId);
          return supplier
            ? { id: supplier.id, name: supplier.name, rating: supplier.rating }
            : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string; rating: number }>;

      return {
        id: material.id,
        name: material.name,
        category: material.category,
        categoryColor,
        supplierCount,
        suppliers,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
      };
    });
  }, [baseData, suppliers]);
}

/**
 * Returns supplier materials formatted as table rows.
 * @param filters - Optional filters to apply
 * @returns Array of table rows with supplier material data
 */
export function useSupplierMaterialTableRows(
  filters?: MaterialFilters
): SupplierMaterialTableRow[] {
  const baseData = useMaterialsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierMaterial").toArray(),
    []
  );
  return useMemo(() => {
    if (!baseData || !suppliers || !inventory) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Transform supplier materials to table row format
    let rows = baseData.supplierMaterials.map((sm) => {
      const material = baseData.materialMap.get(sm.materialId);
      const supplier = supplierMap.get(sm.supplierId);
      const categoryColor = material
        ? getCategoryColor(material.category, baseData.categoryMap)
        : "#6366f1";
      const inventoryItem = inventoryMap.get(sm.id);
      const priceWithTax = sm.unitPrice * (1 + sm.tax / 100);

      return {
        id: sm.id,
        materialId: sm.materialId,
        supplierId: sm.supplierId,
        materialName: material?.name || "Unknown",
        materialCategory: material?.category || "Unknown",
        categoryColor,
        supplierName: supplier?.name || "Unknown",
        supplierRating: supplier?.rating || 0,
        unitPrice: sm.unitPrice,
        priceWithTax,
        bulkPrice: sm.bulkPrice,
        quantityForBulkPrice: sm.quantityForBulkPrice,
        tax: sm.tax,
        capacityUnit: sm.capacityUnit,
        moq: sm.moq,
        leadTime: sm.leadTime,
        currentStock: inventoryItem?.currentStock || 0,
        stockStatus: inventoryItem?.status || "Unknown",
        transportationCost: sm.transportationCost,
        notes: sm.notes,
        createdAt: sm.createdAt,
        updatedAt: sm.updatedAt,
      };
    });

    // Apply filters if provided
    if (filters) {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.materialName.toLowerCase().includes(search) ||
            r.supplierName.toLowerCase().includes(search)
        );
      }
      if (filters.category) {
        rows = rows.filter((r) => r.materialCategory === filters.category);
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
 * Returns price comparison data for materials with multiple suppliers.
 * @returns Array of materials with supplier alternatives sorted by price
 */
export function useMaterialPriceComparison(): MaterialPriceComparison[] {
  const baseData = useMaterialsBaseData();
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierMaterial").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !suppliers || !inventory) return [];

    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Group supplier materials by material
    const byMaterial = new Map<string, SupplierMaterialForComparison[]>();

    baseData.supplierMaterials.forEach((sm) => {
      const material = baseData.materialMap.get(sm.materialId);
      const supplier = supplierMap.get(sm.supplierId);
      if (!material || !supplier) return;

      const inventoryItem = inventoryMap.get(sm.id);
      const priceWithTax = sm.unitPrice * (1 + sm.tax / 100);

      const comparison: SupplierMaterialForComparison = {
        id: sm.id,
        supplierId: sm.supplierId,
        supplierName: supplier.name,
        supplierRating: supplier.rating,
        unitPrice: sm.unitPrice,
        priceWithTax,
        capacityUnit: sm.capacityUnit,
        moq: sm.moq,
        leadTime: sm.leadTime,
        currentStock: inventoryItem?.currentStock || 0,
      };

      const existing = byMaterial.get(material.name) || [];
      existing.push(comparison);
      byMaterial.set(material.name, existing);
    });

    // Only include materials with 2+ suppliers
    return Array.from(byMaterial.entries())
      .filter(([, alternatives]) => alternatives.length >= 2)
      .map(([materialName, alternatives]) => {
        // Sort alternatives by price ascending
        const sorted = [...alternatives].sort(
          (a, b) => a.unitPrice - b.unitPrice
        );
        const cheapest = sorted[0];
        const mostExpensive = sorted[sorted.length - 1];
        const savings = mostExpensive.unitPrice - cheapest.unitPrice;
        const averagePrice =
          alternatives.reduce((sum, a) => sum + a.unitPrice, 0) /
          alternatives.length;

        const material = baseData.materials.find(
          (m) => m.name === materialName
        )!;
        const categoryColor = getCategoryColor(
          material.category,
          baseData.categoryMap
        );

        return {
          materialId: material.id,
          materialName,
          materialCategory: material.category,
          categoryColor,
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
 * Returns analytics data for materials dashboard.
 * @returns Analytics object with totals, averages, and distributions
 */
export function useMaterialsAnalytics(): MaterialsAnalytics {
  const baseData = useMaterialsBaseData();
  const inventory = useLiveQuery(
    () =>
      db.inventoryItems.where("itemType").equals("supplierMaterial").toArray(),
    []
  );

  return useMemo(() => {
    if (!baseData || !inventory) {
      return {
        totalMaterials: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        categoryDistribution: [],
        priceRanges: [],
      };
    }

    const totalMaterials = baseData.supplierMaterials.length;
    if (totalMaterials === 0) {
      return {
        totalMaterials: 0,
        avgPrice: 0,
        avgTax: 0,
        highestPrice: 0,
        stockAlerts: 0,
        categoryDistribution: [],
        priceRanges: [],
      };
    }

    const avgPrice =
      baseData.supplierMaterials.reduce((sum, sm) => sum + sm.unitPrice, 0) /
      totalMaterials;
    const avgTax =
      baseData.supplierMaterials.reduce((sum, sm) => sum + sm.tax, 0) /
      totalMaterials;
    const highestPrice = Math.max(
      ...baseData.supplierMaterials.map((sm) => sm.unitPrice)
    );

    const stockAlerts = inventory.filter(
      (item) => item.status === "low-stock" || item.status === "out-of-stock"
    ).length;

    // Category distribution
    const categoryStats = new Map<
      string,
      { count: number; totalPrice: number }
    >();
    baseData.supplierMaterials.forEach((sm) => {
      const material = baseData.materialMap.get(sm.materialId);
      if (!material) return;

      const stats = categoryStats.get(material.category) || {
        count: 0,
        totalPrice: 0,
      };
      stats.count++;
      stats.totalPrice += sm.unitPrice;
      categoryStats.set(material.category, stats);
    });

    const categoryDistribution = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        categoryColor: getCategoryColor(category, baseData.categoryMap),
        count: stats.count,
        percentage: (stats.count / totalMaterials) * 100,
        avgPrice: stats.totalPrice / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    const priceRanges = [
      { range: "₹0-50", count: 0 },
      { range: "₹50-100", count: 0 },
      { range: "₹100-500", count: 0 },
      { range: "₹500+", count: 0 },
    ];

    baseData.supplierMaterials.forEach((sm) => {
      if (sm.unitPrice < 50) priceRanges[0].count++;
      else if (sm.unitPrice < 100) priceRanges[1].count++;
      else if (sm.unitPrice < 500) priceRanges[2].count++;
      else priceRanges[3].count++;
    });

    const priceRangesWithPercentage = priceRanges.map((range) => ({
      ...range,
      percentage: (range.count / totalMaterials) * 100,
    }));

    return {
      totalMaterials,
      avgPrice,
      avgTax,
      highestPrice,
      stockAlerts,
      categoryDistribution,
      priceRanges: priceRangesWithPercentage,
    };
  }, [baseData, inventory]);
}

/**
 * Returns materials data for dropdown selections.
 * @returns Array of materials with id, name, category
 */
export function useMaterialsForDropdown(): Pick<
  Material,
  "id" | "name" | "category"
>[] {
  return (
    useLiveQuery(async () => {
      const materials = await db.materials.toArray();
      return materials.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
      }));
    }, []) || []
  );
}

/**
 * Returns categories data for dropdown selections.
 * @returns Array of categories with id, name, color
 */
export function useCategoriesForDropdown(): Pick<
  Category,
  "id" | "name" | "color"
>[] {
  return (
    useLiveQuery(async () => {
      const categories = await db.categories.toArray();
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      }));
    }, []) || []
  );
}

/**
 * Returns all materials.
 * @returns Array of all materials
 */
export function useAllMaterials(): Material[] {
  return useLiveQuery(() => db.materials.toArray(), []) || [];
}

/**
 * Returns all suppliers.
 * @returns Array of all suppliers
 */
export function useAllSuppliers(): Supplier[] {
  return useLiveQuery(() => db.suppliers.toArray(), []) || [];
}

/**
 * Returns all categories.
 * @returns Array of all categories
 */
export function useAllCategories(): Category[] {
  return useLiveQuery(() => db.categories.toArray(), []) || [];
}

/**
 * Returns supplier materials for a specific supplier.
 * @param supplierId - The supplier ID to filter by
 * @returns Array of supplier material rows for the supplier
 */
export function useSupplierMaterialsBySupplier(
  supplierId: string | undefined
): SupplierMaterialTableRow[] {
  const allRows = useSupplierMaterialTableRows();
  return useMemo(() => {
    if (!supplierId) return [];
    return allRows.filter((row) => row.supplierId === supplierId);
  }, [allRows, supplierId]);
}

/**
 * Returns minimal mappings of materials to suppliers.
 * @returns Array of material-supplier mappings
 */
export function useMaterialSupplierMappings(): MaterialSupplierMapping[] {
  const baseData = useMaterialsBaseData();

  return useMemo(() => {
    if (!baseData) return [];

    return baseData.supplierMaterials.map((sm) => {
      const material = baseData.materialMap.get(sm.materialId);
      return {
        materialName: material?.name || "Unknown",
        supplierId: sm.supplierId,
      };
    });
  }, [baseData]);
}
