// components/batches/batch-requirements/product-wise-requirements.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { RequirementItem } from "@/types/batch-types";
import { ChevronDown, ChevronRight, Package2 } from "lucide-react";
import { useState } from "react";
import { TotalCostDisplay } from "../../utils/price-display";
import { RequirementItemRowCompact } from "./requirement-item-row";
import { Button } from "@/components/ui/button";

interface ProductRequirements {
  productId: string;
  productName: string;
  variants: VariantRequirements[];
  totalMaterials: RequirementItem[];
  totalPackaging: RequirementItem[];
  totalLabels: RequirementItem[];
  totalCost: number;
}

interface VariantRequirements {
  variantId: string;
  variantName: string;
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalCost: number;
}

interface ProductWiseRequirementsProps {
  products: ProductRequirements[];
}

export function ProductWiseRequirements({
  products,
}: ProductWiseRequirementsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <Package2 className="h-5 w-5" />
              Requirements by Product
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <CardContent className="space-y-4">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface ProductCardProps {
  product: ProductRequirements;
}

function ProductCard({ product }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems =
    product.totalMaterials.length +
    product.totalPackaging.length +
    product.totalLabels.length;

  return (
    <Card className="border-2">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardContent className="p-4 space-y-4">
          {/* Product Header */}

          <div className="flex items-center justify-between gap-4 hover:bg-accent/50 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-semibold text-lg truncate">
                  {product.productName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{product.variants.length} variants</span>
                  <span>•</span>
                  <span>{totalItems} items</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  ₹{product.totalCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">total cost</p>
              </div>
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="p-3 bg-primary/5 rounded-lg border">
            <TotalCostDisplay
              totalCost={product.totalCost}
              breakdown={[
                {
                  icon: "🧪",
                  label: "Materials",
                  amount: product.totalMaterials.reduce(
                    (sum, m) => sum + m.totalCost,
                    0
                  ),
                  totalItems: product.totalMaterials.length,
                  percentage:
                    (product.totalMaterials.reduce(
                      (sum, m) => sum + m.totalCost,
                      0
                    ) /
                      product.totalCost) *
                    100,
                },
                {
                  icon: "📦",
                  label: "Packaging",
                  amount: product.totalPackaging.reduce(
                    (sum, p) => sum + p.totalCost,
                    0
                  ),
                  totalItems: product.totalPackaging.length,
                  percentage:
                    (product.totalPackaging.reduce(
                      (sum, p) => sum + p.totalCost,
                      0
                    ) /
                      product.totalCost) *
                    100,
                },
                {
                  icon: "🏷️",
                  label: "Labels",
                  amount: product.totalLabels.reduce(
                    (sum, l) => sum + l.totalCost,
                    0
                  ),
                  totalItems: product.totalLabels.length,
                  percentage:
                    (product.totalLabels.reduce(
                      (sum, l) => sum + l.totalCost,
                      0
                    ) /
                      product.totalCost) *
                    100,
                },
              ]}
            />
          </div>

          {/* Show/Hide Details Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-auto text-xs"
          >
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>

          {/* Expanded Content */}
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Combined Requirements Collapsible Card */}
            <Collapsible defaultOpen={false}>
              <Card className="py-3 gap-0">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer p-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        Combined Requirements (All Variants)
                      </span>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="py-3 pr-3 pl-6 p space-y-3">
                    {product.totalMaterials.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Materials ({product.totalMaterials.length})
                        </p>
                        {product.totalMaterials.map((item) => (
                          <RequirementItemRowCompact
                            key={`combined-material-${item.itemId}`}
                            item={item}
                          />
                        ))}
                      </div>
                    )}

                    {product.totalPackaging.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Packaging ({product.totalPackaging.length})
                        </p>
                        {product.totalPackaging.map((item) => (
                          <RequirementItemRowCompact
                            key={`combined-packaging-${item.itemId}`}
                            item={item}
                          />
                        ))}
                      </div>
                    )}

                    {product.totalLabels.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Labels ({product.totalLabels.length})
                        </p>
                        {product.totalLabels.map((item) => (
                          <RequirementItemRowCompact
                            key={`combined-label-${item.itemId}`}
                            item={item}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
            {/* Variant Breakdown */}
            {product.variants.length > 1 && (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-semibold text-sm">Variant Breakdown</h4>
                {product.variants.map((variant) => (
                  <VariantCard key={variant.variantId} variant={variant} />
                ))}
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

interface VariantCardProps {
  variant: VariantRequirements;
}

function VariantCard({ variant }: VariantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems =
    variant.materials.length + variant.packaging.length + variant.labels.length;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-3 space-y-2">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between hover:bg-accent/50 p-2 rounded transition-colors">
            <div className="flex items-center gap-2 flex-1 text-left">
              <div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{variant.variantName}</p>
                <p className="text-xs text-muted-foreground">
                  {totalItems} items
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">
                ₹{variant.totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 pl-6 pt-2">
          {variant.materials.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                🧪 Materials ({variant.materials.length})
              </p>
              {variant.materials.map((item) => (
                <RequirementItemRowCompact
                  key={`variant-material-${item.itemId}`}
                  item={item}
                />
              ))}
            </div>
          )}

          {variant.packaging.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                📦 Packaging ({variant.packaging.length})
              </p>
              {variant.packaging.map((item) => (
                <RequirementItemRowCompact
                  key={`variant-packaging-${item.itemId}`}
                  item={item}
                />
              ))}
            </div>
          )}

          {variant.labels.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                🏷️ Labels ({variant.labels.length})
              </p>
              {variant.labels.map((item) => (
                <RequirementItemRowCompact
                  key={`variant-label-${item.itemId}`}
                  item={item}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
