# Fase 6 · Backend Express (local-first y cuenta opcional)

Implementación y revisión: **15 de noviembre de 2026**. Rama `feature/phase6-sync-backend`, sobre `feature/phase5-daily-habit`.

## Cambios

### Workspace pnpm
- La SPA se queda en la raíz. Moverla a `apps/web` habría reescrito todas las rutas de Pages, Docker y CI sin ninguna ganancia.
- **`apps/api`**: la API.
- **`packages/schemas`** (`@learnv/schemas`) es el contrato compartido:
  - `sync-keys`: qué claves de `localStorage` se sincronizan, cuáles son borradores y los límites. No tiene dependencias y lo usan el cliente y la API.
  - `sync-api`: esquemas zod de peticiones y respuestas. La API valida las peticiones con ellos y el cliente, las respuestas.
- **`packages/domain` no se extrae todavía.** La API no necesita lógica de dominio, porque las fusiones se hacen en el cliente. Se extraerá cuando haga falta corregir en el servidor (Fase 8).

### API (`apps/api`): Express 5 + zod + helmet + express-rate-limit + Drizzle
- **Base de datos:** PostgreSQL en producción y PGlite (Postgres en WASM) en desarrollo y pruebas, con la misma API de Drizzle. La migración SQL se genera con `drizzle-kit` y se aplica al arrancar.
- **Tablas:** `users`, `login_tokens`, `sessions` y `documents`.
  - Es más simple que las 10 entidades del plan: el cliente ya organiza los datos por entrada de `localStorage`, así que el servidor guarda una copia por entrada, con su revisión.
  - Las tablas normalizadas llegarán cuando el servidor tenga que consultar los datos (Fase 8).
- **Endpoints `/api/v1`:**

  | Método | Ruta | Qué hace |
  | --- | --- | --- |
  | `GET` | `health` | Comprueba el servicio y la base de datos. |
  | `POST` | `auth/magic-link` | Siempre responde 202, para no revelar qué correos tienen cuenta. Envía como mucho 3 enlaces por correo cada 15 min. |
  | `POST` | `auth/verify` | Gasta el token con un único `UPDATE … WHERE used_at IS NULL`. |
  | `POST` | `auth/logout` | Cierra la sesión. |
  | `GET` | `me` | Datos de la cuenta. |
  | `GET` | `me/export` | Exportación con el mismo formato que la copia del dispositivo, así que se puede restaurar desde Perfil. |
  | `DELETE` | `me` | Borra la cuenta. Hay que escribir el correo para confirmar. |
  | `GET` | `sync/manifest` | Lista de revisiones de los documentos. |
  | `POST` | `sync/pull` | Descarga documentos concretos. |
  | `POST` | `sync/push` | Sube cambios (ver abajo). |
  | `DELETE` | `sync/drafts` | Borra la copia de los borradores. |

- **`sync/push`:**
  - Cada cambio indica en qué revisión se basa.
  - Si la revisión ya no es la actual, devuelve `conflict` con la copia actual, sin aplicar nada. Por eso reintentar un envío ya aplicado es idempotente.
  - Una transacción bloquea la fila del usuario, así que la revisión y el límite de 5 MB por cuenta son exactos.
  - Borrar deja una lápida, para que los demás dispositivos apliquen el borrado.
- **Enlace mágico:**
  - El token va en el fragmento (`/account/verify#token=…`), así que nunca llega a los registros de acceso ni al `Referer`.
  - La página exige un toque para confirmar, de modo que los escáneres de correo no pueden gastarlo.
  - El enlace caduca en 15 min y solo sirve una vez.
  - Solo se guarda el hash SHA-256 del token y del id de sesión.
- **Sesión:**
  - Cookie `__Host-learnv_session` con `HttpOnly`, `Secure`, `SameSite=Lax` y `Path=/`.
  - Dura 30 días y se renueva sola al pasar la mitad.
- **Seguridad:**
  - helmet (CSP `default-src 'self'`, HSTS, nosniff…) y `Cache-Control: no-store`.
  - **CSRF:** las escrituras exigen un `Origin` de la lista permitida y la cabecera `X-LearnV-Client: web`, además de SameSite.
  - CORS solo para `CORS_ORIGINS`.
  - Límites por IP:

    | Ámbito | Límite cada 15 min |
    | --- | --- |
    | Toda la API | 900 |
    | Enlace mágico | 10 |
    | Verificación | 30 |

  - Tamaño de cuerpo limitado por ruta.
  - JSON parseado con un reviver que rechaza `__proto__`, `constructor` y `prototype`.
  - Los errores nunca devuelven trazas ni mensajes internos.
