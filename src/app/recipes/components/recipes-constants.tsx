// recipe-constants.ts

import { Recipe } from "@/lib/types";
import { CAPACITY_UNITS } from "@/lib/constants";
import { CapacityUnit } from "@/lib/types";

/**
 * Converts a quantity in a specific unit to the base unit (kilograms).
 * This is essential for calculating the total batch cost based on Material costPerKg.
 */
export function convertToKilograms(
  quantity: number,
  unit: CapacityUnit
): number {
  const unitDef = CAPACITY_UNITS.find((u) => u.value === unit);
  if (!unitDef) {
    console.error(`Unknown unit: ${unit}. Defaulting to kg.`);
    return quantity; // Default to 1 (kg)
  }
  return quantity * unitDef.factor;
}

// Default unit for new ingredients
export const DEFAULT_INGREDIENT_UNIT: CapacityUnit = "gm";

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
        quantity: 350,
        createdAt: "2024-01-10",
      },
      {
        id: "1-2", // Unique ID
        supplierMaterialId: "7",
        quantity: 350,
        createdAt: "",
      },
      {
        id: "1-3", // Unique ID
        supplierMaterialId: "8",
        quantity: 220,
        createdAt: "",
      },
      {
        id: "1-4", // Unique ID
        supplierMaterialId: "2",
        quantity: 80,
        createdAt: "",
      },
      {
        id: "1-5", // Unique ID
        supplierMaterialId: "4",
        quantity: 18,
        createdAt: "",
      },
      {
        id: "1-6", // Unique ID
        supplierMaterialId: "9",
        quantity: 25,
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
        quantity: 150,
        createdAt: "",
      },
      {
        id: "2-2", // Corrected ID
        supplierMaterialId: "4",
        quantity: 50,
        createdAt: "",
      },
      {
        id: "2-3", // Corrected ID
        supplierMaterialId: "2",
        quantity: 120,
        createdAt: "",
      },
      {
        id: "2-4", // Corrected ID
        supplierMaterialId: "1",
        quantity: 1000,
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
        quantity: 100,
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
        quantity: 200,
        createdAt: "",
      },
      {
        id: "4-2", // Added ID
        supplierMaterialId: "8",
        quantity: 150,
        createdAt: "",
      },
      {
        id: "4-3", // Added ID
        supplierMaterialId: "9",
        quantity: 80,
        createdAt: "",
      },
    ],
    costPerKg: 100,
    targetProfitMargin: 35,
    status: "active",
    createdAt: "2024-01-18",
  },
];

// AI Insights (using hardcoded data as requested)
export const recipesAIInsights = [
  {
    type: "optimization",
    title: "Recipe Optimization",
    description:
      "Reducing NaCl by 5% could save ₹12,000/month without quality loss",
    impact: "High" as const,
    confidence: 91,
  },
  {
    type: "pricing",
    title: "Pricing Strategy",
    description:
      "Floor Cleaner price increase to ₹48/kg could boost margins by 8%",
    impact: "Medium" as const,
    confidence: 84,
  },
  {
    type: "demand",
    title: "Demand Forecasting",
    description: "Glass Cleaner demand expected to rise 15% next quarter",
    impact: "High" as const,
    confidence: 88,
  },
  {
    type: "quality",
    title: "Quality Enhancement",
    description:
      "Adding premium ingredients could increase customer satisfaction by 12%",
    impact: "Medium" as const,
    confidence: 76,
  },
];
