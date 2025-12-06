// src/app/inventory/components/inventory-item-dialog.tsx
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
import { useAdjustStock, useCreateInventoryItem } from "@/hooks/use-inventory";
import { db } from "@/lib/db";
import type {
  InventoryItem,
  InventoryItemWithDetails,
} from "@/types/shared-types";
import { useLiveQuery } from "dexie-react-hooks";
import { Beaker, Box, Minus, Plus, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InventoryItemDialogProps {
  item?: InventoryItemWithDetails; // undefined = Add mode, defined = Edit mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
type ItemType = InventoryItem["itemType"];

export function InventoryItemDialog({
  item,
  open,
  onOpenChange,
}: InventoryItemDialogProps) {
  const isEditMode = !!item;

  // === ADD MODE STATES ===
  const [itemType, setItemType] = useState<ItemType>("supplierMaterial");
  const [selectedItemId, setSelectedItemId] = useState("");

  // === COMMON STATES ===
  const [currentStock, setCurrentStock] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(100);
  const [maxStockLevel, setMaxStockLevel] = useState<number | undefined>();
  const [notes, setNotes] = useState("");

  // === EDIT MODE: Stock adjustment fields ===
  const [reason, setReason] = useState("Manual Adjustment");
  const [reference, setReference] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [stockMode, setStockMode] = useState<"add" | "adjust">("adjust");

  const [loading, setLoading] = useState(false);

  const createInventoryItem = useCreateInventoryItem();
  const adjustStock = useAdjustStock();

  // Fetch available items for ADD mode
  const supplierMaterials = useLiveQuery(() => db.supplierMaterials.toArray());
  const supplierPackaging = useLiveQuery(() => db.supplierPackaging.toArray());
  const supplierLabels = useLiveQuery(() => db.supplierLabels.toArray());
  const materials = useLiveQuery(() => db.materials.toArray());
  const packaging = useLiveQuery(() => db.packaging.toArray());
  const labels = useLiveQuery(() => db.labels.toArray());
  const suppliers = useLiveQuery(() => db.suppliers.toArray());
  const existingInventory = useLiveQuery(() => db.inventoryItems.toArray());

  // Get available items for ADD mode
  const getAvailableItems = () => {
    if (!existingInventory) return [];

    switch (itemType) {
      case "supplierMaterial":
        return (
          supplierMaterials
            ?.filter(
              (sm) => !existingInventory.some((inv) => inv.itemId === sm.id)
            )
            .map((sm) => {
              const material = materials?.find((m) => m.id === sm.materialId);
              const supplier = suppliers?.find((s) => s.id === sm.supplierId);
              return {
                id: sm.id,
                name: `${material?.name || "Unknown"} (${
                  supplier?.name || "Unknown"
                })`,
                unit: sm.capacityUnit,
              };
            }) || []
        );
      case "supplierPackaging":
        return (
          supplierPackaging
            ?.filter(
              (sp) => !existingInventory.some((inv) => inv.itemId === sp.id)
            )
            .map((sp) => {
              const pkg = packaging?.find((p) => p.id === sp.packagingId);
              const supplier = suppliers?.find((s) => s.id === sp.supplierId);
              return {
                id: sp.id,
                name: `${pkg?.name || "Unknown"} (${
                  supplier?.name || "Unknown"
                })`,
                unit: "pcs",
              };
            }) || []
        );
      case "supplierLabel":
        return (
          supplierLabels
            ?.filter(
              (sl) => !existingInventory.some((inv) => inv.itemId === sl.id)
            )
            .map((sl) => {
              const label = labels?.find((l) => l.id === sl.labelId);
              const supplier = suppliers?.find((s) => s.id === sl.supplierId);
              return {
                id: sl.id,
                name: `${label?.name || "Unknown"} (${
                  supplier?.name || "Unknown"
                })`,
                unit: sl.unit || "pcs",
              };
            }) || []
        );
      default:
        return [];
    }
  };

  const availableItems = getAvailableItems();
  const selectedItem = availableItems.find(
    (item) => item.id === selectedItemId
  );

  // Calculate stock change for EDIT mode (mode-aware)
  const stockChanged =
    isEditMode &&
    (stockMode === "add"
      ? currentStock !== 0
      : currentStock !== item.currentStock);
  const stockDifference = isEditMode
    ? stockMode === "add"
      ? currentStock
      : currentStock - item.currentStock
    : 0;

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open && isEditMode) {
      // EDIT MODE: Pre-fill with existing data
      setCurrentStock(item.currentStock);
      setMinStockLevel(item.minStockLevel);
      setMaxStockLevel(item.maxStockLevel);
      setNotes(item.notes || "");
      setReason("Manual Adjustment");
      setReference("");
      setAdjustmentNotes("");
      setStockMode("adjust");
    } else if (open && !isEditMode) {
      // ADD MODE: Reset to defaults
      setItemType("supplierMaterial");
      setSelectedItemId("");
      setCurrentStock(0);
      setMinStockLevel(100);
      setMaxStockLevel(undefined);
      setNotes("");
    }
  }, [open, isEditMode, item]);

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
        // Update inventory item fields
        await db.inventoryItems.update(item.id, {
          minStockLevel,
          maxStockLevel,
          notes,
          updatedAt: new Date().toISOString(),
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
                      {item.currentStock + currentStock} {item.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* === EDIT MODE ONLY: Show reason fields if stock changed === */}
            {isEditMode && stockChanged && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
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
