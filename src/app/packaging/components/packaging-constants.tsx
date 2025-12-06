// src/app/packaging/components/packaging-constants.tsx
import { CAPACITY_UNITS } from "@/lib/constants";
import {
  BuildMaterial,
  CapacityUnit,
  Packaging,
  PackagingFormData,
  PackagingType,
  SupplierPackaging,
  SupplierPackagingFormData,
} from "@/types/packaging-types";

/**
 * Default form data structure for creating new packaging items
 * Provides empty initial values for all required fields
 */
export const DEFAULT_PACKAGING_FORM: PackagingFormData = {
  name: "",
  type: "bottle" as const,
  capacity: 0,
  capacityUnit: "ml" as const,
  buildMaterial: "Other" as const,
};

/**
 * Default form data structure for supplier packaging relationships
 * Initializes with sensible defaults like standard lead time and tax rate
 */
export const DEFAULT_SUPPLIER_PACKAGING_FORM: SupplierPackagingFormData = {
  supplierId: "",
  packagingName: "",
  packagingId: "",
  packagingType: "other",
  capacity: 0,
  capacityUnit: "ml",
  buildMaterial: "Other",
  bulkPrice: 0,
  quantityForBulkPrice: 1,
  tax: 0,
  moq: 1,
  leadTime: 7,
  notes: "",
  unitPrice: 0,
};

/**
 * Sample AI insights data for analytics demonstration
 * These represent typical recommendations and alerts the system might generate
 */
export const AI_INSIGHTS = [
  {
    type: "cost-optimization",
    title: "Bulk Purchase Opportunity",
    description:
      "Buying 10,000+ PET bottles from Supplier A could save ₹12,000/month",
    impact: "High",
    confidence: 94,
  },
  {
    type: "inventory",
    title: "Stock Optimization Alert",
    description:
      "HDPE containers will run low in 3 weeks based on current usage trends",
    impact: "Medium",
    confidence: 89,
  },
  {
    type: "quality",
    title: "Supplier Performance",
    description: "Supplier B has improved delivery times by 25% for glass jars",
    impact: "Medium",
    confidence: 82,
  },
  {
    type: "market",
    title: "Material Trend",
    description:
      "Plastic pouch prices expected to decrease 8% next quarter due to new suppliers",
    impact: "High",
    confidence: 87,
  },
];

/**
 * Core packaging type definitions with associated colors for UI consistency
 * Used throughout the application for dropdowns, filters, and visualizations
 */
export const PACKAGING_TYPES = [
  { value: "bottle" as const, label: "Bottle", color: "#3b82f6" },
  { value: "jar" as const, label: "Jar", color: "#8b5cf6" },
  { value: "can" as const, label: "Can", color: "#ef4444" },
  { value: "box" as const, label: "Box", color: "#f59e0b" },
  { value: "pouch" as const, label: "Pouch", color: "#10b981" },
  { value: "other" as const, label: "Other", color: "#6b7280" },
] as const;

/**
 * Build material options with consistent color coding
 * Covers common packaging materials used in the industry
 */
export const BUILD_MATERIALS = [
  { value: "PET" as const, label: "PET", color: "#06b6d4" },
  { value: "HDPE" as const, label: "HDPE", color: "#8b5cf6" },
  { value: "Glass" as const, label: "Glass", color: "#3b82f6" },
  { value: "Plastic" as const, label: "Plastic", color: "#f59e0b" },
  { value: "Paper" as const, label: "Paper", color: "#84cc16" },
  { value: "Other" as const, label: "Other", color: "#6b7280" },
] as const;

/**
 * Derived arrays for just values, used in validation and form options
 */
export const PACKAGING_TYPE_VALUES = PACKAGING_TYPES.map((t) => t.value);
export const BUILD_MATERIAL_VALUES = BUILD_MATERIALS.map((m) => m.value);
export const CAPACITY_UNIT_VALUES = CAPACITY_UNITS.map((u) => u.value);

/**
 * Derived arrays for labels, used in UI display components
 */
export const PACKAGING_TYPE_LABELS = PACKAGING_TYPES.map((t) => t.label);
export const BUILD_MATERIAL_LABELS = BUILD_MATERIALS.map((m) => m.label);
export const CAPACITY_UNIT_LABELS = CAPACITY_UNITS.map((u) => u.label);

/**
 * Optimized lookup maps for O(1) color retrieval by value
 */
const PACKAGING_TYPE_COLOR_MAP = new Map(
  PACKAGING_TYPES.map((t) => [t.value, t.color])
);

