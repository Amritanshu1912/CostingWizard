import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { SUPPLIER_MATERIALS } from "@/lib/constants";
import type { Supplier, PurchaseOrder } from "@/lib/types";
import {
  ORDER_STATUS_MAP,
  SUPPLIER_COLUMNS,
  PURCHASE_ORDER_COLUMNS,
} from "./procurement-constants";

interface SuppliersTableProps {
  suppliers: Supplier[];
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {SUPPLIER_COLUMNS.map((col) => (
            <TableHead key={col.key}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{supplier.contactPerson}</div>
                <div className="text-muted-foreground">{supplier.phone}</div>
              </div>
            </TableCell>
            <TableCell>
              {
                (SUPPLIER_MATERIALS || []).filter(
                  (m) => m.supplierId === supplier.id
                ).length
              }{" "}
              items
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>{supplier.rating}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Progress
                  value={supplier.performance?.onTimeDelivery}
                  className="w-16 h-2"
                />
                <span className="text-sm">
                  {supplier.performance?.onTimeDelivery}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Progress
                  value={supplier.performance?.qualityScore}
                  className="w-16 h-2"
                />
                <span className="text-sm">
                  {supplier.performance?.qualityScore}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Progress
                  value={supplier.performance?.priceCompetitiveness}
                  className="w-16 h-2"
                />
                <span className="text-sm">
                  {supplier.performance?.priceCompetitiveness}%
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface OrdersTableProps {
  orders: PurchaseOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {PURCHASE_ORDER_COLUMNS.map((col) => (
            <TableHead key={col.key}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const statusInfo = ORDER_STATUS_MAP[order.status];
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.supplierName}</TableCell>
              <TableCell>{order.items.length} items</TableCell>
              <TableCell>{order.dateCreated}</TableCell>
              <TableCell>{order.deliveryDate}</TableCell>
              <TableCell>₹{order.totalCost.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={statusInfo?.variant || "default"}>
                  {statusInfo?.icon && (
                    <statusInfo.icon className="mr-1 h-4 w-4" />
                  )}
                  {statusInfo?.label || order.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
