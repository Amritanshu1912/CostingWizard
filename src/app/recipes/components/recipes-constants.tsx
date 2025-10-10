// recipe-constants.ts

export const CHART_COLORS = {
  light: {
    chart1: "#5A9BD8", // ocean blue — calm + clear
    chart2: "#7ED8C3", // seafoam green — fresh + soft
    chart3: "#F5D49B", // sandy beige — warm neutral
    chart4: "#F4A18E", // coral accent — gentle pop
    chart5: "#4CB1A2", // teal — grounding tone
  },
  dark: {
    chart1: "#6CB8F0", // bright ocean blue
    chart2: "#8FE3CF", // misty green foam
    chart3: "#F7DFAE", // light sand glow
    chart4: "#F89F8C", // warm coral
    chart5: "#5ED1C1", // cool teal
  },
} as const;

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

// Analytics data for Recipes page
export const costTrends = [
  { month: "Jan", rawMaterials: 125000, production: 89000, total: 214000 },
  { month: "Feb", rawMaterials: 132000, production: 92000, total: 224000 },
  { month: "Mar", rawMaterials: 128000, production: 88000, total: 216000 },
  { month: "Apr", rawMaterials: 145000, production: 95000, total: 240000 },
  { month: "May", rawMaterials: 152000, production: 98000, total: 250000 },
  { month: "Jun", rawMaterials: 148000, production: 96000, total: 244000 },
];

export const qualityMetrics = [
  { month: "Jan", defectRate: 2.1, customerSatisfaction: 94, returnRate: 1.2 },
  { month: "Feb", defectRate: 1.8, customerSatisfaction: 95, returnRate: 1.0 },
  { month: "Mar", defectRate: 2.3, customerSatisfaction: 93, returnRate: 1.4 },
  { month: "Apr", defectRate: 1.5, customerSatisfaction: 96, returnRate: 0.8 },
  { month: "May", defectRate: 1.9, customerSatisfaction: 95, returnRate: 1.1 },
  { month: "Jun", defectRate: 1.6, customerSatisfaction: 97, returnRate: 0.9 },
];

export const productProfitability = [
  {
    name: "Floor Cleaner",
    margin: 32.5,
    revenue: 125000,
    trend: "up",
  },
  {
    name: "Toilet Cleaner",
    margin: 28.8,
    revenue: 98000,
    trend: "up",
  },
  {
    name: "Glass Cleaner",
    margin: 35.2,
    revenue: 76000,
    trend: "down",
  },
  {
    name: "Dish Soap",
    margin: 24.1,
    revenue: 145000,
    trend: "up",
  },
];

export const recipesAIInsights = [
  {
    type: "optimization",
    title: "Recipe Optimization",
    description:
      "Reducing NaCl by 5% could save ₹12,000/month without quality loss",
    impact: "High",
    confidence: 91,
  },
  {
    type: "pricing",
    title: "Pricing Strategy",
    description:
      "Floor Cleaner price increase to ₹48/kg could boost margins by 8%",
    impact: "Medium",
    confidence: 84,
  },
  {
    type: "demand",
    title: "Demand Forecasting",
    description: "Glass Cleaner demand expected to rise 15% next quarter",
    impact: "High",
    confidence: 88,
  },
  {
    type: "quality",
    title: "Quality Enhancement",
    description:
      "Adding premium ingredients could increase customer satisfaction by 12%",
    impact: "Medium",
    confidence: 76,
  },
];

export const recipesPerformanceMetrics = [
  {
    metric: "Profit Margin",
    value: 32,
    target: 30,
    status: "good",
  },
  {
    metric: "Quality Score",
    value: 95,
    target: 90,
    status: "excellent",
  },
  {
    metric: "Cost Efficiency",
    value: 88,
    target: 85,
    status: "good",
  },
  {
    metric: "Customer Satisfaction",
    value: 94,
    target: 92,
    status: "excellent",
  },
];

export const recipesBenchmarkData = [
  { metric: "Profit Margin", yours: 32, industry: 28 },
  { metric: "Quality", yours: 95, industry: 87 },
  { metric: "Efficiency", yours: 88, industry: 82 },
  { metric: "Satisfaction", yours: 94, industry: 89 },
];

// New mock data for recipe analytics charts
export const recipeFinancialOverview = [
  {
    name: "Floor Cleaner",
    costPerKg: 28.5,
    sellingPricePerKg: 42.0,
    profitPerKg: 13.5,
  },
  {
    name: "Toilet Cleaner",
    costPerKg: 32.2,
    sellingPricePerKg: 45.0,
    profitPerKg: 12.8,
  },
  {
    name: "Glass Cleaner",
    costPerKg: 25.8,
    sellingPricePerKg: 38.0,
    profitPerKg: 12.2,
  },
  {
    name: "Dish Soap",
    costPerKg: 35.9,
    sellingPricePerKg: 48.0,
    profitPerKg: 12.1,
  },
  {
    name: "Laundry Detergent",
    costPerKg: 22.5,
    sellingPricePerKg: 35.0,
    profitPerKg: 12.5,
  },
];

export const recipeProfitMargins = [
  { recipe: "Floor Cleaner", margin: 32.5 },
  { recipe: "Toilet Cleaner", margin: 28.8 },
  { recipe: "Glass Cleaner", margin: 35.2 },
  { recipe: "Dish Soap", margin: 24.1 },
  { recipe: "Laundry Detergent", margin: 35.7 },
];

export const ingredientCostDistribution = [
  { name: "Floor Cleaner", value: 35, cost: 12500 },
  { name: "Toilet Cleaner", value: 25, cost: 8900 },
  { name: "Glass Cleaner", value: 20, cost: 7100 },
  { name: "Dish Soap", value: 15, cost: 5300 },
  { name: "Laundry Detergent", value: 5, cost: 1770 },
];

export const recipeCostTrends = [
  {
    month: "Jan",
    "Floor Cleaner": 28.5,
    "Toilet Cleaner": 32.2,
    "Glass Cleaner": 25.8,
  },
  {
    month: "Feb",
    "Floor Cleaner": 29.1,
    "Toilet Cleaner": 31.8,
    "Glass Cleaner": 26.2,
  },
  {
    month: "Mar",
    "Floor Cleaner": 28.8,
    "Toilet Cleaner": 32.5,
    "Glass Cleaner": 25.5,
  },
  {
    month: "Apr",
    "Floor Cleaner": 28.2,
    "Toilet Cleaner": 32.0,
    "Glass Cleaner": 26.0,
  },
  {
    month: "May",
    "Floor Cleaner": 28.7,
    "Toilet Cleaner": 32.3,
    "Glass Cleaner": 25.9,
  },
  {
    month: "Jun",
    "Floor Cleaner": 28.4,
    "Toilet Cleaner": 31.9,
    "Glass Cleaner": 26.1,
  },
];

export const costVsProfitData = [
  { costPerKg: 22.5, profitMargin: 35.7, recipe: "Laundry Detergent" },
  { costPerKg: 25.8, profitMargin: 35.2, recipe: "Glass Cleaner" },
  { costPerKg: 28.5, profitMargin: 32.5, recipe: "Floor Cleaner" },
  { costPerKg: 32.2, profitMargin: 28.8, recipe: "Toilet Cleaner" },
  { costPerKg: 35.9, profitMargin: 24.1, recipe: "Dish Soap" },
];
