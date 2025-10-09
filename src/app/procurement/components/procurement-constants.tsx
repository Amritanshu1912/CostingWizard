import { SUPPLIERS } from "@/lib/constants";
import { Supplier } from "@/lib/types";
import {
  DollarSign,
  Award,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock4,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

// ===========================================================================
// DASHBOARD CONSTANTS
// ===========================================================================

/**
 * Defines the main summary metrics for the Procurement Dashboard.
 */
export const SUMMARY_METRICS = [
  {
    title: "Total Suppliers",
    value: "",
    change: "+1",
    trend: "up" as const,
    icon: Package,
    color: "text-green-600",
    description: "this month",
  },
  {
    title: "Active Orders",
    value: "",
    change: "",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "text-muted-foreground",
    description: "pending delivery",
  },
  {
    title: "Total Spend (Q3)",
    value: "₹2.5M",
    change: "-1.2%",
    trend: "down" as const,
    icon: DollarSign,
    color: "text-red-600",
    description: "Quarterly expenditure",
  },
  {
    title: "Avg Delivery Time",
    value: "",
    change: "",
    trend: "up" as const,
    icon: Clock,
    color: "text-muted-foreground",
    description: "across all suppliers",
  },
];

// ===========================================================================
// STATUS MAPPINGS & UI
// ===========================================================================

/**
 * Provides a consistent label, color, and icon for Purchase Order statuses.
 */
export const ORDER_STATUS_MAP = {
  draft: { label: "Draft", variant: "default" as const, icon: Clock4 },
  submitted: { label: "Submitted", variant: "secondary" as const, icon: Clock },
  pending: {
    label: "Pending",
    variant: "warning" as const,
    icon: AlertTriangle,
  },
  confirmed: {
    label: "Confirmed",
    variant: "info" as const,
    icon: CheckCircle,
  },
  shipped: { label: "Shipped", variant: "primary" as const, icon: Truck },
  delivered: {
    label: "Delivered",
    variant: "success" as const,
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

/**
 * Provides a consistent label, color, and icon for Availability statuses.
 */

export const AVAILABILITY_MAP = {
  "in-stock": {
    label: "In Stock",
    variant: "default" as const,
    icon: CheckCircle,
  },
  limited: {
    label: "Limited Stock",
    variant: "secondary" as const,
    icon: AlertTriangle,
  },
  "out-of-stock": {
    label: "Out of Stock",
    variant: "destructive" as const,
    icon: XCircle,
  },
  default: {
    label: "Unknown",
    variant: "outline" as const,
    icon: Package,
  },
} as const;

// ===========================================================================
// TABLE COLUMNS (Procurement Orders)
// ===========================================================================

/**
 * Defines the columns for the Purchase Orders table.
 * Assumes a generic column type that matches the SortableTable component.
 */
export const ORDER_COLUMNS = [
  {
    key: "orderId", // Display unique identifier
    header: "Order ID",
    sortable: true,
  },
  {
    key: "supplierName",
    header: "Supplier",
    sortable: true,
  },
  {
    key: "dateCreated",
    header: "Date Created",
    sortable: true,
  },
  {
    key: "totalCost",
    header: "Total Cost",
    sortable: true,
    // Using string key here but value will be rendered as number/currency
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
  },
  {
    key: "deliveryDate",
    header: "Delivery Date",
    sortable: true,
  },
];

/**
 * Defines the columns for the Suppliers table.
 */
export const SUPPLIER_COLUMNS = [
  {
    key: "name",
    header: "Supplier",
  },
  {
    key: "contact",
    header: "Contact",
  },
  {
    key: "materials",
    header: "Materials",
  },
  {
    key: "rating",
    header: "Rating",
  },
  {
    key: "onTime",
    header: "On-time Delivery",
  },
  {
    key: "quality",
    header: "Quality Score",
  },
  {
    key: "price",
    header: "Price Competitiveness",
  },
];

/**
 * Defines the columns for the Purchase Orders table in the UI.
 */
export const PURCHASE_ORDER_COLUMNS = [
  {
    key: "id",
    header: "Order ID",
  },
  {
    key: "supplierName",
    header: "Supplier",
  },
  {
    key: "items",
    header: "Items",
  },
  {
    key: "dateCreated",
    header: "Order Date",
  },
  {
    key: "deliveryDate",
    header: "Expected Delivery",
  },
  {
    key: "totalCost",
    header: "Total Value",
  },
  {
    key: "status",
    header: "Status",
  },
];

// ===========================================================================
// ANALYTICS DATA
// ===========================================================================
/**
 *  Generates supplier performance data for charts from the main suppliers list.
 *  This function requires the suppliers array to be passed in.
 */
export function getSupplierPerformanceData(suppliers: Supplier[]) {
  return (suppliers || []).map((supplier: Supplier) => ({
    name: supplier.name.split(" ")[0],
    onTime: supplier.performance?.onTimeDelivery,
    quality: supplier.performance?.qualityScore,
    price: supplier.performance?.priceCompetitiveness,
    rating: supplier.rating * 20,
  }));
}

/**
 * Data for the Monthly Procurement Spend chart.
 */
export const MONTHLY_SPEND_DATA = [
  { month: "Jan", spend: 45000, orders: 12, suppliers: 3 },
  { month: "Feb", spend: 52000, orders: 15, suppliers: 4 },
  { month: "Mar", spend: 48000, orders: 13, suppliers: 3 },
  { month: "Apr", spend: 61000, orders: 18, suppliers: 5 },
  { month: "May", spend: 58000, orders: 16, suppliers: 4 },
  { month: "Jun", spend: 67000, orders: 20, suppliers: 5 },
];

/**
 * Data for the MOQ vs. Cost analysis charts.
 */
export const MATERIAL_COST_DATA = [
  { material: "Acid Blue", cost: 1650, moq: 25, suppliers: 2 },
  { material: "Citric Acid", cost: 95, moq: 50, suppliers: 2 },
  { material: "AOS Powder", cost: 152, moq: 30, suppliers: 1 },
  { material: "CBS-X", cost: 2200, moq: 10, suppliers: 1 },
  { material: "Caustic Soda", cost: 58, moq: 100, suppliers: 1 },
];

/**
 * Data for the Order Status Distribution pie chart.
 */
export const ORDER_STATUS_DATA = [
  { name: "Delivered", value: 45, color: "#22c55e" },
  { name: "Confirmed", value: 30, color: "#3b82f6" },
  { name: "Sent", value: 20, color: "#f59e0b" },
  { name: "Cancelled", value: 5, color: "#ef4444" },
];

export const procurementCostSavings = {
  value: "₹12,450",
  change: "+8.5% improvement",
};

export const procurementLeadTime = {
  value: "6.8 days",
  change: "-1.2 days vs last month",
};

export const procurementQualityScore = {
  value: "87.3%",
  change: "+2.1% this month",
};
