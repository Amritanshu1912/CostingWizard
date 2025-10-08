// RecipeTableSection.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortableTable } from "@/components/ui/sortable-table";
import { Search } from "lucide-react";

type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any, index: number) => React.ReactNode;
};

interface RecipeTableSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredProducts: any[];
  columns: Column[];
}

export function RecipeTableSection({
  searchTerm,
  onSearchChange,
  filteredProducts,
  columns,
}: RecipeTableSectionProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="card-enhanced">
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search recipes by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 focus-enhanced"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipes Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">
            Product Recipes Inventory
          </CardTitle>
          <CardDescription>
            List of all product recipes and their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={filteredProducts}
            columns={columns}
            className="table-enhanced"
            showSerialNumber={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
