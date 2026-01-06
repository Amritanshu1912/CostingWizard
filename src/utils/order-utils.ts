// src/utils/order-utils.ts
import {
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { OrderStatus, OrderStatusConfig } from "@/types/order-types";

export function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  const counter = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PO-${dateStr}-${counter}`;
}

export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  const configs: Record<OrderStatus, OrderStatusConfig> = {
    draft: {
      label: "Draft",
      variant: "outline",
      icon: Clock,
      color: "text-gray-600",
    },
    submitted: {
      label: "Submitted",
      variant: "secondary",
      icon: Clock,
      color: "text-blue-600",
    },
    confirmed: {
      label: "Confirmed",
      variant: "default",
      icon: CheckCircle,
      color: "text-green-600",
    },
    "in-transit": {
      label: "In Transit",
      variant: "default",
      icon: Truck,
      color: "text-blue-600",
    },
    "partially-delivered": {
      label: "Partial",
      variant: "secondary",
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    delivered: {
      label: "Delivered",
      variant: "default",
      icon: CheckCircle,
      color: "text-green-600",
    },
    cancelled: {
      label: "Cancelled",
      variant: "destructive",
      icon: XCircle,
      color: "text-red-600",
    },
  };
  return configs[status];
}

/**
 * Gets the status progression order
 * Used for timeline visualization
 *
 * @returns Array of statuses in order
 */
export function getStatusProgression(): OrderStatus[] {
  return [
    "draft",
    "submitted",
    "confirmed",
    "in-transit",
    "partially-delivered",
    "delivered",
  ];
}

/**
 * Checks if a status is a final state (no further progression)
 *
 * @param status - Order status to check
 * @returns True if status is final
 */
export function isFinalStatus(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

/**
 * Gets the next possible statuses from current status
 *
 * @param currentStatus - Current order status
 * @returns Array of possible next statuses
 */
export function getNextPossibleStatuses(
  currentStatus: OrderStatus
): OrderStatus[] {
  const progressionMap: Record<OrderStatus, OrderStatus[]> = {
    draft: ["submitted", "cancelled"],
    submitted: ["confirmed", "cancelled"],
    confirmed: ["in-transit", "cancelled"],
    "in-transit": ["partially-delivered", "delivered", "cancelled"],
    "partially-delivered": ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  return progressionMap[currentStatus] || [];
}

/**
 * Calculates order completion percentage
 * Based on items received vs ordered
 *
 * @param items - Array of order items
 * @returns Completion percentage (0-100)
 */
export function calculateOrderCompletion(
  items: Array<{ quantity: number; quantityReceived: number }>
): number {
  if (items.length === 0) return 0;

  const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = items.reduce(
    (sum, item) => sum + item.quantityReceived,
    0
  );

  if (totalOrdered === 0) return 0;

  return (totalReceived / totalOrdered) * 100;
}

/**
 * Formats order date for display
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculates days until expected delivery
 *
 * @param expectedDate - Expected delivery date string
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDelivery(expectedDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delivery = new Date(expectedDate);
  delivery.setHours(0, 0, 0, 0);

  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Checks if order is overdue
 *
 * @param order - Purchase order
 * @returns True if order is overdue
 */
export function isOrderOverdue(order: {
  status: OrderStatus;
  expectedDeliveryDate?: string;
}): boolean {
  if (!order.expectedDeliveryDate) return false;
  if (order.status === "delivered" || order.status === "cancelled")
    return false;

  return getDaysUntilDelivery(order.expectedDeliveryDate) < 0;
}
