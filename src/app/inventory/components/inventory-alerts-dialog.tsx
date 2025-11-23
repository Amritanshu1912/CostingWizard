"use client";

import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useInventoryAlerts,
  useResolveAlert,
  useMarkAlertAsRead,
  useInventoryItemsWithDetails,
} from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSeverityIcon } from "@/app/inventory/utils/inventory-utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface AlertsDialogProps {}

export default function AlertsDialog(_: AlertsDialogProps) {
  const alerts = useInventoryAlerts();
  const items = useInventoryItemsWithDetails();
  const resolveAlert = useResolveAlert();
  const markAsRead = useMarkAlertAsRead();

  // Compute alert type counts safely
  const alertTypeCounts = (alerts || []).reduce((acc, alert) => {
    acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getItemName = (id?: string) =>
    id ? items?.find((i) => i.id === id)?.itemName : undefined;

  const [severityFilter, setSeverityFilter] = useState<
    "all" | "critical" | "warning" | "info"
  >("all");

  const filteredAlerts = (alerts || []).filter((a) => {
    if (severityFilter === "all") return true;
    return a.severity === severityFilter;
  });

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      toast.success("Alert resolved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to resolve alert");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark as read");
    }
  };

  return (
    <DialogContent className="min-w-4xl max-w-7xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>All Alerts</DialogTitle>
        <DialogDescription>Active and historical alerts</DialogDescription>
      </DialogHeader>
      {/* Alert type counts summary + quick filters */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {Object.keys(alertTypeCounts).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(alertTypeCounts).map(([type, count]) => {
              const classes: Record<string, string> = {
                "out-of-stock": "bg-red-100 text-red-800 border-red-300",
                "low-stock": "bg-yellow-100 text-yellow-800 border-yellow-300",
                overstock: "bg-blue-100 text-blue-800 border-blue-300",
                "expiring-soon": "bg-amber-100 text-amber-800 border-amber-300",
              };
              return (
                <Badge
                  key={type}
                  variant="secondary"
                  className={`text-xs px-2 py-1 ${classes[type] || "bg-muted"}`}
                >
                  {type}: <span className="font-bold ml-1">{count}</span>
                </Badge>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={severityFilter === "all" ? "default" : "outline"}
            onClick={() => setSeverityFilter("all")}
            className="h-8"
          >
            All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSeverityFilter("critical")}
            className={`h-8 ${
              severityFilter === "critical" ? "bg-accent/5" : ""
            }`}
          >
            Critical
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSeverityFilter("warning")}
            className={`h-8 ${
              severityFilter === "warning" ? "bg-accent/5" : ""
            }`}
          >
            Warning
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSeverityFilter("info")}
            className={`h-8 ${severityFilter === "info" ? "bg-accent/5" : ""}`}
          >
            Info
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-auto max-h-[70vh]">
        {!filteredAlerts || filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No alerts
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {filteredAlerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent/5"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-1">{getSeverityIcon(a.severity)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium truncate">
                        {a.message}
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const type = a.alertType;
                          const classes: Record<string, string> = {
                            "out-of-stock":
                              "bg-red-100 text-red-800 border-red-300",
                            "low-stock":
                              "bg-yellow-100 text-yellow-800 border-yellow-300",
                            overstock:
                              "bg-blue-100 text-blue-800 border-blue-300",
                            "expiring-soon":
                              "bg-amber-100 text-amber-800 border-amber-300",
                          };
                          return (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                classes[type] || "bg-muted"
                              }`}
                            >
                              {type}
                            </Badge>
                          );
                        })()}
                        {a.isRead === 0 && <Badge>New</Badge>}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getItemName(a.inventoryItemId)
                        ? `${getItemName(a.inventoryItemId)} • `
                        : ""}
                      {format(new Date(a.createdAt), "MMM dd, h:mm a")}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {a.isRead === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(a.id)}
                      className="h-8 gap-1"
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(a.id)}
                    className="h-8 gap-1"
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
}
