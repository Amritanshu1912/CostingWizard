// src/app/suppliers/components/suppliers-items-tab/stock-status-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";

type StockStatus =
  | "in-stock"
  | "overstock"
  | "low-stock"
  | "out-of-stock"
  | undefined;

interface StockStatusBadgeProps {
  status?: StockStatus;
}

/**
 * Displays a colored badge for inventory stock status.
 * Auto-selects badge variant based on status value.
 */
export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  switch (status) {
    case "in-stock":
      return (
        <Badge variant="default" className="shadow-sm">
          In Stock
        </Badge>
      );
    case "overstock":
      return (
        <Badge variant="default" className="shadow-sm bg-blue-600">
          Over Stock
        </Badge>
      );
    case "low-stock":
      return (
        <Badge variant="secondary" className="shadow-sm">
          Low Stock
        </Badge>
      );
    case "out-of-stock":
      return (
        <Badge variant="destructive" className="shadow-sm">
          Out of Stock
        </Badge>
      );
    default:
      return <Badge variant="outline">Not Tracked</Badge>;
  }
}

/**
 * Formats price value to INR currency format
 */
export function formatINR(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}
