// src/app/labels/components/labels-constants.tsx
import {
  Label,
  LabelMaterialType,
  LabelType,
  PrintingType,
  ShapeType,
  SupplierLabel,
} from "@/types/shared-types";

// ============================================================================
// ANALYTICS DATA
// ============================================================================

export const AI_INSIGHTS = [
  {
    type: "cost-optimization",
    title: "Bulk Sticker Purchase",
    description:
      "Ordering 50,000+ standard stickers from Supplier A could reduce costs by ₹8,000/month",
    impact: "High",
    confidence: 91,
  },
  {
    type: "inventory",
    title: "Embossed Labels Alert",
    description:
      "Embossed label stock will deplete in 2 weeks based on current production rates",
    impact: "Medium",
    confidence: 88,
  },
  {
    type: "quality",
    title: "Supplier Quality Improvement",
    description:
      "Supplier B has upgraded their printing equipment, improving color accuracy by 15%",
    impact: "Medium",
    confidence: 85,
  },
  {
    type: "market",
    title: "Material Trend",
    description:
      "Vinyl label demand expected to increase 25% next quarter due to new product lines",
    impact: "High",
    confidence: 89,
  },
];

// ============================================================================
// CORE DATA - Single source of truth with labels and colors
// ============================================================================

export const LABEL_TYPES = [
  { value: "sticker" as const, label: "Sticker", color: "#2563EB" },
  { value: "label" as const, label: "Label", color: "#7C3AED" },
  { value: "tag" as const, label: "Tag", color: "#b52727ff" },
  { value: "other" as const, label: "Other", color: "#9CA3AF" },
] as const;

export const PRINTING_TYPES = [
  { value: "bw" as const, label: "Black & White", color: "#424c5cff" },
  { value: "color" as const, label: "Color", color: "#43bf36ff" },
  { value: "foil" as const, label: "Foil", color: "#417affff" },
  { value: "embossed" as const, label: "Embossed", color: "#dd486dff" },
] as const;

export const MATERIAL_TYPES = [
  { value: "paper" as const, label: "Paper", color: "#4cce00ff" },
  { value: "vinyl" as const, label: "Vinyl", color: "#00a0bcff" },
  { value: "plastic" as const, label: "Plastic", color: "#D97706" },
  { value: "other" as const, label: "Other", color: "#BE123C" },
] as const;

export const SHAPE_TYPES = [
  { value: "rectangular" as const, label: "Rectangular", color: "#10B981" },
  { value: "custom" as const, label: "Custom", color: "#8B5CF6" },
] as const;

// ============================================================================
// DERIVED CONSTANTS - Computed once, reused everywhere
// ============================================================================

// Simple arrays for when you just need the values
export const LABEL_TYPE_VALUES = LABEL_TYPES.map((t) => t.value);
export const PRINTING_TYPE_VALUES = PRINTING_TYPES.map((t) => t.value);
export const MATERIAL_TYPE_VALUES = MATERIAL_TYPES.map((m) => m.value);
export const SHAPE_TYPE_VALUES = SHAPE_TYPES.map((s) => s.value);

// Simple arrays for when you just need the labels (for UI display)
export const LABEL_TYPE_LABELS = LABEL_TYPES.map((t) => t.label);
export const PRINTING_TYPE_LABELS = PRINTING_TYPES.map((t) => t.label);
export const MATERIAL_TYPE_LABELS = MATERIAL_TYPES.map((m) => m.label);
export const SHAPE_TYPE_LABELS = SHAPE_TYPES.map((s) => s.label);

// O(1) lookup maps for colors - Performance optimized
const LABEL_TYPE_COLOR_MAP = new Map(
  LABEL_TYPES.map((t) => [t.value, t.color])
);

const PRINTING_TYPE_COLOR_MAP = new Map(
  PRINTING_TYPES.map((t) => [t.value, t.color])
);

const MATERIAL_TYPE_COLOR_MAP = new Map(
  MATERIAL_TYPES.map((m) => [m.value, m.color])
);

const SHAPE_TYPE_COLOR_MAP = new Map(
  SHAPE_TYPES.map((s) => [s.value, s.color])
);

// O(1) lookup maps for labels
const LABEL_TYPE_LABEL_MAP = new Map(
  LABEL_TYPES.map((t) => [t.value, t.label])
);

const PRINTING_TYPE_LABEL_MAP = new Map(
  PRINTING_TYPES.map((t) => [t.value, t.label])
);

