import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Category, CategoryResponse } from '@/interfaces/category';

// Define query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Hook for categories-related queries
export function useCategories() {
  const queryClient = useQueryClient();

  // Query to fetch all categories
  const useAllCategories = () => 
    useQuery<Category[]>({
      queryKey: categoryKeys.lists(),
      queryFn: async () => {
        const { data } = await axios.get<Category[]>('/api/categories');
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Query to fetch a single category by ID
  const useCategoryById = (id: string) => 
    useQuery({
      queryKey: categoryKeys.detail(id),
      queryFn: async () => {
        const { data } = await axios.get<Category>(`/api/categories/${id}`);
        return data;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Create a new category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (newCategory: {
      name: string;
      description?: string;
      available?: boolean;
    }) => {
      const { data } = await axios.post<Category>('/api/categories', newCategory);
      return data;
    },
    onSuccess: () => {
      // Invalidate categories list cache
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { 
      id: string;
      name: string;
      description?: string;
      available: boolean
    }) => {
      const { data } = await axios.put<Category>(`/api/categories/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
      // Update the cache for this specific category
      queryClient.setQueryData(categoryKeys.detail(data._id), data);
      // Invalidate the list to refetch with the updated category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/categories/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove the category from cache
      queryClient.removeQueries({
        queryKey: categoryKeys.detail(id),
      });
      // Invalidate the list to refetch without the deleted category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });

  return {
    useAllCategories,
    useCategoryById,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}