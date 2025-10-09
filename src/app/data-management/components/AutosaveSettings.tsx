"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface AutosaveSettingsProps {
  autosaveEnabled: boolean;
  onToggleAutosave: () => void;
}

export function AutosaveSettings({
  autosaveEnabled,
  onToggleAutosave,
}: AutosaveSettingsProps) {
  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-secondary" />
          Autosave Settings
        </CardTitle>
        <CardDescription>
          Configure automatic data saving preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <h4 className="font-medium text-foreground">Enable Autosave</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically save your work every 2 seconds
                </p>
              </div>
              <Button
                variant={autosaveEnabled ? "default" : "outline"}
                onClick={onToggleAutosave}
                className={
                  autosaveEnabled ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                {autosaveEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="p-4 rounded-lg border bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">
                What gets saved automatically:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Product recipes and recipes</li>
                <li>• Production plans and schedules</li>
                <li>• Supplier information and contacts</li>
                <li>• Cost analysis and calculations</li>
                <li>• User preferences and settings</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Data Security
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All data is stored locally in your browser. Nothing is sent
                    to external servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Backup Recommendation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Export your data regularly to prevent loss when clearing
                    browser data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