const MATERIAL_TYPE_LABEL_MAP = new Map(
  MATERIAL_TYPES.map((m) => [m.value, m.label])
);

const SHAPE_TYPE_LABEL_MAP = new Map(
  SHAPE_TYPES.map((s) => [s.value, s.label])
);

// ============================================================================
// HELPER FUNCTIONS - O(1) lookups using Maps
// ============================================================================

const DEFAULT_COLOR = "#6b7280"; // Gray fallback

/**
 * Get color for label type - O(1) lookup
 */
export const getLabelTypeColor = (type: LabelType): string => {
  return LABEL_TYPE_COLOR_MAP.get(type) ?? DEFAULT_COLOR;
};

/**
 * Get color for printing type - O(1) lookup
 */
export const getPrintingTypeColor = (printingType: PrintingType): string => {
  return PRINTING_TYPE_COLOR_MAP.get(printingType) ?? DEFAULT_COLOR;
};

/**
 * Get color for material type - O(1) lookup
 */
export const getMaterialTypeColor = (material: LabelMaterialType): string => {
  return MATERIAL_TYPE_COLOR_MAP.get(material) ?? DEFAULT_COLOR;
};

/**
 * Get color for shape type - O(1) lookup
 */
export const getShapeTypeColor = (shape: ShapeType): string => {
  return SHAPE_TYPE_COLOR_MAP.get(shape) ?? DEFAULT_COLOR;
};

/**
 * Get label for label type - O(1) lookup
 */
export const getLabelTypeLabel = (type: LabelType): string => {
  return LABEL_TYPE_LABEL_MAP.get(type) ?? type;
};

/**
 * Get label for printing type - O(1) lookup
 */
export const getPrintingTypeLabel = (printingType: PrintingType): string => {
  return PRINTING_TYPE_LABEL_MAP.get(printingType) ?? printingType;
};

/**
 * Get label for material type - O(1) lookup
 */
export const getMaterialTypeLabel = (material: LabelMaterialType): string => {
  return MATERIAL_TYPE_LABEL_MAP.get(material) ?? material;
};

/**
 * Get label for shape type - O(1) lookup
 */
export const getShapeTypeLabel = (shape: ShapeType): string => {
  return SHAPE_TYPE_LABEL_MAP.get(shape) ?? shape;
};

// ============================================================================
// TYPE GUARDS - Type-safe validation
// ============================================================================

export const isValidLabelType = (value: string): value is LabelType => {
  return LABEL_TYPE_VALUES.includes(value as LabelType);
};

export const isValidPrintingType = (value: string): value is PrintingType => {
  return PRINTING_TYPE_VALUES.includes(value as PrintingType);
};

export const isValidMaterialType = (
  value: string
): value is LabelMaterialType => {
  return MATERIAL_TYPE_VALUES.includes(value as LabelMaterialType);
};

export const isValidShapeType = (value: string): value is ShapeType => {
  return SHAPE_TYPE_VALUES.includes(value as ShapeType);
};

// ============================================================================
// LABELS
// ============================================================================

