// src/app/labels/components/labels-constants.tsx
import {
  Label,
  LabelFormData,
  LabelMaterialType,
  LabelType,
  PrintingType,
  ShapeType,
  SupplierLabel,
  SupplierLabelFormData,
} from "@/types/label-types";

/**
 * Default form data structure for creating new labels
 * Provides empty initial values for all required fields
 */
export const DEFAULT_LABEL_FORM: LabelFormData = {
  name: "",
  type: "sticker",
  printingType: "bw",
  material: "paper",
  shape: "rectangular",
  size: "",
  notes: "",
};

/**
 * Default form data structure for creating new supplier label relationships
 * Provides sensible defaults for label specifications and pricing
 */
export const DEFAULT_SUPPLIER_LABEL_FORM: SupplierLabelFormData = {
  supplierId: "",
  labelName: "",
  labelId: "",
  labelType: "sticker",
  printingType: "bw",
  material: "paper",
  shape: "rectangular",
  size: "",
  bulkPrice: 0,
  quantityForBulkPrice: 1,
  unit: "pieces",
  tax: 0,
  moq: 1,
  leadTime: 7,
  transportationCost: 0,
  bulkDiscounts: [],
  notes: "",
};

/**
 * Sample AI insights data for labels analytics demonstration
 * These represent typical recommendations and alerts for label management
 */
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

/**
 * Core label type definitions with associated colors for UI consistency
 * Used throughout the application for dropdowns, filters, and visualizations
 */
export const LABEL_TYPES = [
  { value: "sticker" as const, label: "Sticker", color: "#2563EB" },
  { value: "label" as const, label: "Label", color: "#7C3AED" },
  { value: "tag" as const, label: "Tag", color: "#b52727ff" },
  { value: "other" as const, label: "Other", color: "#9CA3AF" },
] as const;

/**
 * Printing technology options with color coding
 * Represents different printing methods available for labels
 */
export const PRINTING_TYPES = [
  { value: "bw" as const, label: "Black & White", color: "#424c5cff" },
  { value: "color" as const, label: "Color", color: "#43bf36ff" },
  { value: "foil" as const, label: "Foil", color: "#417affff" },
  { value: "embossed" as const, label: "Embossed", color: "#dd486dff" },
] as const;

/**
 * Material options for labels with consistent color coding
 * Covers common materials used in label production
 */
export const MATERIAL_TYPES = [
  { value: "paper" as const, label: "Paper", color: "#4cce00ff" },
  { value: "vinyl" as const, label: "Vinyl", color: "#00a0bcff" },
  { value: "plastic" as const, label: "Plastic", color: "#D97706" },
  { value: "other" as const, label: "Other", color: "#BE123C" },
] as const;

/**
 * Shape options for labels
 * Currently supports rectangular and custom shapes
 */
export const SHAPE_TYPES = [
  { value: "rectangular" as const, label: "Rectangular", color: "#10B981" },
  { value: "custom" as const, label: "Custom", color: "#8B5CF6" },
] as const;

/**
 * Derived arrays for just values, used in validation and form options
 */
export const LABEL_TYPE_VALUES = LABEL_TYPES.map((t) => t.value);
export const PRINTING_TYPE_VALUES = PRINTING_TYPES.map((t) => t.value);
export const MATERIAL_TYPE_VALUES = MATERIAL_TYPES.map((m) => m.value);
export const SHAPE_TYPE_VALUES = SHAPE_TYPES.map((s) => s.value);

/**
 * Derived arrays for labels, used in UI display components
 */
export const LABEL_TYPE_LABELS = LABEL_TYPES.map((t) => t.label);
export const PRINTING_TYPE_LABELS = PRINTING_TYPES.map((t) => t.label);
export const MATERIAL_TYPE_LABELS = MATERIAL_TYPES.map((m) => m.label);
export const SHAPE_TYPE_LABELS = SHAPE_TYPES.map((s) => s.label);

/**
 * Optimized lookup maps for O(1) color retrieval by value
 */
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

/**
 * Optimized lookup maps for O(1) label retrieval by value
 */
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

/**
 * Utility functions for retrieving display properties with fallback defaults
 */
const DEFAULT_COLOR = "#6b7280";

/**
 * Get the associated color for a label type
 */
export const getLabelTypeColor = (type: LabelType): string => {
  return LABEL_TYPE_COLOR_MAP.get(type) ?? DEFAULT_COLOR;
};

/**
 * Get the associated color for a printing type
 */
export const getPrintingTypeColor = (printingType: PrintingType): string => {
  return PRINTING_TYPE_COLOR_MAP.get(printingType) ?? DEFAULT_COLOR;
};

/**
 * Get the associated color for a material type
 */
export const getMaterialTypeColor = (material: LabelMaterialType): string => {
  return MATERIAL_TYPE_COLOR_MAP.get(material) ?? DEFAULT_COLOR;
};

/**
 * Get the associated color for a shape type
 */
export const getShapeTypeColor = (shape: ShapeType): string => {
  return SHAPE_TYPE_COLOR_MAP.get(shape) ?? DEFAULT_COLOR;
};

/**
 * Get the human-readable label for a label type
 */
export const getLabelTypeLabel = (type: LabelType): string => {
  return LABEL_TYPE_LABEL_MAP.get(type) ?? type;
};

/**
 * Get the human-readable label for a printing type
 */
export const getPrintingTypeLabel = (printingType: PrintingType): string => {
  return PRINTING_TYPE_LABEL_MAP.get(printingType) ?? printingType;
};

/**
 * Get the human-readable label for a material type
 */
export const getMaterialTypeLabel = (material: LabelMaterialType): string => {
  return MATERIAL_TYPE_LABEL_MAP.get(material) ?? material;
};

/**
 * Get the human-readable label for a shape type
 */
export const getShapeTypeLabel = (shape: ShapeType): string => {
  return SHAPE_TYPE_LABEL_MAP.get(shape) ?? shape;
};

/**
 * Type guard functions for runtime type validation
 */
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

/**
 * Sample label data for development and testing
 * Represents common label types with various printing and material options
 */
export const LABELS: Label[] = [
  {
    id: "1",
    name: "Standard Sticker Label",
    type: "sticker",
    printingType: "color",
    material: "paper",
    shape: "rectangular",
    size: "50x30mm",
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
    notes: "Made from recycled materials",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

/**
 * Sample supplier label relationships with pricing and specifications
 * Demonstrates various printing types, materials, and bulk pricing structures
 */
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
    transportationCost: 8,
    notes: "Standard quality sticker labels",
    createdAt: "2024-01-15T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 15,
    notes: "Premium foil printing available",
    createdAt: "2024-01-15T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 6,
    notes: "Custom die-cutting service available",
    createdAt: "2024-01-20T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 18,
    notes: "Specialized embossing equipment",
    createdAt: "2024-01-20T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 4,
    notes: "Bulk pricing for small labels",
    createdAt: "2024-02-01T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 10,
    notes: "Large format printing capabilities",
    createdAt: "2024-02-01T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 12,
    notes: "Security features available",
    createdAt: "2024-01-15T00:00:00.000Z",
    tax: 5,
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

    transportationCost: 5,
    notes: "Eco-friendly materials",
    createdAt: "2024-01-20T00:00:00.000Z",
    tax: 5,
  },
];
