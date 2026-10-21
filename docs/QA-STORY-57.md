# Historia 57 · Retomar inglés B1 y coreano TOPIK I

Revisión: 20 de octubre de 2026. Implementación en `story57-learning-restart`, a partir del QA sincronizado `65e82f5`. Este informe documenta la validación local previa a su publicación.

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