- **Cifrado en reposo:** AES-256-GCM con `DATA_KEY`. El AAD es `usuario:clave`, así que las filas no se pueden intercambiar entre cuentas.
- **Privacidad (RGPD y LOPDGDD):**
  - Declaración de edad: «14 o más» o «menor de 14 con consentimiento de madre, padre o tutor».
  - Se registra la versión del aviso de privacidad (`PRIVACY_VERSION`).
  - Purga cada hora:
    - enlaces gastados o caducados, al día siguiente;
    - sesiones caducadas;
    - cuentas sin uso durante 730 días, con todos sus datos;
    - lápidas de más de 180 días.
  - No hay subida de documentos.
- **Configuración** (`loadConfig`): en producción se niega a arrancar sin `DATABASE_URL`, `DATA_KEY` de 32 bytes, `PUBLIC_APP_URL` en https y SMTP. Tampoco acepta `MAIL_TRANSPORT=console`, porque escribiría los enlaces en el log.
- **Build:** esbuild genera un único `dist/server.mjs` de unos 3 MB. La imagen de ejecución solo lleva Node, ese bundle y `drizzle/`, y corre como usuario `node`.

### Cliente: sincronización local-first
- **Sin cuenta, todo sigue igual.** La cuenta solo existe si la build define `VITE_SYNC_API` (Docker, `pnpm dev:sync`). GitHub Pages y la build QA no la tienen.
- **Qué se sincroniza:** todas las entradas `learnv-*` excepto las del dispositivo (tema, idioma, voces, recordatorios, diagnósticos y la propia contabilidad de sync). Los borradores (simulador, entrevista, laboratorio de escritura) solo si se activa «Sincronizar borradores». Al desactivarlo se borra la copia del servidor sin lápida, así que los demás dispositivos conservan los suyos.
- **Motor** (`application/sync/sync-engine.ts`). Por cada entrada compara:
  - el hash local;
  - el hash y la revisión de la última sincronización;
  - la revisión del servidor.

  Con eso decide `skip`, `pull`, `push` o `merge` (`decideSync`). Un `conflict` en el envío se vuelve a fusionar, hasta 3 rondas.
- **Fusión a tres bandas** (`domain/models/sync-merge.ts`), contra la copia de la última sincronización, guardada en IndexedDB:
  - **Por defecto:** los objetos se fusionan clave a clave; las listas con `id`, elemento a elemento; las demás listas, como conjuntos que respetan lo borrado. Si un mismo valor cambió en los dos lados, gana la copia más reciente. Una edición siempre gana a un borrado.
  - **Reglas por entrada:**
    - **Diario:** los contadores se suman y la racha se recalcula.
    - **Etapas:** se suman los intentos, se queda la mejor nota y «aprobada» se mantiene si lo estaba en cualquiera de los dos lados.
    - **Repaso:** cada tarjeta FSRS entera, la de revisión más reciente.
    - **Tablero:** por tarea según `updatedAt`, con una revisión nueva.
- **Cuándo sincroniza** (`useAccountAutoSync`):
  - al abrir la app;
  - al volver a primer plano o recuperar la conexión;
  - cada 3 min mientras está visible;
  - una última vez al ocultarse, con `keepalive`.

  Con Web Locks solo sincroniza una pestaña a la vez. Sin sesión no carga nada: el motor, el cliente HTTP y zod (unos 31 KB gzip) van en un chunk diferido.
- **Sin cola en IndexedDB:** la sincronización se basa en el estado, así que lo pendiente es lo que difiere del último hash y `localStorage` ya lo guarda. No hace falta cola de operaciones.
- **Las pantallas siguen los cambios:** al escribir, el sync emite un `storage` sintético (`announceStorageChange`).
  - Los stores de `createLocalStore` ya lo escuchaban.
  - Ahora también lo escuchan el diario de aprendizaje, el simulador escrito, la práctica de entrevista y la biblioteca de recursos.
  - Esto corrige también un fallo previo: otra pestaña podía pisar el diario.
- **Interfaz:**
  - **Perfil · «Cuenta y sincronización»:**
    - aviso de qué se guarda;
    - correo, edad y consentimiento;
    - estado y última sincronización;
    - botones «Sincronizar ahora», «Descargar mis datos» y «Cerrar sesión» (los datos se quedan en el dispositivo);
    - borrar la cuenta escribiendo el correo.
  - **`/account/verify`:** quita el token de la URL y del historial al cargar.
- **Textos de privacidad corregidos en ES/EN/KO.** Los que decían «solo en este dispositivo» ahora explican que solo salen del dispositivo, cifrados, si se inicia sesión. Así son ciertos en las dos builds.
- **`learnv-sync-v1`** se excluye de las copias del dispositivo.
- **El service worker ignora `/api/`:** nunca cachea respuestas de la cuenta.

