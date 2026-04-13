'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface AsistenciasResponse {
  data: any[];
  meta: {
    total: number;
    totalPages: number;
  };
}

export function useAsistencias(
  filterCurso: string,
  filterBuscar: string,
  filterFecha: string,
  page: number,
  pageSize: number
) {
  // Debounce the search term to avoid API calls on every keystroke
  const [debouncedBuscar, setDebouncedBuscar] = useState(filterBuscar);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBuscar(filterBuscar);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [filterBuscar]);

  const { data: asistenciasData, isLoading: isLoadingAsistencias, error } = useQuery<AsistenciasResponse>({
    queryKey: ['asistencias', filterCurso, debouncedBuscar, filterFecha, page, pageSize],
    queryFn: async () => {
      let url = `/asistencia/admin?page=${page}&limit=${pageSize}`;
      if (filterCurso) url += `&cursoId=${filterCurso}`;
      if (debouncedBuscar) url += `&buscar=${encodeURIComponent(debouncedBuscar)}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!filterCurso,
  });

  // Show error toast if search fails
  useEffect(() => {
    if (error) {
      toast.error('Error al buscar. El parámetro de búsqueda puede no estar soportado por el backend.');
    }
  }, [error]);

  const asistencias = asistenciasData?.data || [];
  const totalAsistencias = asistenciasData?.meta?.total || 0;
  const totalPages = asistenciasData?.meta?.totalPages || 1;

  const handleExport = async (filterCurso: string, filterFecha: string) => {
    try {
      const params = new URLSearchParams();
      if (filterCurso) params.append('cursoId', filterCurso);
      if (filterFecha) params.append('fecha', filterFecha);
      const url = `/asistencia/export/excel?${params.toString()}`;

      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Excel descargado correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar Excel');
    }
  };

  return {
    asistencias,
    isLoadingAsistencias,
    totalAsistencias,
    totalPages,
    handleExport,
  };
}
