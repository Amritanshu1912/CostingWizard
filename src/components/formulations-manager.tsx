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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FlaskConical,
  Calculator,
  TrendingUp,
  Minus,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { CostCalculator } from "@/components/cost-calculator";
import type { ProductIngredient, Product } from "@/lib/types";
import { availableMaterials, sampleProducts } from "@/lib/constants";

export function FormulationsManager() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    product_name: "",
    description: "",
    batch_size_kg: 100,
    selling_price_per_kg: 0,
    composition: [] as ProductIngredient[],
  });

  const [newIngredient, setNewIngredient] = useState({
    material_id: "",
    qty_kg: 0,
  });

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateProductCost = (composition: ProductIngredient[]) => {
    return composition.reduce(
      (total, ingredient) => total + ingredient.total_cost,
      0
    );
  };

  const handleAddIngredient = () => {
    if (!newIngredient.material_id || newIngredient.qty_kg <= 0) {
      toast.error("Please select a material and enter quantity");
      return;
    }

    const material = availableMaterials.find(
      (m) => m.id === newIngredient.material_id
    );
    if (!material) return;

    const ingredient: ProductIngredient = {
      material_id: newIngredient.material_id,
      material_name: material.name,
      qty_kg: newIngredient.qty_kg,
      cost_per_kg: material.price,
      total_cost: newIngredient.qty_kg * material.price,
    };

    setNewProduct({
      ...newProduct,
      composition: [...newProduct.composition, ingredient],
    });

    setNewIngredient({ material_id: "", qty_kg: 0 });
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedComposition = newProduct.composition.filter(
      (_, i) => i !== index
    );
    setNewProduct({ ...newProduct, composition: updatedComposition });
  };

  const handleCreateProduct = () => {
    if (!newProduct.product_name || newProduct.composition.length === 0) {
      toast.error("Please enter product name and add at least one ingredient");
      return;
    }

    const totalCost = calculateProductCost(newProduct.composition);
    const profitMargin =
      newProduct.selling_price_per_kg > 0
        ? ((newProduct.selling_price_per_kg - totalCost) /
            newProduct.selling_price_per_kg) *
          100
        : 0;

    const product: Product = {
      id: Date.now().toString(),
      product_name: newProduct.product_name,
      description: newProduct.description,
      composition: newProduct.composition,
      total_cost_per_kg: totalCost,
      selling_price_per_kg: newProduct.selling_price_per_kg,
      profit_margin: profitMargin,
      batch_size_kg: newProduct.batch_size_kg,
      status: "active",
    };

    setProducts([...products, product]);
    setNewProduct({
      product_name: "",
      description: "",
      batch_size_kg: 100,
      selling_price_per_kg: 0,
      composition: [],
    });
    setIsCreateDialogOpen(false);
    toast.success("Product created successfully");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully");
  };

  const totalProducts = products.length;
  const avgCost =
    products.reduce((sum, p) => sum + p.total_cost_per_kg, 0) / products.length;
  const avgMargin =
    products.reduce((sum, p) => sum + p.profit_margin, 0) / products.length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.selling_price_per_kg * p.batch_size_kg,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Product Formulations
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your product recipes and formulations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Product Formulation
              </DialogTitle>
              <DialogDescription>
                Design your product recipe and calculate costs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name" className="text-foreground">
                    Product Name *
                  </Label>
                  <Input
                    id="product-name"
                    value={newProduct.product_name}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        product_name: e.target.value,
                      })
                    }
                    placeholder="Enter product name"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label htmlFor="batch-size" className="text-foreground">
                    Batch Size (kg)
                  </Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={newProduct.batch_size_kg}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        batch_size_kg: Number(e.target.value),
                      })
                    }
                    placeholder="100"
                    className="focus-enhanced"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description..."
                  className="focus-enhanced"
                />
              </div>

              {/* Add Ingredients */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    Add Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label className="text-foreground">Material</Label>
                      <Select
                        value={newIngredient.material_id}
                        onValueChange={(value: any) =>
                          setNewIngredient({
                            ...newIngredient,
                            material_id: value,
                          })
                        }
                      >
                        <SelectTrigger className="focus-enhanced">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMaterials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name} - ₹{material.price}/kg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label className="text-foreground">Quantity (kg)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={newIngredient.qty_kg}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            qty_kg: Number(e.target.value),
                          })
                        }
                        placeholder="0.000"
                        className="focus-enhanced"
                      />
                    </div>
                    <Button
                      onClick={handleAddIngredient}
                      className="btn-secondary"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Composition Table */}
              {newProduct.composition.length > 0 && (
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Product Composition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table className="table-enhanced">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-foreground font-medium">
                            Material
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Quantity (kg)
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Cost per kg
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Total Cost
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newProduct.composition.map((ingredient, index) => (
                          <TableRow key={index} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-foreground">
                              {ingredient.material_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {ingredient.qty_kg.toFixed(3)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              ₹{ingredient.cost_per_kg.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-foreground font-medium">
                              ₹{ingredient.total_cost.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveIngredient(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Cost Calculation */}
              <Card className="card-enhanced bg-muted/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-foreground">
                        Total Cost per kg
                      </Label>
                      <div className="text-2xl font-bold text-foreground">
                        ₹
                        {calculateProductCost(newProduct.composition).toFixed(
                          2
                        )}
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="selling-price"
                        className="text-foreground"
                      >
                        Selling Price per kg
                      </Label>
                      <Input
                        id="selling-price"
                        type="number"
                        value={newProduct.selling_price_per_kg}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            selling_price_per_kg: Number(e.target.value),
                          })
                        }
                        placeholder="0.00"
                        className="focus-enhanced"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">Profit Margin</Label>
                      <div className="text-2xl font-bold text-accent">
                        {newProduct.selling_price_per_kg > 0
                          ? (
                              ((newProduct.selling_price_per_kg -
                                calculateProductCost(newProduct.composition)) /
                                newProduct.selling_price_per_kg) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateProduct}
                  className="flex-1 btn-secondary"
                >
                  Create Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
                <FlaskConical className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalProducts}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent font-medium">+3</span>
                  <span className="text-muted-foreground">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Cost per kg
                </CardTitle>
                <Calculator className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{avgCost.toFixed(2)}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent font-medium">+2.1%</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Profit Margin
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {avgMargin.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  across all products
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Portfolio Value
                </CardTitle>
                <Calculator className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{totalValue.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  estimated batch value
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Overview */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Product Portfolio
              </CardTitle>
              <CardDescription>
                Overview of your product formulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {product.product_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.composition.length} ingredients • Batch:{" "}
                        {product.batch_size_kg}kg
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          ₹{product.total_cost_per_kg.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          cost per kg
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          ₹{product.selling_price_per_kg.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          selling price
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-accent">
                          {product.profit_margin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          profit margin
                        </div>
                      </div>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "secondary"
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Search */}
          <Card className="card-enhanced">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-enhanced"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Product Formulations
              </CardTitle>
              <CardDescription>
                Manage your product recipes and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground font-medium">
                      Product Name
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Ingredients
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Cost per kg
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Selling Price
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Profit Margin
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Batch Size
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {product.product_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.composition.length} items
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{product.total_cost_per_kg.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{product.selling_price_per_kg.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-accent font-medium">
                        {product.profit_margin.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.batch_size_kg}kg
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary bg-transparent"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Advanced Cost Calculator
              </CardTitle>
              <CardDescription>
                Comprehensive cost calculation and optimization tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CostCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-foreground">
                Formulation Analytics
              </CardTitle>
              <CardDescription>
                Insights and trends for your product formulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts type="formulations" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
