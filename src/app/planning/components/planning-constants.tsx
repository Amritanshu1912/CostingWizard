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

// Material cost breakdown data for chart
export const MATERIAL_COST_BREAKDOWN = [
  { material: "Citric Acid", cost: 4394, percentage: 35 },
  { material: "AOS Powder", cost: 4560, percentage: 36 },
  { material: "CBS-X", cost: 2200, percentage: 18 },
  { material: "Soda Ash", cost: 1229, percentage: 10 },
  { material: "Others", cost: 567, percentage: 1 },
];

// Procurement recommendations
export const PROCUREMENT_RECOMMENDATIONS = [
  {
    type: "urgent" as const,
    title: "Urgent Procurement",
    description:
      "Order Soda Ash (30 kg) and AOS Powder (30 kg) immediately to avoid production delays",
    cost: 5790,
    leadTime: "5-7 days",
    icon: AlertCircle,
    bgColor: "accent",
  },
  {
    type: "bulk" as const,
    title: "Bulk Order Opportunity",
    description:
      "Combine orders for Q2 to get 12% volume discount on Citric Acid and Caustic Soda",
    savings: 3240,
    icon: Factory,
    bgColor: "primary",
  },
  {
    type: "optimization" as const,
    title: "Inventory Optimization",
    description:
      "Current NaCl stock will last 3 months. Consider reducing next order by 25%",
    savings: 450,
    icon: Clock,
    bgColor: "secondary",
  },
  {
    type: "quality" as const,
    title: "Quality Assurance",
    description:
      "Schedule quality testing for incoming Ammonia batch before production start",
    window: "2 days before production",
    icon: CheckCircle,
    bgColor: "muted",
  },
];

export const planningProductionEfficiencyCards = [
  {
    title: "Production Efficiency",
    value: "87%",
    change: "+2.1%",
    changeText: "vs last month",
    icon: Factory,
  },
  {
    title: "On-Time Delivery",
    value: "92%",
    change: "+1.5%",
    changeText: "vs last month",
    icon: Clock,
  },
  {
    title: "Resource Utilization",
    value: "84%",
    change: "+3.2%",
    changeText: "vs last month",
    icon: Target,
  },
  {
    title: "Cost Variance",
    value: "-5.2%",
    change: "Improved",
    changeText: "vs budget",
    icon: DollarSign,
  },
];

export const planningProductionTimeline = [
  {
    month: "Jan",
    planned: 1200,
    actual: 1150,
    capacity: 1400,
  },
  {
    month: "Feb",
    planned: 1300,
    actual: 1280,
    capacity: 1400,
  },
  {
    month: "Mar",
    planned: 1100,
    actual: 1080,
    capacity: 1400,
  },
  {
    month: "Apr",
    planned: 1400,
    actual: 1420,
    capacity: 1400,
  },
  {
    month: "May",
    planned: 1350,
    actual: 1380,
    capacity: 1400,
  },
  {
    month: "Jun",
    planned: 1250,
    actual: 1220,
    capacity: 1400,
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

export const planningPerformanceMetrics = [
  {
    metric: "Overall Efficiency",
    value: 87,
    target: 85,
    status: "good",
  },
  {
    metric: "Quality Rate",
    value: 96,
    target: 95,
    status: "excellent",
  },
  {
    metric: "On-Time Delivery",
    value: 92,
    target: 90,
    status: "excellent",
  },
  {
    metric: "Cost Control",
    value: 88,
    target: 85,
    status: "good",
  },
];

export const planningBenchmarkData = [
  { metric: "Efficiency", yours: 87, industry: 82 },
  { metric: "Quality", yours: 96, industry: 89 },
  { metric: "Delivery", yours: 92, industry: 87 },
  { metric: "Cost", yours: 88, industry: 84 },
];
