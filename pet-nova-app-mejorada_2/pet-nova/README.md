# Pet Nova — App mejorada

Este proyecto parte del código generado en Manus y le agrega:

- 🗺️ **Mapa Pet real** (`PetMap.tsx`): mapa interactivo con Leaflet + OpenStreetMap
  (gratis, sin API key), con veterinarias/parques/peluquerías reales del área, y
  un simulador de **"paseador en camino"** en tiempo real (posición calculada
  en el servidor cada pocos segundos).
- 📅 **Calendario Inteligente** (`SmartCalendar.tsx`): junta citas + vacunas en
  un calendario visual y avisa automáticamente lo que vence en los próximos 7 días.
- 👥 **Comunidad Pet** (`Community.tsx`): feed de publicaciones con likes y
  comentarios entre dueños de mascotas.
- 🗄️ **Backend real** (`server/routes.ts` + `server/db.ts`): API REST con base
  de datos persistente en archivo (sin necesidad de instalar Postgres/Mongo).
  Citas, vacunas, alertas y comunidad ya no se pierden al cerrar el navegador.
- Se quitaron los plugins internos de Manus (`vite-plugin-manus-runtime`, el
  proxy de almacenamiento, el logo servido desde `/manus-storage/...`) para que
  el proyecto compile y corra en **cualquier hosting**, no solo dentro de Manus.

## Cómo correrlo en tu computadora

```bash
pnpm install     # o: npm install
pnpm dev         # levanta frontend (Vite) + puedes correr el backend con:
pnpm build && pnpm start   # build de producción y servidor único en localhost:3000
```

El servidor Express sirve el frontend YA compilado **y** la API en el mismo
puerto (`/api/...`), así que en producción es un solo proceso.

## Cómo publicarlo con una URL propia

Este proyecto necesita un backend corriendo (Node), así que **no es un sitio
100% estático** — no puedes subir solo HTML/CSS/JS a cualquier lado. Opciones
recomendadas (todas tienen plan gratis/muy barato):

1. **Render.com** o **Railway.app**: conectas el repo de GitHub, comando de
   build `pnpm build`, comando de arranque `pnpm start`. Te dan una URL
   `https://pet-nova.onrender.com` en minutos. Este proyecto ya incluye
   `render.yaml` — en Render puedes usar **New → Blueprint**, apuntar a tu
   repo, y configura automáticamente el build, el arranque, un `JWT_SECRET`
   aleatorio y un disco persistente para que las citas/fotos/comunidad no se
   borren en cada despliegue.
2. **Vercel**: funciona mejor si conviertes las rutas de `server/routes.ts`
   en funciones serverless (`/api/*.ts`); pídeme ayuda si quieres ese camino.
3. Un VPS propio (DigitalOcean, etc.) con `pm2 start dist/index.js`.

## Cómo insertarlo en tu sitio (Wix, WordPress, etc.)

Una vez que tengas la URL real (paso anterior), en Wix agregas un elemento
**"Insertar HTML" / "Embed" → iFrame** y pones:

```html
<iframe src="https://TU-URL-REAL.com" style="width:100%; height:100vh; border:0;"></iframe>
```

Importante: Wix **no puede ejecutar el backend** — solo puede mostrar (en un
iframe) una página que ya está corriendo en otro lugar. Todo lo dinámico
(guardar citas, comunidad, mapa) sigue funcionando porque vive en tu servidor,
no en Wix; Wix solo actúa como "ventana" hacia tu app.

## Variables de entorno

Crea un archivo `.env` (opcional) si el backend vive en un dominio distinto
al frontend:

```
VITE_API_URL=https://tu-backend.onrender.com
```

Si frontend y backend se sirven juntos (recomendado, es el default de este
proyecto), no necesitas configurar nada.

## Reemplazar el logo

Ya coloqué tu logo real en `client/public/pet-nova-logo.jpg`. Si tienes una
versión en PNG con fondo transparente, reemplaza ese archivo (mismo nombre) o
actualiza la referencia en `Dashboard.tsx` y `Registration.tsx`.

## Qué falta para "100% funcional" en producción

- ~~Autenticación real de usuarios~~ ✅ Ya implementado: registro con
  contraseña (hasheada con bcrypt), login, sesión persistente con JWT.
- ~~Subida de fotos~~ ✅ Ya implementado: las fotos se suben al servidor
  (`POST /api/upload`) y se guardan como archivos reales en `server/uploads/`
  (servidos en `/uploads/...`). Para escalar a muchos usuarios, lo ideal es
  luego apuntar ese mismo endpoint a un bucket S3/Cloudinary en vez de disco
  local — el resto de la app no cambia.
- **GPS real**: el mapa ya tiene el enganche listo. Cuando exista una
  app/dispositivo del paseador, que haga `POST /api/tracking/{petId}/update`
  con `{ lat, lng }` — el mapa mostrará esa posición real automáticamente en
  vez de la simulación (ver aviso dentro de la pantalla del Mapa Pet).

Antes de publicar con usuarios reales:
1. Copia `.env.example` a `.env` y cambia `JWT_SECRET` por algo único y largo.
2. Si despliegas en un host con disco efímero (algunos planes gratis de
   Vercel/Railway reinician el disco), considera mover `server/data.json` y
   `server/uploads/` a un volumen persistente o a una base de datos real más
   adelante — la capa `server/db.ts` está aislada justamente para que ese
   cambio no toque el resto del código.
