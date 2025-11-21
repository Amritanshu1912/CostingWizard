"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, List, Package, BarChart3, TrendingUp } from "lucide-react";
import { nanoid } from "nanoid";
import { MetricCard } from "@/components/ui/metric-card";

import type { SupplierLabel } from "@/lib/types";
import type { LabelFormData } from "./supplier-labels-dialog";
import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";
import { SupplierLabelsTable } from "./supplier-labels-table";
import { EnhancedSupplierLabelsDialog } from "./supplier-labels-dialog";
import { LabelsPriceComparison } from "./labels-price-comparison";
import { LabelsAnalytics } from "./labels-analytics";
import { LabelsDrawer } from "./labels-drawer";
import { useSupplierLabelsWithDetails } from "@/hooks/use-supplier-labels-with-details";
import { normalizeText } from "@/lib/text-utils";

const DEFAULT_LABEL_FORM: LabelFormData = {
  supplierId: "",
  labelName: "",
  labelId: "",
  labelType: undefined,
  printingType: undefined,
  material: undefined,
  shape: undefined,
  size: "",
  labelFor: "",
  bulkPrice: 0,
  quantityForBulkPrice: 1,
  tax: 0,
  moq: 1,
  leadTime: 7,
  availability: "in-stock",
  notes: "",
};

