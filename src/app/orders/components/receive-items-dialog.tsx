/**
 * @fileoverview Receive items dialog
 * Dialog for recording partial or full delivery of order items
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PurchaseOrder } from "@/types/order-types";
import { useOrderOperations } from "@/hooks/order-hooks/use-orders";

interface ReceiveItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder;
}

/**
 * Receive items dialog component
 * Allows recording received quantities for order items
 */
export function ReceiveItemsDialog({
  isOpen,
  onClose,
  order,
}: ReceiveItemsDialogProps) {
  const { receiveItems } = useOrderOperations();

  // Track quantities to receive for each item
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    order.items.forEach((item) => {
      // Default to remaining quantity
      initial[item.id] = item.quantity - item.quantityReceived;
    });
    return initial;
  });

  /** Update quantity for an item */
  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  /** Handle receive items */
  const handleReceive = async () => {
    const receivedItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, quantityReceived]) => ({
        itemId,
        quantityReceived,
      }));

    if (receivedItems.length === 0) {
      return;
    }

    await receiveItems(order.id, receivedItems);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Items - {order.orderId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Enter the quantities received for each item. You can receive partial
            quantities.
          </p>

          {/* Items list */}
          <div className="space-y-3">
            {order.items.map((item) => {
              const remaining = item.quantity - item.quantityReceived;
              const isFullyReceived = remaining === 0;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center p-3 border rounded-lg"
                >
                  <div className="col-span-5">
                    <p className="font-medium text-sm">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.itemType}
                    </p>
                  </div>

                  <div className="col-span-2 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Ordered
                    </p>
                    <p className="font-medium">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div className="col-span-2 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Received
                    </p>
                    <p className="font-medium">
                      {item.quantityReceived} {item.unit}
                    </p>
                  </div>

                  <div className="col-span-3">
                    <Label className="text-xs mb-1">Receive Now</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={remaining}
                        value={quantities[item.id] || 0}
                        onChange={(e) =>
                          handleQuantityChange(item.id, Number(e.target.value))
                        }
                        disabled={isFullyReceived}
                        className="h-9"
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.unit}
                      </span>
                    </div>
                  </div>

                  {isFullyReceived && (
                    <div className="col-span-12 text-xs text-green-600">
                      ✓ Fully received
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleReceive}>Confirm Receipt</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
