import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortableTable } from "@/components/ui/sortable-table";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Package,
  Factory,
  TrendingUp,
  CheckCircle,
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
import { ProductionPlan } from "@/lib/types";
import {
  MATERIAL_INVENTORY,
  MATERIAL_COST_BREAKDOWN,
  PROCUREMENT_RECOMMENDATIONS,
} from "./planning-constants";

interface ProductionPlanningMaterialsTabProps {
  plans: ProductionPlan[];
}

export function ProductionPlanningMaterialsTab({
  plans,
}: ProductionPlanningMaterialsTabProps) {
  const totalMaterialsNeeded = 12;
  const shortages = 3;
  const totalMaterialCost = 28450;

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold text-foreground">
              {totalMaterialsNeeded}
            </div>
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
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {shortages}
            </div>
            <div className="text-xs text-muted-foreground">materials short</div>
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
              ₹{totalMaterialCost.toLocaleString()}
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
                (p) => p.status === "in-progress" || p.status === "scheduled"
              )
              .map((plan) => (
                <div
                  key={plan.id}
                  className="border rounded-lg p-4 bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {plan.planName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {plan.startDate} to {plan.endDate} •{" "}
                        {plan.products.length} products
                      </p>
                    </div>
                    <Badge variant="secondary">{plan.status}</Badge>
                  </div>

                  <div className="space-y-3">
                    {plan.products.map((product, productIndex) => (
                      <div
                        key={productIndex}
                        className="bg-card rounded-lg p-3 border"
                      >
                        <div className="font-medium text-sm text-foreground mb-2">
                          {product.productName} ({product.quantityKg} kg)
                        </div>
                        <div className="grid gap-2">
                          {product.materialsRequired.map(
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
                                    {material.materialName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-muted-foreground">
                                    Need: {material.requiredQty} kg
                                  </span>
                                  <span className="text-muted-foreground">
                                    Available: {material.availableQty} kg
                                  </span>
                                  {material.shortage > 0 && (
                                    <span className="text-destructive font-medium">
                                      Short: {material.shortage} kg
                                    </span>
                                  )}
                                  <span className="font-medium">
                                    ₹{material.totalCost.toFixed(0)}
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
          <SortableTable
            data={plans
              .flatMap((plan) =>
                plan.products.flatMap((product) => product.materialsRequired)
              )
              .filter((material) => material.shortage > 0)}
            columns={[
              {
                key: "materialName",
                label: "Material",
                sortable: true,
                render: (value: string) => (
                  <span className="font-medium">{value}</span>
                ),
              },
              {
                key: "requiredQty",
                label: "Required",
                sortable: true,
                render: (value: number) => <span>{value} kg</span>,
              },
              {
                key: "availableQty",
                label: "Available",
                sortable: true,
                render: (value: number) => <span>{value} kg</span>,
              },
              {
                key: "shortage",
                label: "Shortage",
                sortable: true,
                render: (value: number) => (
                  <span className="text-destructive font-medium">
                    {value} kg
                  </span>
                ),
              },
              {
                key: "costPerKg",
                label: "Cost per kg",
                sortable: true,
                render: (value: number) => <span>₹{value.toFixed(2)}</span>,
              },
              {
                key: "procurementCost",
                label: "Procurement Cost",
                sortable: true,
                render: (value: any, row: any) => (
                  <span className="font-medium">
                    ₹{(row.shortage * row.costPerKg).toFixed(2)}
                  </span>
                ),
              },
              {
                key: "priority",
                label: "Priority",
                sortable: false,
                render: () => <Badge variant="destructive">High</Badge>,
              },
              {
                key: "action",
                label: "Action",
                sortable: false,
                render: () => (
                  <Button size="sm" className="bg-accent hover:bg-accent/90">
                    Order Now
                  </Button>
                ),
              },
            ]}
            className="table-enhanced"
            showSerialNumber={true}
          />
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
            {MATERIAL_INVENTORY.map((material, index) => {
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
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-medium">
                        {material.available} {material.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Required:</span>
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

      {/* Procurement Recommendations */}
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
            {PROCUREMENT_RECOMMENDATIONS.map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg bg-${rec.bgColor}/10 border border-${rec.bgColor}/20`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-${rec.bgColor}/20 flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent
                        className={`h-4 w-4 text-${rec.bgColor}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div
                        className={`text-xs text-${rec.bgColor} font-medium`}
                      >
                        {rec.type === "urgent" &&
                          `Estimated cost: ₹${rec.cost} • Lead time: ${rec.leadTime}`}
                        {rec.type === "bulk" &&
                          `Potential savings: ₹${rec.savings}`}
                        {rec.type === "optimization" &&
                          `Storage cost savings: ₹${rec.savings}/month`}
                        {rec.type === "quality" &&
                          `Testing window: ${rec.window}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <BarChart data={MATERIAL_COST_BREAKDOWN}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="material" stroke="hsl(var(--muted-foreground))" />
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
    </div>
  );
}
