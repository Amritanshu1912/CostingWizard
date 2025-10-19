"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, Target, Zap, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  RecipeIngredient,
  RecipeIngredientCalculated,
  OptimizationSuggestion,
  SupplierMaterialWithDetails,
} from "@/lib/types";
import { useRecipeCalculator } from "@/hooks/use-recipe-calculator";
import {
  BATCH_SIZE_CONFIG,
  MARGIN_CONFIG,
  OPTIMIZATION_THRESHOLDS,
  SCENARIO_MULTIPLIERS,
} from "@/lib/calculator-constants";
import {
  IngredientForm,
  IngredientsTable,
  CostAnalysis,
  OptimizationSuggestions,
  ScenarioComparison,
} from "@/components/cost-calculator-components";
import { ScenarioData } from "@/lib/types";
import {
  INGREDIENT_UNITS as UNITS,
  convertToKilograms,
} from "@/app/recipes/components/recipes-constants"; // Assuming this utility is saved in src/lib/recipe-constants.ts
import type { IngredientUnitValue } from "@/app/recipes/components/recipes-constants";

export function CostCalculator() {
  // Custom hook for recipe calculations
  const {
    supplierMaterials,
    calculateIngredient,
    updateIngredientPercentages,
  } = useRecipeCalculator();

  // State management
  const [batchSize, setBatchSize] = useState<number>(BATCH_SIZE_CONFIG.DEFAULT);
  const [targetMargin, setTargetMargin] = useState<number>(
    MARGIN_CONFIG.DEFAULT
  );
  const [ingredients, setIngredients] = useState<RecipeIngredientCalculated[]>(
    []
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState<string>(UNITS[0].value);
  const [optimizationEnabled, setOptimizationEnabled] = useState(true);
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);

  // Calculations
  const totalCost = ingredients.reduce(
    (sum, ing) => sum + (ing.costForQuantity || 0),
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

  // Add ingredient handler
  const addIngredient = () => {
    // Validation now checks for the 'unit' state variable
    if (!selectedMaterial || quantity <= 0 || isNaN(quantity) || !unit) return;

    const newIngredient = calculateIngredient(
      selectedMaterial,
      quantity,
      unit as IngredientUnitValue
    );

    if (!newIngredient) return;

    const updatedIngredients = updateIngredientPercentages([
      ...ingredients,
      newIngredient,
    ]);
    setIngredients(updatedIngredients);

    setSelectedMaterial("");
    setQuantity(0);
    // Reset unit back to default after adding ingredient
    setUnit(UNITS[0].value); // Reset to the default unit
  };

  // Remove ingredient handler
  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    const ingredientsWithPercentages =
      updateIngredientPercentages(updatedIngredients);
    setIngredients(ingredientsWithPercentages);
  };

  // Generate optimization suggestions
  const generateOptimizationSuggestions = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    if (ingredients.length === 0 || totalCost <= 0) return suggestions;

    // Bulk discount suggestions
    ingredients.forEach((ing) => {
      const supplierMaterial = supplierMaterials.find(
        (sm) => sm.id === ing.supplierMaterialId
      );
      if (supplierMaterial?.bulkDiscounts && ing.quantity > 0) {
        const applicableDiscount = supplierMaterial.bulkDiscounts
          .filter((d) => ing.quantity >= d.quantity)
          .sort((a, b) => b.discount - a.discount)[0];

        if (applicableDiscount) {
          const savings =
            ing.costForQuantity * (applicableDiscount.discount / 100);
          if (savings > 0 && !isNaN(savings)) {
            suggestions.push({
              type: "bulk",
              title: `Bulk Discount for ${ing.displayName}`,
              description: `Save ${applicableDiscount.discount}% by ordering ${applicableDiscount.quantity}kg+`,
              savings,
              impact:
                savings > OPTIMIZATION_THRESHOLDS.HIGH_IMPACT_SAVINGS
                  ? "high"
                  : savings > OPTIMIZATION_THRESHOLDS.MEDIUM_IMPACT_SAVINGS
                  ? "medium"
                  : "low",
              confidence: 95,
            });
          }
        }
      }
    });

    // High-cost ingredient substitution
    const highCostIngredients = ingredients
      .filter(
        (ing) =>
          (ing.percentage || 0) >
            OPTIMIZATION_THRESHOLDS.HIGH_COST_PERCENTAGE &&
          ing.costForQuantity > 0
      )
      .sort((a, b) => b.costForQuantity - a.costForQuantity);

    highCostIngredients.forEach((ing) => {
      const potentialSavings =
        ing.costForQuantity * OPTIMIZATION_THRESHOLDS.SUBSTITUTION_SAVINGS_RATE;
      if (potentialSavings > 0 && !isNaN(potentialSavings)) {
        suggestions.push({
          type: "substitute",
          title: `Consider Alternative to ${ing.displayName}`,
          description: `High-cost ingredient (${(ing.percentage || 0).toFixed(
            1
          )}% of total). Alternative materials could reduce costs.`,
          savings: potentialSavings,
          impact:
            potentialSavings > OPTIMIZATION_THRESHOLDS.HIGH_IMPACT_SAVINGS
              ? "high"
              : "medium",
          confidence: 78,
        });
      }
    });

    // Recipe optimization
    if (
      ingredients.length >
        OPTIMIZATION_THRESHOLDS.MIN_INGREDIENTS_FOR_RECIPE_OPT &&
      totalCost > 0
    ) {
      const recipeOptimization =
        totalCost * OPTIMIZATION_THRESHOLDS.RECIPE_OPTIMIZATION_RATE;
      if (recipeOptimization > 0 && !isNaN(recipeOptimization)) {
        suggestions.push({
          type: "recipe",
          title: "Recipe Optimization",
          description:
            "AI analysis suggests potential ingredient ratio adjustments for cost reduction.",
          savings: recipeOptimization,
          impact: "medium",
          confidence: 82,
        });
      }
    }

    return suggestions.sort((a, b) => b.savings - a.savings).slice(0, 5);
  };

  // Generate scenarios
  const generateScenarios = () => {
    if (totalCost <= 0 || batchSize <= 0) {
      setScenarios([]);
      return;
    }

    const baseScenario: ScenarioData = {
      name: "Current Recipe",
      batchSize,
      totalCost,
      costPerKg,
      margin: actualMargin,
      price: suggestedPrice,
    };

    const newScenarios: ScenarioData[] = [
      baseScenario,
      {
        name: "10% Cost Reduction",
        batchSize,
        totalCost: totalCost * SCENARIO_MULTIPLIERS.COST_REDUCTION,
        costPerKg: costPerKg * SCENARIO_MULTIPLIERS.COST_REDUCTION,
        margin:
          suggestedPrice > 0
            ? ((suggestedPrice -
                costPerKg * SCENARIO_MULTIPLIERS.COST_REDUCTION) /
                suggestedPrice) *
              100
            : 0,
        price: suggestedPrice,
      },
      {
        name: "Bulk Discounts Applied",
        batchSize,
        totalCost: totalCost * SCENARIO_MULTIPLIERS.BULK_DISCOUNT,
        costPerKg: costPerKg * SCENARIO_MULTIPLIERS.BULK_DISCOUNT,
        margin:
          suggestedPrice > 0
            ? ((suggestedPrice -
                costPerKg * SCENARIO_MULTIPLIERS.BULK_DISCOUNT) /
                suggestedPrice) *
              100
            : 0,
        price: suggestedPrice,
      },
      {
        name: "Double Batch Size",
        batchSize: batchSize * SCENARIO_MULTIPLIERS.DOUBLE_BATCH_SIZE,
        totalCost: totalCost * SCENARIO_MULTIPLIERS.DOUBLE_BATCH_COST,
        costPerKg: costPerKg * SCENARIO_MULTIPLIERS.DOUBLE_BATCH_EFFICIENCY,
        margin:
          suggestedPrice > 0
            ? ((suggestedPrice -
                costPerKg * SCENARIO_MULTIPLIERS.DOUBLE_BATCH_EFFICIENCY) /
                suggestedPrice) *
              100
            : 0,
        price: suggestedPrice,
      },
    ];

    setScenarios(newScenarios);
  };

  // Auto-generate scenarios when dependencies change
  useEffect(() => {
    generateScenarios();
  }, [batchSize, totalCost, costPerKg, actualMargin, suggestedPrice]);

  const optimizationSuggestions = generateOptimizationSuggestions();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* CALCULATOR TAB */}
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
                  Build your product recipe and calculate costs
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
                      min={BATCH_SIZE_CONFIG.MIN}
                      value={batchSize}
                      onChange={(e) =>
                        setBatchSize(
                          Math.max(
                            BATCH_SIZE_CONFIG.MIN,
                            Number(e.target.value) || BATCH_SIZE_CONFIG.MIN
                          )
                        )
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
                      min={MARGIN_CONFIG.MIN}
                      max={MARGIN_CONFIG.MAX}
                      value={targetMargin}
                      onChange={(e) =>
                        setTargetMargin(
                          Math.min(
                            MARGIN_CONFIG.MAX,
                            Math.max(
                              MARGIN_CONFIG.MIN,
                              Number(e.target.value) || MARGIN_CONFIG.MIN
                            )
                          )
                        )
                      }
                      className="focus-enhanced"
                    />
                  </div>
                </div>

                {/* Add Ingredients */}
                <IngredientForm
                  materials={supplierMaterials}
                  selectedMaterial={selectedMaterial}
                  quantity={quantity}
                  onMaterialChange={setSelectedMaterial}
                  onQuantityChange={setQuantity}
                  onAddIngredient={addIngredient}
                />

                {/* Ingredients Table */}
                <IngredientsTable
                  ingredients={ingredients}
                  onRemoveIngredient={removeIngredient}
                />
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-foreground">Cost Analysis</CardTitle>
                <CardDescription>Real-time cost calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <CostAnalysis
                  totalCost={totalCost}
                  costPerKg={costPerKg}
                  suggestedPrice={suggestedPrice}
                  actualMargin={actualMargin}
                  batchSize={batchSize}
                  targetMargin={targetMargin}
                  hasIngredients={ingredients.length > 0}
                  onGenerateScenarios={generateScenarios}
                  optimizationEnabled={optimizationEnabled}
                  onOptimizationToggle={setOptimizationEnabled}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* OPTIMIZATION TAB */}
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
              <OptimizationSuggestions suggestions={optimizationSuggestions} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCENARIOS TAB */}
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
                  <ScenarioComparison scenarios={scenarios} />
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
      </Tabs>
    </div>
  );
}
