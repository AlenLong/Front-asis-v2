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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Loader2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedSkeleton } from '@/app/admin/dashboard/components/animations/AnimatedSkeleton';
import { AnimatedButton } from '@/app/admin/dashboard/components/animations/AnimatedButton';
import { Persona } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PersonasTableProps {
  personas: Persona[];
  isLoading: boolean;
  onDeleteClick: (persona: Persona) => void;
  clientColor?: string | null;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isHistorico?: boolean;
}

function getInscripcionesCount(persona: Persona): number {
  // Backend devuelve totalCursos en /personas/export
  if ((persona as any).totalCursos !== undefined) {
    return (persona as any).totalCursos;
  }
  if (persona._count?.inscripciones !== undefined) {
    return persona._count.inscripciones;
  }
  return persona.inscripciones?.length || 0;
}

export function PersonasTable({
  personas,
  isLoading,
  onDeleteClick,
  clientColor,
  meta,
  onPageChange,
  isHistorico,
}: PersonasTableProps) {
  const router = useRouter();
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [personaFormData, setPersonaFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
  });

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= (meta?.totalPages || 1)) {
      onPageChange(newPage);
    }
  };

  const handleEditClick = (persona: Persona) => {
    setEditingPersona(persona);
    setPersonaFormData({
      nombre: persona.nombre,
      apellido: persona.apellido,
      dni: persona.dni,
    });
  };

  const handleCancel = () => {
    setEditingPersona(null);
  };

  // Note: Inline editing disabled - use detail view for editing
  const handleSave = () => {
    // Editing moved to detail view
    setEditingPersona(null);
  };

  const handleViewDetail = (persona: Persona) => {
    router.push(`/admin/dashboard/personas/${persona.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <Table>
        <TableHeader style={{ backgroundColor: clientColor || '#f8fafc' }}>
          <TableRow>
            <TableHead className="text-white">Nombre</TableHead>
            <TableHead className="text-white">Apellido</TableHead>
            <TableHead className="text-white">DNI</TableHead>
            <TableHead className="text-white text-center">Cursos</TableHead>
            <TableHead className="text-white w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4">
                <AnimatedSkeleton rows={3} cols={5} />
              </TableCell>
            </TableRow>
          ) : personas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No hay personas registradas
              </TableCell>
            </TableRow>
          ) : (
            personas.map((persona: Persona) => (
              <TableRow key={persona.id}>
                <TableCell>{persona.nombre}</TableCell>
                <TableCell>{persona.apellido}</TableCell>
                <TableCell>{persona.dni}</TableCell>
                <TableCell className="text-center">
                  {isHistorico ? (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      0
                    </Badge>
                  ) : (
                    <Badge
                      variant={getInscripcionesCount(persona) > 0 ? 'default' : 'secondary'}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => handleViewDetail(persona)}
                      style={{
                        backgroundColor: clientColor && getInscripcionesCount(persona) > 0
                          ? clientColor
                          : undefined,
                      }}
                    >
                      {getInscripcionesCount(persona)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AnimatedButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetail(persona)}
                      className="hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </AnimatedButton>
                    <AnimatedButton
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteClick(persona)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AnimatedButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
