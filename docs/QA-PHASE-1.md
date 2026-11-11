# Fase 1 · Calidad, seguridad y CI

Implementación y revisión: **10 de noviembre de 2026**. Rama `feature/phase1-quality`, creada sobre `feature/phase0-critical-fixes`.

## Herramientas
- **ESLint 9** en configuración plana, con typescript-eslint, `react-hooks` y `jsx-a11y`. Resultado: **0 errores**.
  - Quedan 4 avisos de `exhaustive-deps` en efectos que dependen a propósito de una sola clave: `SectionTour`, `TestSessionPage`, `WrittenSimulatorPage` y `TaskBoardPanel`. Se revisan en la Fase 2, al refactorizar esos componentes.
  - Se usa ESLint 9 porque `jsx-a11y` aún no admite ESLint 10.
- **TypeScript:** se activan `noUnusedLocals`, `noUnusedParameters` y `noFallthroughCasesInSwitch`.
  - `noUncheckedIndexedAccess` genera 316 errores; queda para una historia propia.
- `packageManager: pnpm@11.19.0` y `engines.node >= 22`, para que Docker y corepack usen la misma versión que CI.
- No se reformateó el código con Prettier, para no mezclar un cambio masivo de formato con cambios funcionales.

## Pruebas
- **Hooks en jsdom** (`src/application/controllers/hooks.dom.test.tsx`):
  - el plan diario se reinicia al cambiar el día local;
  - sincronización entre pestañas;
  - un journey corrupto no rompe la app;
  - los eventos malformados se ignoran;
  - un simulador corrupto se repara;
  - el progreso de idiomas se comparte entre vistas.
- **Playwright + axe** (`e2e/smoke.spec.ts`, 59 pruebas):
  - 11 rutas abiertas directamente a 320, 390 y 1280 px, sin errores de consola (incluidas violaciones de CSP) y sin desplazamiento horizontal;
  - axe WCAG 2.1 A/AA en temas claro y oscuro, sin violaciones graves ni críticas. El contraste lo cubren las pruebas de tokens;
  - atributo `lang` en ES, EN y KO;
  - descarga de la copia de seguridad.
- En CI, el E2E se ejecuta bajo `/LearnV/` (`E2E_BASE`), igual que en GitHub Pages.
- Resultado: Vitest **77 archivos / 789 pruebas**; Playwright **59/59** con base `/` y con base `/LearnV/`.

## Accesibilidad corregida (detectada por axe)
- Corregidos los casos en que el nombre accesible no contenía el texto visible (WCAG 2.5.3):
  - selector de idioma;
  - casillas de tareas diarias;
  - tarjetas de documentos;
  - enlace del porcentaje de preparación;
  - aviso de convocatoria.
- El easter egg del perfil es ahora un `<button>`, así que funciona con teclado.
- Los modales devuelven el foco usando la referencia capturada al abrir.
- El fondo del diálogo de reinicio lleva `role="presentation"`.

## Arquitectura
- **Bus de eventos tipado** (`src/infrastructure/events/learnv-events.ts`): un mapa nombre → carga sustituye las cadenas sueltas y los `CustomEvent` sin tipo.
- Se eliminaron dos emisiones `learnv:progress` que ya no tenían receptores.
- **`createLocalStore`** (`src/infrastructure/storage/local-store.ts`):
  - validación al leer;
  - valor compartido y estable para `useSyncExternalStore`;
  - un único listener de `storage`;
  - aviso cuando falla la escritura.
- Hook `useLocalStore` en la capa de aplicación.
- `useLanguageTestProgress` usa ya un store único. Antes estaba montado 8 veces, cada copia con su lectura y sus listeners.
- Pendiente de migrar al mismo patrón: el journey, el simulador y el progreso de recursos.

## Seguridad
- **CSP** inyectada en cada HTML publicado (`scripts/csp.mjs`), sin `'unsafe-inline'` para scripts:
  - los scripts en línea solo se permiten por hash SHA-256, calculado sobre el texto normalizado a LF como hace el navegador;
  - se permiten `frame-src` de youtube-nocookie, `img-src` de i.ytimg.com y fuentes `data:`;
  - `object-src 'none'`.
  - Se aplica en el build y otra vez tras ensamblar Pages (404 + /qa/).
- **Nginx:**
  - cabeceras `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (micrófono solo para el propio sitio) y COOP;
  - gzip;
  - `no-cache` para HTML/JSON;
  - caché inmutable solo en `/assets/`. Antes también se aplicaba a SVG de `public/`, que no llevan hash.
  - HSTS está documentado para cuando haya TLS.
- **Mapas de código:** se generan ocultos solo para el presupuesto de arranque y `scripts/strip-sourcemaps.mjs` los elimina antes de publicar. Antes se publicaban 31 mapas de unos 3 MB. Con `KEEP_SOURCEMAPS=1` se conservan para depurar en local.
- **Presupuesto de CSS inicial:** 390 000 B / 84 000 B gzip. Valor actual: 381 533 B / 81 612 B.

## CI
- **`quality.yml`:**
  - se ejecuta también en PR a `main` y en ramas `feature/**`;
  - `pnpm validate` incluye lint;
  - nuevo job E2E con el build validado y el informe de Playwright si falla.
- **`deploy-pages.yml`:**
  - si QA falla, se publica producción sin `/qa/` y se emite un aviso, en lugar de bloquear;
  - la CSP se reaplica y los mapas se eliminan sobre el resultado ensamblado.
- **`refresh-radar.yml`:** cada día propone por PR a `prerelease` la instantánea del radar cuando cambian las fuentes oficiales.
- **Dependabot:** npm semanal (herramientas y React agrupados) y Actions mensual, contra `prerelease`.

## Pendiente (decisiones del propietario)
- **`VERSION` no se ha creado.** Asignar `1.0.0A` abre el ciclo de lanzamiento y activa `release-gate`; es una decisión de publicación.
- Las protecciones de rama de `main` (solo PR desde `prerelease`) se configuran en GitHub, no en el repositorio.
- **Limpieza de ramas remotas fusionadas** (unas 45): no se borró ninguna; requiere confirmación.
- La lógica de recuperación de arranque sigue duplicada entre `index.html` y `asset-recovery.ts`. Unificarla exige mover el script en línea a un módulo, y se deja para cuando se revise el arranque.
