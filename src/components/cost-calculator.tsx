"use client";

import { useState, useEffect, SetStateAction } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  TrendingUp,
  Target,
  Zap,
  Package,
  Plus,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CalculatorIngredient, OptimizationSuggestion } from "@/lib/types";
import { sampleMaterials } from "@/lib/constants";

export function CostCalculator() {
  const [batchSize, setBatchSize] = useState(100);
  const [targetMargin, setTargetMargin] = useState(35);
  const [ingredients, setIngredients] = useState<CalculatorIngredient[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [optimizationEnabled, setOptimizationEnabled] = useState(true);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const totalCost = ingredients.reduce(
    (sum, ing) => sum + (ing.totalCost || 0),
    0
  );
  const costPerKg = batchSize > 0 ? totalCost / batchSize : 0;
  const suggestedPrice =
    targetMargin > 0 && targetMargin < 100
      ? costPerKg / (1 - targetMargin / 100)
      : costPerKg * 1.5;
  const actualMargin =
    suggestedPrice > 0
      ? ((suggestedPrice - costPerKg) / suggestedPrice) * 100
      : 0;

  const addIngredient = () => {
    if (!selectedMaterial || quantity <= 0 || isNaN(quantity)) return;

    const material = sampleMaterials.find((m) => m.id === selectedMaterial);
    if (!material) return;

    const newIngredient: CalculatorIngredient = {
      materialId: material.id,
      materialName: material.name,
      quantity: Number(quantity) || 0,
      unitPrice: material.price || 0,
      totalCost: (Number(quantity) || 0) * (material.price || 0),
      percentage: 0,
    };

    const updatedIngredients = [...ingredients, newIngredient];
    const newTotalCost = updatedIngredients.reduce(
      (sum, ing) => sum + (ing.totalCost || 0),
      0
    );

    // Update percentages with validation
    const ingredientsWithPercentages = updatedIngredients.map((ing) => ({
      ...ing,
      percentage: newTotalCost > 0 ? (ing.totalCost / newTotalCost) * 100 : 0,
    }));

    setIngredients(ingredientsWithPercentages);
    setSelectedMaterial("");
    setQuantity(0);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    const newTotalCost = updatedIngredients.reduce(
      (sum, ing) => sum + (ing.totalCost || 0),
      0
    );

    const ingredientsWithPercentages = updatedIngredients.map((ing) => ({
      ...ing,
      percentage: newTotalCost > 0 ? (ing.totalCost / newTotalCost) * 100 : 0,
    }));

    setIngredients(ingredientsWithPercentages);
  };

  const generateOptimizationSuggestions = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    if (ingredients.length === 0 || totalCost <= 0) return suggestions;

    // Bulk discount suggestions
    ingredients.forEach((ing) => {
      const material = sampleMaterials.find((m) => m.id === ing.materialId);
      if (material?.bulkDiscount && ing.quantity > 0) {
        const applicableDiscount = material.bulkDiscount
          .filter((d) => ing.quantity >= d.quantity)
          .sort((a, b) => b.discount - a.discount)[0];

        if (applicableDiscount) {
          const savings = ing.totalCost * (applicableDiscount.discount / 100);
          if (savings > 0 && !isNaN(savings)) {
            suggestions.push({
              type: "bulk",
              title: `Bulk Discount for ${ing.materialName}`,
              description: `Save ${applicableDiscount.discount}% by ordering ${applicableDiscount.quantity}kg+`,
              savings,
              impact:
                savings > 1000 ? "high" : savings > 500 ? "medium" : "low",
              confidence: 95,
            });
          }
        }
      }
    });

    // High-cost ingredient substitution
    const highCostIngredients = ingredients
      .filter((ing) => ing.percentage > 20 && ing.totalCost > 0)
      .sort((a, b) => b.totalCost - a.totalCost);

    highCostIngredients.forEach((ing) => {
      const potentialSavings = ing.totalCost * 0.15; // Assume 15% savings from substitution
      if (potentialSavings > 0 && !isNaN(potentialSavings)) {
        suggestions.push({
          type: "substitute",
          title: `Consider Alternative to ${ing.materialName}`,
          description: `High-cost ingredient (${ing.percentage.toFixed(
            1
          )}% of total). Alternative materials could reduce costs.`,
          savings: potentialSavings,
          impact: potentialSavings > 1000 ? "high" : "medium",
          confidence: 78,
        });
      }
    });

    // Formula optimization
    if (ingredients.length > 3 && totalCost > 0) {
      const formulaOptimization = totalCost * 0.08; // Assume 8% optimization potential
      if (formulaOptimization > 0 && !isNaN(formulaOptimization)) {
        suggestions.push({
          type: "formula",
          title: "Formula Optimization",
          description:
            "AI analysis suggests potential ingredient ratio adjustments for cost reduction.",
          savings: formulaOptimization,
          impact: "medium",
          confidence: 82,
        });
      }
    }

    return suggestions.sort((a, b) => b.savings - a.savings).slice(0, 5);
  };

  const generateScenarios = () => {
    if (totalCost <= 0 || batchSize <= 0) {
      setScenarios([]);
      return;
    }

    const baseScenario = {
      name: "Current Formula",
      batchSize,
      totalCost,
      costPerKg,
      margin: actualMargin,
      price: suggestedPrice,
    };

    const scenarios = [
      baseScenario,
      {
        name: "10% Cost Reduction",
        batchSize,
        totalCost: totalCost * 0.9,
        costPerKg: costPerKg * 0.9,
        margin:
          suggestedPrice > 0
            ? ((suggestedPrice - costPerKg * 0.9) / suggestedPrice) * 100
            : 0,
        price: suggestedPrice,
      },
      {
        name: "Bulk Discounts Applied",
        batchSize,
        totalCost: totalCost * 0.85,
        costPerKg: costPerKg * 0.85,
        margin:
          suggestedPrice > 0
            ? ((suggestedPrice - costPerKg * 0.85) / suggestedPrice) * 100
            : 0,
        price: suggestedPrice,
      },
      {
        name: "Double Batch Size",
        batchSize: batchSize * 2,
        totalCost: totalCost * 1.8, // Economies of scale
        costPerKg: costPerKg * 0.9,
        margin:
          suggestedPrice > 0
            ? ((suggestedPrice - costPerKg * 0.9) / suggestedPrice) * 100
            : 0,
        price: suggestedPrice,
      },
    ];

    setScenarios(scenarios);
  };

  useEffect(() => {
    generateScenarios();
  }, [batchSize, totalCost, costPerKg, actualMargin, suggestedPrice]);

  const optimizationSuggestions = generateOptimizationSuggestions();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="batch">Batch Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-2 card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>Cost Calculator</span>
                </CardTitle>
                <CardDescription>
                  Build your product formulation and calculate costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch-size" className="text-foreground">
                      Batch Size (kg)
                    </Label>
                    <Input
                      id="batch-size"
                      type="number"
                      min="1"
                      value={batchSize}
                      onChange={(e) =>
                        setBatchSize(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="focus-enhanced"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target-margin" className="text-foreground">
                      Target Margin (%)
                    </Label>
                    <Input
                      id="target-margin"
                      type="number"
                      min="0"
                      max="99"
                      value={targetMargin}
                      onChange={(e) =>
                        setTargetMargin(
                          Math.min(99, Math.max(0, Number(e.target.value) || 0))
                        )
                      }
                      className="focus-enhanced"
                    />
                  </div>
                </div>

                {/* Add Ingredients */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Add Ingredients
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <Label className="text-foreground">Material</Label>
                      <Select
                        value={selectedMaterial}
                        onValueChange={setSelectedMaterial}
                      >
                        <SelectTrigger className="focus-enhanced">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleMaterials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name} - ₹{material.price}/kg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-32">
                      <Label className="text-foreground">Quantity (kg)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(0, Number(e.target.value) || 0))
                        }
                        placeholder="0.000"
                        className="focus-enhanced"
                      />
                    </div>
                    <Button
                      onClick={addIngredient}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Add Ingredient</span>
                    </Button>
                  </div>
                </div>

                {/* Ingredients Table */}
                {ingredients.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Formula Composition
                    </h4>
                    <div className="overflow-x-auto">
                      <Table className="table-enhanced">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-foreground font-medium">
                              #
                            </TableHead>
                            <TableHead className="text-foreground font-medium">
                              Material
                            </TableHead>
                            <TableHead className="text-foreground font-medium">
                              Qty (kg)
                            </TableHead>
                            <TableHead className="text-foreground font-medium">
                              Price/kg
                            </TableHead>
                            <TableHead className="text-foreground font-medium">
                              Total
                            </TableHead>
                            <TableHead className="text-foreground font-medium">
                              %
                            </TableHead>
                            <TableHead className="text-foreground font-medium">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ingredients.map((ingredient, index) => (
                            <TableRow key={index} className="hover:bg-muted/30">
                              <TableCell className="text-muted-foreground font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                {ingredient.materialName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {ingredient.quantity.toFixed(3)}
                              </TableCell>
                              <TableCell className="text-foreground">
                                ₹{ingredient.unitPrice.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-foreground font-medium">
                                ₹{ingredient.totalCost.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-accent font-medium">
                                {ingredient.percentage.toFixed(1)}%
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeIngredient(index)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-foreground">Cost Analysis</CardTitle>
                <CardDescription>Real-time cost calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-sm text-muted-foreground">
                      Total Cost
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ₹{totalCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      for {batchSize}kg batch
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-sm text-muted-foreground">
                      Cost per kg
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ₹{costPerKg.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      manufacturing cost
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-sm text-muted-foreground">
                      Suggested Price
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      ₹{suggestedPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      for {targetMargin}% margin
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-sm text-muted-foreground">
                      Actual Margin
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      {actualMargin.toFixed(1)}%
                    </div>
                    <Progress
                      value={Math.min(100, Math.max(0, actualMargin))}
                      className="h-2 mt-2"
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={generateScenarios}
                    className="w-full btn-secondary"
                    disabled={ingredients.length === 0}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Generate Scenarios
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={optimizationEnabled}
                      onCheckedChange={setOptimizationEnabled}
                    />
                    <Label className="text-sm text-foreground">
                      Auto-optimization
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Zap className="h-5 w-5 text-primary" />
                <span>Cost Optimization</span>
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to reduce costs and improve margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                            <h4 className="font-medium text-foreground">
                              {suggestion.title}
                            </h4>
                            <Badge
                              variant={
                                suggestion.impact === "high"
                                  ? "default"
                                  : suggestion.impact === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {suggestion.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-accent">
                            ₹{suggestion.savings.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            potential savings
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-muted-foreground">
                            {suggestion.confidence}% confidence
                          </div>
                          <Progress
                            value={suggestion.confidence}
                            className="h-1 w-20"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-transparent"
                        >
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Optimization Suggestions
                  </h3>
                  <p className="text-muted-foreground">
                    Add ingredients to your formula to get AI-powered
                    optimization suggestions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Scenario Analysis</span>
              </CardTitle>
              <CardDescription>
                Compare different cost scenarios and their impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scenarios.length > 0 ? (
                <div className="space-y-6">
                  {/* Scenario Comparison Chart */}
                  <div className="h-64 overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarios}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="name"
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
                          dataKey="costPerKg"
                          fill="hsl(var(--chart-1))"
                          name="Cost per kg"
                        />
                        <Bar
                          dataKey="margin"
                          fill="hsl(var(--chart-2))"
                          name="Margin %"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Scenario Details */}
                  <div className="overflow-x-auto">
                    <Table className="table-enhanced">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-foreground font-medium">
                            #
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Scenario
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Batch Size
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Total Cost
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Cost/kg
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Margin
                          </TableHead>
                          <TableHead className="text-foreground font-medium">
                            Price
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scenarios.map((scenario, index) => (
                          <TableRow key={index} className="hover:bg-muted/30">
                            <TableCell className="text-muted-foreground font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {scenario.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {scenario.batchSize}kg
                            </TableCell>
                            <TableCell className="text-foreground">
                              ₹{scenario.totalCost.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              ₹{scenario.costPerKg.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-accent font-medium">
                              {scenario.margin.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-foreground">
                              ₹{scenario.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Scenarios Generated
                  </h3>
                  <p className="text-muted-foreground">
                    Add ingredients and click "Generate Scenarios" to see
                    different cost scenarios.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Package className="h-5 w-5 text-primary" />
                <span>Batch Planning</span>
              </CardTitle>
              <CardDescription>
                Optimize batch sizes and production planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Batch Size Optimizer */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Batch Size Optimization
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-foreground">
                          Target Batch Size (kg)
                        </Label>
                        <Slider
                          value={[batchSize]}
                          onValueChange={(value: SetStateAction<number>[]) =>
                            setBatchSize(value[0])
                          }
                          max={1000}
                          min={10}
                          step={10}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>10kg</span>
                          <span>{batchSize}kg</span>
                          <span>1000kg</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="text-sm text-muted-foreground">
                            Economies of Scale
                          </div>
                          <div className="text-lg font-bold text-accent">
                            {batchSize > 500
                              ? "High"
                              : batchSize > 200
                              ? "Medium"
                              : "Low"}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="text-sm text-muted-foreground">
                            Storage Required
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {Math.ceil(batchSize / 50)} containers
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Production Metrics
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Setup Cost per Batch",
                          value: "₹2,500",
                          status: "fixed",
                        },
                        {
                          label: "Labor Hours Required",
                          value: `${Math.ceil(batchSize / 25)}h`,
                          status: "variable",
                        },
                        {
                          label: "Equipment Utilization",
                          value: `${Math.min(
                            100,
                            (batchSize / 500) * 100
                          ).toFixed(0)}%`,
                          status: "efficiency",
                        },
                        {
                          label: "Quality Control Time",
                          value: `${Math.ceil(batchSize / 100)}h`,
                          status: "quality",
                        },
                      ].map((metric, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {metric.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {metric.status}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Batch Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Batch Size Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        size: 100,
                        label: "Small Batch",
                        description: "Low risk, high flexibility",
                        efficiency: 75,
                      },
                      {
                        size: 300,
                        label: "Medium Batch",
                        description: "Balanced cost and risk",
                        efficiency: 88,
                      },
                      {
                        size: 500,
                        label: "Large Batch",
                        description: "Maximum efficiency",
                        efficiency: 95,
                      },
                    ].map((rec, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setBatchSize(rec.size)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-foreground">
                            {rec.label}
                          </h5>
                          <Badge
                            variant={
                              rec.size === batchSize ? "default" : "outline"
                            }
                            className="text-xs"
                          >
                            {rec.size}kg
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Efficiency
                            </span>
                            <span className="text-foreground">
                              {rec.efficiency}%
                            </span>
                          </div>
                          <Progress value={rec.efficiency} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
