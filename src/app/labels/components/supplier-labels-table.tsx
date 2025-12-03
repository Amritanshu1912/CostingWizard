// src/app/labels/components/supplier-labels-table.tsx
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
import type { Supplier } from "@/types/shared-types";
import { Edit, Filter, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getLabelTypeColor,
  getLabelTypeLabel,
  getMaterialTypeColor,
  getMaterialTypeLabel,
  getPrintingTypeColor,
  getPrintingTypeLabel,
  getShapeTypeColor,
  getShapeTypeLabel,
} from "./labels-constants";

import type { SupplierLabelRow } from "@/types/label-types";

interface SupplierLabelsTableProps {
  supplierLabels: SupplierLabelRow[];
  suppliers: Supplier[];
  onEditLabel: (label: SupplierLabelRow) => void;
  onDeleteLabel: (id: string) => void;
  onAddSupplierLabel: () => void;
}

export function SupplierLabelsTable({
  supplierLabels,
  suppliers,
  onEditLabel,
  onDeleteLabel,
  onAddSupplierLabel,
}: SupplierLabelsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<SupplierLabelRow | null>(
    null
  );

  // Get unique label types from the data
  const labelTypes = Array.from(
    new Set(supplierLabels.map((sl) => sl.labelType))
  );

  // Filter labels using enriched data
  const filteredLabels = useMemo(() => {
    return supplierLabels.filter((label) => {
      const matchesSearch =
        label.labelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || label.labelType === selectedType;
      const matchesSupplier =
        selectedSupplier === "all" || label.supplierId === selectedSupplier;
      return matchesSearch && matchesType && matchesSupplier;
    });
  }, [supplierLabels, searchTerm, selectedType, selectedSupplier]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedSupplier("all");
  };

  // Initiate delete
  const initiateDelete = (label: SupplierLabelRow) => {
    setLabelToDelete(label);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (labelToDelete) {
      onDeleteLabel(labelToDelete.id);
      setDeleteConfirmOpen(false);
      setLabelToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "labelName",
        label: "Label Name",
        sortable: true,
        render: (value: string) => (
          <span className="font-medium text-foreground">{value}</span>
        ),
      },
      {
        key: "labelType",
        label: "Type",
        sortable: true,
        render: (value: string) => {
          const displayValue = getLabelTypeLabel(value as any);
          const color = getLabelTypeColor(value as any);
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: color,
                color,
              }}
            >
              {displayValue}
            </Badge>
          );
        },
      },
      {
        key: "printingType",
        label: "Printing",
        sortable: true,
        render: (value: string) => {
          const displayValue = getPrintingTypeLabel(value as any);
          const color = getPrintingTypeColor(value as any);
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: color,
                borderColor: color,
                color: "white",
              }}
            >
              {displayValue}
            </Badge>
          );
        },
      },
      {
        key: "material",
        label: "Material",
        sortable: true,
        render: (value: string) => {
          const displayValue = getMaterialTypeLabel(value as any);
          const color = getMaterialTypeColor(value as any);
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: color, color }}
            >
              {displayValue}
            </Badge>
          );
        },
      },
      {
        key: "shape",
        label: "Shape",
        sortable: true,
        render: (value: string) => {
          const displayValue = getShapeTypeLabel(value as any);
          const color = getShapeTypeColor(value as any);
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: color, color }}
            >
              {displayValue}
            </Badge>
          );
        },
      },
      {
        key: "supplierName",
        label: "Supplier",
        sortable: true,
        render: (value: string) => (
          <span className="text-foreground">{value || "—"}</span>
        ),
      },
      {
        key: "unitPrice",
        label: "Price per Unit",
        sortable: true,
        render: (value: number, row: SupplierLabelRow) => {
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
            <div>{value || 0}%</div>
          </div>
        ),
      },
      {
        key: "priceWithTax",
        label: "Price with Tax",
        sortable: true,
        render: (value: number) => (
          <div>
            <div className="font-medium">₹{value.toFixed(2)}</div>
          </div>
        ),
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
        label: "Stock Status",
        sortable: true,
        render: (value: string) => (
          <Badge
            variant={
              value === "in-stock"
                ? "default"
                : value === "low-stock"
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
        render: (_: any, row: SupplierLabelRow) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditLabel(row)}
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
    [onEditLabel]
  );

  return (
    <>
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="pb-1.5">Supplier Labels</CardTitle>
              <CardDescription>
                {supplierLabels.length} supplier label relationships from{" "}
                {new Set(supplierLabels.map((sl) => sl.supplierId)).size}{" "}
                suppliers
              </CardDescription>
            </div>
            <Button
              variant="default"
              onClick={onAddSupplierLabel}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier Label
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
                  placeholder="Search labels or suppliers..."
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
                {labelTypes.map((type) => (
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
            data={filteredLabels}
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
              Delete {labelToDelete?.labelName} from{" "}
              {labelToDelete?.supplierName}?
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
