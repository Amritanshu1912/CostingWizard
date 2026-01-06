// src/app/orders/components/order-status-timeline.tsx
"use client";

import type { PurchaseOrder, OrderStatus } from "@/types/order-types";
import { getOrderStatusConfig } from "@/utils/order-utils";
import { cn } from "@/utils/shared-utils";

interface OrderStatusTimelineProps {
  order: PurchaseOrder;
}

/** Timeline steps in order */
const TIMELINE_STEPS: OrderStatus[] = [
  "draft",
  "submitted",
  "confirmed",
  "in-transit",
  "delivered",
];

/**
 * Order status timeline component
 * Shows visual progress through order statuses
 */
export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div>
      <h3 className="font-semibold mb-4">Order Status</h3>

      {isCancelled ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            This order has been cancelled
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-muted" />

          {/* Steps */}
          <div className="space-y-6">
            {TIMELINE_STEPS.map((status, index) => {
              const config = getOrderStatusConfig(status);
              const Icon = config.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={status} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p
                      className={cn(
                        "font-medium",
                        isCurrent && "text-primary",
                        !isCompleted && "text-muted-foreground"
                      )}
                    >
                      {config.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Current status
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
