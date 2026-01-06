// src/app/orders/components/orders-list.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus, PurchaseOrder } from "@/types/order-types";
import { getOrderStatusConfig } from "@/utils/order-utils";
import { cn } from "@/utils/shared-utils";
import { Calendar, Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface OrdersListProps {
  orders: PurchaseOrder[];
  selectedOrderId?: string;
  onSelectOrder: (order: PurchaseOrder) => void;
  onCreateOrder: () => void;
}

/**
 * Orders list component
 * Shows searchable, filterable list of orders
 */
export function OrdersList({
  orders,
  selectedOrderId,
  onSelectOrder,
  onCreateOrder,
}: OrdersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  // Get unique suppliers
  const suppliers = useMemo(() => {
    const uniqueSuppliers = new Set(orders.map((o) => o.supplierName));
    return Array.from(uniqueSuppliers).sort();
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesSupplier =
        supplierFilter === "all" || order.supplierName === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [orders, searchQuery, statusFilter, supplierFilter]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        {/* Header with count and create button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-lg">Purchase Orders</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
          <Button onClick={onCreateOrder} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="pl-9 h-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as OrderStatus | "all")
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="partially-delivered">Partial</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="h-9 text-xs flex-1">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(statusFilter !== "all" || supplierFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setSupplierFilter("all");
              }}
              className="h-9 px-2"
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="space-y-2 p-3 h-full overflow-y-auto">
          {filteredOrders.map((order) => {
            const config = getOrderStatusConfig(order.status);
            const Icon = config.icon;
            const isSelected = selectedOrderId === order.id;

            return (
              <div
                key={order.id}
                className={cn(
                  "group relative p-4 rounded-lg cursor-pointer transition-all hover:shadow-md",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary shadow-sm"
                    : "border border-border hover:bg-accent/50"
                )}
                onClick={() => onSelectOrder(order)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted group-hover:bg-muted/80"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-sm truncate">
                          {order.orderId}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.supplierName}
                        </p>
                      </div>
                      <Badge
                        variant={config.variant}
                        className="text-xs flex-shrink-0"
                      >
                        {config.label}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {order.dateCreated}
                      </span>
                    </div>

                    {/* Cost and items */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ₹{order.totalCost.toFixed(0)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {order.items.length} items
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* No results */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 px-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No orders match your filters
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSupplierFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
