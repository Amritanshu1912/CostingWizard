"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Download, Trash2, FileText } from "lucide-react";
import type { SavedData } from "./data-management-types";
import { DATA_TYPE_COLORS } from "./data-management-constants";
import { getTypeIcon } from "./data-management-utils";

interface SavedDataTableProps {
  savedData: SavedData[];
  onExportData: (item: SavedData) => void;
  onDeleteData: (key: string) => void;
  onClearAllData: () => void;
}

export function SavedDataTable({
  savedData,
  onExportData,
  onDeleteData,
  onClearAllData,
}: SavedDataTableProps) {
  return (
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
                onClick={onClearAllData}
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
                  const TypeIcon =
                    getTypeIcon(item.type) === "FileText" ? FileText : Database;
                  return (
                    <TableRow key={item.key}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={DATA_TYPE_COLORS[item.type]}>
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
                            onClick={() => onExportData(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteData(item.key)}
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
  );
}
