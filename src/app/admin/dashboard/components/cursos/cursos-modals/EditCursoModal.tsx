'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AnimatedButton } from '@/app/admin/dashboard/components/animations/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Curso } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  updateMutation: UseMutationResult<any, any, { id: number; nombre: string; lat?: number; lng?: number; radio: number }, any>;
  regenerateMutation: UseMutationResult<any, any, number, any>;
}

export function EditCursoModal({
  isOpen,
  onClose,
  curso,
  updateMutation,
  regenerateMutation,
}: EditCursoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    lat: '',
    lng: '',
    radio: '100',
  });

  useEffect(() => {
    if (curso) {
      setFormData({
        nombre: curso.nombre,
        lat: curso.lat?.toString() || '',
        lng: curso.lng?.toString() || '',
        radio: curso.radio.toString(),
      });
    }
  }, [curso]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso) return;
    updateMutation.mutate(
      {
        id: curso.id,
        nombre: formData.nombre,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
        radio: parseInt(formData.radio) || 100,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del Curso *</Label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitud</Label>
              <Input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitud</Label>
              <Input
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Radio (metros) *</Label>
            <Input
              type="number"
              min="1"
              value={formData.radio}
              onChange={(e) => setFormData({ ...formData, radio: e.target.value })}
              required
            />
          </div>
          {curso && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-800">Regenerar QR</h4>
                  <p className="text-sm text-yellow-600">
                    Genera un nuevo código QR para este curso
                  </p>
                </div>
                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={() => regenerateMutation.mutate(curso.id)}
                  disabled={regenerateMutation.isPending}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  {regenerateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Regenerar'
                  )}
                </AnimatedButton>
              </div>
            </div>
          )}
          <DialogFooter>
            <AnimatedButton
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              Cancelar
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Actualizar
            </AnimatedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
