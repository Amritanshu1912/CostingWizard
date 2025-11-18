import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type {
  ProductionPlan,
  ProductionItem,
  MaterialRequirement,
} from "@/lib/types";

/**
 * Hook that returns all production plans with enriched data
 * Uses Dexie's reactive queries for real-time updates
 */
export function useProductionPlans(): ProductionPlan[] {
  const plansData = useLiveQuery(() => db.productionPlans.toArray(), []);
  return plansData || [];
}

/**
 * Hook that returns active production plans (not cancelled)
 */
export function useActiveProductionPlans(): ProductionPlan[] {
  const plans = useProductionPlans();
  return useMemo(() => plans.filter((p) => p.status !== "cancelled"), [plans]);
}

/**
 * Hook that returns a single production plan by ID
 */
export function useProductionPlan(
  planId: string | null | undefined
): ProductionPlan | null {
  const plans = useProductionPlans();
  return useMemo(() => {
    if (!planId) return null;
    return plans.find((p) => p.id === planId) || null;
  }, [planId, plans]);
}

/**
 * Hook that computes material requirements across all plans
 * Returns aggregated material needs
 */
export function useMaterialRequirements(): Record<
  string,
  {
    materialId: string;
    materialName: string;
    totalRequired: number;
    totalAvailable: number;
    totalShortage: number;
    unit: string;
    plans: string[]; // plan IDs that require this material
  }
> {
  const plans = useProductionPlans();

  return useMemo(() => {
    const requirements: Record<
      string,
      {
        materialId: string;
        materialName: string;
        totalRequired: number;
        totalAvailable: number;
        totalShortage: number;
        unit: string;
        plans: string[];
      }
    > = {};

    plans.forEach((plan) => {
      if (plan.status === "cancelled") return;

      plan.products.forEach((product) => {
        product.materialsRequired.forEach((material) => {
          const key = material.materialId;

          if (!requirements[key]) {
            requirements[key] = {
              materialId: material.materialId,
              materialName: material.materialName,
              totalRequired: 0,
              totalAvailable: 0,
              totalShortage: 0,
              unit: material.unit,
              plans: [],
            };
          }

          requirements[key].totalRequired += material.requiredQty;
          requirements[key].totalAvailable += material.availableQty;
          requirements[key].totalShortage += material.shortage;

          if (!requirements[key].plans.includes(plan.id)) {
            requirements[key].plans.push(plan.id);
          }
        });
      });
    });

    return requirements;
  }, [plans]);
}

/**
 * Hook that computes production planning statistics
 */
export function usePlanningStats() {
  const plans = useProductionPlans();

  return useMemo(() => {
    const totalPlans = plans.length;
    const activePlans = plans.filter(
      (p) => p.status === "in-progress" || p.status === "scheduled"
    ).length;
    const completedPlans = plans.filter((p) => p.status === "completed").length;
    const draftPlans = plans.filter((p) => p.status === "draft").length;

    const totalCost = plans.reduce((sum, p) => sum + p.totalCost, 0);
    const totalRevenue = plans.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalProfit = plans.reduce((sum, p) => sum + p.totalProfit, 0);

    const avgProfitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalPlans,
      activePlans,
      completedPlans,
      draftPlans,
      totalCost,
      totalRevenue,
      totalProfit,
      avgProfitMargin,
    };
  }, [plans]);
}

/**
 * Hook that returns plans filtered by status
 */
export function usePlansByStatus(
  status: ProductionPlan["status"]
): ProductionPlan[] {
  const plans = useProductionPlans();
  return useMemo(
    () => plans.filter((p) => p.status === status),
    [plans, status]
  );
}

/**
 * Hook that returns plans within a date range
 */
export function usePlansInDateRange(
  startDate: string,
  endDate: string
): ProductionPlan[] {
  const plans = useProductionPlans();
  return useMemo(() => {
    return plans.filter((plan) => {
      return plan.startDate >= startDate && plan.endDate <= endDate;
    });
  }, [plans, startDate, endDate]);
}

/**
 * Hook that computes critical material shortages across all plans
 */
export function useCriticalShortages(): {
  materialId: string;
  materialName: string;
  totalShortage: number;
  unit: string;
  affectedPlans: number;
}[] {
  const requirements = useMaterialRequirements();

  return useMemo(() => {
    return Object.values(requirements)
      .filter((req) => req.totalShortage > 0)
      .map((req) => ({
        materialId: req.materialId,
        materialName: req.materialName,
        totalShortage: req.totalShortage,
        unit: req.unit,
        affectedPlans: req.plans.length,
      }))
      .sort((a, b) => b.totalShortage - a.totalShortage);
  }, [requirements]);
}

/**
 * Hook that returns production plans with search functionality
 */
export function useFilteredPlans(searchTerm: string): ProductionPlan[] {
  const plans = useProductionPlans();

  return useMemo(() => {
    if (!searchTerm.trim()) return plans;

    const term = searchTerm.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.planName.toLowerCase().includes(term) ||
        plan.description?.toLowerCase().includes(term) ||
        plan.products.some((product) =>
          product.productName.toLowerCase().includes(term)
        )
    );
  }, [plans, searchTerm]);
}
