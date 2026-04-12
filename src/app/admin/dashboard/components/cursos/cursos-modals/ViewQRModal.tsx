'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { Curso } from '@/types';

interface ViewQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
}

export function ViewQRModal({ isOpen, onClose, curso }: ViewQRModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR del Curso</DialogTitle>
        </DialogHeader>
        {curso && curso.qrPath && (
          <div className="space-y-4 text-center">
            <h3 className="font-semibold text-lg">{curso.nombre}</h3>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/${curso.qrPath}`}
              alt="QR"
              className="mx-auto max-w-full rounded-lg border"
            />
            <p className="text-sm text-gray-500">
              Este código QR permite a los usuarios tomar asistencia
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/${curso.qrPath}`}
              download={`qr-${curso.nombre}.png`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
