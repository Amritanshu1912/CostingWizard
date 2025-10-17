import {
  LabelType,
  PrintingType,
  LabelMaterialType,
  ShapeType,
  Label,
  SupplierLabel,
} from "@/lib/types";

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

export const LABEL_AVAILABILITY = [
  { value: "in-stock" as const, label: "In Stock" },
  { value: "limited" as const, label: "Limited" },
  { value: "out-of-stock" as const, label: "Out of Stock" },
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
    name: "Standard Sticker 50x30mm",
    type: "sticker",
    printingType: "color",
    material: "paper",
    shape: "rectangular",
    size: "50x30mm",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Premium Label 100x50mm",
    type: "label",
    printingType: "foil",
    material: "vinyl",
    shape: "rectangular",
    size: "100x50mm",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Round Tag 25mm",
    type: "tag",
    printingType: "bw",
    material: "paper",
    shape: "custom",
    size: "25mm diameter",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Embossed Label 80x40mm",
    type: "label",
    printingType: "embossed",
    material: "plastic",
    shape: "rectangular",
    size: "80x40mm",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    name: "Small Sticker 30x20mm",
    type: "sticker",
    printingType: "color",
    material: "paper",
    shape: "rectangular",
    size: "30x20mm",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

export const SUPPLIER_LABELS: SupplierLabel[] = [
  {
    id: "1",
    supplierId: "1",
    labelId: "1",
    unit: "pieces",
    unitPrice: 0.05,
    bulkPrice: 0.05,
    quantityForBulkPrice: 1,
    moq: 1000,
    tax: 5,
    leadTime: 5,
    availability: "in-stock",
    notes: "Standard paper sticker, good for general use",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    supplierId: "1",
    labelId: "2",
    unit: "pieces",
    unitPrice: 0.25,
    bulkPrice: 0.25,
    quantityForBulkPrice: 1,
    moq: 500,
    tax: 5,
    leadTime: 7,
    availability: "in-stock",
    notes: "Premium vinyl label with foil printing",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "3",
    supplierId: "2",
    labelId: "3",
    unit: "pieces",
    unitPrice: 0.08,
    bulkPrice: 0.08,
    quantityForBulkPrice: 1,
    moq: 2000,
    tax: 5,
    leadTime: 4,
    availability: "in-stock",
    notes: "Round paper tag, suitable for hanging",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "4",
    supplierId: "2",
    labelId: "4",
    unit: "pieces",
    unitPrice: 0.35,
    bulkPrice: 0.35,
    quantityForBulkPrice: 1,
    moq: 300,
    tax: 5,
    leadTime: 10,
    availability: "limited",
    notes: "Embossed plastic label, premium quality",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "5",
    supplierId: "3",
    labelId: "5",
    unit: "pieces",
    unitPrice: 0.03,
    bulkPrice: 0.03,
    quantityForBulkPrice: 1,
    moq: 5000,
    tax: 5,
    leadTime: 3,
    availability: "in-stock",
    notes: "Small paper sticker for minimal labeling",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
];
