'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Inscripcion } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { InscribirModal } from './InscribirModal';
import { DesinscribirConfirmModal } from './DesinscribirConfirmModal';

interface InscripcionesSectionProps {
  inscripciones: Inscripcion[];
  isLoading: boolean;
  personaId: number;
  inscribirMutation: UseMutationResult<
    any,
    any,
    { personaId: number; cursoId: number },
    any
  >;
  desinscribirMutation: UseMutationResult<any, any, { personaId: number; cursoId: number }, any>;
}

export function InscripcionesSection({
  inscripciones,
  isLoading,
  personaId,
  inscribirMutation,
  desinscribirMutation,
}: InscripcionesSectionProps) {
  const [isInscribirModalOpen, setIsInscribirModalOpen] = useState(false);
  const [inscripcionToDelete, setInscripcionToDelete] = useState<Inscripcion | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleOpenInscribir = () => {
    setIsInscribirModalOpen(true);
  };

  const handleCloseInscribir = () => {
    setIsInscribirModalOpen(false);
  };

  const handleDesinscribirClick = (inscripcion: Inscripcion) => {
    setInscripcionToDelete(inscripcion);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInscripcionToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cursos Inscriptos</CardTitle>
        <Button onClick={handleOpenInscribir} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Inscribir a curso
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : inscripciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Esta persona no está inscrita en ningún curso</p>
            <Button onClick={handleOpenInscribir} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Inscribir ahora
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Fecha de inscripción</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscripciones.map((inscripcion) => (
                <TableRow key={inscripcion.id}>
                  <TableCell className="font-medium">
                    {inscripcion.curso.nombre}
                  </TableCell>
                  <TableCell>
                    {new Date(inscripcion.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDesinscribirClick(inscripcion)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <InscribirModal
          isOpen={isInscribirModalOpen}
          onClose={handleCloseInscribir}
          personaId={personaId}
          inscripciones={inscripciones}
          inscribirMutation={inscribirMutation}
        />

        <DesinscribirConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          inscripcion={inscripcionToDelete}
          desinscribirMutation={desinscribirMutation}
          personaId={personaId}
        />
      </CardContent>
    </Card>
  );
}
