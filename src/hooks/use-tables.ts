import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Table, TableStatus } from '@/interfaces/table';
import { categoryKeys } from './use-categories';

// Define query keys
export const tableKeys = {
  all: ['tables'] as const,
  lists: () => [...tableKeys.all, 'list'] as const,
  list: (filters: string) => [...tableKeys.lists(), { filters }] as const,
  details: () => [...tableKeys.all, 'detail'] as const,
  detail: (id: string) => [...tableKeys.details(), id] as const,
};

// Hook for tables-related queries
export function useTables() {
  const queryClient = useQueryClient();

  // Query to fetch all tables for a store
  const useAllTables = () => 
    useQuery<Table[]>({
      queryKey: tableKeys.lists(),
      queryFn: async () => {
        const { data } = await axios.get<Table[]>('/api/tables');
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Query to fetch a single table by ID
  const useTableById = (id: string) => 
    useQuery({
      queryKey: tableKeys.detail(id),
      queryFn: async () => {
        const { data } = await axios.get<Table>(`/api/tables/${id}`);
        return data;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Create a new table mutation
  const createTableMutation = useMutation({
    mutationFn: async (newTable: {
      number: string;
      capacity: number;
      section: string;
      status: TableStatus;
      storeId: string;
    }) => {
      const { data } = await axios.post<Table>('/api/tables', newTable);
      return data;
    },
    onSuccess: () => {
      // Invalidate tables list cache
      queryClient.invalidateQueries({
        queryKey: tableKeys.lists(),
      });
    },
  });

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: {
      id: string;
      number?: string;
      capacity?: number;
      section?: string;
      status?: TableStatus;
      storeId?: string;
    }) => {
      const { data } = await axios.put<Table>(`/api/tables/${id}`, updateData);
      return data;
    },
    onSuccess: (data) => {
      // Update the cache for this specific table
      queryClient.setQueryData(tableKeys.detail(data._id), data);
      // Invalidate the list to refetch with the updated table
      queryClient.invalidateQueries({
        queryKey: tableKeys.lists(),
      });
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/tables/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove the table from cache
      queryClient.removeQueries({
        queryKey: tableKeys.detail(id),
      });
      // Invalidate the list to refetch without the deleted table
      queryClient.invalidateQueries({
        queryKey: tableKeys.lists(),
      });
    },
  });

  return {
    useAllTables,
    useTableById,
    createTableMutation,
    updateTableMutation,
    deleteTableMutation,
  };
} 