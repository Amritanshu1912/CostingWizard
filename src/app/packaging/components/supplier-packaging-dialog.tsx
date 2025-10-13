import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import type { SupplierPackaging, Supplier, Packaging } from "@/lib/types";
import type { SupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import { PACKAGING_AVAILABILITY } from "./packaging-constants";

interface SupplierPackagingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packaging: SupplierPackaging) => void;
  suppliers: Supplier[];
  packaging: Packaging[];
  initialPackaging?: SupplierPackagingWithDetails | null;
}

export function SupplierPackagingDialog({
  isOpen,
  onClose,
  onSave,
  suppliers,
  packaging,
  initialPackaging,
}: SupplierPackagingDialogProps) {
  const [formData, setFormData] = useState<Partial<SupplierPackaging>>({
    supplierId: "",
    packagingId: "",
    unitPrice: 0,
    moq: 1,
    leadTime: 7,
    availability: "in-stock",
    notes: "",
  });

  const isEditing = !!initialPackaging;
  const title = isEditing
    ? "Edit Supplier Packaging"
    : "Add Supplier Packaging";
  const description = isEditing
    ? "Update the supplier packaging details."
    : "Enter the details for the supplier packaging relationship.";

  useEffect(() => {
    if (initialPackaging) {
      setFormData(initialPackaging);
    } else {
      setFormData({
        supplierId: "",
        packagingId: "",
        unitPrice: 0,
        moq: 1,
        leadTime: 7,
        availability: "in-stock",
        notes: "",
      });
    }
  }, [initialPackaging]);

  const handleChange = (
    field: keyof SupplierPackaging,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.packagingId || !formData.unitPrice) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let savedPackaging: SupplierPackaging;

    if (isEditing) {
      savedPackaging = {
        ...(formData as SupplierPackaging),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newId = Date.now().toString();
      savedPackaging = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
      } as SupplierPackaging;
    }

    onSave(savedPackaging);
    onClose();
    if (!isEditing) {
      setFormData({
        supplierId: "",
        packagingId: "",
        unitPrice: 0,
        moq: 1,
        leadTime: 7,
        availability: "in-stock",
        notes: "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplier" className="text-foreground">
              Supplier *
            </Label>
            <Select
              value={formData.supplierId || ""}
              onValueChange={(value) => handleChange("supplierId", value)}
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="packaging" className="text-foreground">
              Packaging *
            </Label>
            <Select
              value={formData.packagingId || ""}
              onValueChange={(value) => handleChange("packagingId", value)}
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select packaging" />
              </SelectTrigger>
              <SelectContent>
                {packaging.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit-price" className="text-foreground">
                Unit Price (₹) *
              </Label>
              <Input
                id="unit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice || ""}
                onChange={(e) =>
                  handleChange("unitPrice", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="focus-enhanced"
              />
            </div>
            <div>
              <Label htmlFor="moq" className="text-foreground">
                MOQ
              </Label>
              <Input
                id="moq"
                type="number"
                min="1"
                value={formData.moq || ""}
                onChange={(e) =>
                  handleChange("moq", parseInt(e.target.value) || 1)
                }
                placeholder="1"
                className="focus-enhanced"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead-time" className="text-foreground">
                Lead Time (days)
              </Label>
              <Input
                id="lead-time"
                type="number"
                min="0"
                value={formData.leadTime || ""}
                onChange={(e) =>
                  handleChange("leadTime", parseInt(e.target.value) || 7)
                }
                placeholder="7"
                className="focus-enhanced"
              />
            </div>
            <div>
              <Label htmlFor="availability" className="text-foreground">
                Availability
              </Label>
              <Select
                value={formData.availability || "in-stock"}
                onValueChange={(value) => handleChange("availability", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGING_AVAILABILITY.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes..."
              className="focus-enhanced"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="flex-1 btn-secondary">
              {isEditing ? "Update Packaging" : "Add Packaging"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
