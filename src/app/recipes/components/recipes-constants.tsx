// recipes-constants.tsx
// Mock data aligned with new type system

import type { Recipe, RecipeIngredient, RecipeVariant } from "@/lib/types";

// ============================================================================
// MOCK RECIPES
// ============================================================================

export const RECIPES: Recipe[] = [
  {
    id: "recipe-1",
    name: "Premium Floor Cleaner",
    description: "High-performance floor cleaning solution",
    totalWeight: 1000, // 1000g = 1kg batch
    targetCostPerKg: 70,
    status: "active",
    version: 2,
    instructions: "Mix ingredients in order, heat to 40°C, stir for 20 minutes",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "recipe-2",
    name: "Eco-Friendly Dish Soap",
    description: "Gentle yet effective dish cleaning formula",
    totalWeight: 1000,
    targetCostPerKg: 80,
    status: "testing",
    version: 1,
    instructions: "Combine surfactants first, then add fragrances slowly",
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-25T11:00:00Z",
  },
  {
    id: "recipe-3",
    name: "Ultra Bleach Formula",
    description: "Professional-grade bleaching solution",
    totalWeight: 1000,
    targetCostPerKg: 40,
    status: "active",
    version: 5,
    instructions: "Mix carefully in ventilated area, monitor temperature",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-28T16:00:00Z",
  },
  {
    id: "recipe-4",
    name: "Kitchen Degreaser Pro",
    description: "Heavy-duty degreasing formulation",
    totalWeight: 1000,
    targetCostPerKg: 95,
    status: "active",
    version: 3,
    instructions: "Heat mixture to 50°C, stir continuously for 15 minutes",
    createdAt: "2024-01-18T13:00:00Z",
    updatedAt: "2024-01-26T10:00:00Z",
  },
  {
    id: "recipe-5",
    name: "Glass Cleaner Streak-Free",
    description: "Professional glass and mirror cleaning solution",
    totalWeight: 1000,
    targetCostPerKg: 60,
    status: "draft",
    version: 1,
    instructions: "Mix solvents first, add surfactants slowly with stirring",
    createdAt: "2024-01-28T15:00:00Z",
  },
];

// ============================================================================
// MOCK RECIPE INGREDIENTS
// ============================================================================

export const RECIPE_INGREDIENTS: RecipeIngredient[] = [
  // Recipe 1: Premium Floor Cleaner (1000g batch)
  {
    id: "ing-1-1",
    recipeId: "recipe-1",
    supplierMaterialId: "6", // NaCl - ₹6/kg from Eastern Suppliers
    quantity: 350,
    unit: "gm",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "ing-1-2",
    recipeId: "recipe-1",
    supplierMaterialId: "7", // Soda Ash - ₹39/kg
    quantity: 350,
    unit: "gm",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "ing-1-3",
    recipeId: "recipe-1",
    supplierMaterialId: "3", // Citric Acid - ₹93/kg
    quantity: 220,
    unit: "gm",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "ing-1-4",
    recipeId: "recipe-1",
    supplierMaterialId: "4", // Acid Blue Color - ₹1600/kg
    quantity: 80,
    unit: "gm",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
    // Price locked example
    lockedPricing: {
      unitPrice: 1550,
      tax: 5,
      lockedAt: new Date("2024-01-15T12:00:00Z"),
      reason: "cost_analysis",
      notes: "Locked during quarterly review",
    },
  },

  // Recipe 2: Eco-Friendly Dish Soap (1000g batch)
  {
    id: "ing-2-1",
    recipeId: "recipe-2",
    supplierMaterialId: "5", // AOS Powder - ₹148/kg
    quantity: 150,
    unit: "gm",
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-20T14:00:00Z",
    // Price locked example
    lockedPricing: {
      unitPrice: 140,
      tax: 8,
      lockedAt: new Date("2024-01-20T14:00:00Z"),
      reason: "other",
      notes: "Locked during supplier negotiation",
    },
  },
  {
    id: "ing-2-2",
    recipeId: "recipe-2",
    supplierMaterialId: "2", // Caustic Soda - ₹57/kg
    quantity: 50,
    unit: "gm",
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-12T09:00:00Z",
  },
  {
    id: "ing-2-3",
    recipeId: "recipe-2",
    supplierMaterialId: "3", // Citric Acid - ₹93/kg
    quantity: 120,
    unit: "gm",
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-12T09:00:00Z",
  },
  {
    id: "ing-2-4",
    recipeId: "recipe-2",
    supplierMaterialId: "4", // Acid Blue Color
    quantity: 10,
    unit: "gm",
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-12T09:00:00Z",
  },

  // Recipe 3: Ultra Bleach Formula (1000g batch)
  {
    id: "ing-3-1",
    recipeId: "recipe-3",
    supplierMaterialId: "1", // Acid Slurry - ₹117/kg
    quantity: 500,
    unit: "gm",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-28T16:00:00Z",
    // Price locked example
    lockedPricing: {
      unitPrice: 110,
      tax: 12,
      lockedAt: new Date("2024-01-28T16:00:00Z"),
      reason: "quote",
      notes: "Locked based on supplier quote",
    },
  },
  {
    id: "ing-3-2",
    recipeId: "recipe-3",
    supplierMaterialId: "6", // NaCl - ₹6/kg
    quantity: 300,
    unit: "gm",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-05T08:00:00Z",
  },
  {
    id: "ing-3-3",
    recipeId: "recipe-3",
    supplierMaterialId: "7", // Soda Ash - ₹39/kg
    quantity: 200,
    unit: "gm",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-05T08:00:00Z",
  },

  // Recipe 4: Kitchen Degreaser Pro (1000g batch)
  {
    id: "ing-4-1",
    recipeId: "recipe-4",
    supplierMaterialId: "2", // Caustic Soda - ₹57/kg
    quantity: 400,
    unit: "gm",
    createdAt: "2024-01-18T13:00:00Z",
    updatedAt: "2024-01-18T13:00:00Z",
  },
  {
    id: "ing-4-2",
    recipeId: "recipe-4",
    supplierMaterialId: "5", // AOS Powder - ₹148/kg
    quantity: 300,
    unit: "gm",
    createdAt: "2024-01-18T13:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
    // Price locked example
    lockedPricing: {
      unitPrice: 135,
      tax: 5,
      lockedAt: new Date("2024-01-25T10:00:00Z"),
      reason: "other",
      notes: "Locked for bulk purchase agreement",
    },
  },
  {
    id: "ing-4-3",
    recipeId: "recipe-4",
    supplierMaterialId: "7", // Soda Ash - ₹39/kg
    quantity: 250,
    unit: "gm",
    createdAt: "2024-01-18T13:00:00Z",
    updatedAt: "2024-01-18T13:00:00Z",
  },
  {
    id: "ing-4-4",
    recipeId: "recipe-4",
    supplierMaterialId: "3", // Citric Acid - ₹93/kg
    quantity: 50,
    unit: "gm",
    createdAt: "2024-01-18T13:00:00Z",
    updatedAt: "2024-01-18T13:00:00Z",
  },

  // Recipe 5: Glass Cleaner (1000g batch)
  {
    id: "ing-5-1",
    recipeId: "recipe-5",
    supplierMaterialId: "1", // Acid Slurry - ₹117/kg
    quantity: 200,
    unit: "gm",
    createdAt: "2024-01-28T15:00:00Z",
    updatedAt: "2024-01-28T15:00:00Z",
  },
  {
    id: "ing-5-2",
    recipeId: "recipe-5",
    supplierMaterialId: "6", // NaCl - ₹6/kg
    quantity: 100,
    unit: "gm",
    createdAt: "2024-01-28T15:00:00Z",
    updatedAt: "2024-01-28T15:00:00Z",
  },
  {
    id: "ing-5-3",
    recipeId: "recipe-5",
    supplierMaterialId: "4", // Acid Blue Color
    quantity: 5,
    unit: "gm",
    createdAt: "2024-01-28T15:00:00Z",
    updatedAt: "2024-01-28T15:00:00Z",
  },
];

