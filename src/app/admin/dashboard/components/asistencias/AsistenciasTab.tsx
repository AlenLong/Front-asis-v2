'use client';

import { useState, useEffect } from 'react';
import { AsistenciasFilters } from './AsistenciasFilters';
import { AsistenciasTable } from './AsistenciasTable';
import { AsistenciasPagination } from './AsistenciasPagination';
import { useAsistencias } from '../../hooks/useAsistencias';
import { Curso } from '@/types';

interface AsistenciasTabProps {
  cursos: Curso[];
  clientColor?: string | null;
}

export function AsistenciasTab({ cursos, clientColor }: AsistenciasTabProps) {
  const [filterCurso, setFilterCurso] = useState<string>('');
  const [filterBuscar, setFilterBuscar] = useState<string>('');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [filterCurso, filterBuscar, filterFecha, pageSize]);

  const {
    asistencias,
    isLoadingAsistencias,
    totalAsistencias,
    totalPages,
    handleExport,
  } = useAsistencias(filterCurso, filterBuscar, filterFecha, page, pageSize);

  const handleReset = () => {
    setFilterCurso('');
    setFilterBuscar('');
    setFilterFecha('');
    setPage(1);
  };

  const handleExportClick = () => {
    handleExport(filterCurso, filterFecha);
  };

  return (
    <div className="space-y-4">
      <AsistenciasFilters
        cursos={cursos}
        filterCurso={filterCurso}
        setFilterCurso={setFilterCurso}
        filterBuscar={filterBuscar}
        setFilterBuscar={setFilterBuscar}
        filterFecha={filterFecha}
        setFilterFecha={setFilterFecha}
        onExport={handleExportClick}
        onReset={handleReset}
      />

      <AsistenciasTable
        asistencias={asistencias}
        isLoading={isLoadingAsistencias}
        hasCursoSelected={!!filterCurso}
        clientColor={clientColor}
      />

      <AsistenciasPagination
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalAsistencias={totalAsistencias}
        totalPages={totalPages}
      />
    </div>
  );
}
