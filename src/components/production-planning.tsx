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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Factory,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import {
  ProductionItem,
  MaterialRequirement,
  ProductionPlan,
} from "@/lib/types";
import { availableProducts, samplePlans } from "@/lib/constants";

export function ProductionPlanning() {
  const [plans, setPlans] = useState<ProductionPlan[]>(samplePlans);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);

  const [newPlan, setNewPlan] = useState({
    plan_name: "",
    description: "",
    start_date: "",
    end_date: "",
    products: [] as ProductionItem[],
  });

  const [newProduct, setNewProduct] = useState({
    product_id: "",
    quantity_kg: 0,
  });

  const filteredPlans = plans.filter((plan) =>
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.product_id || newProduct.quantity_kg <= 0) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const product = availableProducts.find(
      (p) => p.id === newProduct.product_id
    );
    if (!product) return;

    const productionItem: ProductionItem = {
      product_id: newProduct.product_id,
      product_name: product.name,
      quantity_kg: newProduct.quantity_kg,
      cost_per_kg: product.cost_per_kg,
      total_cost: newProduct.quantity_kg * product.cost_per_kg,
      materials_required: [], // Would be calculated based on product recipe
    };

    setNewPlan({
      ...newPlan,
      products: [...newPlan.products, productionItem],
    });

    setNewProduct({ product_id: "", quantity_kg: 0 });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = newPlan.products.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, products: updatedProducts });
  };

  const calculatePlanTotals = (products: ProductionItem[]) => {
    const totalCost = products.reduce((sum, p) => sum + p.total_cost, 0);
    const totalRevenue = products.reduce((sum, p) => {
      const product = availableProducts.find((ap) => ap.id === p.product_id);
      return sum + (product ? p.quantity_kg * product.selling_price : 0);
    }, 0);
    return { totalCost, totalRevenue, totalProfit: totalRevenue - totalCost };
  };

  const handleCreatePlan = () => {
    if (
      !newPlan.plan_name ||
      !newPlan.start_date ||
      !newPlan.end_date ||
      newPlan.products.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and add at least one product"
      );
      return;
    }

    const { totalCost, totalRevenue, totalProfit } = calculatePlanTotals(
      newPlan.products
    );

    const plan: ProductionPlan = {
      id: Date.now().toString(),
      plan_name: newPlan.plan_name,
      description: newPlan.description,
      start_date: newPlan.start_date,
      end_date: newPlan.end_date,
      products: newPlan.products,
      total_cost: totalCost,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      status: "draft",
      progress: 0,
    };

    setPlans([...plans, plan]);
    setNewPlan({
      plan_name: "",
      description: "",
      start_date: "",
      end_date: "",
      products: [],
    });
    setIsCreateDialogOpen(false);
    toast.success("Production plan created successfully");
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id));
    toast.success("Production plan deleted successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "default";
      case "scheduled":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Factory;
      case "scheduled":
        return Clock;
      case "cancelled":
        return AlertCircle;
      default:
        return Calendar;
    }
  };

  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.status === "in-progress").length;
  const totalValue = plans.reduce((sum, p) => sum + p.total_revenue, 0);
  const avgProfit =
    plans.reduce(
      (sum, p) => sum + (p.total_profit / p.total_revenue) * 100,
      0
    ) / plans.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Production Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan and manage your production schedules and material requirements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Production Plan</DialogTitle>
              <DialogDescription>
                Plan your production schedule and calculate material
                requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name *</Label>
                  <Input
                    id="plan-name"
                    value={newPlan.plan_name}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, plan_name: e.target.value })
                    }
                    placeholder="Enter plan name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newPlan.start_date}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newPlan.end_date}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  placeholder="Plan description..."
                />
              </div>

              {/* Add Products */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Add Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Product</Label>
                      <Select
                        value={newProduct.product_id}
                        onValueChange={(value: any) =>
                          setNewProduct({ ...newProduct, product_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ₹{product.cost_per_kg}/kg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label>Quantity (kg)</Label>
                      <Input
                        type="number"
                        value={newProduct.quantity_kg}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            quantity_kg: Number(e.target.value),
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <Button
                      onClick={handleAddProduct}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Products Table */}
              {newPlan.products.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Production Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity (kg)</TableHead>
                          <TableHead>Cost per kg</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newPlan.products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {product.product_name}
                            </TableCell>
                            <TableCell>{product.quantity_kg}</TableCell>
                            <TableCell>
                              ₹{product.cost_per_kg.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ₹{product.total_cost.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveProduct(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Cost Summary */}
              {newPlan.products.length > 0 && (
                <Card className="border-2 bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Total Cost</Label>
                        <div className="text-2xl font-bold text-foreground">
                          ₹
                          {calculatePlanTotals(
                            newPlan.products
                          ).totalCost.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <Label>Expected Revenue</Label>
                        <div className="text-2xl font-bold text-foreground">
                          ₹
                          {calculatePlanTotals(
                            newPlan.products
                          ).totalRevenue.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <Label>Expected Profit</Label>
                        <div className="text-2xl font-bold text-green-600">
                          ₹
                          {calculatePlanTotals(
                            newPlan.products
                          ).totalProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleCreatePlan}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                >
                  Create Plan
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Production Plans</TabsTrigger>
          <TabsTrigger value="materials">Material Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Plans
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalPlans}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+2</span>
                  <span className="text-muted-foreground">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Plans
                </CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {activePlans}
                </div>
                <div className="text-xs text-muted-foreground">
                  currently in production
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{totalValue.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  expected revenue
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Profit Margin
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {avgProfit.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  across all plans
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Plans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Active Production Plans</CardTitle>
              <CardDescription>
                Current production schedules and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans
                  .filter(
                    (p) =>
                      p.status === "in-progress" || p.status === "scheduled"
                  )
                  .map((plan) => {
                    const StatusIcon = getStatusIcon(plan.status);
                    return (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <StatusIcon className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {plan.plan_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {plan.products.length} products •{" "}
                              {plan.start_date} to {plan.end_date}
                            </div>
                            {plan.status === "in-progress" && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{plan.progress}%</span>
                                </div>
                                <Progress
                                  value={plan.progress}
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              ₹{plan.total_cost.toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              total cost
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              ₹{plan.total_profit.toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              expected profit
                            </div>
                          </div>
                          <Badge variant={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          {/* Search */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search production plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Plans Table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Production Plans</CardTitle>
              <CardDescription>
                Manage your production schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Expected Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.plan_name}
                      </TableCell>
                      <TableCell>
                        {plan.start_date} to {plan.end_date}
                      </TableCell>
                      <TableCell>{plan.products.length} items</TableCell>
                      <TableCell>₹{plan.total_cost.toFixed(2)}</TableCell>
                      <TableCell>₹{plan.total_revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">
                        ₹{plan.total_profit.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

        <TabsContent value="materials" className="space-y-6">
          {/* Material Requirements Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Materials Needed
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-xs text-muted-foreground">
                  unique materials
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shortages
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">3</div>
                <div className="text-xs text-muted-foreground">
                  materials short
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Material Cost
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹28,450
                </div>
                <div className="text-xs text-muted-foreground">
                  for all active plans
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Material Requirements by Plan */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                Material Requirements by Production Plan
              </CardTitle>
              <CardDescription>
                Detailed breakdown of material needs for each production plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {plans
                  .filter(
                    (p) =>
                      p.status === "in-progress" || p.status === "scheduled"
                  )
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className="border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {plan.plan_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {plan.start_date} to {plan.end_date} •{" "}
                            {plan.products.length} products
                          </p>
                        </div>
                        <Badge variant={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {plan.products.map((product, productIndex) => (
                          <div
                            key={productIndex}
                            className="bg-card rounded-lg p-3 border"
                          >
                            <div className="font-medium text-sm text-foreground mb-2">
                              {product.product_name} ({product.quantity_kg} kg)
                            </div>
                            <div className="grid gap-2">
                              {product.materials_required.map(
                                (material, materialIndex) => (
                                  <div
                                    key={materialIndex}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          material.shortage > 0
                                            ? "bg-destructive"
                                            : "bg-green-500"
                                        }`}
                                      />
                                      <span className="font-medium">
                                        {material.material_name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                      <span className="text-muted-foreground">
                                        Need: {material.required_qty} kg
                                      </span>
                                      <span className="text-muted-foreground">
                                        Available: {material.available_qty} kg
                                      </span>
                                      {material.shortage > 0 && (
                                        <span className="text-destructive font-medium">
                                          Short: {material.shortage} kg
                                        </span>
                                      )}
                                      <span className="font-medium">
                                        ₹{material.total_cost.toFixed(0)}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Material Shortage Analysis */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Material Shortage Analysis
              </CardTitle>
              <CardDescription>
                Critical materials that need immediate procurement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Shortage</TableHead>
                    <TableHead>Cost per kg</TableHead>
                    <TableHead>Procurement Cost</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans
                    .flatMap((plan) =>
                      plan.products.flatMap(
                        (product) => product.materials_required
                      )
                    )
                    .filter((material) => material.shortage > 0)
                    .map((material, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {material.material_name}
                        </TableCell>
                        <TableCell>{material.required_qty} kg</TableCell>
                        <TableCell>{material.available_qty} kg</TableCell>
                        <TableCell className="text-destructive font-medium">
                          {material.shortage} kg
                        </TableCell>
                        <TableCell>
                          ₹{material.cost_per_kg.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹
                          {(material.shortage * material.cost_per_kg).toFixed(
                            2
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">High</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90"
                          >
                            Order Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Material Inventory Status */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary" />
                Current Material Inventory
              </CardTitle>
              <CardDescription>
                Available stock levels for all materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "NaCl",
                    available: 200,
                    required: 175,
                    unit: "kg",
                    cost: 6,
                  },
                  {
                    name: "Soda Ash",
                    available: 80,
                    required: 110,
                    unit: "kg",
                    cost: 40.95,
                  },
                  {
                    name: "Citric Acid",
                    available: 60,
                    required: 45,
                    unit: "kg",
                    cost: 97.65,
                  },
                  {
                    name: "Caustic Soda",
                    available: 25,
                    required: 15,
                    unit: "kg",
                    cost: 59.85,
                  },
                  {
                    name: "Ammonia",
                    available: 30,
                    required: 20,
                    unit: "kg",
                    cost: 45.0,
                  },
                  {
                    name: "AOS Powder 96%",
                    available: 45,
                    required: 75,
                    unit: "kg",
                    cost: 152,
                  },
                ].map((material, index) => {
                  const utilizationPercent =
                    (material.required / material.available) * 100;
                  const isShort = material.required > material.available;

                  return (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {material.name}
                        </h4>
                        <Badge variant={isShort ? "destructive" : "default"}>
                          {isShort ? "Short" : "Available"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Available:
                          </span>
                          <span className="font-medium">
                            {material.available} {material.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Required:
                          </span>
                          <span className="font-medium">
                            {material.required} {material.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">
                            ₹{material.cost}/{material.unit}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Utilization</span>
                            <span>
                              {Math.min(utilizationPercent, 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(utilizationPercent, 100)}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Material Procurement Recommendations */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Procurement Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions for optimal material procurement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Urgent Procurement
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Order Soda Ash (30 kg) and AOS Powder (30 kg)
                        immediately to avoid production delays
                      </p>
                      <div className="text-xs text-accent font-medium">
                        Estimated cost: ₹5,790 • Lead time: 5-7 days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Bulk Order Opportunity
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Combine orders for Q2 to get 12% volume discount on
                        Citric Acid and Caustic Soda
                      </p>
                      <div className="text-xs text-primary font-medium">
                        Potential savings: ₹3,240
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Inventory Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Current NaCl stock will last 3 months. Consider reducing
                        next order by 25%
                      </p>
                      <div className="text-xs text-secondary font-medium">
                        Storage cost savings: ₹450/month
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Quality Assurance
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Schedule quality testing for incoming Ammonia batch
                        before production start
                      </p>
                      <div className="text-xs text-muted-foreground font-medium">
                        Testing window: 2 days before production
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material Cost Analysis Chart */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Material Cost Breakdown
              </CardTitle>
              <CardDescription>
                Cost distribution across different materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { material: "Citric Acid", cost: 4394, percentage: 35 },
                    { material: "AOS Powder", cost: 4560, percentage: 36 },
                    { material: "CBS-X", cost: 2200, percentage: 18 },
                    { material: "Soda Ash", cost: 1229, percentage: 10 },
                    { material: "Others", cost: 567, percentage: 1 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="material"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="cost"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
