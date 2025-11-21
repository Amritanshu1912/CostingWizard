// src/app/inventory/components/inventory-stock-list.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Minus,
  History,
  Settings,
  Beaker,
  Box,
  Tag,
} from "lucide-react";
import type { InventoryItemWithDetails } from "@/lib/types";
import { AdjustStockDialog } from "./inventory-adjust-stock-dialog";
import { SetMinLevelDialog } from "./inventory-set-min-level-dialog";
import { format } from "date-fns";

interface InventoryStockListProps {
  items: InventoryItemWithDetails[] | undefined;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}

export function InventoryStockList({
  items,
  selectedItemId,
  onSelectItem,
}: InventoryStockListProps) {
  const [adjustDialogItem, setAdjustDialogItem] =
    useState<InventoryItemWithDetails | null>(null);
  const [minLevelDialogItem, setMinLevelDialogItem] =
    useState<InventoryItemWithDetails | null>(null);

  if (!items) {
    return <div>Loading...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return <Badge variant="destructive">⚫ Out of Stock</Badge>;
      case "low-stock":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            🔴 Low Stock
          </Badge>
        );
      case "in-stock":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-300"
          >
            🟢 In Stock
          </Badge>
        );
      case "overstock":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            🔵 Overstock
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "supplierMaterial":
        return <Beaker className="h-4 w-4 text-blue-500" />;
      case "supplierPackaging":
        return <Box className="h-4 w-4 text-green-500" />;
      case "supplierLabel":
        return <Tag className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock List</h2>
        <div className="text-sm text-muted-foreground">
          {items.length} items total
        </div>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-8"></TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Min Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock Value</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className={`cursor-pointer transition-colors ${
                  selectedItemId === item.id
                    ? "bg-primary/5"
                    : "hover:bg-muted/20"
                }`}
                onClick={() => onSelectItem(item.id)}
              >
                <TableCell>{getTypeIcon(item.itemType)}</TableCell>
                <TableCell>
                  <div className="font-medium">{item.itemName}</div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {item.supplierName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {item.currentStock} {item.unit}
                    </span>
                    {/* Progress indicator */}
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.status === "out-of-stock"
                            ? "bg-destructive"
                            : item.status === "low-stock"
                            ? "bg-yellow-500"
                            : item.status === "overstock"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(item.stockPercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.minStockLevel} {item.unit}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(item.stockValue)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {format(new Date(item.lastUpdated), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdjustDialogItem(item);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adjust Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinLevelDialogItem(item);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set Min Level
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item.id);
                        }}
                      >
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {adjustDialogItem && (
        <AdjustStockDialog
          item={adjustDialogItem}
          open={!!adjustDialogItem}
          onOpenChange={(open) => !open && setAdjustDialogItem(null)}
        />
      )}

      {minLevelDialogItem && (
        <SetMinLevelDialog
          item={minLevelDialogItem}
          open={!!minLevelDialogItem}
          onOpenChange={(open) => !open && setMinLevelDialogItem(null)}
        />
      )}
    </div>
  );
}
