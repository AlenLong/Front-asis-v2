# Documentación: Acceso desde Celular y Sistema QR

## Índice
1. [Configuración de Red para Desarrollo Local](#1-configuración-de-red-para-desarrollo-local)
2. [Configuración del Backend (NestJS)](#2-configuración-del-backend-nestjs)
3. [Configuración del Frontend (Next.js)](#3-configuración-del-frontend-nextjs)
4. [Implementación del Sistema QR](#4-implementación-del-sistema-qr)
5. [Variables de Entorno](#5-variables-de-entorno)
6. [Firewall de Windows](#6-firewall-de-windows)
7. [Pruebas y Verificación](#7-pruebas-y-verificación)
8. [Resumen de Archivos Modificados](#8-resumen-de-archivos-modificados)

---

## 1. Configuración de Red para Desarrollo Local

### 1.1 Problema
Por defecto, los servidores de desarrollo (Next.js y NestJS) escuchan solo en `localhost` (`127.0.0.1`), lo que impide el acceso desde otros dispositivos en la red local.

### 1.2 Solución: Escuchar en todas las interfaces

Cambiar la configuración para que los servidores escuchen en `0.0.0.0` (todas las interfaces de red).

### 1.3 Obtener la IP local
```bash
# Windows
ipconfig | findstr "IPv4"

# Resultado esperado:
# Dirección IPv4. . . . . . . . . . . . . : 192.168.1.XXX
```

---

## 2. Configuración del Backend (NestJS)

### 2.1 Archivo: `main.ts` (Backend en puerto 5500)

**Antes:**
```typescript
const port = process.env.PORT ?? 3000;
await app.listen(port);
```

**Después:**
```typescript
const port = process.env.PORT ?? 5500;  // Puerto para endpoints públicos QR
await app.listen(port, '0.0.0.0');      // Escuchar en todas las interfaces

console.log(`🚀 Server running on: http://localhost:${port}`);
console.log(`🌐 Network: http://192.168.1.XXX:${port}`);
```

### 2.2 Endpoint Público para QR

Crear endpoint que no requiera autenticación JWT:

```typescript
// En el controlador de cursos
@Get(':id/publico')
async getCursoPublico(@Param('id') id: string) {
  return this.cursosService.findCursoPublico(+id);
}
```

**Respuesta del endpoint:**
```json
{
  "id": 5,
  "nombre": "Curso de Ejemplo",
  "activo": true,
  "edicionActual": 2,
  "requiereGPS": true
}
```

### 2.3 CORS en Backend

```typescript
app.enableCors({
  origin: true,  // Permitir cualquier origen en desarrollo
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
});
```

---

## 3. Configuración del Frontend (Next.js)

### 3.1 Modificar package.json

**Archivo:** `package.json`

```json
{
  "scripts": {
    "dev": "next dev -p 3001 -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Parámetros:**
- `-p 3001`: Puerto del frontend
- `-H 0.0.0.0`: Escuchar en todas las interfaces de red

### 3.2 Estructura de la URL del QR

```
http://192.168.1.XXX:3001/?cursoId=5&edicion=2
```

**Parámetros:**
- `cursoId`: ID del curso (obligatorio)
- `edicion`: Número de edición (opcional, viene del QR)

---

## 4. Implementación del Sistema QR

### 4.1 Flujo de Funcionamiento

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │────▶│  Escanea QR │────▶│   Celular   │
│             │     │             │     │   Navegador │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────┐
                              │  http://IP:3001/?cursoId=5      │
                              │  &edicion=2                     │
                              └─────────────────────────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │◀────│  Frontend   │────▶│ /cursos/5/  │
│   :5500     │     │   :3001     │     │  /publico   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  {id, nombre, activo,          │
│   edicionActual, requiereGPS}   │
└─────────────────────────────────┘
```

### 4.2 Componente de Página Modificado

**Archivo:** `src/app/page.tsx`

#### Nuevos Imports
```typescript
import { useSearchParams } from 'next/navigation';
import { Curso, CursoPublico } from '@/types';
import { MapPin } from 'lucide-react';
```

#### Nuevos Estados
```typescript
const searchParams = useSearchParams();
const cursoIdFromQR = searchParams.get('cursoId');
const edicionFromQR = searchParams.get('edicion');

const [cursoFromQR, setCursoFromQR] = useState<CursoPublico | null>(null);
const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
const [ubicacionError, setUbicacionError] = useState<string | null>(null);
```

#### Efecto para Cargar Curso desde QR
```typescript
useEffect(() => {
  if (cursoIdFromQR) {
    api.get(`/cursos/${cursoIdFromQR}/publico`)
      .then(response => {
        const cursoData: CursoPublico = response.data;
        setCursoFromQR(cursoData);
        setValue('cursoId', cursoData.id.toString());
        
        // Obtener GPS si es requerido
        if (cursoData.requiereGPS) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUbicacion({ 
                lat: pos.coords.latitude, 
                lng: pos.coords.longitude 
              });
            },
            (err) => {
              setUbicacionError('No se pudo obtener ubicación.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      })
      .catch(() => {
        setErrorCursoQR('No se pudo cargar el curso desde el QR.');
      });
  }
}, [cursoIdFromQR, setValue]);
```

#### Modificación del Submit
```typescript
const response = await api.post('/asistencia', {
  nombre: data.nombre,
  apellido: data.apellido,
  dni: data.dni,
  cursoId: parseInt(data.cursoId),
  edicion: edicionFromQR ? parseInt(edicionFromQR) : undefined,  // ← Nuevo
  lat: ubicacion?.lat,
  lng: ubicacion?.lng,
});
```

### 4.3 UI Condicional en el Formulario

```tsx
{/* Info del curso desde QR */}
{cursoFromQR && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
    <p className="font-medium text-blue-800">{cursoFromQR.nombre}</p>
    {!cursoFromQR.activo && (
      <p className="text-red-500 text-sm mt-1">⚠️ Curso no activo</p>
    )}
  </div>
)}

{/* Estado GPS */}
{cursoFromQR?.requiereGPS && (
  <div className="flex items-center gap-2 text-sm">
    <MapPin className="h-4 w-4" />
    {ubicacion ? (
      <span className="text-green-600">✓ Ubicación obtenida</span>
    ) : (
      <span className="text-amber-600">Obteniendo ubicación...</span>
    )}
  </div>
)}

{/* Selector oculto si viene del QR */}
{!cursoIdFromQR && (
  <div className="space-y-2">
    <Label htmlFor="curso">Curso</Label>
    <Select ... >...</Select>
  </div>
)}

{/* Botón deshabilitado si falta GPS requerido */}
<Button
  type="submit"
  disabled={isSubmitting || (cursoFromQR?.requiereGPS && !ubicacion)}
>
  Registrar Asistencia
</Button>
```

---

## 5. Variables de Entorno

### 5.1 Frontend (.env.local)

```bash
# URL del backend (usar IP de la PC, no localhost)
NEXT_PUBLIC_API_URL=http://192.168.1.XXX:5500
```

**Nota:** `NEXT_PUBLIC_` es necesario para que la variable sea accesible en el cliente.

### 5.2 Backend (.env)

```bash
# Puerto del backend para endpoints públicos
PORT=5500

# Frontend URL para CORS
FRONTEND_URL=http://192.168.1.XXX:3001
```

---

## 6. Firewall de Windows

### 6.1 Abrir Puertos Necesarios

Como administrador en CMD o PowerShell:

```bash
# Backend NestJS
netsh advfirewall firewall add rule name="NestJS Backend" dir=in action=allow protocol=TCP localport=5500

# Frontend Next.js
netsh advfirewall firewall add rule name="NextJS Frontend" dir=in action=allow protocol=TCP localport=3001
```

### 6.2 Verificar Puertos Abiertos

```bash
netsh advfirewall firewall show rule name="NestJS Backend"
netsh advfirewall firewall show rule name="NextJS Frontend"
```

### 6.3 Eliminar Reglas (si es necesario)

```bash
netsh advfirewall firewall delete rule name="NestJS Backend"
netsh advfirewall firewall delete rule name="NextJS Frontend"
```

---

## 7. Pruebas y Verificación

### 7.1 Verificar Servidores Escuchando

```bash
netstat -an | findstr "5500"
netstat -an | findstr "3001"

# Debe mostrar:
# TCP    0.0.0.0:5500           0.0.0.0:0              LISTENING
# TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING
```

### 7.2 Pruebas desde PC (Navegador)

| URL | Resultado Esperado |
|-----|-------------------|
| `http://localhost:3001` | ✅ Frontend local |
| `http://192.168.1.XXX:3001` | ✅ Frontend en red |
| `http://localhost:5500/api` | ✅ Backend local |
| `http://192.168.1.XXX:5500/cursos/1/publico` | ✅ Backend en red |

### 7.3 Pruebas desde Celular

1. Conectar celular a **misma red WiFi** que la PC
2. Abrir navegador en celular
3. Navegar a: `http://192.168.1.XXX:3001`
4. Escanear QR con parámetros: `?cursoId=5&edicion=2`

### 7.4 Debugging en Celular

Conectar celular por USB y usar Chrome DevTools:
1. En PC: `chrome://inspect/#devices`
2. Habilitar **USB debugging** en celular
3. Inspeccionar pestaña del proyecto
4. Ver pestaña **Console** y **Network**

---

## 8. Resumen de Archivos Modificados

### Frontend (Next.js)

| Archivo | Cambios |
|---------|---------|
| `package.json` | Agregar `-H 0.0.0.0` al script dev |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://IP:5500` |
| `src/types/index.ts` | Nuevo tipo `CursoPublico` |
| `src/app/page.tsx` | Lógica QR, GPS, useSearchParams |
| `src/lib/api.ts` | (Sin cambios, usa env var) |

### Backend (NestJS)

| Archivo | Cambios |
|---------|---------|
| `src/main.ts` | `await app.listen(port, '0.0.0.0')` |
| `src/cursos/cursos.controller.ts` | Nuevo endpoint `@Get(':id/publico')` |
| `.env` | `PORT=5500`, `FRONTEND_URL=http://IP:3001` |

---

## Comandos Rápidos de Referencia

```bash
# Iniciar Frontend
npm run dev

# Ver IP
ipconfig | findstr "IPv4"

# Ver puertos abiertos
netstat -an | findstr "3001\|5500"

# Abrir firewall
netsh advfirewall firewall add rule name="NextJS" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="NestJS" dir=in action=allow protocol=TCP localport=5500
```

---

## Notas Importantes

1. **Misma Red WiFi:** PC y celular deben estar en la misma red
2. **No usar datos móviles:** El celular debe usar WiFi
3. **IP Dinámica:** Si cambia la IP de la PC, actualizar `.env.local`
4. **Reiniciar servidores:** Después de cambiar variables de entorno
5. **CORS:** Backend debe permitir origen del frontend

---

## Solución de Problemas Comunes

### "No se puede acceder al sitio" desde celular
- Verificar firewall desactivado o puertos abiertos
- Verificar misma red WiFi
- Verificar que servidor escucha en `0.0.0.0` (netstat)

### Error CORS
- Verificar `app.enableCors()` en backend
- Verificar que `FRONTEND_URL` tenga la IP correcta

### QR no carga el curso
- Verificar que backend en puerto 5500 esté corriendo
- Verificar endpoint `/cursos/:id/publico` existe
- Verificar IP en `NEXT_PUBLIC_API_URL`

### GPS no funciona
- HTTPS requerido en producción para GPS
- En desarrollo, usar `localhost` o aceptar permisos
- Verificar que `requiereGPS: true` en el curso
