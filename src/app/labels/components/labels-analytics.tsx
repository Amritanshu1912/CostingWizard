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
  Tag,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useSupplierLabelsWithDetails } from "@/hooks/use-supplier-labels-with-details";

export function LabelsAnalytics() {
  const supplierLabels = useSupplierLabelsWithDetails();

  // Calculate analytics
  const totalLabels = new Set(supplierLabels.map((sl) => sl.labelId || sl.id))
    .size;
  const totalSuppliers = new Set(supplierLabels.map((sl) => sl.supplierId))
    .size;
  const avgPrice =
    supplierLabels.length > 0
      ? supplierLabels.reduce((sum, sl) => sum + sl.unitPrice, 0) /
        supplierLabels.length
      : 0;
  const avgLeadTime =
    supplierLabels.length > 0
      ? supplierLabels.reduce((sum, sl) => sum + sl.leadTime, 0) /
        supplierLabels.length
      : 0;
  const inStockCount = supplierLabels.filter(
    (sl) => sl.availability === "in-stock"
  ).length;
  const outOfStockCount = supplierLabels.filter(
    (sl) => sl.availability === "out-of-stock"
  ).length;

  // Group by label type
  const typeStats = supplierLabels.reduce((acc, sl) => {
    const type = sl.displayType;
    if (!acc[type]) {
      acc[type] = { count: 0, totalValue: 0 };
    }
    acc[type].count += 1;
    acc[type].totalValue += sl.unitPrice;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  const topTypes = Object.entries(typeStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3);

  // Group by printing type
  const printingStats = supplierLabels.reduce((acc, sl) => {
    const printing = sl.displayPrintingType;
    if (!acc[printing]) {
      acc[printing] = { count: 0, totalValue: 0 };
    }
    acc[printing].count += 1;
    acc[printing].totalValue += sl.unitPrice;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  const topPrintingTypes = Object.entries(printingStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Label Items"
          value={totalLabels}
          icon={Tag}
          iconClassName="text-primary"
          trend={{
            value: "+12.5%",
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
            value: "+3",
            isPositive: true,
            label: "new suppliers",
          }}
        />

        <MetricCard
          title="Avg Unit Price"
          value={`₹${avgPrice.toFixed(2)}`}
          icon={DollarSign}
          iconClassName="text-primary"
          description="per piece/sheet"
        />

        <MetricCard
          title="Avg Lead Time"
          value={`${avgLeadTime.toFixed(0)} days`}
          icon={Clock}
          iconClassName="text-primary"
          description="for delivery"
        />
      </div>

      {/* Stock Status and Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
            <CardDescription>
              Current availability of label items
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
                    supplierLabels.filter((sl) => sl.availability === "limited")
                      .length
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
            <CardTitle>Label Types</CardTitle>
            <CardDescription>Most common label types</CardDescription>
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

      {/* Printing Types */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Printing Types</CardTitle>
          <CardDescription>Distribution by printing technology</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPrintingTypes.map(([printing, stats]) => (
              <div key={printing} className="text-center p-4 border rounded-lg">
                <p className="font-medium text-foreground">{printing}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {stats.count}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg ₹{(stats.totalValue / stats.count).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                <strong>{outOfStockCount}</strong> label items are out of stock
              </p>
              <p className="text-orange-800">
                <strong>
                  {
                    supplierLabels.filter((sl) => sl.availability === "limited")
                      .length
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
