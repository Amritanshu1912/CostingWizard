// src/app/inventory/components/inventory-manager.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
  Filter,
  Box,
  Tag,
  Beaker,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  useInventoryItemsWithDetails,
  useInventoryStats,
  useInventoryAlerts,
} from "@/hooks/use-inventory";
import { InventoryOverview } from "./inventory-overview";
import { InventoryStockList } from "./inventory-stock-list";
import { InventoryTransactionsList } from "./inventory-transactions-list";
import { InventoryAlertsList } from "./inventory-alerts-list";
import { AddStockDialog } from "./inventory-add-stock-dialog";
import { BulkAdjustDialog } from "./inventory-bulk-adjust-dialog";

export function InventoryManager() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<Set<string>>(
    new Set(["supplierMaterial", "supplierPackaging", "supplierLabel"])
  );
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());

  const items = useInventoryItemsWithDetails();
  const stats = useInventoryStats();
  const alerts = useInventoryAlerts();

  // Filter items
  const filteredItems = items?.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType.size === 0 || filterType.has(item.itemType);
    const matchesStatus =
      filterStatus.size === 0 || filterStatus.has(item.status);

    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedItem = items?.find((i) => i.id === selectedItemId);

  const toggleFilter = (set: Set<string>, value: string) => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    return newSet;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-6">
      {/* LEFT SIDEBAR - 30% */}
      <div className="w-[30%] flex flex-col gap-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex-1 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
          <Button
            onClick={() => setShowBulkDialog(true)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Package className="h-4 w-4" />
            Bulk Adjust
          </Button>
        </div>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-sm">
                Alerts ({alerts.length})
              </span>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="text-xs p-2 rounded bg-card border border-border/50"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {alert.severity === "critical" && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                      {alert.severity === "warning" && (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      {alert.severity === "info" && (
                        <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      )}
                      <span className="font-medium">{alert.alertType}</span>
                    </div>
                    <p className="text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {alerts.length > 5 && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 p-0 h-auto"
                onClick={() => setActiveTab("alerts")}
              >
                View all {alerts.length} alerts
              </Button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" />
            FILTERS
          </div>

          {/* Type Filters */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Item Type
            </div>
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
                variant={
                  filterType.has("supplierLabel") ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() =>
                  setFilterType(toggleFilter(filterType, "supplierLabel"))
                }
              >
                <Tag className="h-3 w-3 mr-1" />
                Labels
              </Badge>
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Stock Status
            </div>
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
                variant={
                  filterStatus.has("out-of-stock") ? "default" : "outline"
                }
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

        {/* Items List */}
        <div className="flex-1 overflow-hidden">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Items ({filteredItems?.length || 0})
          </div>
          <ScrollArea className="h-full">
            <div className="space-y-2 pr-4">
              {filteredItems?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedItemId === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.itemName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.supplierName}
                      </div>
                    </div>
                    {item.itemType === "supplierMaterial" && (
                      <Beaker className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    )}
                    {item.itemType === "supplierPackaging" && (
                      <Box className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    )}
                    {item.itemType === "supplierLabel" && (
                      <Tag className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    )}
                  </div>

                  <div className="text-xs mb-2">
                    <span className="font-medium">
                      {item.currentStock} {item.unit}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {item.minStockLevel} {item.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
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

                  {/* Status Badge */}
                  <Badge
                    variant={
                      item.status === "out-of-stock"
                        ? "destructive"
                        : item.status === "low-stock"
                        ? "secondary"
                        : "default"
                    }
                    className="text-xs"
                  >
                    {item.status === "out-of-stock" && "⚫ Out"}
                    {item.status === "low-stock" && "🔴 Low"}
                    {item.status === "in-stock" && "🟢 In Stock"}
                    {item.status === "overstock" && "🔵 Over"}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* RIGHT PANEL - 70% */}
      <div className="flex-1 border border-border/50 rounded-lg bg-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b border-border/50 px-6 pt-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stock">Stock List</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="alerts">
                Alerts
                {alerts && alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {alerts.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 h-[calc(100%-5rem)] overflow-auto">
            <TabsContent value="overview" className="mt-0">
              <InventoryOverview stats={stats} items={items} />
            </TabsContent>

            <TabsContent value="stock" className="mt-0">
              <InventoryStockList
                items={filteredItems}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
              />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <InventoryTransactionsList itemId={selectedItemId || undefined} />
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              <InventoryAlertsList />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddStockDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <BulkAdjustDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
      />
    </div>
  );
}
