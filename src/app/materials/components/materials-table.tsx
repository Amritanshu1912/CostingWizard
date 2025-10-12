"use client";

import { useState, useMemo } from "react";
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
import { Search, Filter, Edit, Trash2 } from "lucide-react";
import type { SupplierMaterial, Supplier } from "@/lib/types";
import type { SupplierMaterialWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { MATERIAL_CATEGORIES } from "./materials-config";

interface MaterialsTableProps {
  materials: SupplierMaterialWithDetails[];
  suppliers: Supplier[];
  onEdit: (material: SupplierMaterial) => void;
  onDelete: (id: string) => void;
}

export function MaterialsTable({
  materials,
  suppliers,
  onEdit,
  onDelete,
}: MaterialsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");

  // Filter materials using enriched data
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        material.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplier?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        material.displayCategory === selectedCategory;
      const matchesSupplier =
        selectedSupplier === "all" || material.supplierId === selectedSupplier;
      return matchesSearch && matchesCategory && matchesSupplier;
    });
  }, [materials, searchTerm, selectedCategory, selectedSupplier]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSupplier("all");
  };

  // Table columns using enriched data
  const columns = useMemo(
    () => [
      {
        key: "displayName",
        label: "Material Name",
        render: (value: string) => (
          <span className="font-medium text-foreground">{value}</span>
        ),
      },
      {
        key: "displayCategory",
        label: "Category",
        render: (value: string) => (
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        ),
      },
      {
        key: "supplier",
        label: "Supplier",
        render: (_: any, row: SupplierMaterialWithDetails) => (
          <span className="text-muted-foreground">
            {row.supplier?.name || "Unknown"}
          </span>
        ),
      },
      {
        key: "unitPrice",
        label: "Price",
        render: (value: number, row: SupplierMaterialWithDetails) => (
          <div className="text-foreground">
            <div className="font-medium">₹{value.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              per {row.displayUnit}
            </div>
          </div>
        ),
      },
      {
        key: "tax",
        label: "Tax",
        render: (value: number, row: SupplierMaterialWithDetails) => (
          <div className="text-muted-foreground font-normal">
            <div>{value}%</div>
          </div>
        ),
      },
      {
        key: "priceWithTax",
        label: "Price after Tax",
        render: (value: number, row: SupplierMaterialWithDetails) => {
          return (
            <div className="text-foreground">
              <div className="font-medium">₹{row.priceWithTax.toFixed(2)}</div>
            </div>
          );
        },
      },
      {
        key: "moq",
        label: "MOQ",
        render: (value: number, row: SupplierMaterialWithDetails) => (
          <span className="text-muted-foreground">
            {value} {row.displayUnit}
          </span>
        ),
      },
      {
        key: "leadTime",
        label: "Lead Time",
        render: (value: number) => (
          <span className="text-muted-foreground">{value} days</span>
        ),
      },
      {
        key: "availability",
        label: "Availability",
        render: (value: string) => (
          <Badge
            variant={
              value === "in-stock"
                ? "default"
                : value === "limited"
                ? "secondary"
                : "destructive"
            }
          >
            {value === "in-stock"
              ? "In Stock"
              : value === "limited"
              ? "Limited"
              : "Out of Stock"}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: SupplierMaterialWithDetails) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [suppliers, onEdit, onDelete]
  );

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Materials Inventory</CardTitle>
        <CardDescription>
          Manage your raw materials and supplier pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-enhanced"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {MATERIAL_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
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

        {/* Table */}
        <SortableTable
          data={filteredMaterials}
          columns={columns}
          className="table-enhanced"
          showSerialNumber={true}
        />
      </CardContent>
    </Card>
  );
}
