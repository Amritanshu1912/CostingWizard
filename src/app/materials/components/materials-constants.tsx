import { TrendingUp, Target, AlertTriangle, DollarSign } from "lucide-react";

export const CHART_COLORS = {
  light: {
    chart1: "rgb(66, 153, 225)", // Ocean blue (--chart-1)
    chart2: "rgb(237, 137, 54)", // Coral (--chart-2)
    chart3: "rgb(104, 178, 168)", // Seafoam (--chart-3)
    chart4: "rgb(213, 186, 142)", // Sandy beige (--chart-4)
    chart5: "rgb(59, 130, 123)", // Teal (--chart-5)
  },
  dark: {
    chart1: "rgb(95, 174, 255)", // Bright ocean (--chart-1 dark)
    chart2: "rgb(243, 154, 78)", // Bright coral (--chart-2 dark)
    chart3: "rgb(133, 199, 189)", // Bright seafoam (--chart-3 dark)
    chart4: "rgb(223, 203, 167)", // Light sandy (--chart-4 dark)
    chart5: "rgb(89, 150, 143)", // Bright teal (--chart-5 dark)
  },
} as const;

export const priceHistoryData = [
  { month: "Jan", avgPrice: 245.5, materials: 142 },
  { month: "Feb", avgPrice: 251.2, materials: 145 },
  { month: "Mar", avgPrice: 248.8, materials: 148 },
  { month: "Apr", avgPrice: 255.3, materials: 152 },
  { month: "May", avgPrice: 262.1, materials: 156 },
  { month: "Jun", avgPrice: 258.9, materials: 159 },
];

export const materialUsage = [
  { material: "NaCl", usage: 450, cost: 2700, efficiency: 95 },
  { material: "Soda Ash", usage: 320, cost: 13104, efficiency: 88 },
  { material: "CBS-X", usage: 15, cost: 33862, efficiency: 92 },
  { material: "Caustic Soda", usage: 180, cost: 10773, efficiency: 90 },
  { material: "AOS Powder 96%", usage: 250, cost: 38850, efficiency: 85 },
];

export const materialsKeyMetrics = [
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

export const materialsAIInsights = [
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

export const materialsPerformanceMetrics = [
  {
    metric: "Cost Efficiency",
    value: 89,
    target: 85,
    status: "good",
  },
  {
    metric: "Quality Score",
    value: 94,
    target: 90,
    status: "excellent",
  },
  {
    metric: "Delivery Performance",
    value: 87,
    target: 90,
    status: "warning",
  },
  {
    metric: "Supplier Reliability",
    value: 92,
    target: 88,
    status: "good",
  },
];

export const materialsBenchmarkData = [
  { metric: "Cost Efficiency", yours: 89, industry: 82 },
  { metric: "Quality", yours: 94, industry: 88 },
  { metric: "Delivery", yours: 87, industry: 85 },
  { metric: "Innovation", yours: 76, industry: 79 },
];

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

export const DEFAULT_SUPPLIER_FORM = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  rating: 5,
  isActive: true,
  paymentTerms: "30 days" as const,
  leadTime: 7,
  notes: "",
};

export const DEFAULT_MATERIAL_FORM = {
  supplierId: "",
  materialName: "",
  materialCategory: "",
  unitPrice: 0,
  tax: 0,
  currency: "INR" as const,
  moq: 1,
  unit: "kg" as const,
  bulkDiscounts: [],
  leadTime: 7,
  availability: "in-stock" as const,
  transportationCost: 0,
  notes: "",
};
