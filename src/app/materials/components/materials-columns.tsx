// material-manager-constants.ts

import type { SupplierMaterial, Supplier } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

// The column configuration for the supplier materials inventory table.
// All keys use camelCase to align with the unified SupplierMaterial type.
// This is a function to allow passing action handlers (onEdit, onDelete) and suppliers for rendering supplier names.
export const MATERIAL_COLUMNS = ({
  onEdit,
  onDelete,
  suppliers,
}: {
  onEdit: (supplierMaterial: SupplierMaterial) => void;
  onDelete: (id: string) => void;
  suppliers: Supplier[];
}) => [
  {
    key: "serial",
    label: "S.No",
    render: (_: any, row: SupplierMaterial, index: number) => (
      <span className="text-muted-foreground">{index + 1}</span>
    ),
  },
  {
    key: "materialName",
    label: "Material Name",
    render: (value: string) => (
      <span className="font-medium text-foreground">{value}</span>
    ),
  },
  {
    key: "materialCategory",
    label: "Category",
    render: (value: string) => (
      <span className="text-muted-foreground">{value}</span>
    ),
  },
  {
    key: "supplier",
    label: "Supplier",
    render: (_: any, row: SupplierMaterial) => {
      const supplier = suppliers.find((s) => s.id === row.supplierId);
      return (
        <span className="text-muted-foreground">{supplier?.name || "Unknown"}</span>
      );
    },
  },
  {
    key: "unitPrice",
    label: "Price (₹/kg)",
    render: (value: number) => (
      <span className="text-foreground">₹{value.toFixed(2)}</span>
    ),
  },
  {
    key: "tax",
    label: "Tax (%)",
    render: (value: number) => (
      <span className="text-muted-foreground">{value}%</span>
    ),
  },
  {
    key: "priceWithTax",
    label: "Price with Tax",
    render: (_: any, row: SupplierMaterial) => {
      const priceWithTax = row.unitPrice * (1 + row.tax / 100);
      return (
        <span className="text-foreground font-medium">₹{priceWithTax.toFixed(2)}</span>
      );
    },
  },
  {
    key: "moq",
    label: "MOQ",
    render: (value: number) => (
      <span className="text-muted-foreground">{value}</span>
    ),
  },
  {
    key: "leadTime",
    label: "Lead Time (days)",
    render: (value: number) => (
      <span className="text-muted-foreground">{value}</span>
    ),
  },
  {
    key: "availability",
    label: "Availability",
    render: (value: string) => (
      <Badge variant={value === "in-stock" ? "default" : "destructive"}>
        {value === "in-stock" ? "In Stock" : value === "limited" ? "Limited" : "Out of Stock"}
      </Badge>
    ),
  },
  {
    key: "transportationCost",
    label: "Transportation Cost",
    render: (_: any, row: SupplierMaterial) => (
      <span className="text-muted-foreground">₹{row.transportationCost?.toFixed(2) || "0.00"}</span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (_: any, row: SupplierMaterial) => (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row)}
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
];
