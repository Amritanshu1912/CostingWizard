// src/app/inventory/components/items/bulk-adjust-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdjustStock,
  useCreateInventoryItem,
} from "@/hooks/inventory-hooks/use-inventory-mutations";
import { useAllItemsWithInventoryStatus } from "@/hooks/inventory-hooks/use-inventory-computed";
import {
  calculateNewStockTotal,
  getTypeIcon,
  isUntrackedItem,
} from "@/utils/inventory-utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface BulkAdjustDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for bulk stock adjustment across multiple items
 * Supports both adding quantity and setting new totals
 */
export function BulkAdjustDialog({
  open,
  onOpenChange,
}: BulkAdjustDialogProps) {
  const allItems = useAllItemsWithInventoryStatus();
  const adjustStock = useAdjustStock();
  const createInventoryItem = useCreateInventoryItem();

  const [searchQuery, setSearchQuery] = useState("");
  const [reason, setReason] = useState("Purchase Order");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"add" | "adjust">("add");

  // User edits stored separately (avoids setState in render)
  const [userEdits, setUserEdits] = useState<
    Record<string, { selected: boolean; quantity: number }>
  >({});

  /**
   * Merge items with user edits
   */
  const bulkItems = useMemo(() => {
    if (!allItems) return [];

    return allItems.map((item) => ({
      ...item,
      selected: userEdits[item.id]?.selected ?? false,
      quantity: userEdits[item.id]?.quantity ?? 0,
    }));
  }, [allItems, userEdits]);

  /**
   * Filter items by search query
   */
  const filteredItems = bulkItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItems = bulkItems.filter((item) => item.selected);
  const totalAdjustments = selectedItems.filter(
    (item) => item.quantity !== 0
  ).length;

  /**
   * Toggle item selection
   */
  const toggleSelection = (id: string) => {
    setUserEdits((prev) => ({
      ...prev,
      [id]: {
        selected: !prev[id]?.selected,
        quantity: prev[id]?.quantity ?? 0,
      },
    }));
  };

  /**
   * Update quantity for an item
   */
  const updateQuantity = (id: string, quantity: number) => {
    setUserEdits((prev) => ({
      ...prev,
      [id]: {
        selected: prev[id]?.selected ?? false,
        quantity,
      },
    }));
  };

  /**
   * Select/deselect all filtered items
   */
  const selectAll = () => {
    const allSelected = filteredItems.every((f) => f.selected);
    const updates: Record<string, { selected: boolean; quantity: number }> = {};

    filteredItems.forEach((item) => {
      updates[item.id] = {
        selected: !allSelected,
        quantity: userEdits[item.id]?.quantity ?? 0,
      };
    });

    setUserEdits((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Handle bulk submission
   */
  const handleSubmit = async () => {
    const itemsToAdjust = selectedItems.filter((item) => item.quantity !== 0);
    if (itemsToAdjust.length === 0) {
      toast.error("No items with quantities to adjust");
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of itemsToAdjust) {
      try {
        // If untracked, create inventory item first
        if (isUntrackedItem(item) && item.itemId) {
          const initialStock = item.quantity;
          await createInventoryItem(
            item.itemType as any,
            item.itemId,
            initialStock,
            100,
            undefined,
            item.unit
          );
          successCount++;
        } else {
          // Adjust existing tracked item
          const delta =
            mode === "add" ? item.quantity : item.quantity - item.currentStock;
          await adjustStock(
            item.id,
            delta,
            reason,
            reference,
            `Bulk adjustment: ${item.itemName}`
          );
          successCount++;
        }
      } catch (err) {
        console.error(err);
        failCount++;
      }
    }

    setLoading(false);
    if (successCount > 0) {
      toast.success(`Successfully adjusted ${successCount} items`);
    }
    if (failCount > 0) {
      toast.error(`Failed to adjust ${failCount} items`);
    }

    // Close and reset if all succeeded
    if (successCount === itemsToAdjust.length) {
      onOpenChange(false);
      setUserEdits({});
      setSearchQuery("");
      setReference("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Stock Adjustment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
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
                  <SelectItem value="Stocktake">Stocktake</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reference (Optional)</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., PO-1234"
              />
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={mode === "add"}
                    onChange={() => setMode("add")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Add Quantity</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={mode === "adjust"}
                    onChange={() => setMode("adjust")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Set New Total</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "add"
                  ? "Each quantity will be added to the current stock."
                  : "Each quantity will be treated as the new total stock for that item."}
              </p>
            </div>
          </div>

          {/* Items list */}
          <div className="border border-border/50 rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    filteredItems.length > 0 &&
                    filteredItems.every((item) => item.selected)
                  }
                  onCheckedChange={selectAll}
                />
                <span className="text-sm font-medium">
                  Select All ({selectedItems.length} selected)
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {totalAdjustments} items with quantities
              </span>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-1">
                {filteredItems.map((item) => {
                  const newTotal = calculateNewStockTotal(
                    mode,
                    item.currentStock,
                    item.quantity
                  );

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        item.selected
                          ? "border-primary bg-primary/5"
                          : "border-border/30 hover:border-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleSelection(item.id)}
                        />

                        {getTypeIcon(item.itemType)}

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {item.itemName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.supplierName} • Current: {item.currentStock}{" "}
                            {item.unit}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              updateQuantity(item.id, Number(e.target.value))
                            }
                            placeholder="0"
                            className="w-24 text-center"
                            disabled={!item.selected}
                          />
                          <span className="text-xs text-muted-foreground w-8">
                            {item.unit}
                          </span>
                        </div>
                      </div>

                      {item.selected && item.quantity !== 0 && (
                        <div className="mt-2 pt-2 border-t border-border/30 text-xs">
                          <span className="text-muted-foreground">
                            New total:{" "}
                          </span>
                          <span className="font-semibold">
                            {newTotal} {item.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || totalAdjustments === 0}
          >
            {loading
              ? "Processing..."
              : mode === "add"
                ? `Add ${totalAdjustments} Items`
                : `Set ${totalAdjustments} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkAdjustDialog;
