'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Curso } from '@/types';
import { toast } from 'sonner';

export function useCursos() {
  const queryClient = useQueryClient();

  // Legacy query - fetch all cursos
  const { data: cursos = [], isLoading: isLoadingCursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const response = await api.get('/cursos');
      return response.data;
    },
  });

  const createCursoMutation = useMutation({
    mutationFn: async (data: {
      nombre: string;
      lat?: number;
      lng?: number;
      radio: number;
      ubicacionFavoritaId?: number;
      guardarUbicacion?: boolean;
      nombreUbicacion?: string;
    }) => {
      const response = await api.post('/cursos', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Curso creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['ubicaciones-favoritas'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear curso');
    },
  });

  const updateCursoMutation = useMutation({
    mutationFn: async (data: { id: number; nombre: string; lat?: number; lng?: number; radio: number }) => {
      const response = await api.put(`/cursos/${data.id}`, {
        nombre: data.nombre,
        lat: data.lat,
        lng: data.lng,
        radio: data.radio,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Curso actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar curso');
    },
  });

  const deleteCursoMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cursos/${id}`);
    },
    onSuccess: () => {
      toast.success('Curso eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar curso');
    },
  });

  // Close curso (soft-delete)
  const cerrarCursoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/cursos/${id}/cerrar`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Curso cerrado. El QR ha sido eliminado.');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cerrar curso');
    },
  });

  // Reopen curso (new edition)
  const reabrirCursoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/cursos/${id}/reabrir`);
      return response.data as Curso;
    },
    onSuccess: (data) => {
      toast.success(`Curso reabierto. Nueva Edición ${data.edicionActual} creada.`);
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al reabrir curso');
    },
  });

  const regenerateQRMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/cursos/${id}/qr`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('QR regenerado correctamente');
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al regenerar QR');
    },
  });

  return {
    cursos,
    isLoadingCursos,
    createCursoMutation,
    updateCursoMutation,
    deleteCursoMutation,
    cerrarCursoMutation,
    reabrirCursoMutation,
    regenerateQRMutation,
  };
}
