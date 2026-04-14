# Guía Completa: Cloudflare Tunnel para Desarrollo Local con HTTPS

## Índice
1. [Instalación](#1-instalación)
2. [Modos de Uso](#2-modos-de-uso)
   - [Modo Rápido](#modo-rápido-recomendado-para-pruebas)
   - [Modo Persistente con Dominio](#modo-persistente-con-dominio-propio)
   - [Ejemplo Completo](#ejemplo-completo-configuración-con-dominio-personalizado)
   - [Múltiples Servicios](#múltiples-servicios-en-un-solo-túnel)
   - [Servicio de Windows](#gestión-del-túnel-como-servicio-de-windows)
3. [Problemas Comunes y Soluciones](#3-problemas-comunes-y-soluciones)
4. [Configuración del Proyecto](#4-configuración-del-proyecto)
5. [Comandos de Referencia](#5-comandos-de-referencia)
6. [Notas de la Sesión](#6-notas-de-la-sesión)

---

## 1. Instalación

### Instalar cloudflared (Windows)

```powershell
# Como administrador
winget install Cloudflare.cloudflared
```

### Verificar instalación

```powershell
cloudflared --version
# Resultado esperado: cloudflared version 2025.8.1 (built 2025-08-21-1534 UTC)
```

**Nota:** Si el comando no se reconoce, cerrar y volver a abrir la terminal, o recargar el PATH:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
```

---

## 2. Modos de Uso

### Modo Rápido (Recomendado para pruebas)

**Ideal para:** Probar rápidamente en dispositivos móviles sin configuración adicional.

```powershell
cloudflared tunnel --url http://localhost:3001
```

**Salida esperada:**
```
2026-04-14T18:15:00Z INF |  Your quick Tunnel has been created! Visit it at:
2026-04-14T18:15:00Z INF |  https://kernel-solo-population-feeling.trycloudflare.com
```

**Características:**
- URL temporal gratuita (tipo `*.trycloudflare.com`)
- No requiere cuenta de Cloudflare
- No requiere dominio propio
- La URL cambia cada vez que se reinicia el túnel

### Modo Persistente (con dominio propio)

**Ideal para:** Tener una URL fija vinculada a tu dominio.

#### Paso 1: Login en Cloudflare

```powershell
cloudflared tunnel login
```

**Flujo:**
1. Se abre el navegador automáticamente
2. Autorizar Cloudflare Tunnel
3. Seleccionar la zona (dominio) donde se creará el túnel
4. El certificado se guarda en: `%USERPROFILE%\.cloudflared\cert.pem`

#### Paso 2: Crear túnel

```powershell
cloudflared tunnel create front-asis
```

**Resultado:** Muestra el `Tunnel ID` (UUID tipo `abc123...`).

#### Paso 3: Configurar archivo de configuración

Crear archivo: `%USERPROFILE%\.cloudflared\config.yml`

```yaml
tunnel: <TUNNEL-ID>
credentials-file: C:\Users\Usuario\.cloudflared\<TUNNEL-ID>.json

ingress:
  - hostname: asistencia.tudominio.com
    service: http://localhost:3001
  - service: http_status:404
```

#### Paso 4: Configurar DNS en Cloudflare (Dashboard Web)

**Importante:** Este paso se hace desde el **Dashboard de Cloudflare** en el navegador, no desde la terminal.

**Flujo completo:**

1. **Ir a Cloudflare Dashboard:** https://dash.cloudflare.com
2. **Seleccionar tu dominio** (ej: `tudominio.com`)
3. **Ir a la pestaña "DNS"** → "Records"
4. **Agregar un nuevo registro CNAME:**

| Tipo | Nombre | Target | TTL | Proxy Status |
|------|--------|--------|-----|--------------|
| CNAME | `asistencia` (o tu subdominio) | `<TUNNEL-ID>.cfargotunnel.com` | Auto | **DNS Only** (gris, no naranja) |

**Ejemplo práctico:**
```
Tipo: CNAME
Nombre: dev
Target: abc123def-456-789-xyz.cfargotunnel.com
TTL: Auto
Proxy: DNS Only (desactivado)
```

**Resultado:** Tu subdominio `dev.tudominio.com` apuntará al túnel.

**Nota sobre Proxy Status:**
- ✅ **DNS Only (gris):** Recomendado para tunnels. El tráfico va directo al tunnel.
- 🟠 **Proxied (naranja):** Cloudflare proxy adicional (no necesario con tunnels).

#### Paso 5: Iniciar túnel

```powershell
# Modo manual (para pruebas)
cloudflared tunnel run front-asis

# Instalar como servicio de Windows (recomendado para producción)
cloudflared service install
cloudflared service start
```

#### Paso 6: Verificar funcionamiento

Abrir en navegador:
```
https://asistencia.tudominio.com
```

Si todo funciona, deberías ver tu app de Next.js.

---

### Ejemplo Completo: Configuración con Dominio Personalizado

**Supongamos:**
- Dominio: `australbyte.com`
- Subdominio deseado: `asistencia.australbyte.com`
- Tunnel ID: `7b5c3d2e-9f8a-4b1c-8e5d-3a6f9c2b4d8e`

**Archivo `config.yml`:**
```yaml
tunnel: 7b5c3d2e-9f8a-4b1c-8e5d-3a6f9c2b4d8e
credentials-file: C:\Users\Usuario\.cloudflared\7b5c3d2e-9f8a-4b1c-8e5d-3a6f9c2b4d8e.json

ingress:
  - hostname: asistencia.australbyte.com
    service: http://localhost:3001
  - hostname: api.australbyte.com
    service: http://localhost:5500
  - service: http_status:404
```

**Configuración DNS en Cloudflare:**
| Tipo | Nombre | Target |
|------|--------|--------|
| CNAME | asistencia | `7b5c3d2e-9f8a-4b1c-8e5d-3a6f9c2b4d8e.cfargotunnel.com` |
| CNAME | api | `7b5c3d2e-9f8a-4b1c-8e5d-3a6f9c2b4d8e.cfargotunnel.com` |

**Iniciar:**
```powershell
cloudflared tunnel run front-asis
```

---

### Múltiples Servicios en un Solo Túnel

Podés exponer múltiples servicios locales con un solo túnel:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: C:\Users\Usuario\.cloudflared\<TUNNEL-ID>.json

ingress:
  # Frontend Next.js
  - hostname: asistencia.australbyte.com
    service: http://localhost:3001
  
  # Backend NestJS
  - hostname: api.australbyte.com
    service: http://localhost:5500
  
  # Otra app
  - hostname: admin.australbyte.com
    service: http://localhost:3002
  
  # Respuesta 404 para cualquier otro host
  - service: http_status:404
```

**Configuración DNS para múltiples subdominios:**
| Tipo | Nombre | Target |
|------|--------|--------|
| CNAME | asistencia | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | api | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | admin | `<TUNNEL-ID>.cfargotunnel.com` |

---

### Gestión del Túnel como Servicio de Windows

Para que el túnel inicie automáticamente con Windows:

```powershell
# Instalar como servicio
cloudflared service install

# Iniciar servicio
cloudflared service start

# Ver estado
cloudflared service status

# Detener servicio
cloudflared service stop

# Desinstalar servicio
cloudflared service uninstall
```

**Logs del servicio:**
```powershell
# Ver logs en tiempo real
Get-WinEvent -LogName "cloudflared" -MaxEvents 10
```

---

## 3. Problemas Comunes y Soluciones

### Problema: "cloudflared no se reconoce como comando"

**Causa:** El PATH no se actualizó en la sesión actual.

**Solución:**
```powershell
# Opción 1: Cerrar y reabrir la terminal
# Opción 2: Recargar PATH manualmente
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
```

### Problema: "Waiting for login..." infinito

**Causa:** No se completó la autorización en el navegador.

**Solución:**
1. Asegurarse de hacer clic en "Authorize cloudflared" en el navegador
2. Esperar la página de éxito que dice "You have successfully logged in"
3. Si el navegador no abre automáticamente, copiar la URL manualmente desde la consola

### Problema: Se pide seleccionar "zone" (dominio)

**Causa:** Se usó `cloudflared tunnel login` sin tener un dominio configurado.

**Soluciones:**
- **Si NO tenés dominio:** Usar modo rápido (`--url`) en lugar de login
- **Si SÍ tenés dominio:** Seleccionarlo de la lista para continuar

---

## 4. Configuración del Proyecto

### Frontend (Next.js)

El frontend ya está configurado en `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3001 -H 0.0.0.0"
  }
}
```

**Parámetros:**
- `-p 3001`: Puerto del frontend
- `-H 0.0.0.0`: Escuchar en todas las interfaces (necesario para tunnels)

### URLs de Prueba

**URL del proyecto:**
```
https://kernel-solo-population-feeling.trycloudflare.com
```

**URL para QR de curso específico:**
```
https://kernel-solo-population-feeling.trycloudflare.com/?cursoId=26&edicion=1
```

**Formato general:**
```
https://<TUNNEL_URL>/?cursoId=<ID>&edicion=<NUMERO>
```

### Backend (NestJS)

Si el backend también necesita ser accesible desde el celular:

```powershell
# En otra terminal
cloudflared tunnel --url http://localhost:5500
```

Y actualizar `NEXT_PUBLIC_API_URL` en el frontend con la nueva URL HTTPS.

---

## 5. Comandos de Referencia

```powershell
# === INSTALACIÓN ===
winget install Cloudflare.cloudflared
cloudflared --version

# === MODO RÁPIDO (sin login) ===
cloudflared tunnel --url http://localhost:3001

# === MODO PERSISTENTE (con dominio) ===
cloudflared tunnel login                    # Autorizar
cloudflared tunnel create <nombre>          # Crear túnel
cloudflared tunnel list                     # Ver túneles
cloudflared tunnel run <nombre>             # Iniciar túnel
cloudflared service install                 # Instalar como servicio

# === VERIFICACIÓN ===
dir %USERPROFILE%\.cloudflared\             # Ver archivos de config
```

---

## 6. Notas de la Sesión

### Fecha: 14/04/2026

### Instalación realizada
- Cloudflared versión 2025.8.1 instalado exitosamente vía winget
- Certificado guardado en `C:\Users\Usuario\.cloudflared\cert.pem`

### Túnel activo
```
URL: https://kernel-solo-population-feeling.trycloudflare.com
Destino: http://localhost:3001
Estado: Funcionando
```

### Problema identificado: QR y Ediciones

**Situación:**
- Curso 26 tiene edición actual = 1
- El QR generado tenía `edicion=26` (usando ID en lugar de edición)

**Solución temporal:**
Usar URL manual con edición correcta:
```
https://kernel-solo-population-feeling.trycloudflare.com/?cursoId=26&edicion=1
```

**Bug pendiente (Backend):**
El backend debe generar el QR con `edicionActual` del curso, no con el `id`.

### Mejoras aplicadas al frontend

1. **Botón "Regenerar QR" mejorado:**
   - Muestra mensaje "QR regenerado exitosamente"
   - Cierra modal automáticamente después de 800ms
   - Animación de cierre suave (fade-out + zoom-out)

2. **Eliminado toast duplicado** del hook `useCursos.ts`

---

## Próximos Pasos Recomendados

1. **Backend:** Corregir generación de QR para usar `edicionActual` en lugar de `id`
2. **Frontend:** Aplicar animaciones de cierre a los demás modales (Create, Delete, ViewQR)
3. **Documentación:** Mantener esta guía actualizada con nuevas URLs si se reinicia el túnel

---

## Referencias

- [Documentación oficial Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- Guía de red QR del proyecto: `docs/configuracion-red-qr.md`
