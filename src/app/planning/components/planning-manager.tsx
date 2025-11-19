"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ProductionPlan } from "@/lib/types";
import { useProductionPlans, useFilteredPlans } from "@/hooks/use-planning";
import { db, dbUtils } from "@/lib/db";

import { PlanningOverviewTab } from "./planning-overview-tab";
import { PlanningMaterialsTab } from "./planning-old-materials-tab";
import { ProductionPlanningCreateDialog } from "./planning-create-dialog";
import { PlanningAnalytics } from "./planning-analytics";

export function ProductionPlanning() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);

  // Use the hook for data from DB
  const allPlans = useProductionPlans();
  const filteredPlans = useFilteredPlans(searchTerm);

  const handleCreatePlan = async (plan: ProductionPlan) => {
    await dbUtils.add(db.productionPlans, plan);
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePlan = async (updatedPlan: ProductionPlan) => {
    await dbUtils.update(db.productionPlans, updatedPlan);
    setEditingPlan(null);
    setIsCreateDialogOpen(false);
  };

  const handleEditClick = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setIsCreateDialogOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    await dbUtils.delete(db.productionPlans, id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Production Planning Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create, manage, and analyze your production plans.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Create Plan</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Planning Overview</TabsTrigger>
          <TabsTrigger value="old-materials-req">Old Materials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PlanningOverviewTab
            plans={filteredPlans}
            onDeletePlan={handleDeletePlan}
            onEditPlan={handleEditClick}
          />
        </TabsContent>

        <TabsContent value="old-materials" className="space-y-6">
          <PlanningMaterialsTab plans={allPlans} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PlanningAnalytics plans={allPlans} />
        </TabsContent>
      </Tabs>

      <ProductionPlanningCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreatePlan={handleCreatePlan}
        initialPlan={editingPlan}
        onEditPlan={handleUpdatePlan}
      />
    </div>
  );
}
