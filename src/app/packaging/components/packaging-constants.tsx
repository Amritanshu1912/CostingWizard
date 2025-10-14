export const PACKAGING_TYPES = [
  { value: "bottle", label: "Bottle" },
  { value: "jar", label: "Jar" },
  { value: "can", label: "Can" },
  { value: "box", label: "Box" },
  { value: "pouch", label: "Pouch" },
  { value: "other", label: "Other" },
];

export const PACKAGING_UNITS = [
  { value: "kg", label: "Kilograms" },
  { value: "L", label: "Liters" },
  { value: "ml", label: "Milliliters" },
  { value: "gm", label: "Grams" },
];

export const PACKAGING_BUILD_MATERIALS = [
  { value: "PET", label: "PET" },
  { value: "HDPE", label: "HDPE" },
  { value: "Glass", label: "Glass" },
  { value: "Plastic", label: "Plastic" },
  { value: "Paper", label: "Paper" },
  { value: "Other", label: "Other" },
] as const;

export const PACKAGING_AVAILABILITY = [
  { value: "in-stock", label: "In Stock" },
  { value: "limited", label: "Limited" },
  { value: "out-of-stock", label: "Out of Stock" },
];
