# Validación y reparaciones de las historias 51–54

Fecha: 13 de octubre de 2026. Rama de trabajo: `codex/learning-stories-validation`.

## Resultado y alcance

Revisión del código, regresión automatizada y recorridos interactivos locales. Se conservó la validación que ya estaba preparada en la rama y se hizo una segunda revisión, con pruebas y recorridos nuevos. No se publicó ni se modificó producción durante esta validación. El registro anterior utilizó resultados ficticios en `127.0.0.1:5181`; la segunda revisión usó `127.0.0.1:5183` para un usuario nuevo y `127.0.0.1:5184` para el ascenso ficticio. No se usaron respuestas ni grabaciones personales.

| Historia | Comprobación | Resultado |
| --- | --- | --- |
| 51. Voces y acentos | Selección real por idioma/acento, ritmo, guardado, catálogo tardío, fallos y cancelación | Funcional; la disponibilidad y calidad final dependen del motor y de las voces del dispositivo. Se corrigió la coordinación entre reproductores. |
| 52. Identidad cultural | Inglés/coreano en tarjetas, espacios, rutas, sesiones y resultados; tres idiomas de interfaz; temas y tamaños | Identidad y textos correctos, SVG decorativos accesibles y sin desbordamientos en las vistas revisadas. Se conservaron los estilos existentes. |
| 53. Animaciones | Animaciones finitas, interacción táctil/teclado, preferencia de movimiento reducido y pantallas lentas | Se conservó el movimiento ligero; el desplazamiento ahora respeta también `update: slow`, y cambiar entre la ruta inicial y avanzada vuelve al encabezado. |
| 54. Ascenso avanzado | Toda la cadena, aislamiento de idiomas, enlaces directos, archivo, reintentos, límites de producción y restauración | Ascenso automático tras 132 aprobaciones por idioma; 18 retos avanzados por idioma. Se reforzaron las dependencias avanzadas y la conservación del progreso. |

## Incidencias reparadas

1. **Cancelación global de audio entre reproductores.** Un reproductor inactivo podía ejecutar `cancel()` y detener otro. La reproducción ahora tiene un propietario por motor; interrumpirlo notifica inmediatamente al reproductor anterior. Se invalidan sus callbacks y sus temporizadores sin conceder escucha completada.
2. **Suspensión y regreso a la app.** El audio y el micrófono se liberan al ocultar la página o salir de ella. No se conserva un estado visual de reproducción/grabación que ya no está activo.
3. **Fragmentos Unicode demasiado largos.** La división por caracteres podía superar el límite UTF-16 al incluir emoji. Se conserva el orden y no se cortan pares sustitutos; también se rechazan límites no válidos.
4. **Preferencias de voz desactualizadas.** Los reproductores y otras pestañas reciben los cambios de idioma/acento/voz/ritmo. Los idiomas y las claves de QA siguen separados; el evento local funciona aunque el almacenamiento esté bloqueado.
5. **Grabaciones tardías de otro ejercicio.** La petición del micrófono, los datos y el evento de finalización pertenecen a una única sesión. Una respuesta tardía después de salir libera el stream y no entrega una grabación al ejercicio siguiente. Se evitan solicitudes duplicadas y se rechazan grabaciones vacías.
6. **Salto de una etapa avanzada con un resultado aislado.** El tercer reto ya no se abre por tener únicamente el segundo aprobado: exige los anteriores de su habilidad. Se conserva la política original de prerrequisito inmediato de la ruta inicial para no romper la compatibilidad v1.
7. **Restauración inconsistente.** Se valida la fecha, se recupera la mejor puntuación a partir de los resultados válidos y un aprobado por debajo del umbral conocido no activa la etapa avanzada. No se retienen campos ajenos al progreso. Las entradas válidas vecinas se conservan.
8. **Pérdida de progreso entre vistas/pestañas.** Abrir una vista ya no escribe una copia antigua al almacenamiento. Antes de guardar una respuesta se combina el progreso conocido y persistido, conservando aprobados, mejor puntuación y resultados de ambos idiomas. Las demás vistas se actualizan por eventos locales y de almacenamiento.
9. **Resultado poco explícito al faltar evidencia.** Se explica que usar solo la transcripción o practicar sin grabación permite aprender y revisar, pero no acredita la producción necesaria para abrir la siguiente etapa.
10. **Encabezado fuera de vista al cambiar de fase.** El archivo y la ruta avanzada restablecen la vista superior sin imponer movimiento a quien lo tenga reducido.
11. **Grabación esperando un cierre que nunca llega.** Una prueba nueva reprodujo que, si el motor no emite `stop`, se retenía el micrófono. Ahora se liberan sus pistas al detener y hay un límite de cinco segundos para recibir los datos finales; si faltan, se informa del fallo, se descartan callbacks tardíos y se puede empezar otra grabación. Salir limpia también ese temporizador.
12. **Preferencias tras vaciar el almacenamiento en otra pestaña.** Se reproduce y corrige la omisión del evento con clave `null`: ambos idiomas vuelven a sus valores predeterminados sin recargar.
13. **Regiones principales duplicadas.** La ruta y las tareas de producción/revisión usaban un `main` dentro del `main` de la aplicación. Ahora son secciones identificadas por su título; la página conserva un único punto principal para tecnologías de asistencia. No cambia la distribución visual.
14. **Pantallas de 320 px con scrollbar.** El ancho mínimo se limita al espacio realmente disponible. Se comprobó en navegador un ancho de documento y contenido de 305 px, sin desplazamiento horizontal de la página.

