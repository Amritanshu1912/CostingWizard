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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Search,
  TrendingUp,
  Package,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Calendar,
  DollarSign,
  Truck,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { sampleSuppliers, sampleOrders } from "@/lib/constants";
import type { Supplier, PurchaseOrder } from "@/lib/types";

export function ProcurementManager() {
  const [suppliers] = useState<Supplier[]>(sampleSuppliers);
  const [orders] = useState<PurchaseOrder[]>(sampleOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in-stock":
        return "default";
      case "limited":
        return "secondary";
      case "out-of-stock":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "confirmed":
        return "default";
      case "sent":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return CheckCircle;
      case "confirmed":
        return CheckCircle;
      case "sent":
        return Clock;
      case "cancelled":
        return AlertTriangle;
      default:
        return Package;
    }
  };

  const totalSuppliers = suppliers.length;
  const activeOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "sent"
  ).length;
  const totalOrderValue = orders.reduce((sum, o) => sum + o.total_cost, 0);
  const avgDeliveryTime =
    suppliers.reduce((sum, s) => {
      const avgLead =
        s.materials.reduce((leadSum, m) => leadSum + m.lead_time_days, 0) /
        s.materials.length;
      return sum + avgLead;
    }, 0) / suppliers.length;

  const monthlySpendData = [
    { month: "Jan", spend: 45000, orders: 12, suppliers: 3 },
    { month: "Feb", spend: 52000, orders: 15, suppliers: 4 },
    { month: "Mar", spend: 48000, orders: 13, suppliers: 3 },
    { month: "Apr", spend: 61000, orders: 18, suppliers: 5 },
    { month: "May", spend: 58000, orders: 16, suppliers: 4 },
    { month: "Jun", spend: 67000, orders: 20, suppliers: 5 },
  ];

  const supplierPerformanceData = suppliers.map((supplier) => ({
    name: supplier.name.split(" ")[0],
    onTime: supplier.performance.onTimeDelivery,
    quality: supplier.performance.qualityScore,
    price: supplier.performance.priceCompetitiveness,
    rating: supplier.rating * 20,
  }));

  const materialCostData = [
    { material: "Acid Blue", cost: 1650, moq: 25, suppliers: 2 },
    { material: "Citric Acid", cost: 95, moq: 50, suppliers: 2 },
    { material: "AOS Powder", cost: 152, moq: 30, suppliers: 1 },
    { material: "CBS-X", cost: 2200, moq: 10, suppliers: 1 },
    { material: "Caustic Soda", cost: 58, moq: 100, suppliers: 1 },
  ];

  const orderStatusData = [
    { name: "Delivered", value: 45, color: "#22c55e" },
    { name: "Confirmed", value: 30, color: "#3b82f6" },
    { name: "Sent", value: 20, color: "#f59e0b" },
    { name: "Cancelled", value: 5, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 animate-wave-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Procurement Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage suppliers, compare prices, and handle purchase orders
          </p>
        </div>
        <div className="flex gap-3">
          {/* Add Supplier Dialog */}
          <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-secondary hover:bg-secondary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter supplier details and material information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name">Supplier Name</Label>
                  <Input id="supplier-name" placeholder="Enter supplier name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91-XXXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Initial Rating</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars - Excellent</SelectItem>
                      <SelectItem value="4">4 Stars - Good</SelectItem>
                      <SelectItem value="3">3 Stars - Average</SelectItem>
                      <SelectItem value="2">2 Stars - Below Average</SelectItem>
                      <SelectItem value="1">1 Star - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter complete address" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddSupplierOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Add Supplier
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Order Dialog */}
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Select supplier and materials for your order
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.rating}★
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Delivery</Label>
                    <Input type="date" />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3 items-end">
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="acid-blue">
                              Acid Blue Color
                            </SelectItem>
                            <SelectItem value="citric-acid">
                              Citric Acid
                            </SelectItem>
                            <SelectItem value="caustic-soda">
                              Caustic Soda
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity (kg)</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Price (₹)</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Order Value:</span>
                    <span className="text-xl font-bold text-primary">
                      ₹0.00
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOrderOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-accent hover:bg-accent/90">
                  Create Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="moq-analysis">MOQ Analysis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Suppliers
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalSuppliers}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+1</span>
                  <span className="text-muted-foreground">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {activeOrders}
                </div>
                <div className="text-xs text-muted-foreground">
                  pending delivery
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{totalOrderValue.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  total pending orders
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Delivery Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {avgDeliveryTime.toFixed(0)} days
                </div>
                <div className="text-xs text-muted-foreground">
                  across all suppliers
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Suppliers */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
              <CardDescription>
                Best performing suppliers by rating and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 3)
                  .map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {supplier.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.materials.length} materials •{" "}
                            {supplier.contact}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                On-time:{" "}
                              </span>
                              <span className="font-medium">
                                {supplier.performance.onTimeDelivery}%
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                Quality:{" "}
                              </span>
                              <span className="font-medium">
                                {supplier.performance.qualityScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{supplier.rating}</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>Latest procurement activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => {
                  const StatusIcon = getOrderStatusIcon(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <StatusIcon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {order.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.supplier_name} • {order.items.length} items
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Ordered: {order.order_date} • Expected:{" "}
                            {order.expected_delivery}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            ₹{order.total_cost.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            total value
                          </div>
                        </div>
                        <Badge variant={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          {/* Search */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>
                Manage your supplier relationships and materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Materials</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>On-time Delivery</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Price Competitiveness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{supplier.contact}</div>
                          <div className="text-muted-foreground">
                            {supplier.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.materials.length} items</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{supplier.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={supplier.performance.onTimeDelivery}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {supplier.performance.onTimeDelivery}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={supplier.performance.qualityScore}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {supplier.performance.qualityScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={supplier.performance.priceCompetitiveness}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {supplier.performance.priceCompetitiveness}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* Orders Table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Track and manage your purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{order.order_date}</TableCell>
                      <TableCell>{order.expected_delivery}</TableCell>
                      <TableCell>₹{order.total_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moq-analysis" className="space-y-6">
          {/* MOQ Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  MOQ Requirements by Material
                </CardTitle>
                <CardDescription>
                  Minimum order quantities across suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={materialCostData}>
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
                      dataKey="moq"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Cost vs MOQ Analysis
                </CardTitle>
                <CardDescription>
                  Price efficiency at minimum order quantities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialCostData.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {material.material}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          MOQ: {material.moq} kg • {material.suppliers}{" "}
                          supplier(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          ₹{material.cost}/kg
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Min: ₹
                          {(material.cost * material.moq).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                MOQ Optimization Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to optimize your ordering strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Bulk Order Opportunity
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Combine Citric Acid orders from 2 suppliers to get 15%
                        volume discount
                      </p>
                      <div className="text-xs text-accent font-medium">
                        Potential savings: ₹2,850
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Delivery Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Schedule orders to meet MOQ while reducing storage costs
                      </p>
                      <div className="text-xs text-primary font-medium">
                        Recommended: Bi-weekly orders
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Stock Alert
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        CBS-X inventory low, but MOQ is only 10kg - order now to
                        avoid stockout
                      </p>
                      <div className="text-xs text-secondary font-medium">
                        Action needed: Within 3 days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Seasonal Planning
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Plan Q2 orders to take advantage of supplier promotions
                      </p>
                      <div className="text-xs text-muted-foreground font-medium">
                        Next review: March 15
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Comprehensive Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Monthly Procurement Spend
                </CardTitle>
                <CardDescription>
                  Track spending trends and order patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlySpendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
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
                    <Area
                      type="monotone"
                      dataKey="spend"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Order Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status of all purchase orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-secondary" />
                Supplier Performance Comparison
              </CardTitle>
              <CardDescription>
                Multi-dimensional performance analysis across all suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={supplierPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="onTime"
                    fill="hsl(var(--primary))"
                    name="On-time Delivery %"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="quality"
                    fill="hsl(var(--accent))"
                    name="Quality Score %"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="price"
                    fill="hsl(var(--secondary))"
                    name="Price Competitiveness %"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-lg">Cost Savings</CardTitle>
                <CardDescription>This quarter vs last quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">₹12,450</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.5% improvement
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-lg">Avg Lead Time</CardTitle>
                <CardDescription>Across all suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">6.8 days</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  -1.2 days vs last month
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-lg">Quality Score</CardTitle>
                <CardDescription>Average across suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">87.3%</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2.1% this month
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
