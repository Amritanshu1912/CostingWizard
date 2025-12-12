// src/app/inventory/components/alerts/alerts-card.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useAllInventoryAlerts } from "@/hooks/use-database-data";
import { useAllInventoryItemsWithDetails } from "@/hooks/inventory-hooks/use-inventory-computed";
import { getSeverityIcon } from "@/utils/inventory-utils";
import { format } from "date-fns";
import InventoryAlertsDialog from "./inventory-alerts-dialog";

interface AlertsCardProps {
  /** Number of alerts to show in preview (default: 10) */
  previewCount?: number;
}

/**
 * Card component displaying recent inventory alerts
 * Shows severity counts and preview of latest alerts
 */
export function InventoryAlertsCard({ previewCount = 10 }: AlertsCardProps) {
  const alerts = useAllInventoryAlerts();
  const items = useAllInventoryItemsWithDetails();

  // Loading state
  if (!alerts || !items) {
    return (
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-base">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const preview = alerts.slice(0, previewCount);
  const counts = (alerts || []).reduce(
    (acc, a) => {
      if (a.severity === "critical") acc.critical++;
      else if (a.severity === "warning") acc.warning++;
      else if (a.severity === "info") acc.info++;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 }
  );

  return (
    <Card className="card-enhanced gap-0 h-88">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{counts.critical}</Badge>
              <Badge variant="warning">{counts.warning}</Badge>
              <Badge variant="info">{counts.info}</Badge>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="cursor-pointer">
                See all
              </Button>
            </DialogTrigger>
            <InventoryAlertsDialog />
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 overflow-y-auto max-h-60">
          {preview.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No recent alerts
            </div>
          )}

          {preview.map((alert) => {
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/5"
              >
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {alert.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(alert.createdAt), "MMM dd, h:mm a")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default InventoryAlertsCard;
