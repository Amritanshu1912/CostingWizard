// src/app/inventory/components/stock-list.tsx
"use client";

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
import { useAllItemsWithInventoryStatus } from "@/hooks/inventory-hooks/use-inventory-computed";
import { useInventoryFilters } from "@/hooks/inventory-hooks/use-inventory-data";
import type { InventoryItemWithDetails } from "@/types/inventory-types";
import {
  formatCurrency,
  formatDate,
  getStatusBadge,
  getTypeIcon,
  isUntrackedItem,
} from "@/utils/inventory-utils";
import { Beaker, Box, Edit, Filter, History, Search, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { ItemTransactionDialog } from "../transactions/inventory-item-txn-dialog";

/**
 * Full inventory stock list with filtering and actions
 * Shows all tracked and untracked items in a sortable table
 */
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

  /**
   * Handle edit action - show dialog or info toast
   */
  const handleEdit = (row: InventoryItemWithDetails) => {
    if (isUntrackedItem(row)) {
      toast.info(
        "This item is not tracked yet. Click 'Add Stock' button to start tracking."
      );
      return;
    }
    setEditDialogItem(row);
  };

  /**
   * Handle view transactions action
   */
  const handleViewTransactions = (row: InventoryItemWithDetails) => {
    if (isUntrackedItem(row)) {
      toast.info("No transactions available for untracked items.");
      return;
    }
    setTransactionsDialogItem(row);
  };

  // Table column definitions
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
      key: "updatedAt",
      label: "Last Updated",
      render: (value) => (
        <span className="text-muted-foreground text-xs">
          {formatDate(value, "short")}
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
                    handleViewTransactions(row);
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>

          {/* Type filters */}
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

          <span>|</span>

          {/* Status filters */}
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

      {/* Table */}
      <SortableTable
        data={filteredItems}
        columns={columns}
        emptyMessage="No inventory items found"
      />

      {/* Dialogs */}
      {editDialogItem && (
        <InventoryItemDialog
          item={editDialogItem}
          open={!!editDialogItem}
          onOpenChange={(open) => !open && setEditDialogItem(null)}
        />
      )}

      {transactionsDialogItem && (
        <ItemTransactionDialog
          item={transactionsDialogItem}
          open={!!transactionsDialogItem}
          onOpenChange={(open) => !open && setTransactionsDialogItem(null)}
        />
      )}
    </Card>
  );
}

export default InventoryStockList;
