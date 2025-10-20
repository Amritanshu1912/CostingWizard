// recipe-constants.ts

import { Recipe } from "@/lib/types";

/**
 * Defines the available units for ingredients and their conversion factors
 * to the base unit (kilogram: kg).
 * * Conversion Recipe: quantity_in_kg = quantity_input * conversionFactor
 */
export const INGREDIENT_UNITS = [
  { value: "kg", label: "Kilograms (kg)", factor: 1 },
  { value: "g", label: "Grams (g)", factor: 0.001 },
  { value: "L", label: "Litres (L)", factor: 1 }, // Assuming 1L = 1kg (density of water) for simplicity
  { value: "mL", label: "Millilitres (mL)", factor: 0.001 }, // Assuming 1mL = 1g
] as const;

export type IngredientUnitValue = (typeof INGREDIENT_UNITS)[number]["value"];

/**
 * Converts a quantity in a specific unit to the base unit (kilograms).
 * This is essential for calculating the total batch cost based on Material costPerKg.
 * * @param quantity The amount of the ingredient.
 * @param unit The unit of measure (e.g., 'g', 'L').
 * @returns The converted quantity in Kilograms (kg).
 */
export function convertToKilograms(
  quantity: number,
  unit: IngredientUnitValue
): number {
  const unitDef = INGREDIENT_UNITS.find((u) => u.value === unit);
  if (!unitDef) {
    console.error(`Unknown unit: ${unit}. Defaulting to kg.`);
    return quantity; // Default to 1 (kg)
  }
  return quantity * unitDef.factor;
}

// Default unit for new ingredients
export const DEFAULT_INGREDIENT_UNIT: IngredientUnitValue = "kg";

// Sample recipes data - in real app this would come from API
export const RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Premium Floor Cleaner",
    description: "High-performance floor cleaning solution",
    ingredients: [
      // Ingredients kept in 'kg' as they appear to be solids/powders
      {
        id: "1-1", // Unique ID
        supplierMaterialId: "6",
        quantity: 0.35,
        createdAt: "2024-01-10",
      },
      {
        id: "1-2", // Unique ID
        supplierMaterialId: "7",
        quantity: 0.25,
        createdAt: "",
      },
      {
        id: "1-3", // Unique ID
        supplierMaterialId: "8",
        quantity: 0.22,
        createdAt: "",
      },
      {
        id: "1-4", // Unique ID
        supplierMaterialId: "2",
        quantity: 0.08,
        createdAt: "",
      },
      {
        id: "1-5", // Unique ID
        supplierMaterialId: "4",
        quantity: 0.018,
        createdAt: "",
      },
      {
        id: "1-6", // Unique ID
        supplierMaterialId: "9",
        quantity: 0.025,
        createdAt: "",
      },
    ],
    costPerKg: 75,
    targetProfitMargin: 30,
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Bathroom Cleaner Pro",
    description: "Powerful bathroom cleaning recipe",
    ingredients: [
      {
        id: "2-1", // Corrected ID
        supplierMaterialId: "5",
        quantity: 0.15,
        createdAt: "",
      },
      {
        id: "2-2", // Corrected ID
        supplierMaterialId: "4",
        quantity: 0.05,
        createdAt: "",
      },
      {
        id: "2-3", // Corrected ID
        supplierMaterialId: "2",
        quantity: 0.12,
        createdAt: "",
      },
      {
        id: "2-4", // Corrected ID
        supplierMaterialId: "1",
        quantity: 1,
        createdAt: "",
      },
    ],
    costPerKg: 80,
    targetProfitMargin: 35,
    status: "active",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    name: "Glass Cleaner",
    description: "Streak-free glass cleaning solution",
    ingredients: [
      {
        id: "3-1", // Added ID
        supplierMaterialId: "2",
        quantity: 0.1,
        createdAt: "",
      },
      {
        id: "3-2", // Added ID
        supplierMaterialId: "6",
        quantity: 50,
        createdAt: "",
      },
      {
        id: "3-3", // Added ID
        supplierMaterialId: "1",
        quantity: 2,
        createdAt: "",
      },
    ],
    status: "active",
    targetProfitMargin: 32,
    createdAt: "2024-01-15",
    costPerKg: 90,
  },
  {
    id: "4",
    name: "Kitchen Degreaser",
    description: "Heavy-duty kitchen cleaning solution",
    ingredients: [
      {
        id: "4-1", // Added ID
        supplierMaterialId: "4",
        quantity: 0.2,
        createdAt: "",
      },
      {
        id: "4-2", // Added ID
        supplierMaterialId: "8",
        quantity: 0.15,
        createdAt: "",
      },
      {
        id: "4-3", // Added ID
        supplierMaterialId: "9",
        quantity: 0.08,
        createdAt: "",
      },
    ],
    costPerKg: 100,
    targetProfitMargin: 35,
    status: "active",
    createdAt: "2024-01-18",
  },
];
