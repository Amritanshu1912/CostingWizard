"use client";
// ============================================
// FILE 4: data-management-actions.tsx
// ============================================

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Download,
  Upload,
  AlertCircle,
  Calendar,
  CheckCircle,
} from "lucide-react";
import type { ExportProgress, BackupSettings } from "./data-management-types";

interface DataManagementActionsProps {
  selectedTablesCount: number;
  exportProgress: ExportProgress | null;
  backupSettings: BackupSettings;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleAutoBackup: () => void;
  onChangeBackupInterval: (interval: string) => void;
}

export function DataManagementActions({
  selectedTablesCount,
  exportProgress,
  backupSettings,
  onExport,
  onImport,
  onToggleAutoBackup,
  onChangeBackupInterval,
}: DataManagementActionsProps) {
  return (
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
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
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
            onClick={onExport}
            disabled={selectedTablesCount === 0 || exportProgress !== null}
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Selected Tables
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {selectedTablesCount === 0
              ? "Select tables to export"
              : `Ready to export ${selectedTablesCount} table${
                  selectedTablesCount !== 1 ? "s" : ""
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
              onChange={onImport}
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
              onClick={onToggleAutoBackup}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                backupSettings.enabled ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-background rounded-full shadow-sm transition-transform ${
                  backupSettings.enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {backupSettings.enabled && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Backup Frequency
              </label>
              <select
                value={backupSettings.interval}
                onChange={(e) => onChangeBackupInterval(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
  );
}
