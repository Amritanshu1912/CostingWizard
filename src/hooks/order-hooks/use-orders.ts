import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/order-types";

/**
 * Fetches all purchase orders
 * @returns Array of purchase orders
 */
export function usePurchaseOrders(): PurchaseOrder[] | undefined {
  return useLiveQuery(() => db.purchaseOrders.toArray(), []);
}

/**
 * Fetches a single purchase order by ID
 * @param orderId - Order ID to fetch
 * @returns Purchase order or null
 */
export function usePurchaseOrder(
  orderId: string | null
): PurchaseOrder | null | undefined {
  return useLiveQuery(async (): Promise<PurchaseOrder | null> => {
    if (!orderId) return null;
    const order = await db.purchaseOrders.get(orderId);
    return order || null;
  }, [orderId]);
}

/**
 * Fetches orders by supplier
 * @param supplierId - Supplier ID to filter by
 * @returns Array of purchase orders for the supplier
 */
export function useOrdersBySupplier(
  supplierId: string | null
): PurchaseOrder[] | undefined {
  return useLiveQuery(async () => {
    if (!supplierId) return [];
    return await db.purchaseOrders
      .where("supplierId")
      .equals(supplierId)
      .toArray();
  }, [supplierId]);
}

/**
 * Fetches orders by batch
 * @param batchId - Batch ID to filter by
 * @returns Array of purchase orders linked to the batch
 */
export function useOrdersByBatch(
  batchId: string | null
): PurchaseOrder[] | undefined {
  return useLiveQuery(async () => {
    if (!batchId) return [];
    return await db.purchaseOrders.where("batchId").equals(batchId).toArray();
  }, [batchId]);
}

/**
 * Fetches orders by status
 * @param status - Order status to filter by
 * @returns Array of purchase orders with the given status
 */
export function useOrdersByStatus(
  status: PurchaseOrder["status"] | null
): PurchaseOrder[] | undefined {
  return useLiveQuery(async () => {
    if (!status) return [];
    return await db.purchaseOrders.where("status").equals(status).toArray();
  }, [status]);
}

export function useOrderOperations() {
  const createOrder = async (
    orderData: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">
  ) => {
    const orderId = crypto.randomUUID();

    const newOrder: PurchaseOrder = {
      id: orderId,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.purchaseOrders.add(newOrder);
    return newOrder;
  };

  const updateOrder = async (
    orderId: string,
    orderData: Partial<PurchaseOrder>
  ) => {
    await db.purchaseOrders.update(orderId, {
      ...orderData,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteOrder = async (orderId: string) => {
    await db.purchaseOrders.delete(orderId);
  };

  const updateOrderStatus = async (
    orderId: string,
    status: PurchaseOrder["status"]
  ) => {
    await db.purchaseOrders.update(orderId, {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const receiveItems = async (
    orderId: string,
    receivedItems: Array<{ itemId: string; quantityReceived: number }>
  ) => {
    // Get the current order
    const order = await db.purchaseOrders.get(orderId);
    if (!order) return;

    // Update quantities received for each item
    const updatedItems = order.items.map((item: PurchaseOrderItem) => {
      const receivedItem = receivedItems.find((ri) => ri.itemId === item.id);
      if (receivedItem) {
        return {
          ...item,
          quantityReceived:
            item.quantityReceived + receivedItem.quantityReceived,
        };
      }
      return item;
    });

    // Check if all items are fully received
    const allItemsReceived = updatedItems.every(
      (item: PurchaseOrderItem) => item.quantityReceived >= item.quantity
    );

    // Update order status if fully received
    const newStatus = allItemsReceived ? "delivered" : "partially-delivered";

    await db.purchaseOrders.update(orderId, {
      items: updatedItems,
      status: newStatus,
      actualDeliveryDate: allItemsReceived
        ? new Date().toISOString().split("T")[0]
        : undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  return {
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    receiveItems,
  };
}
