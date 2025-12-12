// src/utils/inventory-chart-utils.ts
import { CHART_COLORS } from "@/utils/color-utils";
import type { InventoryItemWithDetails } from "@/types/inventory-types";

// ============================================================================
// CHART COLOR CONSTANTS
// ============================================================================

/**
 * Standard colors for inventory charts (materials, packaging, labels)
 */
export const INVENTORY_CHART_COLORS = [
  CHART_COLORS.light.chart1, // Materials - Blue
  CHART_COLORS.light.chart5, // Packaging - Green
  CHART_COLORS.light.chart4, // Labels - Yellow
];

/**
 * Standard tooltip style for all inventory charts
 * Ensures consistent appearance across dashboard
 */
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  padding: "8px",
} as const;

/**
 * Standard item style for chart tooltips
 */
export const CHART_TOOLTIP_ITEM_STYLE = {
  color: "hsl(var(--foreground))",
};

/**
 * Standard label style for chart tooltips
 */
export const CHART_TOOLTIP_LABEL_STYLE = {
  color: "hsl(var(--muted-foreground))",
};

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare pie chart data for stock value by type
 * @param items - Array of inventory items with details
 * @returns Array of chart data objects
 */
export function prepareStockValueByTypePieData(
  items: InventoryItemWithDetails[]
): Array<{ name: string; value: number; count: number }> {
  const materials = items.filter((i) => i.itemType === "supplierMaterial");
  const packaging = items.filter((i) => i.itemType === "supplierPackaging");
  const labels = items.filter((i) => i.itemType === "supplierLabel");

  return [
    {
      name: "Materials",
      value: materials.reduce((sum, item) => sum + item.stockValue, 0),
      count: materials.length,
    },
    {
      name: "Packaging",
      value: packaging.reduce((sum, item) => sum + item.stockValue, 0),
      count: packaging.length,
    },
    {
      name: "Labels",
      value: labels.reduce((sum, item) => sum + item.stockValue, 0),
      count: labels.length,
    },
  ];
}

/**
 * Prepare bar chart data for top items by value
 * @param items - Array of inventory items with details
 * @param topN - Number of top items to return (default 10)
 * @returns Array of chart data objects sorted for vertical display
 */
export function prepareTopItemsByValueBarData(
  items: InventoryItemWithDetails[],
  topN: number = 10
): Array<{ name: string; value: number }> {
  return [...items]
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, topN)
    .reverse() // Reverse for better vertical display (lowest at top)
    .map((item) => ({
      name: item.itemName.slice(0, 25), // Truncate long names
      value: item.stockValue,
    }));
}

/**
 * Calculate distribution percentages by type
 * @param items - Array of inventory items with details
 * @returns Distribution data with percentages
 */
export function calculateTypeDistribution(
  items: InventoryItemWithDetails[]
): Array<{
  key: string;
  value: number;
  count: number;
  color: string;
  percentage: number;
}> {
  const materialVal = items
    .filter((i) => i.itemType === "supplierMaterial")
    .reduce((sum, i) => sum + i.stockValue, 0);
  const packagingVal = items
    .filter((i) => i.itemType === "supplierPackaging")
    .reduce((sum, i) => sum + i.stockValue, 0);
  const labelsVal = items
    .filter((i) => i.itemType === "supplierLabel")
    .reduce((sum, i) => sum + i.stockValue, 0);

  const total = materialVal + packagingVal + labelsVal || 1; // Avoid division by zero

  return [
    {
      key: "Materials",
      value: materialVal,
      count: items.filter((i) => i.itemType === "supplierMaterial").length,
      color: INVENTORY_CHART_COLORS[0],
      percentage: Math.round((materialVal / total) * 100),
    },
    {
      key: "Packaging",
      value: packagingVal,
      count: items.filter((i) => i.itemType === "supplierPackaging").length,
      color: INVENTORY_CHART_COLORS[1],
      percentage: Math.round((packagingVal / total) * 100),
    },
    {
      key: "Labels",
      value: labelsVal,
      count: items.filter((i) => i.itemType === "supplierLabel").length,
      color: INVENTORY_CHART_COLORS[2],
      percentage: Math.round((labelsVal / total) * 100),
    },
  ];
}

// ============================================================================
// CHART FORMATTING HELPERS
// ============================================================================

/**
 * Format Y-axis values as abbreviated currency
 * @param value - Numeric value
 * @returns Formatted string (e.g., "₹50k")
 */
export function formatChartCurrency(value: number): string {
  return `₹${(value / 1000).toFixed(0)}k`;
}

/**
 * Format legend label with value
 * @param name - Legend item name
 * @param value - Value to display
 * @returns Formatted legend string
 */
export function formatLegendWithValue(name: string, value: number): string {
  return `${name} (₹${(value / 1000).toFixed(0)}k)`;
}
