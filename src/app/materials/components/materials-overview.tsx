// materials-overview.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, BarChart3 } from "lucide-react";
import type { Material } from "@/lib/types";

interface MaterialsOverviewProps {
  materials: Material[];
  totalMaterials: number;
  avgPrice: number;
  highestPrice: number;
  avgTax: number;
}

export function MaterialsOverview({
  materials,
  totalMaterials,
  avgPrice,
  highestPrice,
  avgTax,
}: MaterialsOverviewProps) {
  return (
    <>
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
          <CardDescription>Latest materials added to your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.slice(0, 5).map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{material.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {material.category} • Tax: {material.tax}%
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      ₹{(material.priceWithTax || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">per kg</div>
                  </div>
                  <Badge
                    variant={material.status === "active" ? "default" : "destructive"}
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
    </>
  );
}
