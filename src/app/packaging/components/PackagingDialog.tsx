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
import type { Packaging, Supplier } from "@/lib/types";
import {
  PACKAGING_TYPES,
  PACKAGING_UNITS,
  PACKAGING_AVAILABILITY,
  DEFAULT_PACKAGING_FORM,
} from "./packaging-constants";

interface PackagingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packaging: Packaging) => void;
  suppliers: Supplier[];
  initialPackaging?: Packaging | null;
}

export function PackagingDialog({
  isOpen,
  onClose,
  onSave,
  suppliers,
  initialPackaging,
}: PackagingDialogProps) {
  const [formData, setFormData] = useState<Partial<Packaging>>(DEFAULT_PACKAGING_FORM);

  const isEditing = !!initialPackaging;
  const title = isEditing ? "Edit Packaging" : "Add New Packaging";
  const description = isEditing
    ? "Update the packaging details."
    : "Enter the details for the new packaging item.";

  useEffect(() => {
    if (initialPackaging) {
      setFormData(initialPackaging);
    } else {
      setFormData(DEFAULT_PACKAGING_FORM);
    }
  }, [initialPackaging]);

  const handleChange = (field: keyof Packaging, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast.error("Please fill in the packaging name and type.");
      return;
    }

    let savedPackaging: Packaging;

    if (isEditing) {
      savedPackaging = {
        ...(formData as Packaging),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newId = Date.now().toString();
      savedPackaging = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
      } as Packaging;
    }

    onSave(savedPackaging);
    onClose();
    if (!isEditing) {
      setFormData(DEFAULT_PACKAGING_FORM);
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
            <Label htmlFor="packaging-name" className="text-foreground">
              Packaging Name *
            </Label>
            <Input
              id="packaging-name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter packaging name"
              className="focus-enhanced"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-foreground">
                Type *
              </Label>
              <Select
                value={formData.type || "bottle"}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size" className="text-foreground">
                Size
              </Label>
              <Input
                id="size"
                value={formData.size || ""}
                onChange={(e) => handleChange("size", e.target.value)}
                placeholder="e.g., 500ml"
                className="focus-enhanced"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit" className="text-foreground">
                Unit
              </Label>
              <Select
                value={formData.unit || "pieces"}
                onValueChange={(value) => handleChange("unit", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGING_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier" className="text-foreground">
                Supplier
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
