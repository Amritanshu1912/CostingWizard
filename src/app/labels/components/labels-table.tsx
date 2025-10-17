"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { LabelsWithSuppliers } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface LabelsTableDrawerProps {
  data: LabelsWithSuppliers[];
  editingLabelId: string | null;
  editForm: {
    name: string;
    type: string;
    printingType: string;
    material: string;
    shape: string;
    size: string;
    labelFor: string;
    notes: string;
  };
  loading: boolean;
  shakeFields?: boolean;
  onEditFormChange: (form: {
    name: string;
    type: string;
    printingType: string;
    material: string;
    shape: string;
    size: string;
    labelFor: string;
    notes: string;
  }) => void;
  onStartEdit: (label: LabelsWithSuppliers) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onInitiateDelete: (label: LabelsWithSuppliers) => void;
}

export function LabelsTableDrawer({
  data,
  editingLabelId,
  editForm,
  loading,
  shakeFields = false,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onInitiateDelete,
}: LabelsTableDrawerProps) {
  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Label Name",
        sortable: true,
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <Input
                value={editForm.name}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, name: e.target.value })
                }
                className="h-8"
                autoFocus
              />
            );
          }
          return (
            <span className="font-medium text-foreground">{row.name}</span>
          );
        },
      },
      {
        key: "type",
        label: "Type",
        sortable: true,
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <Select
                value={editForm.type}
                onValueChange={(value) =>
                  onEditFormChange({ ...editForm, type: value })
                }
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sticker">Sticker</SelectItem>
                  <SelectItem value="label">Label</SelectItem>
                  <SelectItem value="tag">Tag</SelectItem>
                </SelectContent>
              </Select>
            );
          }
          const displayValue = getLabelTypeLabel(row.type);
          const color = getLabelTypeColor(row.type);
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
        key: "printingType",
        label: "Printing",
        sortable: true,
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <Select
                value={editForm.printingType}
                onValueChange={(value) =>
                  onEditFormChange({ ...editForm, printingType: value })
                }
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select printing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bw">Black & White</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="foil">Foil</SelectItem>
                  <SelectItem value="embossed">Embossed</SelectItem>
                </SelectContent>
              </Select>
            );
          }
          const displayValue = getPrintingTypeLabel(row.printingType);
          const color = getPrintingTypeColor(row.printingType);
          return (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: color, color: "white" }}
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
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <Select
                value={editForm.material}
                onValueChange={(value) =>
                  onEditFormChange({ ...editForm, material: value })
                }
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="vinyl">Vinyl</SelectItem>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            );
          }
          const displayValue = getMaterialTypeLabel(row.material);
          const color = getMaterialTypeColor(row.material);
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
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <Select
                value={editForm.shape}
                onValueChange={(value) =>
                  onEditFormChange({ ...editForm, shape: value })
                }
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangular">Rectangular</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            );
          }
          const displayValue = getShapeTypeLabel(row.shape);
          const color = getShapeTypeColor(row.shape);
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
        key: "size",
        label: "Size",
        sortable: true,
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <Input
                value={editForm.size}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, size: e.target.value })
                }
                className="h-8"
                placeholder="e.g., 50x30mm"
              />
            );
          }
          return (
            <span className="text-muted-foreground">{row.size || "N/A"}</span>
          );
        },
      },
      {
        key: "supplierCount",
        label: "# Suppliers",
        sortable: true,
        render: (_: any, row: LabelsWithSuppliers) => {
          if (row.supplierCount === 0) {
            return <span className="text-muted-foreground">0</span>;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1.5 cursor-help">
                    <Badge variant="outline" className="font-medium">
                      {row.supplierCount}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="text-sm">
                    <div className="font-semibold mb-1">
                      Linked Suppliers ({row.supplierCount})
                    </div>
                    <div className="space-y-1">
                      {row.suppliersList.map((s) => (
                        <div key={s.id} className="text-white">
                          • {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        key: "updatedAt",
        label: "Updated At",
        sortable: true,
        render: (_: any, row: LabelsWithSuppliers) => {
          const displayDate = row.updatedAt || row.createdAt;
          return (
            <span className="text-sm text-muted-foreground">
              {format(new Date(displayDate), "MMM dd, yyyy")}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: LabelsWithSuppliers) => {
          if (editingLabelId === row.id) {
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onSaveEdit}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancelEdit}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartEdit(row)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInitiateDelete(row)}
                disabled={row.supplierCount > 0}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                title={
                  row.supplierCount > 0
                    ? "Cannot delete label used by suppliers"
                    : "Delete label"
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editingLabelId,
      editForm,
      loading,
      onEditFormChange,
      onStartEdit,
      onSaveEdit,
      onCancelEdit,
      onInitiateDelete,
    ]
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <SortableTable
        data={data}
        columns={columns}
        className="table-enhanced"
        showSerialNumber={true}
      />
    </div>
  );
}
