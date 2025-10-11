"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { SavedData } from "./data-management-types";
import { formatBytes } from "./data-management-utils";
import { formatDate } from "@/lib/utils";

interface StatsCardsProps {
  savedData: SavedData[];
  autosaveEnabled: boolean;
}

export function StatsCards({ savedData, autosaveEnabled }: StatsCardsProps) {
  const totalSize = savedData.reduce((sum, item) => {
    const bytes = new Blob([JSON.stringify(item.data)]).size;
    return sum + bytes;
  }, 0);

  return (
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
              ? formatDate(
                  new Date(Math.max(...savedData.map((d) => d.timestamp)))
                )
              : "no backups yet"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
