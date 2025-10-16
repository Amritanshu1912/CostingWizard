"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Search, Filter, Edit, Trash2, Plus } from "lucide-react";
import type { SupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import type { Supplier } from "@/lib/types";
import { PACKAGING_TYPES } from "./packaging-constants";

interface SupplierPackagingTableProps {
  supplierPackaging: SupplierPackagingWithDetails[];
  suppliers: Supplier[];
  onEditPackaging: (packaging: SupplierPackagingWithDetails) => void;
  onDeletePackaging: (id: string) => void;
  onAddSupplierPackaging: () => void;
}

export function SupplierPackagingTable({
  supplierPackaging,
  suppliers,
  onEditPackaging,
  onDeletePackaging,
  onAddSupplierPackaging,
}: SupplierPackagingTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] =
    useState<SupplierPackagingWithDetails | null>(null);

  // Get unique packaging types from the data
  const packagingTypes = Array.from(
    new Set(supplierPackaging.map((sp) => sp.displayType))
  );

  // Filter packaging using enriched data
  const filteredPackaging = useMemo(() => {
    return supplierPackaging.filter((packaging) => {
      const matchesSearch =
        packaging.displayName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        packaging.supplier?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || packaging.displayType === selectedType;
      const matchesSupplier =
        selectedSupplier === "all" || packaging.supplierId === selectedSupplier;
      return matchesSearch && matchesType && matchesSupplier;
    });
  }, [supplierPackaging, searchTerm, selectedType, selectedSupplier]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedSupplier("all");
  };

  // Initiate delete
  const initiateDelete = (packaging: SupplierPackagingWithDetails) => {
    setPackagingToDelete(packaging);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (packagingToDelete) {
      onDeletePackaging(packagingToDelete.id);
      setDeleteConfirmOpen(false);
      setPackagingToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "displayName",
        label: "Packaging Name",
        sortable: true,
        render: (value: string) => (
          <span className="font-medium text-foreground">{value}</span>
        ),
      },
      {
        key: "displayType",
        label: "Type",
        sortable: true,
        render: (value: string) => {
          const typeOption = PACKAGING_TYPES.find((t) => t.value === value);
          const displayLabel = typeOption?.label || value;
          return (
            <Badge variant="outline" className="text-xs">
              {displayLabel}
            </Badge>
          );
        },
      },
      {
        key: "capacity",
        label: "Capacity",
        sortable: true,
        render: (value: any, row: SupplierPackagingWithDetails) => {
          const capacity = row.packaging?.capacity;
          const unit = row.packaging?.unit;
          const displayCapacity =
            capacity && unit ? `${capacity} ${unit}` : "—";
          return (
            <span className="text-muted-foreground">{displayCapacity}</span>
          );
        },
      },
      {
        key: "buildMaterial",
        label: "Build Material",
        sortable: true,
        render: (value: any, row: SupplierPackagingWithDetails) => (
          <span className="text-muted-foreground">
            {row.packaging?.buildMaterial || "—"}
          </span>
        ),
      },
      {
        key: "supplier",
        label: "Supplier",
        sortable: true,
        render: (value: any, row: SupplierPackagingWithDetails) => (
          <span className="text-foreground">{row.supplier?.name || "N/A"}</span>
        ),
      },
      {
        key: "unitPrice",
        label: "Price per Unit",
        sortable: true,
        render: (value: number, row: SupplierPackagingWithDetails) => {
          const hasBulkPricing =
            row.quantityForBulkPrice && row.quantityForBulkPrice > 1;

          return (
            <div className="text-foreground">
              {/* Main unit price */}
              <div className="font-medium">₹{value.toFixed(2)}</div>

              {/* Bulk pricing info */}
              {hasBulkPricing && row.bulkPrice && (
                <div className="text-xs text-muted-foreground mt-1">
                  ₹{row.bulkPrice.toFixed(2)} for {row.quantityForBulkPrice}{" "}
                  units
                </div>
              )}

              {/* Unit indicator for non-bulk */}
              {!hasBulkPricing && (
                <div className="text-xs text-muted-foreground">per unit</div>
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
          <div className="text-muted-foreground font-normal">
            <div>{value}%</div>
          </div>
        ),
      },
      {
        key: "priceWithTax",
        label: "Price after Tax",
        sortable: true,
        render: (value: number, row: SupplierPackagingWithDetails) => {
          return (
            <div className="text-foreground">
              <div className="font-medium">₹{row.priceWithTax.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">per unit</div>
            </div>
          );
        },
      },

      {
        key: "moq",
        label: "MOQ",
        sortable: true,
        render: (value: number) => (
          <span className="text-muted-foreground">{value}</span>
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
        key: "availability",
        label: "Availability",
        sortable: true,
        render: (value: string) => (
          <Badge
            variant={
              value === "in-stock"
                ? "default"
                : value === "limited"
                ? "secondary"
                : "destructive"
            }
            className="text-xs"
          >
            {value.replace("-", " ")}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: SupplierPackagingWithDetails) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditPackaging(row)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initiateDelete(row)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEditPackaging]
  );

  return (
    <>
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="pb-1.5">Supplier Packaging</CardTitle>
              <CardDescription>
                {supplierPackaging.length} supplier packaging relationships from{" "}
                {new Set(supplierPackaging.map((sp) => sp.supplierId)).size}{" "}
                suppliers
              </CardDescription>
            </div>
            <Button
              variant="default"
              onClick={onAddSupplierPackaging}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier Packaging
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col pb-2 sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packaging or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-enhanced"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {packagingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <SortableTable
            data={filteredPackaging}
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
              Delete {packagingToDelete?.displayName} from{" "}
              {packagingToDelete?.supplier?.name}?
            </AlertDialogTitle>
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
