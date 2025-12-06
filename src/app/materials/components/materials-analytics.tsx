// src/app/materials/components/materials-analytics.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard, MetricCardWithBadge } from "@/components/ui/metric-card";
import {
  useMaterialsAnalytics,
  useMaterialSupplierMappings,
} from "@/hooks/material-hooks/use-materials-queries";
import { CHART_COLORS } from "@/utils/color-utils";
import { AlertTriangle, DollarSign, Package, Users } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * MaterialsAnalytics component shows key metrics, charts, and insights
 * derived from materials data including
 * supplier diversity, stock alerts, price distributions, and category breakdowns.
 */
export function MaterialsAnalytics() {
  // Fetch analytics data and supplier mappings from custom hooks
  const analytics = useMaterialsAnalytics();
  const supplierMaterials = useMaterialSupplierMappings();

  // Compute metrics for materials that have multiple supplier options
  const materialsWithMultipleSuppliers = useMemo(() => {
    const materialSupplierCount = new Map<string, Set<string>>();

    // Build a map of materials to their unique suppliers
    supplierMaterials.forEach((sm) => {
      const suppliers = materialSupplierCount.get(sm.materialName) || new Set();
      suppliers.add(sm.supplierId);
      materialSupplierCount.set(sm.materialName, suppliers);
    });

    // Count materials with more than one supplier
    const count = Array.from(materialSupplierCount.values()).filter(
      (suppliers) => suppliers.size > 1
    ).length;

    // Calculate percentage of materials with multiple suppliers
    const percentage =
      materialSupplierCount.size > 0
        ? (count / materialSupplierCount.size) * 100
        : 0;

    return { count, percentage };
  }, [supplierMaterials]);

  // Calculate the average number of suppliers per material
  const avgSuppliersPerMaterial = useMemo(() => {
    const materialSupplierCount = new Map<string, Set<string>>();

    // Aggregate suppliers for each material
    supplierMaterials.forEach((sm) => {
      const suppliers = materialSupplierCount.get(sm.materialName) || new Set();
      suppliers.add(sm.supplierId);
      materialSupplierCount.set(sm.materialName, suppliers);
    });

    if (materialSupplierCount.size === 0) return 0;

    // Sum up all suppliers across materials
    const totalSuppliers = Array.from(materialSupplierCount.values()).reduce(
      (sum, suppliers) => sum + suppliers.size,
      0
    );

    return totalSuppliers / materialSupplierCount.size;
  }, [supplierMaterials]);

  // Prepare key metrics data for display in metric cards
  const keyMetrics = useMemo(() => {
    return [
      {
        type: "standard",
        title: "Total Materials",
        value: analytics.totalMaterials,
        icon: Package,
        iconClassName: "text-primary",
        trend: {
          value: "+12%",
          isPositive: true,
          label: "from last month",
        },
      },
      {
        type: "badge",
        title: "Stock Alerts",
        value: analytics.stockAlerts,
        icon: AlertTriangle,
        iconClassName: "text-destructive",
        badges:
          analytics.stockAlerts > 0
            ? [
                {
                  text: `${analytics.stockAlerts} items`,
                  variant: "destructive" as const,
                },
              ]
            : [
                {
                  text: "All good",
                  variant: "default" as const,
                },
              ],
      },
      {
        type: "standard",
        title: "Avg Price (with tax)",
        value: `₹${analytics.avgPrice.toFixed(2)}`,
        icon: DollarSign,
        iconClassName: "text-accent",
        trend: {
          value: "+5.2%",
          isPositive: true,
          label: "from last month",
        },
      },
      {
        type: "standard",
        title: "Materials with Options",
        value: materialsWithMultipleSuppliers.count,
        icon: Users,
        iconClassName: "text-primary",
        description: `${materialsWithMultipleSuppliers.percentage.toFixed(0)}% have multiple suppliers`,
      },
    ];
  }, [analytics, materialsWithMultipleSuppliers]);

  // Prepare data for the category distribution pie chart
  const categoryChartData = useMemo(() => {
    return analytics.categoryDistribution.map((item) => ({
      name: item.category,
      color: item.categoryColor,
      value: item.count,
      avgPrice: item.avgPrice,
    }));
  }, [analytics.categoryDistribution]);

  // Prepare data for the price range bar chart
  const priceRangeChartData = useMemo(() => {
    return analytics.priceRanges.map((range) => ({
      range: range.range,
      count: range.count,
      percentage: range.percentage,
    }));
  }, [analytics.priceRanges]);

  // Calculate maximum values for chart axes scaling
  const maxValues = useMemo(() => {
    const maxCount = Math.max(...categoryChartData.map((d) => d.value), 0);
    const maxPrice = Math.max(...categoryChartData.map((d) => d.avgPrice), 0);
    return {
      maxCount: Math.ceil(maxCount * 1.2) || 1,
      maxPrice: Math.ceil(maxPrice * 1.2) || 1,
    };
  }, [categoryChartData]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          if (metric.type === "badge") {
            return (
              <MetricCardWithBadge
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={Icon}
                iconClassName={metric.iconClassName}
                badges={metric.badges!}
              />
            );
          } else {
            return (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={Icon}
                iconClassName={metric.iconClassName}
                trend={metric.trend}
                description={metric.description}
              />
            );
          }
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Materials by Category
            </CardTitle>
            <CardDescription>
              Distribution of materials across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value, name, props) => [
                    `${value} materials`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price Range Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Price Range Distribution
            </CardTitle>
            <CardDescription>Materials grouped by price ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceRangeChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="range"
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="stroke-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value, name) => [
                    `${value} materials`,
                    name === "count" ? "Count" : name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill={CHART_COLORS.light.chart1}
                  name="Material Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-foreground">Category Breakdown</CardTitle>
          <CardDescription>Detailed metrics for each category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={categoryChartData}
              margin={{ top: 20, right: 40, left: 40, bottom: 5 }}
              barCategoryGap="20%" // space between groups
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              {/* X axis: categories */}
              <XAxis
                dataKey="name"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />

              {/* LEFT Y axis: Count (materials) */}
              <YAxis
                yAxisId="count"
                orientation="left"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                domain={[0, maxValues.maxCount]}
                allowDecimals={false}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  offset: 8,
                }}
              />

              {/* RIGHT Y axis: Avg Price (₹) */}
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                domain={[0, maxValues.maxPrice]}
                tickFormatter={(v) => `₹${v}`}
                label={{
                  value: "Avg Price (₹)",
                  angle: 90,
                  position: "insideRight",
                  offset: 8,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value, key) => {
                  if (key === "value") return [`${value} materials`, "Count"];
                  if (key === "avgPrice") return [`₹${value}`, "Avg Price"];
                  return value;
                }}
                labelFormatter={(label) => `${label}`}
              />

              <Legend verticalAlign="top" />

              {/* BAR: Count (uses left axis) */}
              <Bar
                yAxisId="count"
                dataKey="value"
                name="Count"
                radius={[4, 4, 0, 0]}
                barSize={18}
              >
                {categoryChartData.map((entry, idx) => (
                  <Cell key={`cell-count-${idx}`} fill={entry.color} />
                ))}
              </Bar>

              {/* BAR: Avg Price (uses right axis) */}
              <Bar
                yAxisId="price"
                dataKey="avgPrice"
                name="Avg Price"
                radius={[4, 4, 0, 0]}
                barSize={18}
                // make it visually distinct (lighter / semi-transparent)
                fill="var(--primary)"
                opacity={0.75}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <Card className="card-enhanced border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">Key Insights</CardTitle>
          <CardDescription>
            Data-driven observations from your materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Supplier Diversity
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {materialsWithMultipleSuppliers.count} materials have
                    multiple supplier options, giving you{" "}
                    {materialsWithMultipleSuppliers.percentage.toFixed(0)}%
                    flexibility in sourcing.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Average Suppliers
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Each material has an average of{" "}
                    {avgSuppliersPerMaterial.toFixed(1)} suppliers, providing
                    good market coverage.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Stock Situation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {analytics.stockAlerts === 0
                      ? "All materials are in good stock. No alerts at this time."
                      : `${analytics.stockAlerts} materials need attention due to limited or out-of-stock status.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Price Range
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Most materials (
                    {priceRangeChartData.length > 0
                      ? priceRangeChartData.reduce(
                          (max, item) => (item.count > max.count ? item : max),
                          { count: 0, range: "N/A" }
                        ).range
                      : "N/A"}
                    ) fall in the mid-price range, showing balanced sourcing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
