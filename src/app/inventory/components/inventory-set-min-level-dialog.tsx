// src/app/inventory/components/inventory-set-min-level-dialog.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db as dbImport } from "@/lib/db";
import type { InventoryItemWithDetails } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface SetMinLevelDialogProps {
  item: InventoryItemWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetMinLevelDialog({
  item,
  open,
  onOpenChange,
}: SetMinLevelDialogProps) {
  const [minLevel, setMinLevel] = useState(item.minStockLevel);
  const [maxLevel, setMaxLevel] = useState(item.maxStockLevel);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await dbImport.inventoryItems.update(item.id, {
        minStockLevel: minLevel,
        maxStockLevel: maxLevel,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Stock levels updated");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update stock levels");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Set Stock Levels</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="font-medium">{item.itemName}</div>
            <div className="text-sm text-muted-foreground">
              {item.supplierName}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minLevel">Minimum Stock Level</Label>
            <div className="flex gap-2">
              <Input
                id="minLevel"
                type="number"
                value={minLevel || ""}
                onChange={(e) => setMinLevel(Number(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                {item.unit}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Alert will trigger when stock falls below this level
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLevel">Maximum Stock Level (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="maxLevel"
                type="number"
                value={maxLevel || ""}
                onChange={(e) =>
                  setMaxLevel(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Leave empty for no limit"
                className="flex-1"
              />
              <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm">
                {item.unit}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
