# Fase 2 · Sistema visual y UX

Implementación y revisión: **11 de noviembre de 2026**. Rama `feature/phase2-visual-system`, sobre `feature/phase1-quality`.

## Cambios

### Rendimiento
- **Traducciones por idioma** (`src/infrastructure/i18n/catalog/{es,en,ko}.ts`):
  - El español va en el bundle de entrada; inglés y coreano se cargan aparte, en chunks de unos 13–15 kB gzip.
  - El idioma de inicio, y el de una ruta de práctica abierta directamente, se cargan antes del primer render, así que no hay parpadeo en español.
  - Al cambiar de idioma, el texto solo cambia cuando el catálogo ha llegado.
  - **JS de arranque:** pasa de 449 621 B a 374 542 B (de 148,7 a 122,7 kB gzip). El límite baja a 400 000 B / 130 000 B.
- **CSS muerto:** se eliminan 19 familias de clases que ningún componente usa (108 selectores, 96 reglas). Se borraron selector a selector con PostCSS.
  - `program-card` se conserva porque `program-card--{tone}` sigue en uso.
  - **CSS de arranque:** pasa de 381 580 B a 362 972 B. Con Tailwind y el selector de inmersión queda en 369 709 B (límite 370 000 B / 80 000 B).
- Las miniaturas de YouTube se cargan en diferido, salvo el vídeo principal de una práctica.

### Legibilidad y accesibilidad
- **Tamaño mínimo de texto de 12 px** en todas las hojas de estilo: 433 declaraciones subidas (antes había textos de unos 6 px en móvil). Lo vigila `typography-floor.test.ts`.
  - Revisado a 390 px en Inicio, Beca, Estudiar, la ruta de coreano, Documentos y Perfil, y con la prueba E2E de desbordamiento horizontal.
- **`useModal`** (`src/shared/ui/useModal.ts`) es un comportamiento común para los diálogos:
  - fondo inerte;
  - scroll bloqueado;
  - el foco queda dentro del diálogo;
  - Escape cierra;
  - el foco vuelve al botón que lo abrió (explícitamente en iOS Safari).
  - Lo usan Guía, Biblioteca, Tablero, reinicio del simulador y salida de práctica. Los dos últimos no tenían trampa de foco.
- **Recorrido guiado:** ya no se abre solo ni bloquea la página. La primera visita a una sección muestra una invitación discreta («Ver recorrido» / «Ahora no»).
- **Sesión de práctica:**
  - barra de progreso con `role="progressbar"`;
  - el área de escritura se etiqueta con el enunciado y se describe con su contador.

### Aprendizaje
- **Idioma de la interfaz durante la práctica:**
  - **Inmersión total:** toda la interfaz pasa al idioma practicado.
  - **Guiada:** las instrucciones siguen en tu idioma y el contenido en el idioma practicado.
  - Por defecto, inglés en inmersión total (B1/B2+) y coreano guiado (con TOPIK I aún no se lee coreano de interfaz).
  - Se elige con el botón 한/EN de la barra de práctica y se guarda por idioma.

### Estructura
- **Tailwind CSS v4 incremental:**
  - Solo `theme` + `utilities`, sin preflight. Las utilidades van en una capa, así que el CSS antiguo sin capa siempre gana.
  - Con `source(none)` y una lista explícita de `@source`, palabras del código antiguo como «grid» o «hidden» no generan utilidades.
  - Los colores apuntan a las variables del tema (`bg-paper`, `text-ink`, `bg-accent`), así que siguen al tema claro u oscuro.
  - Componentes migrados: `DeviceBackupPanel` (su CSS antiguo se borró) e `ImmersionToggle`.
  - **Regla de migración:** el componente se migra entero (marcado + borrar su CSS antiguo) y se añade a la lista `@source`.
- **`tokens.css`:** escalas comunes de z-index, tipografía, espaciado y radios.
- La regla global `button { font: inherit }` pasa a `@layer base`, por debajo de las utilidades.
- **`TestSessionPage`:** se remonta con una `key` por etapa y por reintento. Sustituye dos bloques duplicados de reinicio manual de unas 20 líneas.
- Se eliminan los avisos de lint de esa página.

## Verificación
- Vitest: **78 archivos / 795 pruebas**. Playwright: **63/63**, con pruebas nuevas para:
  - invitación del recorrido;
  - trampa de foco de los modales;
  - inmersión en coreano;
  - salida de práctica.
- `tsc -b`, `check:architecture` y el build pasan, con presupuestos de JS y CSS y la CSP.

## Pendiente de la Fase 2 (siguiente iteración)
- **Tokens de color semánticos únicos por tema:** aún quedan unos 288 + 52 sobrescritos de tema dispersos y nombres engañosos (`--blue` es amarillo en el tema claro). Es el cambio visual de más riesgo; se hará por pantallas, con capturas.
- Anclar los pasos del recorrido con `data-tour-id` en lugar de clases CSS.
- Sacar los textos de `domain/models/interview-chatbot.ts` y las ternarias de idioma de los componentes a los catálogos.
- Dividir `TestSessionPage` en subcomponentes (producción, preguntas, resultado).
- Reducir `backdrop-filter` (130 usos), costoso en móviles.
- **El presupuesto de CSS está casi lleno** (369 709 / 370 000 B): la próxima migración a Tailwind debe borrar más CSS antiguo del que añade.