const BUILD_MATERIAL_COLOR_MAP = new Map(
  BUILD_MATERIALS.map((m) => [m.value, m.color])
);

/**
 * Optimized lookup maps for O(1) label retrieval by value
 */
const PACKAGING_TYPE_LABEL_MAP = new Map(
  PACKAGING_TYPES.map((t) => [t.value, t.label])
);

const BUILD_MATERIAL_LABEL_MAP = new Map(
  BUILD_MATERIALS.map((m) => [m.value, m.label])
);

const CAPACITY_UNIT_LABEL_MAP = new Map(
  CAPACITY_UNITS.map((u) => [u.value, u.label])
);

/**
 * Utility functions for retrieving display properties with fallback defaults
 */
const DEFAULT_COLOR = "#6b7280";

/**
 * Get the associated color for a packaging type
 */
export const getPackagingTypeColor = (type: PackagingType): string => {
  return PACKAGING_TYPE_COLOR_MAP.get(type) ?? DEFAULT_COLOR;
};

/**
 * Get the associated color for a build material
 */
export const getBuildMaterialColor = (material: BuildMaterial): string => {
  return BUILD_MATERIAL_COLOR_MAP.get(material) ?? DEFAULT_COLOR;
};

/**
 * Get the human-readable label for a packaging type
 */
export const getPackagingTypeLabel = (type: PackagingType): string => {
  return PACKAGING_TYPE_LABEL_MAP.get(type) ?? type;
};

/**
 * Get the human-readable label for a build material
 */
export const getBuildMaterialLabel = (material: BuildMaterial): string => {
  return BUILD_MATERIAL_LABEL_MAP.get(material) ?? material;
};

/**
 * Get the human-readable label for a capacity unit
 */
export const getCapacityUnitLabel = (capacityUnit: CapacityUnit): string => {
  return CAPACITY_UNIT_LABEL_MAP.get(capacityUnit) ?? capacityUnit;
};

/**
 * Type guard functions for runtime type validation
 */
export const isValidPackagingType = (value: string): value is PackagingType => {
  return PACKAGING_TYPE_VALUES.includes(value as PackagingType);
};

export const isValidBuildMaterial = (value: string): value is BuildMaterial => {
  return BUILD_MATERIAL_VALUES.includes(value as BuildMaterial);
};

export const isValidCapacityUnit = (value: string): value is CapacityUnit => {
  return CAPACITY_UNIT_VALUES.includes(value as CapacityUnit);
};

/**
 * Sample packaging data for development and testing
 * Represents common packaging items with various types and materials
 */
