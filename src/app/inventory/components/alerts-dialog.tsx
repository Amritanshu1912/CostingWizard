"use client";

import React from "react";
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
      {/* Alert type counts summary */}
      {Object.keys(alertTypeCounts).length > 0 && (
        <div className="flex gap-4 mb-4">
          {Object.entries(alertTypeCounts).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground"
            >
              {type}: <span className="font-bold">{count}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-auto max-h-[70vh]">
        {!alerts || alerts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No alerts
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {alerts.map((a) => (
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
                        <Badge variant="secondary">{a.alertType}</Badge>
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
