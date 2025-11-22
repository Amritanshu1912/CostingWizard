// src/app/inventory/components/inventory-stock-list.tsx
"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, Edit } from "lucide-react";
import { SortableTable, ColumnDef } from "@/components/ui/sortable-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { History, Beaker, Box, Tag } from "lucide-react";
import type { InventoryItemWithDetails } from "@/lib/types";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { ItemTransactionsDialog } from "./inventory-item-transactions-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { toast } from "sonner";

interface InventoryStockListProps {
  items: InventoryItemWithDetails[] | undefined;
}

export function InventoryStockList({ items }: InventoryStockListProps) {
  const allSupplierMaterials = useLiveQuery(() =>
    db.supplierMaterials.toArray()
  );
  const allSupplierPackaging = useLiveQuery(() =>
    db.supplierPackaging.toArray()
  );
  const allSupplierLabels = useLiveQuery(() => db.supplierLabels.toArray());
  const materials = useLiveQuery(() => db.materials.toArray());
  const packaging = useLiveQuery(() => db.packaging.toArray());
  const labels = useLiveQuery(() => db.labels.toArray());
  const suppliers = useLiveQuery(() => db.suppliers.toArray());

  // Combine all items with inventory status
  const allItemsWithStatus = useMemo(() => {
    if (
      !allSupplierMaterials ||
      !allSupplierPackaging ||
      !allSupplierLabels ||
      !materials ||
      !packaging ||
      !labels ||
      !suppliers ||
      !items
    ) {
      return [];
    }

    const combinedItems: InventoryItemWithDetails[] = [];

    // Materials
    allSupplierMaterials.forEach((sm) => {
      const existingInventory = items.find(
        (inv) => inv.itemType === "supplierMaterial" && inv.itemId === sm.id
      );

      const material = materials.find((m) => m.id === sm.materialId);
      const supplier = suppliers.find((s) => s.id === sm.supplierId);

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        // Show as "not tracked" item
        combinedItems.push({
          id: `untracked-sm-${sm.id}`,
          itemType: "supplierMaterial",
          itemId: sm.id,
          itemName: material?.name || "Unknown",
          supplierName: supplier?.name || "Unknown",
          supplierId: sm.supplierId,
          currentStock: 0,
          unit: sm.unit,
          minStockLevel: 0,
          status: "out-of-stock",
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          unitPrice: sm.unitPrice,
          tax: sm.tax || 0,
          stockValue: 0,
          stockPercentage: 0,
        });
      }
    });

    // Packaging
    allSupplierPackaging.forEach((sp) => {
      const existingInventory = items.find(
        (inv) => inv.itemType === "supplierPackaging" && inv.itemId === sp.id
      );

      const pkg = packaging.find((p) => p.id === sp.packagingId);
      const supplier = suppliers.find((s) => s.id === sp.supplierId);

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        combinedItems.push({
          id: `untracked-sp-${sp.id}`,
          itemType: "supplierPackaging",
          itemId: sp.id,
          itemName: pkg?.name || "Unknown",
          supplierName: supplier?.name || "Unknown",
          supplierId: sp.supplierId,
          currentStock: 0,
          unit: "pcs",
          minStockLevel: 0,
          status: "out-of-stock",
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          unitPrice: sp.unitPrice,
          tax: sp.tax || 0,
          stockValue: 0,
          stockPercentage: 0,
        });
      }
    });

    // Labels
    allSupplierLabels.forEach((sl) => {
      const existingInventory = items.find(
        (inv) => inv.itemType === "supplierLabel" && inv.itemId === sl.id
      );

      const label = labels.find((l) => l.id === sl.labelId);
      const supplier = suppliers.find((s) => s.id === sl.supplierId);

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        combinedItems.push({
          id: `untracked-sl-${sl.id}`,
          itemType: "supplierLabel",
          itemId: sl.id,
          itemName: label?.name || "Unknown",
          supplierName: supplier?.name || "Unknown",
          supplierId: sl.supplierId,
          currentStock: 0,
          unit: sl.unit || "pcs",
          minStockLevel: 0,
          status: "out-of-stock",
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          unitPrice: sl.unitPrice,
          tax: sl.tax || 0,
          stockValue: 0,
          stockPercentage: 0,
        });
      }
    });

    return combinedItems;
  }, [
    allSupplierMaterials,
    allSupplierPackaging,
    allSupplierLabels,
    materials,
    packaging,
    labels,
    suppliers,
    items,
  ]);

  // ADD state for filters/search:

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<Set<string>>(
    new Set(["supplierMaterial", "supplierPackaging", "supplierLabel"])
  );
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());

  // ADD state for dialogs:
  const [editDialogItem, setEditDialogItem] =
    useState<InventoryItemWithDetails | null>(null);
  const [transactionsDialogItem, setTransactionsDialogItem] =
    useState<InventoryItemWithDetails | null>(null);

  // ADD filtering logic:
  const filteredItems = allItemsWithStatus.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType.size === 0 || filterType.has(item.itemType);
    const matchesStatus =
      filterStatus.size === 0 || filterStatus.has(item.status);
    return matchesSearch && matchesType && matchesStatus;
  });

  // ADD toggle filter function:
  const toggleFilter = (set: Set<string>, value: string) => {
    const newSet = new Set(set);
    if (newSet.has(value)) newSet.delete(value);
    else newSet.add(value);
    return newSet;
  };

  // DEFINE columns for SortableTable:
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
  // For untracked items, clicking Edit should open add dialog instead
  const handleEdit = (row: InventoryItemWithDetails) => {
    if (row.id.startsWith("untracked-")) {
      // This is an untracked item, convert it to "add" mode
      // You'll need to pass this info to the dialog or handle differently
      toast.info(
        "This item is not tracked yet. Click 'Add Stock' button to start tracking."
      );
      return;
    }
    setEditDialogItem(row);
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

  // ADD helper for stock color:
  const getStockColor = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return "bg-destructive";
      case "low-stock":
        return "bg-yellow-500";
      case "overstock":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

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

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                filterType.has("supplierMaterial") ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() =>
                setFilterType(toggleFilter(filterType, "supplierMaterial"))
              }
            >
              <Beaker className="h-3 w-3 mr-1" />
              Materials
            </Badge>
            <Badge
              variant={
                filterType.has("supplierPackaging") ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() =>
                setFilterType(toggleFilter(filterType, "supplierPackaging"))
              }
            >
              <Box className="h-3 w-3 mr-1" />
              Packaging
            </Badge>
            <Badge
              variant={filterType.has("supplierLabel") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setFilterType(toggleFilter(filterType, "supplierLabel"))
              }
            >
              <Tag className="h-3 w-3 mr-1" />
              Labels
            </Badge>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filterStatus.has("low-stock") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setFilterStatus(toggleFilter(filterStatus, "low-stock"))
              }
            >
              Low Stock
            </Badge>
            <Badge
              variant={filterStatus.has("out-of-stock") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setFilterStatus(toggleFilter(filterStatus, "out-of-stock"))
              }
            >
              Out of Stock
            </Badge>
          </div>
        </div>
      </div>

      {/* Table */}
      <SortableTable
        data={filteredItems || []}
        columns={columns}
        emptyMessage="No inventory items found"
      />

      {/* Dialogs */}
      {editDialogItem && (
        <InventoryItemDialog
          item={editDialogItem} // Passing item = EDIT mode
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