export function LabelsManager() {
  const [showAddSupplierLabel, setShowAddSupplierLabel] = useState(false);
  const [editingSupplierLabel, setEditingSupplierLabel] =
    useState<SupplierLabel | null>(null);
  const [showLabelsDrawer, setShowLabelsDrawer] = useState(false);
  const [formData, setFormData] = useState<LabelFormData>(DEFAULT_LABEL_FORM);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Database hooks
  const { data: suppliers } = useDexieTable(db.suppliers, SUPPLIERS);
  const { data: labels } = useDexieTable(db.labels, []);

  // Enriched data using optimized hook
  const enrichedSupplierLabels = useSupplierLabelsWithDetails();

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

  // Handle add with transaction
  const handleAddSupplierLabel = useCallback(async () => {
    if (!formData.supplierId || !formData.labelName || !formData.bulkPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await db.transaction("rw", [db.labels, db.supplierLabels], async () => {
        const now = new Date().toISOString();

        // Step 1: Check if exact label combination already exists using normalized comparison
        const normalizedName = normalizeText(formData.labelName!);
        const existingLabel = await db.labels
          .filter(
            (l) =>
              normalizeText(l.name) === normalizedName &&
              l.type === formData.labelType &&
              l.printingType === formData.printingType &&
              l.material === formData.material &&
              l.shape === formData.shape &&
              normalizeText(l.size || "") ===
                normalizeText(formData.size || "") &&
              normalizeText(l.labelFor || "") ===
                normalizeText(formData.labelFor || "")
          )
          .first();

        // Step 2: Create new label if no exact match exists
        let labelId: string;
        if (existingLabel) {
          labelId = existingLabel.id;
        } else {
          labelId = nanoid();
          await db.labels.add({
            id: labelId,
            name: formData.labelName!.trim(),
            type: formData.labelType!,
            printingType: formData.printingType!,
            material: formData.material!,
            shape: formData.shape!,
            size: formData.size || undefined,
            labelFor: formData.labelFor || undefined,
            notes: formData.notes || "",
            createdAt: now,
          });
        }

        // Step 3: Calculate unit price
        const bulkQuantity = formData.quantityForBulkPrice || 1;
        const bulkPrice = formData.bulkPrice!;
        const unitPrice = bulkPrice / bulkQuantity;

        // Step 4: Create supplier label
        await db.supplierLabels.add({
          id: nanoid(),
          supplierId: formData.supplierId!,
          labelId: labelId,
          unit: formData.unit || "pieces",
          unitPrice: unitPrice,
          bulkPrice: bulkPrice,
          quantityForBulkPrice: bulkQuantity,
          moq: formData.moq || 1,
          leadTime: formData.leadTime || 7,
          availability: formData.availability || "in-stock",
          tax: formData.tax || 0,
          notes: formData.notes || "",
          createdAt: now,
        });
      });

      setFormData(DEFAULT_LABEL_FORM);
      setShowAddSupplierLabel(false);
      toast.success("Supplier label added successfully");
    } catch (error: any) {
      console.error("Error adding supplier label:", error);
      if (error.message === "DUPLICATE_LABEL") {
        toast.error("This exact label combination already exists");
      } else {
        toast.error("Failed to add supplier label");
      }
    }
  }, [formData]);

  // Handle edit
  const handleEditSupplierLabel = useCallback(
    async (item: SupplierLabel) => {
      const lbl = labels.find((l) => l.id === item.labelId);
      setEditingSupplierLabel(item);
      setFormData({
        ...item,
        labelName: lbl?.name,
        labelType: lbl?.type,
        printingType: lbl?.printingType,
        material: lbl?.material,
        shape: lbl?.shape,
        size: lbl?.size,
        labelFor: lbl?.labelFor,
        tax: item.tax,
      } as LabelFormData);
      setShowAddSupplierLabel(true);
    },
    [labels]
  );

  // Handle update with transaction
  const handleUpdateSupplierLabel = useCallback(async () => {
    if (!editingSupplierLabel) return;

    try {
      await db.transaction("rw", [db.labels, db.supplierLabels], async () => {
        const now = new Date().toISOString();

        // Get original label data
        const originalLabel = labels.find(
          (l) => l.id === editingSupplierLabel.labelId
        );

        // Check if any label properties changed using normalized comparison
        const labelChanged =
          !originalLabel ||
          normalizeText(originalLabel.name) !==
            normalizeText(formData.labelName!) ||
          originalLabel.type !== formData.labelType ||
          originalLabel.printingType !== formData.printingType ||
          originalLabel.material !== formData.material ||
          originalLabel.shape !== formData.shape ||
          normalizeText(originalLabel.size || "") !==
            normalizeText(formData.size || "") ||
          normalizeText(originalLabel.labelFor || "") !==
            normalizeText(formData.labelFor || "");

        let labelId = editingSupplierLabel.labelId;

        if (labelChanged) {
          const normalizedName = normalizeText(formData.labelName!);
          const existingLabel = await db.labels
            .filter(
              (l) =>
                normalizeText(l.name) === normalizedName &&
                l.type === formData.labelType &&
                l.printingType === formData.printingType &&
                l.material === formData.material &&
                l.shape === formData.shape &&
                normalizeText(l.size || "") ===
                  normalizeText(formData.size || "") &&
                normalizeText(l.labelFor || "") ===
                  normalizeText(formData.labelFor || "")
            )
            .first();

          if (existingLabel) {
            // Use existing label (exact duplicate)
            labelId = existingLabel.id;
          } else {
            // Create new label (always, since no exact match exists)
            labelId = nanoid();
            await db.labels.add({
              id: labelId,
              name: formData.labelName!.trim(),
              type: formData.labelType!,
              printingType: formData.printingType!,
              material: formData.material!,
              shape: formData.shape!,
              size: formData.size || undefined,
              labelFor: formData.labelFor || undefined,
              notes: formData.notes || "",
              createdAt: now,
            });
          }
        }

        // Always update supplier label record
        const bulkQuantity = formData.quantityForBulkPrice || 1;
        const bulkPrice = formData.bulkPrice || 0;
        const unitPrice = bulkPrice / bulkQuantity;

        await db.supplierLabels.update(editingSupplierLabel.id, {
          supplierId: formData.supplierId,
          labelId: labelId,
          unit: formData.unit || "pieces",
          unitPrice: unitPrice,
          bulkPrice: bulkPrice,
          quantityForBulkPrice: bulkQuantity,
          moq: formData.moq,
          leadTime: formData.leadTime,
          availability: formData.availability,
          tax: formData.tax || 0,
          notes: formData.notes,
          updatedAt: now,
        });
      });

      setFormData(DEFAULT_LABEL_FORM);
      setEditingSupplierLabel(null);
      setShowAddSupplierLabel(false);
      toast.success("Supplier label updated successfully");
    } catch (error: any) {
      console.error("Error updating supplier label:", error);
      if (error.message === "DUPLICATE_LABEL") {
        toast.error("This exact label combination already exists");
      } else {
        toast.error("Failed to update supplier label");
      }
    }
  }, [editingSupplierLabel, formData, labels]);

  // Handle delete
  const handleDeleteSupplierLabel = useCallback(async (id: string) => {
    try {
      await db.supplierLabels.delete(id);
      toast.success("Supplier label deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier label:", error);
      toast.error("Failed to delete supplier label");
    }
  }, []);

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
      <EnhancedSupplierLabelsDialog
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
