// src/app/inventory/components/inventory-stock-list.tsx
"use client";

import {
  formatCurrency,
  getStatusBadge,
  getTypeIcon,
} from "@/app/inventory/utils/inventory-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ColumnDef, SortableTable } from "@/components/ui/sortable-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAllItemsWithInventoryStatus,
  useInventoryFilters,
} from "@/hooks/use-inventory";
import type { InventoryItemWithDetails } from "@/types/shared-types";
import { format } from "date-fns";
import { Beaker, Box, Edit, Filter, History, Search, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { ItemTransactionsDialog } from "./inventory-item-txn-dialog";

export function InventoryStockList() {
  const allItemsWithStatus = useAllItemsWithInventoryStatus();
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    filterStatus,
    toggleTypeFilter,
    toggleStatusFilter,
    filterItems,
  } = useInventoryFilters();

  const [editDialogItem, setEditDialogItem] =
    useState<InventoryItemWithDetails | null>(null);
  const [transactionsDialogItem, setTransactionsDialogItem] =
    useState<InventoryItemWithDetails | null>(null);

  // Apply filters
  const filteredItems = allItemsWithStatus
    ? filterItems(allItemsWithStatus)
    : [];

  const handleEdit = (row: InventoryItemWithDetails) => {
    if (row.id.startsWith("untracked-")) {
      toast.info(
        "This item is not tracked yet. Click 'Add Stock' button to start tracking."
      );
      return;
    }
    setEditDialogItem(row);
  };

  const columns: ColumnDef<InventoryItemWithDetails>[] = [
    {
      key: "itemType",
      label: "",
      width: "40px",
      sortable: false,
      render: (_, row) => getTypeIcon(row.itemType),
    },
    {
      key: "itemName",
      label: "Item",
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "supplierName",
      label: "Supplier",
      render: (value) => (
        <div className="text-muted-foreground text-sm">{value}</div>
      ),
    },
    {
      key: "currentStock",
      label: "Current Stock",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {value} {row.unit}
          </span>
        </div>
      ),
    },
    {
      key: "minStockLevel",
      label: "Min Level",
      render: (value, row) => (
        <span className="text-muted-foreground">
          {value} {row.unit}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "stockValue",
      label: "Stock Value",
      align: "right",
      render: (value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (value) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(value), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "100px",
      sortable: false,
      render: (_, row) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Edit Item</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTransactionsDialogItem(row);
                  }}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>View Transactions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  if (!allItemsWithStatus) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                filterType.has("supplierMaterial") ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleTypeFilter("supplierMaterial")}
            >
              <Beaker className="h-3 w-3 mr-1" />
              Materials
            </Badge>
            <Badge
              variant={
                filterType.has("supplierPackaging") ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleTypeFilter("supplierPackaging")}
            >
              <Box className="h-3 w-3 mr-1" />
              Packaging
            </Badge>
            <Badge
              variant={filterType.has("supplierLabel") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTypeFilter("supplierLabel")}
            >
              <Tag className="h-3 w-3 mr-1" />
              Labels
            </Badge>
          </div>
          |
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filterStatus.has("in-stock") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStatusFilter("in-stock")}
            >
              In Stock
            </Badge>
            <Badge
              variant={filterStatus.has("low-stock") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStatusFilter("low-stock")}
            >
              Low Stock
            </Badge>
            <Badge
              variant={filterStatus.has("out-of-stock") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStatusFilter("out-of-stock")}
            >
              Out of Stock
            </Badge>

            <Badge
              variant={filterStatus.has("overstock") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStatusFilter("overstock")}
            >
              Overstock
            </Badge>
          </div>
        </div>
      </div>

      <SortableTable
        data={filteredItems}
        columns={columns}
        emptyMessage="No inventory items found"
      />

      {editDialogItem && (
        <InventoryItemDialog
          item={editDialogItem}
          open={!!editDialogItem}
          onOpenChange={(open) => !open && setEditDialogItem(null)}
        />
      )}

      {transactionsDialogItem && (
        <ItemTransactionsDialog
          item={transactionsDialogItem}
          open={!!transactionsDialogItem}
          onOpenChange={(open) => !open && setTransactionsDialogItem(null)}
        />
      )}
    </Card>
  );
}
