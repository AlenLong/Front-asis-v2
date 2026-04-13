'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { RefreshCw, Users, CheckCircle, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Curso } from '@/types';
import { Usuario } from '@/types';
import { useState } from 'react';

interface CursosHistoricosTableProps {
  cursos: Curso[];
  isLoading: boolean;
  user: Usuario | null;
  onReabrir: (id: number) => void;
  isReopening: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CursosHistoricosTableWithPaginationProps extends CursosHistoricosTableProps {
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function CursosHistoricosTable({
  cursos: cursosProp,
  isLoading,
  user,
  onReabrir,
  isReopening,
  meta,
  onPageChange,
}: CursosHistoricosTableWithPaginationProps) {
  // Ensure cursos is always an array
  const cursos = Array.isArray(cursosProp) ? cursosProp : [];

  const [reopeningId, setReopeningId] = useState<number | null>(null);

  const handleReabrir = (id: number) => {
    onReabrir(id);
    setReopeningId(null);
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= (meta?.totalPages || 1)) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader style={{ backgroundColor: user?.cliente?.color || '#f8fafc' }}>
            <TableRow>
              <TableHead className="text-white">Curso</TableHead>
              <TableHead className="text-white">Edición</TableHead>
              <TableHead className="text-white">Fecha Cierre</TableHead>
              <TableHead className="text-white text-center">Inscriptos</TableHead>
              <TableHead className="text-white text-center">Asistencias</TableHead>
              <TableHead className="text-white w-[140px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : !cursos || cursos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No hay cursos en el histórico
                </TableCell>
              </TableRow>
            ) : (
              cursos.map((curso: Curso) => (
                <TableRow key={curso.id} className="opacity-90">
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <p>{curso.nombre}</p>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Finalizado
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Edición {curso.edicionActual}</Badge>
                  </TableCell>
                  <TableCell>
                    {curso.fechaFin && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <History className="h-3 w-3" />
                        {new Date(curso.fechaFin).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{curso._count?.inscripciones || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{curso._count?.asistencias || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={100}>
                      <Dialog open={reopeningId === curso.id} onOpenChange={(open) => setReopeningId(open ? curso.id : null)}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="w-full"
                                style={{ backgroundColor: user?.cliente?.color || undefined }}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Reabrir
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="border-2 border-white/20"
                            style={{ backgroundColor: user?.cliente?.color || '#0f172a' }}
                          >
                            <p className="text-white font-medium">Crear Edición {curso.edicionActual + 1}</p>
                          </TooltipContent>
                        </Tooltip>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reabrir {curso.nombre}</DialogTitle>
                            <DialogDescription>
                              Se creará la{' '}
                              <strong>Edición {curso.edicionActual + 1}</strong> con un nuevo QR.
                              Los alumnos anteriores quedan en el histórico y deberán inscribirse nuevamente.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                              onClick={() => handleReabrir(curso.id)}
                              disabled={isReopening}
                              style={{ backgroundColor: user?.cliente?.color || undefined }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {isReopening ? 'Reabriendo...' : 'Confirmar'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Total: {meta.total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Página {meta.page} de {meta.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
