"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  getTransactionTypeIcon,
  getTransactionTypeBadge,
} from "@/app/inventory/utils/inventory-utils";
import {
  useInventoryTransactions,
  useGroupedTransactions,
} from "@/hooks/use-inventory";
import { useInventoryItemsWithDetails } from "@/hooks/use-inventory";

export function InventoryTransactionsList() {
  const transactions = useInventoryTransactions();
  const groupedTransactions = useGroupedTransactions();
  const items = useInventoryItemsWithDetails();

  const getItemName = (id: string) =>
    items?.find((i) => i.id === id)?.itemName || id;

  if (!transactions) {
    return <div>Loading...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">No Transactions Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start adjusting stock to see transaction history
        </p>
      </div>
    );
  }

  if (!groupedTransactions) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
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
                            {getTransactionTypeIcon(txn.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <div className="font-semibold mb-1">
                                  {getItemName(txn.inventoryItemId)}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getTransactionTypeBadge(txn.type)}
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
    </Card>
  );
}
