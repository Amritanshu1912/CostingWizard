// src/app/orders/components/orders-manager.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PurchaseOrder } from "@/types/order-types";
import { usePurchaseOrders } from "@/hooks/order-hooks/use-orders";
import { OrdersList } from "./orders-list";
import { OrderDetails } from "./order-details";
import { OrderFormDialog } from "./order-form-dialog";
import { OrdersAnalyticsTab } from "./orders-analytics-tab";

/**
 * Orders manager component
 * Top-level orchestrator with Orders/Analytics tabs
 */
export function OrdersManager() {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  // Fetch all orders
  const orders = usePurchaseOrders();

  // Auto-select first order on initial load
  useEffect(() => {
    if (orders && orders.length > 0 && !selectedOrder && !isCreatingNew) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder, isCreatingNew]);

  // Sync selected order with database updates
  useEffect(() => {
    if (selectedOrder && orders) {
      const updatedOrder = orders.find((o) => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders, selectedOrder]);

  /** Handle new order created */
  const handleOrderCreated = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsCreatingNew(false);
    setIsFormOpen(false);
  };

  /** Handle order deleted */
  const handleOrderDeleted = () => {
    if (orders && orders.length > 0) {
      setSelectedOrder(orders[0]);
    } else {
      setSelectedOrder(null);
    }
  };

  /** Handle create new order button */
  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  /** Handle edit order */
  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  // Loading state
  if (!orders) {
    return <LoadingState />;
  }

  // Empty state - no orders exist
  if (orders.length === 0) {
    return <EmptyState onCreateOrder={handleCreateOrder} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Purchase Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage procurement orders across suppliers
          </p>
        </div>
        <Button onClick={handleCreateOrder}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Orders List */}
            <div className="lg:col-span-4 xl:col-span-3">
              <OrdersList
                orders={orders}
                selectedOrderId={selectedOrder?.id}
                onSelectOrder={setSelectedOrder}
                onCreateOrder={handleCreateOrder}
              />
            </div>

            {/* Right: Order Details */}
            <div className="lg:col-span-8 xl:col-span-9">
              <OrderDetails
                order={selectedOrder}
                onEdit={handleEditOrder}
                onDeleted={handleOrderDeleted}
              />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <OrdersAnalyticsTab orders={orders} />
        </TabsContent>
      </Tabs>

      {/* Order Form Dialog */}
      <OrderFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrder(null);
        }}
        initialOrder={editingOrder}
        onSaved={handleOrderCreated}
      />
    </div>
  );
}

/** Loading skeleton */
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <Skeleton className="h-[600px]" />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    </div>
  );
}

/** Empty state when no orders exist */
function EmptyState({ onCreateOrder }: { onCreateOrder: () => void }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
        <p className="text-muted-foreground">
          Track and manage procurement orders across suppliers
        </p>
      </div>

      {/* Empty State Card */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-24 px-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border-2 border-primary/20">
            <Package className="h-12 w-12 text-primary" />
          </div>

          <h3 className="text-2xl font-semibold mb-2">No orders yet</h3>

          <p className="text-muted-foreground text-center max-w-md mb-8">
            Create your first purchase order to start tracking procurement and
            managing supplier deliveries
          </p>

          <Button onClick={onCreateOrder} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Purchase Order
          </Button>

          {/* Quick Tips */}
          <div className="w-full max-w-md space-y-3 pt-8 border-t mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-medium">Quick Tips:</span>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Create orders directly from batch requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Track delivery status and manage partial deliveries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Auto-update inventory when orders are delivered</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Generate order reports and analytics</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
