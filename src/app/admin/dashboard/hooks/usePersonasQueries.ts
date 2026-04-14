'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Persona } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Fetch all personas with search
export function usePersonasQuery(search: string = '', page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['personas', 'all', search, page],
    queryFn: async () => {
      let url = `/personas?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      return response.data as PaginatedResponse<Persona>;
    },
  });
}

// Fetch active personas (with enrollments in active courses)
export function usePersonasActivasQuery(search: string = '', page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['personas', 'activas', search, page],
    queryFn: async () => {
      let url = `/personas/activas?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      return response.data as PaginatedResponse<Persona>;
    },
  });
}

// Fetch historic personas
export function usePersonasHistoricoQuery(search: string = '', page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['personas', 'historico', search, page],
    queryFn: async () => {
      let url = `/personas/historico?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      return response.data as PaginatedResponse<Persona>;
    },
  });
}
