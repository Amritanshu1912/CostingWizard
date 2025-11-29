// src/app/batches/components/batches-constants.tsx
import { ProductionBatch } from "@/lib/types";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Factory,
} from "lucide-react";

export const PRODUCTION_BATCHES: ProductionBatch[] = [
  {
    id: "batch-1",
    batchName: "Q1 Production Batch",
    description: "First quarter production planning",
    startDate: "2024-01-15",
    endDate: "2024-03-31",
    status: "in-progress",
    items: [
      {
        productId: "product-1", // Premium Floor Cleaner
        variants: [
          {
            variantId: "variant-1-1", // 5L Bottle
            totalFillQuantity: 55, // 55L
            fillUnit: "L",
          },
          {
            variantId: "variant-1-2", // 1L Bottle
            totalFillQuantity: 50, // 50L = 5000ml
            fillUnit: "L",
          },
        ],
      },
      {
        productId: "product-2", // Eco-Friendly Dish Soap
        variants: [
          {
            variantId: "variant-2-1", // 1L Bottle
            totalFillQuantity: 30, // 3L = 3000ml
            fillUnit: "L",
          },
        ],
      },
    ],
    createdAt: "2024-01-10",
  },
  {
    id: "batch-2",
    batchName: "Special Order Batch",
    description: "Custom order for large client",
    startDate: "2024-02-01",
    endDate: "2024-02-15",
    status: "scheduled",
    items: [
      {
        productId: "product-5", // Glass Cleaner Streak-Free
        variants: [
          {
            variantId: "variant-5-1", // 750ml Spray Bottle
            totalFillQuantity: 50,
            fillUnit: "L",
          },
        ],
      },
      {
        productId: "product-3", // Ultra Bleach Formula
        variants: [
          {
            variantId: "variant-3-1", // 2L Bottle
            totalFillQuantity: 100,
            fillUnit: "L",
          },
        ],
      },
    ],

    createdAt: "2024-01-25",
  },
  {
    id: "batch-3",
    batchName: "Monthly Kitchen Products",
    description: "Regular production of kitchen cleaning products",
    startDate: "2024-02-15",
    endDate: "2024-02-28",
    status: "draft",
    items: [
      {
        productId: "product-4", // Kitchen Degreaser Pro
        variants: [
          {
            variantId: "variant-4-1", // 5L Container
            totalFillQuantity: 150,
            fillUnit: "L",
          },
          {
            variantId: "variant-4-2", // 1L Spray Bottle
            totalFillQuantity: 120,
            fillUnit: "L",
          },
        ],
      },
    ],

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
