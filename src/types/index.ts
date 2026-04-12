export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  createdAt: string;
  updatedAt: string;
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
  lat: number | null;
  lng: number | null;
  radio: number;
  qrPath: string | null;
  clienteId: number | null;
  createdAt: string;
  updatedAt: string;
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
