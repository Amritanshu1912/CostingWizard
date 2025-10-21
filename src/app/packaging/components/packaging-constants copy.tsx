import {
  BuildMaterial,
  CapacityUnit,
  Packaging,
  PackagingType,
  SupplierPackaging,
} from "@/lib/types";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";

// ============================================================================
// ANALYTICS DATA
// ============================================================================

export const PRICE_HISTORY_DATA = [
  { month: "Jan", avgPrice: 4.2, packaging: 1250 },
  { month: "Feb", avgPrice: 4.5, packaging: 1280 },
  { month: "Mar", avgPrice: 4.1, packaging: 1320 },
  { month: "Apr", avgPrice: 4.8, packaging: 1350 },
  { month: "May", avgPrice: 5.2, packaging: 1380 },
  { month: "Jun", avgPrice: 4.9, packaging: 1420 },
];

export const PACKAGING_USAGE_DATA = [
  { packaging: "PET Bottles", usage: 8500, cost: 42500, efficiency: 92 },
  { packaging: "Glass Jars", usage: 3200, cost: 27200, efficiency: 88 },
  { packaging: "HDPE Containers", usage: 1800, cost: 27000, efficiency: 95 },
  { packaging: "Plastic Pouches", usage: 4500, cost: 2250, efficiency: 90 },
  { packaging: "Paper Boxes", usage: 2800, cost: 8960, efficiency: 85 },
];

export const KEY_METRICS = [
  {
    type: "progress",
    title: "Price Volatility",
    value: "+3.8%",
    icon: TrendingUp,
    iconClassName: "text-accent",
    progress: {
      current: 62,
      max: 100,
      label: "Below average",
      color: "success" as const,
    },
  },
  {
    type: "progress",
    title: "Supply Efficiency",
    value: "91%",
    icon: Target,
    iconClassName: "text-primary",
    progress: {
      current: 91,
      max: 100,
      label: "Excellent",
      color: "success" as const,
    },
  },
  {
    type: "badge",
    title: "Stock Alerts",
    value: 2,
    icon: AlertTriangle,
    iconClassName: "text-destructive",
    badges: [
      {
        text: "Low Stock",
        variant: "destructive" as const,
      },
    ],
  },
  {
    type: "standard",
    title: "Total Value",
    value: "₹2.8L",
    icon: DollarSign,
    iconClassName: "text-accent",
    trend: {
      value: "+15%",
      isPositive: true,
      label: "this month",
    },
  },
  {
    type: "standard",
    title: "Avg Lead Time",
    value: "9 days",
    icon: Clock,
    iconClassName: "text-primary",
    trend: {
      value: "-2 days",
      isPositive: true,
      label: "improvement",
    },
  },
];

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

// ============================================================================
// SUPPLIER PERFORMANCE DATA
// ============================================================================

export const SUPPLIER_PERFORMANCE_DATA = [
  { supplier: "Supplier A", avgLeadTime: 8, avgPrice: 4.2, reliability: 95 },
  { supplier: "Supplier B", avgLeadTime: 10, avgPrice: 3.8, reliability: 92 },
  { supplier: "Supplier C", avgLeadTime: 12, avgPrice: 5.1, reliability: 88 },
];

// ============================================================================
// PACKAGING TYPE DISTRIBUTION DATA
// ============================================================================

export const PACKAGING_TYPE_DISTRIBUTION = [
  { name: "Bottles", value: 45, color: "#3b82f6" },
  { name: "Jars", value: 25, color: "#8b5cf6" },
  { name: "Cans", value: 15, color: "#ef4444" },
  { name: "Boxes", value: 10, color: "#f59e0b" },
  { name: "Pouches", value: 5, color: "#10b981" },
];

// ============================================================================
// CORE DATA - Single source of truth with labels and colors
// ============================================================================

export const PACKAGING_TYPES = [
  { value: "bottle" as const, label: "Bottle", color: "#3b82f6" },
  { value: "jar" as const, label: "Jar", color: "#8b5cf6" },
  { value: "can" as const, label: "Can", color: "#ef4444" },
  { value: "box" as const, label: "Box", color: "#f59e0b" },
  { value: "pouch" as const, label: "Pouch", color: "#10b981" },
  { value: "other" as const, label: "Other", color: "#6b7280" },
] as const;

export const BUILD_MATERIALS = [
  { value: "PET" as const, label: "PET", color: "#06b6d4" },
  { value: "HDPE" as const, label: "HDPE", color: "#8b5cf6" },
  { value: "Glass" as const, label: "Glass", color: "#3b82f6" },
  { value: "Plastic" as const, label: "Plastic", color: "#f59e0b" },
  { value: "Paper" as const, label: "Paper", color: "#84cc16" },
  { value: "Other" as const, label: "Other", color: "#6b7280" },
] as const;

