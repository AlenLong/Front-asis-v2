'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UbicacionFavorita } from '@/types';
import { toast } from 'sonner';

export function useUbicacionesFavoritas() {
  const queryClient = useQueryClient();

  const { data: ubicaciones = [], isLoading: isLoadingUbicaciones } = useQuery({
    queryKey: ['ubicaciones-favoritas'],
    queryFn: async () => {
      const response = await api.get('/ubicaciones-favoritas');
      return response.data;
    },
  });

  const deleteUbicacionMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ubicaciones-favoritas/${id}`);
    },
    onSuccess: () => {
      toast.success('Ubicación eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['ubicaciones-favoritas'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar ubicación');
    },
  });

  return {
    ubicaciones,
    isLoadingUbicaciones,
    deleteUbicacionMutation,
  };
}
