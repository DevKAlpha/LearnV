# Fase 7 · Inmersión, efectos y easter eggs

Implementación y revisión: **16 de noviembre de 2026**. Rama `feature/phase7-immersion`, sobre `feature/phase6-sync-backend`.

## Cambios

### Tomos del storybook que se desbloquean (Home)
- Los tomos 03–05 aparecen bajo los dos tomos de idioma.
  - **Tomo 03 · «Tu primera frase en 한글»:** se abre al superar cualquier etapa `ko-writing-*`.
  - **Tomo 04 · «El puente a TOPIK 3»:** se abre con el nivel medido de coreano «Puente a TOPIK 3» o superior.
  - **Tomo 05 · «La cima C1»:** se abre al completar la ruta base de inglés, la misma condición que abre la práctica C1.
- Los hitos se calculan siempre a partir de la práctica guardada (`domain/models/milestones.ts`); no se guardan como flags. Un tomo bloqueado muestra cómo abrirse.
- Hay tres escenas nuevas en `public/illustrations/storybook/` (`hangul-first`, `topik-bridge`, `c1-summit`), dibujadas con la paleta de las existentes.
  - `pnpm art:optimize` pasa svgo también por `storybook/`.
  - Un presupuesto propio (< 8 KB entre las tres) se suma al de las seis escenas de ruta (< 20 KB).

### Palabra del día (Home)
- Cada día hay una palabra coreana y una inglesa del mazo de repaso, con su significado, una nota y audio TTS.
- La elección es estable durante todo el día local, igual en todos los dispositivos, y no se repite en dos días seguidos (`pickOfTheDay`).

### Calendario cultural (Home)
- Festivales:
  - 설날, 삼일절, 어린이날, 추석, 한글날, 수능, 빼빼로 데이 y 동지.
  - Fechas en `infrastructure/data/cultural-calendar.ts`. Las fiestas fijas se repiten cada año.
  - Las lunares, el 수능 y el solsticio llevan fechas explícitas por año (2026–2028; el 수능 solo hasta 2026, porque el de 2027 aún no está anunciado).
  - Si falta un año, el festival no aparece ese año: no se adivinan fechas. Un test falla cuando el calendario no cubre el año actual y el siguiente.
  - 설날 2027 (7 feb) y 2028 (27 ene) siguen la hora de Corea, un día después que el calendario chino.
- **Tarjeta:**
  - Muestra el festival activo (con unos días de margen en los festivos largos) o el próximo en 60 días.
  - Incluye una explicación breve y una mini-lección con tres expresiones con audio, en ES/EN/KO.
  - Las lecciones se cargan en diferido.
- **Tema de temporada:** durante un festival activo aparece una cinta decorativa arriba (색동, colores de 태극기, luna de cosecha…).
  - Su CSS (`season.css`) solo se descarga esos días.
  - No cambia colores de texto, así que el contraste no varía.
  - Se puede desactivar en Perfil.

### Celebraciones
- Momentos que se celebran:
  - aprobar una etapa;
  - terminar una sesión de repaso;
  - completar el plan de hoy (una vez por día y sesión de pestaña);
  - ganar una pegatina.
- `shared/effects/celebrate.ts` es pequeño y está en el arranque. El confeti, el sonido, la pegatina y sus estilos (`celebration.css`) se cargan en el primer uso.
- **Siempre** se anuncia un mensaje en una región `role="status"` educada, con el tulipán como mascota.
- Las animaciones respetan `prefers-reduced-motion`: con esa preferencia no hay confeti ni movimiento, solo el mensaje.
- **Ajustes en Perfil → «Celebraciones y ambiente»:**
  - animaciones: activadas por defecto;
  - sonido: desactivado por defecto;
  - vibración: desactivada por defecto, y solo se ofrece si el navegador la admite;
  - tema de temporada: activado por defecto;
  - un botón «Probar celebración».
- El sonido son tres notas generadas con WebAudio, sin ficheros. El confeti usa propiedades CSS por CSSOM, compatibles con la CSP.

### Easter eggs accesibles y pegatinas
- **화이팅 / 파이팅 / fighting:** crear o editar una nota del tablero con esa palabra lanza una animación de ánimo y da una pegatina.
- **«tulip»:** escribir la palabra fuera de un campo de texto hace florecer el logo.
  - En móvil, sin teclado, el tulipán del perfil (ahora un `<button>`) hace lo mismo con tres toques.
- **Créditos del perfil:** ya era un botón; al quinto toque también da una pegatina.
- **Colección de 16 pegatinas en Perfil:**
  - tres tomos;
  - rachas de 7 y 30 días;
  - ocho festivales, que se ganan abriendo la mini-lección el día del festival;
  - tres secretos.
- Las pegatinas ocultas muestran cómo conseguirse, así que ninguna es un callejón sin salida.
- **Guardado:** las pegatinas de progreso se calculan a partir de la práctica. Solo se guardan las de festival y las secretas, con su fecha, en `learnv-stickers-v1`.
- **Sincronización:**
  - `learnv-stickers-v1` se sincroniza con la cuenta. Si dos dispositivos ganan la misma pegatina, se queda la primera fecha.
  - `learnv-effects-v1` es una preferencia del dispositivo y no se sincroniza.

## Decisiones
- **La mascota es el tulipán del logo.** Los mockups de `examples/` sirven de referencia de estilo (camino en zigzag, bordes marcados), pero no se copia ningún personaje ni recurso de otra app.
- **Lo que se cargó en diferido:** las lecciones, los textos de inmersión, la palabra del día, los tomos, las pegatinas y el CSS de celebración y temporada.
  - Al arranque solo se suman las fechas del calendario, los stores y los disparadores.
  - JS de arranque: 390.776 B de 400.000 B (antes 384.800). CSS de arranque: sin cambios, 377.826 B.

## Verificación
- **Vitest:** 965 pruebas en 100 ficheros.
  - Nuevas:
    - `infrastructure/data/immersion.test.ts`, con 14 pruebas: efectos, calendario, hitos, pegatinas, fusión de pegatinas, palabras secretas y palabra del día;
    - `features/home/presentation/immersion.dom.test.tsx`;
    - `features/profile/presentation/immersion.dom.test.tsx`.
  - Actualizadas:
    - `storybook.test.tsx`: presupuesto de las escenas de hito;
    - `progressive-pages.test.tsx`: el tulipán del perfil ahora es un botón.
- **Playwright:** 99/99. Incluye axe en claro y oscuro en todas las rutas, y tres pruebas nuevas con la fecha fijada en el día del 수능 2026:
  - palabra del día, festival, cinta y tomos bloqueados;
  - secreto «tulip», pegatina y desactivación del tema de temporada;
  - nota 화이팅 con movimiento reducido: hay mensaje y no hay confeti.
- **Revisión visual:** capturas a 390 y 1280 px en claro y oscuro de Home, pegatinas y aviso.
- `check:architecture`, ESLint y `tsc` sin errores. Pruebas de la API en verde tras añadir `learnv-effects-v1` a las claves solo del dispositivo.

## Pendiente o fuera de alcance
- Las fechas lunares y el 수능 hay que ampliarlos cada año (el test avisa).
- No hay escenas de temporada a pantalla completa: la cinta es deliberadamente discreta.
