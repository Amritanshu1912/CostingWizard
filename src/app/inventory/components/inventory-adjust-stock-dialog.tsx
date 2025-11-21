// src/app/inventory/components/adjust-stock-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdjustStock } from "@/hooks/use-inventory";
import type { InventoryItemWithDetails } from "@/lib/types";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface AdjustStockDialogProps {
  item: InventoryItemWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdjustStockDialog({
  item,
  open,
  onOpenChange,
}: AdjustStockDialogProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("Purchase Order");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const adjustStock = useAdjustStock();

  const newTotal = item.currentStock + quantity;

  const handleSubmit = async () => {
    if (quantity === 0) {
      toast.error("Please enter a quantity");
      return;
    }

    setLoading(true);
    try {
      await adjustStock(item.id, quantity, reason, reference, notes);
      toast.success(`Stock ${quantity > 0 ? "added" : "removed"} successfully`);
      onOpenChange(false);
      // Reset form
      setQuantity(0);
      setReason("Purchase Order");
      setReference("");
      setNotes("");
    } catch (error) {
      toast.error("Failed to adjust stock");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {item.itemName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Stock */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">
              Current Stock
            </div>
            <div className="text-2xl font-bold">
              {item.currentStock} {item.unit}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Change Amount</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuantity(Math.max(quantity - 10, -item.currentStock))
                }
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0"
                className="text-center text-lg font-semibold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Use positive numbers to add stock, negative to remove
            </div>
          </div>

          {/* New Total */}
          <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
            <div className="text-sm text-muted-foreground mb-1">New Total</div>
            <div
              className={`text-2xl font-bold ${
                newTotal < 0 ? "text-destructive" : ""
              }`}
            >
              {newTotal} {item.unit}
            </div>
            {newTotal < 0 && (
              <div className="text-xs text-destructive mt-1">
                Cannot go below 0
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Purchase Order">Purchase Order</SelectItem>
                <SelectItem value="Production Batch">
                  Production Batch
                </SelectItem>
                <SelectItem value="Manual Adjustment">
                  Manual Adjustment
                </SelectItem>
                <SelectItem value="Damage/Waste">Damage/Waste</SelectItem>
                <SelectItem value="Return">Return</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">
              Reference (Optional)
              <span className="text-muted-foreground text-xs ml-2">
                PO ID, Batch ID, etc.
              </span>
            </Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., PO-1234, BATCH-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || quantity === 0 || newTotal < 0}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
