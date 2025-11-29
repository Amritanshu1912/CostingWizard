// components/batches/batch-requirements/requirements-category-list.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RequirementItem } from "@/lib/types";
import { FlaskConical, Package, Tag } from "lucide-react";
import { TotalCostDisplay } from "../../utils/price-display";
import { RequirementItemRow } from "./requirement-item-row";

interface RequirementsCategoryListProps {
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalMaterialCost: number;
  totalPackagingCost: number;
  totalLabelCost: number;
}

export function RequirementsCategoryList({
  materials,
  packaging,
  labels,
  totalMaterialCost,
  totalPackagingCost,
  totalLabelCost,
}: RequirementsCategoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Requirements by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="materials" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              Materials ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="packaging" className="gap-2">
              <Package className="h-4 w-4" />
              Packaging ({packaging.length})
            </TabsTrigger>
            <TabsTrigger value="labels" className="gap-2">
              <Tag className="h-4 w-4" />
              Labels ({labels.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <span className="font-semibold">All Materials</span>
                <span className="text-sm text-muted-foreground">
                  ({materials.length} items)
                </span>
              </div>
              <TotalCostDisplay totalCost={totalMaterialCost} />
            </div>

            {materials.length > 0 ? (
              <div className="space-y-3">
                {materials.map((item) => (
                  <RequirementItemRow
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

          <TabsContent value="packaging" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-semibold">All Packaging</span>
                <span className="text-sm text-muted-foreground">
                  ({packaging.length} items)
                </span>
              </div>
              <TotalCostDisplay totalCost={totalPackagingCost} />
            </div>

            {packaging.length > 0 ? (
              <div className="space-y-3">
                {packaging.map((item) => (
                  <RequirementItemRow
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

          <TabsContent value="labels" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <span className="font-semibold">All Labels</span>
                <span className="text-sm text-muted-foreground">
                  ({labels.length} items)
                </span>
              </div>
              <TotalCostDisplay totalCost={totalLabelCost} />
            </div>

            {labels.length > 0 ? (
              <div className="space-y-3">
                {labels.map((item) => (
                  <RequirementItemRow
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
    </Card>
  );
}
