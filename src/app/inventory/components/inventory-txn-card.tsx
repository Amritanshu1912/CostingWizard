// src/app/inventory/components/inventory-txn-card.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  useInventoryItemsWithDetails,
  useInventoryTransactions,
} from "@/hooks/use-inventory";
import type { InventoryTransaction } from "@/types/shared-types";
import { AlertTriangle, CheckCircle, ClockIcon } from "lucide-react";
import TransactionsDialog from "./inventory-txn-dialog";

interface TransactionHistoryCardProps {
  previewCount?: number;
}

export function TransactionHistoryCard({
  previewCount = 10,
}: TransactionHistoryCardProps) {
  const transactions = useInventoryTransactions();
  const items = useInventoryItemsWithDetails();

  const preview = (transactions || []).slice(0, previewCount);

  const getItemDetails = (id: string) => items?.find((i) => i.id === id);

  return (
    <Card className="card-enhanced gap-0 h-88">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm" className="cursor-pointer">
                  See all
                </Button>
              </DialogTrigger>
              <TransactionsDialog />
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 overflow-y-auto max-h-80">
        <div className="space-y-2">
          {preview.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No recent transactions
            </div>
          )}

          {preview.map((tx: InventoryTransaction) => {
            // Determine display values
            const qty = tx.quantity;
            const item = getItemDetails(tx.inventoryItemId);
            const itemName = item?.itemName || "Item";
            const supplierName = item?.supplierName || "";
            const typeIcon =
              tx.type === "in" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : tx.type === "out" ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <ClockIcon className="h-4 w-4 text-amber-500" />
              );
            const isIn = tx.type === "in";
            const isOut = tx.type === "out";
            const qtyClass = isIn
              ? "text-green-600"
              : isOut
                ? "text-destructive"
                : "text-amber-600";
            const label = isIn ? `+${qty}` : isOut ? `-${qty}` : `${qty}`;

            return (
              <div
                key={tx.id}
                className="flex items-start gap-1 px-2 py-2 rounded-md hover:bg-accent/5 transition-colors"
              >
                <div className="flex-none flex items-center justify-center h-9 w-9 rounded-md bg-muted/10">
                  {typeIcon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-medium truncate">
                        <span className="align-middle">{itemName}</span>
                        {supplierName && (
                          <span className="text-xs text-muted-foreground ml-1">{`(${supplierName})`}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right text-sm font-semibold flex items-center justify-end gap-1">
                      <div className={qtyClass}>{label}</div>
                      <span className="whitespace-nowrap">{tx.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-1 text-xs text-muted-foreground">
                    <div className="min-w-0 truncate">{tx.reason}</div>
                    <div className="flex-shrink-0 whitespace-nowrap">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(new Date(tx.createdAt))}
                    </div>
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

export default TransactionHistoryCard;
