// src/utils/chart-utils.ts
// Consolidated chart utilities for consistent chart display across the application

import { CHART_COLORS } from "@/utils/color-utils";
import type { InventoryItemWithDetails } from "@/types/inventory-types";

// ============================================================================
// CHART COLOR SCHEMES
// ============================================================================

/**
 * Standard color schemes for different chart types
 */
export const CHART_COLOR_SCHEMES = {
  // Default sequential colors
  default: [
    CHART_COLORS.light.chart1,
    CHART_COLORS.light.chart2,
    CHART_COLORS.light.chart3,
    CHART_COLORS.light.chart4,
    CHART_COLORS.light.chart5,
  ],

  // Inventory-specific colors
  inventory: [
    CHART_COLORS.light.chart1, // Materials - Blue
    CHART_COLORS.light.chart5, // Packaging - Green
    CHART_COLORS.light.chart4, // Labels - Yellow
  ],

  // Materials categories
  materials: [
    "#ef4444", // acids - red
    "#3b82f6", // bases - blue
    "#a855f7", // colors - purple
    "#06b6d4", // salts - cyan
    "#10b981", // thickeners - green
    "#6b7280", // other - gray
  ],

  // Status colors
  status: {
    success: "#10b981", // green
    warning: "#f59e0b", // amber
    error: "#ef4444", // red
    info: "#3b82f6", // blue
  },
} as const;

// ============================================================================
// TOOLTIP CONFIGURATIONS
// ============================================================================

/**
 * Standard tooltip style for all charts
 * Ensures consistent appearance across dashboard
 */
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  padding: "8px 12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  fontSize: "12px",
  fontFamily: "var(--font-sans)",
} as const;

/**
 * Standard tooltip item style
 */
export const CHART_TOOLTIP_ITEM_STYLE = {
  color: "hsl(var(--foreground))",
  fontSize: "12px",
  margin: "2px 0",
} as const;

/**
 * Standard tooltip label style
 */
export const CHART_TOOLTIP_LABEL_STYLE = {
  color: "hsl(var(--muted-foreground))",
  fontSize: "11px",
  fontWeight: 500,
} as const;

// ============================================================================
// LEGEND CONFIGURATIONS
// ============================================================================

/**
 * Standard legend configuration for charts
 */
export const CHART_LEGEND_CONFIG = {
  wrapperStyle: {
    padding: "8px 0",
    fontSize: "12px",
    fontFamily: "var(--font-sans)",
  },
  iconType: "circle" as const,
  align: "center" as const,
  verticalAlign: "bottom" as const,
} as const;

// ============================================================================
// VALUE FORMATTERS
// ============================================================================

/**
 * Formats chart values consistently based on type
 * @param value - Numeric value to format
 * @param type - Type of formatting to apply
 * @returns Formatted string
 */
