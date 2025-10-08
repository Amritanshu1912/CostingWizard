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
import { ORDER_STATUS_MAP } from "./procurement-constants"; // Assuming constants are in the same folder
import type {
  PurchaseOrder,
  Supplier,
  Material,
  PurchaseOrderItem,
} from "@/lib/types";
import { MATERIALS, SUPPLIERS } from "@/lib/constants";

// ============================================================================
// ADD SUPPLIER DIALOG
// ============================================================================

interface AddSupplierDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (newSupplier: Supplier) => void;
}

const initialSupplierState = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  rating: 3, // Default to average rating
};

export const AddSupplierDialog: React.FC<AddSupplierDialogProps> = ({
  isOpen,
  setIsOpen,
  onSave,
}) => {
  const [supplierData, setSupplierData] = useState(initialSupplierState);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSupplierData(initialSupplierState);
    }
  }, [isOpen]);

  const handleChange = (
    field: keyof typeof initialSupplierState,
    value: string | number
  ) => {
    setSupplierData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!supplierData.name || !supplierData.email) {
      toast.error("Supplier Name and Email are required.");
      return;
    }

    const newSupplier: Supplier = {
      ...supplierData,
      id: crypto.randomUUID(),
      isActive: true,
      paymentTerms: "30 days", // Default value
      leadTime: 7, // Default value
      createdAt: new Date().toISOString(),
    };

    onSave(newSupplier);
    toast.success(`Supplier "${newSupplier.name}" added successfully!`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Enter the details for the new supplier.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="supplier-name">Supplier Name</Label>
            <Input
              id="supplier-name"
              value={supplierData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., ChemCorp Industries"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-person">Contact Person</Label>
            <Input
              id="contact-person"
              value={supplierData.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              placeholder="e.g., Rajesh Kumar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={supplierData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@supplier.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={supplierData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Initial Rating</Label>
            <Select
              value={String(supplierData.rating)}
              onValueChange={(value) => handleChange("rating", Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Stars - Excellent</SelectItem>
                <SelectItem value="4">4 Stars - Good</SelectItem>
                <SelectItem value="3">3 Stars - Average</SelectItem>
                <SelectItem value="2">2 Stars - Below Average</SelectItem>
                <SelectItem value="1">1 Star - Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={supplierData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter complete address"
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
            Add Supplier
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
      itemToUpdate.costPerKg = material?.pricePerKg || 0;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
