'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AsistenciasResponse {
  data: any[];
  meta: {
    total: number;
    totalPages: number;
  };
}

export function useAsistencias(
  filterCurso: string,
  filterDNI: string,
  filterFecha: string,
  page: number,
  pageSize: number
) {
  const { data: asistenciasData, isLoading: isLoadingAsistencias } = useQuery<AsistenciasResponse>({
    queryKey: ['asistencias', filterCurso, filterDNI, filterFecha, page, pageSize],
    queryFn: async () => {
      let url = `/asistencia/admin?page=${page}&limit=${pageSize}`;
      if (filterCurso) url += `&cursoId=${filterCurso}`;
      if (filterDNI) url += `&dni=${filterDNI}`;
      if (filterFecha) url += `&fecha=${filterFecha}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!filterCurso,
  });

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
