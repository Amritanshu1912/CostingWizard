// components/batches/batch-requirements/supplier-wise-requirements.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SupplierRequirement } from "@/lib/types";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { ShortageBadge } from "../../utils/shortage-badge";
import { RequirementItemRowCompact } from "./requirement-item-row";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface SupplierWiseRequirementsProps {
  suppliers: SupplierRequirement[];
  onGeneratePO?: (supplierId: string) => void;
  onContactSupplier?: (supplierId: string) => void;
}

export function SupplierWiseRequirements({
  suppliers,
  onGeneratePO,
  onContactSupplier,
}: SupplierWiseRequirementsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <Building2 className="h-5 w-5" />
              Requirements by Supplier
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.supplierId}
                  supplier={supplier}
                  onGeneratePO={onGeneratePO}
                  onContactSupplier={onContactSupplier}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface SupplierCardProps {
  supplier: SupplierRequirement;
  onGeneratePO?: (supplierId: string) => void;
  onContactSupplier?: (supplierId: string) => void;
}

function SupplierCard({
  supplier,
  onGeneratePO,
  onContactSupplier,
}: SupplierCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems =
    supplier.materials.length +
    supplier.packaging.length +
    supplier.labels.length;

  const shortageCount = [
    ...supplier.materials,
    ...supplier.packaging,
    ...supplier.labels,
  ].filter((item) => item.shortage > 0).length;

  const hasShortages = shortageCount > 0;

  return (
    <Card
      className={
        hasShortages
          ? "border-red-200 dark:border-red-900"
          : "border-border hover:border-primary/50 transition-colors"
      }
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {supplier.supplierName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              ₹{supplier.totalCost.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              total cost incl. tax
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2">
          {supplier.materials.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">🧪 Materials</span>
              <span className="font-medium">{supplier.materials.length}</span>
            </div>
          )}
          {supplier.packaging.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">📦 Packaging</span>
              <span className="font-medium">{supplier.packaging.length}</span>
            </div>
          )}
          {supplier.labels.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">🏷️ Labels</span>
              <span className="font-medium">{supplier.labels.length}</span>
            </div>
          )}
        </div>

        {/* Shortage Warning */}
        {hasShortages && (
          <Badge
            variant="outline"
            className="w-full justify-center bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
          >
            ⚠️ {shortageCount} item{shortageCount !== 1 ? "s" : ""} short
          </Badge>
        )}

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {supplier.materials.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Materials
                </p>
                {supplier.materials.map((item) => (
                  <div
                    key={`${item.itemId}-${item.supplierId}`}
                    className="space-y-1"
                  >
                    <RequirementItemRowCompact item={item} />
                    {item.shortage > 0 && (
                      <div className="pl-4">
                        <ShortageBadge
                          required={item.required}
                          available={item.available}
                          shortage={item.shortage}
                          unit={item.unit}
                          variant="subtle"
                          showIcon={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {supplier.packaging.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Packaging
                </p>

                {supplier.packaging.map((item) => (
                  <div
                    key={`${item.itemId}-${item.supplierId}`}
                    className="space-y-1"
                  >
                    <RequirementItemRowCompact item={item} />
                    {item.shortage > 0 && (
                      <div className="pl-4">
                        <ShortageBadge
                          required={item.required}
                          available={item.available}
                          shortage={item.shortage}
                          unit={item.unit}
                          variant="subtle"
                          showIcon={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {supplier.labels.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Labels
                </p>
                {supplier.labels.map((item) => (
                  <div
                    key={`${item.itemId}-${item.supplierId}`}
                    className="space-y-1"
                  >
                    <RequirementItemRowCompact item={item} />
                    {item.shortage > 0 && (
                      <div className="pl-4">
                        <ShortageBadge
                          required={item.required}
                          available={item.available}
                          shortage={item.shortage}
                          unit={item.unit}
                          variant="subtle"
                          showIcon={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onGeneratePO?.(supplier.supplierId)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  PO
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Generate Purchase Order (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onContactSupplier?.(supplier.supplierId)}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Contact
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Email supplier with requirements (Coming Soon)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
