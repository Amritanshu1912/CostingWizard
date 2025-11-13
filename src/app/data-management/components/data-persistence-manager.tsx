"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Database,
  Layers,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

const TABLE_CATEGORIES = {
  "Core Data": ["categories", "materials", "suppliers", "supplierMaterials"],
  "Products & Recipes": [
    "recipes",
    "recipeVariants",
    "recipeIngredients",
    "products",
  ],
  Production: ["productionPlans", "purchaseOrders"],
  "Packaging & Labels": [
    "packaging",
    "supplierPackaging",
    "labels",
    "supplierLabels",
  ],
  Inventory: ["inventoryItems", "inventoryTransactions", "transportationCosts"],
};

const formatTableName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

interface TableStat {
  count: number;
  size: number;
  error?: boolean;
}

interface ExportProgress {
  current: number;
  total: number;
}

export default function DataPersistenceManager() {
  const [tableStats, setTableStats] = useState<Record<string, TableStat>>({});
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null
  );
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState("daily");
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    loadDatabaseStats();
    loadBackupSettings();
  }, []);

  const loadDatabaseStats = async () => {
    setIsLoading(true);
    const stats: Record<string, TableStat> = {};

    const tableNames = Object.keys(db).filter(
      (key) => (db as any)[key] && typeof (db as any)[key].count === "function"
    );

    for (const tableName of tableNames) {
      try {
        const count = await (db as any)[tableName].count();
        const items = await (db as any)[tableName].limit(100).toArray();
        const estimatedSize =
          new Blob([JSON.stringify(items)]).size *
          (count / Math.min(count, 100));
        stats[tableName] = { count, size: estimatedSize };
      } catch (error) {
        console.error(`Error loading ${tableName}:`, error);
        stats[tableName] = { count: 0, size: 0, error: true };
      }
    }

    setTableStats(stats);
    setIsLoading(false);
  };

  const loadBackupSettings = () => {
    if (typeof window === "undefined") return;
    const settings = JSON.parse(
      localStorage.getItem("autoBackupSettings") || "{}"
    );
    setAutoBackupEnabled(settings.enabled || false);
    setBackupInterval(settings.interval || "daily");
    setLastBackup(settings.lastBackup || null);
  };

  const saveBackupSettings = (enabled: boolean, interval: string) => {
    const settings = { enabled, interval, lastBackup };
    localStorage.setItem("autoBackupSettings", JSON.stringify(settings));
    setAutoBackupEnabled(enabled);
    setBackupInterval(interval);
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

  const handleExport = async () => {
    if (selectedTables.size === 0) {
      toast.error("Please select at least one table to export");
      return;
    }

    setExportProgress({ current: 0, total: selectedTables.size });

    const exportData = {
      exportDate: new Date().toISOString(),
      version: "2.0",
      database: "CostingWizardDB",
      tables: [] as any[],
    };

    let current = 0;
    for (const tableName of selectedTables) {
      try {
        const data = await (db as any)[tableName].toArray();

        exportData.tables.push({
          name: tableName,
          recordCount: data.length,
          data: data,
        });

        current++;
        setExportProgress({ current, total: selectedTables.size });
      } catch (error) {
        console.error(`Error exporting ${tableName}:`, error);
        toast.error(`Failed to export ${tableName}`);
      }
    }

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

    setExportProgress(null);
    const now = new Date().toISOString();
    setLastBackup(now);
    localStorage.setItem(
      "autoBackupSettings",
      JSON.stringify({
        enabled: autoBackupEnabled,
        interval: backupInterval,
        lastBackup: now,
      })
    );
    toast.success("Export completed successfully!");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (
          !importData.database ||
          !importData.tables ||
          !Array.isArray(importData.tables)
        ) {
          throw new Error("Invalid backup file format");
        }

        let imported = 0;
        for (const tableData of importData.tables) {
          if ((db as any)[tableData.name] && Array.isArray(tableData.data)) {
            await (db as any)[tableData.name].clear();
            await (db as any)[tableData.name].bulkAdd(tableData.data);
            imported++;
          }
        }

        toast.success(`Successfully imported ${imported} tables!`);
        await loadDatabaseStats();
      } catch (error) {
        console.error("Import failed:", error);
        toast.error(
          `Import failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleClearTable = async (tableName: string) => {
    try {
      await (db as any)[tableName].clear();
      toast.success(
        `Table "${formatTableName(tableName)}" cleared successfully!`
      );
      await loadDatabaseStats();
    } catch (error) {
      console.error("Clear failed:", error);
      toast.error("Failed to clear table");
    }
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
          onClick={loadDatabaseStats}
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
                  {lastBackup
                    ? new Date(lastBackup).toLocaleDateString()
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
        {/* Database Tables */}
        <Card className="card-enhanced lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Database Tables</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
            {selectedTables.size > 0 && (
              <CardDescription>
                {selectedTables.size} table
                {selectedTables.size !== 1 ? "s" : ""} selected
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="max-h-[600px] overflow-y-auto space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Loading database information...
                </p>
              </div>
            ) : (
              Object.entries(TABLE_CATEGORIES).map(([category, tables]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      {category}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllInCategory(category)}
                      className="text-xs h-7"
                    >
                      Select All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {tables.map((tableName) => {
                      const stat = tableStats[tableName] || {
                        count: 0,
                        size: 0,
                      };
                      const isSelected = selectedTables.has(tableName);

                      return (
                        <div
                          key={tableName}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-card"
                          }`}
                          onClick={() => toggleTableSelection(tableName)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-input"
                            />
                            <div>
                              <p className="font-medium text-foreground">
                                {formatTableName(tableName)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {stat.count.toLocaleString()} records •{" "}
                                {formatBytes(stat.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  `Clear all data from "${formatTableName(
                                    tableName
                                  )}"?`
                                )
                              ) {
                                handleClearTable(tableName);
                              }
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions Panel */}
        <div className="space-y-6">
          {/* Export Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Export Data</CardTitle>
                  <CardDescription>Download backup file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {exportProgress && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Exporting...</span>
                    <span className="text-foreground font-medium">
                      {exportProgress.current} / {exportProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (exportProgress.current / exportProgress.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleExport}
                disabled={selectedTables.size === 0 || exportProgress !== null}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected Tables
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {selectedTables.size === 0
                  ? "Select tables to export"
                  : `Ready to export ${selectedTables.size} table${
                      selectedTables.size !== 1 ? "s" : ""
                    }`}
              </p>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Import Data</CardTitle>
                  <CardDescription>Restore from backup</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Importing will replace existing data in matching tables
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Backup Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Automatic Backups</CardTitle>
                  <CardDescription>Schedule exports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground">
                  Enable Auto-Backup
                </span>
                <button
                  onClick={() =>
                    saveBackupSettings(!autoBackupEnabled, backupInterval)
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoBackupEnabled ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-background rounded-full transition-transform ${
                      autoBackupEnabled ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {autoBackupEnabled && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Backup Frequency
                  </label>
                  <select
                    value={backupInterval}
                    onChange={(e) =>
                      saveBackupSettings(autoBackupEnabled, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Backups are saved locally to your Downloads folder
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
