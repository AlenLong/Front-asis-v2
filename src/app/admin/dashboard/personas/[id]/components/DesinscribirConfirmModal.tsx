'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Inscripcion } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';

interface DesinscribirConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscripcion: Inscripcion | null;
  desinscribirMutation: UseMutationResult<any, any, { personaId: number; cursoId: number }, any>;
  personaId: number;
}

export function DesinscribirConfirmModal({
  isOpen,
  onClose,
  inscripcion,
  desinscribirMutation,
  personaId,
}: DesinscribirConfirmModalProps) {
  const handleConfirm = () => {
    if (!inscripcion) return;

    desinscribirMutation.mutate(
      {
        personaId,
        cursoId: inscripcion.cursoId,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Desinscripción</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas desinscribir a esta persona del curso{' '}
            <strong>{inscripcion?.curso.nombre}</strong>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Atención:</strong> La persona ya no podrá registrar asistencias para este curso. Esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={desinscribirMutation.isPending}
            >
              {desinscribirMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Desinscribir
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
