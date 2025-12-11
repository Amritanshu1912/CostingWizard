// src/utils/inventory-utils.tsx
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Beaker,
  Bell,
  Box,
  CheckCircle2,
  Package,
  RefreshCw,
  Tag,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  InventoryItem,
  InventoryItemWithDetails,
  InventoryTransaction,
  ReferenceDataBundle,
} from "@/types/inventory-types";

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format number as Indian Rupee currency
 * @param value - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date for display in various formats
 * @param date - Date string or Date object
 * @param formatType - Type of format (short, long, datetime)
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  formatType: "short" | "long" | "datetime" = "short"
): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid date";

  switch (formatType) {
    case "short":
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(dateObj);

    case "long":
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateObj);

    case "datetime":
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(dateObj);

    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(
  str: string | undefined,
  maxLength: number = 80
): string {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength - 1) + "…" : str;
}

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate inventory item status based on stock levels
 * @param currentStock - Current stock amount
 * @param minStockLevel - Minimum threshold
 * @param maxStockLevel - Maximum threshold (optional)
 * @returns Status indicator
 */
export function calculateStatus(
  currentStock: number,
  minStockLevel: number,
  maxStockLevel?: number
): InventoryItem["status"] {
  if (currentStock === 0) return "out-of-stock";
  if (currentStock < minStockLevel) return "low-stock";
  if (maxStockLevel && currentStock > maxStockLevel) return "overstock";
  return "in-stock";
}

/**
 * Calculate new stock total based on mode
 * @param mode - "add" or "adjust"
 * @param currentStock - Current stock level
 * @param inputValue - Input value
 * @returns New total stock
 */
export function calculateNewStockTotal(
  mode: "add" | "adjust",
  currentStock: number,
  inputValue: number
): number {
  return mode === "add" ? currentStock + inputValue : inputValue;
}

// ============================================================================
// ITEM RESOLUTION & ENRICHMENT UTILITIES
// ============================================================================

/**
 * Create an untracked item (supplier item not yet in inventory)
 * @param id - Unique composite ID
 * @param itemType - Type of item
 * @param itemId - Supplier item ID
 * @param itemName - Display name
 * @param supplierName - Supplier name
 * @param supplierId - Supplier ID
 * @param unit - Unit of measurement
 * @param unitPrice - Price per unit
 * @param tax - Tax percentage
 * @returns Untracked item as InventoryItemWithDetails
 */
export function createUntrackedItem(
  id: string,
  itemType: InventoryItem["itemType"],
  itemId: string,
  itemName: string,
  supplierName: string,
  supplierId: string,
  unit: string,
  unitPrice: number,
  tax: number
): InventoryItemWithDetails {
  const now = new Date().toISOString();
  return {
    id,
    itemType,
    itemId,
    itemName,
    supplierName,
    supplierId,
    currentStock: 0,
    unit,
    minStockLevel: 0,
    status: "out-of-stock",
    createdAt: now,
    updatedAt: now,
    unitPrice,
    tax,
    stockValue: 0,
    stockPercentage: 0,
    isTracked: false,
  };
}

/**
 * Check if an item is untracked (not yet in inventory)
 * @param item - Item to check
 * @returns True if item is untracked
 */
export function isUntrackedItem(item: InventoryItemWithDetails): boolean {
  return !item.isTracked;
}

/**
 * Get item details (name, supplier, unit) from items array
 * @param itemId - Item ID to lookup
 * @param items - Array of items
 * @returns Item details or undefined
 */
export function getItemDetails(
  itemId: string,
  items: InventoryItemWithDetails[] | undefined
): { itemName: string; supplierName: string; unit: string } | undefined {
  const item = items?.find((i) => i.id === itemId);
  if (!item) return undefined;
  return {
    itemName: item.itemName,
    supplierName: item.supplierName,
    unit: item.unit,
  };
}

// ============================================================================
// ICON UTILITIES
// ============================================================================

/**
 * Get icon for inventory item type
 * @param type - Item type
 * @returns React icon component
 */
