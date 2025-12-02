// components/ui/sortable-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/shared-utils";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface SortableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
  showSerialNumber?: boolean;
  emptyMessage?: string;
}

type SortDirection = "asc" | "desc" | null;

export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  showSerialNumber = false,
  emptyMessage = "No results found.",
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sort data with case-insensitive comparison for strings
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Handle nested properties (e.g., supplier.name)
      if (sortKey.includes(".")) {
        const keys = sortKey.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      // String comparison (case-insensitive)
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue
          .toLowerCase()
          .localeCompare(bValue.toLowerCase());
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Default comparison (convert to string)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  // Get alignment classes
  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className={cn("rounded-md border overflow-hidden px-4", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {showSerialNumber && (
              <TableHead className="w-[60px] font-semibold">#</TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-semibold",
                  column.width && `w-[${column.width}]`,
                  getAlignmentClass(column.align)
                )}
              >
                {column.sortable !== false ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column.key)}
                    className={cn(
                      "h-8 px-0 gap-0 font-semibold hover:bg-transparent hover:text-primary transition-colors",
                      getAlignmentClass(column.align),
                      column.align === "right" && "flex-row-reverse"
                    )}
                  >
                    {column.label}
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  <span className="px-0">{column.label}</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length + (showSerialNumber ? 1 : 0)}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                className="transition-colors hover:bg-muted/50"
              >
                {showSerialNumber && (
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                )}
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <TableCell
                      key={column.key}
                      className={cn(getAlignmentClass(column.align))}
                    >
                      {column.render
                        ? column.render(value, row)
                        : (value ?? "—")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
