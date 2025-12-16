import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SortableTable } from "@/components/ui/sortable-table";
import type { PurchaseOrder } from "@/types/shared-types";
import type { Supplier } from "@/types/supplier-types";
import { Edit, Star, Trash2 } from "lucide-react";
import { SUPPLIER_MATERIALS } from "../../materials/components/materials-constants";
import { ORDER_STATUS_MAP } from "./procurement-constants";

interface SuppliersTableProps {
  suppliers: Supplier[];
  showIndex?: boolean;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
}

export function SuppliersTable({
  suppliers,
  showIndex = false,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  const columns = [
    {
      key: "name",
      label: "Supplier",
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "contact",
      label: "Contact",
      sortable: true,
      render: (value: any, row: Supplier) => (
        <div className="text-sm">
          <div>{row.contactPersons?.[0]?.name}</div>
          <div className="text-muted-foreground">
            {row.contactPersons?.[0]?.phone}
          </div>
        </div>
      ),
    },
    {
      key: "materials",
      label: "Materials",
      sortable: true,
      render: (value: any, row: Supplier) => {
        const count = (SUPPLIER_MATERIALS || []).filter(
          (m) => m.supplierId === row.id
        ).length;
        return `${count} items`;
      },
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "onTime",
      label: "On-time Delivery",
      sortable: true,
      render: (value: any, row: Supplier) => (
        <div className="flex items-center space-x-2">
          <Progress
            value={row.performance?.onTimeDelivery}
            className="w-16 h-2"
          />
          <span className="text-sm">{row.performance?.onTimeDelivery}%</span>
        </div>
      ),
    },
    {
      key: "quality",
      label: "Quality Score",
      sortable: true,
      render: (value: any, row: Supplier) => (
        <div className="flex items-center space-x-2">
          <Progress
            value={row.performance?.qualityScore}
            className="w-16 h-2"
          />
          <span className="text-sm">{row.performance?.qualityScore}%</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price Competitiveness",
      sortable: true,
      render: (value: any, row: Supplier) => (
        <div className="flex items-center space-x-2">
          <Progress
            value={row.performance?.priceCompetitiveness}
            className="w-16 h-2"
          />
          <span className="text-sm">
            {row.performance?.priceCompetitiveness}%
          </span>
        </div>
      ),
    },
    ...(onEdit || onDelete
      ? [
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (value: any, row: Supplier) => (
              <div className="flex space-x-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(row)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(row)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <SortableTable
      data={suppliers}
      columns={columns}
      className="table-enhanced"
      showSerialNumber={showIndex}
    />
  );
}

interface OrdersTableProps {
  orders: PurchaseOrder[];
  onEditOrder?: (order: PurchaseOrder) => void;
}

export function OrdersTable({ orders, onEditOrder }: OrdersTableProps) {
  const columns = [
    {
      key: "id",
      label: "Order ID",
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "supplierName",
      label: "Supplier",
      sortable: true,
    },
    {
      key: "items",
      label: "Items",
      sortable: true,
      render: (value: any[], _row: PurchaseOrder) => `${value.length} items`,
    },
    {
      key: "dateCreated",
      label: "Order Date",
      sortable: true,
    },
    {
      key: "deliveryDate",
      label: "Expected Delivery",
      sortable: true,
    },
    {
      key: "totalCost",
      label: "Total Value",
      sortable: true,
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const statusInfo =
          ORDER_STATUS_MAP[value as keyof typeof ORDER_STATUS_MAP];
        return (
          <Badge variant={statusInfo?.variant || "default"}>
            {statusInfo?.icon && <statusInfo.icon className="mr-1 h-4 w-4" />}
            {statusInfo?.label || value}
          </Badge>
        );
      },
    },
    ...(onEditOrder
      ? [
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (value: any, row: PurchaseOrder) => (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditOrder(row)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <SortableTable
      data={orders}
      columns={columns}
      className="table-enhanced"
      showSerialNumber={false}
    />
  );
}
