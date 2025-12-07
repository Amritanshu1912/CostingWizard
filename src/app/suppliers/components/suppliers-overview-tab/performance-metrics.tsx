// src/app/suppliers/components/suppliers-overview-tab/performance-metrics.tsx
"use client";

import { Label } from "@/components/ui/label";
import type { SupplierPerformance } from "@/types/supplier-types";
import { Award, DollarSign, Star, TrendingUp } from "lucide-react";

interface PerformanceMetricsProps {
  performance: SupplierPerformance;
}

/**
 * Displays supplier performance metrics in a grid layout.
 * Shows on-time delivery, quality score, and price competitiveness.
 */
export function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="On-Time Delivery"
          value={performance.onTimeDelivery}
          icon={Award}
        />
        <MetricCard
          label="Quality Score"
          value={performance.qualityScore}
          icon={Star}
        />
        <MetricCard
          label="Price Competitiveness"
          value={performance.priceCompetitiveness}
          icon={DollarSign}
        />
      </div>
    </div>
  );
}

/**
 * Individual metric card with icon and percentage value
 */
function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold">{value}%</p>
    </div>
  );
}
