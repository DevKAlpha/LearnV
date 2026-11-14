# Fase 5 · Tablero y hábito diario

Implementación y revisión: **14 de noviembre de 2026**. Rama `feature/phase5-daily-habit`, sobre `feature/phase4-gks-profile`.

## Cambios

### Plan de hoy generado (`src/domain/models/daily-plan.ts`)
- **Sustituye las tres tareas fijas de Inicio.** El plan se reconstruye cada vez que se muestra, así que se renueva a medianoche (hora local).
- **Contenido del plan:**
  1. **Repaso espaciado.** Objetivo: 10 tarjetas, o las que queden si son menos. Se marca solo cuando los repasos de hoy alcanzan el objetivo.
  2. **Una etapa nueva.** Se elige el idioma que va por detrás; si hay empate, alterna según el día. Se marca sola al guardar un intento hoy, y ese intento se queda en el plan aunque la etapa ya esté aprobada.
  3. **El paso GKS de la fase del ciclo.** Es lo único que se marca a mano, porque no se puede medir. No aparece en la build QA de aprendizaje.
- **Carga diferida.** La tarjeta lleva el mazo de repaso, así que no pesa en el arranque. Muestra:
  - las tareas del tablero que vencen hoy o antes, con un botón que abre el tablero en la vista «Hoy»;
  - la racha y el estado del protector semanal.
- **El índice de preparación ya no suma el plan del día.** Ahora sale solo de evidencia duradera: documentos (50 %) y etapas aprobadas (50 %).
- **`useGksProgress` usa un store compartido.** Inicio, documentos y tablero ven las mismas marcas en la misma pestaña. La clave antigua `gks-path-progress-v1` se migra una vez.
- **Limpieza:** se eliminan `dailyTasks`, `StudyTask`, `buildHomeTaskPlan` y los textos `tasks.items`, que ya no tenían uso.

### Tablero integrado (`src/domain/models/board-plan.ts`)
- **Vista «Hoy»** (`todayBoardTasks`): primero lo vencido o que vence hoy (lo más antiguo arriba) y después lo que está «En marcha» sin fecha. Se cambia con «Hoy / Todo el tablero».
- **Sugerencias con un toque.** Salen de tres fuentes:
  - el repaso de hoy (`srs-review-<día>`);
  - el paso del ciclo (`gks-step-<acción>-<año>`), con la fecha del hito correspondiente (`actionDueDate`);
  - los documentos cuya fecha de inicio cae en los próximos 21 días (`gks-doc-<documento>-<año>`, el mismo id que usa el calendario de Documentos).
- **Cómo funcionan:**
  - «Añadir» crea la tarea y «Ahora no» la aparta. Lo apartado se guarda en `learnv-board-suggestions-v1`, con un máximo de 200 ids.
  - Nunca se repite una sugerencia: los ids son estables y se descartan los que ya están en el tablero.
- **Diseño:** los botones nuevos usan las variantes del CSS del tablero (`board-primary`), porque esa hoja da estilo a todos los botones del diálogo.

### Racha honesta y resumen semanal
- **Solo la práctica real cuenta como día de estudio:** tests, repasos, quizzes de Hangul y simuladores. Marcar tareas, documentos o recursos se registra, pero no mantiene la racha.
- **Protector semanal:** un día sin práctica por semana (de lunes a domingo) no rompe la racha, pero tampoco suma. Cubre también «ayer» mientras hoy siga vacío. Inicio indica si ya se usó esta semana.
- **Tiempo por día:** el diario de aprendizaje guarda los segundos activos de cada día de las últimas 5 semanas (`dailySeconds`).
- **«Tu semana» en Perfil** compara los últimos 7 días con los 7 anteriores:
  - minutos activos, días con práctica, prácticas terminadas y tarjetas repasadas;
  - la habilidad con peor media de la semana;
  - el siguiente objetivo: la próxima etapa de cada idioma.

### Recordatorios y calendario
- **Avisos del navegador** (Perfil · «Recordatorios y calendario»):
  - el permiso solo se pide al pulsar «Activar avisos»;
  - aparecen una vez al día, a partir de la hora elegida, y solo si hoy no has practicado;
  - el panel avisa con claridad de que solo llegan con LearnV abierta o instalada y activa;
  - incluye «Probar aviso»;
  - al tocar el aviso se abre LearnV (`notificationclick` en el service worker).
