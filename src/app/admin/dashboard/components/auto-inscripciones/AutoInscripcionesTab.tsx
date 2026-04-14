'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Curso } from '@/types';
import { useAutoInscripciones, AutoInscripcion } from '../../hooks/useAutoInscripciones';
import { AnimatedSkeleton } from '@/app/admin/dashboard/components/animations/AnimatedSkeleton';
import { formatDateTime } from '@/lib/utils';

interface AutoInscripcionesTabProps {
  cursos: Curso[];
  clientColor?: string | null;
}

export function AutoInscripcionesTab({ cursos, clientColor }: AutoInscripcionesTabProps) {
  const [selectedCursoId, setSelectedCursoId] = useState<string>('all');
  const { autoInscripciones, isLoading, refresh, confirmarInscripcion, isConfirmando } = useAutoInscripciones(selectedCursoId === 'all' ? '' : selectedCursoId);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por curso (opcional)
            </label>
            <Select
              value={selectedCursoId}
              onValueChange={setSelectedCursoId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id.toString()}>
                    {curso.nombre} (Ed. {curso.edicionActual})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={refresh}
            variant="outline"
            className="mt-5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>¿Qué son las auto-inscripciones?</strong>
            <p className="mt-1">
              Son personas que no estaban inscritas en el curso pero registraron asistencia.
              El sistema las inscribió automáticamente para permitir el registro.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader style={{ backgroundColor: clientColor || '#f8fafc' }}>
            <TableRow>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">DNI</TableHead>
              <TableHead className="text-white">Curso</TableHead>
              <TableHead className="text-white">Edición</TableHead>
              <TableHead className="text-white">Hora</TableHead>
              <TableHead className="text-white">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4">
                  <AnimatedSkeleton rows={3} cols={5} />
                </TableCell>
              </TableRow>
            ) : autoInscripciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg">No hay auto-inscripciones</span>
                    <span className="text-sm text-gray-400">
                      Las auto-inscripciones aparecerán cuando alguien registre asistencia
                      sin estar previamente inscrito en el curso
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              autoInscripciones.map((inscripcion: AutoInscripcion) => (
                <TableRow key={inscripcion.id}>
                  <TableCell className="font-medium">
                    {inscripcion.personaNombre}
                  </TableCell>
                  <TableCell>{inscripcion.personaDni}</TableCell>
                  <TableCell>{inscripcion.cursoNombre}</TableCell>
                  <TableCell>{inscripcion.edicion}</TableCell>
                  <TableCell>{formatDateTime(inscripcion.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => confirmarInscripcion(inscripcion.id)}
                      disabled={isConfirmando}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isConfirmando ? 'Confirmando...' : 'Confirmar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {!isLoading && autoInscripciones.length > 0 && (
        <div className="text-sm text-gray-500">
          Total de auto-inscripciones hoy: <strong>{autoInscripciones.length}</strong>
        </div>
      )}
    </div>
  );
}
