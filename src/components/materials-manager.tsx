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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTable } from "@/components/ui/sortable-table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { CategoryManager } from "@/components/category-manager";
import type { Category, RawMaterial } from "@/lib/types";
import {
  sampleRawMaterials as sampleMaterials,
  initialCategories,
} from "@/lib/constants";

export function MaterialsManager() {
  const [materials, setMaterials] = useState<RawMaterial[]>(sampleMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [newMaterial, setNewMaterial] = useState({
    material: "",
    price_per_kg: 0,
    tax: 5,
    supplier_id: "default",
    category: "Other",
    notes: "",
  });

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.material
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddMaterial = () => {
    if (!newMaterial.material || newMaterial.price_per_kg <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const material: RawMaterial = {
      id: Date.now().toString(),
      ...newMaterial,
      price_with_tax_per_kg:
        newMaterial.price_per_kg * (1 + newMaterial.tax / 100),
      status: "active",
    };

    setMaterials([...materials, material]);
    setNewMaterial({
      material: "",
      price_per_kg: 0,
      tax: 5,
      supplier_id: "default",
      category: "Other",
      notes: "",
    });
    setIsAddDialogOpen(false);
    toast.success("Material added successfully");
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setEditingMaterial(material);
  };

  const handleUpdateMaterial = () => {
    if (!editingMaterial) return;

    const updatedMaterials = materials.map((m) =>
      m.id === editingMaterial.id
        ? {
            ...editingMaterial,
            price_with_tax_per_kg:
              editingMaterial.price_per_kg * (1 + editingMaterial.tax / 100),
          }
        : m
    );

    setMaterials(updatedMaterials);
    setEditingMaterial(null);
    toast.success("Material updated successfully");
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    toast.success("Material deleted successfully");
  };

  const totalMaterials = materials.length;
  const avgPrice =
    materials.reduce((sum, m) => sum + m.price_with_tax_per_kg, 0) /
    materials.length;
  const highestPrice = Math.max(
    ...materials.map((m) => m.price_with_tax_per_kg)
  );
  const avgTax =
    materials.reduce((sum, m) => sum + m.tax, 0) / materials.length;

  const materialColumns = [
    {
      key: "material",
      label: "Material",
      render: (value: string) => (
        <span className="font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <span className="text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "price_per_kg",
      label: "Price (₹/kg)",
      render: (value: number) => (
        <span className="text-foreground">₹{value.toFixed(2)}</span>
      ),
    },
    {
      key: "tax",
      label: "Tax (%)",
      render: (value: number) => (
        <span className="text-muted-foreground">{value}%</span>
      ),
    },
    {
      key: "price_with_tax_per_kg",
      label: "Price with Tax",
      render: (value: number) => (
        <span className="text-foreground font-medium">₹{value.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "destructive"}>
          {value === "active" ? "Active" : "Low Stock"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: RawMaterial) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditMaterial(row)}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteMaterial(row.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-secondary w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="truncate">Add Material</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add New Raw Material
                </DialogTitle>
                <DialogDescription>
                  Enter the details for the new raw material
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="material" className="text-foreground">
                    Material Name *
                  </Label>
                  <Input
                    id="material"
                    value={newMaterial.material}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        material: e.target.value,
                      })
                    }
                    placeholder="Enter material name"
                    className="focus-enhanced"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-foreground">
                      Price per kg (₹) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={newMaterial.price_per_kg}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          price_per_kg: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                      className="focus-enhanced"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax" className="text-foreground">
                      Tax Rate (%)
                    </Label>
                    <Input
                      id="tax"
                      type="number"
                      value={newMaterial.tax}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          tax: Number(e.target.value),
                        })
                      }
                      placeholder="5.0"
                      className="focus-enhanced"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category" className="text-foreground">
                    Category
                  </Label>
                  <Select
                    value={newMaterial.category}
                    onValueChange={(value: any) =>
                      setNewMaterial({ ...newMaterial, category: value })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-foreground">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={newMaterial.notes}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    className="focus-enhanced"
                  />
                </div>
                {newMaterial.price_per_kg > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-sm text-foreground">
                      Price with tax: ₹
                      {(
                        newMaterial.price_per_kg *
                        (1 + newMaterial.tax / 100)
                      ).toFixed(2)}{" "}
                      per kg
                    </p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddMaterial}
                    className="flex-1 btn-secondary"
                  >
                    Add Material
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                        {material.material}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {material.category} • Tax: {material.tax}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          ₹{material.price_with_tax_per_kg.toFixed(2)}
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

      {/* Edit Material Dialog */}
      {editingMaterial && (
        <Dialog
          open={!!editingMaterial}
          onOpenChange={() => setEditingMaterial(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Edit Material
              </DialogTitle>
              <DialogDescription>Update the material details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-material" className="text-foreground">
                  Material Name
                </Label>
                <Input
                  id="edit-material"
                  value={editingMaterial.material}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      material: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-foreground">
                    Price per kg (₹)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingMaterial.price_per_kg}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        price_per_kg: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tax" className="text-foreground">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="edit-tax"
                    type="number"
                    value={editingMaterial.tax}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        tax: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-category" className="text-foreground">
                  Category
                </Label>
                <Select
                  value={editingMaterial.category}
                  onValueChange={(value: any) =>
                    setEditingMaterial({ ...editingMaterial, category: value })
                  }
                >
                  <SelectTrigger className="focus-enhanced">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-sm text-foreground">
                  Price with tax: ₹
                  {(
                    editingMaterial.price_per_kg *
                    (1 + editingMaterial.tax / 100)
                  ).toFixed(2)}{" "}
                  per kg
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateMaterial}
                  className="flex-1 btn-secondary"
                >
                  Update Material
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingMaterial(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
