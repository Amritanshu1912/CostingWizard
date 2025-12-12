// src/app/materials/components/materials-supplier-table.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTable } from "@/components/ui/sortable-table";
import { Edit, Filter, Info, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatINR, formatNumber } from "@/utils/formatting-utils";
import { SupplierMaterialTableRow } from "@/types/material-types";
import { Supplier } from "@/types/supplier-types";

interface SupplierMaterialsTableProps {
  items: SupplierMaterialTableRow[];
  suppliers: Supplier[];
  onEdit: (item: SupplierMaterialTableRow) => void;
  onDelete: (id: string) => void;
  onAddMaterial: () => void;
}

/**
 * SupplierMaterialsTable displays a sortable table of supplier materials with filtering capabilities.
 * Shows material details, pricing, inventory status, and provides edit/delete actions.
 */
export function SupplierMaterialsTable({
  items,
  suppliers,
  onEdit,
  onDelete,
  onAddMaterial,
}: SupplierMaterialsTableProps) {
  // State for managing search, filters, and delete confirmation
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<SupplierMaterialTableRow | null>(null);

  // Extract unique categories from the items for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      items.map((item) => item.materialCategory)
    );
    return Array.from(uniqueCategories).sort();
  }, [items]);

  // Filter items based on search term and selected filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        item.materialCategory === selectedCategory;

      // Supplier filter
      const matchesSupplier =
        selectedSupplier === "all" || item.supplierId === selectedSupplier;

      return matchesSearch && matchesCategory && matchesSupplier;
    });
  }, [items, searchTerm, selectedCategory, selectedSupplier]);

  // Reset all filters to their default values
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSupplier("all");
  };

  // Open delete confirmation dialog for an item
  const initiateDelete = (item: SupplierMaterialTableRow) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Execute deletion after confirmation
  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "materialName",
        label: "Material Name",
        sortable: true,
        render: (value: string, row: SupplierMaterialTableRow) => (
          <div>
            <span className="font-medium text-foreground">{value}</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: row.categoryColor + "20",
                  color: row.categoryColor,
                  borderColor: row.categoryColor,
                }}
              >
                {row.materialCategory}
              </Badge>
            </div>
          </div>
        ),
      },
      {
        key: "supplierName",
        label: "Supplier",
        sortable: true,
        render: (value: string, row: SupplierMaterialTableRow) => (
          <div>
            <span className="text-foreground">{value}</span>
            <div className="text-xs text-muted-foreground mt-1">
              ⭐ {formatNumber(row.supplierRating, 1)}
            </div>
          </div>
        ),
      },
      {
        key: "unitPrice",
        label: "Price per Unit",
        sortable: true,
        render: (value: number, row: SupplierMaterialTableRow) => {
          const hasBulkPricing =
            row.quantityForBulkPrice && row.quantityForBulkPrice > 1;

          return (
            <div className="text-foreground">
              <div className="font-medium">{formatINR(value)}</div>

              {/* Bulk pricing info */}
              {hasBulkPricing && row.bulkPrice && (
                <div className="text-xs text-muted-foreground mt-1">
                  {formatINR(row.bulkPrice)} for {row.quantityForBulkPrice}{" "}
                  {row.capacityUnit}
                </div>
              )}

              {/* Unit indicator for non-bulk */}
              {!hasBulkPricing && (
                <div className="text-xs text-muted-foreground">
                  per {row.capacityUnit}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "tax",
        label: "Tax",
        sortable: true,
        render: (value: number) => (
          <span className="text-muted-foreground">{value}%</span>
        ),
      },
      {
        key: "priceWithTax",
        label: "Price after Tax",
        sortable: true,
        render: (value: number, row: SupplierMaterialTableRow) => (
          <div className="text-foreground">
            <div className="font-medium">{formatINR(value)}</div>
            <div className="text-xs text-muted-foreground">
              per {row.capacityUnit}
            </div>
          </div>
        ),
      },
      {
        key: "moq",
        label: "MOQ",
        sortable: true,
        render: (value: number, row: SupplierMaterialTableRow) => (
          <span className="text-muted-foreground">
            {value} {row.capacityUnit}
          </span>
        ),
      },
      {
        key: "leadTime",
        label: "Lead Time",
        sortable: true,
        render: (value: number) => (
          <span className="text-muted-foreground">{value} days</span>
        ),
      },
      {
        key: "stockStatus",
        label: "Inventory Status",
        sortable: true,
        render: (_: any, row: SupplierMaterialTableRow) => (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                row.stockStatus === "in-stock" ||
                row.stockStatus === "overstock"
                  ? "default"
                  : row.stockStatus === "low-stock"
                    ? "secondary"
                    : row.stockStatus === "out-of-stock"
                      ? "destructive"
                      : "outline"
              }
              className="text-xs"
            >
              {row.stockStatus === "in-stock"
                ? "In Stock"
                : row.stockStatus === "low-stock"
                  ? "Low Stock"
                  : row.stockStatus === "out-of-stock"
                    ? "Out of Stock"
                    : row.stockStatus === "overstock"
                      ? "Over Stock"
                      : "Not Tracked"}
            </Badge>
            {row.currentStock > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {row.currentStock} {row.capacityUnit} in stock
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: SupplierMaterialTableRow) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              title="Edit material"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initiateDelete(row)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete material"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <>
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="pb-1.5">Supplier Materials</CardTitle>
              <CardDescription>
                Manage raw materials from your suppliers
              </CardDescription>
            </div>
            <Button
              variant="default"
              onClick={onAddMaterial}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier Material
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col pb-2 sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-enhanced"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Supplier Filter */}
            <Select
              value={selectedSupplier}
              onValueChange={setSelectedSupplier}
            >
              <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Results count */}
          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedSupplier !== "all") && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {items.length} materials
            </div>
          )}

          {/* Table */}
          <SortableTable
            data={filteredItems}
            columns={columns}
            className="table-enhanced"
            showSerialNumber={true}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.materialName} from{" "}
              {itemToDelete?.supplierName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              supplier material entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
