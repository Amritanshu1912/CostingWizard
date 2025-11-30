/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types";
import { ORDER_STATUS_MAP } from "./procurement-constants";
import { OrdersTable } from "./procurement-tables";

interface OrdersTabProps {
  orders: PurchaseOrder[];
  onEditOrder?: (order: PurchaseOrder) => void;
}

export function OrdersTab({ orders, onEditOrder }: OrdersTabProps) {
  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
          <CardDescription>Latest procurement activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status];
              const StatusIcon = statusInfo?.icon || CheckCircle;
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <StatusIcon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {order.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.supplierName} • {order.items.length} items
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Ordered: {order.dateCreated} • Expected:{" "}
                        {order.deliveryDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        ₹{order.totalCost.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        total value
                      </div>
                    </div>
                    <Badge variant={statusInfo?.variant || "default"}>
                      <StatusIcon className="mr-1 h-4 w-4" />
                      {statusInfo?.label || order.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            Track and manage your purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} onEditOrder={onEditOrder} />
        </CardContent>
      </Card>
    </div>
  );
}
