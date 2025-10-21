"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  DollarSign,
  TrendingUp,
  Award,
  Truck,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { MATERIAL_COST_DATA } from "../../procurement/components/procurement-constants";

export function MoqAnalysisTab() {
  return (
    <div className="space-y-6">
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
              <BarChart data={MATERIAL_COST_DATA}>
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
              {MATERIAL_COST_DATA.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {material.material}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      MOQ: {material.moq} kg • {material.suppliers} supplier(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      ₹{material.cost}/kg
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Min: ₹{(material.cost * material.moq).toLocaleString()}
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
    </div>
  );
}
