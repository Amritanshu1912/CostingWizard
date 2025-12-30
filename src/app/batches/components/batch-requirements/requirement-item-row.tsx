// components/batches/batch-requirements/requirement-item-row.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RequirementItem } from "@/types/batch-types";
import { cn } from "@/utils/shared-utils";
import { Building2, MoreVertical, ShoppingCart } from "lucide-react";
import { PriceDisplay } from "../../utils/price-display";
import { ShortageBadge } from "../../utils/shortage-badge";

interface RequirementItemRowProps {
  item: RequirementItem & { isLocked?: boolean };
  showSupplier?: boolean;
  variant?: "default" | "compact";
  onAddToCart?: (item: RequirementItem) => void;
  onViewDetails?: (item: RequirementItem) => void;
}

export function RequirementItemRow({
  item,
  showSupplier = true,
  variant = "default",
  onAddToCart,
  onViewDetails,
}: RequirementItemRowProps) {
  const hasShortage = item.shortage > 0;
  const hasInventoryTracking =
    item.available > 0 || item.shortage < item.required;

  if (variant === "compact") {
    return <RequirementItemRowCompact item={item} />;
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all hover:shadow-md",
        hasShortage
          ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
          : "border-border bg-card hover:bg-accent/50"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Status Indicator */}
        <div
          className={cn(
            "mt-1 h-2 w-2 rounded-full flex-shrink-0",
            hasShortage
              ? "bg-red-500"
              : hasInventoryTracking
                ? "bg-green-500"
                : "bg-yellow-500"
          )}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col w-48">
              <h4 className="font-semibold text-base truncate">
                {item.itemName}
              </h4>
              {showSupplier && (
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {item.supplierName}
                  </span>
                </div>
              )}
            </div>

            {/* Required Quantity */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Required</p>
              <p className="text-lg font-bold">
                {item.required.toFixed(2)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {item.unit}
                </span>
              </p>
            </div>

            {/* Available Stock */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Available</p>
              <p className="text-lg font-bold">
                {item.available.toFixed(2)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {item.unit}
                </span>
              </p>
            </div>

            {/* Unit Price */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Price/Unit</p>
              <PriceDisplay
                amount={item.unitPrice}
                isLocked={item.isLocked}
                showPerUnit
                unit={item.unit}
                size="md"
              />
              {item.tax > 0 && (
                <p className="text-xs text-muted-foreground">
                  +{item.tax}% tax
                </p>
              )}
            </div>

            {/* Total Cost */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
              <p className="text-lg font-bold text-primary">
                ₹{item.totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">incl. tax</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onAddToCart && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onAddToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={() => onViewDetails(item)}>
                      View Details
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Add to Inventory</DropdownMenuItem>
                  <DropdownMenuItem>Contact Supplier</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Shortage Badge */}
          {hasShortage && (
            <div className="flex items-center gap-2">
              <ShortageBadge
                required={item.required}
                available={item.available}
                shortage={item.shortage}
                unit={item.unit}
                variant="default"
              />
              {item.shortage > 0 && (
                <span className="text-sm text-muted-foreground">
                  Order cost: ₹
                  {(
                    item.shortage *
                    item.unitPrice *
                    (1 + item.tax / 100)
                  ).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RequirementItemRowCompactProps {
  item: RequirementItem & { isLocked?: boolean };
}

export function RequirementItemRowCompact({
  item,
}: RequirementItemRowCompactProps) {
  const hasShortage = item.shortage > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded text-sm hover:bg-accent/50 transition-colors",
        hasShortage && "bg-red-50/50 dark:bg-red-950/20"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full flex-shrink-0",
            hasShortage ? "bg-red-500" : "bg-green-500"
          )}
        />
        <span className="font-medium truncate">{item.itemName}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          {item.required.toFixed(2)} {item.unit}
        </span>
        {hasShortage && (
          <Badge
            variant="outline"
            className="text-xs bg-red-100 dark:bg-red-950"
          >
            -{item.shortage.toFixed(2)}
          </Badge>
        )}
        <PriceDisplay
          amount={item.totalCost}
          isLocked={item.isLocked}
          size="sm"
        />
      </div>
    </div>
  );
}