export const CAPACITY_UNITS = [
  { value: "kg" as const, label: "Kilograms (kg)" },
  { value: "L" as const, label: "Liters (L)" },
  { value: "ml" as const, label: "Milliliters (ml)" },
  { value: "gm" as const, label: "Grams (gm)" },
] as const;

export const PACKAGING_AVAILABILITY = [
  { value: "in-stock" as const, label: "In Stock" },
  { value: "limited" as const, label: "Limited" },
  { value: "out-of-stock" as const, label: "Out of Stock" },
] as const;

// ============================================================================
// DERIVED CONSTANTS - Computed once, reused everywhere
// ============================================================================

// Simple arrays for when you just need the values
export const PACKAGING_TYPE_VALUES = PACKAGING_TYPES.map((t) => t.value);
export const BUILD_MATERIAL_VALUES = BUILD_MATERIALS.map((m) => m.value);
export const CAPACITY_UNIT_VALUES = CAPACITY_UNITS.map((u) => u.value);

// Simple arrays for when you just need the labels (for UI display)
export const PACKAGING_TYPE_LABELS = PACKAGING_TYPES.map((t) => t.label);
export const BUILD_MATERIAL_LABELS = BUILD_MATERIALS.map((m) => m.label);
export const CAPACITY_UNIT_LABELS = CAPACITY_UNITS.map((u) => u.label);

// O(1) lookup maps for colors - Performance optimized
const PACKAGING_TYPE_COLOR_MAP = new Map(
  PACKAGING_TYPES.map((t) => [t.value, t.color])
);

const BUILD_MATERIAL_COLOR_MAP = new Map(
  BUILD_MATERIALS.map((m) => [m.value, m.color])
);

// O(1) lookup maps for labels
const PACKAGING_TYPE_LABEL_MAP = new Map(
  PACKAGING_TYPES.map((t) => [t.value, t.label])
);

const BUILD_MATERIAL_LABEL_MAP = new Map(
  BUILD_MATERIALS.map((m) => [m.value, m.label])
);

const CAPACITY_UNIT_LABEL_MAP = new Map(
  CAPACITY_UNITS.map((u) => [u.value, u.label])
);

// ============================================================================
// HELPER FUNCTIONS - O(1) lookups using Maps
// ============================================================================

const DEFAULT_COLOR = "#6b7280"; // Gray fallback

/**
 * Get color for packaging type - O(1) lookup
 */
export const getPackagingTypeColor = (type: PackagingType): string => {
  return PACKAGING_TYPE_COLOR_MAP.get(type) ?? DEFAULT_COLOR;
};

/**
 * Get color for build material - O(1) lookup
 */
export const getBuildMaterialColor = (material: BuildMaterial): string => {
  return BUILD_MATERIAL_COLOR_MAP.get(material) ?? DEFAULT_COLOR;
};

/**
 * Get label for packaging type - O(1) lookup
 */
export const getPackagingTypeLabel = (type: PackagingType): string => {
  return PACKAGING_TYPE_LABEL_MAP.get(type) ?? type;
};

/**
 * Get label for build material - O(1) lookup
 */
export const getBuildMaterialLabel = (material: BuildMaterial): string => {
  return BUILD_MATERIAL_LABEL_MAP.get(material) ?? material;
};

/**
 * Get label for capacity unit - O(1) lookup
 */
export const getCapacityUnitLabel = (unit: CapacityUnit): string => {
  return CAPACITY_UNIT_LABEL_MAP.get(unit) ?? unit;
};

// ============================================================================
// TYPE GUARDS - Type-safe validation
// ============================================================================

export const isValidPackagingType = (value: string): value is PackagingType => {
  return PACKAGING_TYPE_VALUES.includes(value as PackagingType);
};

export const isValidBuildMaterial = (value: string): value is BuildMaterial => {
  return BUILD_MATERIAL_VALUES.includes(value as BuildMaterial);
};

export const isValidCapacityUnit = (value: string): value is CapacityUnit => {
  return CAPACITY_UNIT_VALUES.includes(value as CapacityUnit);
};

// ============================================================================
// PACKAGING
// ============================================================================

