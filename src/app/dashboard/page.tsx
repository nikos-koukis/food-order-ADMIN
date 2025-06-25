'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, TrendingUp, Divide, ActivitySquare, LibraryBig, LayoutGrid, TableProperties, Users } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useState, useMemo } from 'react';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order } from '@/hooks/use-orders';
import { useMenuItems } from '@/hooks/use-menu-items';
import { useCategories } from '@/hooks/use-categories';
import { useTables } from '@/hooks/use-tables';
import { TableStatus } from '@/interfaces/table';

export default function Dashboard() {
  const { user } = useAuth();
  const { useStatsByDate } = useDashboardStats();
  const { useAllMenuItems } = useMenuItems();
  const { useAllCategories } = useCategories();
  const { useAllTables } = useTables();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderHistoryFilter, setOrderHistoryFilter] = useState<Array<Order['status']>>(['completed', 'cancelled']);
  const router = useRouter();

  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  const { data: stats } = useStatsByDate();
  const { data: menuItems, isLoading: menuItemsLoading } = useAllMenuItems();
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const { data: tables, isLoading: tablesLoading } = useAllTables();

  if (!user) return <p>Loading user...</p>;

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setOrderHistoryFilter(['completed', 'cancelled']);
    } else {
      setOrderHistoryFilter([value as Order['status']]);
    }
  };

  const activeOrders = (stats?.pendingOrders ?? 0) + (stats?.confirmedOrders ?? 0);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome!</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">€{stats?.todayRevenue.toFixed(2) ?? '0.00'}</div>
            <p className="text-xs text-gray-600">From confirmed & completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Average Order Value</CardTitle>
            <Divide className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              €{stats?.todayAverageOrder.toFixed(2) ?? '0.00'}
            </div>
            <p className="text-xs text-gray-600">Confirmed & completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-lime-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lime-600">{stats?.completedOrders ?? 0}</div>
            <p className="text-xs text-gray-600">Successfully delivered today</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => router.push('/dashboard/live-orders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Live Orders</CardTitle>
            <ActivitySquare className={`h-4 w-4 text-orange-600 ${
              activeOrders > 0 ? 'animate-ping' : ''
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeOrders}</div>
            <p className="text-xs text-gray-600">Orders awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Menu Items</CardTitle>
            <LibraryBig className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {menuItemsLoading ? (
              <div className="text-2xl font-bold text-purple-600">...</div>
            ) : (
              <div className="text-2xl font-bold text-purple-600">{menuItems?.length ?? 0}</div>
            )}
            <p className="text-xs text-gray-600">All menu items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Categories</CardTitle>
            <LayoutGrid className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="text-2xl font-bold text-indigo-600">...</div>
            ) : (
              <div className="text-2xl font-bold text-indigo-600">{categories?.length ?? 0}</div>
            )}
            <p className="text-xs text-gray-600">Menu categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Available Tables</CardTitle>
            <TableProperties className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {tablesLoading ? (
              <div className="text-2xl font-bold text-emerald-600">...</div>
            ) : (
              <div className="text-2xl font-bold text-emerald-600">
                {tables?.filter(table => table.status === 'available').length ?? 0}
              </div>
            )}
            <p className="text-xs text-gray-600">Currently available tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Tables</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {tablesLoading ? (
              <div className="text-2xl font-bold text-blue-600">...</div>
            ) : (
              <div className="text-2xl font-bold text-blue-600">{tables?.length ?? 0}</div>
            )}
            <p className="text-xs text-gray-600">All restaurant tables</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-col w-full md:flex-row items-center justify-between space-y-0 gap-4">
            <div className="w-full md:w-auto">
              <Tabs 
                value={orderHistoryFilter.length > 1 ? 'all' : orderHistoryFilter[0]}
                onValueChange={handleStatusChange}
                defaultValue="completed"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-8 w-full border border-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <OrdersTable 
              filterStatus={orderHistoryFilter}
              searchQuery={searchQuery}
              showActiveOnly={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}