# Historia 60 · Tablero de tareas y objetivos

Implementación y revisión: **1 de noviembre de 2026**, hora de Bogotá. Rama de trabajo `learning-task-board`, a partir de `cb59a2d`. Entrega autorizada para integrar en `main` y publicar en GitHub Pages. El historial de Git y la ejecución de despliegue registran la revisión publicada.

## Experiencia entregada

- Primer acceso flotante global: **tablero → estadísticas → biblioteca → entrevista**. En pantallas horizontales de poca altura los accesos forman una fila y el tablero queda primero a la izquierda; se conserva la separación respecto a la navegación.
- Panel propio con tres columnas: **Por hacer, En marcha y Hecho**. No se requieren conocimientos de gestión de proyectos.
- Crear una nota exige solo una acción breve y un tema, inicialmente Coreano. Temas: Inglés, Coreano, Beca GKS y Cultura/experiencias. La fecha se muestra únicamente si el usuario activa su opción. No hay descripciones largas, prioridades numéricas, archivos adjuntos ni pasos obligatorios adicionales.
- Cuatro ideas de inicio se añaden solo al pulsarlas. El tablero comienza vacío en un navegador nuevo; las cuatro notas de la vista local de revisión son ejemplos creados durante QA.
- Notas SVG originales con papel, pliegue, cinta y tulipán. El contenido del usuario se presenta como texto seleccionable y accesible sobre la ilustración, como las portadas de la biblioteca. React lo escapa: no se introduce contenido del usuario como HTML/SVG ejecutable.
- Edición, fecha opcional, avance con botones, selector de las tres columnas y arrastre entre columnas mediante el tirador en ordenador. Las acciones con botón/selector funcionan sin arrastrar en móvil y teclado.
- Borrado con **Deshacer** para la última nota eliminada, sin caducidad automática del aviso. Al recuperar se conservan tema, contenido, fecha, estado y posición relativa.
- Búsqueda de notas y filtro por tema. En vertical, una búsqueda puede seleccionar la columna donde está el resultado para evitar una lista aparentemente vacía.

## Sugerencias útiles y explicables

El sistema usa reglas locales, muestra como máximo tres sugerencias y explica qué dato las motiva. No analiza datos externos ni cambia notas automáticamente.

| Organización observada | Recomendación / acción disponible |
| --- | --- |
| Tablero vacío | Empezar con un paso pequeño o una idea de inicio. |
| Notas abiertas con fecha anterior al día local | Revisar una nota y decidir si completarla, ajustar fecha o simplificarla. |
| Más de tres notas en marcha | Reducir frentes abiertos; acceso a la columna En marcha. |
| Sin notas en marcha pero con pendientes | Proponer una siguiente nota según fecha y, después, antigüedad; Empezar exige un clic explícito. |
| Nota abierta sin cambios durante al menos siete días | Revisar su utilidad o convertirla en un paso menor. |
| Experiencias culturales pendientes sin práctica de idioma abierta | Ofrecer una práctica breve de coreano para conectar experiencia e idioma. |
| Todo hecho | Reflexionar sobre el siguiente ciclo y crear un paso nuevo cuando proceda. |
| Plan manejable sin los casos anteriores | Mantener el enfoque actual. |

Las sugerencias usan el tablero completo incluso cuando hay filtros visibles. Hecho es una marca del usuario; no aprueba actividades, acredita idiomas ni cambia la elegibilidad GKS.

## Datos, borradores y copias

- Almacenamiento local en `learnv-task-board-v1`; QA usa `qa:learnv-task-board-v1`. La copia anterior usa el mismo espacio con sufijo `:before-restore`.
- Hasta **120 notas**, títulos de **100 caracteres** como máximo, texto Unicode, tres estados y cuatro temas. Fechas ISO reales, incluidos años bisiestos. No se truncan silenciosamente archivos incompatibles.
- Se guardan solo título, tema, estado, fecha opcional, identificador y marcas de creación/modificación, además de versión/revisión del tablero. No se solicitan datos personales ni se envían notas a servicios externos.
- El borrador del editor permanece al cerrar y volver a abrir el panel, y el panel se conserva entre rutas de la app. El borrador todavía no creado/guardado no sobrevive a recargar o cerrar la página; el editor lo explica.
- El diálogo bloquea el fondo, limita Tab/Shift+Tab a sus controles, permite Escape y restaura foco y desplazamiento al cerrar. La capa cerrada queda oculta para interacción y accesibilidad.
- Las revisiones evitan sobrescribir cambios de otra pestaña. Una nota editada desde una versión antigua conserva el borrador y muestra una explicación, en vez de reemplazar silenciosamente el texto nuevo.
- Si falla el guardado, los cambios siguen en memoria con un aviso y pueden descargarse como copia. Si no se puede leer la copia guardada, no se hace una escritura a ciegas. Los datos dañados/incompatibles se conservan y pueden descargarse.
- **Copias y ayuda** permite guardar un archivo, seleccionar una copia, revisar su cantidad de notas y confirmar el reemplazo. Antes de reemplazar se conserva la versión previa cuando el almacenamiento lo permite. Una copia inválida o un fallo al guardar la copia previa no reemplazan el tablero original.

