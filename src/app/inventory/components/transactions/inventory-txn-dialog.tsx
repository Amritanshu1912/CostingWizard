// src/app/inventory/components/transactions/transaction-dialog.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGroupedTransactions,
  useAllInventoryItemsWithDetails,
} from "@/hooks/inventory-hooks/use-inventory-computed";
import type { InventoryTransaction } from "@/types/inventory-types";
import {
  formatDate,
  formatTransactionQuantity,
  getItemDetails,
  getTransactionColor,
  getTransactionTypeIcon,
  truncate,
} from "@/utils/inventory-utils";
import { format } from "date-fns";

/**
 * Full-page dialog showing all transactions grouped by date
 * Uses accordion for collapsible date groups
 */
export default function InventoryTransactionDialog() {
  const groupedTransactions = useGroupedTransactions();
  const items = useAllInventoryItemsWithDetails();

  return (
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>All Transactions</DialogTitle>
        <DialogDescription>
          Recent and historical transactions
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 overflow-auto max-h-[70vh]">
        {!groupedTransactions || groupedTransactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No transactions
          </div>
        ) : (
          <div className="rounded-md border">
            <Accordion
              type="multiple"
              defaultValue={[groupedTransactions[0][0]]}
            >
              {groupedTransactions.map(([date, transactions]) => {
                const displayLabel = formatDate(date, "long");
                const totalQty = transactions.reduce(
                  (sum, t) => sum + t.quantity,
                  0
                );

                return (
                  <AccordionItem key={date} value={date}>
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-sm font-medium">
                          {displayLabel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transactions.length} tx • {totalQty}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-0">
                      <div className="divide-y">
                        {transactions.map((txn: InventoryTransaction) => {
                          const itemInfo = getItemDetails(
                            txn.inventoryItemId,
                            items
                          );
                          const qtyLabel = formatTransactionQuantity(
                            txn.type,
                            txn.quantity
                          );
                          const qtyColor = getTransactionColor(txn.type);

                          return (
                            <div
                              key={txn.id}
                              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent/5"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                {/* Icon */}
                                <div className="mt-1 flex items-center justify-center h-9 w-9 rounded-md bg-muted/10">
                                  {getTransactionTypeIcon(txn.type)}
                                </div>

                                {/* Details */}
                                <div className="min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {txn.reason || itemInfo?.itemName || "Item"}
                                    {itemInfo?.supplierName && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({itemInfo.supplierName})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>{itemInfo?.itemName || "—"}</span>
                                    <span>•</span>
                                    <span>
                                      {format(
                                        new Date(txn.createdAt),
                                        "h:mm a"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Quantity and notes */}
                              <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                                <div
                                  className={`text-sm font-semibold ${qtyColor}`}
                                >
                                  {qtyLabel}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <span className="ml-2">{txn.unit}</span>
                                </div>
                                {txn.notes && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {truncate(txn.notes, 60)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
