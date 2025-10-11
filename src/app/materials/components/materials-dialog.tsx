"use client";

import React from "react";
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
import type { SupplierMaterial, Supplier, Material } from "@/lib/types";
import {
  MATERIAL_CATEGORIES,
  UNITS,
  AVAILABILITY_OPTIONS,
} from "./materials-constants";

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMaterial: Partial<SupplierMaterial>;
  setNewMaterial: React.Dispatch<
    React.SetStateAction<Partial<SupplierMaterial>>
  >;
  onSubmit: () => void;
  isEditing: boolean;
  suppliers: Supplier[];
}

export function MaterialDialog({
  open,
  onOpenChange,
  newMaterial,
  setNewMaterial,
  onSubmit,
  isEditing,
  suppliers,
}: MaterialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Supplier Material" : "Add Supplier Material"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update material pricing and MOQ information."
              : "Add material pricing and MOQ information. New materials will be created automatically."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Supplier *</Label>
            <Select
              value={newMaterial.supplierId}
              onValueChange={(value: any) =>
                setNewMaterial({ ...newMaterial, supplierId: value })
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers
                  .filter((s) => s.isActive)
                  .map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Material Name *</Label>
            <Input
              value={newMaterial.materialName}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  materialName: e.target.value,
                })
              }
              placeholder="Enter material name"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={newMaterial.materialCategory}
              onValueChange={(value: any) =>
                setNewMaterial({
                  ...newMaterial,
                  materialCategory: value,
                })
              }
            >
              <SelectTrigger className="focus-enhanced">
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
          <div>
            <Label>Unit Price (₹) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newMaterial.unitPrice}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  unitPrice: Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>MOQ (Minimum Order Quantity) *</Label>
            <Input
              type="number"
              min="1"
              value={newMaterial.moq}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  moq: Number(e.target.value),
                })
              }
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select
              value={newMaterial.unit}
              onValueChange={(value: any) =>
                setNewMaterial({ ...newMaterial, unit: value })
              }
            >
              <SelectTrigger className="focus-enhanced">
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
          <div>
            <Label>Lead Time (days)</Label>
            <Input
              type="number"
              min="1"
              value={newMaterial.leadTime}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  leadTime: Number(e.target.value),
                })
              }
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Availability</Label>
            <Select
              value={newMaterial.availability}
              onValueChange={(value: any) =>
                setNewMaterial({
                  ...newMaterial,
                  availability: value as any,
                })
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={newMaterial.notes}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, notes: e.target.value })
              }
              placeholder="Additional notes about the material"
              className="focus-enhanced"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="btn-primary">
            {isEditing ? "Update Material" : "Add Material"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