export const PACKAGING: Packaging[] = [
  {
    id: "1",
    name: "500ml PET Bottle",
    type: "bottle",
    capacity: 500,
    capacityUnit: "ml",
    buildMaterial: "PET",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "2L Glass Jar",
    type: "jar",
    capacity: 2,
    capacityUnit: "L",
    buildMaterial: "Glass",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "5L HDPE Container",
    type: "can",
    capacity: 5,
    capacityUnit: "L",
    buildMaterial: "HDPE",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "250ml Spray Bottle",
    type: "bottle",
    capacity: 250,
    capacityUnit: "ml",
    buildMaterial: "PET",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    name: "200ml Plastic Tube",
    type: "other",
    capacity: 200,
    capacityUnit: "ml",
    buildMaterial: "Plastic",
    createdAt: "2024-01-01T00:00:00.000Z",
    notes: "Used for gels and creams",
  },
  {
    id: "6",
    name: "1kg Paper Box",
    type: "box",
    capacity: 1,
    capacityUnit: "kg",
    buildMaterial: "Paper",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "7",
    name: "500g Plastic Pouch",
    type: "pouch",
    capacity: 500,
    capacityUnit: "gm",
    buildMaterial: "Plastic",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "8",
    name: "2L Metal Can",
    type: "can",
    capacity: 2,
    capacityUnit: "L",
    buildMaterial: "Other",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "9",
    name: "250ml HDPE Bottle",
    type: "bottle",
    capacity: 250,
    capacityUnit: "ml",
    buildMaterial: "HDPE",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "10",
    name: "750ml Glass Bottle",
    type: "bottle",
    capacity: 750,
    capacityUnit: "ml",
    buildMaterial: "Glass",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

/**
 * Sample supplier packaging relationships with pricing and terms
 * Demonstrates various bulk discounts, lead times, and supplier-specific data
 */
export const SUPPLIER_PACKAGING: SupplierPackaging[] = [
  {
    id: "1",
    supplierId: "1",
    packagingId: "1",
    bulkPrice: 2.5,
    quantityForBulkPrice: 1,
    capacityUnit: "ml",
    tax: 5,
    moq: 1000,
    bulkDiscounts: [
      { quantity: 5000, discount: 8 },
      { quantity: 10000, discount: 15 },
    ],
    leadTime: 10,
    transportationCost: 5,
    notes: "Standard PET bottle, food-grade quality",
    createdAt: "2024-01-15T00:00:00.000Z",
    unitPrice: 2.5,
  },
  {
    id: "2",
    supplierId: "1",
    packagingId: "2",
    bulkPrice: 8.5,
    quantityForBulkPrice: 1,
    capacityUnit: "L",
    tax: 5,
    moq: 500,
    bulkDiscounts: [
      { quantity: 2000, discount: 10 },
      { quantity: 5000, discount: 18 },
    ],
    leadTime: 14,
    transportationCost: 12,
    notes: "Premium glass jar with screw cap",
    createdAt: "2024-01-15T00:00:00.000Z",
    unitPrice: 8.5,
  },
  {
    id: "3",
    supplierId: "1",
    packagingId: "3",
    bulkPrice: 15.0,
    quantityForBulkPrice: 1,
    capacityUnit: "L",
    tax: 5,
    moq: 200,
    bulkDiscounts: [
      { quantity: 1000, discount: 12 },
      { quantity: 2000, discount: 20 },
    ],
    leadTime: 12,
    transportationCost: 18,
    notes: "Heavy-duty HDPE container for industrial use",
    createdAt: "2024-01-15T00:00:00.000Z",
    unitPrice: 15.0,
  },
  {
    id: "4",
    supplierId: "2",
    packagingId: "4",
    bulkPrice: 1.8,
    quantityForBulkPrice: 1,
    capacityUnit: "ml",
    tax: 5,
    moq: 2000,
    bulkDiscounts: [
      { quantity: 10000, discount: 10 },
      { quantity: 25000, discount: 18 },
    ],
    leadTime: 8,
    transportationCost: 4,
    notes: "Spray bottle with trigger mechanism",
    createdAt: "2024-01-20T00:00:00.000Z",
    unitPrice: 1.8,
  },
  {
    id: "5",
    supplierId: "2",
    packagingId: "5",
    bulkPrice: 0.8,
    quantityForBulkPrice: 1,
    capacityUnit: "ml",
    tax: 5,
    moq: 5000,
    bulkDiscounts: [
      { quantity: 25000, discount: 15 },
      { quantity: 50000, discount: 25 },
    ],
    leadTime: 7,
    transportationCost: 3,
    notes: "Plastic tube for creams and gels",
    createdAt: "2024-01-20T00:00:00.000Z",
    unitPrice: 0.8,
  },
  {
    id: "6",
    supplierId: "3",
    packagingId: "6",
    bulkPrice: 3.2,
    quantityForBulkPrice: 1,
    capacityUnit: "kg",
    tax: 5,
    moq: 1000,
    bulkDiscounts: [
      { quantity: 5000, discount: 8 },
      { quantity: 10000, discount: 15 },
    ],
    leadTime: 6,
    transportationCost: 6,
    notes: "Cardboard box with printing capabilities",
    createdAt: "2024-02-01T00:00:00.000Z",
    unitPrice: 3.2,
  },
  {
    id: "7",
    supplierId: "3",
    packagingId: "7",
    bulkPrice: 0.5,
    quantityForBulkPrice: 1,
    capacityUnit: "gm",
    tax: 5,
    moq: 10000,
    bulkDiscounts: [
      { quantity: 50000, discount: 20 },
      { quantity: 100000, discount: 30 },
    ],
    leadTime: 5,
    transportationCost: 2,
    notes: "Flexible plastic pouch, resealable",
    createdAt: "2024-02-01T00:00:00.000Z",
    unitPrice: 0.5,
  },
  {
    id: "8",
    supplierId: "1",
    packagingId: "10",
    bulkPrice: 12.0,
    quantityForBulkPrice: 1,
    capacityUnit: "ml",
    tax: 5,
    moq: 300,
    bulkDiscounts: [
      { quantity: 1000, discount: 10 },
      { quantity: 2000, discount: 18 },
    ],
    leadTime: 15,
    transportationCost: 20,
    notes: "Metal can with lid, corrosion resistant",
    createdAt: "2024-01-15T00:00:00.000Z",
    unitPrice: 12.0,
  },
];