## Responsive y estética

En vertical estrecho se usa una columna con selector Por hacer / En marcha / Hecho. En horizontal se muestran las tres columnas con desplazamiento independiente y cabeceras estables. El editor tiene su propio desplazamiento; guardar/cancelar y el cierre no dependen de que quepa todo el formulario a la vez.

Se comprobaron **320×640**, **390×844**, **568×320**, **844×390** y escritorio. No se observó desbordamiento horizontal. A 320 px, Nueva nota ocupa su propia fila para conservar una etiqueta y área de toque claras. Las comprobaciones son de viewport en navegador, no de todos los modelos físicos de teléfono o teclados virtuales.

Se mantienen tipografías y paleta de la app, notas pastel con tinta oscura y contraste del panel en claro/oscuro. Los botones, estados y ayudas están en español, inglés y coreano. El texto creado por el usuario permanece en su idioma original al cambiar la interfaz.

## Verificación

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, TypeScript, **722 pruebas en 63 archivos**, compilación, fallback SPA y presupuesto de inicio correctos. Incluye **47 pruebas nuevas**: modelo, sugerencias, datos inválidos, concurrencia, fallos de lectura/escritura, recuperación, HTML seguro, idiomas y formulario de fecha.
- Se reprodujo en navegador un valor nativo de fecha que aún no había actualizado el estado React. El guardado ahora lee el valor del formulario al enviar; una prueba específica cubre ese caso, quitar la fecha y dejarla vacía.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto. No añade rutas ni amplía las restricciones de QA.
- Navegador: idea de inicio, creación, acción vacía rechazada, borrador al cerrar/volver, edición, fecha pasada, sugerencia correspondiente, selector, Empezar, Completar, borrar/deshacer y persistencia tras recargar comprobados.
- Arrastre real de una nota desde el tirador a otra columna comprobado; su selector y aviso confirmaron el estado nuevo.
- Dos pestañas: editar en una mientras otra conserva un borrador evita la sobrescritura y conserva el borrador antiguo hasta que el usuario lo descarte o copie.
- Descarga real de una copia; archivo incompatible rechazado manteniendo cuatro notas; copia vacía revisada sin cambios antes de confirmar; reemplazo confirmado y recuperación de las cuatro notas desde la copia anterior comprobados.
- Búsqueda coreana `목표`: encontró la nota hecha y seleccionó Hecho en vertical. Los títulos originales se conservaron al cambiar ES → KO → EN.
- Tab/Shift+Tab, Escape, fondo inerte, retorno del foco, primer acceso flotante y panel de estadísticas desplazable comprobados. Mapa de ayuda actualizado y validado en las páginas existentes.
- `git diff --check`: correcto.

## Rendimiento y alcance

Sin dependencias nuevas ni solicitudes a terceros. Solo el botón, su icono y la carcasa entran en el arranque. Datos, sugerencias, copias y CSS del tablero se importan al abrirlo. El reloj se actualiza por minuto solo mientras está abierto; la vista oculta está memoizada para evitar trabajo con cada actualización de la app.

- Inicio de producción: **437 811 bytes / 143 583 gzip**, dentro de los límites 450 000 / 150 000. El incremento frente a la validación de la historia 59 es de aproximadamente **4 kB sin comprimir / 0,9 kB gzip**.
- Inicio QA: **437 769 bytes / 143 703 gzip**.
- Módulo diferido del tablero: aproximadamente **13,26 kB gzip de JavaScript**, más su CSS diferido.

No se midió una latencia comparativa de navegación. Las notas no tienen sincronización automática entre dispositivos: para trasladarlas se usa una copia. La copia previa es una recuperación del último reemplazo, no un historial ilimitado.

Evidencia visual en el directorio de artefactos del chat: `story60-board-desktop-light.png`, `story60-board-landscape-dark.png` y `story60-board-mobile-light.png`. Vista local de revisión: `http://127.0.0.1:5216/LearnV/`, primer botón flotante.
