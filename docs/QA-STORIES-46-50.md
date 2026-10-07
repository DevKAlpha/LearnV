# Validación de historias 46–50

Fecha: 7 de octubre de 2026. Alcance: navegación, primera experiencia, progresión y restricciones de QA. Datos ficticios y navegación local, sin modificar producción.

## Resultado por historia

| Historia | Hallazgos y reparaciones | Verificación |
| --- | --- | --- |
| 46 · Rama QA | La rama existente `qa` estaba atrasada respecto a `main`. Se integraron localmente las mejoras actuales. Inicio, Estudio, idiomas, pruebas, simulador, preparación de entrevista y chatbot siguen disponibles. Beca, Documentos y Perfil no aparecen ni son accesibles por URL. Ayuda, recomendaciones y precarga respetan el alcance. | Redirecciones directas, dos opciones de menú, tres durante simulador activo por el botón Reiniciar, ayuda restringida, chatbot y práctica real. |
| 47 · Inicio | Pulsar el texto de una tarea antes la marcaba como terminada. Ahora el título abre la actividad, el recuadro marca su finalización y una explicación aclara la diferencia. Navegar o acumular minutos ya no se interpreta como un diagnóstico de idioma. | Inicio → tarea → regreso mantiene 0/3; casos sin resultados, plan completado y primera tarea pendiente en tests. |
| 48 · Estudio | La guía hablaba de tres habilidades y 60 actividades, aunque ahora hay seis habilidades y 132 actividades por idioma. Se corrigió y se mantiene el recorrido inicial, elección de idioma, siguiente recomendación, apoyo bajo demanda y aplicación avanzada. Análisis y material se importan al abrirlos. | Orden y enlaces en es/en/ko, contenido avanzado sin montar al entrar, sesión real con feedback y desbloqueo persistente. |
| 49 · Beca | Los accesos rápidos llegaban a contenido cerrado. Ahora abren requisitos o certificaciones y desplazan al destino, también desde un enlace directo tras recargar. El catálogo avanzado se importa solo al desplegarlo; vídeos no insertan iframes al entrar. | Accesos rápidos, `#gks-certifications` directo y recargado, requisitos, contenido avanzado plegado. |
| 50 · Documentos | Conteos vulnerables a identificadores duplicados/desconocidos y etapa inicial innecesaria al terminar todo. Se centralizó la planificación, se abre la primera etapa pendiente, se conserva la reanudación y se ofrece continuar con la siguiente etapa con foco accesible. | 0/7 → 3/7 → 5/7 → 6/7 → 7/7, recarga, desmarcar/reanudar y foco en el resumen siguiente. |

## Protección de QA y producción

- El alcance se elige al compilar. `pnpm dev:qa` y `pnpm build:qa` habilitan QA explícitamente. En la rama `qa`, los comandos ordinarios también seleccionan QA; `--mode full` sirve para comprobar la aplicación completa. `VITE_APP_SCOPE=full` o `learning-qa` permite elegirlo explícitamente.
- Guardados de avance, pruebas, recursos, simulador, entrevista, guías y logs tienen prefijo `qa:` en QA. No se copia, borra ni migra el progreso de producción hacia QA. Preferencias visuales e idioma pueden seguir compartidas.
- El filtro de rutas es una limitación funcional, no autenticación ni una barrera de seguridad para contenido confidencial. No se debe colocar información sensible en el paquete QA.
- El flujo nuevo `.github/workflows/qa-learning.yml` valida la rama y conserva un artefacto descargable; no publica GitHub Pages. Su ejecución remota queda pendiente de publicar los cambios.
- Las restricciones no se implementan borrando las pantallas completas: el mismo código conserva las cinco opciones en modo completo, para que integrar mejoras de QA no desactive producción.

## Pruebas ejecutadas

### Automatizadas

`pnpm run validate`: arquitectura, **229 pruebas en 31 archivos**, TypeScript y compilación QA correctos. También pasó `pnpm exec vite build --mode full --outDir dist-full-qa-validation`.

Se añadieron/ampliaron casos para rutas QA y rutas completas, claves separadas, planificación documental, recomendaciones sin diagnóstico, orden de páginas, contenido plegado y textos/guías en español, inglés y coreano. La suite existente también cubre recuperación de carga, idiomas, aprendizaje escalonado, recomendaciones, entrevista y logs.

El primer intento restringido no pudo iniciar esbuild (`EPERM` del entorno); la ejecución con permiso para procesos de compilación terminó correctamente. No era un fallo de la app.

### Navegación real en navegador

- Primera visita con guía, navegación Inicio/Estudio, ayuda y apertura del chatbot en QA. El botón flotante se mantiene oculto durante los módulos de idioma y las pruebas.
- URLs de Beca, Documentos y Perfil en QA redirigen a Estudio; no quedan enlaces internos a esas pantallas en apoyo, guía o recomendaciones.
- Catálogo actualizado: 132 pruebas por idioma, 22 por habilidad. Una sesión de lectura inglesa completada con respuesta correcta y un error deliberado: resultado 75/100, explicación del error, microlección, aplicación y siguiente ejercicio desbloqueado. Al recargar: 1/132, mejor resultado 75%, segunda etapa disponible. La producción escrita se revisa de forma guiada, no se afirma que tenga evaluación automática libre.
- Simulador escrito disponible en QA y menú Reiniciar al activarlo. Preparación de entrevista y chatbot accesibles; respuesta ficticia del chatbot con feedback y seguimiento. No se reprodujeron de nuevo todas las personalidades ni se completó una entrevista de cuatro turnos en esta revisión.
- Documentos recorridos hasta 7/7 y reanudación comprobada. Las etapas permanecen accesibles: el orden es de dificultad, no un bloqueo. Se añadió la advertencia de pedir certificados, apostillas, traducciones y citas de examen con antelación, porque sus plazos pueden ser largos.
- Beca abre los destinos plegados correctamente, incluyendo recarga con hash. La revisión no cambió requisitos oficiales ni puntuaciones de certificados.
- Navegación local sin errores de consola observados durante los recorridos registrados.

### Responsive

Aplicación completa: Inicio, Estudio, Beca y Documentos a 390×844, 1366×900 y 1920×1080 sin desbordamiento horizontal. A 390 px también se comprobó modo claro y oscuro. QA: Inicio/Estudio comprobados en móvil, portátil y PC; dos opciones visibles y distribución correcta del menú.

## Límites y pendientes

- Es emulación responsive en navegador, no una prueba en un teléfono físico ni Safari iOS. No simula varios días de suspensión real o una red móvil intermitente.
- No se completaron manualmente las 264 actividades ni todas las combinaciones de progreso. Los datos y reglas se verificaron mediante la suite; la sesión manual valida el recorrido representativo.
- No se midieron métricas Lighthouse, FPS o tiempos de carga en un dispositivo físico. La optimización aplicada elimina montaje/importación inicial de paneles avanzados, sin afirmar una mejora porcentual no medida.
- No se validó de nuevo la vigencia legal/administrativa de fuentes externas de la beca: no forma parte de estas historias de organización.
- Al finalizar la revisión inicial, los cambios estaban preparados localmente sobre `qa`, con integración de `main` pendiente de commit. No se publicó nada durante esa revisión. La publicación posterior requiere autorización expresa del usuario y mantiene el alcance completo en `main` y el restringido en `qa`.
