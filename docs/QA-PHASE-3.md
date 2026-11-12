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

## Segunda entrega (12 de noviembre de 2026)

### Preguntas reales en lugar de plantillas
- **Lectura, gramática y vocabulario** (120 etapas). Antes, 3 de cada 4 preguntas eran meta («¿qué principio…?») con distractores absurdos («la opción más larga siempre es correcta»). Ahora:
  - **Principio:** la regla del ítem frente a 3 reglas reales de otras etapas de la misma habilidad.
  - **Modelo:** el ejemplo que aplica la regla frente a ejemplos reales de otras etapas.
  - **Cuarta pregunta** (solo en la primera etapa): «¿Qué frase es correcta?» con el hueco rellenado con cada opción, o «¿Qué regla sigue este ejemplo?».
  - Desde la segunda etapa, `connectPracticeStages` ya la sustituía por un repaso del paso anterior; se mantiene.
  - **Reintentos:** la frase correcta más un repaso de dos etapas atrás (la primera etapa adelanta la siguiente).
- **Escritura, escucha y pronunciación:**
  - «Estrategia» (genérica) pasa a ser «¿Qué respuesta no cumple la tarea?».
  - El cuarto ítem pasa a ser «¿Qué respuesta contesta a esta tarea?» (el modelo frente a buenos modelos de otras tareas). En vídeo se mantiene la variedad de habla.
  - Las opciones de «modelo» y «reescritura» usan respuestas reales de otras tareas en vez de frases como «añade very, really».
  - Las preguntas tomadas de otra etapa muestran el modelo de su etapa en el feedback.
- **Una prueba lo vigila:** no hay opciones repetidas ni los distractores absurdos de antes. Lo comprueba sobre todas las preguntas de las dos rutas.

### Test de nivel (`/study/level-test`)
- **Adaptativo por habilidad** (lectura, gramática y vocabulario):
  - Comprueba 5 niveles (etapas 3, 6, 10, 14 y 18), con 2 preguntas reales por nivel.
  - Hay que acertar las dos para subir; el primer fallo cierra esa habilidad.
- **Solo desbloquea etapas** (`isStageUnlocked` acepta `placed`). No marca nada como aprobado, ni suma progreso, racha o preparación; el E2E comprueba que no escribe progreso.
- **Nunca vuelve a bloquear** lo que se desbloqueó.
- Escritura, escucha y pronunciación no se saltan.
- Se guarda en `learnv-placement-v1` y se enlaza desde la ruta (si llevas menos de 12 etapas), desde Estudiar y desde Repaso.

### Feedback de voz en la práctica oral
- **«Transcribir y comparar con el modelo»** es opcional y usa el reconocimiento de voz del navegador. La interfaz avisa de que el audio lo procesa el servicio en línea del navegador; LearnV no guarda nada.
- **Mide** (`speech-feedback.ts`):
  - ritmo: palabras por minuto en inglés, sílabas por minuto en coreano;
  - muletillas;
  - palabras clave del modelo dichas o que faltan; en coreano se comparan por raíz, así que las partículas pueden cambiar.
- Muestra la transcripción y avisa de que puede tener errores.
- Sin soporte en el navegador, remite al grabador.

### Chatbot de entrevista (rúbrica `structural-v2`)
- Un número solo cuenta como evidencia si mide algo (*12 estudiantes*, *30 %*, *3 개월*); un año suelto no.
- 12 palabras de relleno o repetición ya no cuentan como respuesta directa (código `answer-padded`).
- En coreano se detectan los resultados (늘었, 줄였, 성공…).

### Escucha en coreano por dificultad
- Empieza por historias graduadas y diálogos lentos de Sejong; después, información y habla natural. Las canciones se reparten por la ruta.
- Antes, la etapa 1 era una conversación natural de una hora.
- Los ID siguen la posición: una etapa aprobada antes conserva su estado, aunque ahora corresponde al contenido de esa posición.

### Verificación (segunda entrega)
- **Vitest:** 87 archivos / 841 pruebas. **Playwright:** 87/87, con la ruta del test de nivel y su flujo.
- Lint (0 avisos), `tsc -b`, arquitectura, build, CSP y presupuestos:
  - JS de arranque: 377 866 B;
  - CSS de arranque: 377 826 B.
- Capturas a 390 px del test de nivel y de la práctica oral, en claro y oscuro.

## Pendiente (pasa a fases posteriores)
- **Plan diario generado en Inicio** (repaso, etapa nueva y acción GKS). Pasa a la Fase 5, que integra tablero y hábito diario; hoy el repaso tiene su propia tarjeta.
- **Grabación y transcripción en `InterviewPrepPage`.**
- **Más ítems redactados a mano por etapa** (hoy se reutilizan reglas, ejemplos y frases del banco). Requiere revisión nativa del coreano.
