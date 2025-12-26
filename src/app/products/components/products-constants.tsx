// src/app/products/components/products-constants.tsx
import type { Product, ProductVariant } from "@/types/product-types";

// ============================================================================
// MOCK PRODUCTS - Single source of truth for seeding
// ============================================================================

export const PRODUCTS: Product[] = [
  {
    id: "product-1",
    name: "Premium Floor Cleaner",
    description:
      "High-performance floor cleaning solution for industrial and commercial use",
    recipeId: "recipe-1", // Premium Floor Cleaner recipe
    status: "active",
    shelfLife: 730, // 2 years
    tags: ["floor", "cleaner", "professional", "industrial"],
    createdAt: new Date().toISOString(),
    isRecipeVariant: false,
  },
  {
    id: "product-2",
    name: "Eco-Friendly Dish Soap",
    description:
      "Gentle yet effective dish cleaning formula with natural ingredients",
    recipeId: "recipe-2", // Eco-Friendly Dish Soap recipe
    status: "active",
    shelfLife: 365, // 1 year
    tags: ["dish", "soap", "eco-friendly", "natural"],
    createdAt: new Date().toISOString(),
    isRecipeVariant: false,
  },
  {
    id: "product-3",
    name: "Ultra Bleach Formula",
    description: "Professional-grade bleaching solution for tough stains",
    recipeId: "recipe-3", // Ultra Bleach Formula recipe
    status: "active",
    shelfLife: 180, // 6 months
    tags: ["bleach", "stain", "remover", "professional"],
    createdAt: new Date().toISOString(),
    isRecipeVariant: false,
  },
  {
    id: "product-4",
    name: "Kitchen Degreaser Pro",
    description: "Heavy-duty degreasing formulation for kitchen surfaces",
    recipeId: "recipe-4", // Kitchen Degreaser Pro recipe
    status: "active",
    shelfLife: 365, // 1 year
    tags: ["kitchen", "degreaser", "heavy-duty", "surfaces"],
    createdAt: new Date().toISOString(),
    isRecipeVariant: false,
  },
  {
    id: "product-5",
    name: "Glass Cleaner Streak-Free",
    description: "Professional glass and mirror cleaning solution",
    recipeId: "recipe-5", // Glass Cleaner Streak-Free recipe
    status: "active",
    shelfLife: 365, // 1 year
    tags: ["glass", "cleaner", "streak-free", "mirrors"],
    createdAt: new Date().toISOString(),
    isRecipeVariant: false,
  },
];

// ============================================================================
// MOCK PRODUCT VARIANTS - Different sizes and packaging for each product
// ============================================================================

