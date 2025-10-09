import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductionItem } from "@/lib/types";
import { PRODUCTS } from "@/lib/constants";

interface ProductionPlanningCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlan: (plan: any) => void;
}

interface NewPlan {
  planName: string;
  description: string;
  startDate: string;
  endDate: string;
  products: ProductionItem[];
}

interface NewProduct {
  productId: string;
  quantityKg: number;
}

export function ProductionPlanningCreateDialog({
  isOpen,
  onOpenChange,
  onCreatePlan,
}: ProductionPlanningCreateDialogProps) {
  const [newPlan, setNewPlan] = useState<NewPlan>({
    planName: "",
    description: "",
    startDate: "",
    endDate: "",
    products: [],
  });

  const [newProduct, setNewProduct] = useState<NewProduct>({
    productId: "",
    quantityKg: 0,
  });

  const handleAddProduct = () => {
    if (!newProduct.productId || newProduct.quantityKg <= 0) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const product = PRODUCTS.find((p) => p.id === newProduct.productId);
    if (!product) return;

    const productionItem: ProductionItem = {
      productId: newProduct.productId,
      productName: product.name,
      quantityKg: newProduct.quantityKg,
      costPerKg: product.totalCostPerKg,
      totalCost: newProduct.quantityKg * product.totalCostPerKg,
      materialsRequired: [], // Would be calculated based on product recipe
    };

    setNewPlan({
      ...newPlan,
      products: [...newPlan.products, productionItem],
    });

    setNewProduct({ productId: "", quantityKg: 0 });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = newPlan.products.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, products: updatedProducts });
  };

  const calculatePlanTotals = (products: ProductionItem[]) => {
    const totalCost = products.reduce((sum, p) => sum + p.totalCost, 0);
    const totalRevenue = products.reduce((sum, p) => {
      const product = PRODUCTS.find((ap) => ap.id === p.productId);
      return sum + (product ? p.quantityKg * (product.sellingPricePerKg || 0) : 0);
    }, 0);
    return { totalCost, totalRevenue, totalProfit: totalRevenue - totalCost };
  };

  const handleCreatePlan = () => {
    if (
      !newPlan.planName ||
      !newPlan.startDate ||
      !newPlan.endDate ||
      newPlan.products.length === 0
    ) {
      toast.error("Please fill in all required fields and add at least one product");
      return;
    }

    const { totalCost, totalRevenue, totalProfit } = calculatePlanTotals(newPlan.products);

    const plan = {
      id: Date.now().toString(),
      planName: newPlan.planName,
      description: newPlan.description,
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      products: newPlan.products,
      totalCost,
      totalRevenue,
      totalProfit,
      status: "draft",
      progress: 0,
    };

    onCreatePlan(plan);

    setNewPlan({
      planName: "",
      description: "",
      startDate: "",
      endDate: "",
      products: [],
    });
    onOpenChange(false);
    toast.success("Production plan created successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Production Plan</DialogTitle>
          <DialogDescription>
            Plan your production schedule and calculate material requirements
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                value={newPlan.planName}
                onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                placeholder="Enter plan name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newPlan.startDate}
                  onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newPlan.endDate}
                  onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
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
                    value={newProduct.productId}
                    onValueChange={(value: string) => setNewProduct({ ...newProduct, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₹{product.totalCostPerKg}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label>Quantity (kg)</Label>
                  <Input
                    type="number"
                    value={newProduct.quantityKg}
                    onChange={(e) => setNewProduct({ ...newProduct, quantityKg: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <Button onClick={handleAddProduct} className="bg-secondary hover:bg-secondary/90">
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
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{product.quantityKg}</TableCell>
                        <TableCell>₹{product.costPerKg.toFixed(2)}</TableCell>
                        <TableCell>₹{product.totalCost.toFixed(2)}</TableCell>
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
                      ₹{calculatePlanTotals(newPlan.products).totalCost.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label>Expected Revenue</Label>
                    <div className="text-2xl font-bold text-foreground">
                      ₹{calculatePlanTotals(newPlan.products).totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label>Expected Profit</Label>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{calculatePlanTotals(newPlan.products).totalProfit.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-2">
            <Button onClick={handleCreatePlan} className="flex-1 bg-secondary hover:bg-secondary/90">
              Create Plan
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
