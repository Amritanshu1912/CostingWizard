import type { Packaging, SupplierPackaging } from "@/lib/types";

export const PACKAGING_TYPES = [
  { value: "bottle", label: "Bottle" },
  { value: "jar", label: "Jar" },
  { value: "can", label: "Can" },
  { value: "pouch", label: "Pouch" },
  { value: "tube", label: "Tube" },
  { value: "box", label: "Box" },
  { value: "bag", label: "Bag" },
  { value: "other", label: "Other" },
];

export const PACKAGING_UNITS = [
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "liters", label: "Liters" },
  { value: "meters", label: "Meters" },
];

export const PACKAGING_AVAILABILITY = [
  { value: "in-stock", label: "In Stock" },
  { value: "limited", label: "Limited" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export const DEFAULT_PACKAGING_FORM: Partial<Packaging> = {
  name: "",
  type: "bottle",
  size: "",
  unit: "pieces",
  availability: "in-stock",
  notes: "",
};

export const DEFAULT_SUPPLIER_PACKAGING_FORM: Partial<SupplierPackaging> = {
  supplierId: "",
  packagingName: "",
  packagingType: "bottle",
  unitPrice: 0,
  currency: "INR",
  moq: 1,
  unit: "pieces",
  availability: "in-stock",
  notes: "",
};
