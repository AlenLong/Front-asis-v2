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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Eye, Pencil, XCircle, Users, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Curso } from '@/types';
import { Usuario } from '@/types';
import { useState } from 'react';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CursosActivosTableProps {
  cursos: Curso[];
  isLoading: boolean;
  user: Usuario | null;
  onViewQR: (curso: Curso) => void;
  onEdit: (curso: Curso) => void;
  onCerrar: (id: number) => void;
  isClosing: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function CursosActivosTable({
  cursos: cursosProp,
  isLoading,
  user,
  onViewQR,
  onEdit,
  onCerrar,
  isClosing,
  meta,
  onPageChange,
}: CursosActivosTableProps) {
  // Ensure cursos is always an array
  const cursos = Array.isArray(cursosProp) ? cursosProp : [];

  const [closingId, setClosingId] = useState<number | null>(null);

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= (meta?.totalPages || 1)) {
      onPageChange(newPage);
    }
  };

  const handleDownloadQR = (curso: Curso) => {
    if (!curso.qrPath) return;

    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/${curso.qrPath}`;
    link.download = `qr-${curso.nombre.replace(/\s+/g, '-').toLowerCase()}-edicion-${curso.edicionActual}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCerrar = (id: number) => {
    onCerrar(id);
    setClosingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
        <TableHeader style={{ backgroundColor: user?.cliente?.color || '#f8fafc' }}>
          <TableRow>
            <TableHead className="text-white">Curso</TableHead>
            <TableHead className="text-white">Edición</TableHead>
            <TableHead className="text-white">QR</TableHead>
            <TableHead className="text-white text-center">Inscriptos</TableHead>
            <TableHead className="text-white text-center">Asistencias</TableHead>
            <TableHead className="text-white w-[180px]">Acciones</TableHead>
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
                No hay cursos activos
              </TableCell>
            </TableRow>
          ) : (
            cursos.map((curso: Curso) => (
              <TableRow key={curso.id}>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <p>{curso.nombre}</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>Edición {curso.edicionActual}</Badge>
                </TableCell>
                <TableCell>
                  {curso.qrPath ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${curso.qrPath}`}
                        alt="QR"
                        className="h-10 w-10 object-contain cursor-pointer rounded border"
                        onClick={() => onViewQR(curso)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadQR(curso)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary">Sin QR</Badge>
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
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewQR(curso)}
                            className="border-green-200 text-green-600 hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-2 border-white/20"
                          style={{ backgroundColor: user?.cliente?.color || '#0f172a' }}
                        >
                          <p className="text-white font-medium">Ver QR</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(curso)}
                            className="hover:bg-gray-100 h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-2 border-white/20"
                          style={{ backgroundColor: user?.cliente?.color || '#0f172a' }}
                        >
                          <p className="text-white font-medium">Editar</p>
                        </TooltipContent>
                      </Tooltip>

                      <AlertDialog open={closingId === curso.id} onOpenChange={(open) => setClosingId(open ? curso.id : null)}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="border-2 border-white/20"
                            style={{ backgroundColor: user?.cliente?.color || '#0f172a' }}
                          >
                            <p className="text-white font-medium">Cerrar curso</p>
                          </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Cerrar {curso.nombre}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              El QR se eliminará permanentemente y las inscripciones quedarán
                              en el histórico. Los alumnos no podrán registrar más asistencias.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setClosingId(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCerrar(curso.id)}
                              disabled={isClosing}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isClosing ? 'Cerrando...' : 'Cerrar Curso'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
