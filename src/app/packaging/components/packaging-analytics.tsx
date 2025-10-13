"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  BarChart3,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useSupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";

export function PackagingAnalytics() {
  const supplierPackaging = useSupplierPackagingWithDetails();

  // Calculate analytics
  const totalPackaging = new Set(
    supplierPackaging.map((sp) => sp.packagingId || sp.id)
  ).size;
  const totalSuppliers = new Set(supplierPackaging.map((sp) => sp.supplierId))
    .size;
  const avgPrice =
    supplierPackaging.length > 0
      ? supplierPackaging.reduce((sum, sp) => sum + sp.unitPrice, 0) /
        supplierPackaging.length
      : 0;
  const avgLeadTime =
    supplierPackaging.length > 0
      ? supplierPackaging.reduce((sum, sp) => sum + sp.leadTime, 0) /
        supplierPackaging.length
      : 0;
  const inStockCount = supplierPackaging.filter(
    (sp) => sp.availability === "in-stock"
  ).length;
  const outOfStockCount = supplierPackaging.filter(
    (sp) => sp.availability === "out-of-stock"
  ).length;

  // Group by packaging type
  const typeStats = supplierPackaging.reduce((acc, sp) => {
    const type = sp.displayType;
    if (!acc[type]) {
      acc[type] = { count: 0, totalValue: 0 };
    }
    acc[type].count += 1;
    acc[type].totalValue += sp.unitPrice;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  const topTypes = Object.entries(typeStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Packaging Items"
          value={totalPackaging}
          icon={Package}
          iconClassName="text-primary"
          trend={{
            value: "+8.2%",
            isPositive: true,
            label: "from last month",
          }}
        />

        <MetricCard
          title="Active Suppliers"
          value={totalSuppliers}
          icon={BarChart3}
          iconClassName="text-primary"
          trend={{
            value: "+2",
            isPositive: true,
            label: "new suppliers",
          }}
        />

        <MetricCard
          title="Avg Unit Price"
          value={`₹${avgPrice.toFixed(2)}`}
          icon={DollarSign}
          iconClassName="text-primary"
          description="per piece"
        />

        <MetricCard
          title="Avg Lead Time"
          value={`${avgLeadTime.toFixed(0)} days`}
          icon={Clock}
          iconClassName="text-primary"
          description="for delivery"
        />
      </div>

      {/* Stock Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
            <CardDescription>
              Current availability of packaging items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">In Stock</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {inStockCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Limited</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {
                    supplierPackaging.filter(
                      (sp) => sp.availability === "limited"
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {outOfStockCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Packaging Types</CardTitle>
            <CardDescription>Most common packaging types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTypes.map(([type, stats]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{type}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.count} items • Avg ₹
                      {(stats.totalValue / stats.count).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {stats.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {outOfStockCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="text-orange-700">
              Items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-orange-800">
                <strong>{outOfStockCount}</strong> packaging items are out of
                stock
              </p>
              <p className="text-orange-800">
                <strong>
                  {
                    supplierPackaging.filter(
                      (sp) => sp.availability === "limited"
                    ).length
                  }
                </strong>{" "}
                items have limited availability
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
