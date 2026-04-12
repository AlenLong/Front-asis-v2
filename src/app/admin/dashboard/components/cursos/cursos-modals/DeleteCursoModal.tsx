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
import { Curso } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';

interface DeleteCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  deleteMutation: UseMutationResult<any, any, number, any>;
}

export function DeleteCursoModal({
  isOpen,
  onClose,
  curso,
  deleteMutation,
}: DeleteCursoModalProps) {
  const handleDelete = () => {
    if (curso) {
      deleteMutation.mutate(curso.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el curso{' '}
            <strong>{curso?.nombre}</strong>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Atención:</strong> Al eliminar este curso, también se eliminarán
              todas las asistencias registradas para él. Esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
