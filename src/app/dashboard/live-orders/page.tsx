'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClipboardList, Clock, Search, Settings, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { useState } from "react";
import { Order } from "@/hooks/use-orders";
import { useOrders } from "@/hooks/use-orders";

export default function LiveOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<Array<Order['status']>>(['pending', 'confirmed']);
  const { useAllOrders } = useOrders();
  const { data: orders } = useAllOrders();

  const pendingOrders = orders?.filter(order => order.status === 'pending').length ?? 0;
  const confirmedOrders = orders?.filter(order => order.status === 'confirmed').length ?? 0;

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setOrderStatusFilter(['pending', 'confirmed']);
    } else {
      setOrderStatusFilter([value as Order['status']]);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Live Orders</h2>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-gray-600">Orders waiting for confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">In Preparation</CardTitle>
            <ClipboardList className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">{confirmedOrders}</div>
            <p className="text-xs text-gray-600">Orders being prepared</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col w-full md:flex-row items-center justify-between space-y-0 gap-4">
          <div className="w-full md:w-auto">
            <Tabs 
              value={orderStatusFilter.length > 1 ? 'all' : orderStatusFilter[0]}
              onValueChange={handleStatusChange}
              defaultValue="pending"
            >
              <TabsList className="w-full inline-flex items-center justify-start overflow-x-auto space-x-1">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">In Preparation</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <OrdersTable
            filterStatus={orderStatusFilter}
            searchQuery={searchQuery}
            showActiveOnly={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}