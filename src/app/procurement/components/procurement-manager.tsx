"use client";

import { useState, useMemo } from "react";
import { db } from "@/lib/db";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { Supplier, PurchaseOrder, SupplierMaterial } from "@/lib/types";
import { ProcurementAnalytics } from "./procurement-analytics";
import { OrdersTab } from "./procurement-orders-tab";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SUMMARY_METRICS,
  MONTHLY_SPEND_DATA,
  MATERIAL_COST_DATA,
  ORDER_STATUS_DATA,
  getSupplierPerformanceData,
} from "./procurement-constants";

export default function ProcurementManager() {
  const [activeTab, setActiveTab] = useState("orders");

  const { data: suppliers } = useDexieTable<Supplier>(db.suppliers);
  const { data: purchaseOrders } = useDexieTable<PurchaseOrder>(
    db.purchaseOrders
  );
  const { data: supplierMaterials } = useDexieTable<SupplierMaterial>(db.supplierMaterials);


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
    
    const avgDeliveryTime = s.length > 0 ?
      s.reduce((sum, supplier) => {
        const materialsForSupplier = sm.filter(
          (m: any) => m.supplierId === supplier.id
        );

        if (materialsForSupplier.length === 0) return sum;

        const avgLead = materialsForSupplier.reduce(
          (leadSum: number, m: any) => leadSum + (m.leadTime || 0),
          0
        ) / materialsForSupplier.length;

        return sum + avgLead;
      }, 0) / s.length : 0;

    const metrics = SUMMARY_METRICS.map((metric) => {
        let value = metric.value;
        if (metric.title === "Total Suppliers") value = totalSuppliers.toString();
        if (metric.title === "Active Orders") value = activeOrders.toString();
        if (metric.title === "Total Spend (Q3)") value = `₹${totalOrderValue.toFixed(0)}`;
        if (metric.title === "Avg Delivery Time") value = `${avgDeliveryTime.toFixed(0)} days`;
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

  return (
    <div className="grid grid-cols-1 gap-4">
      <ProcurementAnalytics
        metrics={metrics || []}
        monthlySpendData={monthlySpendData || []}
        supplierPerformanceData={supplierPerformanceData || []}
        materialCostData={materialCostData || []}
        orderStatusData={orderStatusData || []}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrdersTab orders={purchaseOrders || []} />
        </TabsContent>
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage your suppliers here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for suppliers management UI */}
              <p>Suppliers management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
