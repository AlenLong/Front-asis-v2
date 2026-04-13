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

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PersonasTableProps {
  personas: Persona[];
  isLoading: boolean;
  updateMutation: UseMutationResult<any, any, { id: number; data: Partial<Persona> }, any>;
  deleteMutation: UseMutationResult<any, any, number, any>;
  onDeleteClick: (persona: Persona) => void;
  clientColor?: string | null;
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
  updateMutation,
  deleteMutation,
  onDeleteClick,
  clientColor,
}: PersonasTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [personaFormData, setPersonaFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
  });

  const totalPersonas = personas.length;
  const totalPages = Math.ceil(totalPersonas / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPersonas = personas.slice(startIndex, endIndex);

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

  const handleSave = (persona: Persona) => {
    updateMutation.mutate(
      {
        id: persona.id,
        data: personaFormData,
      },
      {
        onSuccess: () => {
          setEditingPersona(null);
        },
      }
    );
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
            paginatedPersonas.map((persona) => (
              <TableRow key={persona.id}>
                <TableCell>
                  {editingPersona?.id === persona.id ? (
                    <Input
                      value={personaFormData.nombre}
                      onChange={(e) =>
                        setPersonaFormData({ ...personaFormData, nombre: e.target.value })
                      }
                      className="w-full"
                    />
                  ) : (
                    persona.nombre
                  )}
                </TableCell>
                <TableCell>
                  {editingPersona?.id === persona.id ? (
                    <Input
                      value={personaFormData.apellido}
                      onChange={(e) =>
                        setPersonaFormData({ ...personaFormData, apellido: e.target.value })
                      }
                      className="w-full"
                    />
                  ) : (
                    persona.apellido
                  )}
                </TableCell>
                <TableCell>
                  {editingPersona?.id === persona.id ? (
                    <Input
                      value={personaFormData.dni}
                      onChange={(e) =>
                        setPersonaFormData({ ...personaFormData, dni: e.target.value })
                      }
                      className="w-full"
                    />
                  ) : (
                    persona.dni
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {editingPersona?.id === persona.id ? (
                    <span className="text-gray-400">-</span>
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
                  {editingPersona?.id === persona.id ? (
                    <div className="flex gap-2">
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(persona)}
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Guardar'
                        )}
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancelar
                      </AnimatedButton>
                    </div>
                  ) : (
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
                        onClick={() => handleEditClick(persona)}
                        className="hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
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
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!isLoading && totalPersonas > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mostrar:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(parseInt(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">Total: {totalPersonas}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
