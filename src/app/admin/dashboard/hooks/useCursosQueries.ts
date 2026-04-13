'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Curso } from '@/types';

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

// Fetch active cursos (paginated)
export function useCursosActivosQuery(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['cursos', 'activos', page],
    queryFn: async () => {
      const response = await api.get(`/cursos/activos?page=${page}&limit=${limit}`);
      return response.data as PaginatedResponse<Curso>;
    },
  });
}

// Fetch historic cursos (paginated)
export function useCursosHistoricosQuery(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['cursos', 'historicos', page],
    queryFn: async () => {
      const response = await api.get(`/cursos/historicos?page=${page}&limit=${limit}`);
      return response.data as PaginatedResponse<Curso>;
    },
  });
}
