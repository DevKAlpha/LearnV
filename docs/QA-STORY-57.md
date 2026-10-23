# Historia 57 · Retomar inglés B1 y coreano TOPIK I

Entrega original: 20 de octubre de 2026, rama `story57-learning-restart`, a partir del QA sincronizado `65e82f5`. Las secciones iniciales conservan esa validación. El ajuste del 21 de octubre se documenta al final y sustituye el contenido pedagógico original.

## Alcance y ubicación

En Estudio → espacio de Inglés/Coreano, el **Módulo 00** aparece antes de la tarjeta de la ruta existente. Es un repaso opcional de tres microlecciones, no un curso completo, una prueba de nivel ni una certificación. No añade requisitos, no reinicia las 132 actividades ni modifica el reto avanzado.

- Inglés B1: mensaje cotidiano con cambio de hábito; present perfect con since/for; petición cortés con motivo y propuesta.
- Coreano TOPIK I: presentación breve; destino/lugar con 에/에서; horarios y planes cotidianos. Se aclara el requisito de lectura de Hangul y la diferencia entre las áreas oficiales de TOPIK I y la práctica adicional de LearnV.
- Cada microlección incluye explicación, ejemplo original, pregunta, feedback y una propuesta de aplicación en el cuaderno. Solo una respuesta correcta marca la lección; un fallo explica la idea y permite reintentar sin límite ni cronómetro.
- La introducción explica producción propia → revisión → preguntas, las seis habilidades de la ruta completa, criterio de aprobado y desbloqueo por habilidad. La guía contextual también presenta el nuevo módulo antes de las pruebas.
- Ayudas en español, inglés y coreano. Se toma el idioma general de la app, no el idioma de inmersión de la ruta. El selector solo cambia este módulo; ejemplos y respuestas conservan el idioma estudiado, con `lang` explícito.

## Persistencia y QA

Se guardan únicamente los identificadores de las microlecciones completadas en `learnv-restart-v1:en` y `learnv-restart-v1:ko`. QA aplica el prefijo `qa:`. No hay migración ni escritura de resultados de pruebas existentes, borradores, grabaciones o respuestas. Se filtran valores desconocidos y duplicados y se combinan avances de vistas antiguas. Si el navegador rechaza el guardado, se mantiene el avance en memoria y aparece un aviso.

Sin nuevas rutas, permisos, dependencias ni cambios del workflow de despliegue. QA mantiene Inicio/Estudio; Beca/Documentos/Perfil continúan restringidos. La base pública sigue siendo `/LearnV/qa/` cuando se publique.

## Verificación automatizada

- `pnpm run validate`: arquitectura, 522 pruebas en 53 archivos, TypeScript, build completo y presupuesto inicial.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: build restringido y comprobación de la base.
- Las 22 pruebas nuevas cubren datos y respuestas de las seis lecciones, tres idiomas de ayuda, recuperación, repetición sin duplicados, entradas corruptas, almacenamiento denegado, combinación de avances, aislamiento QA/producción e inglés/coreano, orden antes de la ruta, conservación de contadores y montaje diferido del ejercicio.
- Se amplía la regresión de claves QA para el progreso del repaso.
- Carga inicial de JavaScript: 418 072 B / 137 606 B gzip en build completo y 418 058 B / 137 798 B gzip en QA. Ambos pasan el límite de 450 000 / 150 000 B; los bancos de preguntas siguen diferidos. El módulo y sus estilos se incluyen en el chunk de la página de idioma, no en la entrada inicial. Sin dependencias nuevas.

## Pruebas manuales sobre el bundle QA compilado

Servidor estático local con prefijo `/LearnV/qa/`, no solo servidor de desarrollo:

