# Fase 2 · Sistema visual y UX

Implementación y revisión: **11 de noviembre de 2026**. Rama `feature/phase2-visual-system`, sobre `feature/phase1-quality`.

## Cambios

### Rendimiento
- **Traducciones por idioma** (`src/infrastructure/i18n/catalog/{es,en,ko}.ts`):
  - El español va en el bundle de entrada; inglés y coreano se cargan aparte, en chunks de unos 13–15 kB gzip.
  - El idioma de inicio, y el de una ruta de práctica abierta directamente, se cargan antes del primer render, así que no hay parpadeo en español.
  - Al cambiar de idioma, el texto solo cambia cuando el catálogo ha llegado.
  - **JS de arranque:** pasa de 449 621 B a 374 542 B (de 148,7 a 122,7 kB gzip). El límite baja a 400 000 B / 130 000 B.
- **CSS muerto:** se eliminan 30 familias de clases que ningún componente usa (95 selectores, 83 reglas).
  - Un selector solo se borra si no puede coincidir con nada.
  - Las listas `:is()`, `:where()` y `:has()` se dejan intactas: quitarles un argumento cambiaría su especificidad.
  - `:not(.clase-muerta)` nunca provoca el borrado.
  - `program-card` se conserva porque `program-card--{tone}` sigue en uso.
  - **Regresión corregida (59270ad):** la primera limpieza (de40412) borró selectores `:is(…)` enteros por un solo argumento muerto. Así se perdieron estilos de tema oscuro de clases vivas (`.study-start-card`, `.type-chip`, `.resource-icon`…). Se rehízo desde las hojas sin limpiar y se comparó píxel a píxel: 31/32 capturas idénticas. Inicio a 1280 px no es determinista ni comparado consigo mismo.
  - **CSS de arranque:** 377 743 B / 81 013 B gzip (límite 380 000 / 82 000). Antes de la fase eran 381 580 B.
- Las miniaturas de YouTube se cargan en diferido, salvo el vídeo principal de una práctica.
- En móvil, en pantallas táctiles o con `prefers-reduced-transparency`, las tarjetas de contenido no usan `backdrop-filter`. Lo conservan la barra inferior, la cabecera, las capas modales y los diálogos. Revisado a 390 px en claro y oscuro.

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
- **`TestSessionPage`:**
  - Se remonta con una `key` por etapa y por reintento, lo que sustituye dos bloques duplicados de reinicio manual de unas 20 líneas.
  - La vista de resultado pasa a `TestResultView`; la página baja de 497 a 390 líneas.
- **Textos de interfaz:**
  - Las ternarias de idioma en componentes pasan a la sección `ui` de los catálogos ES/EN/KO: simulador escrito, recursos, entrevista y vídeo.
  - La etiqueta «Tú» del chat pasa al catálogo del chatbot.
  - Las razones de puntuación del chatbot son diagnóstico interno (solo en el log, nunca en la interfaz) y quedan en inglés.
  - Se corrige el español de dos frases del entrevistador («explícala» y un texto que asumía género femenino).
- **Lint:** 0 avisos, impuesto con `--max-warnings 0`. El único caso intencional de `exhaustive-deps` (filtro del tablero) está documentado.
- **Alias semánticos de color** en `tokens.css`: `--color-surface`, `--color-accent`, `--color-brand-strong`…
  - Sustituyen para código nuevo a los nombres heredados engañosos (`--blue` es miel en el tema claro).
  - El `@theme` de Tailwind apunta a la misma paleta, con una prueba contra variables autorreferentes.
- **Trinquete de temas** (`theme-overrides.test.ts`): 308 sobrescritos `dark` y 51 `light`, que solo pueden bajar.
- **Comparación visual** (`e2e/visual.spec.ts`, opcional con `VISUAL=1`): 8 rutas × 2 temas × 390/1280 px. Las referencias dependen del sistema operativo y no se versionan.
- **Anclas del recorrido:** no se migran a `data-tour-id`. `page-help.test.tsx` ya falla si un paso apunta a una clase que no está en el marcado de su página.

## Verificación
- Vitest: **79 archivos / 798 pruebas**. Playwright: **63/63**, con pruebas nuevas para:
  - invitación del recorrido;
  - trampa de foco de los modales;
  - inmersión en coreano;
  - salida de práctica.
- La suite visual se ejecutó para validar la limpieza de CSS.
- `tsc -b`, lint (0 avisos), `check:architecture` y el build pasan, con presupuestos de JS y CSS y la CSP.

## Pendiente (decisión consciente)
- **Consolidar los 308 + 51 sobrescritos de tema** en variables por componente. Se probó en `learning-path.css` y se descartó por ahora: pasar las reglas a variables baja su especificidad y puede cambiar qué regla gana, y la suite visual no cubre los estados bloqueado/avanzado. Debe hacerse pantalla a pantalla, ampliando antes la suite visual a esos estados; el trinquete impide que crezcan mientras tanto.
- **Dividir más `TestSessionPage`** (etapa de producción y de preguntas).
