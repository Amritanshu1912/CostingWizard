"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Upload, RefreshCw } from "lucide-react";
import { db } from "@/lib/db";
import type { SavedData } from "./data-management-types";
import { getDataName, getDataType, formatBytes } from "./data-management-utils";
import { StatsCards } from "./StatsCards";
import { SavedDataTable } from "./SavedDataTable";
import { AutosaveSettings } from "./AutosaveSettings";
import { ExportDialog } from "./ExportDialog";

export function DataPersistenceManager() {
  const [savedData, setSavedData] = useState<SavedData[]>([]);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    if (typeof window === "undefined") return;

    try {
      const data: SavedData[] = [];

      // Get data from IndexedDB tables
      const tables = [
        { name: "categories", table: db.categories },
        { name: "materials", table: db.materials },
        { name: "suppliers", table: db.suppliers },
        { name: "supplierMaterials", table: db.supplierMaterials },
        { name: "products", table: db.products },
        { name: "productionPlans", table: db.productionPlans },
        { name: "purchaseOrders", table: db.purchaseOrders },
        { name: "packaging", table: db.packaging },
        { name: "supplierPackaging", table: db.supplierPackaging },
        { name: "labels", table: db.labels },
        { name: "supplierLabels", table: db.supplierLabels },
        { name: "inventoryItems", table: db.inventoryItems },
        { name: "inventoryTransactions", table: db.inventoryTransactions },
        { name: "transportationCosts", table: db.transportationCosts },
        { name: "recipeVariants", table: db.recipeVariants },
      ];

      for (const { name, table } of tables) {
        try {
          const items = await table.toArray();
          if (items.length > 0) {
            const serialized = JSON.stringify(items);
            const size = new Blob([serialized]).size;
            const latestTimestamp = items.reduce(
              (max, item) =>
                Math.max(
                  max,
                  new Date(item.updatedAt || item.createdAt).getTime()
                ),
              0
            );

            data.push({
              key: name,
              name: getDataName(name),
              timestamp: latestTimestamp,
              size: formatBytes(size),
              type: getDataType(name),
              data: items,
            });
          }
        } catch (error) {
          console.error(`Error loading table ${name}:`, error);
        }
      }

      // Sort by timestamp (newest first)
      data.sort((a, b) => b.timestamp - a.timestamp);
      setSavedData(data);
    } catch (error) {
      console.error("Error loading data from IndexedDB:", error);
      toast.error("Failed to load data");
    }
  };

  const handleExportData = (item: SavedData) => {
    try {
      const exportData = {
        table: item.key,
        name: item.name,
        type: item.type,
        timestamp: item.timestamp,
        data: item.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.key}-${
        new Date(item.timestamp).toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };

  const handleExportAll = async () => {
    try {
      const allData = savedData.map((item) => ({
        table: item.key,
        name: item.name,
        type: item.type,
        timestamp: item.timestamp,
        data: item.data,
      }));

      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        database: "CostingWizardDB",
        data: allData,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `costing-wizard-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("All data exported successfully");
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Export all failed:", error);
      toast.error("Failed to export all data");
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (
          importData.database === "CostingWizardDB" &&
          importData.data &&
          Array.isArray(importData.data)
        ) {
          // Bulk import from backup
          for (const item of importData.data) {
            const tableName = item.table;
            const table = (db as any)[tableName];
            if (table && item.data && Array.isArray(item.data)) {
              await table.clear();
              await table.bulkAdd(item.data);
            }
          }
          toast.success(`Imported ${importData.data.length} tables`);
        } else if (
          importData.table &&
          importData.data &&
          Array.isArray(importData.data)
        ) {
          // Single table import
          const table = (db as any)[importData.table];
          if (table) {
            await table.clear();
            await table.bulkAdd(importData.data);
            toast.success(
              `Imported ${importData.data.length} items to ${importData.table}`
            );
          } else {
            throw new Error(`Unknown table: ${importData.table}`);
          }
        } else {
          throw new Error("Invalid file format");
        }

        await loadSavedData();
        setIsImportDialogOpen(false);
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteData = async (key: string) => {
    try {
      const table = (db as any)[key];
      if (table) {
        await table.clear();
        await loadSavedData();
        toast.success("Table cleared successfully");
      } else {
        throw new Error(`Unknown table: ${key}`);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete data");
    }
  };

  const handleClearAllData = async () => {
    try {
      for (const item of savedData) {
        const table = (db as any)[item.key];
        if (table) {
          await table.clear();
        }
      }
      await loadSavedData();
      toast.success("All data cleared successfully");
    } catch (error) {
      console.error("Clear all failed:", error);
      toast.error("Failed to clear all data");
    }
  };

  const toggleAutosave = () => {
    setAutosaveEnabled(!autosaveEnabled);
    localStorage.setItem("autosave-enabled", (!autosaveEnabled).toString());
    toast.success(`Autosave ${!autosaveEnabled ? "enabled" : "disabled"}`);
  };

  return (
    <div className="space-y-6 animate-wave-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Data Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved data, enable autosave, and backup your work
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={toggleAutosave}
            className={
              autosaveEnabled
                ? "bg-green-50 border-green-200 text-green-700"
                : ""
            }
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                autosaveEnabled ? "text-green-600" : ""
              }`}
            />
            Autosave {autosaveEnabled ? "On" : "Off"}
          </Button>

          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-secondary hover:bg-secondary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Data</DialogTitle>
                <DialogDescription>
                  Import previously exported data files to restore your work
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Select a JSON file to import
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <ExportDialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
            savedData={savedData}
            onExportAll={handleExportAll}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards savedData={savedData} autosaveEnabled={autosaveEnabled} />

      {/* Saved Data Table */}
      <SavedDataTable
        savedData={savedData}
        onExportData={handleExportData}
        onDeleteData={handleDeleteData}
        onClearAllData={handleClearAllData}
      />

      {/* Autosave Settings */}
      <AutosaveSettings
        autosaveEnabled={autosaveEnabled}
        onToggleAutosave={toggleAutosave}
      />
    </div>
  );
}