Los primeros casos de audio/Unicode/desbloqueo se reprodujeron con cinco pruebas fallidas antes de aplicar sus reparaciones. La batería posterior incorpora también permisos denegados, constructores y motores que lanzan errores, callbacks tardíos y limpieza de listeners.

## Pruebas automatizadas

- `pnpm validate`: arquitectura, pruebas, TypeScript y compilación de producción.
- `pnpm build:qa`: compilación de la variante QA y fallback de Pages.
- `git diff --check`: sin errores de espacios.
- 384 pruebas en 46 archivos; 29 pruebas adicionales respecto a las 355 iniciales.
- Barrido de las **300 actividades**: 132 iniciales + 18 avanzadas por idioma. Para cada una se comprueban los intentos 1, 2, 3 y 7: **1.200 configuraciones de intento**, respuestas/feedback coherentes, aprobado con evidencia, no aprobado sin ella, fallo sin respuestas y ausencia de mutaciones del catálogo.
- Simulación de la ruta inicial en orden inverso de habilidades, ascenso solo al último aprobado, final de la ruta avanzada, restauración y conservación del archivo.
- Límites mínimo/máximo de palabras y caracteres; umbral avanzado del 80 %; progreso corrupto, otros idiomas y claves desconocidas.
- Selección de los diez acentos ingleses configurados con catálogos simulados, coreano estándar, fallback real, voces duplicadas, carga tardía y ausencia de voces.

El barrido automatizado no significa que se hayan resuelto manualmente los 300 ejercicios ni que se haya juzgado lingüísticamente cada producción libre.

## Recorridos reales en navegador

1. Usuario nuevo: Estudio → espacio de inglés → ruta → Pronunciación. Identidad cultural y seis habilidades visibles; el chatbot no aparece dentro del espacio inmersivo.
2. Catálogo real del equipo: David, Mark y Zira, todos `en-US`. Se seleccionó Zira y ritmo claro; la reproducción terminó, y la voz persistió al recargar. Después se comprobó el cambio a Mark y ritmo natural en otra pestaña.
3. Último ejercicio de escritura inicial en **ambos idiomas**: redacción propia, checklist y cuatro respuestas correctas; resultado 100 y enlace automático al primer reto avanzado.
4. Recarga de la ruta inglesa: `English C1`, `0/18`, ruta inicial conservada `132/132` y retorno al reto avanzado.
5. Lectura avanzada inglesa: redacción propia de 60–100 palabras, un error deliberado sobre asistencia frente a aprendizaje y cuatro aciertos. Feedback específico, resultado **80**, siguiente etapa abierta; reintento con borrador/checklist vacíos, botón bloqueado y cronómetro `10:00`.
6. Escucha avanzada coreana sin voz instalada: lectura del guion, checklist y cinco aciertos. Resultado **100 en respuestas**, evidencia incompleta y **sin enlace al segundo reto**. La explicación final indica cómo verificar la escucha.
7. Enlace avanzado inglés sin completar la base: redirección a la ruta inicial. Tercer reto con progreso avanzado incompleto: redirección a la ruta, sin salto.
8. Dos pestañas: una observó `131/132`, y recibió el cambio a `English C1` sin recarga al terminar la otra. El coreano conservó sus `131/132` resultados.
9. Escritorio, portátil y móvil: tamaños solicitados 1440×1000, 1280×800 y 390×844; se revisaron temas claro/oscuro e identidad de ambos idiomas. Los anchos de documento y contenido coincidieron en las comprobaciones (1425, 1265 y 375 px, descontando scrollbar).
10. Carga limpia final y navegación entre archivo/avanzado: consola sin errores; encabezado visible después del cambio de fase.