- **Exportación `.ics` (RFC 5545):**
  - incluye las fechas del ciclo GKS (marcando si son estimadas), las tareas del tablero con fecha y una sesión de estudio diaria a la hora elegida (`RRULE:FREQ=DAILY`, hora local flotante, alarma);
  - los UID son estables: si se importa de nuevo, los eventos se actualizan en vez de duplicarse;
  - Beca tiene además un botón que exporta solo las fechas del ciclo.

### App instalable (PWA)
- **Manifest e iconos:** `public/manifest.webmanifest` con iconos PNG de 192, 512, maskable 512 y apple-touch, generados desde `favicon.svg`. Incluye accesos directos a «Repaso de hoy» y «Estudiar».
- **Service worker sin dependencias** (`scripts/build-sw.mjs`, que se ejecuta al final de `build` y `build:qa`):
  - **Precache:** la carcasa, todos los chunks JS/CSS (pantallas diferidas incluidas), el manifest y los iconos: 75 archivos.
  - **Fuentes e ilustraciones:** se cachean la primera vez que se usan.
  - **Páginas:** primero la red, con 4 s de margen; sin conexión se sirve la carcasa guardada.
  - **Chunks con hash:** primero la caché.
  - **JSON:** primero la red, con la última copia guardada sin conexión.
  - **Versiones:** el nombre de la caché lleva un hash de los archivos, así que cada despliegue la reemplaza.
  - **Ruta `qa/`:** no la atiende, porque en Pages es otra build con su propio worker.
  - **Cabecera `Vary: Origin`:** se ignora al buscar en caché; sin eso, los módulos no salían de la caché sin conexión.
- **Registro:** solo en producción y tras el evento `load` (`src/infrastructure/pwa/register-service-worker.ts`).
- **Nginx:** `sw.js` y `.webmanifest` se sirven con `no-cache`. La CSP ya permitía `worker-src` y `manifest-src 'self'`.

## Verificación
- **Vitest:** 93 archivos / 875 pruebas. Pruebas nuevas:
  - plan diario;
  - sugerencias del tablero y vista «Hoy»;
  - resumen semanal;
  - protector de racha y racha solo con práctica;
  - fechas de las acciones del ciclo;
  - `.ics` (fechas, alarmas, escapado y plegado UTF-8);
  - recordatorio;
  - generador del service worker.
- **Playwright:** 95/95. Flujos nuevos, con fecha fija (14-11-2026):
  - **Inicio:** plan de 3 elementos; solo el paso GKS tiene botón; el contador pasa a 1/3 y se mantiene tras recargar; sin días de racha.
  - **Tablero «Hoy»:** aceptar el repaso de hoy y apartar el paso del ciclo; los dos quedan guardados.
  - **Perfil:** «Tu semana» con el intervalo correcto.
  - **Recordatorios:** con el permiso concedido se activan a las 07:30 y el `.ics` descargado contiene la convocatoria GKS-U 2028 y la sesión diaria.
  - **PWA:** el manifest es válido y la app abre `/study/review` sin conexión una vez instalado el worker. El resto de pruebas bloquea los service workers (`serviceWorkers: "block"`).
- **Build y comprobaciones:**
  - `tsc -b`, lint (0 avisos), arquitectura, `build` y `build:qa` pasan.
  - JS de arranque: 382 418 B. CSS de arranque: 377 826 B (sin cambios).
- **Capturas a 390 px:** plan de hoy (oscuro), tablero «Hoy» (claro y oscuro), «Tu semana» (claro) y recordatorios (oscuro).

## Pendiente
- **Avisos con la app cerrada:** necesitan Web Push y un servidor, que llegan con la Fase 6. Hasta entonces, el canal fiable es el `.ics`.
- **Historial anterior:** los días antiguos del diario pueden incluir marcas de tareas, porque antes no se distinguían. Solo los días nuevos siguen la regla honesta.
- **Radar:** sigue con datos del 21-9-2026 (pendiente de la Fase 1).
