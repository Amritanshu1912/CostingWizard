// src/lib/constants.ts
import type { Category } from "@/types/material-types";
import {
  Calendar,
  DollarSign,
  FlaskConical as Flask,
  Package,
  ShoppingCart,
} from "lucide-react";

// ============================================================================
// MASTER DATA - Single Source of Truth
// ============================================================================

export const CAPACITY_UNITS = [
  { value: "gm" as const, label: "Grams (gm)", factor: 0.001 },
  { value: "kg" as const, label: "Kilograms (kg)", factor: 1 },
  { value: "ml" as const, label: "Milliliters (ml)", factor: 0.001 },
  { value: "L" as const, label: "Liters (L)", factor: 1 }, // Assuming 1L = 1kg for liquids
  { value: "pcs" as const, label: "Pieces (pcs)", factor: 1 }, // Assuming pieces are treated as kg
] as const;

export const MATERIAL_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Acids",
    description: "Acidic materials used in formulations",
    color: "#ef4444", // red-500
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Bases",
    description: "Basic materials for pH balancing",
    color: "#3b82f6", // blue-500
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Colors",
    description: "Coloring agents and dyes",
    color: "#8b5cf6", // violet-500
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Salts",
    description: "Salt compounds and minerals",
    color: "#06b6d4", // cyan-500
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    name: "Thickeners",
    description: "Viscosity modifiers and thickeners",
    color: "#10b981", // emerald-500
    createdAt: "2024-01-01",
  },
  {
    id: "6",
    name: "Bottles",
    description: "Packaging bottles and containers",
    color: "#f59e0b", // amber-500
    createdAt: "2024-01-01",
  },
  {
    id: "7",
    name: "Labels",
    description: "Product labels and stickers",
    color: "#ec4899", // pink-500
    createdAt: "2024-01-01",
  },
  {
    id: "8",
    name: "Other",
    description: "Miscellaneous materials",
    color: "#6b7280", // gray-500
    createdAt: "2024-01-01",
  },
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