// ============================================================================
// MOCK RECIPE VARIANTS
// ============================================================================

export const RECIPE_VARIANTS: RecipeVariant[] = [
  {
    id: "variant-1",
    originalRecipeId: "recipe-1",
    name: "Cost Optimized v1",
    description: "Reduced NaCl by 10% to achieve cost savings",
    ingredientIds: ["ing-1-1-mod", "ing-1-2", "ing-1-3", "ing-1-4"], // Modified ingredient
    optimizationGoal: "cost_reduction",
    isActive: true,
    changes: [
      {
        type: "quantity_change",
        ingredientName: "NaCl",
        oldValue: 350,
        newValue: 315,
        reason: "Cost optimization without quality impact",
        changedAt: new Date("2024-01-15T10:00:00Z"),
      },
    ],
    notes:
      "Achieved 8.5% cost reduction while maintaining cleaning performance",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "variant-2",
    originalRecipeId: "recipe-1",
    name: "Quality Enhanced v1",
    description: "Increased thickener for better viscosity",
    ingredientIds: ["ing-1-1", "ing-1-2", "ing-1-3-mod", "ing-1-4"],
    optimizationGoal: "quality_improvement",
    isActive: false,
    changes: [
      {
        type: "quantity_change",
        ingredientName: "Citric Acid",
        oldValue: 220,
        newValue: 250,
        reason: "Improved cleaning performance",
        changedAt: new Date("2024-01-20T14:00:00Z"),
      },
    ],
    notes: "Enhanced quality but cost increased by 2.3%",
    createdAt: "2024-01-20T14:00:00Z",
    updatedAt: "2024-01-20T14:00:00Z",
  },
  {
    id: "variant-3",
    originalRecipeId: "recipe-2",
    name: "Supplier Diversification v1",
    description: "Switched to alternative supplier for AOS Powder",
    ingredientIds: ["ing-2-1-alt", "ing-2-2", "ing-2-3", "ing-2-4"],
    optimizationGoal: "supplier_diversification",
    isActive: true,
    changes: [
      {
        type: "supplier_change",
        ingredientName: "AOS Powder",
        oldValue: "Global Chemicals",
        newValue: "ColorTech",
        reason: "Better pricing and reliability",
        changedAt: new Date("2024-01-18T11:00:00Z"),
      },
    ],
    notes: "Reduced dependency on single supplier, saved 5.2%",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
  },
];

// ============================================================================
// AI INSIGHTS (Mock data for demonstration)
// ============================================================================

export const recipesAIInsights = [
  {
    type: "optimization",
    title: "Recipe Optimization Opportunity",
    description:
      "Reducing NaCl by 5% in Premium Floor Cleaner could save ₹12,000/month without quality loss",
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
      "Adding premium surfactants could increase customer satisfaction by 12%",
    impact: "Medium" as const,
    confidence: 76,
  },
];
