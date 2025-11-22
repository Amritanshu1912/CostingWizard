// src/app/inventory/components/inventory-item-transactions-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInventoryTransactions } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, ArrowDown, RefreshCw, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { InventoryItemWithDetails } from "@/lib/types";

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
  const transactions = useInventoryTransactions(item.id);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "out":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "in":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Stock In
          </Badge>
        );
      case "out":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Stock Out
          </Badge>
        );
      case "adjustment":
        return <Badge variant="secondary">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const groupByDate = (txns: typeof transactions) => {
    if (!txns) return [];
    const groups: Record<string, typeof transactions> = {};
    txns.forEach((txn) => {
      const date = format(new Date(txn.createdAt), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(txn);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const groupedTransactions = groupByDate(transactions);

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

        {!transactions || transactions.length === 0 ? (
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
                              {getTypeIcon(txn.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {getTypeBadge(txn.type)}
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
                                </div>
                                <div className="text-right">
                                  <div
                                    className={`text-lg font-bold ${
                                      txn.type === "in"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {txn.type === "in" ? "+" : "-"}
                                    {txn.quantity}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(txn.createdAt), "h:mm a")}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{txn.stockBefore}</span>
                                <span>→</span>
                                <span className="font-semibold text-foreground">
                                  {txn.stockAfter}
                                </span>
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