export const PACKAGING: Packaging[] = [
  {
    id: "1",
    name: "500ml PET Bottle",
    type: "bottle",
    capacity: 500,
    unit: "ml",
    buildMaterial: "PET",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "1L Glass Jar",
    type: "jar",
    capacity: 1,
    unit: "L",
    buildMaterial: "Glass",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "5L HDPE Container",
    type: "can",
    capacity: 5,
    unit: "L",
    buildMaterial: "HDPE",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "250ml Spray Bottle",
    type: "bottle",
    capacity: 250,
    unit: "ml",
    buildMaterial: "PET",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    name: "200ml Plastic Tube",
    type: "other",
    capacity: 200,
    unit: "ml",
    buildMaterial: "Plastic",
    createdAt: "2024-01-01T00:00:00.000Z",
    notes: "Used for gels and creams",
  },
  {
    id: "6",
    name: "1kg Paper Box",
    type: "box",
    capacity: 1,
    unit: "kg",
    buildMaterial: "Paper",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "7",
    name: "500g Plastic Pouch",
    type: "pouch",
    capacity: 500,
    unit: "gm",
    buildMaterial: "Plastic",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "8",
    name: "2L Metal Can",
    type: "can",
    capacity: 2,
    unit: "L",
    buildMaterial: "Other",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "9",
    name: "250ml HDPE Bottle",
    type: "bottle",
    capacity: 250,
    unit: "ml",
    buildMaterial: "HDPE",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "10",
    name: "750ml Glass Bottle",
    type: "bottle",
    capacity: 750,
    unit: "ml",
    buildMaterial: "Glass",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

export const SUPPLIER_PACKAGING: SupplierPackaging[] = [
  {
    id: "1",
    supplierId: "1",
    packagingId: "1",
    unitPrice: 2.5,
    tax: 5,
    moq: 1000,
    bulkPrice: 2.5,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 5000, discount: 8 },
      { quantity: 10000, discount: 15 },
    ],
    leadTime: 10,
    availability: "in-stock",
    transportationCost: 5,
    notes: "Standard PET bottle, food-grade quality",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    supplierId: "1",
    packagingId: "2",
    unitPrice: 8.5,
    tax: 5,
    moq: 500,
    bulkPrice: 8.5,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 2000, discount: 10 },
      { quantity: 5000, discount: 18 },
    ],
    leadTime: 14,
    availability: "in-stock",
    transportationCost: 12,
    notes: "Premium glass jar with screw cap",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "3",
    supplierId: "1",
    packagingId: "3",
    unitPrice: 15.0,
    tax: 5,
    moq: 200,
    bulkPrice: 15.0,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 1000, discount: 12 },
      { quantity: 2000, discount: 20 },
    ],
    leadTime: 12,
    availability: "in-stock",
    transportationCost: 18,
    notes: "Heavy-duty HDPE container for industrial use",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "4",
    supplierId: "2",
    packagingId: "4",
    unitPrice: 1.8,
    tax: 5,
    moq: 2000,
    bulkPrice: 1.8,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 10000, discount: 10 },
      { quantity: 25000, discount: 18 },
    ],
    leadTime: 8,
    availability: "in-stock",
    transportationCost: 4,
    notes: "Spray bottle with trigger mechanism",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "5",
    supplierId: "2",
    packagingId: "5",
    unitPrice: 0.8,
    tax: 5,
    moq: 5000,
    bulkPrice: 0.8,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 25000, discount: 15 },
      { quantity: 50000, discount: 25 },
    ],
    leadTime: 7,
    availability: "in-stock",
    transportationCost: 3,
    notes: "Plastic tube for creams and gels",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "6",
    supplierId: "3",
    packagingId: "6",
    unitPrice: 3.2,
    tax: 5,
    moq: 1000,
    bulkPrice: 3.2,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 5000, discount: 8 },
      { quantity: 10000, discount: 15 },
    ],
    leadTime: 6,
    availability: "out-of-stock",
    transportationCost: 6,
    notes: "Cardboard box with printing capabilities",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "7",
    supplierId: "3",
    packagingId: "7",
    unitPrice: 0.5,
    tax: 5,
    moq: 10000,
    bulkPrice: 0.5,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 50000, discount: 20 },
      { quantity: 100000, discount: 30 },
    ],
    leadTime: 5,
    availability: "limited",
    transportationCost: 2,
    notes: "Flexible plastic pouch, resealable",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "8",
    supplierId: "1",
    packagingId: "8",
    unitPrice: 12.0,
    tax: 5,
    moq: 300,
    bulkPrice: 12.0,
    quantityForBulkPrice: 1,
    bulkDiscounts: [
      { quantity: 1000, discount: 10 },
      { quantity: 2000, discount: 18 },
    ],
    leadTime: 15,
    availability: "limited",
    transportationCost: 20,
    notes: "Metal can with lid, corrosion resistant",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
];
