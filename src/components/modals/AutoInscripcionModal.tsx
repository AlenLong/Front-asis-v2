'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AutoInscripcionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursoNombre: string;
}

export function AutoInscripcionModal({
  isOpen,
  onClose,
  cursoNombre,
}: AutoInscripcionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-6 w-6" />
            Inscripción Automática
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-blue-900">
                  <strong>No estabas inscrito</strong> en el curso{' '}
                  <strong>&quot;{cursoNombre}&quot;</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Se te inscribió automáticamente para registrar tu asistencia.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>⚠️ Importante:</strong> Al finalizar la clase, debes informar al
                administrativo que fuiste inscrito automáticamente.
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
