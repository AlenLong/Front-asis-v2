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
import { Loader2, MapPin } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UbicacionFavorita } from '@/types';

interface CreateCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  createMutation: UseMutationResult<
    any,
    any,
    {
      nombre: string;
      lat?: number;
      lng?: number;
      radio: number;
      ubicacionFavoritaId?: number;
      guardarUbicacion?: boolean;
      nombreUbicacion?: string;
    },
    any
  >;
  ubicaciones: UbicacionFavorita[];
  isLoadingUbicaciones: boolean;
}

export function CreateCursoModal({
  isOpen,
  onClose,
  createMutation,
  ubicaciones,
  isLoadingUbicaciones,
}: CreateCursoModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    lat: '',
    lng: '',
    radio: '100',
    ubicacionFavoritaId: '',
    guardarUbicacion: false,
    nombreUbicacion: '',
  });

  const [useUbicacionFavorita, setUseUbicacionFavorita] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      nombre: formData.nombre,
      radio: parseInt(formData.radio) || 100,
    };

    if (useUbicacionFavorita && formData.ubicacionFavoritaId) {
      // Opción A: Usar ubicación favorita existente
      payload.ubicacionFavoritaId = parseInt(formData.ubicacionFavoritaId);
    } else {
      // Opción B: Usar coordenadas manuales
      payload.lat = formData.lat ? parseFloat(formData.lat) : undefined;
      payload.lng = formData.lng ? parseFloat(formData.lng) : undefined;

      if (formData.guardarUbicacion && formData.nombreUbicacion) {
        payload.guardarUbicacion = true;
        payload.nombreUbicacion = formData.nombreUbicacion;
      }
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setFormData({
          nombre: '',
          lat: '',
          lng: '',
          radio: '100',
          ubicacionFavoritaId: '',
          guardarUbicacion: false,
          nombreUbicacion: '',
        });
        setUseUbicacionFavorita(false);
        onClose();
      },
    });
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      lat: '',
      lng: '',
      radio: '100',
      ubicacionFavoritaId: '',
      guardarUbicacion: false,
      nombreUbicacion: '',
    });
    setUseUbicacionFavorita(false);
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Curso</DialogTitle>
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
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitud</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitud</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* Checkbox para guardar ubicación */}
              {formData.lat && formData.lng && (
                <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="guardarUbicacion"
                      checked={formData.guardarUbicacion}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, guardarUbicacion: checked as boolean })
                      }
                    />
                    <Label htmlFor="guardarUbicacion" className="cursor-pointer text-blue-700">
                      Guardar esta ubicación para reutilizar
                    </Label>
                  </div>

                  {formData.guardarUbicacion && (
                    <div className="space-y-2 pl-6">
                      <Label className="text-blue-600">Nombre de la ubicación *</Label>
                      <Input
                        value={formData.nombreUbicacion}
                        onChange={(e) =>
                          setFormData({ ...formData, nombreUbicacion: e.target.value })
                        }
                        placeholder="Ej: Aula Principal, Edificio Norte..."
                        required={formData.guardarUbicacion}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
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
            <p className="text-xs text-gray-500">
              Radio permitido para marcar asistencia
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
