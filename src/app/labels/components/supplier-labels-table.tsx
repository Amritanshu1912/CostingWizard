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
import type { SupplierLabelWithDetails } from "@/hooks/use-supplier-labels-with-details";
import type { Supplier } from "@/lib/types";
import {
  getLabelTypeLabel,
  getPrintingTypeLabel,
  getMaterialTypeLabel,
  getShapeTypeLabel,
  getLabelTypeColor,
  getPrintingTypeColor,
  getMaterialTypeColor,
  getShapeTypeColor,
} from "./labels-constants";

interface SupplierLabelsTableProps {
  supplierLabels: SupplierLabelWithDetails[];
  suppliers: Supplier[];
  onEditLabel: (label: SupplierLabelWithDetails) => void;
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
  const [labelToDelete, setLabelToDelete] =
    useState<SupplierLabelWithDetails | null>(null);

  // Get unique label types from the data
  const labelTypes = Array.from(
    new Set(supplierLabels.map((sl) => sl.displayType))
  );

  // Filter labels using enriched data
  const filteredLabels = useMemo(() => {
    return supplierLabels.filter((label) => {
      const matchesSearch =
        label.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || label.displayType === selectedType;
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
  const initiateDelete = (label: SupplierLabelWithDetails) => {
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
        key: "displayName",
        label: "Label Name",
        sortable: true,
        render: (value: string) => (
          <span className="font-medium text-foreground">{value}</span>
        ),
      },
      {
        key: "displayType",
        label: "Type",
        sortable: true,
        render: (value: string, row: SupplierLabelWithDetails) => {
          const label = row.label;
          const displayValue = label ? getLabelTypeLabel(label.type) : value;
          const color = label ? getLabelTypeColor(label.type) : "#6b7280";
          return (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                // backgroundColor: color,
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
        key: "displayPrintingType",
        label: "Printing",
        sortable: true,
        render: (value: string, row: SupplierLabelWithDetails) => {
          const label = row.label;
          const displayValue = label
            ? getPrintingTypeLabel(label.printingType)
            : value;
          const color = label
            ? getPrintingTypeColor(label.printingType)
            : "#6b7280";
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
        key: "displayMaterial",
        label: "Material",
        sortable: true,
        render: (value: string, row: SupplierLabelWithDetails) => {
          const label = row.label;
          const displayValue = label
            ? getMaterialTypeLabel(label.material)
            : value;
          const color = label
            ? getMaterialTypeColor(label.material)
            : "#6b7280";
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
        key: "displayShape",
        label: "Shape",
        sortable: true,
        render: (value: string, row: SupplierLabelWithDetails) => {
          const label = row.label;
          const displayValue = label ? getShapeTypeLabel(label.shape) : value;
          const color = label ? getShapeTypeColor(label.shape) : "#6b7280";
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
        key: "supplier.name",
        label: "Supplier",
        sortable: true,
        render: (value: any, row: SupplierLabelWithDetails) => (
          <span className="text-foreground">{row.supplier?.name || "—"}</span>
        ),
      },
      {
        key: "unitPrice",
        label: "Price per Unit",
        sortable: true,
        render: (value: number, row: SupplierLabelWithDetails) => {
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
        label: "Price with Tax",
        sortable: true,
        render: (value: number, row: SupplierLabelWithDetails) => (
          <div>
            <div className="font-medium">₹{value.toFixed(2)}</div>
            {/* <div className="text-xs text-muted-foreground">
              Tax: {row.tax || 0}%
            </div> */}
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
        render: (_: any, row: SupplierLabelWithDetails) => (
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
              Delete {labelToDelete?.displayName} from{" "}
              {labelToDelete?.supplier?.name}?
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
