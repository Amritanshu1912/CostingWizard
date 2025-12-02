/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { Supplier, PurchaseOrder } from "@/types/shared-types";
import { ProcurementAnalytics } from "./procurement-analytics";
import { OrdersTab } from "./procurement-orders-tab";
import { OrderDialog } from "./procurement-orders-dialogs";
import {
  SUMMARY_METRICS,
  MONTHLY_SPEND_DATA,
  MATERIAL_COST_DATA,
  ORDER_STATUS_DATA,
  getSupplierPerformanceData,
} from "./procurement-constants";
import { useSupplierMaterialRows } from "@/hooks/material-hooks/use-materials-queries";

// Get enriched data with all joins already done

export default function ProcurementManager() {
  const [activeTab, setActiveTab] = useState("orders");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  const { data: suppliers } = useDexieTable<Supplier>(db.suppliers);
  const { data: purchaseOrders } = useDexieTable<PurchaseOrder>(
    db.purchaseOrders
  );
  const supplierMaterials = useSupplierMaterialRows();

  const {
    metrics,
    monthlySpendData,
    supplierPerformanceData,
    materialCostData,
    orderStatusData,
  } = useMemo(() => {
    const s = suppliers || [];
    const p = purchaseOrders || [];
    const sm = supplierMaterials || [];

    const totalSuppliers = s.length;
    const activeOrders = p.filter(
      (o) => o.status === "confirmed" || o.status === "submitted"
    ).length;
    const totalOrderValue = p.reduce((sum, o) => sum + o.totalCost, 0);

    const avgDeliveryTime =
      s.length > 0
        ? s.reduce((sum, supplier) => {
            const materialsForSupplier = sm.filter(
              (m: any) => m.supplierId === supplier.id
            );

            if (materialsForSupplier.length === 0) return sum;

            const avgLead =
              materialsForSupplier.reduce(
                (leadSum: number, m: any) => leadSum + (m.leadTime || 0),
                0
              ) / materialsForSupplier.length;

            return sum + avgLead;
          }, 0) / s.length
        : 0;

    const metrics = SUMMARY_METRICS.map((metric) => {
      let value = metric.value;
      if (metric.title === "Total Suppliers") value = totalSuppliers.toString();
      if (metric.title === "Active Orders") value = activeOrders.toString();
      if (metric.title === "Total Spend (Q3)")
        value = `₹${totalOrderValue.toFixed(0)}`;
      if (metric.title === "Avg Delivery Time")
        value = `${avgDeliveryTime.toFixed(0)} days`;
      return { ...metric, value };
    });

    const supplierPerformanceData = getSupplierPerformanceData(s);

    return {
      metrics,
      monthlySpendData: MONTHLY_SPEND_DATA,
      supplierPerformanceData,
      materialCostData: MATERIAL_COST_DATA,
      orderStatusData: ORDER_STATUS_DATA,
    };
  }, [suppliers, purchaseOrders, supplierMaterials]);

  const handleCreateOrder = (order: PurchaseOrder) => {
    // TODO: Implement create order logic with Dexie
    console.log("Creating order:", order);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleSaveOrder = (order: PurchaseOrder) => {
    // TODO: Implement save order logic with Dexie
    console.log("Saving order:", order);
    setIsOrderDialogOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Procurement Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage purchase orders and supplier relationships.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setIsOrderDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Create Order</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrdersTab
            orders={purchaseOrders || []}
            onEditOrder={handleEditOrder}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <ProcurementAnalytics
            metrics={metrics || []}
            monthlySpendData={monthlySpendData || []}
            supplierPerformanceData={supplierPerformanceData || []}
            materialCostData={materialCostData || []}
            orderStatusData={orderStatusData || []}
          />
        </TabsContent>
      </Tabs>

      <OrderDialog
        isOpen={isOrderDialogOpen}
        setIsOpen={setIsOrderDialogOpen}
        initialOrder={editingOrder}
        onSave={handleSaveOrder}
      />
    </div>
  );
}
