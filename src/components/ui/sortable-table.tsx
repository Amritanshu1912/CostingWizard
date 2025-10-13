"use client";

import type React from "react";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface SortableTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any, index: number) => React.ReactNode;
  }[];
  className?: string;
  showSerialNumber?: boolean;
}

export function SortableTable({
  data,
  columns,
  className,
  showSerialNumber = true,
}: SortableTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const getSortableValue = (row: any, key: string) => {
      let value = row[key];
      if (typeof value === "object" && value !== null) {
        // Handle objects like supplier - extract name or default to empty
        value = value.name || "";
      }
      if (typeof value === "string") {
        // Normalize: trim whitespace, remove punctuation, convert to lowercase
        value = value
          .trim()
          .replace(/[^\w\s]/g, "")
          .toLowerCase();
      }
      return value;
    };

    const aValue = getSortableValue(a, sortConfig.key);
    const bValue = getSortableValue(b, sortConfig.key);

    // Handle numeric comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // String comparison using localeCompare for case-insensitive, locale-aware sorting
    const comparison = aValue
      .toString()
      .localeCompare(bValue.toString(), undefined, { sensitivity: "base" });
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {showSerialNumber && (
              <TableHead className="text-foreground font-medium w-12">
                #
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`text-foreground font-medium ${
                  column.sortable !== false
                    ? "cursor-pointer hover:bg-muted/30 select-none"
                    : ""
                }`}
                onClick={() =>
                  column.sortable !== false && handleSort(column.key)
                }
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable !== false && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={row.id || index} className="hover:bg-muted/30">
              {showSerialNumber && (
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {index + 1}
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
