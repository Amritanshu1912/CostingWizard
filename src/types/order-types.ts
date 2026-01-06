// types/order-types.ts

import type { BaseEntity } from "./shared-types";

export interface PurchaseOrderItem {
  id: string;
  itemType: "material" | "packaging" | "label"; // NEW
  itemId: string; // Supplier item ID
  itemName: string;
  quantity: number;
  quantityReceived: number; // NEW - for partial deliveries
  unit: string;
  unitPrice: number;
  tax: number; // NEW
  totalCost: number;
}

export interface PurchaseOrder extends BaseEntity {
  orderId: string; // Display: "PO-20240104-001"
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: OrderStatus;

  // Dates
  dateCreated: string;
  dateSubmitted?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;

  // Context
  batchId?: string; // Link to batch if created from batch
  notes?: string;
}

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "in-transit"
  | "partially-delivered" // NEW
  | "delivered"
  | "cancelled";

/**
 * Order status configuration for UI
 */
export interface OrderStatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: any;
  color: string;
}
