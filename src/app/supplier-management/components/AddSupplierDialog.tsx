"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import type { Supplier } from "@/lib/types";
import { PAYMENT_TERMS } from "./supplier-management-constants";
import { Building2 } from "lucide-react";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newSupplier: Partial<Supplier>;
  setNewSupplier: React.Dispatch<React.SetStateAction<Partial<Supplier>>>;
  addSupplier: () => void;
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  newSupplier,
  setNewSupplier,
  addSupplier,
}: AddSupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Building2 className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Enter supplier details and contact information
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Supplier Name *</Label>
            <Input
              value={newSupplier.name}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, name: e.target.value })
              }
              placeholder="Enter supplier name"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Contact Person *</Label>
            <Input
              value={newSupplier.contactPerson}
              onChange={(e) =>
                setNewSupplier({
                  ...newSupplier,
                  contactPerson: e.target.value,
                })
              }
              placeholder="Enter contact person"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={newSupplier.email}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, email: e.target.value })
              }
              placeholder="Enter email"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={newSupplier.phone}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
              placeholder="Enter phone number"
              className="focus-enhanced"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea
              value={newSupplier.address}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, address: e.target.value })
              }
              placeholder="Enter complete address"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Payment Terms</Label>
            <Select
              value={newSupplier.paymentTerms}
              onValueChange={(value: any) =>
                setNewSupplier({ ...newSupplier, paymentTerms: value })
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
              value={newSupplier.leadTime}
              onChange={(e) =>
                setNewSupplier({
                  ...newSupplier,
                  leadTime: Number(e.target.value),
                })
              }
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
              value={newSupplier.rating}
              onChange={(e) =>
                setNewSupplier({
                  ...newSupplier,
                  rating: Number(e.target.value),
                })
              }
              className="focus-enhanced"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newSupplier.isActive}
              onCheckedChange={(checked: any) =>
                setNewSupplier({ ...newSupplier, isActive: checked })
              }
            />
            <Label>Active Supplier</Label>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={newSupplier.notes}
              onChange={(e) =>
                setNewSupplier({ ...newSupplier, notes: e.target.value })
              }
              placeholder="Additional notes about the supplier"
              className="focus-enhanced"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={addSupplier} className="btn-primary">
            Add Supplier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
