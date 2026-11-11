# Fase 0 · Correcciones críticas

Implementación y revisión: **10 de noviembre de 2026**. Rama `feature/phase0-critical-fixes`, creada desde `main` (`dc2701e`). `prerelease` está 105 commits por detrás de `main`, así que se partió de `main` y la rama debe integrarse por PR.

Forma parte del plan de mejoras por fases: 0 correcciones → 1 calidad y seguridad → 2 sistema visual → 3 motor de aprendizaje → 4 beca → 5 hábito → 6 backend Express → 7 inmersión.

## Cambios

### Progreso y racha
- **Las tareas de «Hoy» se reinician cada día.**
  - `learnv-progress-v1` guarda ahora `taskDate` (fecha local).
  - `normalizeGksProgress` y `resolveDailyTasks` (`domain/models/home-plan.ts`) solo cuentan las marcas del día. El hook se refresca a medianoche, al volver a la pestaña y al recuperar el foco.
  - Las marcas antiguas sin fecha se descartan; los documentos se conservan.
  - Se añade sincronización entre pestañas.
- **Preparación más honesta.** `readinessScore`: documentos 45 %, etapas de idioma aprobadas 40 %, plan de hoy 15 %. Antes marcar tres casillas sumaba 55 puntos. QA conserva su cálculo.
- **Sin inflar la racha.**
  - Marcar y desmarcar la misma tarea, documento o recurso el mismo día solo cuenta una vez (`recordLearningEvent`).
  - Las sesiones ya no ocupan la ventana de 60 actividades, de modo que no desplazan la práctica que usan el análisis y la adaptación de entrevistas.
  - La migración v1→v2 ordena las actividades de la más reciente a la más antigua.
- **Favicon:** usa los totales validados y divide entre `TESTS_PER_LANGUAGE` (132), no entre 30.

### Robustez de datos
- **Journey:**
  - `normalizeLearningJourney` y `normalizeLearningEvent` validan cada campo: un valor corrupto ya no tumba la aplicación.
  - La escritura sale del updater de React (StrictMode) y pasa a un efecto.
  - Los eventos `learnv:learning-journey` se validan antes de registrarse.
- **Borradores:** `normalizeWrittenSimulator` valida el simulador escrito; la práctica de entrevistas filtra preguntas desconocidas y normaliza respuestas y casillas.
- **Diagnóstico en Pages:**
  - `appRelativePath` quita la base `/LearnV/` antes de resolver el área.
  - Se añade el área `app-shell`, así que los fallos de Inicio, Beca, Documentos y Perfil también se registran.
  - `RouteRecoveryBoundary` distingue un fallo de carga (recarga controlada) de un error de render (reintento suave + «Ir al inicio», sin recargar).

### Contenido
- 학생 termina en **ㅇ**, no en ㄱ (ES/EN/KO), con test de regresión.
- **Escucha:**
  - Las etapas de extensión de escucha ya no muestran el guion encima de cada pregunta: se oye con `LearningAudioPlayer`, que mantiene la transcripción a demanda.
  - Se actualizó la prueba de la historia anterior que fijaba el comportamiento antiguo.
- **Documentos:**
  - Se añaden carta de recomendación y compromiso/autoevaluación médica (ES/EN/KO).
  - Las etapas pasan a 4 + 3 + 1 + 1.
- **Elegibilidad:**
  - Se explicita la edad según la guía 2027.
  - Se añaden «sin grado previo ni beca coreana de grado previa» y «buena salud». La redacción es prudente y remite a la guía.
- **Medicina:** aviso de que Medicina u Odontología pueden estar restringidas para becarios; confirmar en University Information 2027.
- **Simulador escrito:** referencias y fuente actualizadas a 2027.
- **Radar:** si la última comprobación tiene más de 48 h, la píldora pasa a «Datos sin actualizar», se muestra un aviso con los días transcurridos y el pie deja de anunciar «24 h». Hoy el JSON es del 21-09-2026, así que el aviso aparece.

### Plataforma
- Se elimina `scroll-behavior: smooth` global, que contradecía `ScrollToTop`.
- **Tema:**
  - Sigue al sistema (incluidos cambios en vivo) hasta que la persona elige; solo entonces se guarda.
  - `theme-color` coincide con el fondo en ambos temas (`#140b19` oscuro), antes y después de que arranque React.
- El loader inicial usa el idioma del navegador cuando no hay preferencia, igual que `I18nContext`.
- **Copia de seguridad completa** en Perfil:
  - Exporta e importa en JSON todos los datos de LearnV del dispositivo, excepto diagnósticos y cachés, con vista previa y confirmación antes de sustituir.
  - Escribe primero y deshace los cambios si el almacenamiento falla.
  - Respeta el ámbito QA y nunca sube nada.
- **Almacenamiento persistente:**
  - Se solicita `navigator.storage.persist()` solo a quien ya tiene progreso.
  - El panel muestra el estado y permite pedirlo.
  - Va en un módulo mínimo (`storage-persistence.ts`) para no engordar el arranque.

## Verificación

- `tsc -b` sin errores. `check:architecture` validado.
- Vitest: **73 archivos / 773 pruebas** (antes 67 / 751). Nuevas pruebas en estos ficheros:
  - `daily-progress.test.ts`, `learning-journey-integrity.test.ts`, `gks-radar.test.ts`;
  - `app-scope.test.ts`, `device-backup.test.ts`, `korean-content-accuracy.test.ts`;
  - un bloque nuevo en `written-simulator.test.ts`.
- **Build de producción, arranque:** 449 564 B / 148 482 B gzip (límite 450 000 / 150 000), con los bancos de preguntas en carga diferida. **Margen muy justo:** la Fase 2 separará las traducciones por idioma.
- **Revisión en navegador** (`vite preview`, escritorio, EN, oscuro y claro):
  - el aviso de radar desactualizado aparece en Beca;
  - el panel de copia es legible en ambos temas;
  - la consola no muestra errores.
- Pendiente para la Fase 1: pruebas de hooks en jsdom y e2e con Playwright a 320/390 px.

## Límites

- El recorrido guiado (`SectionTour`) sigue abriéndose solo y bloquea el scroll; se corrige en la Fase 2.
- Los cambios de elegibilidad y documentos deben cotejarse con la guía GKS-U 2027 revisión 0914 antes de publicar.
- `pnpm validate` invoca `pnpm` dentro de los scripts; en este equipo se ejecutaron los pasos por separado con `corepack pnpm@11.19.0`.
