'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Persona, Inscripcion } from '@/types';
import { toast } from 'sonner';

export function usePersonas(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: personas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const response = await api.get('/personas');
      const result = response.data.data || response.data;
      return Array.isArray(result) ? result : [];
    },
    enabled,
  });

  const createPersonaMutation = useMutation({
    mutationFn: async (data: {
      nombre: string;
      apellido: string;
      dni: string;
      cursoId?: number;
    }) => {
      const response = await api.post('/personas', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Persona creada correctamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear persona';
      toast.error(message);
    },
  });

  const updatePersonaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Persona> }) => {
      const response = await api.patch(`/personas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Persona actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      queryClient.invalidateQueries({ queryKey: ['persona'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar persona';
      toast.error(message);
    },
  });

  const deletePersonaMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/personas/${id}`);
    },
    onSuccess: () => {
      toast.success('Persona eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar persona';
      toast.error(message);
    },
  });

  return {
    personas,
    isLoadingPersonas,
    createPersonaMutation,
    updatePersonaMutation,
    deletePersonaMutation,
  };
}

export function usePersonaDetail(personaId: number | null) {
  const queryClient = useQueryClient();

  const { data: persona, isLoading: isLoadingPersona } = useQuery({
    queryKey: ['persona', personaId],
    queryFn: async () => {
      if (!personaId) return null;
      const response = await api.get(`/personas/${personaId}`);
      // El backend puede devolver { data: Persona } o directamente Persona
      const result = response.data.data || response.data;
      return result;
    },
    enabled: !!personaId,
  });

  const { data: inscripciones = [], isLoading: isLoadingInscripciones } = useQuery({
    queryKey: ['persona-inscripciones', personaId],
    queryFn: async () => {
      if (!personaId) return [];
      const response = await api.get(`/personas/${personaId}/inscripciones`);
      // El backend puede devolver { data: Inscripcion[] } o directamente Inscripcion[]
      const result = response.data.data || response.data;
      return Array.isArray(result) ? result : [];
    },
    enabled: !!personaId,
  });

  const inscribirMutation = useMutation({
    mutationFn: async ({ personaId, cursoId }: { personaId: number; cursoId: number }) => {
      const response = await api.post(`/personas/${personaId}/inscripciones`, { cursoId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Inscripción exitosa');
      queryClient.invalidateQueries({ queryKey: ['persona-inscripciones'] });
      queryClient.invalidateQueries({ queryKey: ['persona'] });
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al inscribir';
      toast.error(message);
    },
  });

  const desinscribirMutation = useMutation({
    mutationFn: async ({ personaId, cursoId }: { personaId: number; cursoId: number }) => {
      await api.delete(`/personas/${personaId}/inscripciones/${cursoId}`);
    },
    onSuccess: () => {
      toast.success('Desinscripción exitosa');
      queryClient.invalidateQueries({ queryKey: ['persona-inscripciones'] });
      queryClient.invalidateQueries({ queryKey: ['persona'] });
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al desinscribir';
      toast.error(message);
    },
  });

  const updatePersonaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Persona> }) => {
      const response = await api.patch(`/personas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Persona actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['persona'] });
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar persona';
      toast.error(message);
    },
  });

  const deletePersonaMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/personas/${id}`);
    },
    onSuccess: () => {
      toast.success('Persona eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar persona';
      toast.error(message);
    },
  });

  return {
    persona,
    inscripciones,
    isLoadingPersona,
    isLoadingInscripciones,
    inscribirMutation,
    desinscribirMutation,
    updatePersonaMutation,
    deletePersonaMutation,
  };
}
