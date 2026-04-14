'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Curso, CursoPublico } from '@/types';
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
import { Loader2, CheckCircle2, GraduationCap, MapPin, RefreshCw } from 'lucide-react';
import { AutoInscripcionModal } from '@/components/modals/AutoInscripcionModal';

const asistenciaSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
  cursoId: z.string().min(1, 'Selecciona un curso'),
});

type AsistenciaForm = z.infer<typeof asistenciaSchema>;

export default function HomePage() {
  const searchParams = useSearchParams();
  const cursoIdFromQR = searchParams.get('cursoId');
  const edicionFromQR = searchParams.get('edicion');

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoFromQR, setCursoFromQR] = useState<CursoPublico | null>(null);
  const [loadingCursoQR, setLoadingCursoQR] = useState(false);
  const [errorCursoQR, setErrorCursoQR] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [ubicacionError, setUbicacionError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoInscripcionModal, setShowAutoInscripcionModal] = useState(false);
  const [autoInscripcionCursoNombre, setAutoInscripcionCursoNombre] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasAutoInscribed, setWasAutoInscribed] = useState(false);
  const [ubicacionCargando, setUbicacionCargando] = useState(false);
  const [intentosUbicacion, setIntentosUbicacion] = useState(0);

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

  // Cargar curso desde QR si existe
  useEffect(() => {
    if (cursoIdFromQR) {
      setLoadingCursoQR(true);
      api.get(`/cursos/${cursoIdFromQR}/publico`)
        .then(response => {
          const cursoData: CursoPublico = response.data;
          setCursoFromQR(cursoData);
          // Pre-seleccionar el curso en el formulario
          setValue('cursoId', cursoData.id.toString());
          setErrorCursoQR(null);
          
          // Si requiere GPS, obtener ubicación
          if (cursoData.requiereGPS) {
            obtenerUbicacion();
          }
        })
        .catch(() => {
          setErrorCursoQR('No se pudo cargar el curso desde el QR. Selecciona un curso manualmente.');
        })
        .finally(() => {
          setLoadingCursoQR(false);
        });
    }
  }, [cursoIdFromQR, setValue]);

  // Función para obtener ubicación con reintentos
  const obtenerUbicacion = () => {
    if (!cursoFromQR?.requiereGPS) return;
    
    setUbicacionCargando(true);
    setUbicacionError(null);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setUbicacionError(null);
        setUbicacionCargando(false);
      },
      (err) => {
        console.error('Error GPS:', err);
        setUbicacionCargando(false);
        
        // Detectar tipo de error de geolocalización
        // err.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (err.code === 1) {
          setUbicacionError('El navegador no tiene permiso para acceder a tu ubicación. Verificá los permisos en la configuración de tu navegador/Safari/Chrome.');
        } else if (err.code === 2) {
          setUbicacionError('GPS no disponible. Verificá que tengas activada la ubicación en tu celular (Ajustes > Privacidad > Ubicación).');
        } else if (err.code === 3) {
          setUbicacionError('El GPS tardó demasiado en responder. Asegurate de estar al aire libre y tener buena señal.');
        } else {
          setUbicacionError('Error desconocido al obtener ubicación. Intentá nuevamente.');
        }
        
        setIntentosUbicacion(prev => prev + 1);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,  // 30 segundos para móviles
        maximumAge: 0
      }
    );
  };

  // Cargar lista de cursos para el selector (cuando no hay QR o como fallback)
  useEffect(() => {
    // Si viene desde QR, no necesitamos cargar todos los cursos
    if (cursoIdFromQR) return;
    
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
  }, [cursoIdFromQR]);

  const onSubmit = async (data: AsistenciaForm) => {
    setIsSubmitting(true);
    
    try {
      // Usar ubicación del GPS si el curso la requiere
      let lat = ubicacion?.lat;
      let lng = ubicacion?.lng;
      
      // Si no hay ubicación del QR y no es requerida, intentar obtenerla
      if (!lat && !cursoFromQR?.requiereGPS) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (err) {
          console.error('Error GPS:', err);
          // No bloquear el formulario si falla
        }
      }

      const response = await api.post('/asistencia', {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        cursoId: parseInt(data.cursoId),
        edicion: edicionFromQR ? parseInt(edicionFromQR) : undefined,
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

  // Si hay error crítico del QR (curso no encontrado), mostrar error
  if (errorCursoQR && !cursoFromQR && cursoIdFromQR) {
    return (
      <div className="flex-1 gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-red-500 text-center">
              <p className="font-medium">{errorCursoQR}</p>
              <p className="text-sm text-gray-500 mt-2">Intenta escanear el QR nuevamente o contacta al administrador.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {/* Info del curso desde QR */}
              {cursoFromQR && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="font-medium text-blue-800">{cursoFromQR.nombre}</p>
                  {!cursoFromQR.activo && (
                    <p className="text-red-500 text-sm mt-1">⚠️ Este curso no está activo</p>
                  )}
                </div>
              )}
              
              {/* Estado GPS */}
              {cursoFromQR?.requiereGPS && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <MapPin className="h-4 w-4" />
                    {ubicacion ? (
                      <span className="text-green-600 font-medium">✓ Ubicación obtenida</span>
                    ) : ubicacionCargando ? (
                      <span className="text-amber-600 flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Obteniendo ubicación... ({intentosUbicacion > 0 ? `Intento ${intentosUbicacion + 1}` : 'primer intento'})
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">✗ Ubicación requerida</span>
                    )}
                  </div>
                  
                  {ubicacionError && (
                    <div className="mt-2">
                      <p className="text-sm text-red-500 mb-2">{ubicacionError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={obtenerUbicacion}
                        disabled={ubicacionCargando}
                        className="w-full"
                      >
                        {ubicacionCargando ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Intentando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reintentar obtener ubicación
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {!ubicacion && !ubicacionError && !ubicacionCargando && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={obtenerUbicacion}
                      className="w-full mt-2"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Obtener ubicación
                    </Button>
                  )}
                </div>
              )}

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

              {/* Selector de curso - oculto si viene del QR */}
              {!cursoIdFromQR && (
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
              )}

              <Button
                type="submit"
                className="w-full gradient-bg hover:opacity-90"
                disabled={isSubmitting || (cursoFromQR?.requiereGPS && !ubicacion)}
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
