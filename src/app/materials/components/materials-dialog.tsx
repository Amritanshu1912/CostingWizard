"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SupplierMaterial, Supplier, Material } from "@/lib/types";
import {
  MATERIAL_CATEGORIES,
  UNITS,
  AVAILABILITY_OPTIONS,
} from "./materials-config";
import { Package, TrendingUp, Clock, Truck } from "lucide-react";

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Partial<SupplierMaterial>;
  setMaterial: React.Dispatch<React.SetStateAction<Partial<SupplierMaterial>>>;
  onSave: () => void;
  suppliers: Supplier[];
  materials: Material[];
  isEditing?: boolean;
}

export function MaterialDialog({
  open,
  onOpenChange,
  material,
  setMaterial,
  onSave,
  suppliers,
  isEditing = false,
}: MaterialDialogProps) {
  const isValid =
    material.supplierId && material.materialName && material.unitPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-w-3xl max-h-[95vh] overflow-hidden shadow-xl rounded-2xl border border-border/50">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Material" : "Add New Material"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? "Update material pricing and details."
                  : "Add material information. New materials will be created automatically."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="dialog-scroll space-y-6 py-2 px-1">
          {/* Basic Information */}
          <div className="dialog-section">
            <div className="section-header">
              <Package className="h-4 w-4" />
              Basic Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Supplier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={material.supplierId}
                  onValueChange={(value) =>
                    setMaterial({ ...material, supplierId: value })
                  }
                >
                  <SelectTrigger id="supplier" className="focus-enhanced">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers
                      .filter((s) => s.isActive)
                      .map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{supplier.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {supplier.rating} ★
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialName">
                  Material Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="materialName"
                  value={material.materialName}
                  onChange={(e) =>
                    setMaterial({ ...material, materialName: e.target.value })
                  }
                  placeholder="e.g., Caustic Soda"
                  className="focus-enhanced"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={material.materialCategory}
                  onValueChange={(value) =>
                    setMaterial({ ...material, materialCategory: value })
                  }
                >
                  <SelectTrigger id="category" className="focus-enhanced">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={material.unit}
                  onValueChange={(value) =>
                    setMaterial({ ...material, unit: value as any })
                  }
                >
                  <SelectTrigger id="unit" className="focus-enhanced">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="dialog-section">
            <div className="section-header">
              <TrendingUp className="h-4 w-4" />
              Pricing Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">
                  Unit Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={material.unitPrice}
                  onChange={(e) =>
                    setMaterial({
                      ...material,
                      unitPrice: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className="focus-enhanced"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moq">
                  MOQ (Minimum Order Quantity){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="moq"
                  type="number"
                  min="1"
                  value={material.moq}
                  onChange={(e) =>
                    setMaterial({ ...material, moq: Number(e.target.value) })
                  }
                  placeholder="1"
                  className="focus-enhanced"
                />
              </div>
            </div>
          </div>

          {/* Logistics Information */}
          <div className="dialog-section">
            <div className="section-header">
              <Truck className="h-4 w-4" />
              Logistics & Availability
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2 relative">
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <Clock className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
                <Input
                  id="leadTime"
                  type="number"
                  min="1"
                  value={material.leadTime}
                  onChange={(e) =>
                    setMaterial({
                      ...material,
                      leadTime: Number(e.target.value),
                    })
                  }
                  placeholder="7"
                  className="pl-10 focus-enhanced"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={material.availability}
                  onValueChange={(value) =>
                    setMaterial({ ...material, availability: value as any })
                  }
                >
                  <SelectTrigger id="availability" className="focus-enhanced">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              option === "in-stock"
                                ? "bg-green-500"
                                : option === "limited"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          {option.replace("-", " ")}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="dialog-section">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={material.notes}
              onChange={(e) =>
                setMaterial({ ...material, notes: e.target.value })
              }
              placeholder="Add any additional information about this material..."
              className="focus-enhanced min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t px-6 pb-4 bg-background/60 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Required fields
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!isValid}
              className="btn-primary min-w-[100px]"
            >
              {isEditing ? "Update" : "Add"} Material
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
