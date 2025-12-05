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
import { SupplierMaterialTableRow } from "@/types/material-types";
import { Supplier } from "@/types/shared-types";

interface SupplierMaterialsTableProps {
  items: SupplierMaterialTableRow[];
  suppliers: Supplier[];
  onEdit: (item: SupplierMaterialTableRow) => void;
  onDelete: (id: string) => void;
  onAddMaterial: () => void;
}

/**
 * Table displaying supplier materials with filtering and actions
 * Optimized to use SupplierMaterialTableRow type (already has joined data)
 */
export function SupplierMaterialsTable({
  items,
  suppliers,
  onEdit,
  onDelete,
  onAddMaterial,
}: SupplierMaterialsTableProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<SupplierMaterialTableRow | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Extract unique categories from items
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      items.map((item) => item.materialCategory)
    );
    return Array.from(uniqueCategories).sort();
  }, [items]);

  // Filter items based on search and filters
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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSupplier("all");
  };

  const initiateDelete = (item: SupplierMaterialTableRow) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // ============================================================================
  // TABLE COLUMNS
  // ============================================================================

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
              ⭐ {row.supplierRating.toFixed(1)}
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
              <div className="font-medium">₹{value.toFixed(2)}</div>

              {/* Bulk pricing info */}
              {hasBulkPricing && row.bulkPrice && (
                <div className="text-xs text-muted-foreground mt-1">
                  ₹{row.bulkPrice.toFixed(2)} for {row.quantityForBulkPrice}{" "}
                  {row.unit}
                </div>
              )}

              {/* Unit indicator for non-bulk */}
              {!hasBulkPricing && (
                <div className="text-xs text-muted-foreground">
                  per {row.unit}
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
            <div className="font-medium">₹{value.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">per {row.unit}</div>
          </div>
        ),
      },
      {
        key: "moq",
        label: "MOQ",
        sortable: true,
        render: (value: number, row: SupplierMaterialTableRow) => (
          <span className="text-muted-foreground">
            {value} {row.unit}
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
                      {row.currentStock} {row.unit} in stock
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

  // ============================================================================
  // RENDER
  // ============================================================================

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
