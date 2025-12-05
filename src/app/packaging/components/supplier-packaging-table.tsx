// src/app/packaging/components/supplier-packaging-table.tsx
"use client";

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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import type { SupplierPackagingTableRow } from "@/types/packaging-types";
import type { Supplier } from "@/types/shared-types";
import { Edit, Filter, Info, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getBuildMaterialColor,
  getPackagingTypeColor,
  getPackagingTypeLabel,
} from "./packaging-constants";

interface SupplierPackagingTableProps {
  supplierPackaging: SupplierPackagingTableRow[];
  suppliers: Supplier[];
  onEditPackaging: (packaging: SupplierPackagingTableRow) => void;
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
    useState<SupplierPackagingTableRow | null>(null);

  // Get unique packaging types from the data
  const packagingTypes = Array.from(
    new Set(supplierPackaging.map((sp) => sp.packagingType))
  );

  // Filter packaging using enriched data
  const filteredPackaging = useMemo(() => {
    return supplierPackaging.filter((packaging) => {
      const matchesSearch =
        packaging.packagingName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        packaging.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || packaging.packagingType === selectedType;
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
  const initiateDelete = (packaging: SupplierPackagingTableRow) => {
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
        key: "packagingName",
        label: "Packaging Name",
        sortable: true,
        render: (value: string) => (
          <span className="font-medium text-foreground">{value}</span>
        ),
      },
      {
        key: "packagingType",
        label: "Type",
        sortable: true,
        render: (value: string) => {
          const displayLabel = getPackagingTypeLabel(value as any);
          const color = getPackagingTypeColor(value as any);
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: color ? color + "30" : undefined,
                borderColor: color || undefined,
                color: "#000",
              }}
            >
              {displayLabel}
            </Badge>
          );
        },
      },
      {
        key: "capacity",
        label: "Capacity",
        sortable: true,
        render: (value: any, row: SupplierPackagingTableRow) => {
          const capacity = row.capacity;
          const unit = row.unit;
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
        render: (value: any, row: SupplierPackagingTableRow) => {
          const material = row.buildMaterial;
          if (!material)
            return <span className="text-muted-foreground">—</span>;

          const color = getBuildMaterialColor(material as any);
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: color ? color + "30" : undefined,
                borderColor: color || undefined,
                color: "#000",
              }}
            >
              {material}
            </Badge>
          );
        },
      },
      {
        key: "supplierName",
        label: "Supplier",
        sortable: true,
        render: (value: any, row: SupplierPackagingTableRow) => (
          <span className="text-foreground">{row.supplierName || "—"}</span>
        ),
      },
      {
        key: "unitPrice",
        label: "Price per Unit",
        sortable: true,
        render: (value: number, row: SupplierPackagingTableRow) => {
          const hasBulkPricing =
            row.quantityForBulkPrice && row.quantityForBulkPrice > 1;

          return (
            <div className="text-foreground">
              {/* Main unit price */}
              <div className="font-medium">₹{(value ?? 0).toFixed(2)}</div>

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
        render: (value: number, row: SupplierPackagingTableRow) => {
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
        key: "stockStatus",
        label: "Inventory Status",
        sortable: true,
        render: (value: string, row: SupplierPackagingTableRow) => (
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
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {row.currentStock} {row.packagingType}s in stock
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
        render: (_: any, row: SupplierPackagingTableRow) => (
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
              Delete {packagingToDelete?.packagingName} from{" "}
              {packagingToDelete?.supplierName}?
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
