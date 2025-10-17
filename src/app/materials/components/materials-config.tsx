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

export const PAYMENT_TERMS = [
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "Advance",
] as const;

export const CURRENCIES = ["INR", "USD", "EUR"] as const;

export const UNITS = ["kg", "gm", "liters", "pieces", "meters"] as const;

export const AVAILABILITY_OPTIONS = [
  "in-stock",
  "limited",
  "out-of-stock",
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

// Analytics Data
export const PRICE_HISTORY_DATA = [
  { month: "Jan", avgPrice: 245.5, materials: 142 },
  { month: "Feb", avgPrice: 251.2, materials: 145 },
  { month: "Mar", avgPrice: 248.8, materials: 148 },
  { month: "Apr", avgPrice: 255.3, materials: 152 },
  { month: "May", avgPrice: 262.1, materials: 156 },
  { month: "Jun", avgPrice: 258.9, materials: 159 },
];

export const MATERIAL_USAGE_DATA = [
  { material: "NaCl", usage: 450, cost: 2700, efficiency: 95 },
  { material: "Soda Ash", usage: 320, cost: 13104, efficiency: 88 },
  { material: "CBS-X", usage: 15, cost: 33862, efficiency: 92 },
  { material: "Caustic Soda", usage: 180, cost: 10773, efficiency: 90 },
  { material: "AOS Powder 96%", usage: 250, cost: 38850, efficiency: 85 },
];

export const KEY_METRICS = [
  {
    type: "progress",
    title: "Price Volatility",
    value: "+5.2%",
    icon: TrendingUp,
    iconClassName: "text-accent",
    progress: {
      current: 65,
      max: 100,
      label: "Above average",
      color: "warning" as const,
    },
  },
  {
    type: "progress",
    title: "Cost Efficiency",
    value: "89%",
    icon: Target,
    iconClassName: "text-primary",
    progress: {
      current: 89,
      max: 100,
      label: "Excellent",
      color: "success" as const,
    },
  },
  {
    type: "badge",
    title: "Stock Alerts",
    value: 3,
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
    value: "₹5.2L",
    icon: DollarSign,
    iconClassName: "text-accent",
    trend: {
      value: "+12%",
      isPositive: true,
      label: "this month",
    },
  },
];

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
