import React from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { Package, TrendingUp, BarChart3 } from "lucide-react";
import type { SupplierMaterial, Category, Supplier } from "@/lib/types";
import { MaterialsTable } from "./MaterialsTable";

interface MaterialsTabProps {
  totalMaterials: number;
  avgPrice: number;
  highestPrice: number;
  avgTax: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  categories: Category[];
  suppliers: Supplier[];
  filteredMaterials: SupplierMaterial[];
  onEditMaterial: (material: SupplierMaterial) => void;
  onDeleteMaterial: (id: string) => void;
}

export function MaterialsTab({
  totalMaterials,
  avgPrice,
  highestPrice,
  avgTax,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSupplier,
  onSupplierChange,
  categories,
  suppliers,
  filteredMaterials,
  onEditMaterial,
  onDeleteMaterial,
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
      <MaterialsTable
        filteredMaterials={filteredMaterials}
        suppliers={suppliers}
        onEditMaterial={onEditMaterial}
        onDeleteMaterial={onDeleteMaterial}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedSupplier={selectedSupplier}
        onSupplierChange={onSupplierChange}
        categories={categories}
      />
    </div>
  );
}
