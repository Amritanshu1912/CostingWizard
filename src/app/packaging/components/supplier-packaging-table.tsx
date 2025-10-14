"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Search, Filter } from "lucide-react";
import { Edit, Trash2 } from "lucide-react";
import type { SupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import type { Supplier } from "@/lib/types";

interface SupplierPackagingTableProps {
  supplierPackaging: SupplierPackagingWithDetails[];
  suppliers: Supplier[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (supplier: string) => void;
  onEditPackaging: (packaging: SupplierPackagingWithDetails) => void;
  onDeletePackaging: (id: string) => void;
}

export function SupplierPackagingTable({
  supplierPackaging,
  suppliers,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedSupplier,
  setSelectedSupplier,
  onEditPackaging,
  onDeletePackaging,
}: SupplierPackagingTableProps) {
  // Get unique packaging types from the data
  const packagingTypes = Array.from(
    new Set(supplierPackaging.map((sp) => sp.displayType))
  );

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedSupplier("all");
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Supplier Packaging</CardTitle>
        <CardDescription>
          {supplierPackaging.length} supplier packaging relationships from{" "}
          {new Set(supplierPackaging.map((sp) => sp.supplierId)).size} suppliers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packaging or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-enhanced"
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {packagingTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <SortableTable
          data={supplierPackaging}
          columns={[
            {
              key: "displayName",
              label: "Packaging Name",
              sortable: true,
              render: (value: string) => (
                <span className="font-medium text-foreground">{value}</span>
              ),
            },
            {
              key: "displayType",
              label: "Type",
              sortable: true,
              render: (value: string) => (
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              ),
            },
            {
              key: "supplier",
              label: "Supplier",
              sortable: true,
              render: (value: any, row: SupplierPackagingWithDetails) => (
                <span className="text-foreground">
                  {row.supplier?.name || "N/A"}
                </span>
              ),
            },
            {
              key: "unitPrice",
              label: "Unit Price",
              sortable: true,
              render: (value: number) => (
                <span className="font-medium text-green-600">
                  ₹{value.toFixed(2)}
                </span>
              ),
            },
            {
              key: "moq",
              label: "MOQ",
              sortable: true,
              render: (value: number) => (
                <span className="text-muted-foreground">{value}</span>
              ),
            },
            {
              key: "leadTime",
              label: "Lead Time",
              sortable: true,
              render: (value: number) => (
                <span className="text-muted-foreground">{value} days</span>
              ),
            },
            {
              key: "availability",
              label: "Availability",
              sortable: true,
              render: (value: string) => (
                <Badge
                  variant={
                    value === "in-stock"
                      ? "default"
                      : value === "limited"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {value.replace("-", " ")}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              sortable: false,
              render: (value: any, row: SupplierPackagingWithDetails) => (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => onEditPackaging(row)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
                    onClick={() => onDeletePackaging(row.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ),
            },
          ]}
          className="table-enhanced"
          showSerialNumber={true}
        />
      </CardContent>
    </Card>
  );
}
