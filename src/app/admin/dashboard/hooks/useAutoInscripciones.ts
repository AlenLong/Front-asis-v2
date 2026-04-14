'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface AutoInscripcion {
  id: number;
  personaNombre: string;
  personaDni: string;
  cursoNombre: string;
  edicion: number;
  createdAt: string;
}

interface AutoInscripcionesResponse {
  data: AutoInscripcion[];
}

export function useAutoInscripciones(cursoId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<AutoInscripcion[]>({
    queryKey: ['auto-inscripciones', cursoId],
    queryFn: async () => {
      let url = '/asistencia/auto-inscripciones';
      if (cursoId) url += `?cursoId=${cursoId}`;
      const response = await api.get(url);
      // Handle both formats: direct array or { data: array }
      const result = response.data;
      return Array.isArray(result) ? result : result?.data || [];
    },
    enabled: true, // Always fetch, even without filter
  });

  if (error) {
    toast.error('Error al cargar auto-inscripciones del día');
  }

  const autoInscripciones = data || [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['auto-inscripciones', cursoId] });
    toast.success('Lista actualizada');
  };

  // Mutation para confirmar auto-inscripción (convertir a regular)
  const confirmarMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/asistencia/auto-inscripciones/${id}/confirmar`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Persona confirmada exitosamente');
      // Refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['auto-inscripciones', cursoId] });
    },
    onError: () => {
      toast.error('Error al confirmar la inscripción');
    },
  });

  const confirmarInscripcion = (id: number) => {
    confirmarMutation.mutate(id);
  };

  return {
    autoInscripciones,
    isLoading,
    refresh,
    refetch,
    confirmarInscripcion,
    isConfirmando: confirmarMutation.isPending,
  };
}
