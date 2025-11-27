// src/app/inventory/components/inventory-txn-dialog.tsx
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
  useInventoryItemsWithDetails,
  useInventoryTransactions,
} from "@/hooks/use-inventory";
import type { InventoryTransaction } from "@/lib/types";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

const typeIcon = (t: InventoryTransaction["type"]) => {
  switch (t) {
    case "in":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "out":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-amber-500" />;
  }
};

function truncate(s?: string, n = 80) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function TransactionsDialog() {
  const txs = useInventoryTransactions();
  const items = useInventoryItemsWithDetails();

  const getItemDetails = (id?: string) =>
    id ? items?.find((i) => i.id === id) : undefined;

  // Group transactions by date (YYYY-MM-DD)
  const groups = (txs || []).reduce((acc: Record<string, any[]>, tx) => {
    const day = format(new Date(tx.createdAt), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {});
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));

  return (
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>All Transactions</DialogTitle>
        <DialogDescription>
          Recent and historical transactions
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 overflow-auto max-h-[70vh]">
        {!txs || txs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No transactions
          </div>
        ) : (
          <div className="rounded-md border">
            <Accordion
              type="multiple"
              defaultValue={sortedGroupKeys.slice(0, 1)}
            >
              {sortedGroupKeys.map((day) => {
                const group = groups[day];
                const displayLabel = format(new Date(day), "MMM dd, yyyy");
                const totalQty = group.reduce(
                  (s: number, t: any) => s + t.quantity,
                  0
                );
                return (
                  <AccordionItem key={day} value={day}>
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-sm font-medium">
                          {displayLabel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {group.length} tx • {totalQty}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <div className="divide-y">
                        {group.map((tx) => {
                          const item = getItemDetails(tx.inventoryItemId);
                          const itemName = item?.itemName || "Item";
                          const supplierName = item?.supplierName || "";
                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent/5"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="mt-1 flex items-center justify-center h-9 w-9 rounded-md bg-muted/10">
                                  {typeIcon(tx.type)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {tx.reason || itemName}
                                    {supplierName && (
                                      <span className="text-xs text-muted-foreground ml-1">{`(${supplierName})`}</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>{itemName || "—"}</span>
                                    <span>•</span>
                                    <span>
                                      {format(new Date(tx.createdAt), "h:mm a")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                                {(() => {
                                  const qty = tx.quantity;
                                  const isIn = tx.type === "in";
                                  const isOut = tx.type === "out";
                                  const qtyClass = isIn
                                    ? "text-green-600"
                                    : isOut
                                      ? "text-destructive"
                                      : "text-amber-600";
                                  const qtyLabel = isIn
                                    ? `+${qty}`
                                    : isOut
                                      ? `-${qty}`
                                      : `${qty}`;
                                  return (
                                    <div
                                      className={`text-sm font-semibold ${qtyClass}`}
                                    >
                                      {qtyLabel}
                                    </div>
                                  );
                                })()}
                                <div className="text-xs text-muted-foreground">
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {tx.unit}
                                  </span>
                                </div>
                                {tx.notes && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {truncate(tx.notes, 60)}
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
