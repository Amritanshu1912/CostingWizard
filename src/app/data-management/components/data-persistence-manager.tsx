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

  const loadSavedData = () => {
    if (typeof window === "undefined") return;

    const data: SavedData[] = [];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.endsWith("_timestamp")) return;

      try {
        const item = localStorage.getItem(key);
        const timestamp = localStorage.getItem(`${key}_timestamp`);

        if (item && timestamp) {
          const parsedData = JSON.parse(item);
          const size = new Blob([item]).size;

          data.push({
            key,
            name: getDataName(key),
            timestamp: Number.parseInt(timestamp),
            size: formatBytes(size),
            type: getDataType(key),
            data: parsedData,
          });
        }
      } catch (error) {
        console.error(`Error loading data for key ${key}:`, error);
      }
    });

    // Sort by timestamp (newest first)
    data.sort((a, b) => b.timestamp - a.timestamp);
    setSavedData(data);
  };

  const handleExportData = (item: SavedData) => {
    try {
      const exportData = {
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
      a.download = `${item.name.toLowerCase().replace(/\s+/g, "-")}-${
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

  const handleExportAll = () => {
    try {
      const allData = savedData.map((item) => ({
        key: item.key,
        name: item.name,
        type: item.type,
        timestamp: item.timestamp,
        data: item.data,
      }));

      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
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

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (importData.data && Array.isArray(importData.data)) {
          // Bulk import
          importData.data.forEach((item: any) => {
            localStorage.setItem(item.key, JSON.stringify(item.data));
            localStorage.setItem(
              `${item.key}_timestamp`,
              item.timestamp.toString()
            );
          });
          toast.success(`Imported ${importData.data.length} data items`);
        } else if (importData.type && importData.data) {
          // Single item import
          const key = `imported-${importData.type}-${Date.now()}`;
          localStorage.setItem(key, JSON.stringify(importData.data));
          localStorage.setItem(`${key}_timestamp`, Date.now().toString());
          toast.success("Data imported successfully");
        } else {
          throw new Error("Invalid file format");
        }

        loadSavedData();
        setIsImportDialogOpen(false);
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteData = (key: string) => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      loadSavedData();
      toast.success("Data deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete data");
    }
  };

  const handleClearAllData = () => {
    try {
      savedData.forEach((item) => {
        localStorage.removeItem(item.key);
        localStorage.removeItem(`${item.key}_timestamp`);
      });
      loadSavedData();
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
