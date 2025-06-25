import { TableSettings } from '@/interfaces/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Define query keys
export const tableSettingsKeys = {
  all: ['table-settings'] as const,
  store: (storeId: string) => [...tableSettingsKeys.all, storeId] as const,
  sections: (storeId: string) => [...tableSettingsKeys.store(storeId), 'settings', 'sections'] as const,
};

// Hook for table settings-related queries
export function useTableSettings(storeId: string) {
  const queryClient = useQueryClient();

  // Query to fetch all sections
  const useSections = () => 
    useQuery<string[]>({
      queryKey: tableSettingsKeys.sections(storeId),
      queryFn: async () => {
        const { data } = await axios.get<TableSettings>(`/api/table-settings/${storeId}`);
        return data.settings.sections;
      },
      staleTime: 1000// * 60 * 5, // 5 minutes
    });

  // Add new section mutation
  const addSectionMutation = useMutation({
    mutationFn: async (section: {
      sections: string[];
    }) => {
      const { data } = await axios.post<TableSettings>(`/api/table-settings/${storeId}/sections`, section);
      return data;
    },
    onSuccess: (data) => {
      // Update the sections cache
      queryClient.setQueryData(tableSettingsKeys.sections(storeId), data.settings.sections);
    },
  });

  // Create first section mutation
  const createFirstSectionMutation = useMutation({
    mutationFn: async (section: {
      storeId: string;
      sections: string[];
    }) => {
      const { data } = await axios.post<TableSettings>(`/api/table-settings`, section);
      return data;
    },
    onSuccess: (data) => {
      // Update the sections cache
      queryClient.setQueryData(tableSettingsKeys.sections(storeId), data.settings.sections);
    },
  });

  return {
    useSections,
    addSectionMutation,
    createFirstSectionMutation,
  };
}