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
import { Label as UILabel } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { SupplierLabel, Supplier, Label } from "@/lib/types";
import type { SupplierLabelWithDetails } from "@/hooks/use-supplier-labels-with-details";
import { LABEL_AVAILABILITY } from "./labels-config";

interface SupplierLabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: SupplierLabel) => void;
  suppliers: Supplier[];
  labels: Label[];
  initialLabel?: SupplierLabelWithDetails | null;
}

export function SupplierLabelsDialog({
  isOpen,
  onClose,
  onSave,
  suppliers,
  labels,
  initialLabel,
}: SupplierLabelsDialogProps) {
  const [formData, setFormData] = useState<Partial<SupplierLabel>>({
    supplierId: "",
    labelId: "",
    unitPrice: 0,
    moq: 1,
    unit: "pieces",
    leadTime: 7,
    availability: "in-stock",
    notes: "",
  });

  const isEditing = !!initialLabel;
  const title = isEditing ? "Edit Supplier Label" : "Add Supplier Label";
  const description = isEditing
    ? "Update the supplier label details."
    : "Enter the details for the supplier label relationship.";

  useEffect(() => {
    if (initialLabel) {
      setFormData(initialLabel);
    } else {
      setFormData({
        supplierId: "",
        labelId: "",
        unitPrice: 0,
        moq: 1,
        unit: "pieces",
        leadTime: 7,
        availability: "in-stock",
        notes: "",
      });
    }
  }, [initialLabel]);

  const handleChange = (field: keyof SupplierLabel, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.labelId || !formData.unitPrice) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let savedLabel: SupplierLabel;

    if (isEditing) {
      savedLabel = {
        ...(formData as SupplierLabel),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newId = Date.now().toString();
      savedLabel = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
      } as SupplierLabel;
    }

    onSave(savedLabel);
    onClose();
    if (!isEditing) {
      setFormData({
        supplierId: "",
        labelId: "",
        unitPrice: 0,
        moq: 1,
        unit: "pieces",
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
            <UILabel htmlFor="supplier" className="text-foreground">
              Supplier *
            </UILabel>
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
            <UILabel htmlFor="label" className="text-foreground">
              Label *
            </UILabel>
            <Select
              value={formData.labelId || ""}
              onValueChange={(value) => handleChange("labelId", value)}
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select label" />
              </SelectTrigger>
              <SelectContent>
                {labels.map((label) => (
                  <SelectItem key={label.id} value={label.id}>
                    {label.name} ({label.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <UILabel htmlFor="unit-price" className="text-foreground">
                Unit Price (₹) *
              </UILabel>
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
              <UILabel htmlFor="moq" className="text-foreground">
                MOQ
              </UILabel>
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
              <UILabel htmlFor="unit" className="text-foreground">
                Unit
              </UILabel>
              <Select
                value={formData.unit || "pieces"}
                onValueChange={(value) => handleChange("unit", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="sheets">Sheets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <UILabel htmlFor="lead-time" className="text-foreground">
                Lead Time (days)
              </UILabel>
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
          </div>

          <div>
            <UILabel htmlFor="availability" className="text-foreground">
              Availability
            </UILabel>
            <Select
              value={formData.availability || "in-stock"}
              onValueChange={(value) => handleChange("availability", value)}
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LABEL_AVAILABILITY.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <UILabel htmlFor="notes" className="text-foreground">
              Notes (Optional)
            </UILabel>
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
              {isEditing ? "Update Label" : "Add Label"}
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
