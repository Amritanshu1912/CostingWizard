"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Plus, XCircle } from "lucide-react";
import { PAYMENT_TERMS } from "./suppliers-constants"; // Assuming constants are in the same folder
import type {
  PurchaseOrder,
  Supplier,
  Material,
  PurchaseOrderItem,
} from "@/lib/types";
import { SUPPLIERS } from "@/lib/constants";
import {
  MATERIALS,
  SUPPLIER_MATERIALS,
} from "../../materials/components/materials-config";
import { Switch } from "@/components/ui/switch";

interface AddSupplierDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (supplier: Supplier) => void;
  isEdit?: boolean;
  initialData?: Supplier | null;
}

const initialSupplierState = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  rating: 5, // Default to high rating
  paymentTerms: "30 days",
  leadTime: 7,
  isActive: true,
  notes: "",
};

export const AddSupplierDialog = ({
  isOpen,
  setIsOpen,
  onSave,
  isEdit = false,
  initialData = null,
}: AddSupplierDialogProps) => {
  const [supplierData, setSupplierData] = useState(initialSupplierState);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setSupplierData({
          name: initialData.name || "",
          contactPerson: initialData.contactPerson || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
          rating: initialData.rating || 5,
          paymentTerms: initialData.paymentTerms || "30 days",
          leadTime: initialData.leadTime || 7,
          isActive: initialData.isActive ?? true,
          notes: initialData.notes || "",
        });
      } else {
        setSupplierData(initialSupplierState);
      }
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (
    field: keyof typeof initialSupplierState,
    value: string | number
  ) => {
    setSupplierData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!supplierData.name || !supplierData.contactPerson) {
      toast.error("Supplier Name and Contact Person are required.");
      return;
    }

    const supplier: Supplier = {
      id: isEdit && initialData ? initialData.id : crypto.randomUUID(),
      name: supplierData.name,
      contactPerson: supplierData.contactPerson,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      rating: supplierData.rating,
      isActive: supplierData.isActive,
      paymentTerms: supplierData.paymentTerms,
      leadTime: supplierData.leadTime,
      notes: supplierData.notes,
      performance:
        isEdit && initialData
          ? initialData.performance
          : {
              onTimeDelivery: 95,
              qualityScore: 90,
              priceCompetitiveness: 85,
            },
      createdAt:
        isEdit && initialData
          ? initialData.createdAt
          : new Date().toISOString().split("T")[0],
    };

    onSave(supplier);
    toast.success(
      `Supplier "${supplier.name}" ${
        isEdit ? "updated" : "added"
      } successfully!`
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the supplier details."
              : "Enter the details for the new supplier."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Supplier Name *</Label>
            <Input
              value={supplierData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter supplier name"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Contact Person *</Label>
            <Input
              value={supplierData.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              placeholder="Enter contact person"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={supplierData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter email"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={supplierData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Payment Terms</Label>
            <Select
              value={supplierData.paymentTerms}
              onValueChange={(value: any) =>
                handleChange("paymentTerms", value)
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
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
              value={supplierData.leadTime}
              onChange={(e) => handleChange("leadTime", Number(e.target.value))}
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Rating (1-5)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={supplierData.rating}
              onChange={(e) => handleChange("rating", Number(e.target.value))}
              className="focus-enhanced"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={supplierData.isActive}
              onCheckedChange={(checked: any) =>
                handleChange("isActive", checked)
              }
            />
            <Label>Active Supplier</Label>
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea
              value={supplierData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter complete address"
              className="focus-enhanced"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={supplierData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about the supplier"
              className="focus-enhanced"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            {isEdit ? "Save Changes" : "Add Supplier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
