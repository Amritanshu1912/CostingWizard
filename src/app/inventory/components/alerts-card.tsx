"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  useInventoryAlerts,
  useInventoryItemsWithDetails,
} from "@/hooks/use-inventory";
import { format } from "date-fns";
import { getSeverityIcon } from "@/app/inventory/utils/inventory-utils";
import AlertsDialog from "./alerts-dialog";
import { Badge } from "@/components/ui/badge";

interface AlertsCardProps {
  previewCount?: number;
}

export function AlertsCard({ previewCount = 10 }: AlertsCardProps) {
  const alerts = useInventoryAlerts();
  const items = useInventoryItemsWithDetails();

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
  const counts = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };

  const getItemName = (id: string) => items.find((i) => i.id === id)?.itemName;

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
            <AlertsDialog />
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

          {preview.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/5"
            >
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(a.severity)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{a.message}</div>
                <div className="text-xs text-muted-foreground">
                  {getItemName(a.inventoryItemId)
                    ? `${getItemName(a.inventoryItemId)} • `
                    : ""}
                  {format(new Date(a.createdAt), "MMM dd, h:mm a")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AlertsCard;
