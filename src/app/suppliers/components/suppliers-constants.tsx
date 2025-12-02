// src/app/suppliers/components/suppliers-constants.tsx
import { Supplier } from "@/types/shared-types";

export const SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "ChemCorp Industries",
    contactPersons: [
      {
        name: "Rajesh Kumar",
        email: "rajesh@chemcorp.com",
        phone: "+91-9876543210",
        role: "Sales Manager",
      },
      {
        name: "Anita Singh",
        email: "anita@chemcorp.com",
        phone: "+91-9876543213",
        role: "Technical Support",
      },
    ],
    address: "Plot 45, Industrial Area, Mumbai - 400001",
    rating: 4.5,
    isActive: true,
    paymentTerms: "30 days",
    leadTime: 7,
    notes:
      "Reliable supplier for acids and bases. High quality, consistent delivery.",
    performance: {
      onTimeDelivery: 92,
      qualityScore: 88,
      priceCompetitiveness: 85,
    },
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "ColorTech Solutions",
    contactPersons: [
      {
        name: "Priya Sharma",
        email: "priya@colortech.com",
        phone: "+91-9876543211",
        role: "Operations Manager",
      },
    ],
    address: "Sector 18, Gurgaon - 122001",
    rating: 4.2,
    isActive: true,
    paymentTerms: "45 days",
    leadTime: 10,
    notes:
      "Specializes in industrial colors and dyes. Premium quality products.",
    performance: {
      onTimeDelivery: 88,
      qualityScore: 91,
      priceCompetitiveness: 78,
    },
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "BulkChem Traders",
    contactPersons: [
      {
        name: "Amit Patel",
        email: "amit@bulkchem.com",
        phone: "+91-9876543212",
        role: "CEO",
      },
      {
        name: "Sneha Gupta",
        email: "sneha@bulkchem.com",
        phone: "+91-9876543214",
        role: "Procurement Head",
      },
    ],
    address: "GIDC Estate, Ankleshwar - 393002",
    rating: 3.8,
    isActive: true,
    paymentTerms: "15 days",
    leadTime: 5,
    notes:
      "Good for bulk orders, competitive pricing on salts and basic materials.",
    performance: {
      onTimeDelivery: 85,
      qualityScore: 82,
      priceCompetitiveness: 92,
    },
    createdAt: "2024-02-01",
  },
];

export const PAYMENT_TERMS = [
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "Advance",
] as const;
