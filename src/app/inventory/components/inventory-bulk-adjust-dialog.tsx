// src/app/inventory/components/inventory-bulk-adjust-dialog.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllItemsWithInventoryStatus,
  useAdjustStock,
  useCreateInventoryItem,
} from "@/hooks/use-inventory";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getTypeIcon } from "@/app/inventory/utils/inventory-utils";

interface BulkAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BulkItem {
  id: string; // may be an untracked id like 'untracked-...'
  itemId?: string; // original supplier item id for untracked rows
  itemName: string;
  supplierName: string;
  currentStock: number;
  unit: string;
  itemType: string;
  selected: boolean;
  quantity: number; // user-entered value (delta or desired total depending on mode)
}

export function BulkAdjustDialog({
  open,
  onOpenChange,
}: BulkAdjustDialogProps) {
  const items = useAllItemsWithInventoryStatus();
  const adjustStock = useAdjustStock();
  const createInventoryItem = useCreateInventoryItem();

  const [searchQuery, setSearchQuery] = useState("");
  const [reason, setReason] = useState("Purchase Order");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [mode, setMode] = useState<"add" | "adjust">("add");

  // Initialize/reconcile bulkItems from combined items
  useEffect(() => {
    if (!items) return;

    // If not yet initialized, create base list
    if (bulkItems.length === 0) {
      setBulkItems(
        items.map((it) => ({
          id: it.id,
          itemId: (it as any).itemId || undefined,
          itemName: it.itemName,
          supplierName: it.supplierName,
          currentStock: it.currentStock,
          unit: it.unit,
          itemType: it.itemType,
          selected: false,
          quantity: 0,
        }))
      );
      return;
    }

    // Add newly-appeared items while preserving user edits
    const missing = items.filter(
      (it) => !bulkItems.some((b) => b.id === it.id)
    );
    if (missing.length > 0) {
      setBulkItems((prev) => [
        ...prev,
        ...missing.map((it) => ({
          id: it.id,
          itemId: (it as any).itemId || undefined,
          itemName: it.itemName,
          supplierName: it.supplierName,
          currentStock: it.currentStock,
          unit: it.unit,
          itemType: it.itemType,
          selected: false,
          quantity: 0,
        })),
      ]);
    }
  }, [items]);

  const filteredItems = bulkItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItems = bulkItems.filter((item) => item.selected);
  const totalAdjustments = selectedItems.filter(
    (item) => item.quantity !== 0
  ).length;

  const toggleSelection = (id: string) =>
    setBulkItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );

  const updateQuantity = (id: string, quantity: number) =>
    setBulkItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

  const selectAll = () => {
    const allSelected = filteredItems.every((f) => f.selected);
    setBulkItems((prev) =>
      prev.map((it) =>
        filteredItems.some((f) => f.id === it.id)
          ? { ...it, selected: !allSelected }
          : it
      )
    );
  };

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
        // Untracked supplier items may have ids like 'untracked-...'
        if (item.id.startsWith("untracked-") && item.itemId) {
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
    if (successCount > 0)
      toast.success(`Successfully adjusted ${successCount} items`);
    if (failCount > 0) toast.error(`Failed to adjust ${failCount} items`);

    if (successCount === itemsToAdjust.length) {
      onOpenChange(false);
      setBulkItems((prev) =>
        prev.map((item) => ({ ...item, selected: false, quantity: 0 }))
      );
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

          {/* Items List */}
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
                {filteredItems.map((item) => (
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
                          {mode === "add"
                            ? item.currentStock + item.quantity
                            : item.quantity}{" "}
                          {item.unit}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
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
