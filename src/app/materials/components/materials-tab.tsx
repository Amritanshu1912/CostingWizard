// materials-tab.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTable } from "@/components/ui/sortable-table";
import { MetricCard } from "@/components/ui/metric-card";
import { Search, Package, TrendingUp, BarChart3 } from "lucide-react";

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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Materials"
          value={totalMaterials}
          icon={Package}
          iconClassName="text-primary"
          trend={{
            value: "+12%",
            isPositive: true,
            label: "from last month",
          }}
        />

        <MetricCard
          title="Avg Price (with tax)"
          value={`₹${avgPrice.toFixed(2)}`}
          icon={BarChart3}
          iconClassName="text-primary"
          trend={{
            value: "+5.2%",
            isPositive: true,
            label: "from last month",
          }}
        />

        <MetricCard
          title="Highest Price"
          value={`₹${highestPrice.toFixed(2)}`}
          icon={TrendingUp}
          iconClassName="text-primary"
          description="per kg"
        />

        <MetricCard
          title="Avg Tax Rate"
          value={`${avgTax.toFixed(1)}%`}
          icon={BarChart3}
          iconClassName="text-primary"
          description="average across all materials"
        />
      </div>

      {/* Materials Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">Materials Inventory</CardTitle>
          <CardDescription>
            Manage your raw materials and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
