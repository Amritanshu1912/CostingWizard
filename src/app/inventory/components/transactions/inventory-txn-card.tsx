// src/app/inventory/components/transactions/transaction-card.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useAllInventoryItemsWithDetails } from "@/hooks/inventory-hooks/use-inventory-computed";
import { useInventoryTransactions } from "@/hooks/inventory-hooks/use-inventory-data";
import type { InventoryTransaction } from "@/types/inventory-types";
import {
  formatTransactionQuantity,
  getItemDetails,
  getTransactionColor,
  getTransactionTypeIcon,
} from "@/utils/inventory-utils";
import { formatDate } from "@/utils/formatting-utils";
import InventoryTransactionDialog from "./inventory-txn-dialog";

interface TransactionCardProps {
  /** Number of transactions to show in preview (default: 10) */
  previewCount?: number;
}

/**
 * Card component displaying recent inventory transactions
 * Shows transaction history with quick preview
 */
export function InventoryTransactionCard({
  previewCount = 10,
}: TransactionCardProps) {
  const transactions = useInventoryTransactions();
  const items = useAllInventoryItemsWithDetails();

  const preview = (transactions || []).slice(0, previewCount);

  return (
    <Card className="card-enhanced gap-0 h-88">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="cursor-pointer">
                See all
              </Button>
            </DialogTrigger>
            <InventoryTransactionDialog />
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-2 overflow-y-auto max-h-80">
        <div className="space-y-2">
          {preview.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No recent transactions
            </div>
          )}

          {preview.map((txn: InventoryTransaction) => {
            const itemInfo = getItemDetails(txn.inventoryItemId, items);
            const qtyLabel = formatTransactionQuantity(txn.type, txn.quantity);
            const qtyColor = getTransactionColor(txn.type);

            return (
              <div
                key={txn.id}
                className="flex items-start gap-1 px-2 py-2 rounded-md hover:bg-accent/5 transition-colors"
              >
                {/* Icon */}
                <div className="flex-none flex items-center justify-center h-9 w-9 rounded-md bg-muted/10">
                  {getTransactionTypeIcon(txn.type)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Item name and quantity */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-medium truncate">
                        <span className="align-middle">
                          {itemInfo?.itemName || "Item"}
                        </span>
                        {itemInfo?.supplierName && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({itemInfo.supplierName})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right text-sm font-semibold flex items-center justify-end gap-1">
                      <div className={qtyColor}>{qtyLabel}</div>
                      <span className="whitespace-nowrap">{txn.unit}</span>
                    </div>
                  </div>

                  {/* Reason and date */}
                  <div className="flex items-center justify-between gap-4 mt-1 text-xs text-muted-foreground">
                    <div className="min-w-0 truncate">{txn.reason}</div>
                    <div className="flex-shrink-0 whitespace-nowrap">
                      {formatDate(txn.createdAt, "datetime")}
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

export default InventoryTransactionCard;
