export const MATERIAL_CATEGORIES = [
    "Acids",
    "Bases",
    "Colors",
    "Salts",
    "Thickeners",
    "Bottles",
    "Labels",
    "Other",
] as const;

export const PAYMENT_TERMS = [
    "15 days",
    "30 days",
    "45 days",
    "60 days",
    "Advance",
] as const;

export const CURRENCIES = ["INR", "USD", "EUR"] as const;

export const UNITS = ["kg", "liters", "pieces", "meters"] as const;

export const AVAILABILITY_OPTIONS = [
    "in-stock",
    "limited",
    "out-of-stock",
] as const;

export const DEFAULT_SUPPLIER_FORM = {
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    rating: 5,
    isActive: true,
    paymentTerms: "30 days" as const,
    leadTime: 7,
    notes: "",
};

export const DEFAULT_MATERIAL_FORM = {
    supplierId: "",
    materialName: "",
    materialCategory: "",
    unitPrice: 0,
    currency: "INR" as const,
    moq: 1,
    unit: "kg" as const,
    bulkDiscounts: [],
    leadTime: 7,
    availability: "in-stock" as const,
    notes: "",
};
