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
  ContactPerson,
} from "@/lib/types";
import { SUPPLIERS } from "@/lib/constants";
import {
  MATERIALS,
  SUPPLIER_MATERIALS,
} from "../../materials/components/materials-constants";
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
  contactPersons: [
    { name: "", email: undefined, phone: undefined, role: undefined },
  ] as ContactPerson[],
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
          contactPersons:
            initialData.contactPersons ||
            ([
              { name: "", email: undefined, phone: undefined, role: undefined },
            ] as ContactPerson[]),
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
    value: string | number | ContactPerson[]
  ) => {
    setSupplierData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (
    index: number,
    field: keyof ContactPerson,
    value: string
  ) => {
    const updatedContacts = [...supplierData.contactPersons];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    handleChange("contactPersons", updatedContacts);
  };

  const addContact = () => {
    const newContact: ContactPerson = {
      name: "",
      email: undefined,
      phone: undefined,
      role: undefined,
    };
    handleChange("contactPersons", [
      ...supplierData.contactPersons,
      newContact,
    ]);
  };

  const removeContact = (index: number) => {
    if (supplierData.contactPersons.length > 1) {
      const updatedContacts = supplierData.contactPersons.filter(
        (_, i) => i !== index
      );
      handleChange("contactPersons", updatedContacts);
    }
  };

  const handleSave = () => {
    if (
      !supplierData.name ||
      supplierData.contactPersons.length === 0 ||
      !supplierData.contactPersons[0].name
    ) {
      toast.error(
        "Supplier Name and at least one Contact Person are required."
      );
      return;
    }

    const supplier: Supplier = {
      id: isEdit && initialData ? initialData.id : crypto.randomUUID(),
      name: supplierData.name,
      contactPersons: supplierData.contactPersons,
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
          <div className="md:col-span-2">
            <Label>Contact Persons *</Label>
            {supplierData.contactPersons.map((contact, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 mb-4 bg-muted/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, "name", e.target.value)
                      }
                      placeholder="Contact name"
                      className="focus-enhanced"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={contact.role ?? ""}
                      onChange={(e) =>
                        handleContactChange(index, "role", e.target.value)
                      }
                      placeholder="e.g., Sales Manager"
                      className="focus-enhanced"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={contact.email ?? ""}
                      onChange={(e) =>
                        handleContactChange(index, "email", e.target.value)
                      }
                      placeholder="Enter email"
                      className="focus-enhanced"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={contact.phone ?? ""}
                      onChange={(e) =>
                        handleContactChange(index, "phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className="focus-enhanced"
                    />
                  </div>
                </div>
                {supplierData.contactPersons.length > 1 && (
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeContact(index)}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Remove Contact
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addContact}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Another Contact
            </Button>
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
