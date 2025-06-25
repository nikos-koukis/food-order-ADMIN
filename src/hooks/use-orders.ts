import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import io from 'socket.io-client';

// Define query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: string) => [...orderKeys.lists(), { filters }] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

// Interfaces based on backend schema
export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface OrderItem {
  _id: string;
  order_id: string;
  menu_item_id: MenuItem;
  quantity: number;
  item_price: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableDetails {
  _id: string;
  number: string;
  section: string;
}

export interface Order {
  _id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  table_id: TableDetails;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'dine_in' | 'take_away' | 'delivery';
  viva_order_id?: string;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  table_number: string;
  items?: OrderItem[];
}

// Hook for orders-related queries
export function useOrders() {
  const queryClient = useQueryClient();

  // Mutation to update order status
  const useUpdateOrderStatus = () => {
    return useMutation({
      mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
        const { data } = await axios.put(`/api/orders/${orderId}/status`, { status }, {
          withCredentials: true,
        });
        return data;
      },
      onSuccess: (data, variables) => {
        // Update the orders list cache
        queryClient.setQueryData<Order[]>(orderKeys.lists(), (oldData) => {
          if (!oldData) return [];
          return oldData.map(order => 
            order._id === variables.orderId 
              ? { ...order, status: variables.status }
              : order
          );
        });
      },
    });
  };

  // Query to fetch all orders
  const useAllOrders = () =>
    useQuery({
      queryKey: orderKeys.lists(),
      queryFn: async () => {
        const { data } = await axios.get<Order[]>('/api/orders', {
          withCredentials: true,
        });
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Query to fetch a single order with details
  const useOrderDetails = (id: string) =>
    useQuery({
      queryKey: orderKeys.detail(id),
      queryFn: async () => {
        const { data } = await axios.get<Order>(`/api/orders/${id}`, {
          withCredentials: true,
        });
        return data;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('newOrder', async (newOrder: Order) => {
      console.log('Received new order via WebSocket:', newOrder);
      // Update the orders list cache
      queryClient.setQueryData<Order[]>(orderKeys.lists(), (oldData) => {
        if (!oldData) return [newOrder];
        // Check if the order already exists in the cache
        const orderExists = oldData.some(order => order._id === newOrder._id);
        if (orderExists) return oldData;
        return [newOrder, ...oldData];
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return {
    useAllOrders,
    useOrderDetails,
    useUpdateOrderStatus,
  };
}