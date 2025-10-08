// MaterialDialog.tsx

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
import type { Category, Material } from "@/lib/types";

// Base structure for form data (all camelCase)
const INITIAL_FORM_DATA: Omit<
  Material,
  "id" | "createdAt" | "updatedAt" | "priceWithTax" | "status"
> = {
  name: "",
  pricePerKg: 0,
  tax: 5,
  supplierId: "", // Will be set to a default value if needed
  category: "Other",
  notes: "",
  minOrder: 1, // Added a sensible default for minOrder
  unit: "kg", // Added a sensible default for unit
  bulkDiscounts: [],
};

interface MaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: Material) => void;
  categories: Category[];
  // If editing, this will be the existing material; otherwise, it's null/undefined for adding.
  initialMaterial?: Material | null;
}

export function MaterialDialog({
  isOpen,
  onClose,
  onSave,
  categories,
  initialMaterial,
}: MaterialDialogProps) {
  const [formData, setFormData] = useState<typeof INITIAL_FORM_DATA | Material>(
    INITIAL_FORM_DATA
  );

  // Determine mode
  const isEditing = !!initialMaterial;
  const title = isEditing ? "Edit Material" : "Add New Raw Material";
  const description = isEditing
    ? "Update the material details."
    : "Enter the details for the new raw material.";

  // Effect to sync internal form state when initialMaterial changes (i.e., when dialog opens for edit)
  useEffect(() => {
    if (initialMaterial) {
      setFormData(initialMaterial);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [initialMaterial]);

  const handleChange = (
    field: keyof typeof INITIAL_FORM_DATA,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculatePriceWithTax = (price: number, tax: number) => {
    return price * (1 + tax / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.pricePerKg <= 0) {
      toast.error("Please fill in the material name and a valid price.");
      return;
    }

    const priceWithTax = calculatePriceWithTax(
      formData.pricePerKg,
      formData.tax || 0
    );

    let savedMaterial: Material;

    if (isEditing) {
      // Edit mode
      savedMaterial = {
        ...(formData as Material),
        updatedAt: new Date().toISOString(),
        priceWithTax: priceWithTax,
      };
    } else {
      // Add mode
      const newId = Date.now().toString();
      savedMaterial = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
        priceWithTax: priceWithTax,
        status: "active", // Default status for new materials
      } as Material;
    }

    onSave(savedMaterial);
    onClose();
    // Reset form for next 'Add' operation, if it was an Add
    if (!isEditing) {
      setFormData(INITIAL_FORM_DATA);
    }
  };

  // Helper to safely access form data fields
  const currentTax = formData.tax || 0;
  const currentPricePerKg = formData.pricePerKg || 0;
  const displayPriceWithTax = calculatePriceWithTax(
    currentPricePerKg,
    currentTax
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="material-name" className="text-foreground">
              Material Name *
            </Label>
            <Input
              id="material-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter material name"
              className="focus-enhanced"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price-per-kg" className="text-foreground">
                Price per kg (₹) *
              </Label>
              <Input
                id="price-per-kg"
                type="number"
                value={currentPricePerKg}
                onChange={(e) =>
                  handleChange("pricePerKg", Number(e.target.value))
                }
                placeholder="0.00"
                className="focus-enhanced"
              />
            </div>
            <div>
              <Label htmlFor="tax" className="text-foreground">
                Tax Rate (%)
              </Label>
              <Input
                id="tax"
                type="number"
                value={currentTax}
                onChange={(e) => handleChange("tax", Number(e.target.value))}
                placeholder="5.0"
                className="focus-enhanced"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category" className="text-foreground">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
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

          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-foreground">
              Price with tax: ₹{displayPriceWithTax.toFixed(2)} per kg
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="flex-1 btn-secondary">
              {isEditing ? "Update Material" : "Add Material"}
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
