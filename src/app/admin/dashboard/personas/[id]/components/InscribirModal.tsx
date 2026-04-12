'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Inscripcion, Curso } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { useCursos } from '../../../hooks';

interface InscribirModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaId: number;
  inscripciones: Inscripcion[];
  inscribirMutation: UseMutationResult<
    any,
    any,
    { personaId: number; cursoId: number },
    any
  >;
}

export function InscribirModal({
  isOpen,
  onClose,
  personaId,
  inscripciones,
  inscribirMutation,
}: InscribirModalProps) {
  const [selectedCursoId, setSelectedCursoId] = useState('');
  const { cursos, isLoadingCursos } = useCursos();

  const cursosInscritosIds = useMemo(
    () => new Set(inscripciones.map((i) => i.cursoId)),
    [inscripciones]
  );

  const cursosDisponibles = useMemo(
    () => cursos.filter((curso: Curso) => !cursosInscritosIds.has(curso.id)),
    [cursos, cursosInscritosIds]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCursoId) return;

    inscribirMutation.mutate(
      {
        personaId,
        cursoId: parseInt(selectedCursoId),
      },
      {
        onSuccess: () => {
          setSelectedCursoId('');
          onClose();
        },
      }
    );
  };

  const handleCancel = () => {
    setSelectedCursoId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inscribir a Curso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="curso">Seleccionar Curso *</Label>
            <Select
              value={selectedCursoId}
              onValueChange={setSelectedCursoId}
              disabled={isLoadingCursos || cursosDisponibles.length === 0}
            >
              <SelectTrigger id="curso">
                <SelectValue
                  placeholder={
                    cursosDisponibles.length === 0
                      ? 'No hay cursos disponibles'
                      : 'Seleccionar curso...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cursosDisponibles.map((curso: Curso) => (
                  <SelectItem key={curso.id} value={curso.id.toString()}>
                    {curso.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cursosDisponibles.length === 0 && !isLoadingCursos && (
              <p className="text-sm text-gray-500">
                La persona ya está inscrita en todos los cursos disponibles.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedCursoId || inscribirMutation.isPending}
            >
              {inscribirMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Inscribir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
