"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import type { Packaging, Supplier, SupplierPackaging } from "@/lib/types";
import { SUPPLIERS } from "@/lib/constants";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";
import { PackagingTable } from "./PackagingTable";
import { PackagingDialog } from "./PackagingDialog";

export function PackagingManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const {
    data: suppliers,
    updateItem: updateSupplier,
    addItem: addSupplier,
  } = useDexieTable(db.suppliers, SUPPLIERS);
  const {
    data: packaging,
    updateItem: updatePackaging,
    addItem: addPackaging,
    deleteItem: deletePackaging,
  } = useDexieTable(db.packaging, []);
  const {
    data: supplierPackaging,
    updateItem: updateSupplierPackaging,
    addItem: addSupplierPackaging,
    deleteItem: deleteSupplierPackaging,
  } = useDexieTable(db.supplierPackaging, []);

  const [showAddPackaging, setShowAddPackaging] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<Packaging | null>(
    null
  );
  const [newPackaging, setNewPackaging] = useState<Partial<Packaging>>({
    name: "",
    type: "bottle",
    size: "",
    unit: "pieces",
    availability: "in-stock",
  });

  const filteredPackaging = packaging.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSavePackaging = async (item: Packaging) => {
    try {
      if (packaging.some((p) => p.id === item.id)) {
        await updatePackaging(item);
      } else {
        await addPackaging(item);
      }
    } catch (error) {
      console.error("Error saving packaging:", error);
      toast.error("Failed to save packaging");
    }
  };

  const handleDeletePackaging = async (id: string) => {
    try {
      await deletePackaging(id);
    } catch (error) {
      console.error("Error deleting packaging:", error);
      toast.error("Failed to delete packaging");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Packaging Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage bottles, containers, and packaging from suppliers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setShowAddPackaging(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Packaging</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="packaging" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packaging">Packaging Items</TabsTrigger>
          <TabsTrigger value="supplier-packaging">
            Supplier Packaging
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="packaging" className="space-y-6">
          <PackagingTable
            filteredPackaging={filteredPackaging}
            suppliers={suppliers}
            onEditPackaging={setEditingPackaging}
            onDeletePackaging={handleDeletePackaging}
          />
        </TabsContent>

        <TabsContent value="supplier-packaging" className="space-y-6">
          {/* Supplier packaging table will go here */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Supplier packaging table component to be implemented
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics will go here */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Packaging analytics to be implemented
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Packaging Dialog */}
      <PackagingDialog
        isOpen={showAddPackaging || !!editingPackaging}
        onClose={() => {
          setShowAddPackaging(false);
          setEditingPackaging(null);
        }}
        onSave={handleSavePackaging}
        suppliers={suppliers}
        initialPackaging={editingPackaging}
      />
    </div>
  );
}
