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
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { AnimatedSkeleton } from '@/app/admin/dashboard/components/animations/AnimatedSkeleton';
import { Curso } from '@/types';
import { Usuario } from '@/types';

interface CursosTableProps {
  cursos: Curso[];
  isLoading: boolean;
  user: Usuario | null;
  onViewQR: (curso: Curso) => void;
  onEdit: (curso: Curso) => void;
  onDelete: (curso: Curso) => void;
}

export function CursosTable({
  cursos,
  isLoading,
  user,
  onViewQR,
  onEdit,
  onDelete,
}: CursosTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <Table>
        <TableHeader style={{ backgroundColor: user?.cliente?.color || '#f8fafc' }}>
          <TableRow>
            <TableHead className="text-white">Nombre</TableHead>
            <TableHead className="text-white">Latitud</TableHead>
            <TableHead className="text-white">Longitud</TableHead>
            <TableHead className="text-white">Radio (m)</TableHead>
            <TableHead className="text-white">QR</TableHead>
            <TableHead className="text-white">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4">
                <AnimatedSkeleton rows={3} cols={6} />
              </TableCell>
            </TableRow>
          ) : cursos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No hay cursos registrados
              </TableCell>
            </TableRow>
          ) : (
            cursos.map((curso: Curso) => (
              <TableRow key={curso.id}>
                <TableCell className="font-medium">{curso.nombre}</TableCell>
                <TableCell>{curso.lat?.toFixed(6) || '-'}</TableCell>
                <TableCell>{curso.lng?.toFixed(6) || '-'}</TableCell>
                <TableCell>{curso.radio}</TableCell>
                <TableCell>
                  {curso.qrPath ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${curso.qrPath}`}
                      alt="QR"
                      className="h-10 w-10 object-contain cursor-pointer"
                      onClick={() => onViewQR(curso)}
                    />
                  ) : (
                    <Badge variant="secondary">Sin QR</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <TooltipProvider delayDuration={100}>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewQR(curso)}
                          >
                            <Eye className="h-4 w-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-2 border-white/20"
                          style={{
                            backgroundColor: user?.cliente?.color || '#0f172a',
                          }}
                        >
                          <p className="text-white font-medium">Ver código QR</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(curso)}
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-2 border-white/20"
                          style={{
                            backgroundColor: user?.cliente?.color || '#0f172a',
                          }}
                        >
                          <p className="text-white font-medium">Editar curso</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(curso)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-2 border-white/20"
                          style={{
                            backgroundColor: user?.cliente?.color || '#0f172a',
                          }}
                        >
                          <p className="text-white font-medium">Eliminar curso</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
