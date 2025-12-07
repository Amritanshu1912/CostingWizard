// src/types/supplier-types.ts

import type { BaseEntity } from "./shared-types";

/**
 * Contact person details for a supplier
 */
export interface ContactPerson {
  name: string;
  role: string;
  email: string;
  phone: string;
}

/**
 * Supplier performance metrics tracking
 */
export interface SupplierPerformance {
  onTimeDelivery: number;
  qualityScore: number;
  priceCompetitiveness: number;
}

/**
 * Complete supplier entity with all fields
 */
export interface Supplier extends BaseEntity {
  name: string;
  contactPersons?: ContactPerson[];
  address?: string;
  rating: number;
  isActive: boolean;
  paymentTerms: string;
  leadTime: number;
  notes?: string;
  performance?: SupplierPerformance;
}

/**
 * Form data for supplier creation/editing (excludes generated fields)
 */
export type SupplierFormData = Omit<Supplier, "id" | "createdAt" | "updatedAt">;

/**
 * Default values for new supplier creation
 */
export const INITIAL_SUPPLIER_STATE: SupplierFormData = {
  name: "",
  contactPersons: [{ name: "", role: "", email: "", phone: "" }],
  address: "",
  rating: 5,
  paymentTerms: "30 days",
  leadTime: 7,
  isActive: true,
  notes: "",
  performance: {
    onTimeDelivery: 95,
    qualityScore: 90,
    priceCompetitiveness: 85,
  },
};

/**
 * Available payment term options
 */
export const PAYMENT_TERMS = [
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "Advance",
] as const;

export type PaymentTerm = (typeof PAYMENT_TERMS)[number];
