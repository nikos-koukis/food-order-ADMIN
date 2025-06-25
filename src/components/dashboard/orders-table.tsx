import * as React from "react";
import { useOrders, Order } from '@/hooks/use-orders';
import { useTables } from '@/hooks/use-tables';
import { useAuth } from '@/providers/auth-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrdersTableProps {
  filterStatus: Array<Order['status']>;
  searchQuery: string;
  showActiveOnly: boolean;
  showToday?: boolean;
}

const statusColorMap: Record<Order['status'], BadgeProps['color']> = {
  pending: 'warning',
  confirmed: 'purple',
  completed: 'success',
  cancelled: 'destructive',
};

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'In Preparation',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function OrdersTable({ filterStatus, searchQuery, showActiveOnly, showToday = false }: OrdersTableProps) {
  const { useAllOrders, useUpdateOrderStatus } = useOrders();
  const { data: orders, isLoading } = useAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Helper: get order items count
  const getOrderItemsCount = (order: Order) => {
    return order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  };

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        status: newStatus,
      });
      toast.success(`Order status updated to ${statusLabels[newStatus]}`);
    } catch (_error) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders?.filter(order => {
    // Active only filter
    if (showActiveOnly) {
      if (!['pending', 'confirmed'].includes(order.status)) {
        return false;
      }
    }

    // Status filter
    if (filterStatus.length > 0 && !filterStatus.includes(order.status)) {
      return false;
    }

    // Today filter
    if (showToday) {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      if (orderDate.getDate() !== today.getDate() ||
          orderDate.getMonth() !== today.getMonth() ||
          orderDate.getFullYear() !== today.getFullYear()) {
        return false;
      }
    }

    // Search query filter
    return !searchQuery || 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
  }) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  // Mobile Card View
  const MobileOrderCard = ({ order }: { order: Order }) => (
    <Card 
      className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => toggleOrder(order._id)}
    >
      <CardContent className="pt-6">
        {/* First row: Name-Phone & Amount-Items */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow">
            <h3 className="font-medium">{order.customer_name}</h3>
            {order.customer_phone && (
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            )}
          </div>
          <div className="text-right ml-4">
            <span className="font-medium">€{order.total_amount.toFixed(2)}</span>
            <div className="text-xs text-muted-foreground mt-0.5">
              {getOrderItemsCount(order)} item{getOrderItemsCount(order) === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Second row: Time-Date & Table-Section */}
        <div className="flex justify-between items-start text-sm mb-4">
          <div className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Europe/Athens'
            })}
            <div className="text-xs text-muted-foreground mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'Europe/Athens'
              })}
            </div>
          </div>
          <div className="text-right">
            <span>Table {order.table_number}</span>
            {order.table_id?.section && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {order.table_id.section}
              </div>
            )}
          </div>
        </div>

        {/* Last row: Full-width Status badge */}
        <div className="w-full">
          <Select 
            value={order.status} 
            onValueChange={(value) => handleStatusChange(order._id, value as Order['status'])}
          >
            <SelectTrigger className="w-full">
              <Badge variant="soft" color={statusColorMap[order.status]} className="w-full justify-center py-1">
                {statusLabels[order.status]}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([status, label]) => (
                <SelectItem 
                  key={status} 
                  value={status}
                  disabled={order.status === status}
                >
                  <Badge variant="soft" color={statusColorMap[status as Order['status']]}> 
                    {label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {expandedOrders.has(order._id) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Order Details</h4>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menu_item_id.name}</span>
                    <span>€{(item.item_price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Desktop Table View
  const DesktopOrderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Table</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.map((order) => (
          <React.Fragment key={order._id}>
            <TableRow 
              className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
              onClick={() => toggleOrder(order._id)}
            >
              <TableCell>
                {expandedOrders.has(order._id) ? (
                  <ChevronUp className="h-4 w-4 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 dark:text-gray-400" />
                )}
              </TableCell>
              <TableCell>
                <div>
                  {order.customer_name}
                  {order.customer_phone && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.customer_phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  Table {order.table_number}
                  {order.table_id?.section && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.table_id.section}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  {new Date(order.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Europe/Athens'
                  })}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: 'Europe/Athens'
                    })}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select 
                  value={order.status} 
                  onValueChange={(value) => handleStatusChange(order._id, value as Order['status'])}
                >
                  <SelectTrigger className="px-2 border-none">
                    <Badge variant="soft" color={statusColorMap[order.status]} className="cursor-pointer rounded-sm py-1 px-2.5 w-28 justify-center">
                      {statusLabels[order.status]}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <SelectItem 
                        key={status} 
                        value={status}
                        disabled={order.status === status}
                      >
                        <Badge variant="soft" color={statusColorMap[status as Order['status']]} className="rounded-sm py-1 px-2.5">
                          {label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  €{order.total_amount.toFixed(2)}
                  <div className="text-xs text-muted-foreground mt-0.5 text-right">
                    {getOrderItemsCount(order)} item{getOrderItemsCount(order) === 1 ? '' : 's'}
                  </div>
                </div>
              </TableCell>
            </TableRow>
            {expandedOrders.has(order._id) && (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <div className="bg-muted/50 p-4">
                    <h4 className="font-medium mb-2">Order Details</h4>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div key={item._id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.menu_item_id.name}</span>
                            <span>€{(item.item_price * item.quantity).toFixed(2)}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
        {filteredOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No orders found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.map((order) => (
          <MobileOrderCard key={order._id} order={order} />
        ))}
        {filteredOrders.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No orders found
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <DesktopOrderTable />
      </div>
    </>
  );
}