export function getTypeIcon(type: string): ReactNode {
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

/**
 * Get icon for transaction type
 * @param type - Transaction type
 * @returns React icon component
 */
export function getTransactionTypeIcon(type: string): ReactNode {
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

/**
 * Get icon for alert severity
 * @param severity - Alert severity level
 * @returns React icon component
 */
export function getSeverityIcon(severity: string): ReactNode {
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

/**
 * Get status badge component
 * @param status - Inventory status
 * @returns React badge component
 */
export function getStatusBadge(status: string): ReactNode {
  switch (status) {
    case "out-of-stock":
      return <Badge variant="destructive">Out of Stock</Badge>;
    case "low-stock":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          Low Stock
        </Badge>
      );
    case "in-stock":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-300"
        >
          In Stock
        </Badge>
      );
    case "overstock":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          Overstock
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

/**
 * Get transaction type badge component
 * @param type - Transaction type
 * @returns React badge component
 */
export function getTransactionTypeBadge(type: string): ReactNode {
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
// COLOR & CLASS UTILITIES
// ============================================================================

/**
 * Get text color class for transaction quantity
 * @param type - Transaction type
 * @returns Tailwind text color class
 */
export function getTransactionColor(
  type: InventoryTransaction["type"]
): string {
  switch (type) {
    case "in":
      return "text-green-600";
    case "out":
      return "text-destructive";
    case "adjustment":
      return "text-amber-600";
    default:
      return "text-foreground";
  }
}

/**
 * Format transaction quantity with sign prefix
 * @param type - Transaction type
 * @param quantity - Quantity value
 * @returns Formatted string with +/- prefix
 */
export function formatTransactionQuantity(
  type: InventoryTransaction["type"],
  quantity: number
): string {
  if (type === "in") return `+${quantity}`;
  if (type === "out") return `-${quantity}`;
  return `${quantity}`;
}

/**
 * Get alert type badge color classes
 * @param alertType - Type of alert
 * @returns Tailwind color classes
 */
export function getAlertTypeClasses(alertType: string): string {
  const classes: Record<string, string> = {
    "out-of-stock": "bg-red-100 text-red-800 border-red-300",
    "low-stock": "bg-yellow-100 text-yellow-800 border-yellow-300",
    overstock: "bg-blue-100 text-blue-800 border-blue-300",
    "expiring-soon": "bg-amber-100 text-amber-800 border-amber-300",
  };
  return classes[alertType] || "bg-muted";
}

// ============================================================================
// ID GENERATION UTILITIES
// ============================================================================

/**
 * Generate unique ID for inventory operations
 * @param prefix - ID prefix (e.g., "inv", "txn", "alert")
 * @returns Unique ID string
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// ITEM TYPE MAPPING & FILTERING
// ============================================================================

/**
 * Get available items for a specific item type that aren't already tracked
 * @param itemType - Type of inventory item
 * @param refData - Reference data bundle
 * @param existingInventory - Array of existing inventory items
 * @returns Array of available items with id, name, unit
 */
export function getAvailableItemsForType(
  itemType: InventoryItem["itemType"],
  refData: ReferenceDataBundle,
  existingInventory: InventoryItem[]
): Array<{ id: string; name: string; unit: string }> {
  const {
    supplierMaterials,
    supplierPackaging,
    supplierLabels,
    materials,
    packaging,
    labels,
    suppliers,
  } = refData;

  switch (itemType) {
    case "supplierMaterial":
      return (
        supplierMaterials
          ?.filter(
            (sm: any) => !existingInventory.some((inv) => inv.itemId === sm.id)
          )
          .map((sm: any) => {
            const material = materials?.find(
              (m: any) => m.id === sm.materialId
            );
            const supplier = suppliers?.find(
              (s: any) => s.id === sm.supplierId
            );
            return {
              id: sm.id,
              name: `${material?.name || "Unknown"} (${supplier?.name || "Unknown"})`,
              unit: sm.capacityUnit,
            };
          }) || []
      );

    case "supplierPackaging":
      return (
        supplierPackaging
          ?.filter(
            (sp: any) => !existingInventory.some((inv) => inv.itemId === sp.id)
          )
          .map((sp: any) => {
            const pkg = packaging?.find((p: any) => p.id === sp.packagingId);
            const supplier = suppliers?.find(
              (s: any) => s.id === sp.supplierId
            );
            return {
              id: sp.id,
              name: `${pkg?.name || "Unknown"} (${supplier?.name || "Unknown"})`,
              unit: "pcs",
            };
          }) || []
      );

    case "supplierLabel":
      return (
        supplierLabels
          ?.filter(
            (sl: any) => !existingInventory.some((inv) => inv.itemId === sl.id)
          )
          .map((sl: any) => {
            const label = labels?.find((l: any) => l.id === sl.labelId);
            const supplier = suppliers?.find(
              (s: any) => s.id === sl.supplierId
            );
            return {
              id: sl.id,
              name: `${label?.name || "Unknown"} (${supplier?.name || "Unknown"})`,
              unit: sl.unit || "pcs",
            };
          }) || []
      );

    default:
      return [];
  }
}
