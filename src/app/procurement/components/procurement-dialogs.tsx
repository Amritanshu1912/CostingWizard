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
import { ORDER_STATUS_MAP, PAYMENT_TERMS } from "./procurement-constants"; // Assuming constants are in the same folder
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

// ============================================================================
// ADD SUPPLIER DIALOG
// ============================================================================

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

// ============================================================================
// CREATE / EDIT ORDER DIALOG
// ============================================================================

interface OrderDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialOrder: PurchaseOrder | null;
  onSave: (order: PurchaseOrder) => void;
}

const getInitialOrderState = (suppliers: Supplier[]): PurchaseOrder => {
  const defaultSupplier = suppliers.length > 0 ? suppliers[0] : null;
  return {
    id: crypto.randomUUID(),
    orderId: `PO-${Date.now().toString().slice(-4)}`,
    supplierId: defaultSupplier?.id || "",
    supplierName: defaultSupplier?.name || "",
    items: [],
    totalCost: 0,
    status: "draft",
    dateCreated: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    createdAt: new Date().toISOString(),
  };
};

export const OrderDialog: React.FC<OrderDialogProps> = ({
  isOpen,
  setIsOpen,
  initialOrder,
  onSave,
}) => {
  const [order, setOrder] = useState<PurchaseOrder>(
    initialOrder || getInitialOrderState(SUPPLIERS)
  );
  const materials = MATERIALS;
  const suppliers = SUPPLIERS;
  const supplierMaterials = SUPPLIER_MATERIALS;

  useEffect(() => {
    if (isOpen) {
      setOrder(initialOrder || getInitialOrderState(suppliers));
    }
  }, [initialOrder, isOpen, suppliers]);

  const recalculateTotalCost = (items: PurchaseOrderItem[]) => {
    const newTotalCost = items.reduce((acc, item) => acc + item.totalCost, 0);
    setOrder((prev) => ({ ...prev, totalCost: newTotalCost }));
  };

  const handleItemChange = (
    index: number,
    key: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    const updatedItems = [...order.items];
    const itemToUpdate = { ...updatedItems[index] };
    (itemToUpdate as any)[key] = value;

    if (key === "materialId" && typeof value === "string") {
      const material = materials.find((m) => m.id === value);
      itemToUpdate.materialName = material?.name || "";
      // Find supplier material for this material and supplier
      const supplierMaterial = supplierMaterials.find(
        (sm) => sm.materialId === value && sm.supplierId === order.supplierId
      );
      itemToUpdate.costPerKg = supplierMaterial?.unitPrice || 0;
    }

    itemToUpdate.totalCost = itemToUpdate.quantity * itemToUpdate.costPerKg;
    updatedItems[index] = itemToUpdate;

    setOrder((prev) => ({ ...prev, items: updatedItems }));
    recalculateTotalCost(updatedItems);
  };

  const handleAddItem = () => {
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      materialId: "",
      materialName: "",
      quantity: 1,
      unit: "kg",
      costPerKg: 0,
      totalCost: 0,
    };
    const updatedItems = [...order.items, newItem];
    setOrder((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = order.items.filter((_, i) => i !== index);
    setOrder((prev) => ({ ...prev, items: updatedItems }));
    recalculateTotalCost(updatedItems);
  };

  const handleSaveOrder = () => {
    if (
      !order.supplierId ||
      order.items.length === 0 ||
      order.items.some((i) => !i.materialId || i.quantity <= 0)
    ) {
      toast.error(
        "Please select a supplier and add at least one item with a quantity greater than zero."
      );
      return;
    }

    const currentSupplier = suppliers.find((s) => s.id === order.supplierId);
    const finalOrder: PurchaseOrder = {
      ...order,
      supplierName: currentSupplier?.name || "Unknown Supplier",
      updatedAt: new Date().toISOString(),
      createdAt: initialOrder ? initialOrder.createdAt : order.createdAt,
    };

    onSave(finalOrder);
    toast.success(`Purchase Order ${finalOrder.orderId} saved successfully!`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialOrder ? "Edit Purchase Order" : "Create New Purchase Order"}
          </DialogTitle>
          <DialogDescription>
            {initialOrder
              ? `Editing order ${initialOrder.orderId}`
              : "Fill in the details for a new material purchase."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* ORDER HEADER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input id="orderId" value={order.orderId} disabled />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select
                value={order.supplierId}
                onValueChange={(value) =>
                  setOrder((prev) => ({ ...prev, supplierId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={order.status}
                onValueChange={(value) =>
                  setOrder((prev) => ({
                    ...prev,
                    status: value as PurchaseOrder["status"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS_MAP).map(([key, map]) => (
                    <SelectItem key={key} value={key}>
                      {map.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateCreated">Date Created</Label>
              <Input
                id="dateCreated"
                type="date"
                value={order.dateCreated}
                onChange={(e) =>
                  setOrder((prev) => ({ ...prev, dateCreated: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={order.deliveryDate}
                onChange={(e) =>
                  setOrder((prev) => ({
                    ...prev,
                    deliveryDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost</Label>
              <Input
                id="totalCost"
                value={`₹${order.totalCost.toFixed(2)}`}
                disabled
                className="font-bold bg-muted"
              />
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex justify-between items-center">
              Order Items
              <Button variant="ghost" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="grid grid-cols-[3fr_1.5fr_1fr_1.5fr_0.5fr] gap-4 items-end border-b pb-3"
                >
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Select
                      value={item.materialId}
                      onValueChange={(value) =>
                        handleItemChange(index, "materialId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity ({item.unit})</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price/Unit</Label>
                    <Input
                      type="number"
                      value={item.costPerKg}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "costPerKg",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input
                      value={`₹${item.totalCost.toFixed(2)}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {order.items.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No items have been added to this order.
                </p>
              )}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <Button onClick={handleSaveOrder} className="w-full">
            {initialOrder ? "Save Changes" : "Create Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
