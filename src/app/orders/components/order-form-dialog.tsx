// src/app/orders/components/order-form-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/order-types";
import { useOrderOperations } from "@/hooks/order-hooks/use-orders";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

interface OrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrder?: PurchaseOrder | null;
  onSaved: (order: PurchaseOrder) => void;
}

/**
 * Order form dialog component
 * Modal form for creating/editing orders
 */
export function OrderFormDialog({
  isOpen,
  onClose,
  initialOrder,
  onSaved,
}: OrderFormDialogProps) {
  const { createOrder, updateOrder } = useOrderOperations();

  // Fetch suppliers for dropdown
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  // Form state
  const [supplierId, setSupplierId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [dateCreated, setDateCreated] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Omit<PurchaseOrderItem, "id">[]>([]);

  // Reset form when dialog opens/closes or initial order changes
  useEffect(() => {
    if (isOpen) {
      if (initialOrder) {
        setOrderId(initialOrder.orderId);
        setSupplierId(initialOrder.supplierId);
        setDateCreated(initialOrder.dateCreated);
        setExpectedDeliveryDate(initialOrder.expectedDeliveryDate || "");
        setNotes(initialOrder.notes || "");
        setItems(initialOrder.items);
      } else {
        // Reset for new order
        setOrderId(`PO-${Date.now().toString()}`);
        setSupplierId("");
        setDateCreated(new Date().toISOString().split("T")[0]);
        setExpectedDeliveryDate("");
        setNotes("");
        setItems([]);
      }
    }
  }, [isOpen, initialOrder]);

  /** Add new item row */
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemType: "material",
        itemId: "",
        itemName: "",
        quantity: 1,
        quantityReceived: 0,
        unit: "kg",
        unitPrice: 0,
        tax: 0,
        totalCost: 0,
      },
    ]);
  };

  /** Remove item row */
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /** Update item field */
  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };
    (item as any)[field] = value;

    // Recalculate total cost
    if (field === "quantity" || field === "unitPrice" || field === "tax") {
      const subtotal = item.quantity * item.unitPrice;
      item.totalCost = subtotal + (subtotal * item.tax) / 100;
    }

    updatedItems[index] = item;
    setItems(updatedItems);
  };

  /** Calculate total order cost */
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);

  /** Handle save */
  const handleSave = async () => {
    // Validation
    if (!supplierId || items.length === 0) {
      return;
    }

    const supplier = suppliers?.find((s) => s.id === supplierId);
    if (!supplier) return;

    // Add IDs to items
    const itemsWithIds = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));

    const orderData = {
      orderId,
      supplierId,
      supplierName: supplier.name,
      items: itemsWithIds,
      totalCost,
      status: "draft" as const,
      dateCreated,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      notes: notes || undefined,
    };

    if (initialOrder) {
      await updateOrder(initialOrder.id, orderData);
      onSaved({ ...initialOrder, ...orderData });
    } else {
      const newOrder = await createOrder(orderData);
      onSaved(newOrder);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialOrder ? "Edit Order" : "Create New Order"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Date *</Label>
              <Input
                type="date"
                value={dateCreated}
                onChange={(e) => setDateCreated(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery</Label>
              <Input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Order Items *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                No items added. Click &quot;Add Item&quot; to start.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg"
                  >
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Item Name</Label>
                      <Input
                        value={item.itemName}
                        onChange={(e) =>
                          handleItemChange(index, "itemName", e.target.value)
                        }
                        placeholder="Item name"
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={item.itemType}
                        onValueChange={(value) =>
                          handleItemChange(index, "itemType", value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="material">Material</SelectItem>
                          <SelectItem value="packaging">Packaging</SelectItem>
                          <SelectItem value="label">Label</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Quantity</Label>
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
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitPrice",
                            Number(e.target.value)
                          )
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={`₹${item.totalCost.toFixed(2)}`}
                        disabled
                        className="h-9 bg-muted"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="h-9 w-9 p-0 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">₹{totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!supplierId || items.length === 0}
            >
              {initialOrder ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
