// ============================================================================
// MOCK DATA FOR INVENTORY ITEMS
// ============================================================================

import { InventoryItem } from "@/lib/types";

export const MOCK_INVENTORY_ITEMS: Omit<
  InventoryItem,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    itemType: "supplierMaterial",
    itemId: "6", // References SUPPLIER_MATERIALS id "6" (NaCl)
    itemName: "Sodium Chloride",
    currentStock: 500,
    unit: "kg",
    minStockLevel: 100,
    maxStockLevel: 1000,
    lastUpdated: new Date().toISOString(),
    status: "in-stock",
    notes: "High purity salt for formulations",
  },
  {
    itemType: "supplierMaterial",
    itemId: "3", // References SUPPLIER_MATERIALS id "3" (Citric Acid)
    itemName: "Citric Acid",
    currentStock: 50,
    unit: "kg",
    minStockLevel: 75,
    maxStockLevel: 500,
    lastUpdated: new Date().toISOString(),
    status: "low-stock",
    notes: "Used in flavor enhancement",
  },
  {
    itemType: "supplierPackaging",
    itemId: "1", // References SUPPLIER_PACKAGING id "1" (500ml PET Bottle)
    itemName: "PET Bottle 500ml",
    currentStock: 2000,
    unit: "pcs",
    minStockLevel: 500,
    maxStockLevel: 5000,
    lastUpdated: new Date().toISOString(),
    status: "in-stock",
    notes: "Clear plastic bottles for beverages",
  },
  {
    itemType: "supplierPackaging",
    itemId: "2", // References SUPPLIER_PACKAGING id "2" (1L Glass Jar)
    itemName: "Glass Jar 1L",
    currentStock: 100,
    unit: "pcs",
    minStockLevel: 200,
    maxStockLevel: 1000,
    lastUpdated: new Date().toISOString(),
    status: "low-stock",
    notes: "Premium glass packaging",
  },
  {
    itemType: "supplierLabel",
    itemId: "1", // References SUPPLIER_LABELS id "1" (Standard Sticker Label)
    itemName: "Front Label Sticker",
    currentStock: 5000,
    unit: "pieces",
    minStockLevel: 1000,
    maxStockLevel: 10000,
    lastUpdated: new Date().toISOString(),
    status: "in-stock",
    notes: "Color printed labels for branding",
  },
  {
    itemType: "supplierLabel",
    itemId: "3", // References SUPPLIER_LABELS id "3" (Custom Shape Tag)
    itemName: "Back Label Tag",
    currentStock: 200,
    unit: "pieces",
    minStockLevel: 500,
    maxStockLevel: 2000,
    lastUpdated: new Date().toISOString(),
    status: "low-stock",
    notes: "Ingredient and usage information",
  },
  {
    itemType: "supplierMaterial",
    itemId: "7", // References SUPPLIER_MATERIALS id "7" (Soda Ash)
    itemName: "Soda Ash",
    currentStock: 0,
    unit: "kg",
    minStockLevel: 200,
    maxStockLevel: 1500,
    lastUpdated: new Date().toISOString(),
    status: "out-of-stock",
    notes: "Base material for formulations",
  },
  {
    itemType: "supplierPackaging",
    itemId: "6", // References SUPPLIER_PACKAGING id "6" (1kg Paper Box)
    itemName: "Cardboard Box",
    currentStock: 1500,
    unit: "pcs",
    minStockLevel: 300,
    maxStockLevel: 2000,
    lastUpdated: new Date().toISOString(),
    status: "in-stock",
    notes: "Secondary packaging",
  },
  {
    itemType: "supplierLabel",
    itemId: "2", // References SUPPLIER_LABELS id "2" (Premium Label Tag)
    itemName: "Foil Label",
    currentStock: 800,
    unit: "sheets",
    minStockLevel: 400,
    maxStockLevel: 1500,
    lastUpdated: new Date().toISOString(),
    status: "in-stock",
    notes: "Specialty metallic labels",
  },
  {
    itemType: "supplierMaterial",
    itemId: "10", // References SUPPLIER_MATERIALS id "10" (AOS Powder 96%)
    itemName: "AOS Powder 96%",
    currentStock: 1200,
    unit: "kg",
    minStockLevel: 100,
    maxStockLevel: 2000,
    lastUpdated: new Date().toISOString(),
    status: "overstock",
    notes: "Surfactant for cleaning formulations",
  },
];

export const INVENTORY_ITEM_TYPES = [];
export const INVENTORY_STATUSES = [];
export const TRANSACTION_TYPES = [];
export const REFERENCE_TYPES = [];
