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
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Curso, UbicacionFavorita } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  updateMutation: UseMutationResult<any, any, { id: number; nombre: string; lat?: number; lng?: number; radio: number; ubicacionFavoritaId?: number }, any>;
  regenerateMutation: UseMutationResult<any, any, number, any>;
  ubicaciones: UbicacionFavorita[];
  isLoadingUbicaciones: boolean;
}

export function EditCursoModal({
  isOpen,
  onClose,
  curso,
  updateMutation,
  regenerateMutation,
  ubicaciones,
  isLoadingUbicaciones,
}: EditCursoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    lat: '',
    lng: '',
    radio: '100',
    ubicacionFavoritaId: '',
  });

  const [useUbicacionFavorita, setUseUbicacionFavorita] = useState(false);

  useEffect(() => {
    if (curso) {
      setFormData({
        nombre: curso.nombre,
        lat: curso.lat?.toString() || '',
        lng: curso.lng?.toString() || '',
        radio: curso.radio.toString(),
        ubicacionFavoritaId: '',
      });
      setUseUbicacionFavorita(false);
    }
  }, [curso]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso) return;

    const payload: any = {
      id: curso.id,
      nombre: formData.nombre,
      radio: parseInt(formData.radio) || 100,
    };

    if (useUbicacionFavorita && formData.ubicacionFavoritaId) {
      payload.ubicacionFavoritaId = parseInt(formData.ubicacionFavoritaId);
    } else {
      payload.lat = formData.lat ? parseFloat(formData.lat) : undefined;
      payload.lng = formData.lng ? parseFloat(formData.lng) : undefined;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleUbicacionChange = (value: string) => {
    const ubicacion = ubicaciones.find((u) => u.id.toString() === value);
    if (ubicacion) {
      setFormData({
        ...formData,
        ubicacionFavoritaId: value,
        lat: ubicacion.lat.toString(),
        lng: ubicacion.lng.toString(),
        radio: ubicacion.radio.toString(),
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-500">
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

          {/* Selector de Ubicación Favorita */}
          {ubicaciones.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useUbicacionFavorita"
                  checked={useUbicacionFavorita}
                  onCheckedChange={(checked) => {
                    setUseUbicacionFavorita(checked as boolean);
                    if (!checked) {
                      setFormData({ ...formData, ubicacionFavoritaId: '' });
                    }
                  }}
                />
                <Label htmlFor="useUbicacionFavorita" className="cursor-pointer">
                  Usar ubicación guardada
                </Label>
              </div>

              {useUbicacionFavorita && (
                <Select
                  value={formData.ubicacionFavoritaId}
                  onValueChange={handleUbicacionChange}
                  disabled={isLoadingUbicaciones}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ubicación..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ubicaciones.map((ubicacion) => (
                      <SelectItem key={ubicacion.id} value={ubicacion.id.toString()}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{ubicacion.nombre}</span>
                          <span className="text-xs text-gray-400">
                            ({ubicacion.lat.toFixed(4)}, {ubicacion.lng.toFixed(4)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Coordenadas manuales (solo si no usa ubicación favorita) */}
          {!useUbicacionFavorita && (
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
          )}

          <div className="space-y-2">
            <Label>Radio (metros) *</Label>
            <Input
              type="number"
              min="1"
              value={formData.radio}
              onChange={(e) => setFormData({ ...formData, radio: e.target.value })}
              required
              disabled={useUbicacionFavorita}
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
                  onClick={() => {
                    regenerateMutation.mutate(curso.id, {
                      onSuccess: () => {
                        toast.success('QR regenerado exitosamente');
                        setTimeout(() => {
                          onClose();
                        }, 800);
                      },
                    });
                  }}
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
