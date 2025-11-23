"use client";

import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  useInventoryTransactions,
  useInventoryItemsWithDetails,
} from "@/hooks/use-inventory";
import type { InventoryTransaction } from "@/lib/types";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

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
          <div className="divide-y rounded-md border">
            {txs.map((tx) => {
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
                          {format(new Date(tx.createdAt), "MMM dd, h:mm a")}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                        {tx.reference && <Badge>{tx.reference}</Badge>}
                        <span>
                          Stock: {tx.stockBefore} → {tx.stockAfter}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                    <div
                      className={`text-sm font-semibold ${
                        tx.quantity > 0 ? "text-green-600" : "text-destructive"
                      }`}
                    >
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </div>
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
        )}
      </div>
    </DialogContent>
  );
}
