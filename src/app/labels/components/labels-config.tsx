import type { Label, SupplierLabel } from "@/lib/types";

export const LABEL_TYPES = [
  { value: "sticker", label: "Sticker" },
  { value: "label", label: "Label" },
  { value: "tag", label: "Tag" },
];

export const PRINTING_TYPES = [
  { value: "bw", label: "Black & White" },
  { value: "color", label: "Color" },
  { value: "foil", label: "Foil" },
  { value: "embossed", label: "Embossed" },
];

export const MATERIAL_TYPES = [
  { value: "paper", label: "Paper" },
  { value: "vinyl", label: "Vinyl" },
  { value: "plastic", label: "Plastic" },
  { value: "other", label: "Other" },
];

export const SHAPE_TYPES = [
  { value: "rectangular", label: "Rectangular" },
  { value: "circular", label: "Circular" },
  { value: "custom", label: "Custom" },
];

export const LABEL_AVAILABILITY = [
  { value: "in-stock", label: "In Stock" },
  { value: "limited", label: "Limited" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export const DEFAULT_LABEL_FORM: Partial<Label> = {
  name: "",
  type: "sticker",
  printingType: "color",
  material: "paper",
  shape: "rectangular",
  colors: [],
  size: "",
  notes: "",
};

export const DEFAULT_SUPPLIER_LABEL_FORM: Partial<SupplierLabel> = {
  supplierId: "",
  unitPrice: 0,
  moq: 1,
  unit: "pieces",
  leadTime: 7,
  availability: "in-stock",
  notes: "",
};
