import type { Packaging } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

// The column configuration for the packaging table.
// This is a function to allow passing action handlers (onEdit, onDelete).
export const PACKAGING_COLUMNS = ({
  onEdit,
  onDelete,
}: {
  onEdit: (packaging: Packaging) => void;
  onDelete: (id: string) => void;
}) => [
  {
    key: "name",
    label: "Packaging Name",
    render: (value: string) => (
      <span className="font-medium text-foreground">{value}</span>
    ),
  },
  {
    key: "type",
    label: "Type",
    render: (value: string) => (
      <Badge variant="secondary">{value}</Badge>
    ),
  },
  {
    key: "size",
    label: "Size",
    render: (value: string) => (
      <span className="text-muted-foreground">{value || "N/A"}</span>
    ),
  },
  {
    key: "unit",
    label: "Unit",
    render: (value: string) => (
      <span className="text-muted-foreground">{value}</span>
    ),
  },
  {
    key: "availability",
    label: "Availability",
    sortable: false,
    render: (value: string) => {
      const variant =
        value === "in-stock"
          ? "default"
          : value === "limited"
          ? "secondary"
          : "destructive";
      return <Badge variant={variant}>{value}</Badge>;
    },
  },
  {
    key: "supplierId",
    label: "Supplier",
    render: (value: string) => (
      <span className="text-muted-foreground">{value || "N/A"}</span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (_: any, row: Packaging) => (
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
