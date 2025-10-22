import { Material, SupplierMaterial } from "@/lib/types";
import { TrendingUp, Target, AlertTriangle, DollarSign } from "lucide-react";

// Form Options
export const MATERIAL_CATEGORIES = [
  "Acids",
  "Bases",
  "Colors",
  "Salts",
  "Thickeners",
  "Bottles",
  "Labels",
  "Other",
] as const;

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
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate unit price from bulk price and quantity
 */
export function calculateUnitPrice(
  bulkPrice: number,
  quantityForBulkPrice: number
): number {
  if (quantityForBulkPrice <= 0) return 0;
  return bulkPrice / quantityForBulkPrice;
}

/**
 * Calculate price with tax included
 */
export function calculatePriceWithTax(unitPrice: number, tax: number): number {
  return unitPrice * (1 + tax / 100);
}

/**
 * Calculate material statistics from supplier materials array
 */
export function calculateMaterialStats(supplierMaterials: any[]) {
  if (!supplierMaterials.length) {
    return {
      totalMaterials: 0,
      avgPrice: 0,
      highestPrice: 0,
      avgTax: 0,
      totalValue: 0,
    };
  }

  const totalMaterials = supplierMaterials.length;
  const avgPrice =
    supplierMaterials.reduce((sum, sm) => sum + sm.unitPrice, 0) /
    totalMaterials;
  const highestPrice = Math.max(...supplierMaterials.map((sm) => sm.unitPrice));
  const avgTax =
    supplierMaterials.reduce((sum, sm) => sum + sm.tax, 0) / totalMaterials;
  const totalValue = supplierMaterials.reduce((sum, sm) => {
    const moq = sm.moq || 1;
    return sum + sm.unitPrice * moq;
  }, 0);

  return {
    totalMaterials,
    avgPrice,
    highestPrice,
    avgTax,
    totalValue,
  };
}

/**
 * Validate material form data
 */
export function validateMaterialForm(formData: any): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!formData.supplierId || formData.supplierId.trim() === "") {
    errors.supplierId = "Supplier is required";
  }

  if (!formData.materialName || formData.materialName.trim().length === 0) {
    errors.materialName = "Material name is required";
  }

  if (!formData.bulkPrice || formData.bulkPrice <= 0) {
    errors.bulkPrice = "Valid price is required";
  }

  if (!formData.unit || formData.unit.trim() === "") {
    errors.unit = "Unit is required";
  }

  if (formData.tax !== undefined && (formData.tax < 0 || formData.tax > 100)) {
    errors.tax = "Tax must be between 0 and 100";
  }

  if (formData.moq !== undefined && formData.moq < 1) {
    errors.moq = "MOQ must be at least 1";
  }

  if (
    formData.quantityForBulkPrice !== undefined &&
    formData.quantityForBulkPrice < 1
  ) {
    errors.quantityForBulkPrice = "Quantity for bulk price must be at least 1";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Transform supplier material data for display
 */
export function transformSupplierMaterialData(supplierMaterial: any) {
  const unitPrice = calculateUnitPrice(
    supplierMaterial.bulkPrice || supplierMaterial.unitPrice,
    supplierMaterial.quantityForBulkPrice || 1
  );

  const priceWithTax = calculatePriceWithTax(
    unitPrice,
    supplierMaterial.tax || 0
  );

  return {
    ...supplierMaterial,
    unitPrice,
    priceWithTax,
    displayUnit: supplierMaterial.unit || "kg",
    displayName:
      supplierMaterial.material?.name ||
      supplierMaterial.materialName ||
      "Unknown",
    displayCategory:
      supplierMaterial.material?.category ||
      supplierMaterial.materialCategory ||
      "Uncategorized",
  };
}

/**
 * Calculate price volatility for materials with multiple suppliers
 */
export function calculatePriceVolatility(supplierMaterials: any[]): number {
  const materialGroups = supplierMaterials.reduce((acc, sm) => {
    const materialId = sm.materialId;
    if (!materialId) return acc;
    if (!acc[materialId]) acc[materialId] = [];
    acc[materialId].push(sm.unitPrice);
    return acc;
  }, {} as Record<string, number[]>);

  const volatilities = (Object.values(materialGroups) as number[][])
    .filter((prices: number[]) => prices.length > 1)
    .map((prices: number[]) => {
      const mean =
        prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      const variance =
        prices.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) /
        prices.length;
      return (Math.sqrt(variance) / mean) * 100;
    });

  return volatilities.length > 0
    ? volatilities.reduce((a: number, b: number) => a + b, 0) /
        volatilities.length
    : 0;
}

/**
 * Calculate cost efficiency based on discount utilization
 */
export function calculateCostEfficiency(supplierMaterials: any[]): number {
  const totalMaterials = supplierMaterials.length;
  const materialsWithDiscounts = supplierMaterials.filter(
    (sm) => sm.bulkDiscounts && sm.bulkDiscounts.length > 0
  ).length;

  return totalMaterials > 0
    ? (materialsWithDiscounts / totalMaterials) * 100
    : 0;
}

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
    availability: "in-stock",
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
    availability: "in-stock",
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
    availability: "in-stock",
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
    availability: "in-stock",
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
    availability: "in-stock",
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
    availability: "in-stock",
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
    availability: "in-stock",
    transportationCost: 10,
    createdAt: "2024-02-01",
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
