"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import type { Label, Supplier, SupplierLabel } from "@/lib/types";
import { SUPPLIERS } from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";
import { LabelsTable } from "./labels-table";
import { LabelsDialog } from "./labels-dialog";
import { SupplierLabelsTable } from "./supplier-labels-table";
import { SupplierLabelsDialog } from "./supplier-labels-dialog";
import { LabelsPriceComparison } from "./labels-price-comparison";
import { LabelsAnalytics } from "./labels-analytics";
import {
  useSupplierLabelsWithDetails,
  type SupplierLabelWithDetails,
} from "@/hooks/use-supplier-labels-with-details";

export function LabelsManager() {
  const {
    data: suppliers,
    updateItem: updateSupplier,
    addItem: addSupplier,
  } = useDexieTable(db.suppliers, SUPPLIERS);
  const {
    data: labels,
    updateItem: updateLabel,
    addItem: addLabel,
    deleteItem: deleteLabel,
  } = useDexieTable(db.labels, []);
  const {
    data: supplierLabels,
    updateItem: updateSupplierLabel,
    addItem: addSupplierLabel,
    deleteItem: deleteSupplierLabel,
  } = useDexieTable(db.supplierLabels, []);

  const [showAddLabel, setShowAddLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [showAddSupplierLabel, setShowAddSupplierLabel] = useState(false);
  const [editingSupplierLabel, setEditingSupplierLabel] =
    useState<SupplierLabelWithDetails | null>(null);

  // Enriched data hooks
  const enrichedSupplierLabels = useSupplierLabelsWithDetails();

  const handleSaveLabel = async (item: Label) => {
    try {
      if (labels.some((l) => l.id === item.id)) {
        await updateLabel(item);
      } else {
        await addLabel(item);
      }
      toast.success("Label saved successfully");
    } catch (error) {
      console.error("Error saving label:", error);
      toast.error("Failed to save label");
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await deleteLabel(id);
      toast.success("Label deleted successfully");
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
    }
  };

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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setShowAddLabel(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Label</span>
          </Button>
          <Button
            variant="outline"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setShowAddSupplierLabel(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Supplier Label</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="labels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="labels">Label Items</TabsTrigger>
          <TabsTrigger value="supplier-labels">Supplier Labels</TabsTrigger>
          <TabsTrigger value="price-comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="labels" className="space-y-6">
          <LabelsTable
            labels={labels}
            suppliers={suppliers}
            onEditLabel={setEditingLabel}
            onDeleteLabel={handleDeleteLabel}
          />
        </TabsContent>

        <TabsContent value="supplier-labels" className="space-y-6">
          <SupplierLabelsTable
            supplierLabels={enrichedSupplierLabels}
            onEditLabel={setEditingSupplierLabel}
            onDeleteLabel={handleDeleteSupplierLabel}
          />
        </TabsContent>

        <TabsContent value="price-comparison" className="space-y-6">
          <LabelsPriceComparison />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <LabelsAnalytics />
        </TabsContent>
      </Tabs>

      {/* Label Dialog */}
      <LabelsDialog
        isOpen={showAddLabel || !!editingLabel}
        onClose={() => {
          setShowAddLabel(false);
          setEditingLabel(null);
        }}
        onSave={handleSaveLabel}
        initialLabel={editingLabel}
      />

      {/* Supplier Label Dialog */}
      <SupplierLabelsDialog
        isOpen={showAddSupplierLabel || !!editingSupplierLabel}
        onClose={() => {
          setShowAddSupplierLabel(false);
          setEditingSupplierLabel(null);
        }}
        onSave={handleSaveSupplierLabel}
        suppliers={suppliers}
        labels={labels}
        initialLabel={editingSupplierLabel}
      />
    </div>
  );
}
