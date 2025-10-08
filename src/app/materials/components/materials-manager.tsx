// materials-manager.tsx

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTable } from "@/components/ui/sortable-table";
import { toast } from "sonner";
import { Search, Plus, Package, TrendingUp, BarChart3 } from "lucide-react";

import { AnalyticsCharts } from "@/components/analytics-charts";
import { CategoryManager } from "@/components/category-manager";
import { MaterialDialog } from "./MaterialDialog"; // NEW IMPORT

import type { Category, Material } from "@/lib/types";
import { MATERIALS, CATEGORIES } from "@/lib/constants";
import { MATERIAL_COLUMNS } from "./material-column";

export function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  // State to control the single unified dialog
  // If null, the dialog is closed. If a Material object, the dialog is in Edit mode.
  // We use a separate boolean for the Add button trigger for cleaner UX.
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveMaterial = (material: Material) => {
    if (materials.some((m) => m.id === material.id)) {
      // Logic for EDIT mode
      setMaterials(materials.map((m) => (m.id === material.id ? material : m)));
      toast.success("Material updated successfully");
    } else {
      // Logic for ADD mode
      setMaterials([...materials, material]);
      toast.success("Material added successfully");
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    toast.success("Material deleted successfully");
  };

  // Quick Stats Calculations (using new camelCase fields)
  const totalMaterials = materials.length;
  const avgPrice =
    materials.reduce((sum, m) => sum + (m.priceWithTax || 0), 0) /
    (materials.length || 1); // Avoid division by zero
  const highestPrice = Math.max(...materials.map((m) => m.priceWithTax || 0));
  const avgTax =
    materials.reduce((sum, m) => sum + (m.tax || 0), 0) /
    (materials.length || 1);

  // Action Handlers for Table
  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
  };

  const handleCloseDialog = () => {
    setIsAddMode(false);
    setEditingMaterial(null);
  };

  // Material Columns are now imported
  const materialColumns = MATERIAL_COLUMNS({
    onEdit: handleEdit,
    onDelete: handleDeleteMaterial,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Raw Materials Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your raw materials inventory and pricing
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <CategoryManager
            categories={categories}
            onCategoriesChange={setCategories}
          />
          <Button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setIsAddMode(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Add Material</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Materials
                </CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalMaterials}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent font-medium">+12%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Price (with tax)
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{avgPrice.toFixed(2)}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent font-medium">+5.2%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Highest Price
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{highestPrice.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">per kg</div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Tax Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {avgTax.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  average across all materials
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Materials */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Materials</CardTitle>
              <CardDescription>
                Latest materials added to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materials.slice(0, 5).map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {material.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {material.category} • Tax: {material.tax}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          ₹{(material.priceWithTax || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per kg
                        </div>
                      </div>
                      <Badge
                        variant={
                          material.status === "active"
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {material.status === "active" ? "Active" : "Low Stock"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          {/* Filters */}
          <Card className="card-enhanced">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus-enhanced"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
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
              <CardTitle className="text-foreground">
                Materials Inventory
              </CardTitle>
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Materials Analytics</CardTitle>
              <CardDescription>
                Insights and trends for your raw materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts type="materials" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unified Material Dialog */}
      <MaterialDialog
        isOpen={isAddMode || !!editingMaterial}
        onClose={handleCloseDialog}
        onSave={handleSaveMaterial}
        categories={categories}
        initialMaterial={editingMaterial}
      />
    </div>
  );
}
