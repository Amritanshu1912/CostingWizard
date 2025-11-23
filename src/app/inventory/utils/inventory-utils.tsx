// src/app/inventory/utils/inventory-utils.tsx
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Beaker,
  Box,
  Tag,
  Package,
} from "lucide-react";

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================================
// ICON UTILITIES
// ============================================================================

export function getTypeIcon(type: string) {
  switch (type) {
    case "supplierMaterial":
      return <Beaker className="h-4 w-4 text-blue-500" />;
    case "supplierPackaging":
      return <Box className="h-4 w-4 text-green-500" />;
    case "supplierLabel":
      return <Tag className="h-4 w-4 text-yellow-500" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

export function getTransactionTypeIcon(type: string) {
  switch (type) {
    case "in":
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    case "out":
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    case "adjustment":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
}

export function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "info":
      return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

// ============================================================================
// BADGE UTILITIES
// ============================================================================

export function getStatusBadge(status: string) {
  switch (status) {
    case "out-of-stock":
      return <Badge variant="destructive">⚫ Out of Stock</Badge>;
    case "low-stock":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          🔴 Low Stock
        </Badge>
      );
    case "in-stock":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-300"
        >
          🟢 In Stock
        </Badge>
      );
    case "overstock":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          🔵 Overstock
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "warning":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          Warning
        </Badge>
      );
    case "info":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          Info
        </Badge>
      );
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
}

export function getTransactionTypeBadge(type: string) {
  switch (type) {
    case "in":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-300"
        >
          Stock In
        </Badge>
      );
    case "out":
      return (
        <Badge
          variant="default"
          className="bg-red-100 text-red-800 border-red-300"
        >
          Stock Out
        </Badge>
      );
    case "adjustment":
      return <Badge variant="secondary">Adjustment</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export function getStockColor(status: string): string {
  switch (status) {
    case "out-of-stock":
      return "bg-destructive";
    case "low-stock":
      return "bg-yellow-500";
    case "overstock":
      return "bg-blue-500";
    default:
      return "bg-green-500";
  }
}
