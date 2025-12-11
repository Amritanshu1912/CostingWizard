// src/app/inventory/components/items/item-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  useAdjustStock,
  useCreateInventoryItem,
  useUpdateInventoryItem,
} from "@/hooks/inventory-hooks/use-inventory-mutations";
import { useAllInventoryItems } from "@/hooks/use-database-data";
import { useReferenceData } from "@/hooks/inventory-hooks/use-inventory-data";
import type {
  InventoryItem,
  InventoryItemWithDetails,
} from "@/types/inventory-types";
import {
  calculateNewStockTotal,
  getAvailableItemsForType,
} from "@/utils/inventory-utils";
import { Beaker, Box, Minus, Plus, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ItemDialogProps {
  /** Item to edit (undefined = Add mode) */
  item?: InventoryItemWithDetails;
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for adding new inventory item or editing existing one
 * Handles both add and edit modes with different UI states
 */
export function InventoryItemDialog({
  item,
  open,
  onOpenChange,
}: ItemDialogProps) {
  const isEditMode = !!item;

  // Hooks
  const createInventoryItem = useCreateInventoryItem();
  const updateInventoryItem = useUpdateInventoryItem();
  const adjustStock = useAdjustStock();
  const refData = useReferenceData();
  const existingInventory = useAllInventoryItems();

  // ADD MODE states
  const [itemType, setItemType] =
    useState<InventoryItem["itemType"]>("supplierMaterial");
  const [selectedItemId, setSelectedItemId] = useState("");

  // COMMON states
  const [currentStock, setCurrentStock] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(100);
  const [maxStockLevel, setMaxStockLevel] = useState<number | undefined>();
  const [notes, setNotes] = useState("");

  // EDIT MODE: Stock adjustment fields
  const [reason, setReason] = useState("Manual Adjustment");
  const [reference, setReference] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [stockMode, setStockMode] = useState<"add" | "adjust">("adjust");

  const [loading, setLoading] = useState(false);

  // Get available items for ADD mode
  const availableItems =
    refData && existingInventory
      ? getAvailableItemsForType(itemType, refData, existingInventory)
      : [];

  const selectedItem = availableItems.find((i) => i.id === selectedItemId);

  // Calculate stock changes for EDIT mode
  const stockChanged =
    isEditMode &&
    (stockMode === "add"
      ? currentStock !== 0
      : currentStock !== item.currentStock);
  const stockDifference = isEditMode
    ? stockMode === "add"
      ? currentStock // add mode → difference equals input
      : currentStock - item.currentStock // adjust mode → delta from existing stock
    : 0;
  const newStockTotal = isEditMode
    ? calculateNewStockTotal(stockMode, item.currentStock, currentStock)
    : currentStock;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && isEditMode) {
      // EDIT MODE: Pre-fill
      setCurrentStock(item.currentStock);
      setMinStockLevel(item.minStockLevel);
      setMaxStockLevel(item.maxStockLevel);
      setNotes(item.notes || "");
      setReason("Manual Adjustment");
      setReference("");
      setAdjustmentNotes("");
      setStockMode("adjust");
    } else if (open && !isEditMode) {
      // ADD MODE: Reset
      setItemType("supplierMaterial");
      setSelectedItemId("");
      setCurrentStock(0);
      setMinStockLevel(100);
      setMaxStockLevel(undefined);
      setNotes("");
    }
  }, [open, isEditMode, item]);

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!isEditMode) {
      // === ADD MODE ===
      if (!selectedItemId) {
        toast.error("Please select an item");
        return;
      }

      setLoading(true);
      try {
        await createInventoryItem(
          itemType,
          selectedItemId,
          currentStock,
          minStockLevel,
          maxStockLevel,
          selectedItem?.unit || "kg"
        );
        toast.success("Inventory item added successfully");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to add inventory item");
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      // === EDIT MODE ===
      setLoading(true);
      try {
        // Update item details
        await updateInventoryItem(item.id, {
          minStockLevel,
          maxStockLevel,
          notes,
        });

        // If stock changed, create adjustment transaction
        if (stockChanged) {
          await adjustStock(
            item.id,
            stockDifference,
            reason,
            reference,
            adjustmentNotes || notes
          );
        }

        toast.success("Inventory item updated successfully");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to update inventory item");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Inventory Item" : "Add Item to Inventory"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* === ADD MODE: Item Selection === */}
          {!isEditMode && (
            <>
              {/* Item Type Selection */}
              <div className="space-y-2">
                <Label>Item Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={
                      itemType === "supplierMaterial" ? "default" : "outline"
                    }
                    onClick={() => {
                      setItemType("supplierMaterial");
                      setSelectedItemId("");
                    }}
                    className="gap-2"
                  >
                    <Beaker className="h-4 w-4" />
                    Material
                  </Button>
                  <Button
                    type="button"
                    variant={
                      itemType === "supplierPackaging" ? "default" : "outline"
                    }
                    onClick={() => {
                      setItemType("supplierPackaging");
                      setSelectedItemId("");
                    }}
                    className="gap-2"
                  >
                    <Box className="h-4 w-4" />
                    Packaging
                  </Button>
                  <Button
                    type="button"
                    variant={
                      itemType === "supplierLabel" ? "default" : "outline"
                    }
                    onClick={() => {
                      setItemType("supplierLabel");
                      setSelectedItemId("");
                    }}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Label
                  </Button>
                </div>
              </div>

              {/* Select Item */}
              <div className="space-y-2">
                <Label>Select Item</Label>
                <Select
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No items available (all already tracked)
                      </div>
                    ) : (
                      availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* === EDIT MODE: Item Info Display === */}
          {isEditMode && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-lg truncate">
                    {item.itemName}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {item.supplierName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current</div>
                  <div className="font-semibold">
                    {item.currentStock} {item.unit}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === Stock Level Section === */}
          <div
            className={`space-y-4 p-4 rounded-lg border-2 ${
              isEditMode
                ? "border-primary/20 bg-primary/5"
                : "border-border/50 bg-muted/20"
            }`}
          >
            <Label className="text-base font-semibold">
              {isEditMode ? "Adjust Stock Level" : "Initial Stock"}
            </Label>

            {/* EDIT MODE: Stock mode selector */}
            {isEditMode && (
              <div className="flex items-center gap-4 mb-3">
                <Label className="text-sm">Mode:</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={stockMode === "adjust"}
                      onChange={() => {
                        setStockMode("adjust");
                        setCurrentStock(item.currentStock);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Set New Total</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={stockMode === "add"}
                      onChange={() => {
                        setStockMode("add");
                        setCurrentStock(0);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Add Quantity</span>
                  </label>
                </div>
              </div>
            )}

            {/* Stock input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentStock(Math.max(0, currentStock - 10))
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="text-center text-lg font-semibold flex-1"
                />
                <div className="flex items-center px-3 border border-input rounded-md bg-muted">
                  {isEditMode ? item.unit : selectedItem?.unit || "unit"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentStock(currentStock + 10)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Stock change indicators */}
              <div className="flex flex-row gap-4">
                {isEditMode && stockChanged && (
                  <div
                    className={`text-sm font-medium ${
                      stockDifference > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stockDifference > 0 ? "+" : ""}
                    {stockDifference} {item.unit} change
                  </div>
                )}

                {isEditMode && stockMode === "add" && currentStock !== 0 && (
                  <div className="text-sm text-muted-foreground">
                    New total will be:{" "}
                    <span className="font-semibold text-foreground">
                      {newStockTotal} {item.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* === EDIT MODE: Reason fields if stock changed === */}
            {isEditMode && stockChanged && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reason for Change</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Purchase Order">
                          Purchase Order
                        </SelectItem>
                        <SelectItem value="Production Batch">
                          Production Batch
                        </SelectItem>
                        <SelectItem value="Manual Adjustment">
                          Manual Adjustment
                        </SelectItem>
                        <SelectItem value="Stocktake">Stocktake</SelectItem>
                        <SelectItem value="Damage/Waste">
                          Damage/Waste
                        </SelectItem>
                        <SelectItem value="Return">Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reference (Optional)</Label>
                    <Input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g., PO-1234, BATCH-001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Adjustment Notes (Optional)</Label>
                  <Textarea
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder="Details about this stock change..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* === Min/Max Stock Levels === */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Stock Thresholds</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Stock Level</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                    {isEditMode ? item.unit : selectedItem?.unit || "unit"}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Stock Level (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={maxStockLevel || ""}
                    onChange={(e) =>
                      setMaxStockLevel(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="No limit"
                    className="flex-1"
                  />
                  <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                    {isEditMode ? item.unit : selectedItem?.unit || "unit"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === General Notes === */}
          <div className="space-y-2">
            <Label>General Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this inventory item..."
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
            disabled={
              loading || currentStock < 0 || (!isEditMode && !selectedItemId)
            }
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Add to Inventory"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryItemDialog;
