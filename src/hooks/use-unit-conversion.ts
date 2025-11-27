// src/hooks/use-unit-conversion.ts
import type { CapacityUnit } from "@/lib/types";

// ============================================================================
// Centralized Unit Configuration
// ============================================================================
// BEST PRACTICE: Define a single source of truth for conversion logic.
// This makes the code easier to read, maintain, and extend (e.g., adding pounds/ounces).

const CONVERSION_FACTOR = 1000;

const UNIT_CONFIG = {
  // Mass Units
  kg: { base: "gm", type: "mass" },
  gm: { base: "gm", type: "mass" },
  g: { base: "gm", type: "mass" }, // Alias for gm

  // Volume Units
  L: { base: "ml", type: "volume" },
  ml: { base: "ml", type: "volume" },

  // Count Units
  pcs: { base: "pcs", type: "count" },
};

// ============================================================================
// CONSOLIDATED UNIT CONVERSION HELPERS
// ============================================================================
// Redundant functions like `convertToStandard`, `convertFromStandard`,
// `convertToDisplayUnit`, and `convertToBaseUnit` have been merged into two clear, generic functions.

/**
 * Converts a quantity from a larger unit (kg, L) to its smaller base unit (gm, ml).
 * If the unit is already a base unit, it returns the original quantity and unit.
 *
 * @example
 * // Returns { quantity: 5000, unit: 'gm' }
 * convertToBaseUnit(5, 'kg');
 * @example
 * // Returns { quantity: 100, unit: 'ml' }
 * convertToBaseUnit(100, 'ml');
 */
export function convertToBaseUnit(
  quantity: number,
  unit: CapacityUnit
): { quantity: number; unit: CapacityUnit } {
  const config = UNIT_CONFIG[unit];
  if (config && unit !== config.base) {
    return {
      quantity: quantity * CONVERSION_FACTOR,
      unit: config.base as CapacityUnit,
    };
  }
  return { quantity, unit };
}

/**
 * Converts a quantity from a smaller base unit (gm, ml) to its larger display unit (kg, L).
 * Ideal for showing human-readable values in the UI.
 *
 * @example
 * // Returns { quantity: 2.5, unit: 'kg' }
 * convertToDisplayUnit(2500, 'gm');
 * @example
 * // Returns { quantity: 5, unit: 'L' }
 * convertToDisplayUnit(5000, 'ml');
 */
export function convertToDisplayUnit(
  quantity: number,
  unit: CapacityUnit
): { quantity: number; unit: CapacityUnit } {
  const config = UNIT_CONFIG[unit];
  if (config && (config.type === "mass" || config.type === "volume")) {
    const displayUnit =
      (Object.keys(UNIT_CONFIG).find(
        (key) =>
          UNIT_CONFIG[key as CapacityUnit].base === config.base &&
          key !== config.base
      ) as CapacityUnit) || (config.base as CapacityUnit);

    if (unit === config.base) {
      return { quantity: quantity / CONVERSION_FACTOR, unit: displayUnit };
    }
  }
  return { quantity, unit };
}

/**
 * Normalizes any unit to a standard 'kg' value for consistent backend calculations and comparisons.
 * NOTE: This function has a different purpose than the base/display converters.
 */
export function normalizeToKg(quantity: number, unit: CapacityUnit): number {
  const conversions: Record<string, number> = {
    kg: 1,
    gm: 0.001,
    g: 0.001,
    L: 1, // Assumes density of ~1 kg/L for liquids
    ml: 0.001,
  };

  const conversionFactor = conversions[unit] ?? 1;
  return parseFloat((quantity * conversionFactor).toFixed(3));
}

// ============================================================================
// PRICING & FORMATTING HELPERS (Unchanged, but grouped for clarity)
// ============================================================================

/**
 * Calculates the price per single unit from a bulk price.
 */
export function calculateUnitPrice(
  bulkPrice: number,
  quantityForBulkPrice: number
): number {
  if (quantityForBulkPrice <= 0) return 0;
  return bulkPrice / quantityForBulkPrice;
}

/**
 * Calculates the final price of a single unit including tax.
 */
export function calculatePriceWithTax(unitPrice: number, tax: number): number {
  return unitPrice * (1 + tax / 100);
}

/**
 * Formats a quantity and its unit into a simple display string.
 */
export function formatQuantity(quantity: number, unit: CapacityUnit): string {
  return `${quantity} ${unit}`;
}

// Convert batch units (L/kg) back to variant units (mL/g) for storage
export const convertToVariantUnit = (
  quantity: number,
  unit: string
): { quantity: number; unit: string } => {
  if (unit === "L") return { quantity: quantity * 1000, unit: "ml" };
  if (unit === "kg") return { quantity: quantity * 1000, unit: "gm" };
  return { quantity, unit };
};

// Calculate units based on variant capacity and batch quantity
export const calculateUnits = (
  variantFillQty: number,
  variantUnit: CapacityUnit,
  batchTotalQty: number,
  batchUnit: CapacityUnit
): number => {
  const variantCapacityInKg = normalizeToKg(variantFillQty, variantUnit);
  const batchQtyInKg = normalizeToKg(batchTotalQty, batchUnit);
  return variantCapacityInKg > 0
    ? Math.round(batchQtyInKg / variantCapacityInKg)
    : 0;
};
// ============================================================================
// EXPORTED UTILITY OBJECT
// ============================================================================
// BEST PRACTICE: Export functions in a plain object instead of a custom hook
// when they don't rely on React's state or lifecycle. This makes their purpose clearer.

export const unitUtils = {
  convertToBaseUnit,
  convertToDisplayUnit,
  normalizeToKg,
  calculateUnitPrice,
  convertToVariantUnit,
  calculateUnits,
  calculatePriceWithTax,
  formatQuantity,
};
