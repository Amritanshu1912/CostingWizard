// src/app/inventory/components/add-stock-dialog.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInventoryItem } from "@/hooks/use-inventory";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Beaker, Box, Tag } from "lucide-react";

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStockDialog({ open, onOpenChange }: AddStockDialogProps) {
  const [itemType, setItemType] = useState<
    "supplierMaterial" | "supplierPackaging" | "supplierLabel"
  >("supplierMaterial");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [initialStock, setInitialStock] = useState<number>(0);
  const [minStockLevel, setMinStockLevel] = useState<number>(100);
  const [maxStockLevel, setMaxStockLevel] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const createInventoryItem = useCreateInventoryItem();

  // Fetch available items based on type
  const supplierMaterials = useLiveQuery(() => db.supplierMaterials.toArray());
  const supplierPackaging = useLiveQuery(() => db.supplierPackaging.toArray());
  const supplierLabels = useLiveQuery(() => db.supplierLabels.toArray());
  const materials = useLiveQuery(() => db.materials.toArray());
  const packaging = useLiveQuery(() => db.packaging.toArray());
  const labels = useLiveQuery(() => db.labels.toArray());
  const suppliers = useLiveQuery(() => db.suppliers.toArray());
  const existingInventory = useLiveQuery(() => db.inventoryItems.toArray());

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
                unit: sm.unit,
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

  const handleSubmit = async () => {
    if (!selectedItemId) {
      toast.error("Please select an item");
      return;
    }

    setLoading(true);
    try {
      await createInventoryItem(
        itemType,
        selectedItemId,
        initialStock,
        minStockLevel,
        maxStockLevel,
        selectedItem?.unit || "kg"
      );
      toast.success("Inventory item added successfully");
      onOpenChange(false);
      // Reset form
      setSelectedItemId("");
      setInitialStock(0);
      setMinStockLevel(100);
      setMaxStockLevel(undefined);
    } catch (error) {
      toast.error("Failed to add inventory item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Item to Inventory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Type */}
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
                variant={itemType === "supplierLabel" ? "default" : "outline"}
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
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
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

          {/* Initial Stock */}
          <div className="space-y-2">
            <Label htmlFor="initialStock">Initial Stock</Label>
            <div className="flex gap-2">
              <Input
                id="initialStock"
                type="number"
                value={initialStock || ""}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                placeholder="0"
                className="flex-1"
              />
              <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                {selectedItem?.unit || "unit"}
              </div>
            </div>
          </div>

          {/* Min Stock Level */}
          <div className="space-y-2">
            <Label htmlFor="minStock">
              Minimum Stock Level (Reorder Point)
            </Label>
            <div className="flex gap-2">
              <Input
                id="minStock"
                type="number"
                value={minStockLevel || ""}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                placeholder="100"
                className="flex-1"
              />
              <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                {selectedItem?.unit || "unit"}
              </div>
            </div>
          </div>

          {/* Max Stock Level (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="maxStock">
              Maximum Stock Level (Optional)
              <span className="text-muted-foreground text-xs ml-2">
                For overstock alerts
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="maxStock"
                type="number"
                value={maxStockLevel || ""}
                onChange={(e) =>
                  setMaxStockLevel(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Leave empty for no limit"
                className="flex-1"
              />
              <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                {selectedItem?.unit || "unit"}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedItemId}>
            {loading ? "Adding..." : "Add to Inventory"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
