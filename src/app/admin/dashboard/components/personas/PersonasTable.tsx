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
import { Pencil, Loader2, Trash2, Eye } from 'lucide-react';
import { AnimatedSkeleton } from '@/app/admin/dashboard/components/animations/AnimatedSkeleton';
import { AnimatedButton } from '@/app/admin/dashboard/components/animations/AnimatedButton';
import { Persona } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface PersonasTableProps {
  personas: Persona[];
  isLoading: boolean;
  updateMutation: UseMutationResult<any, any, { id: number; data: Partial<Persona> }, any>;
  deleteMutation: UseMutationResult<any, any, number, any>;
  onDeleteClick: (persona: Persona) => void;
  clientColor?: string | null;
}

function getInscripcionesCount(persona: Persona): number {
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
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [personaFormData, setPersonaFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
  });

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
            personas.map((persona: Persona) => (
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
    </div>
  );
}
