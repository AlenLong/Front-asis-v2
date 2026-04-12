'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { AnimatedSkeleton } from '@/app/admin/dashboard/components/animations/AnimatedSkeleton';

interface AsistenciasTableProps {
  asistencias: any[];
  isLoading: boolean;
  hasCursoSelected: boolean;
  clientColor?: string | null;
}

export function AsistenciasTable({
  asistencias,
  isLoading,
  hasCursoSelected,
  clientColor,
}: AsistenciasTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <Table>
        <TableHeader style={{ backgroundColor: clientColor || '#f8fafc' }}>
          <TableRow>
            <TableHead className="text-white">Nombre</TableHead>
            <TableHead className="text-white">Apellido</TableHead>
            <TableHead className="text-white">DNI</TableHead>
            <TableHead className="text-white">Curso</TableHead>
            <TableHead className="text-white">Fecha y Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4">
                <AnimatedSkeleton rows={3} cols={5} />
              </TableCell>
            </TableRow>
          ) : !hasCursoSelected ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">Seleccione un curso para ver las asistencias</span>
                  <span className="text-sm text-gray-400">Use el filtro de arriba para elegir un curso</span>
                </div>
              </TableCell>
            </TableRow>
          ) : asistencias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No hay asistencias registradas para este curso
              </TableCell>
            </TableRow>
          ) : (
            asistencias.map((asistencia: any) => (
              <TableRow key={asistencia.id}>
                <TableCell>{asistencia.persona?.split(' ')[0] || asistencia.persona}</TableCell>
                <TableCell>{asistencia.persona?.split(' ').slice(1).join(' ') || '-'}</TableCell>
                <TableCell>{asistencia.dni}</TableCell>
                <TableCell>{asistencia.curso}</TableCell>
                <TableCell>{formatDateTime(asistencia.fecha)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
