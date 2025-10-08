"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Search, TrendingUp, Package, Plus } from "lucide-react";
import {
  SUPPLIERS,
  SUPPLIER_MATERIALS,
  PURCHASE_ORDERS,
} from "@/lib/constants";
import type { Supplier, PurchaseOrder } from "@/lib/types";
import {
  ORDER_STATUS_MAP,
  SUMMARY_METRICS,
  SUPPLIER_COLUMNS,
  PURCHASE_ORDER_COLUMNS,
  MONTHLY_SPEND_DATA,
  MATERIAL_COST_DATA,
  ORDER_STATUS_DATA,
  getSupplierPerformanceData,
} from "./procurement-constants";
import { SuppliersTable, OrdersTable } from "./procurement-tables";
import { AddSupplierDialog, OrderDialog } from "./procurement-dialogs";
import { SuppliersTab } from "./procurement-suppliers-tab";
import { OrdersTab } from "./procurement-orders-tab";
import { MoqAnalysisTab } from "./procurement-moq-analysis-tab";
import { AnalyticsTab } from "./procurement-analytics-tab";

export function ProcurementManager() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>(
    "suppliers",
    SUPPLIERS
  );
  const [orders, setOrders] = useLocalStorage<PurchaseOrder[]>(
    "orders",
    PURCHASE_ORDERS
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  const filteredSuppliers = (suppliers || []).filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
    setIsAddSupplierOpen(false);
  };

  const handleSaveOrder = (order: PurchaseOrder) => {
    if (editingOrder) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? order : o))
      );
    } else {
      setOrders((prev) => [...prev, order]);
    }
    setEditingOrder(null);
    setIsCreateOrderOpen(false);
  };

  const totalSuppliers = suppliers.length;
  const activeOrders = (orders || []).filter(
    (o) => o.status === "confirmed" || o.status === "submitted"
  ).length;
  const totalOrderValue = (orders || []).reduce(
    (sum, o) => sum + o.totalCost,
    0
  );
  const avgDeliveryTime =
    (suppliers || []).reduce((sum, supplier) => {
      const materialsForSupplier = (SUPPLIER_MATERIALS || []).filter(
        (m) => m.supplierId === supplier.id
      );

      if (materialsForSupplier.length === 0) return sum; // skip if no materials

      const avgLead =
        materialsForSupplier.reduce((leadSum, m) => leadSum + m.leadTime, 0) /
        materialsForSupplier.length;

      return sum + avgLead;
    }, 0) / (suppliers || []).length;

  const metrics = SUMMARY_METRICS.map((metric, index) => {
    const values = [
      totalSuppliers,
      activeOrders,
      `₹${totalOrderValue.toFixed(0)}`,
      `${avgDeliveryTime.toFixed(0)} days`,
    ];
    return {
      ...metric,
      value: values[index],
    };
  });

  const monthlySpendData = MONTHLY_SPEND_DATA;
  const supplierPerformanceData = getSupplierPerformanceData(suppliers);
  const materialCostData = MATERIAL_COST_DATA;
  const orderStatusData = ORDER_STATUS_DATA;

  // Compute a map of supplierId → number of available materials
  const materialsBySupplier = (SUPPLIER_MATERIALS || []).reduce<
    Record<string, number>
  >((acc, material) => {
    if (material.availability !== "out-of-stock") {
      acc[material.supplierId] = (acc[material.supplierId] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-wave-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Procurement Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage suppliers, compare prices, and handle purchase orders
          </p>
        </div>
        <div className="flex gap-3">
          <AddSupplierDialog
            isOpen={isAddSupplierOpen}
            setIsOpen={setIsAddSupplierOpen}
            onSave={handleAddSupplier}
          />
          <OrderDialog
            isOpen={isCreateOrderOpen}
            setIsOpen={setIsCreateOrderOpen}
            initialOrder={editingOrder}
            onSave={handleSaveOrder}
          />
          <Button
            variant="outline"
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => setIsAddSupplierOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={() => {
              setEditingOrder(null);
              setIsCreateOrderOpen(true);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="moq-analysis">MOQ Analysis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6">
          <SuppliersTab
            suppliers={suppliers}
            filteredSuppliers={filteredSuppliers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            materialsBySupplier={materialsBySupplier}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersTab orders={orders} />
        </TabsContent>

        <TabsContent value="moq-analysis" className="space-y-6">
          <MoqAnalysisTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab
            metrics={metrics}
            monthlySpendData={monthlySpendData}
            supplierPerformanceData={supplierPerformanceData}
            materialCostData={materialCostData}
            orderStatusData={orderStatusData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
