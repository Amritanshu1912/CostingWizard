"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Download,
  Upload,
  Trash2,
  Clock,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface SavedData {
  key: string;
  name: string;
  timestamp: number;
  size: string;
  type:
    | "formulation"
    | "production-plan"
    | "supplier"
    | "cost-analysis"
    | "settings";
  data: any;
}

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

  const getDataName = (key: string): string => {
    const nameMap: Record<string, string> = {
      formulations: "Product Formulations",
      "production-plans": "Production Plans",
      suppliers: "Supplier Data",
      "cost-analysis": "Cost Analysis",
      "user-settings": "User Settings",
      "material-inventory": "Material Inventory",
      "procurement-orders": "Purchase Orders",
    };
    return (
      nameMap[key] ||
      key.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getDataType = (key: string): SavedData["type"] => {
    if (key.includes("formulation")) return "formulation";
    if (key.includes("production")) return "production-plan";
    if (key.includes("supplier")) return "supplier";
    if (key.includes("cost")) return "cost-analysis";
    return "settings";
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getTypeColor = (
    type: SavedData["type"]
  ): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<
      SavedData["type"],
      "default" | "destructive" | "outline" | "secondary"
    > = {
      formulation: "default",
      "production-plan": "secondary",
      supplier: "outline",
      "cost-analysis": "destructive",
      settings: "outline",
    };
    return colors[type] || "outline";
  };

  const getTypeIcon = (type: SavedData["type"]) => {
    const icons = {
      formulation: FileText,
      "production-plan": Database,
      supplier: Database,
      "cost-analysis": Database,
      settings: Database,
    };
    return icons[type] || Database;
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

  const totalSize = savedData.reduce((sum, item) => {
    const bytes = new Blob([JSON.stringify(item.data)]).size;
    return sum + bytes;
  }, 0);

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

          <Dialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export All Data</DialogTitle>
                <DialogDescription>
                  Download a complete backup of all your saved data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Complete Backup</p>
                      <p className="text-sm text-muted-foreground">
                        {savedData.length} items • {formatBytes(totalSize)}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleExportAll}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    Download Backup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsExportDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved Items
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {savedData.length}
            </div>
            <div className="text-xs text-muted-foreground">data entries</div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Used
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatBytes(totalSize)}
            </div>
            <div className="text-xs text-muted-foreground">local storage</div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Autosave Status
            </CardTitle>
            {autosaveEnabled ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {autosaveEnabled ? "Active" : "Disabled"}
            </div>
            <div className="text-xs text-muted-foreground">
              {autosaveEnabled ? "saves every 2 seconds" : "manual save only"}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Backup
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {savedData.length > 0 ? "Today" : "Never"}
            </div>
            <div className="text-xs text-muted-foreground">
              {savedData.length > 0
                ? new Date(
                    Math.max(...savedData.map((d) => d.timestamp))
                  ).toLocaleDateString()
                : "no backups yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Data Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Saved Data
          </CardTitle>
          <CardDescription>
            Manage your locally saved data and create backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Saved Data
              </h3>
              <p className="text-muted-foreground">
                Start using the application to automatically save your work
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {savedData.length} items saved locally
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllData}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedData.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <TableRow key={item.key}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeColor(item.type)}>
                            {item.type.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.size}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportData(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteData(item.key)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Autosave Settings */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-secondary" />
            Autosave Settings
          </CardTitle>
          <CardDescription>
            Configure automatic data saving preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <h4 className="font-medium text-foreground">
                    Enable Autosave
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work every 2 seconds
                  </p>
                </div>
                <Button
                  variant={autosaveEnabled ? "default" : "outline"}
                  onClick={toggleAutosave}
                  className={
                    autosaveEnabled ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  {autosaveEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="p-4 rounded-lg border bg-muted/20">
                <h4 className="font-medium text-foreground mb-2">
                  What gets saved automatically:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Product formulations and recipes</li>
                  <li>• Production plans and schedules</li>
                  <li>• Supplier information and contacts</li>
                  <li>• Cost analysis and calculations</li>
                  <li>• User preferences and settings</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">
                      Data Security
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      All data is stored locally in your browser. Nothing is
                      sent to external servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">
                      Backup Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Export your data regularly to prevent loss when clearing
                      browser data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
