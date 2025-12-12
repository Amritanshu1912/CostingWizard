// src/app/inventory/components/alerts/alerts-dialog.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAllInventoryAlerts } from "@/hooks/use-database-data";
import {
  useMarkAlertAsRead,
  useResolveAlert,
} from "@/hooks/inventory-hooks/use-inventory-mutations";
import { getAlertTypeClasses, getSeverityIcon } from "@/utils/inventory-utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useState } from "react";

/**
 * Full-page dialog showing all inventory alerts
 * Includes filtering by severity and bulk actions
 */
export default function InventoryAlertsDialog() {
  const alerts = useAllInventoryAlerts();
  const resolveAlert = useResolveAlert();
  const markAsRead = useMarkAlertAsRead();

  const [severityFilter, setSeverityFilter] = useState<
    "all" | "critical" | "warning" | "info"
  >("all");

  /**
   * Filter alerts by severity.
   */
  const filterAlerts = useCallback(
    (list: any[]) => {
      if (severityFilter === "all") return list;
      return list.filter((a) => a.severity === severityFilter);
    },
    [severityFilter]
  );
  // Calculate alert type counts
  const alertTypeCounts = (alerts || []).reduce<Record<string, number>>(
    (acc, alert) => {
      acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
      return acc;
    },
    {}
  );

  // Apply severity filter
  const filteredAlerts = filterAlerts(alerts || []);

  /**
   * Handle resolving a single alert
   */
  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      toast.success("Alert resolved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to resolve alert");
    }
  };

  /**
   * Handle marking alert as read
   */
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
        {/* Type counts */}
        {Object.keys(alertTypeCounts).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(alertTypeCounts).map(([type, count]) => (
              <Badge
                key={type}
                variant="secondary"
                className={`text-xs px-2 py-1 ${getAlertTypeClasses(type)}`}
              >
                {type}: <span className="font-bold ml-1">{count}</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Severity filters */}
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
            className={`h-8 ${severityFilter === "critical" ? "bg-accent/5" : ""}`}
          >
            Critical
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSeverityFilter("warning")}
            className={`h-8 ${severityFilter === "warning" ? "bg-accent/5" : ""}`}
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

      {/* Alerts list */}
      <div className="mt-4 overflow-auto max-h-[70vh]">
        {!filteredAlerts || filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No alerts
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {filteredAlerts.map((alert) => {
              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent/5"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate">
                          {alert.message}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getAlertTypeClasses(alert.alertType)}`}
                          >
                            {alert.alertType}
                          </Badge>
                          {alert.isRead === 0 && <Badge>New</Badge>}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(alert.createdAt), "MMM dd, h:mm a")}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    {alert.isRead === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="h-8 gap-1"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="h-8 gap-1"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DialogContent>
  );
}
