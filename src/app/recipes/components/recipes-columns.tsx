// recipe-manager-columns.ts

import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

// Extend Product type for the table display to include derived fields
type RecipeTableRow = Product & {
  ingredientsCount: number;
};

// Helper function to format currency
const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

// The column configuration for the product recipes table.
export const RECIPE_COLUMNS = ({
  onEdit,
  onDelete,
}: {
  onEdit: (recipe: RecipeTableRow) => void;
  onDelete: (id: string) => void;
}) => [
  {
    key: "name",
    label: "Recipe Name",
    render: (value: string) => (
      <span className="font-medium text-foreground">{value}</span>
    ),
  },
  {
    key: "totalCostPerKg",
    label: "Cost per kg",
    // FIX: Using optional chaining and fallback for safety
    render: (value: number | undefined) => (
      <span className="text-foreground font-medium">
        {formatCurrency(value || 0)}
      </span>
    ),
  },
  {
    key: "ingredientsCount", // Derived property, calculated in RecipeManager
    label: "Ingredients",
    render: (value: number) => (
      <Badge
        variant="outline"
        className="bg-primary/10 text-primary hover:bg-primary/20"
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "sellingPricePerKg",
    label: "Selling Price",
    render: (value: number | undefined) => (
      <span className="text-foreground font-medium">
        {formatCurrency(value || 0)}
      </span>
    ),
  },
  {
    key: "profitMargin",
    label: "Profit Margin",
    render: (value: number | undefined) => (
      <span className="text-accent font-medium">
        {(value || 0).toFixed(1)}%
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: false,
    render: (value: "draft" | "active" | "discontinued") => (
      <Badge
        variant={
          value === "active"
            ? "default"
            : value === "draft"
            ? "secondary"
            : "destructive"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Date Created",
    render: (value: string) => (
      <span className="text-muted-foreground">
        {new Date(value).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: "updatedAt",
    label: "Date Updated",
    render: (value: string | undefined) => (
      <span className="text-muted-foreground">
        {value ? new Date(value).toLocaleDateString() : "-"}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (_: any, row: RecipeTableRow) => (
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
