# Auditoría del botón de ayuda por pantalla

Fecha: 27 de octubre de 2026. Rama: `help-page-audit`.

## Resultado

El botón `?` ofrece ahora una explicación de la pantalla y del estado actual de la práctica. El resumen y el recorrido resaltado comparten el mismo catálogo para evitar instrucciones distintas. Se conservaron los cambios locales de ayuda que ya existían al empezar esta revisión y se completó su validación.

La cobertura principal comprende once pantallas y las sesiones de pruebas de ambos idiomas. En la revisión de navegador no se encontraron destinos ausentes en esas once pantallas. La ayuda está disponible en español, inglés y coreano.

## Mapa de contenido

Las rutas siguientes son relativas a `/LearnV/`; en QA se usa `/LearnV/qa/`.

| Pantalla | Qué explica la ayuda | Comprobación |
| --- | --- | --- |
| `/` | Inicio, primera tarea pendiente o plan terminado, libros de idiomas, avance, radar, navegación y accesos flotantes | Navegador y pruebas en tres idiomas |
| `/study` | Ruta inicial, espacios separados, resumen flotante, análisis bajo demanda y laboratorios | Navegador y pruebas en tres idiomas |
| `/study/english` | Resumen, navegación, introducción B1, ruta y biblioteca; incluye requisitos del reto avanzado | Navegador; introducción abierta comprobada; reto avanzado automatizado |
| `/study/korean` | Resumen, navegación, introducción TOPIK I, ruta y biblioteca; diferencia dificultad interna de grado TOPIK | Navegador y pruebas, incluida fase avanzada |
| `/tests/en` | Objetivo, seis habilidades, desbloqueos, repetición y requisitos de la fase | Navegador y pruebas de ambas fases |
| `/tests/ko` | Objetivo, seis habilidades, desbloqueos, repetición y requisitos de la fase | Navegador y pruebas de ambas fases |
| `/tests/:idioma/:actividad` | Producción según habilidad, comprobaciones, preguntas con feedback, cronómetro de reintento y resultado | Flujo completo inglés en navegador; seis habilidades de ambos idiomas automatizadas |
| `/study/interviews` | Preparación, puente entre materiales y chat, fichas 2027, estructura, doce preguntas con notas, apoyo de 75 s y vídeo | Navegador; temporizador activo comprobado |
| `/study/written-simulator` | Fuentes y alcance, idioma, apoyo de 45 min, cinco decisiones, Personal Statement, Study Plan, revisión y resultado | Introducción, decisiones y Personal Statement en navegador; seis estados automatizados |
| `/gks` | Radar, elegibilidad, documentos, detalles, certificaciones y orientación progresiva | Navegador y pruebas en tres idiomas |
| `/checklist` | Seguimiento local sin subir archivos, contador, orden y etapas desplegables | Navegador y pruebas en tres idiomas |
| `/profile` | Datos base predefinidos, preparación, niveles estimados, resumen completo y ciclo objetivo | Navegador y pruebas en tres idiomas |

El acceso flotante de aprendizaje se explica en todas las pantallas. El chat se explica únicamente donde está visible; se omite en las rutas inmersivas de idiomas y pruebas. El resumen completo del perfil se conserva.

## Ajustes y reparaciones

- El resumen general de áreas deja paso a instrucciones de la pantalla actual. Las demás áreas quedan en un desplegable.
- La introducción explica sus tres herramientas, el progreso propio `0/3` y el enlace a una actividad real; no lo confunde con aprobar pruebas.
- La fase inicial describe 132 actividades, 22 por habilidad y aprobación del 70 % con producción verificada. El reto avanzado describe 18 actividades, tres por habilidad y 80 % con producción verificada.
- Las sesiones cambian de instrucciones al pasar de producción a preguntas y resultado. Se distingue escribir, escuchar y grabar; practicar sin evidencia suficiente no se presenta como desbloqueo.
- La ayuda distingue los borradores de práctica que se pierden al salir, las notas de entrevista guardadas por pregunta y el trabajo del simulador escrito guardado localmente.
- Se advierte cuando el tiempo sigue corriendo al consultar ayuda. Se añadió la señal que faltaba en el temporizador opcional de entrevistas. Los recorridos automáticos no se abren durante una práctica cronometrada activa.
- El recorrido se puede repetir desde `?`, incluso si todavía no se había cargado. Se descartan destinos ocultos y se reconocen los accesos flotantes por su contenedor fijo.
- Se conservan el desplazamiento y el foco al cerrar; el fondo queda inerte durante la ayuda. Se recuperan preferencias de recorridos dañadas y un fallo al cargar la ayuda detallada queda contenido en su ventana.
- Se corrigió el contraste de la cruz de cierre sobre amarillo en modo oscuro.
- QA solo ofrece Inicio y Estudiar en el desplegable general y omite el radar de becas del recorrido de inicio.

## Evidencia de verificación

### Automatizada

- `pnpm run validate`: arquitectura, 635 pruebas en 55 archivos, TypeScript, compilación y presupuesto de carga aprobados.
- `src/app/page-help.test.tsx`: 77 casos que cubren las páginas en ES/EN/KO, las seis habilidades de ambos idiomas, las seis etapas escritas, la fase avanzada, estados de sesión, restricciones de QA y recuperación de recorridos.
- `pnpm run build:qa`: compilación y presupuesto aprobados. Carga inicial QA: 425351 B / 140265 B gzip, bajo el límite de 450000 B / 150000 B. Los bancos de preguntas siguen en carga diferida.
- `git diff --check`: sin errores de espacios.

### Navegador local

- Once pantallas principales: explicación específica, diálogo modal y destinos reales presentes.
- Recorrido completo de inicio: ocho pasos, finalización, liberación del fondo y devolución del foco al botón `?`.
- Introducción inglesa desplegada: aparecen instrucciones adicionales del selector de ayudas y del ejercicio.
- Actividad inglesa: borrador de prueba, abrir/cerrar ayuda, completar comprobaciones, cuatro preguntas, resultado y reintento cronometrado. El botón de continuación siguió disponible tras consultar ayuda y la guía cambió con cada estado.
- Temporizadores de reintento, entrevista y simulador escrito: advertencia visible de que el tiempo no se pausa.
- Simulador escrito: cinco decisiones y paso a Personal Statement; la ayuda refleja la etapa nueva.
- Vista de 320 × 640 en claro y oscuro: sin desbordamiento horizontal, contenido desplazable, cierre mediante Escape y foco restituido. Capturas guardadas como evidencia local.
- Build QA servido localmente: ayuda de inicio sin radar; desplegable general únicamente con enlaces a Inicio y Estudiar bajo `/LearnV/qa/`.
- Consola de la sesión de comprobación: sin errores registrados.

## Alcance y estado de entrega

Se probaron manualmente los flujos indicados, no cada pregunta del catálogo ni todas las combinaciones de dispositivo e idioma. El resto de estados descritos está cubierto por pruebas de contenido y renderizado. No se solicitaron permisos de micrófono ni se validó reconocimiento de voz real en esta auditoría. Tampoco se hizo una auditoría externa de requisitos GKS; la ayuda describe el contenido y el alcance existentes.

La entrega se prepara en `help-page-audit` para su integración en `main` y publicación mediante el flujo de GitHub Pages. La comprobación de QA corresponde al build local; la rama pública `qa` se publica de manera independiente. El resultado del despliegue de producción se verifica en GitHub Actions y mediante la revisión servida en la URL pública.
