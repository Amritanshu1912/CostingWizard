// src/app/batches/components/batch-requirements/batch-requirements-categories.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Package,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BatchRequirementsByCategory } from "@/types/batch-types";
import { BatchRequirementItem } from "./batch-requirement-item";

interface BatchRequirementsCategoriesProps {
  byCategory: BatchRequirementsByCategory;
}

/**
 * Requirements by category component
 * Shows materials/packaging/labels in separate tabs
 */
export function BatchRequirementsCategories({
  byCategory,
}: BatchRequirementsCategoriesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="text-lg flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              Requirements by Item Type
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <CardContent>
            <Tabs defaultValue="materials" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="materials" className="gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Materials ({byCategory.materials.length})
                </TabsTrigger>
                <TabsTrigger value="packaging" className="gap-2">
                  <Package className="h-4 w-4" />
                  Packaging ({byCategory.packaging.length})
                </TabsTrigger>
                <TabsTrigger value="labels" className="gap-2">
                  <Tag className="h-4 w-4" />
                  Labels ({byCategory.labels.length})
                </TabsTrigger>
              </TabsList>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <span className="font-semibold">All Materials</span>
                    <span className="text-sm text-muted-foreground">
                      ({byCategory.materials.length} items)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₹{byCategory.totalMaterialCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      incl. tax
                    </div>
                  </div>
                </div>

                {byCategory.materials.length > 0 ? (
                  <div className="space-y-3">
                    {byCategory.materials.map((item) => (
                      <BatchRequirementItem
                        key={`material-${item.itemId}-${item.supplierId}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No materials required for this batch</p>
                  </div>
                )}
              </TabsContent>

              {/* Packaging Tab */}
              <TabsContent value="packaging" className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-semibold">All Packaging</span>
                    <span className="text-sm text-muted-foreground">
                      ({byCategory.packaging.length} items)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₹{byCategory.totalPackagingCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      incl. tax
                    </div>
                  </div>
                </div>

                {byCategory.packaging.length > 0 ? (
                  <div className="space-y-3">
                    {byCategory.packaging.map((item) => (
                      <BatchRequirementItem
                        key={`packaging-${item.itemId}-${item.supplierId}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No packaging required for this batch</p>
                  </div>
                )}
              </TabsContent>

              {/* Labels Tab */}
              <TabsContent value="labels" className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="font-semibold">All Labels</span>
                    <span className="text-sm text-muted-foreground">
                      ({byCategory.labels.length} items)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₹{byCategory.totalLabelCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      incl. tax
                    </div>
                  </div>
                </div>

                {byCategory.labels.length > 0 ? (
                  <div className="space-y-3">
                    {byCategory.labels.map((item) => (
                      <BatchRequirementItem
                        key={`label-${item.itemId}-${item.supplierId}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No labels required for this batch</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
