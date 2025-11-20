import { ProductionBatch } from "@/lib/types";
import {
  TrendingUp,
  Factory,
  Clock,
  Target,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

export const PRODUCTION_BATCHES: ProductionBatch[] = [
  {
    id: "batch-1",
    batchName: "Q1 Production Batch",
    description: "First quarter production planning",
    startDate: "2024-01-15",
    endDate: "2024-03-31",
    status: "in-progress",
    progress: 65,
    items: [
      {
        productId: "product-1", // Premium Floor Cleaner
        variants: [
          {
            variantId: "variant-1-1", // 5L Bottle
            fillQuantity: 2500, // 2.5L = 2500ml
            fillUnit: "ml",
          },
          {
            variantId: "variant-1-2", // 1L Bottle
            fillQuantity: 5000, // 5L = 5000ml
            fillUnit: "ml",
          },
        ],
      },
      {
        productId: "product-2", // Eco-Friendly Dish Soap
        variants: [
          {
            variantId: "variant-2-1", // 1L Bottle
            fillQuantity: 3000, // 3L = 3000ml
            fillUnit: "ml",
          },
        ],
      },
    ],
    totalUnits: 850, // 250 + 500 + 100 units
    totalFillQuantity: 10500, // 2500 + 5000 + 3000 ml
    totalCost: 23828,
    totalRevenue: 38500,
    totalProfit: 14672,
    profitMargin: 38.1,
    createdAt: "2024-01-10",
  },
  {
    id: "batch-2",
    batchName: "Special Order Batch",
    description: "Custom order for large client",
    startDate: "2024-02-01",
    endDate: "2024-02-15",
    status: "scheduled",
    progress: 0,
    items: [
      {
        productId: "product-5", // Glass Cleaner Streak-Free
        variants: [
          {
            variantId: "variant-5-1", // 750ml Spray Bottle
            fillQuantity: 1500, // 1.5L = 1500ml
            fillUnit: "ml",
          },
        ],
      },
      {
        productId: "product-3", // Ultra Bleach Formula
        variants: [
          {
            variantId: "variant-3-1", // 2L Bottle
            fillQuantity: 4000, // 4L = 4000ml
            fillUnit: "ml",
          },
        ],
      },
    ],
    totalUnits: 275, // 200 + 75 units
    totalFillQuantity: 5500, // 1500 + 4000 ml
    totalCost: 4430,
    totalRevenue: 7600,
    totalProfit: 3170,
    profitMargin: 41.7,
    createdAt: "2024-01-25",
  },
  {
    id: "batch-3",
    batchName: "Monthly Kitchen Products",
    description: "Regular production of kitchen cleaning products",
    startDate: "2024-02-15",
    endDate: "2024-02-28",
    status: "draft",
    progress: 0,
    items: [
      {
        productId: "product-4", // Kitchen Degreaser Pro
        variants: [
          {
            variantId: "variant-4-1", // 5L Container
            fillQuantity: 10000, // 10L = 10000ml
            fillUnit: "ml",
          },
          {
            variantId: "variant-4-2", // 1L Spray Bottle
            fillQuantity: 2000, // 2L = 2000ml
            fillUnit: "ml",
          },
        ],
      },
    ],
    totalUnits: 120, // 20 + 100 units
    totalFillQuantity: 12000, // 10000 + 2000 ml
    totalCost: 15200,
    totalRevenue: 22800,
    totalProfit: 7600,
    profitMargin: 33.3,
    createdAt: "2024-02-01",
  },
];

// Status mappings for production plans
export const STATUS_CONFIG = {
  completed: {
    color: "default" as const,
    icon: CheckCircle,
  },
  "in-progress": {
    color: "default" as const,
    icon: Factory,
  },
  scheduled: {
    color: "secondary" as const,
    icon: Clock,
  },
  cancelled: {
    color: "destructive" as const,
    icon: AlertCircle,
  },
  draft: {
    color: "outline" as const,
    icon: Calendar,
  },
};

// Material inventory data (hardcoded for now, could be moved to API)
export const MATERIAL_INVENTORY = [
  {
    name: "NaCl",
    available: 200,
    required: 175,
    unit: "kg",
    cost: 6,
  },
  {
    name: "Soda Ash",
    available: 80,
    required: 110,
    unit: "kg",
    cost: 40.95,
  },
  {
    name: "Citric Acid",
    available: 60,
    required: 45,
    unit: "kg",
    cost: 97.65,
  },
  {
    name: "Caustic Soda",
    available: 25,
    required: 15,
    unit: "kg",
    cost: 59.85,
  },
  {
    name: "Ammonia",
    available: 30,
    required: 20,
    unit: "kg",
    cost: 45.0,
  },
  {
    name: "AOS Powder 96%",
    available: 45,
    required: 75,
    unit: "kg",
    cost: 152,
  },
];

export const planningAIInsights = [
  {
    type: "optimization",
    title: "Production Optimization",
    description:
      "Schedule adjustments could increase efficiency by 8% next quarter",
    impact: "High",
    confidence: 89,
  },
  {
    type: "capacity",
    title: "Capacity Planning",
    description:
      "Current capacity utilization suggests need for additional shifts",
    impact: "Medium",
    confidence: 82,
  },
  {
    type: "forecasting",
    title: "Demand Forecasting",
    description:
      "Seasonal demand patterns indicate 15% increase in Q4 production",
    impact: "High",
    confidence: 91,
  },
  {
    type: "maintenance",
    title: "Maintenance Scheduling",
    description:
      "Preventive maintenance on Line 2 could reduce downtime by 20%",
    impact: "Medium",
    confidence: 78,
  },
];
