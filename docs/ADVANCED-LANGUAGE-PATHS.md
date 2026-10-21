# Historia 54 — transición automática a práctica avanzada

## Comportamiento

- Cada idioma conserva su ruta inicial de 132 actividades (22 por cada una de las seis habilidades).
- Al aprobar **todas las actividades conocidas de ese idioma**, la entrada de Estudio, su espacio, el recorrido y el perfil muestran automáticamente la etapa avanzada. Completar inglés no desbloquea coreano, ni viceversa.
- Se añaden 18 actividades por idioma (3 por habilidad): **36 nuevas, 300 disponibles entre ambas etapas e idiomas**.
- La transición se deriva del progreso, no de una bandera que pueda quedar desactualizada. Funciona también al volver con resultados v1 ya completos.
- Los IDs iniciales y la clave de almacenamiento no cambian. Los nuevos IDs usan `en-c1-<habilidad>-<n>` y `ko-c1-<habilidad>-<n>`. QA mantiene su prefijo separado.
- `?phase=foundation` permite repasar la ruta anterior. No es una vía para desbloquear retos. Los enlaces directos a una etapa avanzada están bloqueados hasta completar la ruta inicial.
- La última aprobación inicial ofrece una actividad avanzada como siguiente paso, incluso si las habilidades se completaron en otro orden. Cada habilidad avanzada mantiene su propia secuencia.
- Las repeticiones no borran aprobaciones ni mejores notas. Al terminar las 18 actividades, se conserva la etapa y se propone repasar; no se genera una cadena interminable ni un C2 ficticio.

## Complejidad y aprendizaje

Tres escenarios ficticios originales por idioma permiten aplicar un mismo contexto mediante diferentes habilidades, sin introducir otra historia completamente nueva en cada actividad:

1. Flexibilidad, acceso, representatividad y límites de una conclusión.
2. Mentoring, correlación/causación, explicaciones alternativas y evaluación ética.
3. Herramientas automáticas, confianza, consecuencias implícitas y garantías de revisión.

Las preguntas trabajan significado, inferencia, estructuras gramaticales, colocaciones, registro y respuestas a objeciones. Cada opción tiene una explicación propia, una mini-lección, un ejemplo y una aplicación a otra situación. Los distractores se explican, no solo se marcan como incorrectos. Las posiciones correctas varían.

- Cinco preguntas por sesión, incluyendo un breve recuerdo del último ejercicio inicial o del ejercicio avanzado anterior. En las repeticiones se incorporan dos preguntas de transferencia.
- Aprobación: **80 % (4/5) y producción revisada**, frente al 70 % inicial. Una revisión perfecta sin evidencia de producción no desbloquea el siguiente paso.
- Lectura/gramática/vocabulario: respuesta breve de 60–100 palabras en inglés o 140–220 caracteres en coreano, con transferencia de una técnica previa.
- Escritura: síntesis de dos fuentes de 220–260 palabras en inglés o 500–700 caracteres en coreano. Los límites inferiores y superiores se comprueban, ignorando espacios exteriores.
- Escucha: guiones originales con dos perspectivas, interpretación de matices y verificación de evidencia. Usar solo la transcripción permite practicar, pero no acreditar el requisito de escucha.
- Producción oral: defensa de una posición de 90, 105 y 120 segundos, con contraargumento y condiciones para modificar la propuesta. La duración es una consigna de práctica, no una medición automatizada de calidad ni un cronometraje mínimo obligatorio.
- Los avisos detallados se despliegan bajo demanda; no se añaden animaciones continuas, solicitudes externas al abrir la etapa, ni ejercicios acumulativos obligatorios.
- Inicio y las entradas de estudio usan solo metadatos de la etapa avanzada. Sus textos, preguntas y guiones completos se descargan con el módulo diferido de las páginas de pruebas.

## Alcance del nivel

Inglés usa **práctica C1**, tomando como referencia los descriptores de comprensión implícita, expresión precisa y textos estructurados del [Consejo de Europa](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-%20cefr-3.3-common-reference-levels-global-scale).

Coreano usa **reto C1 interno / práctica avanzada**, no una equivalencia con un grado TOPIK. Se conserva la distinción con el [marco oficial TOPIK de NIIED](https://niied.go.kr/web/niied/contents/niied_topik). La etiqueta indica el reto elegido por la app, no un nivel certificado del usuario.

Completar la ruta no demuestra dominio C1. Se mantiene el aviso existente: LearnV puntúa la revisión guiada y no evalúa automáticamente la calidad lingüística de los borradores o grabaciones. Estos son ejercicios iniciales avanzados, no un currículo completo ni un examen oficial. Una revisión docente del contenido coreano y una evaluación independiente del desempeño siguen siendo recomendables antes de atribuir un nivel real.

## Validación realizada — 12 de octubre de 2026

Resultado final: **355 pruebas en 43 archivos**, arquitectura y compilaciones de producción y QA correctas. `git diff --check` sin incidencias. El contenido avanzado queda en un módulo diferido de aproximadamente 74 kB (25,57 kB comprimidos), separado del paquete inicial. Sigue existiendo un aviso de Vite por el paquete principal superior a 500 kB; no se afirma que toda la carga inicial de la app haya quedado optimizada.

Pruebas automatizadas:

- 131/132 frente a 132/132, resultados ajenos al catálogo, una sola habilidad completada y marcadores de aprobación malformados.
- Independencia de idiomas, restauración v1, archivo de repaso y rechazo de rutas adelantadas.
- Transición desde cualquiera de las seis habilidades al completar la última actividad inicial.
- Secuenciación avanzada, repetición fallida después de aprobar y finalización sin reinicio.
- Catálogo: IDs, opciones, feedback, lecciones, ejemplos, transferencia, enlaces de recuerdo y requisitos de producción.
- 80 % frente a 60 %, producción ausente y límites de longitud en ambos idiomas.
- Páginas en español, inglés y coreano: promoción, contadores, enlaces, archivo, tareas escritas y fin de etapa.

Revisión interactiva local, con progreso inicial sintético en un puerto separado del entorno normal:

- Acceso directo adelantado con usuario nuevo redirigido al recorrido inicial.
- Archivo inicial 132/132 y regreso al reto 0/18.
- Inglés: respuesta propia de 79 palabras, una inferencia incorrecta deliberada, feedback específico, resultado 80 %, siguiente actividad desbloqueada y progreso 1/18 conservado tras recargar.
- Coreano: respuesta propia de 182 caracteres, revisión completa, resultado 100 % y siguiente actividad desbloqueada.
- Vista de escritorio y móvil, sin desbordamiento horizontal observado en el recorrido y el resultado revisados.

Los escenarios sintéticos no modificaron el progreso de producción. El acceso temporal usado para la revisión se elimina del código antes de entregar. El micrófono y la calidad de las voces no se verificaron en esta historia; se conserva el sistema de audio existente.