### Despliegue
- **`compose.yaml`:** `web` (Nginx con la SPA, compilada con `VITE_SYNC_API=/api/v1/`), `api` y `db` (PostgreSQL 17 con healthcheck). Los secretos van en `.env`, con `apps/api/.env.example` como plantilla.
- **Nginx:** `location ^~ /api/` hace de proxy en el mismo origen, así que la cookie es de primera parte. El resolver es diferido: sin el contenedor de la API, Nginx arranca igual y responde 502.
- **`Dockerfile` (web):** copia los manifiestos del workspace y acepta `ARG VITE_SYNC_API`. Vacía, da una web sin cuenta, como antes.
- **Desarrollo:** `pnpm api:dev` (PGlite y enlaces impresos en la consola) y `pnpm dev:sync` (Vite reenvía `/api` a `:3001`).
- **`pnpm validate`:** añade `api:typecheck` y `api:build`.

## Verificación
- **Vitest:** 97 archivos / 928 pruebas (53 nuevas).
  - **API** (supertest + PGlite, 23):
    - cabeceras y guardas de CSRF y CORS;
    - JSON con `__proto__`;
    - límite de cuerpo;
    - enlace de un solo uso y en el fragmento;
    - cookie `__Host-`;
    - límite de 3 enlaces;
    - consentimiento obligatorio;
    - caducidad y renovación de la sesión;
    - cifrado en reposo;
    - conflicto e idempotencia;
    - lápidas;
    - claves y JSON rechazados;
    - cuota;
    - aislamiento entre cuentas;
    - borrado de borradores;
    - exportación;
    - borrado de la cuenta;
    - purga;
    - configuración de producción.
  - **Fusión** (15): decisiones, conjuntos, listas con id y reglas de diario, etapas, tarjetas y tablero.
  - **Motor** (8): dos dispositivos contra un servidor simulado, que cubren:
    - subida sin entradas del dispositivo ni borradores;
    - puesta al día y aviso a los stores;
    - fusión y convergencia;
    - primer inicio de sesión con datos en los dos lados;
    - borrados;
    - escritura concurrente;
    - sesión caducada;
    - sin conexión.
  - **DOM** (7): formulario con consentimiento, sincronizar y cerrar sesión, sesión caducada, borrado con confirmación, verificación con toque, enlace caducado y diario que adopta la copia sincronizada.
- **Playwright:** 96/96. Nuevo: una build sin API no muestra la cuenta ni hace peticiones a `/api/`.
- **axe** sobre la build `sync` con la API simulada: panel con y sin sesión, en claro y oscuro, a 390 px, y `/account/verify`. Sin violaciones.
- **Prueba real en Chrome** (API de desarrollo + PGlite):
  - dispositivo A (`localhost:5173`) y dispositivo B (`localhost:4180`), con almacenamiento separado;
  - enlace mágico por consola: el token desaparece de la URL al cargar;
  - A sube sus datos;
  - B entra con datos propios y fusiona (`completedDocuments` queda `["essay","passport"]`);
  - A recibe la fusión;
  - sin errores en consola.
- **Bundle de la API** (`node dist/server.mjs`): `/health` responde 200 con HSTS y `RateLimit-Policy`.
- **Comprobaciones:** `tsc -b`, `tsc` de la API, lint, arquitectura y `build` pasan.
  - JS de arranque: 384 800 B (+2,4 KB, presupuesto 400 000). Con `VITE_SYNC_API`: 385 075 B.
  - CSS de arranque: 377 826 B (sin cambios).

## Pendiente
- **Docker sin probar en local.** El daemon no estaba activo, así que `docker compose up --build`, la conexión `pg` real y el proxy de Nginx no se han ejecutado. La API sí se probó con PGlite y el bundle de producción arrancó.
- **Antes de producción** (decisiones del propietario):
  - dominio con HTTPS;
  - proveedor SMTP;
  - texto legal completo de privacidad (responsable, contacto, base jurídica);
  - copia de seguridad de PostgreSQL;
  - custodia de `DATA_KEY`: si se pierde, los documentos son ilegibles.
- **Consentimiento parental:** queda como declaración. Si se quiere verificar de verdad (por ejemplo, con un correo a la madre, el padre o el tutor), es una decisión legal.
- **Avisos con la app cerrada (Web Push):** ahora que hay servidor, son posibles, pero no se han hecho. Necesitan claves VAPID y consentimiento; se pueden abordar en la Fase 7 o la 8.
- **Corrección en el servidor:** no se ha hecho. Las respuestas tienen que estar en el dispositivo para practicar sin conexión, así que ocultarlas no aporta nada hasta tener un banco de ítems solo de servidor (Fase 8).
- **Marcas de tiempo locales:** son aproximadas, porque se registra la primera vez que el sync ve el cambio. Solo deciden el valor cuando no se puede combinar.
- **Radar:** sigue con datos del 21-9-2026 (pendiente de la Fase 1).
