import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import io from 'socket.io-client';
import { Order } from './use-orders';

// Define query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  detail: (date: string) => [...dashboardKeys.stats(), date] as const,
};

interface DashboardStats {
  todayRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  todayAverageOrder: number;
}

// Interface for date-based stats
interface DateStats extends DashboardStats {
  date: string;
}

export function useDashboardStats() {
  const queryClient = useQueryClient();

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost', {
      withCredentials: true,
    });

    socket.on('newOrder', () => {
      // Invalidate dashboard stats queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // Query to fetch current stats
  const useCurrentStats = () =>
    useQuery<DashboardStats>({
      queryKey: dashboardKeys.stats(),
      queryFn: async () => {
        const { data: orders } = await axios.get<Order[]>('/api/orders', {
          withCredentials: true,
        });

        // Calculate completed orders
        const completedOrders = orders.filter(order => 
          order.status === 'completed'
        ).length;

        // Calculate pending and confirmed orders
        const pendingOrders = orders.filter(order => 
          order.status === 'pending'
        ).length;

        const confirmedOrders = orders.filter(order => 
          order.status === 'confirmed'
        ).length;

        // Calculate revenue only from completed and confirmed orders
        const todayRevenue = orders
          .filter(order => ['completed', 'confirmed'].includes(order.status))
          .reduce((sum, order) => sum + order.total_amount, 0);

        // Calculate average order value
        const relevantOrdersCount = completedOrders + confirmedOrders;
        const todayAverageOrder = relevantOrdersCount > 0 ? todayRevenue / relevantOrdersCount : 0;

        const stats: DashboardStats = {
          todayRevenue,
          completedOrders,
          pendingOrders,
          confirmedOrders,
          todayAverageOrder,
        };

        return stats;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Query to fetch stats for a specific date
  const useStatsByDate = (date?: string) =>
    useQuery<DateStats>({
      queryKey: dashboardKeys.detail(date || 'all'),
      queryFn: async () => {
        const { data: orders } = await axios.get<Order[]>('/api/orders', {
          withCredentials: true,
        });
        
        // Filter orders by date if a date is provided
        const relevantOrders = date 
          ? orders.filter(order => order.createdAt.toString().startsWith(date))
          : orders;

        // Calculate completed orders
        const completedOrders = relevantOrders.filter(order => 
          order.status === 'completed'
        ).length;

        // Calculate pending and confirmed orders
        const pendingOrders = relevantOrders.filter(order => 
          order.status === 'pending'
        ).length;

        const confirmedOrders = relevantOrders.filter(order => 
          order.status === 'confirmed'
        ).length;

        // Calculate revenue only from completed and confirmed orders
        const todayRevenue = relevantOrders
          .filter(order => ['completed', 'confirmed'].includes(order.status))
          .reduce((sum, order) => sum + order.total_amount, 0);

        // Calculate average order value
        const relevantOrdersCount = completedOrders + confirmedOrders;
        const todayAverageOrder = relevantOrdersCount > 0 ? todayRevenue / relevantOrdersCount : 0;

        const stats: DateStats = {
          date: date || 'all',
          todayRevenue,
          completedOrders,
          pendingOrders,
          confirmedOrders,
          todayAverageOrder,
        };

        return stats;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Export queries and any future mutations
  return {
    useCurrentStats,
    useStatsByDate,
  };
}