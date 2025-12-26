// src/utils/products/product-utils.ts

import type {
  ProductVariantCostAnalysis,
  ProductFormData,
  VariantFormData,
  ProductFormErrors,
} from "@/types/product-types";

// ============================================================================
// SKU GENERATION
// ============================================================================

/**
 * Generate a unique SKU for product variants
 * Format: VAR-{timestamp}
 *
 * @returns A unique SKU string
 */
export function generateSKU(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `VAR-${timestamp}`;
}

// ============================================================================
// MARGIN CALCULATIONS
// ============================================================================

/**
 * Calculate gross profit margin percentage
 *
 * @param sellingPrice - The price at which the product is sold
 * @param cost - The total cost to produce the product
 * @returns The gross profit margin as a percentage
 */
export function calculateMargin(sellingPrice: number, cost: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

/**
 * Determine margin health status based on thresholds
 *
 * @param margin - The current margin percentage
 * @param minimumMargin - The minimum acceptable margin (optional)
 * @returns Status: "healthy", "warning", or "critical"
 */
export function getMarginStatus(
  margin: number,
  minimumMargin?: number
): "healthy" | "warning" | "critical" {
  if (minimumMargin && margin < minimumMargin) return "critical";
  if (margin < 20) return "critical";
  if (margin < 30) return "warning";
  return "healthy";
}

/**
 * Get color classes for margin display based on health status
 *
 * @param margin - The current margin percentage
 * @param minimumMargin - The minimum acceptable margin (optional)
 * @returns Object with text and background color classes
 */
export function getMarginColors(margin: number, minimumMargin?: number) {
  const status = getMarginStatus(margin, minimumMargin);

  switch (status) {
    case "healthy":
      return {
        text: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950/20",
      };
    case "warning":
      return {
        text: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
      };
    case "critical":
      return {
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/20",
      };
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate product form data
 *
 * @param data - The product form data to validate
 * @returns Object containing validation errors (empty if valid)
 */
export function validateProductForm(
  data: Partial<ProductFormData>
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name?.trim()) {
    errors.name = "Product name is required";
  }

  if (!data.recipeId) {
    errors.recipeId = "Please select a recipe";
  }

  return errors;
}

/**
 * Validate variant form data
 *
 * @param data - The variant form data to validate
 * @returns Object containing validation errors (empty if valid)
 */
export function validateVariantForm(
  data: Partial<VariantFormData>
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name?.trim()) {
    errors.name = "Variant name is required";
  }

  if (!data.sku?.trim()) {
    errors.sku = "SKU is required";
  }

  if (!data.packagingSelectionId) {
    errors.packagingSelectionId = "Packaging selection is required";
  }

  if (data.sellingPricePerUnit !== undefined && data.sellingPricePerUnit <= 0) {
    errors.sellingPricePerUnit = "Selling price must be greater than 0";
  }

  return errors;
}

// ============================================================================
// COST ANALYSIS UTILITIES
// ============================================================================

/**
 * Generate cost breakdown array for visualization
 *
 * @param analysis - The complete cost analysis
 * @returns Array of cost components with percentages
 */
export function generateCostBreakdown(
  recipeCost: number,
  packagingCost: number,
  frontLabelCost: number,
  backLabelCost: number,
  totalCost: number
): ProductVariantCostAnalysis["costBreakdown"] {
  const breakdown: ProductVariantCostAnalysis["costBreakdown"] = [
    {
      component: "recipe",
      name: "Recipe/Formula",
      cost: recipeCost,
      percentage: (recipeCost / totalCost) * 100,
    },
    {
      component: "packaging",
      name: "Packaging",
      cost: packagingCost,
      percentage: (packagingCost / totalCost) * 100,
    },
  ];

  if (frontLabelCost > 0) {
    breakdown.push({
      component: "front_label",
      name: "Front Label",
      cost: frontLabelCost,
      percentage: (frontLabelCost / totalCost) * 100,
    });
  }

  if (backLabelCost > 0) {
    breakdown.push({
      component: "back_label",
      name: "Back Label",
      cost: backLabelCost,
      percentage: (backLabelCost / totalCost) * 100,
    });
  }

  return breakdown;
}

// ============================================================================
// DISPLAY FORMATTING
// ============================================================================

/**
 * Get status badge variant for shadcn/ui Badge component
 *
 * @param status - The product status
 * @returns Badge variant prop value
 */
export function getStatusBadgeVariant(
  status: "draft" | "active" | "discontinued"
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "discontinued":
      return "destructive";
  }
}
