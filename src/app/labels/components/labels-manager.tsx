// src/app/labels/components/labels-manager.tsx
"use client";

import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLabelsMutations } from "@/hooks/label-hooks/use-labels-mutations";
import { useSupplierLabelRows } from "@/hooks/label-hooks/use-labels-queries";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";
import type {
  SupplierLabelRow,
  SupplierLabelFormData,
} from "@/types/label-types";
import { BarChart3, List, Package, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { LabelsAnalytics } from "./labels-analytics";
import { LabelsDrawer } from "./labels-drawer";
import { LabelsPriceComparison } from "./labels-price-comparison";
import { SupplierLabelsDialog } from "./supplier-labels-dialog";
import { SupplierLabelsTable } from "./supplier-labels-table";

const DEFAULT_LABEL_FORM: SupplierLabelFormData = {
  labelName: "",
  bulkPrice: 0,
  quantityForBulkPrice: 1,
  supplierId: "",
  labelType: "other",
  printingType: "bw",
  material: "other",
  shape: "custom",
  unit: "",
  tax: 0,
  moq: 0,
  leadTime: 0,
  currentStock: 0,
  stockStatus: "in-stock",
};

export function LabelsManager() {
  const [showAddSupplierLabel, setShowAddSupplierLabel] = useState(false);
  const [editingSupplierLabel, setEditingSupplierLabel] =
    useState<SupplierLabelRow | null>(null);
  const [showLabelsDrawer, setShowLabelsDrawer] = useState(false);
  const [formData, setFormData] =
    useState<SupplierLabelFormData>(DEFAULT_LABEL_FORM);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Database hooks - still needed for dialog
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: labels } = useDexieTable(db.labels, []);

  // Enriched data using optimized hook
  const enrichedSupplierLabels = useSupplierLabelRows();

  // Mutation hooks
  const { createSupplierLabel, updateSupplierLabel, deleteSupplierLabel } =
    useLabelsMutations();

  // Calculate metrics
  const totalLabels = enrichedSupplierLabels.length;
  const avgPrice =
    enrichedSupplierLabels.reduce((sum, sl) => sum + sl.unitPrice, 0) /
    (enrichedSupplierLabels.length || 1);
  const highestPrice =
    enrichedSupplierLabels.length > 0
      ? Math.max(...enrichedSupplierLabels.map((sl) => sl.unitPrice))
      : 0;
  const avgTax =
    enrichedSupplierLabels.reduce((sum, sl) => sum + (sl.tax || 0), 0) /
    (enrichedSupplierLabels.length || 1);

  // Handle add using mutation hook
  const handleAddSupplierLabel = useCallback(async () => {
    try {
      await createSupplierLabel(formData as any);

      setFormData(DEFAULT_LABEL_FORM);
      setShowAddSupplierLabel(false);
      toast.success("Supplier label added successfully");
    } catch (error: any) {
      console.error("Error adding supplier label:", error);
      toast.error(error.message || "Failed to add supplier label");
    }
  }, [formData, createSupplierLabel]);

  // Handle edit
  const handleEditSupplierLabel = useCallback(
    async (item: SupplierLabelRow) => {
      setEditingSupplierLabel(item);
      setFormData({
        supplierId: item.supplierId,
        labelId: item.labelId,
        labelName: item.labelName,
        labelType: item.labelType,
        printingType: item.printingType,
        material: item.material,
        shape: item.shape,
        size: item.size,
        labelFor: item.labelFor,
        bulkPrice: item.bulkPrice || 0,
        quantityForBulkPrice: item.quantityForBulkPrice || 1,
        unit: item.unit,
        tax: item.tax,
        moq: item.moq,
        leadTime: item.leadTime,
        transportationCost: 0, // Default value
        currentStock: item.currentStock,
        stockStatus: item.stockStatus,
        notes: "",
      } as any);
      setShowAddSupplierLabel(true);
    },
    []
  );

  // Handle update using mutation hook
  const handleUpdateSupplierLabel = useCallback(async () => {
    if (!editingSupplierLabel) return;

    try {
      await updateSupplierLabel(editingSupplierLabel.id, formData as any);

      setFormData(DEFAULT_LABEL_FORM);
      setEditingSupplierLabel(null);
      setShowAddSupplierLabel(false);
      toast.success("Supplier label updated successfully");
    } catch (error: any) {
      console.error("Error updating supplier label:", error);
      toast.error("Failed to update supplier label");
    }
  }, [editingSupplierLabel, formData, updateSupplierLabel]);

  // Handle delete using mutation hook
  const handleDeleteSupplierLabel = useCallback(
    async (id: string) => {
      try {
        await deleteSupplierLabel(id);
        toast.success("Supplier label deleted successfully");
      } catch (error) {
        console.error("Error deleting supplier label:", error);
        toast.error("Failed to delete supplier label");
      }
    },
    [deleteSupplierLabel]
  );

  // Reset dialog
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowAddSupplierLabel(false);
      setEditingSupplierLabel(null);
      setFormData(DEFAULT_LABEL_FORM);
    }
  }, []);

  // Handle refresh from drawer
  const handleDrawerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
              title="Avg Price (with tax)"
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
              title="Avg Tax Rate"
              value={`${avgTax.toFixed(1)}%`}
              icon={BarChart3}
              iconClassName="text-primary"
              description="average across all labels"
            />
          </div>
          <SupplierLabelsTable
            supplierLabels={enrichedSupplierLabels}
            suppliers={suppliers}
            onEditLabel={handleEditSupplierLabel}
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

      {/* Enhanced Supplier Labels Dialog with refresh trigger */}
      <SupplierLabelsDialog
        key={refreshTrigger}
        open={showAddSupplierLabel}
        onOpenChange={handleDialogClose}
        label={formData}
        setLabel={setFormData}
        onSave={
          editingSupplierLabel
            ? handleUpdateSupplierLabel
            : handleAddSupplierLabel
        }
        suppliers={suppliers}
        labelsList={labels}
        isEditing={!!editingSupplierLabel}
      />

      {/* Labels Management Drawer */}
      <LabelsDrawer
        open={showLabelsDrawer}
        onOpenChange={setShowLabelsDrawer}
        onRefresh={handleDrawerRefresh}
      />
    </div>
  );
}
