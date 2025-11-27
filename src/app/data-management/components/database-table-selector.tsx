// src/app/data-management/components/database-table-selector.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TableStat } from "./data-management-utils";
import {
  TABLE_CATEGORIES,
  formatBytes,
  formatTableName,
} from "./data-management-utils";

interface DatabaseTableSelectorProps {
  tableStats: Record<string, TableStat>;
  selectedTables: Set<string>;
  isLoading: boolean;
  onToggleTable: (tableName: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectCategory: (category: string) => void;
  onClearTable: (tableName: string) => void;
}

export function DatabaseTableSelector({
  tableStats,
  selectedTables,
  isLoading,
  onToggleTable,
  onSelectAll,
  onClearSelection,
  onSelectCategory,
  onClearTable,
}: DatabaseTableSelectorProps) {
  const [clearingTable, setClearingTable] = useState<string | null>(null);

  return (
    <Card className="card-enhanced lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              Select tables to export or manage individual table data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
            <span className="text-muted-foreground">|</span>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
        </div>
        {selectedTables.size > 0 && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              {selectedTables.size} table{selectedTables.size !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
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
                  onClick={() => onSelectCategory(category)}
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
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer group ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                      onClick={() => onToggleTable(tableName)}
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
                          setClearingTable(tableName);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
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

      <AlertDialog
        open={!!clearingTable}
        onOpenChange={() => setClearingTable(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Table Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all data from &quot;
              {clearingTable ? formatTableName(clearingTable) : ""}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clearingTable) {
                  onClearTable(clearingTable);
                  setClearingTable(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
