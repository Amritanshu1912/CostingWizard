"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import type { SavedData } from "./data-management-types";
import { formatBytes } from "./data-management-utils";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedData: SavedData[];
  onExportAll: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  savedData,
  onExportAll,
}: ExportDialogProps) {
  const totalSize = savedData.reduce((sum, item) => {
    const bytes = new Blob([JSON.stringify(item.data)]).size;
    return sum + bytes;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onClick={onExportAll}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              Download Backup
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
