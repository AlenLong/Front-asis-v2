'use client';

import { useState } from 'react';
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
import { UseMutationResult } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Curso } from '@/types';

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  createMutation: UseMutationResult<
    any,
    any,
    {
      nombre: string;
      apellido: string;
      dni: string;
      cursoId?: number;
    },
    any
  >;
  cursos: Curso[];
  isLoadingCursos: boolean;
}

export function CreatePersonaModal({
  isOpen,
  onClose,
  createMutation,
  cursos,
  isLoadingCursos,
}: CreatePersonaModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    cursoId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: {
      nombre: string;
      apellido: string;
      dni: string;
      cursoId?: number;
    } = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      dni: formData.dni.trim(),
    };

    if (formData.cursoId) {
      payload.cursoId = parseInt(formData.cursoId);
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setFormData({
          nombre: '',
          apellido: '',
          dni: '',
          cursoId: '',
        });
        onClose();
      },
    });
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      cursoId: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido *</Label>
            <Input
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
              placeholder="Ingrese el apellido"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI *</Label>
            <Input
              id="dni"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              required
              placeholder="Ingrese el DNI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curso">Curso (opcional)</Label>
            <Select
              value={formData.cursoId}
              onValueChange={(value) => setFormData({ ...formData, cursoId: value })}
              disabled={isLoadingCursos}
            >
              <SelectTrigger id="curso">
                <SelectValue placeholder="Seleccionar curso para inscribir..." />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id.toString()}>
                    {curso.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Si selecciona un curso, la persona se inscribirá automáticamente
            </p>
          </div>

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
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Guardar
            </AnimatedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
