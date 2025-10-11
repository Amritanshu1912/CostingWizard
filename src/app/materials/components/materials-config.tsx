import { TrendingUp, Target, AlertTriangle, DollarSign } from "lucide-react";

// Chart Colors
export const CHART_COLORS = {
  light: {
    chart1: "rgb(66, 153, 225)",
    chart2: "rgb(237, 137, 54)",
    chart3: "rgb(104, 178, 168)",
    chart4: "rgb(213, 186, 142)",
    chart5: "rgb(59, 130, 123)",
  },
  dark: {
    chart1: "rgb(95, 174, 255)",
    chart2: "rgb(243, 154, 78)",
    chart3: "rgb(133, 199, 189)",
    chart4: "rgb(223, 203, 167)",
    chart5: "rgb(89, 150, 143)",
  },
} as const;

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

export const UNITS = ["kg", "liters", "pieces", "meters"] as const;

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
  unitPrice: 0,
  currency: "INR" as const,
  moq: 1,
  unit: "kg" as const,
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