- Inglés: respuesta inicial deshabilitada; fallo sin crédito; reintento correcto; tres lecciones hasta 3/3; CTA a la ruta existente; recarga recupera 3/3 y la ruta conserva 0/132.
- Coreano: empieza en 0/3 pese al repaso inglés completo; se completan sus tres lecciones; cambio de idioma no arrastra respuestas; recarga conserva el avance.
- Abrir enfoca «Cómo se aprende aquí»; avanzar enfoca el título de la nueva lección. Inputs nativos, fieldset/legend, progreso etiquetado y feedback anunciado mediante status.
- Móvil 320 px con el módulo abierto: sin controles ni texto fuera del ancho. Tableta 768 px y escritorio 1280 px. Revisión visual en claro y oscuro.
- Se reutilizan los SVG locales con el prefijo QA; no se añaden imágenes bitmap ni animaciones. No hay errores de consola de la app durante el recorrido.

La verificación manual no sustituye una auditoría completa de accesibilidad ni una evaluación pedagógica de un curso B1/TOPIK I completo. No se declara una mejora de velocidad medida con Lighthouse.

## Ajuste del 21 de octubre · herramientas que se usan en la ruta

Implementación en `story57-intro-bridge`, desde producción `8a2bc85`, preparada para integrar en `main`. Se mantienen tres microlecciones por idioma, con orientación de 6–8 minutos (estimación, no límite). Se sustituyen temas genéricos por un puente directo hacia las primeras actividades:

| Herramienta | Inglés | Coreano |
| --- | --- | --- |
| Lugar, acción y pistas del texto | `en-reading-01` · Read a campus notice | `ko-reading-01` · 표지판 읽기 |
| Elegir una forma a partir de una señal | `en-grammar-01` · Routine or action now | `ko-grammar-01` · 이에요/예요 선택 |
| Idea/objetivo → razón/acción → ejemplo | `en-writing-01` · A focused paragraph | `ko-writing-01` · TOPIK I 문장 연결 |

- Cada lección enseña una regla, una plantilla breve y un ejemplo distinto del ejercicio real; después de comprobar una respuesta correcta permite aplicar la herramienta en su actividad concreta. Las seis actividades existen y están disponibles desde el inicio; no se evita ningún bloqueo.
- `RestartToolCard` es el mismo componente y los mismos datos en ambos módulos. En la actividad aparece plegado bajo «Tras tu borrador», solo durante la producción del primer intento; desaparece durante las preguntas y no se ofrece en reintentos cronometrados, otras actividades o el reto C1. No modifica criterios ni inserta texto o respuestas.
- Volver al repaso abre la microlección correcta en otra pestaña para conservar el borrador. El parámetro `intro` solo acepta los tres IDs conocidos; no añade rutas nuevas.
- Se conserva el progreso de la introducción y de la ruta. Ahora también se guarda la preferencia de ayuda en `learnv-restart-v1:<idioma>:help`, igualmente aislada con `qa:`; las respuestas y borradores no se almacenan.
- Se corrige el umbral descrito en la introducción: proviene de los metadatos reales de la ruta inicial (70 %), en lugar del 80 % del reto avanzado. Se acortan las instrucciones a tres frases operativas.
- Automatización final: 534 pruebas en 53 archivos, arquitectura, TypeScript y builds completo/QA. Las regresiones nuevas verifican títulos/IDs reales, desbloqueo inicial, igualdad exacta de las fichas en tres idiomas, límites de longitud, protección de reintentos, enlace de regreso, preferencias aisladas y parámetros inválidos.
- Manual, bundle QA local: inglés → lectura con la misma ficha en español; borrador intacto al consultar y volver en otra pestaña; ausencia de ayuda al pasar a las preguntas. Coreano → gramática con la misma ficha y conexión de escritura a `ko-writing-01`. Progreso de la ruta conservado (0/132); ayudas y repaso siguen separados por idioma. Móvil 320 px sin desbordamiento de la ficha; tableta 768 px, claro y oscuro. No se enviaron resultados de prueba ni se usó micrófono.

No se han añadido dependencias, imágenes, animaciones ni cambios de despliegue. Las fichas se comparten entre chunks de páginas diferidas; los bancos de preguntas siguen fuera del JavaScript inicial.

