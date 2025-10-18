import {
  LabelType,
  PrintingType,
  LabelMaterialType,
  ShapeType,
  Label,
  SupplierLabel,
} from "@/lib/types";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign,
  Tag,
  Clock,
} from "lucide-react";

// ============================================================================
// ANALYTICS DATA
// ============================================================================

export const PRICE_HISTORY_DATA = [
  { month: "Jan", avgPrice: 0.08, labels: 8500 },
  { month: "Feb", avgPrice: 0.09, labels: 8800 },
  { month: "Mar", avgPrice: 0.07, labels: 9200 },
  { month: "Apr", avgPrice: 0.11, labels: 9500 },
  { month: "May", avgPrice: 0.13, labels: 9800 },
  { month: "Jun", avgPrice: 0.12, labels: 10200 },
];

export const LABELS_USAGE_DATA = [
  { label: "Standard Stickers", usage: 12500, cost: 625, efficiency: 94 },
  { label: "Premium Labels", usage: 4200, cost: 1470, efficiency: 89 },
  { label: "Paper Tags", usage: 3800, cost: 304, efficiency: 91 },
  { label: "Embossed Labels", usage: 1800, cost: 630, efficiency: 87 },
  { label: "Custom Shapes", usage: 2100, cost: 441, efficiency: 93 },
];

export const KEY_METRICS = [
  {
    type: "progress",
    title: "Price Volatility",
    value: "+4.2%",
    icon: TrendingUp,
    iconClassName: "text-accent",
    progress: {
      current: 58,
      max: 100,
      label: "Moderate",
      color: "warning" as const,
    },
  },
  {
    type: "progress",
    title: "Print Quality Score",
    value: "92%",
    icon: Target,
    iconClassName: "text-primary",
    progress: {
      current: 92,
      max: 100,
      label: "Excellent",
      color: "success" as const,
    },
  },
  {
    type: "badge",
    title: "Stock Alerts",
    value: 1,
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
    value: "₹3.2L",
    icon: DollarSign,
    iconClassName: "text-accent",
    trend: {
      value: "+18%",
      isPositive: true,
      label: "this month",
    },
  },
  {
    type: "standard",
    title: "Avg Lead Time",
    value: "6 days",
    icon: Clock,
    iconClassName: "text-primary",
    trend: {
      value: "-1 day",
      isPositive: true,
      label: "improvement",
    },
  },
];

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
// PRINTING TYPE DISTRIBUTION DATA
// ============================================================================

export const PRINTING_TYPE_DISTRIBUTION = [
  { name: "Black & White", value: 35, color: "#424c5cff" },
  { name: "Color", value: 40, color: "#43bf36ff" },
  { name: "Foil", value: 15, color: "#417affff" },
  { name: "Embossed", value: 10, color: "#dd486dff" },
];

// ============================================================================
// LABEL TYPE DISTRIBUTION DATA
// ============================================================================

export const LABEL_TYPE_DISTRIBUTION = [
  { name: "Stickers", value: 50, color: "#2563EB" },
  { name: "Labels", value: 30, color: "#7C3AED" },
  { name: "Tags", value: 15, color: "#b52727ff" },
  { name: "Other", value: 5, color: "#9CA3AF" },
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
