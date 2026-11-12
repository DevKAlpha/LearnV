# Fase 3 · Motor de aprendizaje (primera entrega)

Implementación y revisión: **12 de noviembre de 2026**. Rama `feature/phase3-learning-engine`, sobre `feature/phase2-visual-system`.

## Cambios

### Repaso espaciado (`/study/review`)
- **Planificador FSRS-4.5** (`src/domain/models/srs.ts`, puro):
  - Cada tarjeta guarda estabilidad y dificultad, y se programa con una retención objetivo del 90 %.
  - «Otra vez» devuelve la tarjeta a los 10 minutos y la repite una vez al final de la sesión.
  - Los botones de valoración muestran el intervalo que daría cada respuesta.
- **Mazo inicial** (`src/infrastructure/data/review-deck-cards.ts`): 48 tarjetas de coreano y 43 de inglés, con lengua real (no preguntas sobre la tarea).
  - Se centran en los errores típicos de hispanohablantes:
    - coreano: 은/는 frente a 이/가, 에 frente a 에서, 이다 frente a 있다, verbo al final;
    - inglés: falsos amigos (*actually*, *embarrassed*, *library*…) y preposiciones (*depend on*, *good at*…).
  - Los ID de las tarjetas son permanentes: renombrar una reinicia su programación.
- **Cinco tipos de ejercicio:**
  - **recordar:** se muestra la palabra y el alumno se valora;
  - **completar:** se escribe el hueco y la corrección es tolerante con mayúsculas, espacios y puntuación final;
  - **ordenar bloques:** orden de palabras, partículas y terminaciones;
  - **dictado con voz sintética:** si se usa la transcripción, la tarjeta cuenta como fallo; sin voz disponible, los dictados no entran en la sesión;
  - **tu error:** pregunta de opción múltiple sacada de una práctica.
- **Errores de las prácticas:** al terminar una práctica, cada pregunta fallada entra en el mazo con su explicación (máximo 150). Se puede quitar del mazo.
  - Las preguntas de escucha conservan su audio.
  - Es el registro de errores del alumno. No tiene relación con `learning-error-log`, que recoge errores técnicos.
- **Límites diarios:** 10 tarjetas nuevas al día y 40 por sesión.
  - Primero salen las pendientes; las más próximas a olvidarse, antes.
  - Se intercalan por idioma y tipo para que no salgan dos seguidas del mismo grupo.
- **Datos:** se guardan en `learnv-review-v1`, validados campo a campo, y entran en la copia del dispositivo.
- **Tarjeta «Repaso de hoy»** en Inicio (carga diferida) y en Estudiar, con accesos a Hangul y al laboratorio.
- Cada sesión terminada se registra en el diario de aprendizaje como práctica (`review-session`).

### Coreano desde cero (`/study/hangul`)
- **Modelo puro** (`src/domain/models/hangul.ts`):
  - composición y descomposición de sílabas;
  - romanización letra a letra (no aplica reglas fonéticas, y la página lo dice);
  - las 7 consonantes finales;
  - el teclado 두벌식.
- **La página tiene seis partes:**
  1. Vocales básicas y compuestas.
  2. Consonantes simples, aspiradas y tensas, con consejos para hispanohablantes.
  3. Constructor de bloques.
  4. Tabla de 받침 con pronunciación real ([닥], [옫]…) y enlace (연음).
  5. Mapa del teclado.
  6. Prueba de lectura de 8 preguntas, en la que los distractores solo cambian una letra.
- Al pulsar cualquier letra o ejemplo se oye con la voz del usuario (`useQuickSpeech`). Sin voz, se lee la romanización.

### Escritura (`/study/writing-lab`)
- **Feedback objetivo** (`src/domain/models/writing-feedback.ts`). No pone nota: hace comprobaciones verificables:
  - longitud, párrafos, conectores, variedad de vocabulario, repeticiones y longitud media de frase;
  - registro: contracciones en inglés, y en coreano -요/-습니다 en TOPIK 52–54;
  - gramática objetivo;
  - según el formato: datos en gráficos, visión general (Task 1), postura (Task 2) y conclusión (Task 2 y TOPIK 54).
- **Formatos reales:**
  - TOPIK II 51 (aviso con huecos), 52 (texto explicativo), 53 (gráfico, 200–300 caracteres) y 54 (ensayo, 600–700 caracteres);
  - IELTS Academic Task 1 (gráfico, 150+ palabras) y Task 2 (opinión, 250+ palabras).
  - Los enunciados de TOPIK 53/54 siguen la redacción oficial. Temas y datos son de práctica, y la página lo indica.
- **Bucle de revisión:**
  - el borrador se guarda en el dispositivo (`learnv-writing-lab-v1`) junto con hasta 5 versiones;
  - el panel marca con «↑» lo que ha mejorado respecto a la versión anterior.
- **El mismo panel aparece en:**
  - las prácticas de escritura (a partir de 40 caracteres);
  - el simulador escrito (a partir de 120).
- **El simulador escrito ya no puntúa solo por longitud.** Antes, 600 «a» daban 30/30. Ahora cada texto vale hasta 15 puntos: 6 por llegar a la longitud de referencia y 9 por las comprobaciones de calidad.

### Estructura
- **Hoja Tailwind diferida** (`src/styles/tailwind-study.css`), importada por las pantallas de estudio:
  - Vite la sirve con sus chunks (10,7 kB, 2,7 kB gzip), así que el CSS de arranque no crece con cada pantalla.
  - El mapeo de tema es común a las dos hojas (`tailwind-theme.css`).
  - `tailwind-scope.test.ts` vigila ambas hojas y que ningún componente esté en las dos.
- **Colores que siguen el tema para código nuevo:** `text-fg` y `border-edge`.
  - `--ink` es oscuro en todos los temas; los estilos antiguos lo resuelven con sobrescritos por tema.
  - `text-ink` / `border-ink` quedan solo para superficies de acento (amarillo/lila).
  - En el primer intento el tema oscuro mostraba texto invisible; se detectó con capturas.
- **Utilidades compartidas:** `seededRandom` y `shuffle` pasan a `src/domain/models/random.ts`.

## Verificación
- **Vitest:** 85 archivos / 828 pruebas. Pruebas nuevas:
  - FSRS, mazo, Hangul y feedback;
  - integridad del contenido del mazo y de las tareas;
  - almacenamiento del laboratorio;
  - nueva puntuación del simulador.
- **Playwright:** 81/81.
  - Las tres rutas nuevas, abiertas directamente a 320/390/1280 px y con axe en claro y oscuro.
  - Flujos de sesión de repaso, constructor de Hangul y laboratorio (con recarga).
- `tsc -b`, lint (0 avisos), `check:architecture`, build, CSP y presupuestos pasan:
  - JS de arranque: 376 742 B;
  - CSS de arranque: 377 826 B (límite 380 000).
- **Capturas a 390 px en claro y oscuro** de repaso, Hangul, laboratorio, Estudiar e Inicio.

## Pendiente de la Fase 3
- Sustituir las preguntas plantilla (estrategia/requisito/meta) de `practice-tests.ts` y `foundation-practice-tests.ts` por ítems reales con distractores plausibles.
- Test de nivel que desbloquee etapas (hoy `isStageUnlocked` es lineal) y reintentos sacados de un banco mayor.
- Plan diario generado en Inicio (repaso, etapa nueva y acción GKS). Hoy el repaso aparece como tarjeta propia.
- Feedback de voz con Web Speech API: palabras por minuto, muletillas y shadowing.
- Criterios más robustos para el chatbot de entrevista.
- Reordenar por dificultad las etapas de escucha y pronunciación en coreano.
