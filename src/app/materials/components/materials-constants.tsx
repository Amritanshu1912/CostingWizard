// src/app/materials/components/materials-constants.tsx
import { Material, SupplierMaterial } from "@/types/material-types";

// Default Forms
export const DEFAULT_MATERIAL_FORM = {
  supplierId: "",
  materialName: "",
  materialCategory: "",
  materialId: "",
  unitPrice: 0,
  bulkPrice: 0, // NEW
  quantityForBulkPrice: 1, // NEW
  currency: "INR" as const,
  moq: 1,
  unit: "kg" as const,
  tax: 0,
  bulkDiscounts: [],
  leadTime: 7,
  availability: "in-stock" as const,
  notes: "",
};

// ============================================================================
// MATERIALS & SUPPLIER_MATERIALS
// ============================================================================

export const MATERIALS: Material[] = [
  {
    id: "1",
    name: "Acid Blue Color",
    category: "Colors",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Acid Slurry 90%",
    category: "Acids",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "CBS-X",
    category: "Thickeners",
    createdAt: "2024-01-10",
  },
  {
    id: "4",
    name: "Caustic Soda",
    category: "Bases",
    createdAt: "2024-01-10",
  },
  {
    id: "5",
    name: "Citric Acid",
    category: "Acids",
    createdAt: "2024-01-10",
  },
  {
    id: "6",
    name: "NaCl",
    category: "Salts",
    createdAt: "2024-01-10",
  },
  {
    id: "7",
    name: "Dolamite",
    category: "Other",
    createdAt: "2024-01-10",
  },
  {
    id: "8",
    name: "Soda Ash",
    category: "Bases",
    createdAt: "2024-01-10",
  },
  {
    id: "9",
    name: "AOS Powder 96%",
    category: "Other",
    createdAt: "2024-01-10",
  },
];

export const SUPPLIER_MATERIALS: SupplierMaterial[] = [
  {
    id: "1",
    supplierId: "1",
    materialId: "2",
    unit: "kg",
    unitPrice: 117,
    tax: 5,
    moq: 50,
    bulkDiscounts: [
      { quantity: 100, discount: 5 },
      { quantity: 500, discount: 12 },
      { quantity: 1000, discount: 18 },
    ],
    leadTime: 7,
    transportationCost: 15,
    notes: "High purity, consistent quality",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    supplierId: "1",
    materialId: "4",
    unit: "kg",
    unitPrice: 57,
    tax: 5,
    moq: 100,
    bulkDiscounts: [
      { quantity: 500, discount: 8 },
      { quantity: 1000, discount: 15 },
    ],
    leadTime: 5,
    transportationCost: 12,
    notes: "Industrial grade, 99% purity",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    supplierId: "1",
    materialId: "5",
    unit: "kg",
    unitPrice: 93,
    tax: 5,
    moq: 40,
    bulkDiscounts: [
      { quantity: 100, discount: 7 },
      { quantity: 500, discount: 15 },
    ],
    leadTime: 6,
    transportationCost: 18,
    createdAt: "2024-01-15",
  },
  {
    id: "4",
    supplierId: "2",
    materialId: "1",
    unit: "kg",
    unitPrice: 1600,
    tax: 5,
    moq: 5,
    bulkDiscounts: [
      { quantity: 10, discount: 3 },
      { quantity: 25, discount: 8 },
    ],
    leadTime: 10,
    transportationCost: 25,
    notes: "Premium quality, vibrant color",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    supplierId: "2",
    materialId: "9",
    unit: "kg",
    unitPrice: 148,
    tax: 5,
    moq: 30,
    bulkDiscounts: [
      { quantity: 75, discount: 5 },
      { quantity: 200, discount: 12 },
    ],
    leadTime: 7,
    transportationCost: 20,
    createdAt: "2024-01-20",
  },
  {
    id: "6",
    supplierId: "3",
    materialId: "6",
    unit: "kg",
    unitPrice: 6,
    tax: 5,
    moq: 500,
    bulkDiscounts: [
      { quantity: 1000, discount: 10 },
      { quantity: 5000, discount: 20 },
    ],
    leadTime: 3,
    transportationCost: 8,
    notes: "Food grade quality, bulk pricing available",
    createdAt: "2024-02-01",
  },
  {
    id: "7",
    supplierId: "3",
    materialId: "8",
    unit: "kg",
    unitPrice: 39,
    tax: 5,
    moq: 200,
    bulkDiscounts: [
      { quantity: 500, discount: 8 },
      { quantity: 1000, discount: 15 },
    ],
    leadTime: 4,
    transportationCost: 10,
    createdAt: "2024-02-01",
  },
  {
    id: "8",
    supplierId: "1",
    materialId: "9",
    unit: "kg",
    unitPrice: 140,
    tax: 5,
    moq: 30,
    bulkDiscounts: [
      { quantity: 75, discount: 5 },
      { quantity: 200, discount: 12 },
    ],
    leadTime: 7,
    transportationCost: 20,
    createdAt: "2024-01-20",
  },
];

// Analytics Data

export const AI_INSIGHTS = [
  {
    type: "cost-optimization",
    title: "Cost Optimization Opportunity",
    description: "Switch to Supplier B for Caustic Soda to save ₹8,500/month",
    impact: "High",
    confidence: 92,
  },
  {
    type: "inventory",
    title: "Inventory Alert",
    description: "CBS-X stock will run low in 2 weeks based on current usage",
    impact: "Medium",
    confidence: 87,
  },
  {
    type: "quality",
    title: "Quality Improvement",
    description:
      "Adjusting AOS Powder ratio could improve product quality by 3%",
    impact: "Medium",
    confidence: 78,
  },
  {
    type: "market",
    title: "Market Trend",
    description: "Citric Acid prices expected to increase 12% next quarter",
    impact: "High",
    confidence: 85,
  },
];
