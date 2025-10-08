// material-manager-constants.ts

import type { Material } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

// The column configuration for the materials inventory table.
// All keys use camelCase to align with the unified Material type.
// This is a function to allow passing action handlers (onEdit, onDelete).
export const MATERIAL_COLUMNS = ({
  onEdit,
  onDelete,
}: {
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}) => [
  {
    key: "name", // Updated from 'material' to match Material type
    label: "Material Name",
    render: (value: string) => (
      <span className="font-medium text-foreground">{value}</span>
    ),
  },
  {
    key: "category",
    label: "Category",
    render: (value: string) => (
      <span className="text-muted-foreground">{value}</span>
    ),
  },
  {
    key: "pricePerKg", // Updated from 'price_per_kg'
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
    key: "priceWithTax", // Updated from 'price_with_tax_per_kg'
    label: "Price with Tax",
    render: (value: number) => (
      <span className="text-foreground font-medium">₹{value.toFixed(2)}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: false,
    render: (value: string) => (
      <Badge variant={value === "active" ? "default" : "destructive"}>
        {value === "active" ? "Active" : "Low Stock"}
      </Badge>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (_: any, row: Material) => (
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
