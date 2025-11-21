// src/app/inventory/components/inventory-transactions-list.tsx
"use client";

import {
  useInventoryTransactions,
  useInventoryItemsWithDetails,
} from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, ArrowDown, RefreshCw, Calendar } from "lucide-react";
import { format } from "date-fns";

interface InventoryTransactionsListProps {
  itemId?: string;
}

export function InventoryTransactionsList({
  itemId,
}: InventoryTransactionsListProps) {
  const transactions = useInventoryTransactions(itemId);
  const items = useInventoryItemsWithDetails();

  if (!transactions) {
    return <div>Loading...</div>;
  }

  const getItemName = (inventoryItemId: string) => {
    return (
      items?.find((i) => i.id === inventoryItemId)?.itemName || "Unknown Item"
    );
  };

  const groupByDate = (txns: typeof transactions) => {
    const groups: Record<string, typeof transactions> = {};

    txns.forEach((txn) => {
      const date = format(new Date(txn.createdAt), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(txn);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const groupedTransactions = groupByDate(transactions);

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
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Stock In
          </Badge>
        );
      case "out":
        return (
          <Badge
            variant="default"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Stock Out
          </Badge>
        );
      case "adjustment":
        return <Badge variant="secondary">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">No Transactions Yet</h3>
        <p className="text-sm text-muted-foreground">
          {itemId
            ? "This item has no transaction history"
            : "Start adjusting stock to see transaction history"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="text-sm text-muted-foreground">
          {transactions.length} transactions
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {groupedTransactions.map(([date, txns]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                <div className="text-sm font-semibold">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </div>
                <div className="h-px flex-1 bg-border" />
                <div className="text-xs text-muted-foreground">
                  {txns.length} transactions
                </div>
              </div>

              <div className="space-y-2">
                {txns.map((txn) => (
                  <Card
                    key={txn.id}
                    className="card-enhanced hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(txn.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="font-semibold mb-1">
                                {!itemId && getItemName(txn.inventoryItemId)}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getTypeBadge(txn.type)}
                                <Badge variant="outline" className="text-xs">
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
    </div>
  );
}
