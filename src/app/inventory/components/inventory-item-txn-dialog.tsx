// src/app/inventory/components/inventory-item-txn-dialog.tsx
"use client";

import {
  getTransactionTypeBadge,
  getTransactionTypeIcon,
} from "@/app/inventory/utils/inventory-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupedTransactions } from "@/hooks/use-inventory";
import type { InventoryItemWithDetails } from "@/types/shared-types";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface ItemTransactionsDialogProps {
  item: InventoryItemWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemTransactionsDialog({
  item,
  open,
  onOpenChange,
}: ItemTransactionsDialogProps) {
  const groupedTransactions = useGroupedTransactions(item.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
          <div className="text-sm text-muted-foreground pt-2">
            <div className="font-medium">{item.itemName}</div>
            <div>{item.supplierName}</div>
          </div>
        </DialogHeader>

        {!groupedTransactions || groupedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {groupedTransactions.map(([date, txns = []]) => (
                <div key={date}>
                  <div className="text-sm font-semibold mb-3">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="space-y-2">
                    {txns.map((txn) => (
                      <Card key={txn.id} className="card-enhanced">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {getTransactionTypeIcon(txn.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 gap-2">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    {getTransactionTypeBadge(txn.type)}
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {txn.reason}
                                    </Badge>
                                    {txn.reference && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-mono"
                                      >
                                        {txn.reference}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{txn.stockBefore}</span>
                                    <span>→</span>
                                    <span className="font-semibold text-foreground">
                                      {txn.stockAfter}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div
                                    className={`text-lg font-bold mb-1 ${
                                      txn.type === "in"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {txn.type === "in" ? "+" : "-"}
                                    {txn.quantity} {item.unit}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Intl.DateTimeFormat("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    }).format(new Date(txn.createdAt))}
                                  </div>
                                </div>
                              </div>

                              {txn.notes && (
                                <div className="mt-2 pt-2 border-t border-border/50">
                                  <p className="text-sm text-muted-foreground italic">
                                    {txn.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
