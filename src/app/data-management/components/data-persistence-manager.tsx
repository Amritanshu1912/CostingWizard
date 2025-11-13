"use client";
// data-persistence-manager.tsx (Main Component)

import React, { useState, useEffect } from "react";
import { RefreshCw, Database, Layers, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DatabaseTableSelector } from "./database-table-selector";
import { DataManagementActions } from "./data-management-actions";
import {
  loadDatabaseStats,
  exportTables,
  importBackup,
  clearTable,
} from "./database-operations";
import { formatBytes, TABLE_CATEGORIES } from "./data-management-types";
import type {
  TableStat,
  ExportProgress,
  BackupSettings,
} from "./data-management-types";

export default function DataManagementPages() {
  const [tableStats, setTableStats] = useState<Record<string, TableStat>>({});
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null
  );
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: false,
    interval: "daily",
    lastBackup: null,
  });

  useEffect(() => {
    loadStats();
    loadBackupSettingsFromStorage();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const stats = await loadDatabaseStats();
      setTableStats(stats);
    } catch (error) {
      console.error("Failed to load database stats:", error);
      toast.error("Failed to load database information");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackupSettingsFromStorage = () => {
    if (typeof window === "undefined") return;
    const settings = JSON.parse(
      localStorage.getItem("autoBackupSettings") || "{}"
    );
    setBackupSettings({
      enabled: settings.enabled || false,
      interval: settings.interval || "daily",
      lastBackup: settings.lastBackup || null,
    });
  };

  const saveBackupSettingsToStorage = (settings: BackupSettings) => {
    localStorage.setItem("autoBackupSettings", JSON.stringify(settings));
    setBackupSettings(settings);
  };

  const handleExport = async () => {
    try {
      await exportTables(selectedTables, (current, total) => {
        setExportProgress({ current, total });
      });

      const now = new Date().toISOString();
      const newSettings = { ...backupSettings, lastBackup: now };
      saveBackupSettingsToStorage(newSettings);

      toast.success("Export completed successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExportProgress(null);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importBackup(file);
      toast.success(`Successfully imported ${imported} tables!`);
      await loadStats();
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
    event.target.value = "";
  };

  const handleClearTable = async (tableName: string) => {
    try {
      await clearTable(tableName);
      toast.success(`Table cleared successfully!`);
      await loadStats();
    } catch (error) {
      console.error("Clear failed:", error);
      toast.error("Failed to clear table");
    }
  };

  const toggleTableSelection = (tableName: string) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableName)) {
      newSelected.delete(tableName);
    } else {
      newSelected.add(tableName);
    }
    setSelectedTables(newSelected);
  };

  const selectAllInCategory = (category: string) => {
    const newSelected = new Set(selectedTables);
    TABLE_CATEGORIES[category as keyof typeof TABLE_CATEGORIES].forEach(
      (table) => newSelected.add(table)
    );
    setSelectedTables(newSelected);
  };

  const selectAll = () => {
    const allTables = new Set(Object.keys(tableStats));
    setSelectedTables(allTables);
  };

  const clearSelection = () => {
    setSelectedTables(new Set());
  };

  const totalRecords = Object.values(tableStats).reduce(
    (sum, stat) => sum + (stat.count || 0),
    0
  );
  const totalSize = Object.values(tableStats).reduce(
    (sum, stat) => sum + (stat.size || 0),
    0
  );

  return (
    <div className="space-y-6 animate-wave-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Data Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your database, export backups, and restore data
          </p>
        </div>
        <Button
          onClick={loadStats}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-enhanced">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalRecords.toLocaleString()}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatBytes(totalSize)}
                </p>
              </div>
              <Layers className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tables</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {Object.keys(tableStats).length}
                </p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {backupSettings.lastBackup
                    ? new Date(backupSettings.lastBackup).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DatabaseTableSelector
          tableStats={tableStats}
          selectedTables={selectedTables}
          isLoading={isLoading}
          onToggleTable={toggleTableSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onSelectCategory={selectAllInCategory}
          onClearTable={handleClearTable}
        />

        <DataManagementActions
          selectedTablesCount={selectedTables.size}
          exportProgress={exportProgress}
          backupSettings={backupSettings}
          onExport={handleExport}
          onImport={handleImport}
          onToggleAutoBackup={() =>
            saveBackupSettingsToStorage({
              ...backupSettings,
              enabled: !backupSettings.enabled,
            })
          }
          onChangeBackupInterval={(interval) =>
            saveBackupSettingsToStorage({ ...backupSettings, interval })
          }
        />
      </div>
    </div>
  );
}
