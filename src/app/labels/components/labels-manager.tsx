"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { List } from "lucide-react";

import type { Supplier, SupplierLabel } from "@/lib/types";
import { SUPPLIERS } from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";
import { SupplierLabelsTable } from "./supplier-labels-table";
import { SupplierLabelsDialog } from "./supplier-labels-dialog";
import { LabelsPriceComparison } from "./labels-price-comparison";
import { LabelsAnalytics } from "./labels-analytics";
import { LabelsDrawer } from "./labels-drawer";
import {
  useSupplierLabelsWithDetails,
  type SupplierLabelWithDetails,
} from "@/hooks/use-supplier-labels-with-details";
import { MetricCard } from "@/components/ui/metric-card";
import { Package, BarChart3, TrendingUp } from "lucide-react";

export function LabelsManager() {
  const {
    data: suppliers,
    updateItem: updateSupplier,
    addItem: addSupplier,
  } = useDexieTable(db.suppliers, SUPPLIERS);
  const {
    data: supplierLabels,
    updateItem: updateSupplierLabel,
    addItem: addSupplierLabel,
    deleteItem: deleteSupplierLabel,
  } = useDexieTable(db.supplierLabels, []);

  const [showAddSupplierLabel, setShowAddSupplierLabel] = useState(false);
  const [editingSupplierLabel, setEditingSupplierLabel] =
    useState<SupplierLabelWithDetails | null>(null);
  const [showLabelsDrawer, setShowLabelsDrawer] = useState(false);

  // Enriched data hooks
  const enrichedSupplierLabels = useSupplierLabelsWithDetails();

  const totalLabels = enrichedSupplierLabels.length;
  const avgPrice =
    enrichedSupplierLabels.reduce((sum, sl) => sum + sl.unitPrice, 0) /
    (enrichedSupplierLabels.length || 1);
  const highestPrice =
    enrichedSupplierLabels.length > 0
      ? Math.max(...enrichedSupplierLabels.map((sl) => sl.unitPrice))
      : 0;
  const avgLeadTime =
    enrichedSupplierLabels.reduce((sum, sl) => sum + sl.leadTime, 0) /
    (enrichedSupplierLabels.length || 1);

  const handleSaveSupplierLabel = async (item: SupplierLabel) => {
    try {
      if (supplierLabels.some((sl) => sl.id === item.id)) {
        await updateSupplierLabel(item);
      } else {
        await addSupplierLabel(item);
      }
      toast.success("Supplier label saved successfully");
    } catch (error) {
      console.error("Error saving supplier label:", error);
      toast.error("Failed to save supplier label");
    }
  };

  const handleDeleteSupplierLabel = async (id: string) => {
    try {
      await deleteSupplierLabel(id);
      toast.success("Supplier label deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier label:", error);
      toast.error("Failed to delete supplier label");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Labels Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage stickers, labels, and tags from suppliers
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowLabelsDrawer(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <List className="h-4 w-4 mr-2" />
            <span className="truncate">View All Labels</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="supplier-labels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supplier-labels">Supplier Labels</TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="supplier-labels" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Labels"
              value={totalLabels}
              icon={Package}
              iconClassName="text-primary"
              trend={{
                value: "+12%",
                isPositive: true,
                label: "from last month",
              }}
            />

            <MetricCard
              title="Avg Price"
              value={`₹${avgPrice.toFixed(2)}`}
              icon={BarChart3}
              iconClassName="text-primary"
              trend={{
                value: "+5.2%",
                isPositive: true,
                label: "from last month",
              }}
            />

            <MetricCard
              title="Highest Price"
              value={`₹${highestPrice.toFixed(2)}`}
              icon={TrendingUp}
              iconClassName="text-primary"
              description="per piece"
            />

            <MetricCard
              title="Avg Lead Time"
              value={`${avgLeadTime.toFixed(0)} days`}
              icon={BarChart3}
              iconClassName="text-primary"
              description="average across all labels"
            />
          </div>
          <SupplierLabelsTable
            supplierLabels={enrichedSupplierLabels}
            onEditLabel={setEditingSupplierLabel}
            onDeleteLabel={handleDeleteSupplierLabel}
            onAddSupplierLabel={() => setShowAddSupplierLabel(true)}
          />
        </TabsContent>

        <TabsContent value="price-comparison" className="space-y-6">
          <LabelsPriceComparison />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <LabelsAnalytics />
        </TabsContent>
      </Tabs>

      {/* Supplier Label Dialog */}
      <SupplierLabelsDialog
        isOpen={showAddSupplierLabel || !!editingSupplierLabel}
        onClose={() => {
          setShowAddSupplierLabel(false);
          setEditingSupplierLabel(null);
        }}
        onSave={handleSaveSupplierLabel}
        suppliers={suppliers}
        labels={[]}
        initialLabel={editingSupplierLabel}
      />

      {/* Labels Management Drawer */}
      <LabelsDrawer
        open={showLabelsDrawer}
        onOpenChange={setShowLabelsDrawer}
      />
    </div>
  );
}