export const PRODUCT_VARIANTS: ProductVariant[] = [
  // Premium Floor Cleaner variants
  {
    id: "variant-1-1",
    productId: "product-1",
    name: "5L Bottle",
    sku: "PFC-5L-001",
    fillQuantity: 5000,
    fillUnit: "ml",
    packagingSelectionId: "3", // 5L HDPE Container
    frontLabelSelectionId: "1", // Standard Sticker Label
    backLabelSelectionId: "2", // Premium Label Tag
    labelsPerUnit: 2,
    sellingPricePerUnit: 450,
    targetProfitMargin: 35,
    minimumProfitMargin: 20,
    distributionChannels: ["retail", "wholesale", "online"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "variant-1-2",
    productId: "product-1",
    name: "1L Bottle",
    sku: "PFC-1L-002",
    fillQuantity: 1000,
    fillUnit: "ml",
    packagingSelectionId: "8", // 750ml Glass Bottle (closest to 1L)
    frontLabelSelectionId: "1",
    backLabelSelectionId: "2",
    labelsPerUnit: 2,
    sellingPricePerUnit: 120,
    targetProfitMargin: 32,
    minimumProfitMargin: 18,
    distributionChannels: ["retail", "online"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "variant-1-3",
    productId: "product-1",
    name: "500ml Spray Bottle",
    sku: "PFC-500ML-003",
    fillQuantity: 500,
    fillUnit: "ml",
    packagingSelectionId: "4", // 250ml Spray Bottle (will use as 500ml)
    frontLabelSelectionId: "5", // Small Sticker
    backLabelSelectionId: "1",
    labelsPerUnit: 2,
    sellingPricePerUnit: 75,
    targetProfitMargin: 30,
    minimumProfitMargin: 15,
    distributionChannels: ["retail"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Eco-Friendly Dish Soap variants
  {
    id: "variant-2-1",
    productId: "product-2",
    name: "1L Bottle",
    sku: "EFDS-1L-001",
    fillQuantity: 1000,
    fillUnit: "ml",
    packagingSelectionId: "8", // 750ml Glass Bottle
    frontLabelSelectionId: "8", // Recyclable Label
    backLabelSelectionId: "2",
    labelsPerUnit: 2,
    sellingPricePerUnit: 180,
    targetProfitMargin: 40,
    minimumProfitMargin: 25,
    distributionChannels: ["retail", "online", "eco-stores"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "variant-2-2",
    productId: "product-2",
    name: "500ml Bottle",
    sku: "EFDS-500ML-002",
    fillQuantity: 500,
    fillUnit: "ml",
    packagingSelectionId: "1", // 500ml PET Bottle
    frontLabelSelectionId: "8",
    backLabelSelectionId: "5",
    labelsPerUnit: 2,
    sellingPricePerUnit: 95,
    targetProfitMargin: 38,
    minimumProfitMargin: 22,
    distributionChannels: ["retail", "online"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Ultra Bleach Formula variants
  {
    id: "variant-3-1",
    productId: "product-3",
    name: "2L Bottle",
    sku: "UBF-2L-001",
    fillQuantity: 2000,
    fillUnit: "ml",
    packagingSelectionId: "2", // 2L Glass Jar
    frontLabelSelectionId: "7", // Security Label
    backLabelSelectionId: "4", // Embossed Label
    labelsPerUnit: 2,
    sellingPricePerUnit: 220,
    targetProfitMargin: 45,
    minimumProfitMargin: 30,
    distributionChannels: ["retail", "wholesale", "industrial"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "variant-3-2",
    productId: "product-3",
    name: "1L Bottle",
    sku: "UBF-1L-002",
    fillQuantity: 1000,
    fillUnit: "ml",
    packagingSelectionId: "8", // 750ml Glass Bottle
    frontLabelSelectionId: "7",
    backLabelSelectionId: "4",
    labelsPerUnit: 2,
    sellingPricePerUnit: 125,
    targetProfitMargin: 42,
    minimumProfitMargin: 28,
    distributionChannels: ["retail", "online"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Kitchen Degreaser Pro variants
  {
    id: "variant-4-1",
    productId: "product-4",
    name: "5L Container",
    sku: "KDP-5L-001",
    fillQuantity: 5000,
    fillUnit: "ml",
    packagingSelectionId: "3", // 5L HDPE Container
    frontLabelSelectionId: "4", // Embossed Label
    backLabelSelectionId: "6", // Large Product Tag
    labelsPerUnit: 2,
    sellingPricePerUnit: 380,
    targetProfitMargin: 38,
    minimumProfitMargin: 25,
    distributionChannels: ["retail", "wholesale", "professional"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "variant-4-2",
    productId: "product-4",
    name: "1L Spray Bottle",
    sku: "KDP-1L-002",
    fillQuantity: 1000,
    fillUnit: "ml",
    packagingSelectionId: "4", // 250ml Spray Bottle (adapted)
    frontLabelSelectionId: "4",
    backLabelSelectionId: "2",
    labelsPerUnit: 2,
    sellingPricePerUnit: 95,
    targetProfitMargin: 35,
    minimumProfitMargin: 22,
    distributionChannels: ["retail", "online"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Glass Cleaner Streak-Free variants
  {
    id: "variant-5-1",
    productId: "product-5",
    name: "750ml Spray Bottle",
    sku: "GCSF-750ML-001",
    fillQuantity: 750,
    fillUnit: "ml",
    packagingSelectionId: "4", // 250ml Spray Bottle (adapted)
    frontLabelSelectionId: "3", // Custom Shape Tag
    backLabelSelectionId: "5",
    labelsPerUnit: 2,
    sellingPricePerUnit: 85,
    targetProfitMargin: 40,
    minimumProfitMargin: 25,
    distributionChannels: ["retail", "online", "professional"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "variant-5-2",
    productId: "product-5",
    name: "500ml Bottle",
    sku: "GCSF-500ML-002",
    fillQuantity: 500,
    fillUnit: "ml",
    packagingSelectionId: "1", // 500ml PET Bottle
    frontLabelSelectionId: "3",
    backLabelSelectionId: "5",
    labelsPerUnit: 2,
    sellingPricePerUnit: 65,
    targetProfitMargin: 38,
    minimumProfitMargin: 23,
    distributionChannels: ["retail", "online"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
