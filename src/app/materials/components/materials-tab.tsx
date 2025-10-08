// materials-tab.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTable } from "@/components/ui/sortable-table";
import { Search } from "lucide-react";
import { MaterialsOverview } from "./materials-overview";

interface MaterialsTabProps {
  totalMaterials: number;
  avgPrice: number;
  highestPrice: number;
  avgTax: number;
  materials: any[]; // Assuming Material type
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: any[]; // Assuming Category type
  filteredMaterials: any[];
  materialColumns: any;
}

export function MaterialsTab({
  totalMaterials,
  avgPrice,
  highestPrice,
  avgTax,
  materials,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  filteredMaterials,
  materialColumns,
}: MaterialsTabProps) {
  return (
    <div className="space-y-6">
      <MaterialsOverview
        materials={materials}
        totalMaterials={totalMaterials}
        avgPrice={avgPrice}
        highestPrice={highestPrice}
        avgTax={avgTax}
      />

      {/* Filters */}
      <Card className="card-enhanced">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 focus-enhanced"
              />
            </div>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-48 focus-enhanced">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">Materials Inventory</CardTitle>
          <CardDescription>
            Manage your raw materials and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={filteredMaterials}
            columns={materialColumns}
            className="table-enhanced"
            showSerialNumber={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
