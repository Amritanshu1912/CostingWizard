"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SortableTable } from "@/components/ui/sortable-table";
import type { SupplierMaterial, Supplier } from "@/lib/types";
import type { SupplierMaterialWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MaterialsFilters } from "./MaterialsFilters";

// The column configuration for the supplier materials inventory table.
// All keys use camelCase to align with the unified SupplierMaterial type.
// This is a function to allow passing action handlers (onEdit, onDelete) and suppliers for rendering supplier names.
const MATERIAL_COLUMNS = ({
  onEdit,
  onDelete,
  suppliers,
}: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  suppliers: Supplier[];
}) => [
  {
    key: "materialName",
    label: "Material Name",
    render: (_: any, row: SupplierMaterialWithDetails) => (
      <span className="font-medium text-foreground">{row.material.name}</span>
    ),
  },
  {
    key: "materialCategory",
    label: "Category",
    render: (_: any, row: SupplierMaterialWithDetails) => (
      <span className="text-muted-foreground">{row.material.category}</span>
    ),
  },
  {
    key: "supplier",
    label: "Supplier",
    sortable: true,
    render: (_: any, row: SupplierMaterialWithDetails) => (
      <span className="text-muted-foreground">{row.supplier.name}</span>
    ),
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
      <span className="text-muted-foreground">{value || 0}%</span>
    ),
  },
  {
    key: "priceWithTax",
    label: "Price with Tax",
    render: (_: any, row: SupplierMaterial) => {
      const tax = row.tax || 0;
      const priceWithTax = row.unitPrice * (1 + tax / 100);
      return (
        <span className="text-foreground font-medium">
          ₹{priceWithTax.toFixed(2)}
        </span>
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
    label: "Lead Time",
    render: (value: number) => (
      <span className="text-muted-foreground">{value}</span>
    ),
  },
  {
    key: "availability",
    label: "Availability",
    render: (value: string) => (
      <Badge variant={value === "in-stock" ? "default" : "destructive"}>
        {value === "in-stock"
          ? "In Stock"
          : value === "limited"
          ? "Limited"
          : "Out of Stock"}
      </Badge>
    ),
  },
  {
    key: "transportationCost",
    label: "Transportation Cost",
    render: (_: any, row: SupplierMaterial) => (
      <span className="text-muted-foreground">
        ₹{row.transportationCost?.toFixed(2) || "0.00"}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (_: any, row: SupplierMaterialWithDetails) => (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.id)}
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                supplier material.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(row.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  },
];

interface MaterialsTableProps {
  filteredMaterials: SupplierMaterialWithDetails[];
  suppliers: Supplier[];
  onEditMaterial: (id: string) => void;
  onDeleteMaterial: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  categories: string[];
}

export function MaterialsTable({
  filteredMaterials,
  suppliers,
  onEditMaterial,
  onDeleteMaterial,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSupplier,
  onSupplierChange,
  categories,
}: MaterialsTableProps) {
  const columns = MATERIAL_COLUMNS({
    onEdit: onEditMaterial,
    onDelete: onDeleteMaterial,
    suppliers,
  });

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Materials Inventory</CardTitle>
        <CardDescription>
          Manage your raw materials and supplier pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MaterialsFilters
          searchTerm={searchTerm}
          setSearchTerm={onSearchChange}
          selectedCategory={selectedCategory}
          setSelectedCategory={onCategoryChange}
          selectedSupplier={selectedSupplier}
          setSelectedSupplier={onSupplierChange}
          suppliers={suppliers}
          categories={categories}
        />
        <SortableTable
          data={filteredMaterials}
          columns={columns}
          className="table-enhanced"
          showSerialNumber={true}
        />
      </CardContent>
    </Card>
  );
}
