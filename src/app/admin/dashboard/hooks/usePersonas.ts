'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Persona } from '@/types';
import { toast } from 'sonner';

export function usePersonas(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: personas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const response = await api.get('/personas');
      return response.data;
    },
    enabled,
  });

  const updatePersonaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Persona> }) => {
      const response = await api.patch(`/personas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Persona actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar persona');
    },
  });

  return {
    personas,
    isLoadingPersonas,
    updatePersonaMutation,
  };
}