export const LABELS: Label[] = [
  {
    id: "1",
    name: "Standard Sticker Label",
    type: "sticker",
    printingType: "color",
    material: "paper",
    shape: "rectangular",
    size: "50x30mm",
    labelFor: "Floor Cleaner",
    notes: "Waterproof adhesive, suitable for bottles",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Premium Label Tag",
    type: "label",
    printingType: "foil",
    material: "vinyl",
    shape: "rectangular",
    size: "80x50mm",
    labelFor: "Bathroom Cleaner",
    notes: "High-quality foil printing for premium products",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Custom Shape Tag",
    type: "tag",
    printingType: "bw",
    material: "paper",
    shape: "custom",
    size: "60x40mm",
    labelFor: "Glass Cleaner",
    notes: "Custom die-cut shape for branding",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Embossed Label",
    type: "label",
    printingType: "embossed",
    material: "plastic",
    shape: "rectangular",
    size: "70x45mm",
    labelFor: "Kitchen Degreaser",
    notes: "Embossed texture for luxury feel",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    name: "Small Sticker",
    type: "sticker",
    printingType: "color",
    material: "vinyl",
    shape: "rectangular",
    size: "30x20mm",
    labelFor: "Sample Products",
    notes: "Small size for sample bottles",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "6",
    name: "Large Product Tag",
    type: "tag",
    printingType: "color",
    material: "paper",
    shape: "custom",
    size: "100x60mm",
    labelFor: "Bulk Containers",
    notes: "Large format for industrial containers",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "7",
    name: "Security Label",
    type: "sticker",
    printingType: "foil",
    material: "plastic",
    shape: "rectangular",
    size: "40x25mm",
    labelFor: "Premium Products",
    notes: "Tamper-evident security features",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "8",
    name: "Recyclable Label",
    type: "label",
    printingType: "bw",
    material: "paper",
    shape: "rectangular",
    size: "55x35mm",
    labelFor: "Eco Products",
    notes: "Made from recycled materials",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

export const SUPPLIER_LABELS: SupplierLabel[] = [
  {
    id: "1",
    supplierId: "1",
    labelId: "1",
    unit: "pieces",
    unitPrice: 0.15,
    bulkPrice: 120,
    quantityForBulkPrice: 1000,
    moq: 500,
    bulkDiscounts: [
      { quantity: 5000, discount: 10 },
      { quantity: 10000, discount: 18 },
    ],
    leadTime: 7,
    availability: "in-stock",
    transportationCost: 8,
    notes: "Standard quality sticker labels",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    supplierId: "1",
    labelId: "2",
    unit: "pieces",
    unitPrice: 0.85,
    bulkPrice: 680,
    quantityForBulkPrice: 1000,
    moq: 200,
    bulkDiscounts: [
      { quantity: 2000, discount: 12 },
      { quantity: 5000, discount: 20 },
    ],
    leadTime: 10,
    availability: "in-stock",
    transportationCost: 15,
    notes: "Premium foil printing available",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "3",
    supplierId: "2",
    labelId: "3",
    unit: "pieces",
    unitPrice: 0.25,
    bulkPrice: 200,
    quantityForBulkPrice: 1000,
    moq: 1000,
    bulkDiscounts: [
      { quantity: 5000, discount: 8 },
      { quantity: 10000, discount: 15 },
    ],
    leadTime: 5,
    availability: "in-stock",
    transportationCost: 6,
    notes: "Custom die-cutting service available",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "4",
    supplierId: "2",
    labelId: "4",
    unit: "pieces",
    unitPrice: 1.2,
    bulkPrice: 960,
    quantityForBulkPrice: 1000,
    moq: 100,
    bulkDiscounts: [
      { quantity: 2000, discount: 15 },
      { quantity: 5000, discount: 25 },
    ],
    leadTime: 12,
    availability: "limited",
    transportationCost: 18,
    notes: "Specialized embossing equipment",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "5",
    supplierId: "3",
    labelId: "5",
    unit: "pieces",
    unitPrice: 0.08,
    bulkPrice: 64,
    quantityForBulkPrice: 1000,
    moq: 2000,
    bulkDiscounts: [
      { quantity: 10000, discount: 12 },
      { quantity: 25000, discount: 20 },
    ],
    leadTime: 4,
    availability: "in-stock",
    transportationCost: 4,
    notes: "Bulk pricing for small labels",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "6",
    supplierId: "3",
    labelId: "6",
    unit: "pieces",
    unitPrice: 0.45,
    bulkPrice: 360,
    quantityForBulkPrice: 1000,
    moq: 500,
    bulkDiscounts: [
      { quantity: 5000, discount: 10 },
      { quantity: 10000, discount: 18 },
    ],
    leadTime: 6,
    availability: "in-stock",
    transportationCost: 10,
    notes: "Large format printing capabilities",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "7",
    supplierId: "1",
    labelId: "7",
    unit: "pieces",
    unitPrice: 0.35,
    bulkPrice: 280,
    quantityForBulkPrice: 1000,
    moq: 300,
    bulkDiscounts: [
      { quantity: 2000, discount: 8 },
      { quantity: 5000, discount: 15 },
    ],
    leadTime: 8,
    availability: "in-stock",
    transportationCost: 12,
    notes: "Security features available",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "8",
    supplierId: "2",
    labelId: "8",
    unit: "pieces",
    unitPrice: 0.12,
    bulkPrice: 96,
    quantityForBulkPrice: 1000,
    moq: 1000,
    bulkDiscounts: [
      { quantity: 5000, discount: 10 },
      { quantity: 10000, discount: 18 },
    ],
    leadTime: 5,
    availability: "in-stock",
    transportationCost: 5,
    notes: "Eco-friendly materials",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
];