Durante la edición hubo un aviso de React Fast Refresh por cambiar dependencias de hooks. No se reprodujo tras una carga limpia final; no se contabiliza como fallo de producción.

## Qué se aprende y límites pendientes

### Segunda revisión interactiva

- Recorrido desde Estudio con un usuario nuevo: redacción de dos frases, checklist y cuatro preguntas de lectura. Un error deliberado produjo una microlección sobre acción, lugar y plazo; el resultado de 75 % abrió la segunda etapa y persistió al volver al mapa.
- Voz real instalada Zira, ritmo claro: se comprobó el fin de reproducción y la conservación de ambos ajustes al recargar. No se evaluó auditivamente su naturalidad en esta segunda revisión.
- Coreano sin voz instalada: botón de reproducción deshabilitado y explicación; la transcripción mostró un modelo coreano, sin sustituirlo por una voz inglesa.
- Enlace directo avanzado con solo una aprobación inicial: redirección correcta a `1/132`.
- Fixture aislada y temporal con 132 aprobados por idioma: redacción propia de 60–100 palabras, cuatro aciertos y un error deliberado en lectura avanzada. Resultado 80 %, siguiente ejercicio `en-c1-reading-02`, archivo `132/132` y recarga de `English C1` conservando el aprobado. Los datos del ascenso se simularon; no se resolvieron manualmente las 132 etapas.
- Una sola región `main`; temas claro/oscuro y anchos 320, 390, 1280 y 1440 px. No se observaron errores de consola en las cargas revisadas. Una pestaña antigua no tenía servidor activo; se creó el escenario nuevo en otro origen en vez de tratar ese fallo de conexión como defecto de la app.

### Valor educativo y límites

Los ejercicios realizados trabajan adaptación a restricciones, concesión con `although`/`-지만`, exactitud de cifras, alcance de la evidencia, representatividad, inferencia y recomendaciones condicionales. El error deliberado recibió una explicación útil: asistencia y aprendizaje no son la misma medida, seguida de un ejemplo y una aplicación nueva.

- **Voces:** en este equipo no había voz coreana ni acentos británico/asiáticos instalados. Se verificaron esos casos con simulaciones y el fallback real, no con audición nativa de todos los acentos. La selección no convierte una voz antigua en neuronal ni inventa dialectos coreanos.
- **Móvil:** se validó el responsive en el navegador de escritorio. Faltan pruebas físicas de sonido, suspensión y micrófono en Safari/iOS y Chrome/Android. No se aceptaron permisos ni se grabó una persona; las carreras del micrófono se probaron con streams/recorders simulados.
- **Aprendizaje:** escritura y pronunciación siguen usando revisión guiada/autorrevisión, no evaluación automática de calidad lingüística. Los segundos de habla son una orientación, no un requisito medido. C1 es una etapa de práctica y, en coreano, una denominación interna sin equivalencia oficial TOPIK.
- **Rendimiento:** la animación cultural no usa ciclos infinitos ni bloquea contenido. El catálogo avanzado sigue en un fragmento diferido. Permanece el aviso previo de Vite de un bundle inicial superior a 500 kB; esta validación no lo presenta como resuelto ni garantiza fluidez en todos los dispositivos.
- **Persistencia:** el progreso es local al navegador, no una cuenta sincronizada entre dispositivos ni una transacción centralizada para escrituras exactamente simultáneas.

## Referencias técnicas

- [Mozilla/MDN: `SpeechSynthesis.cancel()` cancela la cola del motor](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel).
- [Mozilla/MDN: cambios del catálogo de voces](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event).
- [Mozilla/MDN: voces disponibles en el dispositivo](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices).
- [Mozilla/MDN: eventos finales encolados al detener una grabación](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/stop).
- Detalles originales: `docs/STUDY-VOICES.md`, `docs/LANGUAGE-CULTURE.md`, `docs/LANGUAGE-MOTION.md` y `docs/ADVANCED-LANGUAGE-PATHS.md`.

Las entradas temporales de preparación del navegador se retiraron después de las pruebas. No se añaden mecanismos para marcar ejercicios como aprobados en producción.
