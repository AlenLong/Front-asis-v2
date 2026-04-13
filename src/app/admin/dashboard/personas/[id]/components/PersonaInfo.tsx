'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Persona } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';

interface PersonaInfoProps {
  persona: Persona;
  updateMutation: UseMutationResult<any, any, { id: number; data: Partial<Persona> }, any>;
}

export function PersonaInfo({ persona, updateMutation }: PersonaInfoProps) {
  const [formData, setFormData] = useState({
    nombre: persona.nombre,
    apellido: persona.apellido,
    dni: persona.dni,
  });

  const hasChanges =
    formData.nombre !== persona.nombre ||
    formData.apellido !== persona.apellido ||
    formData.dni !== persona.dni;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: persona.id,
      data: formData,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Persona</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
