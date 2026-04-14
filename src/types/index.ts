export interface Inscripcion {
  id: number;
  cursoId: number;
  personaId: number;
  curso: {
    id: number;
    nombre: string;
  };
  createdAt: string;
}

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inscripciones: number;
  };
  inscripciones?: Inscripcion[];
}

export interface Cliente {
  id: number;
  nombre: string;
  logoUrl: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Curso {
  id: number;
  nombre: string;
  activo: boolean;
  estado: 'activo' | 'finalizado';
  edicionActual: number;
  fechaFin: string | null;
  lat: number | null;
  lng: number | null;
  radio: number;
  qrPath: string | null;
  clienteId: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inscripciones: number;
    asistencias: number;
  };
}

export interface CursoPublico {
  id: number;
  nombre: string;
  activo: boolean;
  edicionActual: number;
  requiereGPS: boolean;
}

export interface Asistencia {
  id: number;
  personaId: number;
  cursoId: number;
  clienteId: number | null;
  fecha: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  persona?: Persona;
  curso?: Curso;
}

export interface Usuario {
  id: number;
  email: string;
  clienteId: number | null;
  cliente?: Cliente | null;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface AsistenciaFormData {
  nombre: string;
  apellido: string;
  dni: string;
  cursoId: number;
  edicion?: number;
  lat?: number;
  lng?: number;
}

export interface CursoFormData {
  nombre: string;
  lat?: number;
  lng?: number;
  radio: number;
}

export interface UbicacionFavorita {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  radio: number;
  createdAt: string;
  updatedAt: string;
}
