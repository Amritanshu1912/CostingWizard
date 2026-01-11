// src/app/orders/components/order-constants.tsx
import { PurchaseOrder } from "@/types/order-types";

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-001",
    orderId: "PO-001",
    supplierId: "1",
    supplierName: "ChemCorp Industries",
    items: [
      {
        id: "PO001-I1",
        itemType: "material",
        itemId: "1", // supplierMaterial ID
        itemName: "Acid Blue Color",
        quantity: 50,
        quantityReceived: 0,
        unit: "kg",
        unitPrice: 1650,
        tax: 18,
        totalCost: 82500,
      },
      {
        id: "PO001-I2",
        itemType: "material",
        itemId: "5", // supplierMaterial ID
        itemName: "Citric Acid",
        quantity: 100,
        quantityReceived: 0,
        unit: "kg",
        unitPrice: 95,
        tax: 18,
        totalCost: 9500,
      },
    ],
    totalCost: 92000,
    status: "confirmed",
    dateCreated: "2024-01-15",
    expectedDeliveryDate: "2024-01-22",
    createdAt: "2024-01-15",
  },
  {
    id: "PO-002",
    orderId: "PO-002",
    supplierId: "2",
    supplierName: "ColorTech Solutions",
    items: [
      {
        id: "PO002-I1",
        itemType: "material",
        itemId: "9", // supplierMaterial ID
        itemName: "AOS Powder 96%",
        quantity: 75,
        quantityReceived: 0,
        unit: "kg",
        unitPrice: 152,
        tax: 18,
        totalCost: 11400,
      },
    ],
    totalCost: 11400,
    status: "submitted",
    dateCreated: "2024-01-18",
    expectedDeliveryDate: "2024-01-25",
    createdAt: "2024-01-18",
  },
  {
    id: "PO-003",
    orderId: "PO-003",
    supplierId: "3",
    supplierName: "BulkChem Traders",
    items: [
      {
        id: "PO003-I1",
        itemType: "material",
        itemId: "6", // supplierMaterial ID
        itemName: "NaCl",
        quantity: 1000,
        quantityReceived: 0,
        unit: "kg",
        unitPrice: 5.8,
        tax: 18,
        totalCost: 5800,
      },
      {
        id: "PO003-I2",
        itemType: "material",
        itemId: "8", // supplierMaterial ID
        itemName: "Soda Ash",
        quantity: 500,
        quantityReceived: 500, // Fully received
        unit: "kg",
        unitPrice: 39,
        tax: 18,
        totalCost: 19500,
      },
    ],
    totalCost: 25300,
    status: "delivered",
    dateCreated: "2024-01-10",
    expectedDeliveryDate: "2024-01-17",
    actualDeliveryDate: "2024-01-16",
    createdAt: "2024-01-10",
  },
];

/**
 * Defines the columns for the Purchase Orders table in the UI.
 */
export const PURCHASE_ORDER_COLUMNS = [
  {
    key: "orderId",
    header: "Order ID",
    sortable: true,
  },
  {
    key: "supplierName",
    header: "Supplier",
    sortable: true,
  },
  {
    key: "items",
    header: "Items",
    sortable: true,
  },
  {
    key: "totalCost",
    header: "Total Value",
    sortable: true,
  },
  {
    key: "dateCreated",
    header: "Order Date",
    sortable: true,
  },
  {
    key: "deliveryDate",
    header: "Expected Delivery",
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
  },
];

/**
 * AI Insights for Procurement Analytics.
 */
export const AI_INSIGHTS = [
  {
    title: "Supplier Performance Optimization",
    description:
      "Based on current data, switching 20% of orders to top-performing suppliers could reduce costs by 15%.",
    impact: "High",
    confidence: 92,
  },
  {
    title: "Inventory Risk Alert",
    description:
      "Low stock levels for Citric Acid detected. Recommend increasing MOQ for next order.",
    impact: "Medium",
    confidence: 87,
  },
  {
    title: "Cost Trend Analysis",
    description:
      "Material costs have increased 8% over the last quarter. Consider bulk purchasing to lock in prices.",
    impact: "High",
    confidence: 95,
  },
];