export function formatChartValue(
  value: number,
  type: "currency" | "percentage" | "number" | "compact" = "number"
): string {
  switch (type) {
    case "currency":
      return formatChartCurrency(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "compact":
      return formatCompactChartValue(value);
    case "number":
    default:
      return value.toLocaleString();
  }
}

/**
 * Formats currency values for charts with abbreviated notation
 * @param value - Currency value
 * @returns Formatted currency string (e.g., "₹50k")
 */
export function formatChartCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toFixed(0)}`;
}

/**
 * Formats compact values for chart axes and labels
 * @param value - Numeric value
 * @returns Compact formatted string
 */
export function formatCompactChartValue(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

/**
 * Formats percentage values for charts
 * @param value - Percentage value (as decimal, e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatChartPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================================================
// CHART DATA PREPARATION HELPERS
// ============================================================================

/**
 * Calculates percentage distribution for pie/bar charts
 * @param data - Array of data objects with value property
 * @returns Array with added percentage property
 */
export function addPercentageToChartData<T extends { value: number }>(
  data: T[]
): (T & { percentage: number })[] {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));
}

/**
 * Sorts chart data by value in descending order
 * @param data - Array of chart data
 * @param valueKey - Key to sort by (default: 'value')
 * @returns Sorted array
 */
export function sortChartDataByValue<T>(
  data: T[],
  valueKey: keyof T = "value" as keyof T
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[valueKey] as number;
    const bVal = b[valueKey] as number;
    return bVal - aVal;
  });
}

/**
 * Limits chart data to top N items, aggregating others as "Others"
 * @param data - Array of chart data
 * @param topN - Number of top items to keep
 * @param labelKey - Key for item labels
 * @param valueKey - Key for item values
 * @returns Limited data array
 */
export function limitChartData<T>(
  data: T[],
  topN: number,
  labelKey: keyof T = "name" as keyof T,
  valueKey: keyof T = "value" as keyof T
): T[] {
  if (data.length <= topN) return data;

  const sorted = sortChartDataByValue(data, valueKey);
  const topItems = sorted.slice(0, topN);
  const others = sorted.slice(topN);

  const othersTotal = others.reduce((sum, item) => {
    const value = item[valueKey] as number;
    return sum + value;
  }, 0);

  if (othersTotal > 0) {
    const othersItem = {
      [labelKey]: "Others",
      [valueKey]: othersTotal,
    } as T;

    return [...topItems, othersItem];
  }

  return topItems;
}

// ============================================================================
// AXIS & GRID CONFIGURATIONS
// ============================================================================

/**
 * Standard X-axis configuration for charts
 */
export const CHART_XAXIS_CONFIG = {
  axisLine: { stroke: "hsl(var(--border))" },
  tickLine: { stroke: "hsl(var(--border))" },
  tick: {
    fill: "hsl(var(--foreground))",
    fontSize: 12,
    fontFamily: "var(--font-sans)",
  },
} as const;

/**
 * Standard Y-axis configuration for charts
 */
export const CHART_YAXIS_CONFIG = {
  axisLine: { stroke: "hsl(var(--border))" },
  tickLine: { stroke: "hsl(var(--border))" },
  tick: {
    fill: "hsl(var(--foreground))",
    fontSize: 12,
    fontFamily: "var(--font-sans)",
  },
} as const;

/**
 * Standard grid configuration for charts
 */
export const CHART_GRID_CONFIG = {
  strokeDasharray: "3 3",
  stroke: "hsl(var(--border))",
} as const;

// ============================================================================
// RESPONSIVE CHART CONFIGS
// ============================================================================

/**
 * Responsive container configuration
 */
export const CHART_RESPONSIVE_CONFIG = {
  width: "100%",
  height: 300,
  minWidth: 300,
} as const;

/**
 * Standard margin configuration for charts
 */
export const CHART_MARGIN_CONFIG = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 20,
} as const;

// ============================================================================
// CHART TYPE SPECIFIC HELPERS
// ============================================================================

/**
 * Standard bar chart configuration
 */
export const BAR_CHART_CONFIG = {
  radius: [4, 4, 0, 0] as [number, number, number, number],
  maxBarSize: 60,
} as const;

/**
 * Standard pie chart configuration
 */
export const PIE_CHART_CONFIG = {
  innerRadius: 0,
  outerRadius: 80,
  paddingAngle: 2,
  cornerRadius: 4,
} as const;

/**
 * Standard line chart configuration
 */
export const LINE_CHART_CONFIG = {
  strokeWidth: 3,
  dot: { fill: "hsl(var(--background))", strokeWidth: 2, r: 4 },
  activeDot: { r: 6, strokeWidth: 0 },
} as const;

// ============================================================================
// INVENTORY-SPECIFIC CHART HELPERS
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

/**
 * Format legend label with value
 * @param name - Legend item name
 * @param value - Value to display
 * @returns Formatted legend string
 */
export function formatLegendWithValue(name: string, value: number): string {
  return `${name} (₹${(value / 1000).toFixed(0)}k)`;
}