## Auditoría del 22 de octubre · historia 57

Base `c506b60`, rama de trabajo `story57-validation`. Publicación en producción mediante integración en `main`; el QA remoto conserva su rama independiente y no se actualiza con esta entrega.

### Reparaciones

- El botón de abrir/cerrar conserva un destino real para `aria-controls` incluso con el repaso plegado. El panel vacío queda oculto y los ejercicios siguen sin montarse hasta abrirlo.
- La preferencia del idioma de ayuda devuelve el resultado del guardado y muestra un aviso traducido si el almacenamiento falla. Cambiar la ayuda sigue funcionando en memoria; no se afirma que esa preferencia se haya guardado.
- Repetir la selección de la microlección actual lleva el foco al título, igual que seleccionar otra. Cada pregunta tiene su propio fieldset al cambiar de lección.
- Una frase breve por idioma aclara los conocimientos previos: comprensión de frases cotidianas para retomar B1 y lectura de Hangul para TOPIK I. No se amplía el repaso de tres microlecciones.

### Verificación automatizada

- `pnpm run validate`: arquitectura, **540 pruebas en 53 archivos**, TypeScript, build completo y presupuesto inicial. `git diff --check`, sin errores.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: build restringido y fallback SPA correctos. Sin dependencias, rutas ni permisos nuevos.
- Nuevas regresiones: destino accesible abierto/cerrado en los tres idiomas de ayuda, ejercicios diferidos, requisitos previos y revisión de un repaso completado sin respuestas preseleccionadas ni crédito en la ruta.
- Persistencia: ambos idiomas × producción/QA × tres ayudas; almacenamiento corrupto, IDs desconocidos/duplicados, cuotas agotadas, recuperación y guardado de progreso independiente del idioma de ayuda. Las pruebas existentes cubren las seis conexiones reales, actividades inicialmente desbloqueadas, fichas idénticas en ambos módulos y ausencia de ayudas en reintentos.
- JavaScript inicial: producción **418 167 B / 137 650 B gzip**; QA **418 153 B / 137 836 B gzip**. El tamaño sin comprimir no aumenta frente a la base. Las adiciones permanecen en páginas diferidas; los bancos de preguntas siguen diferidos. No es una medición de latencia de navegación.

### Recorrido manual sobre QA compilado

Servidor Pages-like local con base `/LearnV/qa/` y origen de pruebas separado, sin modificar datos de producción:

- Inglés y coreano: fallo sin crédito → reintento correcto → siguiente microlección → 3/3; se comprueban el bloqueo del botón sin respuesta, feedback y enlaces hacia actividades reales.
- Cambio de idioma: coreano comienza en 0/3 tras terminar inglés. Regreso a inglés conserva 3/3. La ruta permanece en 0/132; terminar el repaso no aprueba ninguna actividad.
- Ayudas en español, inglés y coreano; recarga conserva avance y ayuda por idioma, pero no selecciona respuestas. El repaso completado permite volver a practicar.
- Cerrar deja el panel oculto sin ejercicios; reabrir funciona. Espacio activa las respuestas nativas de gramática. Abrir enfoca la explicación y elegir una lección enfoca su título, incluso si ya era la actual.
- Escritura coreana: enlace a `ko-writing-01`, ficha idéntica en español y regreso a `?intro=use` en nueva pestaña. El borrador permanece intacto en la actividad original. Al pasar a las preguntas, la ficha desaparece. No se finalizó ni envió un resultado, ni se solicitó micrófono.
- Móvil 320 px (ayudas española, inglesa y coreana), tableta 768 px y escritorio 1280 px, temas claro y oscuro: sin desbordamiento horizontal en las vistas revisadas. Consolas de ambas pestañas sin errores ni advertencias.

Límites: almacenamiento denegado/cuota agotada y reintentos se verificaron automáticamente; no se cambió la configuración de privacidad del navegador. La revisión de teclado y estructura semántica no sustituye una auditoría con lector de pantalla ni una certificación pedagógica completa.
