'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Curso } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, GraduationCap } from 'lucide-react';
import { AutoInscripcionModal } from '@/components/modals/AutoInscripcionModal';

const asistenciaSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
  cursoId: z.string().min(1, 'Selecciona un curso'),
});

type AsistenciaForm = z.infer<typeof asistenciaSchema>;

export default function HomePage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoInscripcionModal, setShowAutoInscripcionModal] = useState(false);
  const [autoInscripcionCursoNombre, setAutoInscripcionCursoNombre] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasAutoInscribed, setWasAutoInscribed] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AsistenciaForm>({
    resolver: zodResolver(asistenciaSchema),
  });

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/cursos');
        setCursos(response.data);
      } catch (error) {
        toast.error('Error al cargar los cursos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCursos();
  }, []);

  const onSubmit = async (data: AsistenciaForm) => {
    setIsSubmitting(true);
    
    try {
      // Obtener geolocalización
      let lat: number | undefined;
      let lng: number | undefined;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch {
        // Si no hay geolocalización, continuamos sin ella
        console.log('Geolocalización no disponible');
      }

      const response = await api.post('/asistencia', {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        cursoId: parseInt(data.cursoId),
        lat,
        lng,
      });

      toast.success('Asistencia registrada correctamente');

      // Check if auto-inscription occurred
      const autoInscrito = response.data?.fueAutoInscrito === true;
      if (autoInscrito) {
        const cursoNombre = response.data.curso?.nombre || 'Curso';
        setAutoInscripcionCursoNombre(cursoNombre);
        setWasAutoInscribed(true);
        setShowAutoInscripcionModal(true);
      }

      setShowSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {showSuccess ? '¡Registro Exitoso!' : 'Registro de Asistencia'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Tu nombre"
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                {...register('apellido')}
                placeholder="Tu apellido"
              />
              {errors.apellido && (
                <p className="text-sm text-red-500">{errors.apellido.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                {...register('dni')}
                placeholder="Tu DNI"
              />
              {errors.dni && (
                <p className="text-sm text-red-500">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select
                disabled={isLoading}
                value={watch('cursoId')}
                onValueChange={(value) => setValue('cursoId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? 'Cargando cursos...' : 'Selecciona un curso'} />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id.toString()}>
                      {curso.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cursoId && (
                <p className="text-sm text-red-500">{errors.cursoId.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-bg hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Registrar asistencia'
              )}
            </Button>
          </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg text-gray-700">
                  ¡Gracias por registrar tu asistencia!
                </p>
                <p className="text-sm text-gray-500">
                  Éxitos en tus estudios
                </p>
              </div>

              {wasAutoInscribed && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">
                        Se te inscribió automáticamente en: {autoInscripcionCursoNombre}
                      </p>
                      <p className="mt-1">
                        ⚠️ Al finalizar la clase, informa al administrativo que fuiste inscrito automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </CardContent>
      </Card>

      <AutoInscripcionModal
        isOpen={showAutoInscripcionModal}
        onClose={() => setShowAutoInscripcionModal(false)}
        cursoNombre={autoInscripcionCursoNombre}
      />
    </div>
  );
}
