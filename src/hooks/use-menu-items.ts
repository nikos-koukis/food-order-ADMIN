import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MenuItem, MenuItemResponse } from '@/interfaces/menu-item';

// Define query keys
export const menuItemKeys = {
  all: ['menu-items'] as const,
  lists: () => [...menuItemKeys.all, 'list'] as const,
  list: (filters: string) => [...menuItemKeys.lists(), { filters }] as const,
  details: () => [...menuItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuItemKeys.details(), id] as const,
};

// Hook for menu items-related queries
export function useMenuItems() {
  const queryClient = useQueryClient();

  // Query to fetch all menu items
  const useAllMenuItems = () => 
    useQuery<MenuItem[]>({
      queryKey: menuItemKeys.lists(),
      queryFn: async () => {
        const { data } = await axios.get<MenuItem[]>('/api/menu-items');
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Query to fetch a single menu item by ID
  const useMenuItemById = (id: string) => 
    useQuery({
      queryKey: menuItemKeys.detail(id),
      queryFn: async () => {
        const { data } = await axios.get<MenuItem>(`/api/menu-items/${id}`);
        return data;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Create a new menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axios.post<MenuItem>('/api/menu-items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: menuItemKeys.lists(),
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const id = formData.get('id') as string;
      const { data } = await axios.put<MenuItem>(`/api/menu-items/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (data) => {
      // Update the cache for this specific menu item
      queryClient.setQueryData(menuItemKeys.detail(data._id), data);
      // Invalidate the list to refetch with the updated menu item
      queryClient.invalidateQueries({
        queryKey: menuItemKeys.lists(),
      });
    },
  });

  // Update menu item availability mutation
  const updateMenuItemAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable, categoryId }: { id: string; isAvailable: boolean; categoryId: string }) => {
      const { data } = await axios.put<MenuItem>(`/api/menu-items/${id}`, { isAvailable, categoryId });
      return data;
    },
    onSuccess: (data) => {
      // Update the cache for this specific menu item
      queryClient.setQueryData(menuItemKeys.detail(data._id), data);
      // Invalidate the list to refetch with the updated menu item
      queryClient.invalidateQueries({
        queryKey: menuItemKeys.lists(),
      });
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/menu-items/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove the menu item from cache
      queryClient.removeQueries({
        queryKey: menuItemKeys.detail(id),
      });
      // Invalidate the list to refetch without the deleted menu item
      queryClient.invalidateQueries({
        queryKey: menuItemKeys.lists(),
      });
    },
  });

  return {
    useAllMenuItems,
    useMenuItemById,
    createMenuItemMutation,
    updateMenuItemMutation,
    updateMenuItemAvailabilityMutation,
    deleteMenuItemMutation,
  };
} 