import type {
  Category,
  Supplier,
  Product,
  ProductionPlan,
  PurchaseOrder,
  Recipe,
} from "@/lib/types";
import {
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  FlaskConical as Flask,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ============================================================================
// MASTER DATA - Single Source of Truth
// ============================================================================

export const CAPACITY_UNITS = [
  { value: "kg" as const, label: "Kilograms (kg)", factor: 1 },
  { value: "L" as const, label: "Liters (L)", factor: 1 }, // Assuming 1L = 1kg for liquids
  { value: "ml" as const, label: "Milliliters (ml)", factor: 0.001 },
  { value: "gm" as const, label: "Grams (gm)", factor: 0.001 },
  { value: "pcs" as const, label: "Pieces (pcs)", factor: 1 }, // Assuming pieces are treated as kg
] as const;

export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Acids",
    description: "Acidic compounds and solutions",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Bases",
    description: "Basic compounds and alkalis",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Colors",
    description: "Dyes and coloring agents",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Thickeners",
    description: "Viscosity modifiers",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    name: "Salts",
    description: "Salt compounds",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "6",
    name: "Oils",
    description: "Oil-based materials",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "7",
    name: "Other",
    description: "Miscellaneous materials",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

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

// ============================================================================
// PURCHASE_ORDERS
// ============================================================================

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-001",
    orderId: "PO-001",
    supplierId: "1",
    supplierName: "ChemCorp Industries",
    items: [
      {
        id: "PO001-I1", // Added unique ID
        materialId: "1",
        materialName: "Acid Blue Color",
        quantity: 50,
        unit: "kg", // Added unit
        costPerKg: 1650,
        totalCost: 82500,
      },
      {
        id: "PO001-I2", // Added unique ID
        materialId: "5",
        materialName: "Citric Acid",
        quantity: 100,
        unit: "kg", // Added unit
        costPerKg: 95,
        totalCost: 9500,
      },
    ],
    totalCost: 92000,
    status: "confirmed",
    dateCreated: "2024-01-15", // Renamed from orderDate
    deliveryDate: "2024-01-22", // Renamed from expectedDelivery
    createdAt: "2024-01-15",
  },
  {
    id: "PO-002",
    orderId: "PO-002",
    supplierId: "2",
    supplierName: "ColorTech Solutions",
    items: [
      {
        id: "PO002-I1", // Added unique ID
        materialId: "9",
        materialName: "AOS Powder 96%",
        quantity: 75,
        unit: "kg", // Added unit
        costPerKg: 152,
        totalCost: 11400,
      },
    ],
    totalCost: 11400,
    status: "submitted",
    dateCreated: "2024-01-18", // Renamed from orderDate
    deliveryDate: "2024-01-25", // Renamed from expectedDelivery
    createdAt: "2024-01-18",
  },
  {
    id: "PO-003",
    orderId: "PO-003",
    supplierId: "3",
    supplierName: "BulkChem Traders",
    items: [
      {
        id: "PO003-I1", // Added unique ID
        materialId: "6",
        materialName: "NaCl",
        quantity: 1000,
        unit: "kg", // Added unit
        costPerKg: 5.8,
        totalCost: 5800,
      },
      {
        id: "PO003-I2", // Added unique ID
        materialId: "8",
        materialName: "Soda Ash",
        quantity: 500,
        unit: "kg", // Added unit
        costPerKg: 39,
        totalCost: 19500,
      },
    ],
    totalCost: 25300,
    status: "delivered",
    dateCreated: "2024-01-10", // Renamed from orderDate
    deliveryDate: "2024-01-17", // Renamed from expectedDelivery
    createdAt: "2024-01-10",
  },
];

// ============================================================================
// ANALYTICS & DASHBOARD DATA
// ============================================================================

export const priceHistoryData = [
  { month: "Jan", avgPrice: 245.5, materials: 142 },
  { month: "Feb", avgPrice: 251.2, materials: 145 },
  { month: "Mar", avgPrice: 248.8, materials: 148 },
  { month: "Apr", avgPrice: 255.3, materials: 152 },
  { month: "May", avgPrice: 262.1, materials: 156 },
  { month: "Jun", avgPrice: 258.9, materials: 159 },
];

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const quickStats = [
  {
    title: "Total Raw Materials",
    value: "156",
    change: "+12%",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Active Products",
    value: "24",
    change: "+3%",
    trend: "up" as const,
    icon: Flask,
  },
  {
    title: "Production Plans",
    value: "8",
    change: "-2%",
    trend: "down" as const,
    icon: Calendar,
  },
  {
    title: "Avg Cost per kg",
    value: "₹245.50",
    change: "+5.2%",
    trend: "up" as const,
    icon: DollarSign,
  },
];

export const recentMaterials = [
  {
    name: "Acid Blue Color",
    price: "₹1,680.00",
    tax: "5%",
    status: "active" as const,
  },
  { name: "CBS-X", price: "₹2,257.50", tax: "5%", status: "active" as const },
  {
    name: "AOS Powder 96%",
    price: "₹155.40",
    tax: "5%",
    status: "active" as const,
  },
  {
    name: "Citric Acid",
    price: "₹97.65",
    tax: "5%",
    status: "active" as const,
  },
  {
    name: "Caustic Soda",
    price: "₹59.85",
    tax: "5%",
    status: "active" as const,
  },
];

export const quickActions = [
  {
    title: "Add Raw Material",
    description: "Add new materials to inventory",
    href: "/materials",
    icon: Package,
  },
  {
    title: "Create Product",
    description: "Design new product recipes",
    href: "/recipes",
    icon: Flask,
  },
  {
    title: "Plan Production",
    description: "Schedule production batches",
    href: "/planning",
    icon: Calendar,
  },
  {
    title: "Manage Procurement",
    description: "Handle supplier orders",
    href: "/procurement",
    icon: ShoppingCart,
  },
];
