// src/app/inventory/components/inventory-alerts-list.tsx
"use client";

import {
  useInventoryAlerts,
  useInventoryItemsWithDetails,
  useResolveAlert,
  useMarkAlertAsRead,
} from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getSeverityIcon,
  getSeverityBadge,
} from "@/app/inventory/utils/inventory-utils";

export function InventoryAlertsList() {
  const alerts = useInventoryAlerts();
  const items = useInventoryItemsWithDetails();
  const resolveAlert = useResolveAlert();
  const markAsRead = useMarkAlertAsRead();

  if (!alerts || !items) {
    return <div>Loading...</div>;
  }

  const getItemDetails = (inventoryItemId: string) => {
    return items.find((i) => i.id === inventoryItemId);
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      toast.success("Alert resolved");
    } catch (error) {
      toast.error("Failed to resolve alert");
      console.error(error);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead(alertId);
    } catch (error) {
      console.error(error);
    }
  };

  // Group by severity
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">All Clear!</h3>
        <p className="text-sm text-muted-foreground">
          No active alerts at the moment
        </p>
      </div>
    );
  }

  const renderAlertGroup = (
    title: string,
    alertsList: typeof alerts,
    icon: React.ReactNode
  ) => {
    if (alertsList.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">
            {title} ({alertsList.length})
          </h3>
        </div>

        <div className="space-y-2">
          {alertsList.map((alert) => {
            const item = getItemDetails(alert.inventoryItemId);

            return (
              <Card
                key={alert.id}
                className={`card-enhanced py-2 ${
                  alert.isRead === 0 ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <CardContent className="px-4 py-2">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            {alert.message}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(alert.createdAt),
                                "MMM dd, h:mm a"
                              )}
                            </span>
                            {getSeverityBadge(alert.severity)}
                            <Badge variant="outline" className="text-xs">
                              {alert.alertType}
                            </Badge>
                            {alert.isRead === 0 && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-right gap-2">
                          {alert.isRead === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="h-8 gap-1 mr-2"
                            >
                              <Check className="h-3 w-3" />
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            className="h-8 gap-1"
                          >
                            <X className="h-3 w-3" />
                            Resolve
                          </Button>
                        </div>
                      </div>

                      {item && (
                        <div className="mt-2 p-2 rounded bg-muted/30 border border-border/30">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Item:{" "}
                            </span>
                            <span className="font-medium">{item.itemName}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Current:{" "}
                            </span>
                            <span className="font-medium">
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-muted-foreground mx-2">
                              /
                            </span>
                            <span className="text-muted-foreground">Min: </span>
                            <span>
                              {item.minStockLevel} {item.unit}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Alerts</h2>
          <div className="text-sm text-muted-foreground">
            {alerts.length} active alerts
          </div>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {renderAlertGroup(
              "Critical",
              criticalAlerts,
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            {renderAlertGroup(
              "Warnings",
              warningAlerts,
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            {renderAlertGroup(
              "Information",
              infoAlerts,
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
