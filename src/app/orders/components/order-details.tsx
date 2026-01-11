// src/app/orders/components/order-details.tsx
"use client";

import { useState } from "react";
import {
  Calendar,
  Edit2,
  MoreVertical,
  Package,
  Trash2,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PurchaseOrder } from "@/types/order-types";
import { useOrderOperations } from "@/hooks/order-hooks/use-orders";
import { getOrderStatusConfig } from "@/utils/order-utils";
import { OrderStatusTimeline } from "./order-status-timeline";
import { ReceiveItemsDialog } from "./receive-items-dialog";

interface OrderDetailsProps {
  order: PurchaseOrder | null;
  onEdit: (order: PurchaseOrder) => void;
  onDeleted: () => void;
}

/**
 * Order details component
 * Shows complete order information with timeline and actions
 */
export function OrderDetails({ order, onEdit, onDeleted }: OrderDetailsProps) {
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const { deleteOrder, updateOrderStatus } = useOrderOperations();

  /** Handle delete order */
  const handleDelete = async () => {
    if (!order) return;
    if (!confirm(`Are you sure you want to delete order ${order.orderId}?`))
      return;
    await deleteOrder(order.id);
    onDeleted();
  };

  /** Handle status change */
  const handleStatusChange = async (newStatus: PurchaseOrder["status"]) => {
    if (!order) return;
    await updateOrderStatus(order.id, newStatus);
  };

  // Empty state
  if (!order) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <Package className="h-20 w-20 text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No order selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select an order from the list to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getOrderStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{order.orderId}</CardTitle>
              <Badge variant={statusConfig.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.supplierName} • Created {order.dateCreated}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(order)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {order.status !== "delivered" &&
                  order.status !== "cancelled" && (
                    <DropdownMenuItem
                      onClick={() => setIsReceiveDialogOpen(true)}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Receive Items
                    </DropdownMenuItem>
                  )}
                {order.status === "draft" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("submitted")}
                  >
                    Mark as Submitted
                  </DropdownMenuItem>
                )}
                {order.status !== "cancelled" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("cancelled")}
                  >
                    Cancel Order
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
            <p className="text-lg font-bold">₹{order.totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Items</p>
            <p className="text-lg font-bold">{order.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p className="text-sm">{order.dateCreated}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Expected Delivery
            </p>
            <p className="text-sm">{order.expectedDeliveryDate || "—"}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <OrderStatusTimeline order={order} />

        {/* Items Table */}
        <div>
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs">
                  <th className="p-3 font-medium">Item</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium text-right">Qty</th>
                  <th className="p-3 font-medium text-right">Received</th>
                  <th className="p-3 font-medium text-right">Unit Price</th>
                  <th className="p-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="p-3">{item.itemName}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {item.itemType}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3 text-right">
                      {item.quantityReceived} {item.unit}
                    </td>
                    <td className="p-3 text-right">
                      ₹{(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      ₹{(item.totalCost || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 font-semibold">
                <tr>
                  <td colSpan={5} className="p-3 text-right">
                    Total
                  </td>
                  <td className="p-3 text-right">
                    ₹{order.totalCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded">
              {order.notes}
            </p>
          </div>
        )}

        {/* Linked Batch */}
        {order.batchId && (
          <div>
            <h3 className="font-semibold mb-2">Linked Batch</h3>
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded border border-primary/20">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Created from batch: {order.batchId}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Receive Items Dialog */}
      <ReceiveItemsDialog
        isOpen={isReceiveDialogOpen}
        onClose={() => setIsReceiveDialogOpen(false)}
        order={order}
      />
    </Card>
  );
}
